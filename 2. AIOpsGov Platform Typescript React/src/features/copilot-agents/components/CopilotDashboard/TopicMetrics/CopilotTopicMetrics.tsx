/**
 * Copilot Topic Metrics Component
 * Displays topic performance metrics
 */

import React from 'react';
import { Card, Text } from '@fluentui/react-components';
import { DashboardConfig } from '../../../../core/config/dashboardConfigs';
import { TopicMetrics } from '../../../../core/services/copilotTelemetryApi';
import styles from './CopilotTopicMetrics.module.css';

interface CopilotTopicMetricsProps {
  topics: TopicMetrics[];
  config: DashboardConfig;
}

export const CopilotTopicMetrics: React.FC<CopilotTopicMetricsProps> = ({
  topics,
  config,
}) => {
  return (
    <Card className={styles.topicMetrics}>
      <div className={styles.header}>
        <Text size={600} weight="semibold">Topic Performance</Text>
        <Text size={300} className={styles.count}>{topics.length} topics</Text>
      </div>
      <div className={styles.listContainer}>
        {topics.slice(0, 10).map((topic) => (
          <div key={topic.topicId} className={styles.topicItem}>
            <div className={styles.topicHeader}>
              <Text size={400} weight="semibold">{topic.topicName}</Text>
              <Text size={300} className={styles.successRate} style={{
                color: topic.successRate >= 80 ? '#107C10' : topic.successRate >= 60 ? '#FFB900' : '#D13438'
              }}>
                {topic.successRate.toFixed(1)}%
              </Text>
            </div>
            <div className={styles.topicStats}>
              <div className={styles.stat}>
                <Text size={200} className={styles.statLabel}>Triggers</Text>
                <Text size={400} weight="semibold">{topic.triggerCount}</Text>
              </div>
              <div className={styles.stat}>
                <Text size={200} className={styles.statLabel}>Completed</Text>
                <Text size={400} weight="semibold">{topic.completionCount}</Text>
              </div>
              <div className={styles.stat}>
                <Text size={200} className={styles.statLabel}>Avg Duration</Text>
                <Text size={400} weight="semibold">{topic.avgDuration.toFixed(1)}s</Text>
              </div>
            </div>
          </div>
        ))}
        {topics.length === 0 && (
          <div className={styles.empty}>
            <Text size={400}>No topic data available</Text>
          </div>
        )}
      </div>
    </Card>
  );
};
