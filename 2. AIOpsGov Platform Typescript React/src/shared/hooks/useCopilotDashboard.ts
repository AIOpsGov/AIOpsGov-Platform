/**
 * Copilot Dashboard Hook
 * Custom hook for fetching and managing Copilot agent telemetry data
 */

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getConversationSessions,
  getTopicMetrics,
  getAgentPerformance,
  detectAnomalies,
  ConversationSession,
  TopicMetrics,
  AgentPerformance,
  AnomalyAlert,
} from '../../core/services/copilotTelemetryApi';
import { DashboardConfig } from '../../core/config/dashboardConfigs';

export interface UseCopilotDashboardResult {
  sessions: ConversationSession[];
  topicMetrics: TopicMetrics[];
  agentPerformance: AgentPerformance | null;
  anomalies: AnomalyAlert[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useCopilotDashboard = (
  config: DashboardConfig,
  agentName: string,
  timeRange: string
): UseCopilotDashboardResult => {
  const [sessions, setSessions] = useState<ConversationSession[]>([]);
  const [topicMetrics, setTopicMetrics] = useState<TopicMetrics[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyAlert[]>([]);

  // Fetch agent performance (main query)
  const {
    data: agentPerformance,
    isLoading: performanceLoading,
    error: performanceError,
    refetch: refetchPerformance,
  } = useQuery({
    queryKey: ['agentPerformance', config.id, agentName, timeRange],
    queryFn: () => getAgentPerformance(config, agentName, timeRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 0, // Don't retry on 404 - Function App not deployed
    enabled: true, // Always try to fetch
  });

  // Fetch conversation sessions
  const {
    data: sessionsData,
    refetch: refetchSessions,
  } = useQuery({
    queryKey: ['conversationSessions', config.id, agentName, timeRange],
    queryFn: () => getConversationSessions(config, agentName, timeRange),
    staleTime: 5 * 60 * 1000,
    retry: 0,
    enabled: !!agentPerformance && !performanceError, // Only fetch if performance data is available
  });

  // Fetch topic metrics
  const {
    data: topicsData,
    refetch: refetchTopics,
  } = useQuery({
    queryKey: ['topicMetrics', config.id, agentName, timeRange],
    queryFn: () => getTopicMetrics(config, agentName, timeRange),
    staleTime: 5 * 60 * 1000,
    retry: 0,
    enabled: !!agentPerformance && !performanceError, // Only fetch if performance data is available
  });

  // Fetch anomalies
  const {
    data: anomaliesData,
    refetch: refetchAnomalies,
  } = useQuery({
    queryKey: ['anomalies', config.id, agentName, timeRange],
    queryFn: () => detectAnomalies(config, agentName, timeRange),
    staleTime: 5 * 60 * 1000,
    retry: 0,
    enabled: !!agentPerformance && !performanceError, // Only fetch if performance data is available
  });

  // Update state when data changes
  useEffect(() => {
    if (sessionsData) {
      setSessions(sessionsData);
    }
  }, [sessionsData]);

  useEffect(() => {
    if (topicsData) {
      setTopicMetrics(topicsData);
    }
  }, [topicsData]);

  useEffect(() => {
    if (anomaliesData) {
      setAnomalies(anomaliesData);
    }
  }, [anomaliesData]);

  const refetch = () => {
    refetchPerformance();
    refetchSessions();
    refetchTopics();
    refetchAnomalies();
  };

  return {
    sessions,
    topicMetrics,
    agentPerformance: agentPerformance || null,
    anomalies,
    loading: performanceLoading,
    error: performanceError as Error | null,
    refetch,
  };
};
