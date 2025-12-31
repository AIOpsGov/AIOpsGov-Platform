/**
 * Healthcare Dashboard API Service
 * Contains all API calls specific to Healthcare Patient Support Dashboard
 * Each dashboard has its own api.ts with its specific function names and KQL queries
 */

import axios from 'axios';

// Get Function App URL from environment
const FUNCTION_APP_URL = import.meta.env.VITE_FUNCTION_APP_URL || 'https://copilot-metrics-func.azurewebsites.net';
const APP_INSIGHTS_CONNECTION = import.meta.env.VITE_HEALTHCARE_APP_INSIGHTS || '';

/**
 * Create axios client for Healthcare dashboard functions
 */
const createHealthcareClient = () => {
  return axios.create({
    baseURL: FUNCTION_APP_URL,
    timeout: 180000, // 3 minutes for KQL queries
    headers: {
      'Content-Type': 'application/json',
      'X-AppInsights-Connection': APP_INSIGHTS_CONNECTION,
      'X-HIPAA-Compliant': 'true', // Healthcare-specific header
    },
  });
};

/**
 * Healthcare-specific interfaces
 */
export interface HealthcareAppointmentMetrics {
  totalAppointments: number;
  scheduledAppointments: number;
  cancelledAppointments: number;
  completedAppointments: number;
  avgSchedulingTime: number; // minutes
  appointmentsByType: { type: string; count: number }[];
  appointmentsByDepartment: { department: string; count: number }[];
}

export interface HealthcareTriageData {
  triageId: string;
  patientId: string;
  timestamp: string;
  priority: 'critical' | 'urgent' | 'routine';
  symptoms: string[];
  aiAssessment: string;
  nurseReview: boolean;
  escalated: boolean;
}

export interface HealthcarePatientInquiry {
  inquiryId: string;
  patientId: string;
  inquiryType: 'appointment' | 'prescription' | 'test_results' | 'billing' | 'general';
  timestamp: string;
  resolvedBy: 'ai' | 'human' | 'pending';
  resolutionTime: number; // minutes
  satisfactionScore?: number; // 1-5
}

/**
 * Get Healthcare Agent Performance
 * Calls: solution_healthcare_GetAgentPerformance
 */
export const getHealthcareAgentPerformance = async (
  agentName: string,
  timeRange: string = '7d'
) => {
  const client = createHealthcareClient();
  
  try {
    const response = await client.post('/api/solution_healthcare_GetAgentPerformance', {
      agentName,
      timeRange,
    });
    
    return response.data;
  } catch (error) {
    console.error('[Healthcare API] Error fetching agent performance:', error);
    throw error;
  }
};

/**
 * Get Appointment Scheduling Metrics
 * Calls: solution_healthcare_GetAppointmentMetrics
 */
export const getHealthcareAppointmentMetrics = async (
  departmentId?: string,
  timeRange: string = '7d'
): Promise<HealthcareAppointmentMetrics> => {
  const client = createHealthcareClient();
  
  try {
    const response = await client.post('/api/solution_healthcare_GetAppointmentMetrics', {
      departmentId,
      timeRange,
    });
    
    return response.data;
  } catch (error) {
    console.error('[Healthcare API] Error fetching appointment metrics:', error);
    throw error;
  }
};

/**
 * Get Triage Assessment Data
 * Calls: solution_healthcare_GetTriageData
 */
export const getHealthcareTriageData = async (
  priority?: 'critical' | 'urgent' | 'routine' | 'all',
  timeRange: string = '7d'
): Promise<HealthcareTriageData[]> => {
  const client = createHealthcareClient();
  
  try {
    const response = await client.post('/api/solution_healthcare_GetTriageData', {
      priority,
      timeRange,
    });
    
    return response.data.triages || [];
  } catch (error) {
    console.error('[Healthcare API] Error fetching triage data:', error);
    throw error;
  }
};

/**
 * Get Patient Inquiry History
 * Calls: solution_healthcare_GetPatientInquiries
 */
export const getHealthcarePatientInquiries = async (
  inquiryType?: string,
  timeRange: string = '7d'
): Promise<HealthcarePatientInquiry[]> => {
  const client = createHealthcareClient();
  
  try {
    const response = await client.post('/api/solution_healthcare_GetPatientInquiries', {
      inquiryType,
      timeRange,
    });
    
    return response.data.inquiries || [];
  } catch (error) {
    console.error('[Healthcare API] Error fetching patient inquiries:', error);
    throw error;
  }
};

/**
 * Get Medication Refill Requests
 * Calls: solution_healthcare_GetRefillRequests
 */
export const getHealthcareRefillRequests = async (
  status: 'pending' | 'approved' | 'denied' | 'all' = 'all',
  timeRange: string = '7d'
) => {
  const client = createHealthcareClient();
  
  try {
    const response = await client.post('/api/solution_healthcare_GetRefillRequests', {
      status,
      timeRange,
    });
    
    return response.data.requests || [];
  } catch (error) {
    console.error('[Healthcare API] Error fetching refill requests:', error);
    throw error;
  }
};

/**
 * Get HIPAA Compliance Audit Log
 * Calls: solution_healthcare_GetComplianceAudit
 */
export const getHealthcareComplianceAudit = async (
  timeRange: string = '7d'
) => {
  const client = createHealthcareClient();
  
  try {
    const response = await client.post('/api/solution_healthcare_GetComplianceAudit', {
      timeRange,
    });
    
    return response.data.auditLog || [];
  } catch (error) {
    console.error('[Healthcare API] Error fetching compliance audit:', error);
    throw error;
  }
};

/**
 * Export Healthcare Dashboard Report (HIPAA-compliant)
 * Calls: solution_healthcare_ExportReport
 */
export const exportHealthcareReport = async (
  reportType: 'summary' | 'detailed' | 'compliance',
  timeRange: string = '7d',
  deidentify: boolean = true // Remove PII/PHI from export
) => {
  const client = createHealthcareClient();
  
  try {
    const response = await client.post('/api/solution_healthcare_ExportReport', {
      reportType,
      timeRange,
      deidentify,
    }, {
      responseType: 'blob',
    });
    
    return response.data;
  } catch (error) {
    console.error('[Healthcare API] Error exporting report:', error);
    throw error;
  }
};
