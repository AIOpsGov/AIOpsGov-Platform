/**
 * Project Inquiry Metrics Component
 * Displays project inquiry statistics and trends
 */

import React from 'react';
import { Card, Text } from '@fluentui/react-components';
import { ConversationSession } from '../../../services/copilotTelemetryApi';
import { DashboardConfig } from '../../../config/dashboardConfigs';
import { StatCard } from '../../../../../shared/cards/StatCard';
import styles from './ProjectInquiryMetrics.module.css';

interface ProjectInquiryMetricsProps {
  data: ConversationSession[];
  config: DashboardConfig;
  timeRange: string;
}

export const ProjectInquiryMetrics: React.FC<ProjectInquiryMetricsProps> = ({
  data,
  config,
  timeRange,
}) => {
  const totalProjects = data.length;
  const activeProjects = data.filter(d => d.status === 'active').length;
  const completedProjects = data.filter(d => d.status === 'completed').length;
  const avgDuration = data.reduce((sum, d) => sum + (d.duration || 0), 0) / (data.length || 1);

  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <Text size={600} weight="semibold">Project Inquiry Analysis</Text>
        <Text size={300} className={styles.timeRange}>{timeRange}</Text>
      </div>

      <div className={styles.statsGrid}>
        <StatCard
          label="Total Inquiries"
          value={totalProjects}
          color={config.color}
          size="large"
        />
        <StatCard
          label="Active Projects"
          value={activeProjects}
          color="#FFB900"
          size="medium"
        />
        <StatCard
          label="Completed"
          value={completedProjects}
          color="#107C10"
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
          📊 Project inquiry trend chart will be displayed here
        </Text>
        <Text size={300} className={styles.placeholderSubtext}>
          Integrate with your preferred charting library (Recharts, Chart.js, etc.)
        </Text>
      </div>
    </Card>
  );
};
