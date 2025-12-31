/**
 * Copilot KPI Grid Component
 * Displays key performance indicators in a grid layout
 */

import React from 'react';
import { Card, Text } from '@fluentui/react-components';
import { DashboardConfig } from '../../../../core/config/dashboardConfigs';
import { AgentPerformance, AnomalyAlert } from '../../../../core/services/copilotTelemetryApi';
import styles from './CopilotKpiGrid.module.css';

interface CopilotKpiGridProps {
  config: DashboardConfig;
  performance: AgentPerformance;
  anomalies: AnomalyAlert[];
}

export const CopilotKpiGrid: React.FC<CopilotKpiGridProps> = ({
  config,
  performance,
  anomalies,
}) => {
  const formatValue = (value: number, format: string): string => {
    switch (format) {
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'duration':
        return value < 60 ? `${value.toFixed(0)}s` : `${(value / 60).toFixed(1)}m`;
      case 'currency':
        return `$${value.toLocaleString()}`;
      default:
        return value.toLocaleString();
    }
  };

  const getKpiValue = (metricName: string): number => {
    // Map metric names to actual performance data
    const metricMap: { [key: string]: number } = {
      totalConversations: performance.totalConversations,
      activeConversations: performance.activeConversations,
      completedConversations: performance.completedConversations,
      avgMessagesPerConversation: performance.avgMessagesPerConversation,
      avgConversationDuration: performance.avgConversationDuration,
    };
    
    return metricMap[metricName] || 0;
  };

  return (
    <div className={styles.kpiGrid}>
      {config.kpis.map((kpi) => {
        const value = getKpiValue(kpi.metric);
        const hasTarget = kpi.target !== undefined;
        const meetsTarget = hasTarget ? value >= kpi.target! : true;
        
        return (
          <Card key={kpi.id} className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <Text size={300} className={styles.kpiLabel}>
                {kpi.name}
              </Text>
            </div>
            <div className={styles.kpiBody}>
              <Text size={800} weight="bold" className={styles.kpiValue} style={{ 
                color: hasTarget ? (meetsTarget ? '#107C10' : '#D13438') : config.color 
              }}>
                {formatValue(value, kpi.format)}
              </Text>
              {hasTarget && (
                <Text size={200} className={styles.kpiTarget}>
                  Target: {formatValue(kpi.target!, kpi.format)}
                </Text>
              )}
            </div>
            <Text size={200} className={styles.kpiDescription}>
              {kpi.description}
            </Text>
          </Card>
        );
      })}
    </div>
  );
};
