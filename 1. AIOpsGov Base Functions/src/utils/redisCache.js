const redis = require('redis');

let redisClient = null;
let isConnecting = false;
let connectionInitialized = false;
let lastConnectionAttempt = 0;
const CONNECTION_RETRY_DELAY = 5000;

console.log('[Redis] Module loaded, Redis version:', require('redis/package.json').version);

/**
 * Convert Azure Redis connection string format to Node.js redis client format
 * CRITICAL FIX: Password may contain '=' character, must split properly
 */
function convertAzureConnectionString(connectionString) {
    if (connectionString.startsWith('redis://') || connectionString.startsWith('rediss://')) {
        return connectionString;
    }

    const parts = connectionString.split(',');
    const hostPort = parts[0];
    
    // CRITICAL: Password contains '=', use slice(1).join('=') not split('=')[1]
    const passwordPart = parts.find(p => p.trim().startsWith('password='));
    const password = passwordPart ? passwordPart.split('=').slice(1).join('=').trim() : '';
    
    const sslPart = parts.find(p => p.trim().startsWith('ssl='));
    const useSsl = sslPart ? sslPart.split('=')[1].trim().toLowerCase() === 'true' : true;
    
    const protocol = useSsl ? 'rediss' : 'redis';
    const url = `${protocol}://default:${password}@${hostPort}`;
    
    console.log('[Redis] Converted Azure format to URL format');
    console.log('[Redis] URL format (sanitized):', url.replace(/:[^@]+@/, ':***@'));
    
    return url;
}

/**
 * Initialize Redis client - called once at startup
 */
async function initializeRedisClient() {
    if (connectionInitialized) {
        return;
    }

    if (isConnecting) {
        console.log('[Redis] Connection already in progress');
        return;
    }

    isConnecting = true;

    try {
        const connectionString = process.env.REDIS_CONNECTION_STRING;

        if (!connectionString) {
            console.error('[Redis] FATAL: REDIS_CONNECTION_STRING environment variable not set');
            isConnecting = false;
            connectionInitialized = false;
            return;
        }

        console.log('[Redis] Starting Redis client initialization...');
        console.log('[Redis] Connection string format detected: Azure StackExchange.Redis');

        const redisUrl = convertAzureConnectionString(connectionString);

        const clientConfig = {
            url: redisUrl,
            socket: {
                connectTimeout: 3000, // Reduced from 15s to 3s - fail fast when Redis unavailable
                keepAlive: 60000,
                family: 4,
                reconnectStrategy: (retries) => {
                    if (retries > 2) { // Reduced from 3 to 2 attempts
                        console.error('[Redis] Max reconnection attempts reached');
                        return new Error('Max reconnection attempts reached');
                    }
                    const delay = Math.min(retries * 500, 1500); // Reduced delays: 500ms, 1000ms
                    console.log(`[Redis] Reconnect attempt ${retries}, waiting ${delay}ms`);
                    return delay;
                }
            }
        };

        console.log('[Redis] Creating Redis client...');
        redisClient = redis.createClient(clientConfig);

        // Attach error handler IMMEDIATELY
        redisClient.on('error', (err) => {
            console.error('[Redis] ERROR EVENT:', err.message);
            console.error('[Redis] Error code:', err.code);
            console.error('[Redis] Error:', err);
        });

        redisClient.on('connect', () => {
            console.log('[Redis] CONNECTED event fired');
        });

        redisClient.on('ready', () => {
            console.log('[Redis] READY event fired - client is operational');
        });

        redisClient.on('reconnecting', () => {
            console.log('[Redis] RECONNECTING event fired');
        });

        redisClient.on('end', () => {
            console.log('[Redis] END event fired - connection closed');
        });

        console.log('[Redis] Calling client.connect()...');
        await redisClient.connect();
        
        console.log('[Redis] client.connect() resolved successfully');
        console.log('[Redis] Redis client is READY and CONNECTED');
        
        connectionInitialized = true;
        isConnecting = false;
        return;

    } catch (error) {
        console.error('[Redis] FATAL CONNECTION ERROR');
        console.error('[Redis] Error name:', error.name);
        console.error('[Redis] Error message:', error.message);
        console.error('[Redis] Error code:', error.code);
        console.error('[Redis] Full error:', error);
        console.error('[Redis] Stack trace:');
        console.error(error.stack);
        
        redisClient = null;
        connectionInitialized = false;
        isConnecting = false;
    }
}

/**
 * Get Redis client - ensures connection exists
 */
async function getRedisClient() {
    // Try to initialize if not done yet
    if (!connectionInitialized && !isConnecting) {
        console.log('[Redis] Client not initialized, attempting initialization...');
        await initializeRedisClient();
    }

    // Wait for initialization if in progress (but not too long)
    if (isConnecting) {
        console.log('[Redis] Waiting for initialization to complete...');
        let attempts = 0;
        while (isConnecting && attempts < 15) { // Reduced from 30 to 15 (3 seconds max wait)
            await new Promise(resolve => setTimeout(resolve, 200));
            attempts++;
        }
        
        // If still connecting after timeout, assume failure and continue without cache
        if (isConnecting) {
            console.warn('[Redis] Initialization timeout - proceeding without cache');
            return null;
        }
    }

    if (redisClient && redisClient.isOpen) {
        console.log('[Redis] Returning existing connected client');
        return redisClient;
    }

    if (redisClient && !redisClient.isOpen) {
        console.log('[Redis] Client exists but is NOT open/connected');
        return null;
    }

    console.log('[Redis] Client is null - connection failed or not initialized');
    return null;
}

/**
 * Get cached data
 */
async function getCachedData(key, context) {
    try {
        const client = await getRedisClient();
        if (!client) {
            context.log('[Redis] Cache not available - skipping read');
            return null;
        }

        const data = await client.get(key);
        if (data) {
            context.log(`[Redis] Cache HIT for key: ${key}`);
            return JSON.parse(data);
        }

        context.log(`[Redis] Cache MISS for key: ${key}`);
        return null;
    } catch (error) {
        context.warn(`[Redis] Error getting cached data: ${error.message}`);
        return null;
    }
}

/**
 * Set cached data with TTL
 */
async function setCachedData(key, data, ttlSeconds, context) {
    try {
        const client = await getRedisClient();
        if (!client) {
            context.log('[Redis] Cache not available - skipping write');
            return false;
        }

        await client.setEx(key, ttlSeconds, JSON.stringify(data));
        context.log(`[Redis] Cached data for key: ${key} (TTL: ${ttlSeconds}s)`);
        return true;
    } catch (error) {
        context.warn(`[Redis] Error setting cached data: ${error.message}`);
        return false;
    }
}

/**
 * Delete cached data
 */
async function deleteCachedData(key, context) {
    try {
        const client = await getRedisClient();
        if (!client) {
            context.log('[Redis] Cache not available - skipping delete');
            return false;
        }

        await client.del(key);
        context.log(`[Redis] Deleted cache key: ${key}`);
        return true;
    } catch (error) {
        context.warn(`[Redis] Error deleting cached data: ${error.message}`);
        return false;
    }
}

/**
 * Delete cached data matching pattern
 */
async function deleteCachedPattern(pattern, context) {
    try {
        const client = await getRedisClient();
        if (!client) {
            context.log('[Redis] Cache not available - skipping pattern delete');
            return false;
        }

        const keys = [];
        for await (const key of client.scanIterator({ MATCH: pattern, COUNT: 100 })) {
            keys.push(key);
        }

        if (keys.length > 0) {
            await client.del(keys);
            context.log(`[Redis] Deleted ${keys.length} keys matching pattern: ${pattern}`);
        }

        return true;
    } catch (error) {
        context.warn(`[Redis] Error deleting pattern: ${error.message}`);
        return false;
    }
}

/**
 * Generate cache key
 */
function generateCacheKey(dashboardId, operation, params = {}) {
    const paramString = Object.keys(params)
        .sort()
        .map(key => `${key}:${params[key]}`)
        .join('|');

    return `metrics:${dashboardId}:${operation}${paramString ? ':' + paramString : ''}`;
}

/**
 * Get remaining TTL
 */
async function getTTL(key, context) {
    try {
        const client = await getRedisClient();
        if (!client) {
            context.log('[Redis] Cache not available - cannot get TTL');
            return -1;
        }

        const ttl = await client.ttl(key);
        context.log(`[Redis] TTL for key ${key}: ${ttl}s`);
        return ttl;
    } catch (error) {
        context.warn(`[Redis] Error getting TTL: ${error.message}`);
        return -1;
    }
}

/**
 * Close connection gracefully
 */
async function closeRedisConnection() {
    if (redisClient && redisClient.isOpen) {
        try {
            await redisClient.quit();
            console.log('[Redis] Connection closed gracefully');
        } catch (error) {
            console.error('[Redis] Error closing connection:', error.message);
        }
        redisClient = null;
        connectionInitialized = false;
    }
}

// Initialize on module load
console.log('[Redis] Scheduling initialization on next tick...');
setImmediate(() => {
    console.log('[Redis] Starting async initialization...');
    initializeRedisClient().catch(err => {
        console.error('[Redis] Initialization error:', err);
    });
});

module.exports = {
    getCachedData,
    setCachedData,
    deleteCachedData,
    deleteCachedPattern,
    generateCacheKey,
    getTTL,
    closeRedisConnection,
    initializeRedisClient
};