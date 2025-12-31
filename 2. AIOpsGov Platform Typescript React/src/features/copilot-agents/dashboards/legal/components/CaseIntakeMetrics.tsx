/**
 * Case Intake Metrics Component
 * Displays case intake statistics and trends
 */

import React from 'react';
import { Card, Text } from '@fluentui/react-components';
import { ConversationSession } from '../../../services/copilotTelemetryApi';
import { DashboardConfig } from '../../../config/dashboardConfigs';
import { StatCard } from '../../../../../shared/cards/StatCard';
import styles from './CaseIntakeMetrics.module.css';

interface CaseIntakeMetricsProps {
  data: ConversationSession[];
  config: DashboardConfig;
  timeRange: string;
}

export const CaseIntakeMetrics: React.FC<CaseIntakeMetricsProps> = ({
  data,
  config,
  timeRange,
}) => {
  const totalCases = data.length;
  const completedCases = data.filter(d => d.status === 'completed').length;
  const activeCases = data.filter(d => d.status === 'active').length;
  const avgDuration = data.reduce((sum, d) => sum + (d.duration || 0), 0) / (data.length || 1);

  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <Text size={600} weight="semibold">Case Intake Analysis</Text>
        <Text size={300} className={styles.timeRange}>{timeRange}</Text>
      </div>

      <div className={styles.statsGrid}>
        <StatCard
          label="Total Cases"
          value={totalCases}
          color={config.color}
          size="large"
        />
        <StatCard
          label="Completed"
          value={completedCases}
          color="#107C10"
          size="medium"
        />
        <StatCard
          label="Active"
          value={activeCases}
          color="#FFB900"
          size="medium"
        />
        <StatCard
          label="Avg Duration"
          value={`${avgDuration.toFixed(1)}m`}
          color={config.color}
          size="medium"
        />
      </div>

      <div className={styles.chartPlaceholder}>
        <Text size={400} className={styles.placeholderText}>
          📊 Case intake trend chart will be displayed here
        </Text>
        <Text size={300} className={styles.placeholderSubtext}>
          Integrate with your preferred charting library (Recharts, Chart.js, etc.)
        </Text>
      </div>
    </Card>
  );
};
