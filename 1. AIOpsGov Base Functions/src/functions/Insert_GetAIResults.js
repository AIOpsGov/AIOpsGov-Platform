const { app } = require('@azure/functions');
const { getConfigFromFunctionName, queryAppInsights } = require('../utils/appInsightsConfig');
const { getCachedData, setCachedData, generateCacheKey } = require('../utils/redisCache');

app.http('BW_Intent_GetIntentResults', {
    methods: ['POST', 'OPTIONS'],
    authLevel: 'anonymous',
    route: 'bw-intent/get-intent-results',
    handler: async (request, context) => {
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        };

        if (request.method === 'OPTIONS') {
            return { status: 200, headers: corsHeaders };
        }

        try {
            // Get App Insights config dynamically
            const config = getConfigFromFunctionName('BW_Intent_GetIntentResults');
            context.log(`Getting intent results for dashboard: ${config.dashboardIdentifier}`);

            const body = await request.json();
            const { timeRange } = body;

            // Check cache first
            const cacheKey = generateCacheKey(config.dashboardIdentifier, 'intent-results', { timeRange: timeRange || '7d' });
            const cachedData = await getCachedData(cacheKey, context);
            
            if (cachedData) {
                context.log('[Cache] Returning cached intent results');
                
                // Stale-While-Revalidate: Check if cache is about to expire
                const ttl = await getCacheTTL(cacheKey, context);
                context.log(`[Cache] TTL remaining: ${ttl} seconds`);
                
                // With cache warmer running every 90s, we don't need aggressive refresh
                // Just log the TTL for monitoring
                if (ttl > 0 && ttl < 3600) { // Less than 1 hour (warning threshold)
                    context.log(`[Cache] TTL is ${ttl}s - cache warmer should refresh before expiry`);
                }
                
                return {
                    status: 200,
                    headers: { ...corsHeaders, 'X-Cache': 'HIT' },
                    jsonBody: {
                        ...cachedData,
                        dashboard: config.dashboardIdentifier,
                        cached: true,
                        cacheStatus: 'fresh', // Cache warmer keeps it always fresh
                        ttlRemaining: ttl,
                        refreshedBy: 'cache-warmer'
                    }
                };
            }

            context.log('[Cache] Cache miss or expired - querying App Insights');
            
            //  Performance timing
            const timings = {
                start: Date.now(),
                queryStart: 0,
                queryEnd: 0,
                cacheStart: 0,
                cacheEnd: 0
            };
            
            // Build KQL query to get intent detection results from new AI_Intent_Detection_Log event
            const query = `
                customEvents
                | where name == "AI_Intent_Detection_Log"
                | where timestamp > ago(${timeRange || '7d'})
                | extend agentName = tostring(customDimensions.agentName)
                | extend category = tostring(customDimensions.aiDeterminedCategory)
                | extend confidenceScore = todouble(customDimensions.classificationConfidence)
                | extend sentiment = tostring(customDimensions.sentimentLabel)
                | extend sentimentScore = todouble(customDimensions.sentimentScore)
                | extend caseId = tostring(customDimensions.caseId)
                | extend caseNumber = tostring(customDimensions.caseNumber)
                | extend emailId = tostring(customDimensions.emailId)
                | extend emailSubject = tostring(customDimensions.emailSubject)
                | extend flowName = tostring(customDimensions.flowName)
                | extend aiPredictionOutput = tostring(customDimensions.aiPredictionOutput)
                | extend aiPrediction = parse_json(aiPredictionOutput)
                | extend comments = tostring(aiPrediction.Comments)
                | extend rawOutput = aiPredictionOutput
                | where isnotempty(caseId) or isnotempty(category)
                | project
                    timestamp,
                    agentName,
                    category,
                    confidenceScore,
                    sentiment,
                    sentimentScore,
                    comments,
                    rawOutput,
                    caseId,
                    caseNumber,
                    emailId,
                    emailSubject,
                    flowName
                | order by timestamp desc
            `;

            context.log('=== BW_Intent_GetIntentResults ===');
            context.log('Event Name: AI_Intent_Detection_Log (NEW)');
            context.log('Time Range:', timeRange || '7d');
            context.log('Intent Results KQL Query:', query);

            // Use the queryAppInsights helper with timing
            timings.queryStart = Date.now();
            const data = await queryAppInsights(config, query);
            timings.queryEnd = Date.now();
            
            const queryDuration = timings.queryEnd - timings.queryStart;
            const rowCount = data?.tables?.[0]?.rows?.length || 0;
            
            context.log(`[Performance] App Insights query: ${queryDuration}ms for ${rowCount} rows`);

            // Cache the results for 24 hours (86400 seconds) as a safety net
            // The cache warmer refreshes every 90 seconds, so users will always get fresh data
            // The 24h TTL is just to prevent stale data if the cache warmer fails
            timings.cacheStart = Date.now();
            await setCachedData(cacheKey, data, 86400, context);
            timings.cacheEnd = Date.now();
            
            const cacheDuration = timings.cacheEnd - timings.cacheStart;
            const totalDuration = timings.cacheEnd - timings.start;
            
            context.log(`[Performance] Cache write: ${cacheDuration}ms`);
            context.log(`[Performance] Total operation: ${totalDuration}ms`);

            return {
                status: 200,
                headers: { ...corsHeaders, 'X-Cache': 'MISS' },
                jsonBody: {
                    ...data,
                    dashboard: config.dashboardIdentifier,
                    cacheStatus: 'fresh-from-query'
                }
            };
        } catch (error) {
            context.error('Error getting intent results:', error.message);
            return {
                status: 500,
                headers: corsHeaders,
                jsonBody: {
                    error: 'Failed to get intent results',
                    message: error.message
                }
            };
        }
    }
});

/**
 * Get remaining TTL of a cache key (in seconds)
 * Returns -1 if key doesn't exist, 0 if exists but no expiry
 */
async function getCacheTTL(cacheKey, context) {
    try {
        // This assumes your redisCache.js exports a getTTL function
        // If not, you'll need to implement it in redisCache.js
        const { getTTL } = require('../utils/redisCache');
        return await getTTL(cacheKey, context);
    } catch (error) {
        context.log('Could not get TTL:', error.message);
        return 0; // Conservative: assume no expiry
    }
}

/**
 * Refresh cache in the background without blocking the user's response
 * This is the key to avoiding the TTL latency tax
 */
async function refreshCacheInBackground(cacheKey, config, timeRange, context) {
    try {
        context.log('[Background Refresh] Starting async refresh for', cacheKey);
        const startTime = Date.now();
        
        const query = `
            customEvents
            | where name == "AI_Intent_Detection_Log"
            | where timestamp > ago(${timeRange || '7d'})
            | extend agentName = tostring(customDimensions.agentName)
            | extend category = tostring(customDimensions.aiDeterminedCategory)
            | extend confidenceScore = todouble(customDimensions.classificationConfidence)
            | extend sentiment = tostring(customDimensions.sentimentLabel)
            | extend sentimentScore = todouble(customDimensions.sentimentScore)
            | extend caseId = tostring(customDimensions.caseId)
            | extend caseNumber = tostring(customDimensions.caseNumber)
            | extend emailId = tostring(customDimensions.emailId)
            | extend emailSubject = tostring(customDimensions.emailSubject)
            | extend flowName = tostring(customDimensions.flowName)
            | extend aiPredictionOutput = tostring(customDimensions.aiPredictionOutput)
            | extend aiPrediction = parse_json(aiPredictionOutput)
            | extend comments = tostring(aiPrediction.Comments)
            | extend rawOutput = aiPredictionOutput
            | where isnotempty(caseId) or isnotempty(category)
            | project
                timestamp,
                agentName,
                category,
                confidenceScore,
                sentiment,
                sentimentScore,
                comments,
                rawOutput,
                caseId,
                caseNumber,
                emailId,
                emailSubject,
                flowName
            | order by timestamp desc
        `;
        
        const freshData = await queryAppInsights(config, query);
        await setCachedData(cacheKey, freshData, 86400, context); // 24 hour TTL as safety net
        
        const duration = Date.now() - startTime;
        context.log(`[Background Refresh] Successfully updated cache for ${cacheKey} in ${duration}ms`);
    } catch (error) {
        // IMPORTANT: Don't throw - user already got old data, this is just maintenance
        context.error('[Background Refresh] Failed to refresh cache:', error.message);
        context.warn('User was served stale data but refresh failed - will retry next time');
    }
}