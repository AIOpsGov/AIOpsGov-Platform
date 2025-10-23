const { app } = require('@azure/functions');

app.http('TriggerEvaluation', {
    methods: ['GET', 'POST', 'OPTIONS'],
    authLevel: 'anonymous',
    route: 'trigger-evaluation',
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
            const webhookUrl = process.env.WEBHOOK_URL;
            if (!webhookUrl) {
                return {
                    status: 500,
                    headers: corsHeaders,
                    jsonBody: { error: 'WEBHOOK_URL not configured' }
                };
            }

            const body = await request.json();
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await response.text();
            
            return {
                status: response.status,
                headers: corsHeaders,
                jsonBody: { success: true, data: data }
            };
        } catch (error) {
            context.error('Error triggering evaluation:', error.message);
            return {
                status: 500,
                headers: corsHeaders,
                jsonBody: { 
                    error: 'Failed to trigger evaluation',
                    message: error.message 
                }
            };
        }
    }
});
