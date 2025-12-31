/**
 * Custom hook for managing dashboard data
 * Handles fetching and refreshing dashboard statistics
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getDashboardData } from '../../core/services/api';
import { DashboardData } from '../../core/services/types';
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
  customDays: string;
  setCustomDays: (days: string) => void;
}

/**
 * Hook for fetching and managing dashboard data
 */
export const useDashboard = (): UseDashboardReturn => {
  const queryClient = useQueryClient();
  const [conversationIdFilter, setConversationIdFilter] = useState('');
  const [timeRange, setTimeRange] = useState('90d'); // Default to 90 days
  const [customDays, setCustomDays] = useState('');

  // Compute effective time range - use custom days if provided, otherwise use preset
  const effectiveTimeRange = customDays && customDays.trim() !== '' ? `${customDays}d` : timeRange;

  const {
    data,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['dashboard', conversationIdFilter, effectiveTimeRange],
    queryFn: () => getDashboardData(conversationIdFilter || undefined, effectiveTimeRange),
    refetchInterval: DASHBOARD_REFRESH_INTERVAL,
    refetchOnWindowFocus: true,
    retry: 2,
    staleTime: 10000, // Consider data stale after 10 seconds
  });

  // Manual refetch with cache invalidation
  const handleRefetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['dashboard', conversationIdFilter, effectiveTimeRange] });
    refetch();
  }, [queryClient, refetch, conversationIdFilter, effectiveTimeRange]);

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
    customDays,
    setCustomDays,
  };
};

export default useDashboard;
