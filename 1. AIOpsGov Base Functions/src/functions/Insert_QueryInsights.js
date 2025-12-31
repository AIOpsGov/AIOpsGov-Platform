const { app } = require('@azure/functions');
const { getConfigFromFunctionName, queryAppInsights } = require('../utils/appInsightsConfig');

app.http('BW_Intent_QueryInsights', {
    methods: ['GET', 'POST', 'OPTIONS'],
    authLevel: 'anonymous',
    route: 'bw-intent/query-insights',
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
            const config = getConfigFromFunctionName('BW_Intent_QueryInsights');
            context.log(`Querying App Insights for dashboard: ${config.dashboardIdentifier}`);

            const body = await request.json();
            const query = body?.query;

            if (!query) {
                return {
                    status: 400,
                    headers: corsHeaders,
                    jsonBody: { error: 'Query field is required' }
                };
            }

            // Use the queryAppInsights helper
            const data = await queryAppInsights(config, query);

            return {
                status: 200,
                headers: corsHeaders,
                jsonBody: {
                    ...data,
                    dashboard: config.dashboardIdentifier
                }
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