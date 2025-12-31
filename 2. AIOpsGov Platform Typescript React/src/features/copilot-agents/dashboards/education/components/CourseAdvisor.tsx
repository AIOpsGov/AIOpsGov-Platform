/**
 * Course Advisory System Component
 */

import React from 'react';
import { Card, Text } from '@fluentui/react-components';
import { TopicMetrics } from '../../../services/copilotTelemetryApi';
import { DashboardConfig } from '../../../config/dashboardConfigs';
import styles from './CourseAdvisor.module.css';

interface CourseAdvisorProps {
  data: TopicMetrics[];
  config: DashboardConfig;
  timeRange: string;
}

export const CourseAdvisor: React.FC<CourseAdvisorProps> = ({ data, config, timeRange }) => {
  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <Text size={600} weight="semibold">Course Advisory System</Text>
        <Text size={300} className={styles.timeRange}>{timeRange}</Text>
      </div>
      <div className={styles.timeline}>
        {data.slice(0, 10).map((topic) => (
          <div key={topic.topicId} className={styles.timelineItem}>
            <div className={styles.timelineDot} style={{ backgroundColor: config.color }} />
            <div className={styles.timelineContent}>
              <div className={styles.timelineHeader}>
                <Text size={400} weight="semibold">{topic.topicName}</Text>
                <Text size={300} className={styles.successRate}>{topic.successRate.toFixed(1)}% success</Text>
              </div>
              <div className={styles.timelineStats}>
                <Text size={300}>Processed: {topic.triggerCount}</Text>
                <Text size={300}>Completed: {topic.completionCount}</Text>
                <Text size={300}>Avg: {topic.avgDuration.toFixed(1)}s</Text>
              </div>
            </div>
          </div>
        ))}
        {data.length === 0 && <div className={styles.empty}><Text size={400}>No data available</Text></div>}
      </div>
    </Card>
  );
};
