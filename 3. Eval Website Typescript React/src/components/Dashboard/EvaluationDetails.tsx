/**
 * Evaluation Details Component
 * Shows comprehensive evaluation details including reasoning for each metric
 */

import React, { useState } from 'react';
import {
  Card,
  Text,
  Button,
  Badge,
} from '@fluentui/react-components';
import {
  ChevronDown24Regular,
  ChevronUp24Regular,
  CheckmarkCircle24Filled,
  DismissCircle24Filled,
} from '@fluentui/react-icons';
import { getScoreColor } from '../../utils/formatters';
import styles from './Dashboard.module.css';

interface EvaluationDetailsProps {
  evaluation: any;
}

export const EvaluationDetails: React.FC<EvaluationDetailsProps> = ({ evaluation }) => {
  const [expanded, setExpanded] = useState(false);

  if (!evaluation) return null;

  return (
    <div className={styles.evaluationDetails}>
      <Button
        appearance="subtle"
        icon={expanded ? <ChevronUp24Regular /> : <ChevronDown24Regular />}
        onClick={() => setExpanded(!expanded)}
        size="small"
      >
        {expanded ? 'Hide Details' : 'Show Details'}
      </Button>

      {expanded && (
        <Card className={styles.detailsCard}>
          {/* Overall Assessment */}
          {evaluation.overallAssessment && (
            <div className={styles.detailSection}>
              <Text size={400} weight="semibold">Overall Assessment</Text>
              <Text size={300} className={styles.detailText}>
                {evaluation.overallAssessment}
              </Text>
            </div>
          )}

          {/* Evaluation Information */}
          <div className={styles.detailSection}>
            <Text size={400} weight="semibold">Evaluation Information</Text>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <Text size={200} className={styles.infoLabel}>Conversation ID:</Text>
                <Text size={300} font="monospace">{evaluation.conversationId}</Text>
              </div>
              <div className={styles.infoItem}>
                <Text size={200} className={styles.infoLabel}>Request ID:</Text>
                <Text size={300} font="monospace">{evaluation.requestId || evaluation.jobId}</Text>
              </div>
              <div className={styles.infoItem}>
                <Text size={200} className={styles.infoLabel}>Model:</Text>
                <Text size={300}>{evaluation.evaluationModel || 'Azure OpenAI'}</Text>
              </div>
              <div className={styles.infoItem}>
                <Text size={200} className={styles.infoLabel}>Tokens Used:</Text>
                <Text size={300}>{evaluation.tokensUsed || 'N/A'}</Text>
              </div>
              <div className={styles.infoItem}>
                <Text size={200} className={styles.infoLabel}>Source:</Text>
                <Text size={300}>{evaluation.evaluationSource || 'automation-runbook'}</Text>
              </div>
            </div>
          </div>

          {/* Metric Scores & Reasoning */}
          <div className={styles.detailSection}>
            <Text size={400} weight="semibold">Metric Scores & Reasoning</Text>
            
            {/* Helpfulness */}
            {evaluation.helpfulness_score !== undefined && (
              <div className={styles.metricDetail}>
                <div className={styles.metricHeader}>
                  <Text size={400} weight="semibold">Helpfulness</Text>
                  <div className={styles.metricScore}>
                    <Text 
                      size={400} 
                      weight="bold"
                      style={{ color: getScoreColor(evaluation.helpfulness_score || 0) }}
                    >
                      {(evaluation.helpfulness_score || 0).toFixed(1)}%
                    </Text>
                    <Badge
                      color={evaluation.helpfulness_passed ? 'success' : 'danger'}
                    >
                      {evaluation.helpfulness_passed ? 'Pass' : 'Fail'}
                    </Badge>
                  </div>
                </div>
                {evaluation.helpfulness_reasoning && (
                  <Text size={300} className={styles.reasoningText}>
                    {evaluation.helpfulness_reasoning}
                  </Text>
                )}
              </div>
            )}

            {/* Professionalism */}
            {evaluation.professionalism_score !== undefined && (
              <div className={styles.metricDetail}>
                <div className={styles.metricHeader}>
                  <Text size={400} weight="semibold">Professionalism</Text>
                  <div className={styles.metricScore}>
                    <Text 
                      size={400} 
                      weight="bold"
                      style={{ color: getScoreColor(evaluation.professionalism_score || 0) }}
                    >
                      {(evaluation.professionalism_score || 0).toFixed(1)}%
                    </Text>
                    <Badge
                      color={evaluation.professionalism_passed ? 'success' : 'danger'}
                    >
                      {evaluation.professionalism_passed ? 'Pass' : 'Fail'}
                    </Badge>
                  </div>
                </div>
                {evaluation.professionalism_reasoning && (
                  <Text size={300} className={styles.reasoningText}>
                    {evaluation.professionalism_reasoning}
                  </Text>
                )}
              </div>
            )}

            {/* Relevancy */}
            {evaluation.relevancy_score !== undefined && (
              <div className={styles.metricDetail}>
                <div className={styles.metricHeader}>
                  <Text size={400} weight="semibold">Relevancy</Text>
                  <div className={styles.metricScore}>
                    <Text 
                      size={400} 
                      weight="bold"
                      style={{ color: getScoreColor(evaluation.relevancy_score || 0) }}
                    >
                      {(evaluation.relevancy_score || 0).toFixed(1)}%
                    </Text>
                    <Badge
                      color={evaluation.relevancy_passed ? 'success' : 'danger'}
                    >
                      {evaluation.relevancy_passed ? 'Pass' : 'Fail'}
                    </Badge>
                  </div>
                </div>
                {evaluation.relevancy_reasoning && (
                  <Text size={300} className={styles.reasoningText}>
                    {evaluation.relevancy_reasoning}
                  </Text>
                )}
              </div>
            )}

            {/* Problem Resolution */}
            {evaluation.problem_resolution_score !== undefined && (
              <div className={styles.metricDetail}>
                <div className={styles.metricHeader}>
                  <Text size={400} weight="semibold">Problem Resolution</Text>
                  <div className={styles.metricScore}>
                    <Text 
                      size={400} 
                      weight="bold"
                      style={{ color: getScoreColor(evaluation.problem_resolution_score || 0) }}
                    >
                      {(evaluation.problem_resolution_score || 0).toFixed(1)}%
                    </Text>
                    <Badge
                      color={evaluation.problem_resolution_passed ? 'success' : 'danger'}
                    >
                      {evaluation.problem_resolution_passed ? 'Pass' : 'Fail'}
                    </Badge>
                  </div>
                </div>
                {evaluation.problem_resolution_reasoning && (
                  <Text size={300} className={styles.reasoningText}>
                    {evaluation.problem_resolution_reasoning}
                  </Text>
                )}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default EvaluationDetails;
