/**
 * Legal Dashboard API Service
 * Contains all API calls specific to Legal Case Management Dashboard
 * Each dashboard has its own api.ts with its specific function names and KQL queries
 */

import axios from 'axios';

// Get Function App URL from environment
const FUNCTION_APP_URL = import.meta.env.VITE_FUNCTION_APP_URL || 'https://copilot-metrics-func.azurewebsites.net';
const APP_INSIGHTS_CONNECTION = import.meta.env.VITE_LEGAL_APP_INSIGHTS || '';

/**
 * Create axios client for Legal dashboard functions
 */
const createLegalClient = () => {
  return axios.create({
    baseURL: FUNCTION_APP_URL,
    timeout: 180000, // 3 minutes for KQL queries
    headers: {
      'Content-Type': 'application/json',
      'X-AppInsights-Connection': APP_INSIGHTS_CONNECTION,
    },
  });
};

/**
 * Legal-specific interfaces
 */
export interface LegalCaseMetrics {
  totalCases: number;
  activeCases: number;
  closedCases: number;
  avgCaseResolutionTime: number; // hours
  casesByPriority: { priority: string; count: number }[];
  casesByType: { type: string; count: number }[];
}

export interface LegalDocumentAnalysis {
  documentId: string;
  documentName: string;
  analysisDate: string;
  keyTerms: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
  summary: string;
}

export interface LegalClientCommunication {
  communicationId: string;
  clientName: string;
  caseId: string;
  messageCount: number;
  lastContactDate: string;
  responseTime: number; // minutes
  status: 'pending' | 'responded' | 'resolved';
}

/**
 * Get Legal Agent Performance
 * Calls: solution_legal_GetAgentPerformance
 */
export const getLegalAgentPerformance = async (
  agentName: string,
  timeRange: string = '7d'
) => {
  const client = createLegalClient();
  
  try {
    const response = await client.post('/api/solution_legal_GetAgentPerformance', {
      agentName,
      timeRange,
    });
    
    return response.data;
  } catch (error) {
    console.error('[Legal API] Error fetching agent performance:', error);
    throw error;
  }
};

/**
 * Get Legal Case Intake Metrics
 * Calls: solution_legal_GetCaseIntakeMetrics
 */
export const getLegalCaseIntakeMetrics = async (
  timeRange: string = '7d'
): Promise<LegalCaseMetrics> => {
  const client = createLegalClient();
  
  try {
    const response = await client.post('/api/solution_legal_GetCaseIntakeMetrics', {
      timeRange,
    });
    
    return response.data;
  } catch (error) {
    console.error('[Legal API] Error fetching case intake metrics:', error);
    throw error;
  }
};

/**
 * Get Legal Document Analysis Results
 * Calls: solution_legal_GetDocumentAnalysis
 */
export const getLegalDocumentAnalysis = async (
  caseId?: string,
  timeRange: string = '7d'
): Promise<LegalDocumentAnalysis[]> => {
  const client = createLegalClient();
  
  try {
    const response = await client.post('/api/solution_legal_GetDocumentAnalysis', {
      caseId,
      timeRange,
    });
    
    return response.data.documents || [];
  } catch (error) {
    console.error('[Legal API] Error fetching document analysis:', error);
    throw error;
  }
};

/**
 * Get Client Communication Logs
 * Calls: solution_legal_GetClientCommunications
 */
export const getLegalClientCommunications = async (
  caseId?: string,
  timeRange: string = '7d'
): Promise<LegalClientCommunication[]> => {
  const client = createLegalClient();
  
  try {
    const response = await client.post('/api/solution_legal_GetClientCommunications', {
      caseId,
      timeRange,
    });
    
    return response.data.communications || [];
  } catch (error) {
    console.error('[Legal API] Error fetching client communications:', error);
    throw error;
  }
};

/**
 * Get Compliance Alerts for Legal Cases
 * Calls: solution_legal_GetComplianceAlerts
 */
export const getLegalComplianceAlerts = async (
  timeRange: string = '7d'
) => {
  const client = createLegalClient();
  
  try {
    const response = await client.post('/api/solution_legal_GetComplianceAlerts', {
      timeRange,
    });
    
    return response.data.alerts || [];
  } catch (error) {
    console.error('[Legal API] Error fetching compliance alerts:', error);
    throw error;
  }
};

/**
 * Export Legal Dashboard Report
 * Calls: solution_legal_ExportReport
 */
export const exportLegalReport = async (
  reportType: 'summary' | 'detailed',
  timeRange: string = '7d'
) => {
  const client = createLegalClient();
  
  try {
    const response = await client.post('/api/solution_legal_ExportReport', {
      reportType,
      timeRange,
    }, {
      responseType: 'blob', // For downloading files
    });
    
    return response.data;
  } catch (error) {
    console.error('[Legal API] Error exporting report:', error);
    throw error;
  }
};
