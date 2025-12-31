const { app } = require('@azure/functions');
const { getDynamicsAuthManager } = require('../utils/dynamicsAuth');

app.http('BW_Intent_GetDynamicsCategories', {
    methods: ['POST', 'OPTIONS'],
    authLevel: 'anonymous',
    route: 'bw-intent/get-dynamics-categories',
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
            const body = await request.json();
            const { caseIds } = body;

            if (!caseIds || !Array.isArray(caseIds)) {
                return {
                    status: 400,
                    headers: corsHeaders,
                    jsonBody: {
                        error: 'caseIds array is required'
                    }
                };
            }

            context.log(`Fetching categories for ${caseIds.length} cases from Dynamics 365`);

            const authManager = getDynamicsAuthManager();
            const categories = await authManager.batchGetCategories(caseIds);

            context.log(`Successfully fetched ${Object.keys(categories).length} categories`);

            return {
                status: 200,
                headers: corsHeaders,
                jsonBody: {
                    categories
                }
            };
        } catch (error) {
            context.error('Error fetching Dynamics categories:', error.message);
            return {
                status: 500,
                headers: corsHeaders,
                jsonBody: {
                    error: 'Failed to fetch categories from Dynamics 365',
                    message: error.message
                }
            };
        }
    }
});
