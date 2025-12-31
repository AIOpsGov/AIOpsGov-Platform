/**
 * Inventory Management Metrics Component
 */

import React from 'react';
import { Card, Text } from '@fluentui/react-components';
import { ConversationSession } from '../../../services/copilotTelemetryApi';
import { DashboardConfig } from '../../../config/dashboardConfigs';
import { StatCard } from '../../../../../shared/cards/StatCard';
import styles from './InventoryManagement.module.css';

interface InventoryManagementProps {
  data: ConversationSession[];
  config: DashboardConfig;
  timeRange: string;
}

export const InventoryManagement: React.FC<InventoryManagementProps> = ({ data, config, timeRange }) => {
  const total = data.length;
  const active = data.filter(d => d.status === 'active').length;
  const completed = data.filter(d => d.status === 'completed').length;
  const avgDuration = data.reduce((sum, d) => sum + (d.duration || 0), 0) / (data.length || 1);

  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <Text size={600} weight="semibold">Inventory Management Metrics</Text>
        <Text size={300} className={styles.timeRange}>{timeRange}</Text>
      </div>
      <div className={styles.statsGrid}>
        <StatCard label="Total Items" value={total} color={config.color} size="large" />
        <StatCard label="Active" value={active} color="#FFB900" size="medium" />
        <StatCard label="Completed" value={completed} color="#107C10" size="medium" />
        <StatCard label="Avg Duration" value={`${avgDuration.toFixed(1)}m`} color={config.color} size="medium" />
      </div>
      <div className={styles.chartPlaceholder}>
        <Text size={400} className={styles.placeholderText}>📊 Trend chart will be displayed here</Text>
        <Text size={300} className={styles.placeholderSubtext}>Integrate with your preferred charting library</Text>
      </div>
    </Card>
  );
};
