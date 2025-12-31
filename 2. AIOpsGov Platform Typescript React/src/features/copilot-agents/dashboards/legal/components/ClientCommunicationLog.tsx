/**
 * Client Communication Log Component
 * Displays recent client communications and conversations
 */

import React from 'react';
import { Card, Text, Badge } from '@fluentui/react-components';
import { ConversationSession } from '../../../services/copilotTelemetryApi';
import { DashboardConfig } from '../../../config/dashboardConfigs';
import styles from './ClientCommunicationLog.module.css';

interface ClientCommunicationLogProps {
  conversations: ConversationSession[];
  config: DashboardConfig;
}

export const ClientCommunicationLog: React.FC<ClientCommunicationLogProps> = ({
  conversations,
  config,
}) => {
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const formatDuration = (duration?: number): string => {
    if (!duration) return 'N/A';
    return duration < 60 ? `${duration.toFixed(0)}s` : `${(duration / 60).toFixed(1)}m`;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'warning', text: 'Active' },
      completed: { color: 'success', text: 'Completed' },
      abandoned: { color: 'danger', text: 'Abandoned' },
    };
    const statusInfo = statusConfig[status as keyof typeof statusConfig] || { color: 'informative', text: status };
    return <Badge appearance="filled" color={statusInfo.color as any}>{statusInfo.text}</Badge>;
  };

  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <Text size={600} weight="semibold">Client Communication Log</Text>
        <Text size={300} className={styles.count}>{conversations.length} conversations</Text>
      </div>

      <div className={styles.logContainer}>
        {conversations.slice(0, 15).map((conversation) => (
          <div key={conversation.conversationId} className={styles.logItem}>
            <div className={styles.logHeader}>
              <div className={styles.conversationId}>
                <Text size={300} className={styles.label}>Case ID:</Text>
                <Text size={400} weight="semibold">{conversation.conversationId.substring(0, 12)}...</Text>
              </div>
              {getStatusBadge(conversation.status)}
            </div>
            
            <div className={styles.logDetails}>
              <div className={styles.detailItem}>
                <Text size={200} className={styles.detailLabel}>Channel:</Text>
                <Text size={300}>{conversation.channelId}</Text>
              </div>
              <div className={styles.detailItem}>
                <Text size={200} className={styles.detailLabel}>Messages:</Text>
                <Text size={300}>{conversation.messageCount}</Text>
              </div>
              <div className={styles.detailItem}>
                <Text size={200} className={styles.detailLabel}>Duration:</Text>
                <Text size={300}>{formatDuration(conversation.duration)}</Text>
              </div>
            </div>

            <Text size={200} className={styles.timestamp}>
              {formatTimestamp(conversation.startTime)}
            </Text>
          </div>
        ))}

        {conversations.length === 0 && (
          <div className={styles.empty}>
            <Text size={400}>No client communications found</Text>
          </div>
        )}
      </div>
    </Card>
  );
};
