/**
 * Custom hook for polling evaluation status
 * Provides real-time status updates during evaluation
 */

import { useEffect, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getEvaluationStatus } from '../services/api';
import { EvaluationStatus, EvaluationPhase } from '../services/types';
import { POLLING_CONFIG } from '../utils/constants';

interface UseStatusPollingReturn {
  status: EvaluationStatus | null;
  isPolling: boolean;
  error: string | null;
  stopPolling: () => void;
  startPolling: (jobId: string) => void;
}

/**
 * Hook for polling evaluation status with automatic stopping when completed
 */
export const useStatusPolling = (): UseStatusPollingReturn => {
  const [jobId, setJobId] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);

  // Query for fetching status
  const { data: status, error: queryError } = useQuery({
    queryKey: ['evaluation-status', jobId],
    queryFn: () => {
      if (!jobId) throw new Error('No job ID');
      return getEvaluationStatus(jobId);
    },
    enabled: isPolling && !!jobId,
    refetchInterval: (data) => {
      // Stop polling if completed or failed
      if (
        data?.phase === EvaluationPhase.COMPLETED ||
        data?.phase === EvaluationPhase.FAILED
      ) {
        return false;
      }
      
      // Stop polling after max attempts
      if (pollCount >= POLLING_CONFIG.MAX_ATTEMPTS) {
        return false;
      }
      
      return POLLING_CONFIG.INTERVAL;
    },
    refetchOnWindowFocus: false,
    retry: 3,
  });

  // Update poll count
  useEffect(() => {
    if (isPolling && status) {
      setPollCount((prev) => prev + 1);
    }
  }, [status, isPolling]);

  // Stop polling when completed or failed
  useEffect(() => {
    if (status) {
      if (
        status.phase === EvaluationPhase.COMPLETED ||
        status.phase === EvaluationPhase.FAILED
      ) {
        setIsPolling(false);
        setPollCount(0);
      }
    }
  }, [status]);

  // Handle errors
  useEffect(() => {
    if (queryError) {
      setError(queryError instanceof Error ? queryError.message : 'Status polling failed');
      setIsPolling(false);
    }
  }, [queryError]);

  // Stop polling after timeout
  useEffect(() => {
    if (pollCount >= POLLING_CONFIG.MAX_ATTEMPTS) {
      setError('Polling timeout reached');
      setIsPolling(false);
      setPollCount(0);
    }
  }, [pollCount]);

  // Start polling
  const startPolling = useCallback((newJobId: string) => {
    setJobId(newJobId);
    setIsPolling(true);
    setError(null);
    setPollCount(0);
  }, []);

  // Stop polling
  const stopPolling = useCallback(() => {
    setIsPolling(false);
    setPollCount(0);
  }, []);

  return {
    status: status || null,
    isPolling,
    error,
    stopPolling,
    startPolling,
  };
};

export default useStatusPolling;
