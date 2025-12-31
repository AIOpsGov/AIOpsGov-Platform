/**
 * Appointment Scheduling Component
 * Displays appointment booking statistics and trends
 */

import React from 'react';
import { Card, Text } from '@fluentui/react-components';
import { ConversationSession } from '../../../services/copilotTelemetryApi';
import { DashboardConfig } from '../../../config/dashboardConfigs';
import { StatCard } from '../../../../../shared/cards/StatCard';
import styles from './AppointmentScheduling.module.css';

interface AppointmentSchedulingProps {
  data: ConversationSession[];
  config: DashboardConfig;
  timeRange: string;
}

export const AppointmentScheduling: React.FC<AppointmentSchedulingProps> = ({
  data,
  config,
  timeRange,
}) => {
  const totalAppointments = data.length;
  const scheduledToday = data.filter(d => {
    const today = new Date().toDateString();
    return new Date(d.startTime).toDateString() === today;
  }).length;
  const completed = data.filter(d => d.status === 'completed').length;
  const avgWaitTime = data.reduce((sum, d) => sum + (d.duration || 0), 0) / (data.length || 1);

  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <Text size={600} weight="semibold">Appointment Scheduling Analysis</Text>
        <Text size={300} className={styles.timeRange}>{timeRange}</Text>
      </div>

      <div className={styles.statsGrid}>
        <StatCard
          label="Total Bookings"
          value={totalAppointments}
          color={config.color}
          size="large"
        />
        <StatCard
          label="Today"
          value={scheduledToday}
          color="#FFB900"
          size="medium"
        />
        <StatCard
          label="Completed"
          value={completed}
          color="#107C10"
          size="medium"
        />
        <StatCard
          label="Avg Wait Time"
          value={`${avgWaitTime.toFixed(1)}m`}
          color={config.color}
          size="medium"
        />
      </div>

      <div className={styles.chartPlaceholder}>
        <Text size={400} className={styles.placeholderText}>
          📊 Appointment booking trend chart will be displayed here
        </Text>
        <Text size={300} className={styles.placeholderSubtext}>
          Integrate with your preferred charting library (Recharts, Chart.js, etc.)
        </Text>
      </div>
    </Card>
  );
};
