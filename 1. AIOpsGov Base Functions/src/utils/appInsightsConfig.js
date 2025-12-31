/**
 * Application Insights Configuration Utility
 * 
 * This module provides dynamic App Insights key selection based on dashboard identifiers.
 * 
 * ENVIRONMENT VARIABLE NAMING PATTERN:
 * ------------------------------------
 * For each dashboard, you need THREE environment variables:
 * 
 * 1. APPINSIGHTS_APPID_{DASHBOARD_IDENTIFIER}     - Application Insights Application ID
 * 2. APPINSIGHTS_APIKEY_{DASHBOARD_IDENTIFIER}    - Application Insights API Key
 * 3. APPINSIGHTS_INSTKEY_{DASHBOARD_IDENTIFIER}   - Application Insights Instrumentation Key (for ingestion)
 * 
 * Example for Product Advisor dashboard:
 *   APPINSIGHTS_APPID_PRODUCT_ADVISOR=12345678-1234-1234-1234-123456789abc
 *   APPINSIGHTS_APIKEY_PRODUCT_ADVISOR=abc123def456...
 *   APPINSIGHTS_INSTKEY_PRODUCT_ADVISOR=xyz789abc123...
 * 
 * Example for Dynamics365 Intent dashboard:
 *   APPINSIGHTS_APPID_DYNAMICS365_INTENT=87654321-4321-4321-4321-cba987654321
 *   APPINSIGHTS_APIKEY_DYNAMICS365_INTENT=def789ghi012...
 *   APPINSIGHTS_INSTKEY_DYNAMICS365_INTENT=mno345pqr678...
 * 
 * ADDING A NEW DASHBOARD:
 * -----------------------
 * 1. Add the three environment variables with your dashboard identifier
 * 2. Create new functions with the naming pattern: {DashboardName}_{FunctionName}
 * 3. The utility will automatically use the correct App Insights instance
 * 
 * FUNCTION NAMING PATTERN:
 * ------------------------
 * Functions must follow the pattern: {DashboardIdentifier}_{FunctionName}
 * 
 * Examples:
 *   - ProductAdvisor_GetConversationTranscript
 *   - ProductAdvisor_QueryInsights
 *   - Dynamics365Intent_GetIntentEvaluations
 *   - SalesAgent_GetConversations
 * 
 * The dashboard identifier portion before the underscore will be converted to 
 * SCREAMING_SNAKE_CASE to match the environment variable naming.
 * 
 * Example: "ProductAdvisor" becomes "PRODUCT_ADVISOR"
 *          "Dynamics365Intent" becomes "DYNAMICS365_INTENT"
 */

/**
 * Supported dashboard identifiers
 * Add new dashboard types here as they are created
 */
const DASHBOARD_IDENTIFIERS = {
    PRODUCT_ADVISOR: 'PRODUCT_ADVISOR',
    DYNAMICS365_INTENT: 'DYNAMICS365_INTENT',
    BW_INTENT: 'BW_INTENT',
    // Add more dashboards here as needed
    // SALES_AGENT: 'SALES_AGENT',
    // TECHNICAL_SUPPORT: 'TECHNICAL_SUPPORT',
};

/**
 * Convert PascalCase/camelCase dashboard identifier to SCREAMING_SNAKE_CASE
 * 
 * Examples:
 *   ProductAdvisor -> PRODUCT_ADVISOR
 *   Dynamics365Intent -> DYNAMICS365_INTENT
 *   salesAgent -> SALES_AGENT
 * 
 * @param {string} identifier - Dashboard identifier in PascalCase or camelCase
 * @returns {string} Dashboard identifier in SCREAMING_SNAKE_CASE
 */
function toScreamingSnakeCase(identifier) {
    return identifier
        // Insert underscore before capital letters (except first character)
        .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
        // Convert to uppercase
        .toUpperCase();
}

/**
 * Extract dashboard identifier from function name
 * Function names must follow pattern: {DashboardIdentifier}_{FunctionName}
 * 
 * @param {string} functionName - Full function name (e.g., "ProductAdvisor_GetConversationTranscript", "BW_Intent_GetFlowMetrics")
 * @returns {string|null} Dashboard identifier in SCREAMING_SNAKE_CASE or null if invalid format
 */
function extractDashboardIdentifier(functionName) {
    const parts = functionName.split('_');
    
    if (parts.length < 2) {
        return null;
    }
    
    // For function names like "BW_Intent_GetFlowMetrics", we need to extract "BW_INTENT"
    // We check against known dashboard identifiers to find the longest match
    const knownIdentifiers = Object.values(DASHBOARD_IDENTIFIERS);
    
    // Try matching from longest to shortest possible dashboard identifier
    for (let i = parts.length - 1; i >= 1; i--) {
        const possibleIdentifier = parts.slice(0, i).join('_').toUpperCase();
        if (knownIdentifiers.includes(possibleIdentifier)) {
            return possibleIdentifier;
        }
    }
    
    // Fallback: if no match found, assume first two parts if available, otherwise first part
    if (parts.length >= 2 && parts[0].toUpperCase() === 'BW') {
        return `${parts[0]}_${parts[1]}`.toUpperCase();
    }
    
    // Default: just use the first part
    const dashboardIdentifier = parts[0];
    return toScreamingSnakeCase(dashboardIdentifier);
}

/**
 * Get App Insights configuration for a specific dashboard
 * 
 * @param {string} dashboardIdentifier - Dashboard identifier in SCREAMING_SNAKE_CASE
 * @returns {Object} Configuration object with appId, apiKey, and instrumentationKey
 * @throws {Error} If required environment variables are not configured
 */
function getAppInsightsConfig(dashboardIdentifier) {
    const appIdKey = `APPINSIGHTS_APPID_${dashboardIdentifier}`;
    const apiKeyKey = `APPINSIGHTS_APIKEY_${dashboardIdentifier}`;
    const instKeyKey = `APPINSIGHTS_INSTKEY_${dashboardIdentifier}`;
    
    const appId = process.env[appIdKey];
    const apiKey = process.env[apiKeyKey];
    const instrumentationKey = process.env[instKeyKey];
    
    const missingVars = [];
    if (!appId) missingVars.push(appIdKey);
    if (!apiKey) missingVars.push(apiKeyKey);
    if (!instrumentationKey) missingVars.push(instKeyKey);
    
    if (missingVars.length > 0) {
        throw new Error(
            `Missing required environment variables for dashboard '${dashboardIdentifier}': ${missingVars.join(', ')}\n` +
            `Please configure these in your Function App settings.`
        );
    }
    
    return {
        appId,
        apiKey,
        instrumentationKey,
        dashboardIdentifier
    };
}

/**
 * Get App Insights configuration from function name
 * This is the main function to use in your Azure Functions
 * 
 * @param {string} functionName - Function name (e.g., "ProductAdvisor_GetConversationTranscript")
 * @returns {Object} Configuration object with appId, apiKey, instrumentationKey, and dashboardIdentifier
 * @throws {Error} If function name format is invalid or environment variables are not configured
 * 
 * @example
 * const config = getConfigFromFunctionName('ProductAdvisor_GetConversationTranscript');
 * // Returns: {
 * //   appId: '12345...',
 * //   apiKey: 'abc123...',
 * //   instrumentationKey: 'xyz789...',
 * //   dashboardIdentifier: 'PRODUCT_ADVISOR'
 * // }
 */
function getConfigFromFunctionName(functionName) {
    const dashboardIdentifier = extractDashboardIdentifier(functionName);
    
    if (!dashboardIdentifier) {
        throw new Error(
            `Invalid function name format: '${functionName}'\n` +
            `Function names must follow the pattern: {DashboardIdentifier}_{FunctionName}\n` +
            `Example: ProductAdvisor_GetConversationTranscript`
        );
    }
    
    return getAppInsightsConfig(dashboardIdentifier);
}

/**
 * Get or create Redis client
 * Redis is used for caching App Insights query results to improve performance
 */
let redisClient = null;

async function getRedisClient() {
    if (redisClient) {
        return redisClient;
    }
    
    const redisConnectionString = process.env.REDIS_CONNECTION_STRING;
    
    if (!redisConnectionString) {
        console.warn('REDIS_CONNECTION_STRING not configured. Caching disabled.');
        return null;
    }
    
    try {
        const redis = require('redis');
        redisClient = redis.createClient({
            url: redisConnectionString,
            socket: {
                reconnectStrategy: (retries) => {
                    if (retries > 3) {
                        console.error('Max Redis reconnection attempts reached');
                        return new Error('Max reconnection attempts reached');
                    }
                    return Math.min(retries * 100, 3000);
                }
            }
        });
        
        redisClient.on('error', (err) => {
            console.error('Redis Client Error:', err);
        });
        
        await redisClient.connect();
        console.log('Redis client connected successfully');
        
        return redisClient;
    } catch (error) {
        console.error('Failed to connect to Redis:', error.message);
        redisClient = null;
        return null;
    }
}

/**
 * Generate cache key for a query
 */
function generateCacheKey(config, query, timespan) {
    const crypto = require('crypto');
    const queryHash = crypto.createHash('md5').update(query).digest('hex');
    return `appinsights:${config.dashboardIdentifier}:${queryHash}:${timespan || 'default'}`;
}

/**
 * Query Application Insights using the provided configuration
 * Results are cached in Redis for 2 minutes to improve performance
 * 
 * @param {Object} config - App Insights configuration from getConfigFromFunctionName
 * @param {string} query - KQL query string
 * @param {string} [timespan] - Optional timespan (e.g., 'P7D' for 7 days)
 * @param {number} [cacheTTL] - Cache TTL in seconds (default: 120 seconds / 2 minutes)
 * @returns {Promise<Object>} Query results from Application Insights
 */
async function queryAppInsights(config, query, timespan = null, cacheTTL = 120) {
    const cacheKey = generateCacheKey(config, query, timespan);
    
    console.time('[queryAppInsights] Total duration');
    console.time('[queryAppInsights] Redis check');
    
    try {
        // Try to get from cache first
        const redis = await getRedisClient();
        console.timeEnd('[queryAppInsights] Redis check');
        
        if (redis) {
            try {
                const cachedResult = await redis.get(cacheKey);
                if (cachedResult) {
                    console.log(`Cache HIT for key: ${cacheKey}`);
                    console.timeEnd('[queryAppInsights] Total duration');
                    return JSON.parse(cachedResult);
                }
                console.log(`Cache MISS for key: ${cacheKey}`);
            } catch (cacheError) {
                console.warn('Cache read error:', cacheError.message);
                // Continue to query App Insights
            }
        }
    } catch (redisError) {
        console.warn('Redis error, continuing without cache:', redisError.message);
        console.timeEnd('[queryAppInsights] Redis check');
    }
    
    // Query Application Insights
    console.time('[queryAppInsights] App Insights API call');
    const url = `https://api.applicationinsights.io/v1/apps/${config.appId}/query`;
    
    const options = {
        method: 'POST',
        headers: { 
            'x-api-key': config.apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            query: query,
            ...(timespan && { timespan })
        })
    };
    
    const response = await fetch(url, options);
    console.timeEnd('[queryAppInsights] App Insights API call');
    
    if (!response.ok) {
        const errorText = await response.text();
        console.timeEnd('[queryAppInsights] Total duration');
        throw new Error(`App Insights query failed (${response.status}): ${errorText}`);
    }
    
    console.time('[queryAppInsights] JSON parse');
    const result = await response.json();
    console.timeEnd('[queryAppInsights] JSON parse');
    
    // Try to cache the result
    console.time('[queryAppInsights] Redis cache write');
    try {
        const redis = await getRedisClient();
        
        if (redis) {
            try {
                await redis.setEx(cacheKey, cacheTTL, JSON.stringify(result));
                console.log(`Cached result for ${cacheTTL}s: ${cacheKey}`);
            } catch (cacheError) {
                console.warn('Cache write error:', cacheError.message);
            }
        }
    } catch (redisError) {
        console.warn('Redis error during cache write:', redisError.message);
    }
    console.timeEnd('[queryAppInsights] Redis cache write');
    
    console.timeEnd('[queryAppInsights] Total duration');
    return result;
}

/**
 * Send custom event to Application Insights ingestion endpoint
 * 
 * @param {Object} config - App Insights configuration from getConfigFromFunctionName
 * @param {string} eventName - Name of the custom event
 * @param {Object} properties - Event properties/custom dimensions
 * @param {Object} [tags] - Optional tags for the event
 * @returns {Promise<Object>} Response from Application Insights ingestion
 */
async function trackEvent(config, eventName, properties, tags = {}) {
    const telemetryData = {
        name: "Microsoft.ApplicationInsights.Event",
        time: new Date().toISOString(),
        iKey: config.instrumentationKey,
        tags: {
            "ai.cloud.role": "BlackwoodsAIHub",
            ...tags
        },
        data: {
            baseType: "EventData",
            baseData: {
                ver: 2,
                name: eventName,
                properties: {
                    ...properties,
                    eventTimestamp: new Date().toISOString()
                }
            }
        }
    };
    
    const response = await fetch('https://dc.services.visualstudio.com/v2/track', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(telemetryData)
    });
    
    return {
        success: response.ok,
        status: response.status,
        statusText: response.statusText
    };
}

module.exports = {
    DASHBOARD_IDENTIFIERS,
    getConfigFromFunctionName,
    getAppInsightsConfig,
    extractDashboardIdentifier,
    toScreamingSnakeCase,
    queryAppInsights,
    trackEvent
};
