/**
 * Custom hook for managing evaluation lifecycle
 * Handles triggering evaluations and monitoring their status
 */

import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { triggerEvaluation, getEvaluationResult } from '../../core/services/api';
import {
  EvaluationRequest,
  EvaluationResponse,
  EvaluationResult,
  EvaluationPhase,
} from '../../core/services/types';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../utils/constants';

interface UseEvaluationReturn {
  startEvaluation: (conversationId: string) => Promise<void>;
  isSubmitting: boolean;
  currentJobId: string | null;
  error: string | null;
  result: EvaluationResult | null;
  resetEvaluation: () => void;
}

/**
 * Hook for managing evaluation workflow
 */
export const useEvaluation = (): UseEvaluationReturn => {
  const queryClient = useQueryClient();
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Mutation for triggering evaluation
  const triggerMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      const request: EvaluationRequest = {
        conversationId,
        userId: 'current-user', // Replace with actual user ID
        timestamp: new Date().toISOString(),
      };
      return triggerEvaluation(request);
    },
    onSuccess: (response: EvaluationResponse) => {
      setCurrentJobId(response.jobId);
      setError(null);
      // Invalidate dashboard data to refresh
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (err: any) => {
      setError(err.message || ERROR_MESSAGES.WEBHOOK_FAILED);
      setCurrentJobId(null);
    },
  });

  // Query for fetching evaluation result (only when job is completed)
  const { data: result } = useQuery({
    queryKey: ['evaluation-result', currentJobId],
    queryFn: () => getEvaluationResult(currentJobId!),
    enabled: !!currentJobId,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  // Start evaluation
  const startEvaluation = useCallback(
    async (conversationId: string) => {
      setError(null);
      await triggerMutation.mutateAsync(conversationId);
    },
    [triggerMutation]
  );

  // Reset evaluation state
  const resetEvaluation = useCallback(() => {
    setCurrentJobId(null);
    setError(null);
    triggerMutation.reset();
  }, [triggerMutation]);

  return {
    startEvaluation,
    isSubmitting: triggerMutation.isPending,
    currentJobId,
    error,
    result: result || null,
    resetEvaluation,
  };
};

export default useEvaluation;
