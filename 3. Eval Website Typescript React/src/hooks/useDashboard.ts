/**
 * Custom hook for managing dashboard data
 * Handles fetching and refreshing dashboard statistics
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getDashboardData } from '../services/api';
import { DashboardData } from '../services/types';
import { DASHBOARD_REFRESH_INTERVAL } from '../utils/constants';
import { useCallback, useState } from 'react';

interface UseDashboardReturn {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  isRefetching: boolean;
  conversationIdFilter: string;
  setConversationIdFilter: (id: string) => void;
  timeRange: string;
  setTimeRange: (range: string) => void;
}

/**
 * Hook for fetching and managing dashboard data
 */
export const useDashboard = (): UseDashboardReturn => {
  const queryClient = useQueryClient();
  const [conversationIdFilter, setConversationIdFilter] = useState('');
  const [timeRange, setTimeRange] = useState('24h'); // Default to 24 hours

  const {
    data,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['dashboard', conversationIdFilter, timeRange],
    queryFn: () => getDashboardData(conversationIdFilter || undefined, timeRange),
    refetchInterval: DASHBOARD_REFRESH_INTERVAL,
    refetchOnWindowFocus: true,
    retry: 2,
    staleTime: 10000, // Consider data stale after 10 seconds
  });

  // Manual refetch with cache invalidation
  const handleRefetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['dashboard', conversationIdFilter, timeRange] });
    refetch();
  }, [queryClient, refetch, conversationIdFilter, timeRange]);

  return {
    data: data || null,
    isLoading,
    error: error instanceof Error ? error.message : null,
    refetch: handleRefetch,
    isRefetching,
    conversationIdFilter,
    setConversationIdFilter,
    timeRange,
    setTimeRange,
  };
};

export default useDashboard;
