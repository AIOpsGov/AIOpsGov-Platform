/**
 * Performance Tracking System Component
 */

import React from 'react';
import { Card, Text, Badge } from '@fluentui/react-components';
import { ConversationSession } from '../../../services/copilotTelemetryApi';
import { DashboardConfig } from '../../../config/dashboardConfigs';
import styles from './PerformanceTracking.module.css';

interface PerformanceTrackingProps {
  conversations: ConversationSession[];
  config: DashboardConfig;
}

export const PerformanceTracking: React.FC<PerformanceTrackingProps> = ({ conversations, config }) => {
  const formatTimestamp = (timestamp: string): string => new Date(timestamp).toLocaleString();
  const formatDuration = (duration?: number): string => {
    if (!duration) return 'N/A';
    return duration < 60 ? `${duration.toFixed(0)}s` : `${(duration / 60).toFixed(1)}m`;
  };
  const getStatusBadge = (status: string) => {
    const configs = { active: { color: 'warning', text: 'Active' }, completed: { color: 'success', text: 'Completed' }, abandoned: { color: 'danger', text: 'Abandoned' } };
    const info = configs[status as keyof typeof configs] || { color: 'informative', text: status };
    return <Badge appearance="filled" color={info.color as any}>{info.text}</Badge>;
  };

  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <Text size={600} weight="semibold">Performance Tracking System</Text>
        <Text size={300} className={styles.count}>{conversations.length} items</Text>
      </div>
      <div className={styles.logContainer}>
        {conversations.slice(0, 15).map((conv) => (
          <div key={conv.conversationId} className={styles.logItem}>
            <div className={styles.logHeader}>
              <div className={styles.conversationId}>
                <Text size={300} className={styles.label}>Employee ID:</Text>
                <Text size={400} weight="semibold">{conv.conversationId.substring(0, 12)}...</Text>
              </div>
              {getStatusBadge(conv.status)}
            </div>
            <div className={styles.logDetails}>
              <div className={styles.detailItem}><Text size={200} className={styles.detailLabel}>Channel:</Text><Text size={300}>{conv.channelId}</Text></div>
              <div className={styles.detailItem}><Text size={200} className={styles.detailLabel}>Messages:</Text><Text size={300}>{conv.messageCount}</Text></div>
              <div className={styles.detailItem}><Text size={200} className={styles.detailLabel}>Duration:</Text><Text size={300}>{formatDuration(conv.duration)}</Text></div>
            </div>
            <Text size={200} className={styles.timestamp}>{formatTimestamp(conv.startTime)}</Text>
          </div>
        ))}
        {conversations.length === 0 && <div className={styles.empty}><Text size={400}>No data found</Text></div>}
      </div>
    </Card>
  );
};
