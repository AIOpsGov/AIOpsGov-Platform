/**
 * Patient Triage System Component
 * Displays patient triage and prioritization
 */

import React from 'react';
import { Card, Text, Badge } from '@fluentui/react-components';
import { ConversationSession } from '../../../services/copilotTelemetryApi';
import { DashboardConfig } from '../../../config/dashboardConfigs';
import styles from './PatientTriageSystem.module.css';

interface PatientTriageSystemProps {
  conversations: ConversationSession[];
  config: DashboardConfig;
}

export const PatientTriageSystem: React.FC<PatientTriageSystemProps> = ({
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
      active: { color: 'warning', text: 'Waiting' },
      completed: { color: 'success', text: 'Seen' },
      abandoned: { color: 'danger', text: 'Urgent' },
    };
    const statusInfo = statusConfig[status as keyof typeof statusConfig] || { color: 'informative', text: status };
    return <Badge appearance="filled" color={statusInfo.color as any}>{statusInfo.text}</Badge>;
  };

  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <Text size={600} weight="semibold">Patient Triage Log</Text>
        <Text size={300} className={styles.count}>{conversations.length} patients</Text>
      </div>

      <div className={styles.logContainer}>
        {conversations.slice(0, 15).map((conversation) => (
          <div key={conversation.conversationId} className={styles.logItem}>
            <div className={styles.logHeader}>
              <div className={styles.conversationId}>
                <Text size={300} className={styles.label}>Patient ID:</Text>
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
                <Text size={200} className={styles.detailLabel}>Interactions:</Text>
                <Text size={300}>{conversation.messageCount}</Text>
              </div>
              <div className={styles.detailItem}>
                <Text size={200} className={styles.detailLabel}>Wait Time:</Text>
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
            <Text size={400}>No patient triage data found</Text>
          </div>
        )}
      </div>
    </Card>
  );
};
