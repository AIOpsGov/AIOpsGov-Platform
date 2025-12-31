const { app } = require('@azure/functions');
const { getConfigFromFunctionName, queryAppInsights } = require('../utils/appInsightsConfig');
const { setCachedData, generateCacheKey } = require('../utils/redisCache');

/**
 * BW_Intent_CacheWarmer
 * 
 * Timer-triggered function that proactively refreshes the cache every 90 seconds
 * This ensures the cache never expires when users are actively using the dashboard
 * 
 * Schedule: Every 90 seconds (cache TTL is 120 seconds, so this refreshes before expiry)
 */
app.timer('BW_Intent_CacheWarmer', {
    schedule: '*/90 * * * * *', // Every 90 seconds
    handler: async (myTimer, context) => {
        context.log('[Cache Warmer] Starting proactive cache refresh');
        
        try {
            const config = getConfigFromFunctionName('BW_Intent_GetIntentResults');
            
            // Refresh cache for common time ranges
            const timeRanges = ['7d', '30d']; // Add more if needed
            
            for (const timeRange of timeRanges) {
                try {
                    context.log(`[Cache Warmer] Refreshing cache for timeRange: ${timeRange}`);
                    
                    const cacheKey = generateCacheKey(config.dashboardIdentifier, 'intent-results', { timeRange });
                    
                    const query = `
                        customEvents
                        | where name == "AI_Intent_Detection_Log"
                        | where timestamp > ago(${timeRange})
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
                    
                    const data = await queryAppInsights(config, query);
                    await setCachedData(cacheKey, data, 86400, context); // 24 hour TTL as safety net
                    
                    context.log(`[Cache Warmer] Successfully refreshed cache for ${timeRange}`);
                } catch (error) {
                    context.error(`[Cache Warmer] Failed to refresh cache for ${timeRange}:`, error.message);
                    // Continue to next time range even if one fails
                }
            }
            
            context.log('[Cache Warmer] Completed proactive cache refresh');
        } catch (error) {
            context.error('[Cache Warmer] Error in cache warmer:', error.message);
        }
    }
});
