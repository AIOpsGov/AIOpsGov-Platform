const { app } = require('@azure/functions');
const { getDynamicsAuthManager } = require('../utils/dynamicsAuth');
const { deleteCachedPattern } = require('../utils/redisCache');

/**
 * Azure Function: BW_Intent_UpdateCategory
 * 
 * Updates the category (dxc_reasoncode) of a Dynamics 365 case
 * 
 * Request Body:
 * {
 *   "caseId": "guid-string",
 *   "categoryName": "Quote - New" | "Invoice Enquiry",
 *   "newReasonCode": 282210001 | 267030002  (optional if categoryName is provided)
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Category updated successfully",
 *   "caseId": "...",
 *   "oldReasonCode": 267030002,
 *   "newReasonCode": 282210001,
 *   "category": "Quote - New"
 * }
 */

// Category mapping
const CATEGORY_TO_REASON_CODE = {
    'Quote - New': 282210001,
    'Invoice Enquiry': 267030002,
    'Empty Category': 282210015
};

const REASON_CODE_TO_CATEGORY = {
    282210001: 'Quote - New',
    267030002: 'Invoice Enquiry',
    282210015: 'Empty Category'
};

app.http('BW_Intent_UpdateCategory', {
    methods: ['POST', 'PATCH', 'OPTIONS'],
    authLevel: 'anonymous',
    route: 'bw-intent/update-category',
    handler: async (request, context) => {
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        };

        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return { 
                status: 200, 
                headers: corsHeaders 
            };
        }

        try {
            const body = await request.json();
            const { caseId, categoryName, newReasonCode } = body;

            // Validation
            if (!caseId) {
                return {
                    status: 400,
                    headers: corsHeaders,
                    jsonBody: {
                        error: 'caseId is required'
                    }
                };
            }

            // Determine the reason code to use
            let reasonCodeToSet;
            let categoryToSet;

            if (categoryName) {
                // If category name is provided, look up the code
                reasonCodeToSet = CATEGORY_TO_REASON_CODE[categoryName];
                categoryToSet = categoryName;
                
                if (!reasonCodeToSet) {
                    return {
                        status: 400,
                        headers: corsHeaders,
                        jsonBody: {
                            error: `Invalid category name: ${categoryName}. Valid categories: ${Object.keys(CATEGORY_TO_REASON_CODE).join(', ')}`
                        }
                    };
                }
            } else if (newReasonCode !== undefined) {
                // If reason code is provided directly
                reasonCodeToSet = Number(newReasonCode);
                categoryToSet = REASON_CODE_TO_CATEGORY[reasonCodeToSet];
                
                if (!categoryToSet) {
                    return {
                        status: 400,
                        headers: corsHeaders,
                        jsonBody: {
                            error: `Invalid reason code: ${newReasonCode}. Valid codes: ${Object.keys(REASON_CODE_TO_CATEGORY).join(', ')}`
                        }
                    };
                }
            } else {
                return {
                    status: 400,
                    headers: corsHeaders,
                    jsonBody: {
                        error: 'Either categoryName or newReasonCode must be provided'
                    }
                };
            }

            context.log(`[UpdateCategory] Updating case ${caseId}`);
            context.log(`[UpdateCategory] New category: ${categoryToSet} (code: ${reasonCodeToSet})`);

            const authManager = getDynamicsAuthManager();

            // Step 1: Get the current value before updating
            context.log('[UpdateCategory] Fetching current case details...');
            const currentCase = await authManager.getCaseDetails(caseId);
            const oldReasonCode = currentCase.dxc_reasoncode;
            
            context.log(`[UpdateCategory] Current reasonCode: ${oldReasonCode}`);

            // Check if already set to this value
            if (Number(oldReasonCode) === reasonCodeToSet) {
                context.log('[UpdateCategory] Category is already set to the requested value');
                return {
                    status: 200,
                    headers: corsHeaders,
                    jsonBody: {
                        success: true,
                        message: 'Category is already set to the requested value',
                        caseId: caseId,
                        oldReasonCode: oldReasonCode,
                        newReasonCode: reasonCodeToSet,
                        category: categoryToSet,
                        unchanged: true
                    }
                };
            }

            // Step 2: PATCH request to update dxc_reasoncode
            context.log(`[UpdateCategory] Sending PATCH request to update dxc_reasoncode to ${reasonCodeToSet}...`);
            
            const endpoint = `/api/data/v9.2/incidents(${caseId})`;
            
            await authManager.makeRequest(endpoint, {
                method: 'PATCH',
                body: JSON.stringify({
                    dxc_reasoncode: reasonCodeToSet
                })
            });

            context.log('[UpdateCategory] PATCH request successful');

            // Step 3: Wait a moment for Dynamics to process
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Step 4: Verify the update
            context.log('[UpdateCategory] Verifying update...');
            const updatedCase = await authManager.getCaseDetails(caseId);
            const verifiedReasonCode = updatedCase.dxc_reasoncode;
            
            context.log(`[UpdateCategory] Verified reasonCode: ${verifiedReasonCode}`);

            // Check if verification succeeded
            if (Number(verifiedReasonCode) === reasonCodeToSet) {
                context.log('[UpdateCategory] Update verified successfully ✓');
                
                // Invalidate all cached data for this dashboard since data changed
                await deleteCachedPattern('metrics:BW_Intent:*', context);
                context.log('[UpdateCategory] Cache invalidated');
                
                return {
                    status: 200,
                    headers: corsHeaders,
                    jsonBody: {
                        success: true,
                        message: 'Category updated and verified successfully',
                        caseId: caseId,
                        oldReasonCode: oldReasonCode,
                        newReasonCode: reasonCodeToSet,
                        category: categoryToSet,
                        verified: true
                    }
                };
            } else {
                // Update was sent but verification failed
                context.warn('[UpdateCategory] Update sent but verification mismatch');
                
                // Still invalidate cache since we attempted an update
                await deleteCachedPattern('metrics:BW_Intent:*', context);
                
                return {
                    status: 200,
                    headers: corsHeaders,
                    jsonBody: {
                        success: true,
                        message: 'Update sent successfully, but verification showed different value',
                        caseId: caseId,
                        oldReasonCode: oldReasonCode,
                        newReasonCode: reasonCodeToSet,
                        verifiedReasonCode: verifiedReasonCode,
                        category: categoryToSet,
                        verified: false,
                        warning: 'Verification mismatch - Dynamics may still be processing the update'
                    }
                };
            }

        } catch (error) {
            context.error('[UpdateCategory] Error:', error);
            
            return {
                status: 500,
                headers: corsHeaders,
                jsonBody: {
                    success: false,
                    error: 'Failed to update category in Dynamics 365',
                    message: error.message,
                    details: error.stack
                }
            };
        }
    }
});
