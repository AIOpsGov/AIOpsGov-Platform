/**
 * Copilot Telemetry API Service
 * Handles fetching telemetry data from Application Insights for Microsoft Copilot Agents
 * Works with customEvents table containing BotMessageReceived, BotMessageSend, TopicStart, TopicAction, TopicEnd
 */

import axios from 'axios';
import { DashboardConfig } from '../config/dashboardConfigs';

/**
 * Get Function App URL for a specific dashboard configuration
 * Tries dashboard-specific URL first, falls back to shared URL
 */
const getFunctionAppUrl = (config: DashboardConfig): string => {
  const dashboardUrl = import.meta.env[config.functionAppEnvVar];
  const sharedUrl = import.meta.env.VITE_FUNCTION_APP_URL;
  return dashboardUrl || sharedUrl || 'https://your-function-app-url.azurewebsites.net';
};

/**
 * Get function name based on dashboard ID and operation
 * Pattern: solution_{dashboard}_OperationName
 * Example: legal-case-management -> solution_legal_GetAgentPerformance
 */
const getFunctionName = (dashboardId: string, operation: string): string => {
  // Extract prefix from dashboard ID (e.g., 'legal-case-management' -> 'legal')
  const prefix = dashboardId.split('-')[0];
  return `solution_${prefix}_${operation}`;
};

/**
 * Get Application Insights connection for a specific dashboard
 */
const getAppInsightsConnection = (config: DashboardConfig): string => {
  return import.meta.env[config.appInsightsEnvVar] || 'placeholder-app-insights-connection';
};

/**
 * Create axios client for a specific dashboard
 */
const createCopilotClient = (config: DashboardConfig) => {
  return axios.create({
    baseURL: getFunctionAppUrl(config),
    timeout: 180000, // 3 minutes for KQL queries
    headers: {
      'Content-Type': 'application/json',
      'X-AppInsights-Connection': getAppInsightsConnection(config), // Custom header for backend to know which App Insights to query
    },
  });
};

/**
 * Base Copilot Event Interface
 */
export interface CopilotEvent {
  timestamp: string;
  name: string; // BotMessageReceived, BotMessageSend, TopicStart, TopicAction, TopicEnd
  conversationId: string;
  channelId: string;
  sessionId: string;
  userId: string;
  agentName: string; // cloud_RoleInstance
  designMode: boolean;
}

/**
 * Bot Message Event
 */
export interface BotMessage extends CopilotEvent {
  text?: string;
  speak?: string;
  recipientId?: string;
  recipientName?: string;
  locale?: string;
  fromId?: string;
}

/**
 * Topic Event
 */
export interface TopicEvent extends CopilotEvent {
  topicName: string;
  topicId?: string;
  trigger?: string;
  action?: string;
  actionId?: string;
  kind?: string; // SendActivity, Question, etc.
}

/**
 * Conversation Session Summary
 */
export interface ConversationSession {
  conversationId: string;
  agentName: string;
  startTime: string;
  endTime?: string;
  duration?: number; // minutes
  messageCount: number;
  userMessageCount: number;
  botMessageCount: number;
  topicsTriggered: string[];
  status: 'active' | 'completed' | 'abandoned';
  channelId: string;
  userId: string;
  locale?: string;
}

/**
 * Topic Performance Metrics
 */
export interface TopicMetrics {
  topicName: string;
  topicId: string;
  triggerCount: number;
  completionCount: number;
  abandonmentCount: number;
  avgDuration: number;
  successRate: number;
  commonActions: { actionId: string; kind: string; count: number }[];
}

/**
 * Agent Performance Summary
 */
export interface AgentPerformance {
  agentName: string;
  totalConversations: number;
  activeConversations: number;
  completedConversations: number;
  totalMessages: number;
  avgMessagesPerConversation: number;
  avgConversationDuration: number;
  topTopics: { topicName: string; count: number }[];
  channelDistribution: { [channel: string]: number };
  localeDistribution: { [locale: string]: number };
  hourlyDistribution: { [hour: string]: number };
}

/**
 * Executive Dashboard Metrics
 */
export interface ExecutiveDashboardMetrics {
  totalConversations: number;
  activeConversations: number;
  avgResponseTime: number; // seconds
  totalMessages: number;
  uniqueUsers: number;
  topAgents: { agentName: string; conversationCount: number }[];
  conversationTrend: { date: string; count: number }[];
  successRate: number;
  avgSatisfactionScore?: number;
}

/**
 * Anomaly Detection
 */
export interface AnomalyAlert {
  severity: 'high' | 'medium' | 'low';
  type: 'spike' | 'drop' | 'error' | 'performance';
  title: string;
  description: string;
  metric: string;
  currentValue: number;
  expectedValue: number;
  timestamp: string;
}

/**
 * Get conversation sessions for a specific time range
 */
export const getConversationSessions = async (
  config: DashboardConfig,
  agentName: string,
  timeRange: string = '7d'
): Promise<ConversationSession[]> => {
  console.log('[copilotTelemetryApi] getConversationSessions called', { agentName, timeRange });
  
  const baseUrl = getFunctionAppUrl(config);
  const functionName = getFunctionName(config.id, 'GetConversationSessions');
  
  try {
    // Call: https://func.azurewebsites.net/api/solution_legal/GetConversationSessions
    const response = await axios.post(`${baseUrl}/api/${functionName}`, {
      agentName,
      timeRange,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-AppInsights-Connection': getAppInsightsConnection(config),
      },
      timeout: 180000,
    });

    console.log('[copilotTelemetryApi] Conversation sessions response:', response.data);
    
    if (response.data?.sessions) {
      return response.data.sessions;
    }
    
    return [];
  } catch (error) {
    console.error('[copilotTelemetryApi] Error fetching conversation sessions:', error);
    throw error;
  }
};

/**
 * Get topic performance metrics
 */
export const getTopicMetrics = async (
  config: DashboardConfig,
  agentName: string,
  timeRange: string = '7d'
): Promise<TopicMetrics[]> => {
  console.log('[copilotTelemetryApi] getTopicMetrics called', { agentName, timeRange });
  
  const baseUrl = getFunctionAppUrl(config);
  const functionName = getFunctionName(config.id, 'GetTopicMetrics');
  
  try {
    // Call: https://func.azurewebsites.net/api/solution_legal/GetTopicMetrics
    const response = await axios.post(`${baseUrl}/api/${functionName}`, {
      agentName,
      timeRange,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-AppInsights-Connection': getAppInsightsConnection(config),
      },
      timeout: 180000,
    });

    console.log('[copilotTelemetryApi] Topic metrics response:', response.data);
    
    if (response.data?.topics) {
      return response.data.topics;
    }
    
    return [];
  } catch (error) {
    console.error('[copilotTelemetryApi] Error fetching topic metrics:', error);
    throw error;
  }
};

/**
 * Get agent performance summary
 */
export const getAgentPerformance = async (
  config: DashboardConfig,
  agentName: string,
  timeRange: string = '7d'
): Promise<AgentPerformance | null> => {
  console.log('[copilotTelemetryApi] getAgentPerformance called', { agentName, timeRange });
  
  const copilotClient = createCopilotClient(config);
  
  try {
    const response = await copilotClient.post('/api/copilot/get-agent-performance', {
      agentName,
      timeRange,
    });

    console.log('[copilotTelemetryApi] Agent performance response:', response.data);
    
    if (response.data?.performance) {
      return response.data.performance;
    }
    
    return null;
  } catch (error) {
    console.error('[copilotTelemetryApi] Error fetching agent performance:', error);
    throw error;
  }
};

/**
 * Get executive dashboard metrics
 */
export const getExecutiveDashboardMetrics = async (
  config: DashboardConfig,
  agentNames: string[],
  timeRange: string = '7d'
): Promise<ExecutiveDashboardMetrics | null> => {
  console.log('[copilotTelemetryApi] getExecutiveDashboardMetrics called', { agentNames, timeRange });
  
  const copilotClient = createCopilotClient(config);
  
  try {
    const response = await copilotClient.post('/api/copilot/get-executive-metrics', {
      agentNames,
      timeRange,
    });

    console.log('[copilotTelemetryApi] Executive metrics response:', response.data);
    
    if (response.data?.metrics) {
      return response.data.metrics;
    }
    
    return null;
  } catch (error) {
    console.error('[copilotTelemetryApi] Error fetching executive metrics:', error);
    throw error;
  }
};

/**
 * Detect anomalies in agent behavior
 */
export const detectAnomalies = async (
  config: DashboardConfig,
  agentName: string,
  timeRange: string = '7d'
): Promise<AnomalyAlert[]> => {
  console.log('[copilotTelemetryApi] detectAnomalies called', { agentName, timeRange });
  
  const copilotClient = createCopilotClient(config);
  
  try {
    const response = await copilotClient.post('/api/copilot/detect-anomalies', {
      agentName,
      timeRange,
    });

    console.log('[copilotTelemetryApi] Anomaly detection response:', response.data);
    
    if (response.data?.anomalies) {
      return response.data.anomalies;
    }
    
    return [];
  } catch (error) {
    console.error('[copilotTelemetryApi] Error detecting anomalies:', error);
    return [];
  }
};

/**
 * Get conversation transcript
 */
export const getConversationTranscript = async (
  config: DashboardConfig,
  conversationId: string
): Promise<BotMessage[]> => {
  console.log('[copilotTelemetryApi] getConversationTranscript called', { conversationId });
  
  const copilotClient = createCopilotClient(config);
  
  try {
    const response = await copilotClient.post('/api/copilot/get-conversation-transcript', {
      conversationId,
    });

    console.log('[copilotTelemetryApi] Conversation transcript response:', response.data);
    
    if (response.data?.messages) {
      return response.data.messages;
    }
    
    return [];
  } catch (error) {
    console.error('[copilotTelemetryApi] Error fetching conversation transcript:', error);
    throw error;
  }
};

/**
 * Get topic flow for a conversation
 */
export const getTopicFlow = async (
  config: DashboardConfig,
  conversationId: string
): Promise<TopicEvent[]> => {
  console.log('[copilotTelemetryApi] getTopicFlow called', { conversationId });
  
  const copilotClient = createCopilotClient(config);
  
  try {
    const response = await copilotClient.post('/api/copilot/get-topic-flow', {
      conversationId,
    });

    console.log('[copilotTelemetryApi] Topic flow response:', response.data);
    
    if (response.data?.topics) {
      return response.data.topics;
    }
    
    return [];
  } catch (error) {
    console.error('[copilotTelemetryApi] Error fetching topic flow:', error);
    throw error;
  }
};

/**
 * Calculate response time metrics
 */
export const calculateResponseTimeMetrics = (messages: BotMessage[]): {
  avgResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  medianResponseTime: number;
} => {
  const responseTimes: number[] = [];
  
  for (let i = 1; i < messages.length; i++) {
    if (messages[i].name === 'BotMessageSend' && messages[i - 1].name === 'BotMessageReceived') {
      const responseTime = new Date(messages[i].timestamp).getTime() - new Date(messages[i - 1].timestamp).getTime();
      responseTimes.push(responseTime / 1000); // Convert to seconds
    }
  }
  
  if (responseTimes.length === 0) {
    return { avgResponseTime: 0, minResponseTime: 0, maxResponseTime: 0, medianResponseTime: 0 };
  }
  
  const sorted = responseTimes.sort((a, b) => a - b);
  const avg = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)];
  
  return {
    avgResponseTime: avg,
    minResponseTime: Math.min(...responseTimes),
    maxResponseTime: Math.max(...responseTimes),
    medianResponseTime: median,
  };
};
