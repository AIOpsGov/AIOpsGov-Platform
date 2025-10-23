/**
 * Conversation Evaluator Component
 * Main form for triggering conversation evaluations
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Input,
  Button,
  Text,
  Badge,
  Spinner,
  Field,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
} from '@fluentui/react-components';
import {
  PlayCircle24Regular,
  CheckmarkCircle24Regular,
  DismissCircle24Regular,
  ArrowReset24Regular,
} from '@fluentui/react-icons';
import { useEvaluation } from '../../hooks/useEvaluation';
import { useStatusPolling } from '../../hooks/useStatusPolling';
import { VALIDATION, PHASE_DISPLAY_NAMES } from '../../utils/constants';
import { sanitizeConversationId } from '../../utils/formatters';
import styles from './ConversationEvaluator.module.css';

/**
 * Main evaluator component with form and status display
 */
export const ConversationEvaluator: React.FC = () => {
  const [conversationId, setConversationId] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const {
    startEvaluation,
    isSubmitting,
    currentJobId,
    error: evaluationError,
    result,
    resetEvaluation,
  } = useEvaluation();

  const {
    status,
    isPolling,
    error: statusError,
    startPolling,
    stopPolling,
  } = useStatusPolling();

  // Start polling when job is submitted
  useEffect(() => {
    if (currentJobId && !isPolling) {
      startPolling(currentJobId);
    }
  }, [currentJobId, isPolling, startPolling]);

  // Validate conversation ID
  const validateConversationId = (id: string): boolean => {
    if (id.length < VALIDATION.CONVERSATION_ID_MIN_LENGTH) {
      setValidationError(`Conversation ID must be at least ${VALIDATION.CONVERSATION_ID_MIN_LENGTH} characters`);
      return false;
    }

    if (id.length > VALIDATION.CONVERSATION_ID_MAX_LENGTH) {
      setValidationError(`Conversation ID must not exceed ${VALIDATION.CONVERSATION_ID_MAX_LENGTH} characters`);
      return false;
    }

    if (!VALIDATION.CONVERSATION_ID_PATTERN.test(id)) {
      setValidationError('Conversation ID can only contain letters, numbers, hyphens, and underscores');
      return false;
    }

    setValidationError(null);
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const sanitized = sanitizeConversationId(conversationId);
    
    if (!validateConversationId(sanitized)) {
      return;
    }

    try {
      await startEvaluation(sanitized);
    } catch (err) {
      console.error('Failed to start evaluation:', err);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConversationId(value);
    if (validationError) {
      setValidationError(null);
    }
  };

  // Handle reset
  const handleReset = () => {
    setConversationId('');
    setValidationError(null);
    resetEvaluation();
    stopPolling();
  };

  // Get current phase display
  const getCurrentPhase = () => {
    if (result) return 'completed';
    if (status) return status.phase;
    if (isSubmitting) return 'submitting';
    return 'idle';
  };

  const currentPhase = getCurrentPhase();
  const isCompleted = currentPhase === 'completed';
  const isFailed = currentPhase === 'failed' || evaluationError || statusError;

  return (
    <Card className={styles.card}>
      <div className={styles.cardHeader}>
        <Text size={500} weight="semibold">
          Run Evaluation
        </Text>
        <Badge
          appearance={
            isCompleted ? 'success' :
            isFailed ? 'danger' :
            isPolling ? 'informative' :
            'subtle'
          }
          icon={
            isCompleted ? <CheckmarkCircle24Regular /> :
            isFailed ? <DismissCircle24Regular /> :
            isPolling ? <Spinner size="tiny" /> :
            undefined
          }
        >
          {PHASE_DISPLAY_NAMES[currentPhase] || 'Ready'}
        </Badge>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <Field
          label="Conversation ID"
          required
          validationState={validationError ? 'error' : 'none'}
          validationMessage={validationError || undefined}
          hint="Enter the unique identifier for the conversation to evaluate"
        >
          <Input
            value={conversationId}
            onChange={handleInputChange}
            placeholder="e.g., conv-2024-abc123"
            disabled={isSubmitting || isPolling}
            size="large"
            className={styles.input}
          />
        </Field>

        <div className={styles.actions}>
          <Button
            appearance="primary"
            icon={<PlayCircle24Regular />}
            type="submit"
            disabled={!conversationId || isSubmitting || isPolling}
            size="large"
          >
            {isSubmitting ? 'Starting Evaluation...' : 'Run Evaluation'}
          </Button>

          {(isPolling || isCompleted || isFailed) && (
            <Button
              appearance="secondary"
              icon={<ArrowReset24Regular />}
              onClick={handleReset}
              size="large"
            >
              Reset
            </Button>
          )}
        </div>
      </form>

      {/* Success Message */}
      {isCompleted && result && (
        <MessageBar intent="success" className={styles.message}>
          <MessageBarBody>
            <MessageBarTitle>Evaluation Completed!</MessageBarTitle>
            Overall Score: <strong>{result.overallScore.toFixed(1)}%</strong>
            {' - '}
            Status: <strong>{result.passed ? 'Passed' : 'Failed'}</strong>
          </MessageBarBody>
        </MessageBar>
      )}

      {/* Error Message */}
      {isFailed && (
        <MessageBar intent="error" className={styles.message}>
          <MessageBarBody>
            <MessageBarTitle>Evaluation Failed</MessageBarTitle>
            {evaluationError || statusError || 'An unexpected error occurred'}
          </MessageBarBody>
        </MessageBar>
      )}

      {/* Info Section */}
      <div className={styles.info}>
        <Text size={200} className={styles.infoText}>
          The evaluation process typically takes 2-5 minutes to complete.
          Status updates will appear automatically during the process.
        </Text>
      </div>
    </Card>
  );
};

export default ConversationEvaluator;
