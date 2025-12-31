/**
 * Dynamics 365 Authentication Manager
 * Handles OAuth 2.0 Client Credentials Flow for Dynamics API
 */

const fetch = require('node-fetch');

class DynamicsAuthManager {
    constructor() {
        this.clientId = process.env.DYNAMICS_CLIENT_ID;
        this.tenantId = process.env.DYNAMICS_TENANT_ID;
        this.clientSecret = process.env.DYNAMICS_CLIENT_SECRET;
        this.dynamicsUrl = process.env.DYNAMICS_INSTANCE_URL;
        
        this.token = null;
        this.tokenExpiry = null;
    }

    /**
     * Get access token (with caching)
     */
    async getAccessToken() {
        // Return cached token if still valid (with 5-minute buffer)
        if (this.token && this.tokenExpiry && this.tokenExpiry > Date.now()) {
            return this.token;
        }

        try {
            const tokenUrl = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`;
            
            const params = new URLSearchParams({
                client_id: this.clientId,
                client_secret: this.clientSecret,
                scope: `${this.dynamicsUrl}/.default`,
                grant_type: 'client_credentials'
            });

            const response = await fetch(tokenUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: params
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Auth failed: ${response.statusText} - ${errorText}`);
            }

            const data = await response.json();
            
            // Cache token with 5-minute buffer before expiry
            this.token = data.access_token;
            this.tokenExpiry = Date.now() + (data.expires_in * 1000) - (5 * 60 * 1000);
            
            return this.token;
        } catch (error) {
            console.error('Failed to get Dynamics access token:', error);
            throw error;
        }
    }

    /**
     * Make authenticated request to Dynamics API
     */
    async makeRequest(endpoint, options = {}) {
        const token = await this.getAccessToken();
        
        const url = endpoint.startsWith('http') ? endpoint : `${this.dynamicsUrl}${endpoint}`;
        
        const response = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'OData-MaxVersion': '4.0',
                'OData-Version': '4.0',
                'Prefer': 'return=representation'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Dynamics API request failed: ${response.status} ${response.statusText} - ${errorText}`);
        }

        return response.json();
    }

    /**
     * Get category from case by caseId
     */
    async getCategoryFromCase(caseId) {
        try {
            const endpoint = `/api/data/v9.2/incidents(${caseId})?$select=dxc_reasoncode`;
            const data = await this.makeRequest(endpoint);
            
            const reasonCode = data.dxc_reasoncode;
            
            // Log for debugging
            console.log(`[Dynamics] Case ${caseId} - reasonCode:`, reasonCode, typeof reasonCode);
            
            // Category mapping - support both number and string keys
            const CATEGORY_MAP = {
                '282210001': 'Quote - New',
                '267030002': 'Invoice Enquiry',
                '282210015': 'Empty Category',
                282210001: 'Quote - New',
                267030002: 'Invoice Enquiry',
                282210015: 'Empty Category'
            };
            
            const category = CATEGORY_MAP[reasonCode] || CATEGORY_MAP[String(reasonCode)] || 'Unknown';
            console.log(`[Dynamics] Mapped category:`, category);
            
            return category;
        } catch (error) {
            console.error(`Error fetching category for case ${caseId}:`, error.message);
            return 'Error Loading';
        }
    }

    /**
     * Get full case details by caseId
     */
    async getCaseDetails(caseId) {
        try {
            const endpoint = `/api/data/v9.2/incidents(${caseId})?$select=incidentid,ticketnumber,title,createdon,description,statuscode,prioritycode,dxc_reasoncode`;
            const data = await this.makeRequest(endpoint);
            
            const reasonCode = data.dxc_reasoncode;
            
            // Log for debugging
            console.log(`[Dynamics] Case details - reasonCode:`, reasonCode, typeof reasonCode);
            
            // Category mapping - support both number and string keys
            const CATEGORY_MAP = {
                '282210001': 'Quote - New',
                '267030002': 'Invoice Enquiry',
                '282210015': 'Empty Category',
                282210001: 'Quote - New',
                267030002: 'Invoice Enquiry',
                282210015: 'Empty Category'
            };
            
            const category = CATEGORY_MAP[reasonCode] || CATEGORY_MAP[String(reasonCode)] || 'Unknown';
            
            return {
                ...data,
                category
            };
        } catch (error) {
            console.error(`Error fetching case details for ${caseId}:`, error.message);
            throw error;
        }
    }

    /**
     * Batch fetch categories for multiple cases
     */
    async batchGetCategories(caseIds) {
        try {
            const uniqueCaseIds = [...new Set(caseIds.filter(id => id))];
            
            if (uniqueCaseIds.length === 0) {
                return {};
            }

            // Build OData $filter for batch request
            const filterParts = uniqueCaseIds.map(id => `incidentid eq ${id}`);
            const filter = filterParts.join(' or ');
            
            const endpoint = `/api/data/v9.2/incidents?$select=incidentid,dxc_reasoncode&$filter=${encodeURIComponent(filter)}`;
            const data = await this.makeRequest(endpoint);
            
            // Category mapping - support both number and string keys
            const CATEGORY_MAP = {
                '282210001': 'Quote - New',
                '267030002': 'Invoice Enquiry',
                '282210015': 'Empty Category',
                282210001: 'Quote - New',
                267030002: 'Invoice Enquiry',
                282210015: 'Empty Category'
            };
            
            // Build result map
            const result = {};
            if (data.value) {
                data.value.forEach(incident => {
                    const caseId = incident.incidentid;
                    const reasonCode = incident.dxc_reasoncode;
                    console.log(`[Dynamics] Batch - Case ${caseId} reasonCode:`, reasonCode, typeof reasonCode);
                    result[caseId] = CATEGORY_MAP[reasonCode] || CATEGORY_MAP[String(reasonCode)] || 'Unknown';
                });
            }
            
            console.log(`[Dynamics] Batch result:`, result);
            
            return result;
        } catch (error) {
            console.error('Error batch fetching categories:', error.message);
            return {};
        }
    }
}

// Singleton instance
let authManagerInstance = null;

function getDynamicsAuthManager() {
    if (!authManagerInstance) {
        authManagerInstance = new DynamicsAuthManager();
    }
    return authManagerInstance;
}

module.exports = {
    DynamicsAuthManager,
    getDynamicsAuthManager
};
