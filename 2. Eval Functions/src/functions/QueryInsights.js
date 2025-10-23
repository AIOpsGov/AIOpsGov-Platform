const { app } = require('@azure/functions');

app.http('QueryInsights', {
    methods: ['GET', 'POST', 'OPTIONS'],
    authLevel: 'anonymous',
    route: 'query-insights',
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
            const appId = process.env.APP_ID;
            const apiKey = process.env.API_KEY;
            
            if (!appId || !apiKey) {
                return {
                    status: 500,
                    headers: corsHeaders,
                    jsonBody: { error: 'APP_ID or API_KEY not configured' }
                };
            }

            const body = await request.json();
            const query = body?.query;

            if (!query) {
                return {
                    status: 400,
                    headers: corsHeaders,
                    jsonBody: { error: 'Query field is required' }
                };
            }

            const url = `https://api.applicationinsights.io/v1/apps/${appId}/query?query=${encodeURIComponent(query)}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'x-api-key': apiKey }
            });

            const data = await response.json();
            
            return {
                status: 200,
                headers: corsHeaders,
                jsonBody: data
            };
        } catch (error) {
            context.error('Error querying insights:', error.message);
            return {
                status: 500,
                headers: corsHeaders,
                jsonBody: { 
                    error: 'Failed to query insights',
                    message: error.message 
                }
            };
        }
    }
});
