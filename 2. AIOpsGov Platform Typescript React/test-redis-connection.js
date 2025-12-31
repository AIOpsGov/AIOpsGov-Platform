/**
 * Redis Connection Test Script
 * Tests local and Azure Redis connectivity
 */

const redis = require('redis');

// Your Azure Redis connection string
const AZURE_REDIS_CONNECTION = 'bwaimhdrd01.redis.cache.windows.net:6380,password=sPyqOchlo6oNmoC0CDUZwHifBJBM6dP6AAzCaMFqL5s=,ssl=True,abortConnect=False';

async function testRedisConnection(connectionString) {
    console.log('=== Testing Redis Connection ===\n');
    console.log('Connection String:', connectionString.replace(/password=([^,]+)/, 'password=***REDACTED***'));
    
    let client;
    
    try {
        // Parse Azure Redis connection string
        const parts = connectionString.split(',');
        const hostPort = parts[0].split(':');
        const password = parts.find(p => p.startsWith('password='))?.split('=')[1];
        const useSsl = parts.find(p => p.startsWith('ssl='))?.split('=')[1]?.toLowerCase() === 'true';
        
        console.log('\n📋 Parsed Configuration:');
        console.log('  Host:', hostPort[0]);
        console.log('  Port:', hostPort[1]);
        console.log('  SSL:', useSsl);
        console.log('  Has Password:', !!password);
        
        // Create Redis client with Azure configuration
        const clientConfig = {
            socket: {
                host: hostPort[0],
                port: parseInt(hostPort[1] || '6380'),
                connectTimeout: 15000,
                keepAlive: 5000,
                tls: useSsl,
                reconnectStrategy: (retries) => {
                    if (retries > 3) {
                        console.log('❌ Max reconnection attempts reached');
                        return new Error('Max reconnection attempts reached');
                    }
                    console.log(`🔄 Reconnect attempt ${retries}`);
                    return Math.min(retries * 1000, 3000);
                }
            },
            password: password,
            pingInterval: 60000
        };
        
        console.log('\n🔌 Creating Redis client...');
        client = redis.createClient(clientConfig);
        
        // Set up event listeners
        client.on('error', (err) => {
            console.error('❌ Redis Client Error:', err.message);
        });
        
        client.on('connect', () => {
            console.log('✅ Redis client connected');
        });
        
        client.on('ready', () => {
            console.log('✅ Redis client ready');
        });
        
        console.log('⏳ Connecting to Redis...');
        await client.connect();
        
        // Test basic operations
        console.log('\n🧪 Testing Basic Operations:');
        
        // SET operation
        const testKey = 'test:connection:' + Date.now();
        const testValue = { message: 'Hello from test script!', timestamp: new Date().toISOString() };
        
        console.log('  📝 Writing test data...');
        await client.setEx(testKey, 60, JSON.stringify(testValue));
        console.log('  ✅ Write successful');
        
        // GET operation
        console.log('  📖 Reading test data...');
        const retrieved = await client.get(testKey);
        const parsedData = JSON.parse(retrieved);
        console.log('  ✅ Read successful:', parsedData);
        
        // TTL operation
        console.log('  ⏰ Checking TTL...');
        const ttl = await client.ttl(testKey);
        console.log('  ✅ TTL:', ttl, 'seconds');
        
        // DELETE operation
        console.log('  🗑️  Deleting test data...');
        await client.del(testKey);
        console.log('  ✅ Delete successful');
        
        // Verify deletion
        const deleted = await client.get(testKey);
        console.log('  ✅ Verified deletion (should be null):', deleted);
        
        console.log('\n✅ All tests passed! Redis is working correctly.');
        
        // Clean up
        await client.quit();
        console.log('✅ Connection closed gracefully\n');
        
        return true;
        
    } catch (error) {
        console.error('\n❌ Connection Test Failed!');
        console.error('Error Type:', error.constructor.name);
        console.error('Error Message:', error.message);
        console.error('Error Code:', error.code);
        
        if (error.stack) {
            console.error('\nStack Trace:');
            console.error(error.stack);
        }
        
        // Common error diagnostics
        console.log('\n🔍 Troubleshooting Tips:');
        
        if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
            console.log('  • DNS resolution failed - Check hostname');
            console.log('  • Verify network connectivity to Azure');
        }
        
        if (error.message.includes('ETIMEDOUT') || error.message.includes('timeout')) {
            console.log('  • Connection timeout - Check firewall rules');
            console.log('  • Verify Redis is not behind a firewall blocking your IP');
            console.log('  • Check if Redis public network access is enabled');
        }
        
        if (error.message.includes('ECONNREFUSED')) {
            console.log('  • Connection refused - Check if Redis is running');
            console.log('  • Verify port 6380 is correct (6379 for non-SSL)');
        }
        
        if (error.message.includes('authentication') || error.message.includes('WRONGPASS')) {
            console.log('  • Authentication failed - Check password/access key');
            console.log('  • Regenerate access key in Azure Portal if needed');
        }
        
        if (error.message.includes('SSL') || error.message.includes('TLS')) {
            console.log('  • SSL/TLS error - Check SSL configuration');
            console.log('  • Verify "Require SSL" setting in Azure Redis');
        }
        
        if (client && client.isOpen) {
            await client.quit();
        }
        
        return false;
    }
}

// Run the test
console.log('🚀 Redis Connection Tester\n');
testRedisConnection(AZURE_REDIS_CONNECTION)
    .then(success => {
        process.exit(success ? 0 : 1);
    })
    .catch(err => {
        console.error('Unexpected error:', err);
        process.exit(1);
    });
