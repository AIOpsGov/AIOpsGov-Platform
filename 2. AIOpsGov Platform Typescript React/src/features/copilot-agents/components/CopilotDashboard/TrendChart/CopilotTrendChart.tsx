/**
 * Copilot Trend Chart Component
 * Displays trend visualization (placeholder for chart library)
 */

import React from 'react';
import { Card, Text } from '@fluentui/react-components';
import { AgentPerformance } from '../../../../core/services/copilotTelemetryApi';
import styles from './CopilotTrendChart.module.css';

interface CopilotTrendChartProps {
  data: AgentPerformance;
  timeRange: string;
}

export const CopilotTrendChart: React.FC<CopilotTrendChartProps> = ({
  data,
  timeRange,
}) => {
  return (
    <Card className={styles.trendChart}>
      <div className={styles.header}>
        <Text size={600} weight="semibold">Conversation Trends</Text>
        <Text size={300} className={styles.timeRange}>{timeRange}</Text>
      </div>
      <div className={styles.chartContainer}>
        <div className={styles.placeholder}>
          <Text size={500} className={styles.placeholderText}>
            Chart visualization placeholder
          </Text>
          <Text size={300} className={styles.placeholderSubtext}>
            Integrate with Recharts, Chart.js, or other charting library
          </Text>
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <Text size={800} weight="bold" style={{ color: '#0078D4' }}>
                {data.totalConversations}
              </Text>
              <Text size={300}>Total Conversations</Text>
            </div>
            <div className={styles.statItem}>
              <Text size={800} weight="bold" style={{ color: '#107C10' }}>
                {data.avgMessagesPerConversation.toFixed(1)}
              </Text>
              <Text size={300}>Avg Messages/Conv</Text>
            </div>
            <div className={styles.statItem}>
              <Text size={800} weight="bold" style={{ color: '#FFB900' }}>
                {data.avgConversationDuration.toFixed(1)}m
              </Text>
              <Text size={300}>Avg Duration</Text>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
