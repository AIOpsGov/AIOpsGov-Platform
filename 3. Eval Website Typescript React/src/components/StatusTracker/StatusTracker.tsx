/**
 * Status Tracker Component
 * Displays real-time progress and status updates during evaluation
 */

import React from 'react';
import {
  Card,
  Text,
  ProgressBar,
  Badge,
  Spinner,
} from '@fluentui/react-components';
import {
  CheckmarkCircle24Filled,
  Clock24Regular,
  ErrorCircle24Filled,
} from '@fluentui/react-icons';
import { EvaluationStatus, EvaluationPhase } from '../../services/types';
import {
  PHASE_DISPLAY_NAMES,
  PHASE_PROGRESS,
} from '../../utils/constants';
import {
  formatRelativeTime,
  formatDuration,
  estimateTimeRemaining,
} from '../../utils/formatters';
import styles from './StatusTracker.module.css';

interface StatusTrackerProps {
  status: EvaluationStatus | null;
  isPolling: boolean;
}

/**
 * Component for displaying real-time evaluation status
 */
export const StatusTracker: React.FC<StatusTrackerProps> = ({
  status,
  isPolling,
}) => {
  if (!status && !isPolling) {
    return null;
  }

  const currentProgress = status?.progress || PHASE_PROGRESS[status?.phase || 'idle'] || 0;
  const isCompleted = status?.phase === EvaluationPhase.COMPLETED;
  const isFailed = status?.phase === EvaluationPhase.FAILED;

  // Estimate time remaining
  const timeRemaining = status?.startTime && status?.progress > 0
    ? estimateTimeRemaining(status.startTime, status.progress)
    : 'Calculating...';

  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <Text size={500} weight="semibold">
          Evaluation Progress
        </Text>
        {status?.jobId && (
          <Text size={200} className={styles.jobId}>
            Job ID: {status.jobId}
          </Text>
        )}
      </div>

      {/* Progress Bar */}
      <div className={styles.progressSection}>
        <ProgressBar
          value={currentProgress / 100}
          color={
            isCompleted ? 'success' :
            isFailed ? 'error' :
            'brand'
          }
          thickness="large"
          className={styles.progressBar}
        />
        <Text size={300} weight="semibold" className={styles.progressText}>
          {currentProgress.toFixed(0)}%
        </Text>
      </div>

      {/* Current Phase */}
      <div className={styles.phaseSection}>
        <div className={styles.phaseInfo}>
          <Badge
            appearance={
              isCompleted ? 'success' :
              isFailed ? 'danger' :
              'informative'
            }
            icon={
              isCompleted ? <CheckmarkCircle24Filled /> :
              isFailed ? <ErrorCircle24Filled /> :
              <Spinner size="extra-small" />
            }
            size="large"
          >
            {status?.phase ? PHASE_DISPLAY_NAMES[status.phase] : 'Processing'}
          </Badge>
          
          {status?.currentStep && (
            <Text size={300} className={styles.stepText}>
              {status.currentStep}
            </Text>
          )}
        </div>

        {/* Time Information */}
        {!isCompleted && !isFailed && (
          <div className={styles.timeInfo}>
            <div className={styles.timeItem}>
              <Clock24Regular className={styles.timeIcon} />
              <div>
                <Text size={200} className={styles.timeLabel}>
                  Time Remaining
                </Text>
                <Text size={300} weight="semibold">
                  {timeRemaining}
                </Text>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Phase Steps */}
      <div className={styles.stepsSection}>
        <Text size={300} weight="semibold" className={styles.stepsTitle}>
          Evaluation Phases
        </Text>
        <div className={styles.steps}>
          {[
            EvaluationPhase.SUBMITTING,
            EvaluationPhase.QUEUED,
            EvaluationPhase.PROCESSING,
            EvaluationPhase.ANALYZING,
            EvaluationPhase.COMPLETED,
          ].map((phase, index) => {
            const currentPhaseIndex = Object.values(EvaluationPhase).indexOf(
              status?.phase as EvaluationPhase
            );
            const thisPhaseIndex = Object.values(EvaluationPhase).indexOf(phase);
            
            const isCurrentPhase = status?.phase === phase;
            const isPastPhase = currentPhaseIndex > thisPhaseIndex;
            const isFuturePhase = currentPhaseIndex < thisPhaseIndex;

            return (
              <div
                key={phase}
                className={`${styles.step} ${
                  isCurrentPhase ? styles.stepActive :
                  isPastPhase ? styles.stepCompleted :
                  styles.stepPending
                }`}
              >
                <div className={styles.stepIndicator}>
                  {isPastPhase && (
                    <CheckmarkCircle24Filled className={styles.stepIconCompleted} />
                  )}
                  {isCurrentPhase && (
                    <Spinner size="extra-small" />
                  )}
                  {isFuturePhase && (
                    <div className={styles.stepIconPending} />
                  )}
                </div>
                <div className={styles.stepContent}>
                  <Text size={300} weight={isCurrentPhase ? 'semibold' : 'regular'}>
                    {PHASE_DISPLAY_NAMES[phase]}
                  </Text>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error Display */}
      {status?.error && (
        <div className={styles.errorSection}>
          <ErrorCircle24Filled className={styles.errorIcon} />
          <div>
            <Text size={300} weight="semibold" className={styles.errorTitle}>
              Error: {status.error.code}
            </Text>
            <Text size={200} className={styles.errorMessage}>
              {status.error.message}
            </Text>
            {status.error.details && (
              <Text size={200} className={styles.errorDetails}>
                {status.error.details}
              </Text>
            )}
          </div>
        </div>
      )}

      {/* Metadata */}
      {status?.startTime && (
        <div className={styles.metadata}>
          <Text size={200} className={styles.metadataText}>
            Started: {formatRelativeTime(status.startTime)}
          </Text>
          {status.estimatedCompletion && !isCompleted && (
            <Text size={200} className={styles.metadataText}>
              Est. Completion: {formatRelativeTime(status.estimatedCompletion)}
            </Text>
          )}
        </div>
      )}
    </Card>
  );
};

export default StatusTracker;
