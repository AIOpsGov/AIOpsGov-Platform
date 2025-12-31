/**
 * Finance Dashboard API Service
 * Contains all API calls specific to Finance/Banking Dashboard
 * Each dashboard has its own api.ts with its specific function names and KQL queries
 */

import axios from 'axios';

// Get Function App URL from environment
const FUNCTION_APP_URL = import.meta.env.VITE_FUNCTION_APP_URL || 'https://copilot-metrics-func.azurewebsites.net';
const APP_INSIGHTS_CONNECTION = import.meta.env.VITE_FINANCE_APP_INSIGHTS || '';

/**
 * Create axios client for Finance dashboard functions
 */
const createFinanceClient = () => {
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
 * Finance-specific interfaces
 */
export interface FinanceTransactionMetrics {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  totalVolume: number; // monetary value
  avgTransactionValue: number;
  transactionsByType: { type: string; count: number; volume: number }[];
}

export interface FinanceFraudAlert {
  alertId: string;
  transactionId: string;
  timestamp: string;
  riskScore: number; // 0-100
  flaggedReason: string;
  accountId: string;
  amount: number;
  status: 'investigating' | 'confirmed' | 'false_positive';
}

export interface FinanceAccountInquiry {
  inquiryId: string;
  accountId: string;
  customerId: string;
  inquiryType: 'balance' | 'transaction_history' | 'loan_status' | 'account_settings';
  timestamp: string;
  resolvedBy: 'ai' | 'human' | 'pending';
  resolutionTime: number; // seconds
}

/**
 * Get Finance Agent Performance
 * Calls: solution_finance_GetAgentPerformance
 */
export const getFinanceAgentPerformance = async (
  agentName: string,
  timeRange: string = '7d'
) => {
  const client = createFinanceClient();
  
  try {
    const response = await client.post('/api/solution_finance_GetAgentPerformance', {
      agentName,
      timeRange,
    });
    
    return response.data;
  } catch (error) {
    console.error('[Finance API] Error fetching agent performance:', error);
    throw error;
  }
};

/**
 * Get Transaction Metrics
 * Calls: solution_finance_GetTransactionMetrics
 */
export const getFinanceTransactionMetrics = async (
  timeRange: string = '7d'
): Promise<FinanceTransactionMetrics> => {
  const client = createFinanceClient();
  
  try {
    const response = await client.post('/api/solution_finance_GetTransactionMetrics', {
      timeRange,
    });
    
    return response.data;
  } catch (error) {
    console.error('[Finance API] Error fetching transaction metrics:', error);
    throw error;
  }
};

/**
 * Get Fraud Detection Alerts
 * Calls: solution_finance_GetFraudAlerts
 */
export const getFinanceFraudAlerts = async (
  severity: 'high' | 'medium' | 'low' | 'all' = 'all',
  timeRange: string = '7d'
): Promise<FinanceFraudAlert[]> => {
  const client = createFinanceClient();
  
  try {
    const response = await client.post('/api/solution_finance_GetFraudAlerts', {
      severity,
      timeRange,
    });
    
    return response.data.alerts || [];
  } catch (error) {
    console.error('[Finance API] Error fetching fraud alerts:', error);
    throw error;
  }
};

/**
 * Get Account Inquiry History
 * Calls: solution_finance_GetAccountInquiries
 */
export const getFinanceAccountInquiries = async (
  accountId?: string,
  timeRange: string = '7d'
): Promise<FinanceAccountInquiry[]> => {
  const client = createFinanceClient();
  
  try {
    const response = await client.post('/api/solution_finance_GetAccountInquiries', {
      accountId,
      timeRange,
    });
    
    return response.data.inquiries || [];
  } catch (error) {
    console.error('[Finance API] Error fetching account inquiries:', error);
    throw error;
  }
};

/**
 * Get Loan Application Status
 * Calls: solution_finance_GetLoanApplications
 */
export const getFinanceLoanApplications = async (
  status: 'pending' | 'approved' | 'rejected' | 'all' = 'all',
  timeRange: string = '7d'
) => {
  const client = createFinanceClient();
  
  try {
    const response = await client.post('/api/solution_finance_GetLoanApplications', {
      status,
      timeRange,
    });
    
    return response.data.applications || [];
  } catch (error) {
    console.error('[Finance API] Error fetching loan applications:', error);
    throw error;
  }
};

/**
 * Get Compliance Metrics
 * Calls: solution_finance_GetComplianceMetrics
 */
export const getFinanceComplianceMetrics = async (
  timeRange: string = '7d'
) => {
  const client = createFinanceClient();
  
  try {
    const response = await client.post('/api/solution_finance_GetComplianceMetrics', {
      timeRange,
    });
    
    return response.data;
  } catch (error) {
    console.error('[Finance API] Error fetching compliance metrics:', error);
    throw error;
  }
};

/**
 * Export Finance Dashboard Report
 * Calls: solution_finance_ExportReport
 */
export const exportFinanceReport = async (
  reportType: 'summary' | 'detailed' | 'compliance',
  timeRange: string = '7d'
) => {
  const client = createFinanceClient();
  
  try {
    const response = await client.post('/api/solution_finance_ExportReport', {
      reportType,
      timeRange,
    }, {
      responseType: 'blob',
    });
    
    return response.data;
  } catch (error) {
    console.error('[Finance API] Error exporting report:', error);
    throw error;
  }
};
