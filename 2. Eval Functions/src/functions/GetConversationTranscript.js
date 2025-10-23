const { app } = require('@azure/functions');

app.http('GetConversationTranscript', {
    methods: ['GET', 'POST', 'OPTIONS'],
    authLevel: 'anonymous',
    route: 'get-transcript',
    handler: async (request, context) => {
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        };

        if (request.method === 'OPTIONS') {
            return { status: 200, headers: corsHeaders };
        }

        try {
            const appId = process.env.APP_ID;
            const apiKey = process.env.API_KEY;
            
            if (!appId || !apiKey) {
                return {
                    status: 500,
                    headers: corsHeaders,
                    jsonBody: { error: 'APP_ID or API_KEY not configured' }
                };
            }

            // Get conversationId from query params or body
            let conversationId;
            if (request.method === 'GET') {
                conversationId = request.query.get('conversationId');
            } else {
                const body = await request.json();
                conversationId = body?.conversationId;
            }

            if (!conversationId) {
                return {
                    status: 400,
                    headers: corsHeaders,
                    jsonBody: { error: 'conversationId is required' }
                };
            }

            const daysToQuery = 7;

            // Query Application Insights for conversation events
            const query = `customEvents
| where timestamp > ago(${daysToQuery}d)
| where tostring(customDimensions.conversationId) == '${conversationId}' 
    or tostring(customDimensions.ConversationId) == '${conversationId}'
| project timestamp, name, customDimensions, customMeasurements
| order by timestamp asc`;

            const queryBody = {
                query: query,
                timespan: `P${daysToQuery}D`
            };

            const url = `https://api.applicationinsights.io/v1/apps/${appId}/query`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(queryBody)
            });

            const data = await response.json();
            
            if (!data.tables || !data.tables[0] || data.tables[0].rows.length === 0) {
                return {
                    status: 404,
                    headers: corsHeaders,
                    jsonBody: { 
                        error: 'No conversation found',
                        conversationId: conversationId,
                        transcript: []
                    }
                };
            }

            // Process the data to build transcript
            const transcript = [];
            const events = [];
            
            for (const row of data.tables[0].rows) {
                const timestamp = row[0];
                const eventName = row[1];
                const customDimensionsRaw = row[2];
                
                let customDimensions = {};
                try {
                    if (typeof customDimensionsRaw === 'string') {
                        customDimensions = JSON.parse(customDimensionsRaw);
                    } else {
                        customDimensions = customDimensionsRaw;
                    }
                } catch (err) {
                    context.warn(`Failed to parse customDimensions for event ${eventName}`);
                }
                
                // Try multiple possible field names for message content
                const possibleMessageFields = ['text', 'message', 'Message', 'content', 'Content', 'body', 'Body'];
                let messageContent = null;
                
                for (const field of possibleMessageFields) {
                    if (customDimensions[field]) {
                        messageContent = customDimensions[field];
                        break;
                    }
                }
                
                // Determine role based on event name
                const role = (eventName.includes('User') || eventName === 'BotMessageReceived') 
                    ? 'user' 
                    : 'assistant';
                
                const event = {
                    timestamp: timestamp,
                    eventName: eventName,
                    message: messageContent,
                    userId: customDimensions.userId || customDimensions.UserId || null,
                    role: role,
                    customDimensions: customDimensions
                };
                
                events.push(event);
                
                // Only add to transcript if there's a message
                if (messageContent) {
                    transcript.push({
                        timestamp: timestamp,
                        role: role,
                        message: messageContent,
                        eventName: eventName
                    });
                }
            }
            
            // Separate user and bot messages
            const userMessages = events
                .filter(e => e.role === 'user' && e.message)
                .map(e => e.message);
            
            const botMessages = events
                .filter(e => e.role === 'assistant' && e.message)
                .map(e => e.message);
            
            const result = {
                conversationId: conversationId,
                transcript: transcript,
                summary: {
                    totalEvents: events.length,
                    totalMessages: transcript.length,
                    userMessages: userMessages.length,
                    botMessages: botMessages.length,
                    firstMessageTime: transcript.length > 0 ? transcript[0].timestamp : null,
                    lastMessageTime: transcript.length > 0 ? transcript[transcript.length - 1].timestamp : null
                },
                events: events,
                queryTime: new Date().toISOString()
            };
            
            return {
                status: 200,
                headers: corsHeaders,
                jsonBody: result
            };
            
        } catch (error) {
            context.error('Error fetching conversation transcript:', error.message);
            return {
                status: 500,
                headers: corsHeaders,
                jsonBody: { 
                    error: 'Failed to fetch conversation transcript',
                    message: error.message 
                }
            };
        }
    }
});
