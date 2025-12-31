/**
 * Copilot Conversation List Component
 * Displays recent conversations
 */

import React from 'react';
import { Card, Text } from '@fluentui/react-components';
import { DashboardConfig } from '../../../../core/config/dashboardConfigs';
import { ConversationSession } from '../../../../core/services/copilotTelemetryApi';
import styles from './CopilotConversationList.module.css';

interface CopilotConversationListProps {
  sessions: ConversationSession[];
  config: DashboardConfig;
}

export const CopilotConversationList: React.FC<CopilotConversationListProps> = ({
  sessions,
  config,
}) => {
  const formatDuration = (duration?: number): string => {
    if (!duration) return 'N/A';
    return duration < 60 ? `${duration.toFixed(0)}s` : `${(duration / 60).toFixed(1)}m`;
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <Card className={styles.conversationList}>
      <div className={styles.header}>
        <Text size={600} weight="semibold">Recent Conversations</Text>
        <Text size={300} className={styles.count}>{sessions.length} conversations</Text>
      </div>
      <div className={styles.listContainer}>
        {sessions.slice(0, 10).map((session) => (
          <div key={session.conversationId} className={styles.conversationItem}>
            <div className={styles.conversationHeader}>
              <Text size={400} weight="semibold" className={styles.conversationId}>
                {session.conversationId.substring(0, 8)}...
              </Text>
              <span className={`${styles.status} ${styles[session.status]}`}>
                {session.status}
              </span>
            </div>
            <div className={styles.conversationDetails}>
              <Text size={300}>Messages: {session.messageCount}</Text>
              <Text size={300}>Duration: {formatDuration(session.duration)}</Text>
              <Text size={300}>Channel: {session.channelId}</Text>
            </div>
            <Text size={200} className={styles.timestamp}>
              {formatTimestamp(session.startTime)}
            </Text>
          </div>
        ))}
        {sessions.length === 0 && (
          <div className={styles.empty}>
            <Text size={400}>No conversations found</Text>
          </div>
        )}
      </div>
    </Card>
  );
};
