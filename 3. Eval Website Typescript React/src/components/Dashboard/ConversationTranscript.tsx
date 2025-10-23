/**
 * ConversationTranscript Component
 * Displays the full conversation transcript in an easy-to-read format
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Button,
  Text,
  Spinner,
  Badge,
} from '@fluentui/react-components';
import {
  Chat24Regular,
  Dismiss24Regular,
} from '@fluentui/react-icons';
import { useQuery } from '@tanstack/react-query';
import { getConversationTranscript } from '../../services/api';
import { formatRelativeTime } from '../../utils/formatters';
import styles from './ConversationTranscript.module.css';

interface ConversationTranscriptProps {
  conversationId: string;
}

/**
 * Component to view conversation transcript
 */
export const ConversationTranscript: React.FC<ConversationTranscriptProps> = ({
  conversationId,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Fetch transcript data when dialog opens
  const { data, isLoading, error } = useQuery({
    queryKey: ['transcript', conversationId],
    queryFn: () => getConversationTranscript(conversationId),
    enabled: isOpen, // Only fetch when dialog is open
    staleTime: 30000, // Cache for 30 seconds
  });

  return (
    <Dialog open={isOpen} onOpenChange={(_, data) => setIsOpen(data.open)}>
      <DialogTrigger disableButtonEnhancement>
        <Button
          appearance="subtle"
          icon={<Chat24Regular />}
          size="small"
          title="View conversation transcript"
        >
          Transcript
        </Button>
      </DialogTrigger>
      <DialogSurface className={styles.dialogSurface}>
        <DialogBody>
          <DialogTitle
            action={
              <DialogTrigger action="close">
                <Button
                  appearance="subtle"
                  aria-label="close"
                  icon={<Dismiss24Regular />}
                />
              </DialogTrigger>
            }
          >
            Conversation Transcript
          </DialogTitle>
          <DialogContent className={styles.dialogContent}>
            {isLoading ? (
              <div className={styles.loading}>
                <Spinner size="large" label="Loading transcript..." />
              </div>
            ) : error ? (
              <div className={styles.error}>
                <Text size={400} weight="semibold">
                  Failed to load transcript
                </Text>
                <Text size={300}>
                  {error instanceof Error ? error.message : 'Unknown error occurred'}
                </Text>
              </div>
            ) : data && data.messages.length > 0 ? (
              <>
                {/* Conversation metadata */}
                <div className={styles.metadata}>
                  <Text size={300} weight="semibold">
                    Conversation ID: <Text font="monospace">{conversationId}</Text>
                  </Text>
                  <Text size={300}>
                    Started: {formatRelativeTime(data.startTime)}
                  </Text>
                  {data.endTime && (
                    <Text size={300}>
                      Ended: {formatRelativeTime(data.endTime)}
                    </Text>
                  )}
                  <Text size={300}>
                    Total Messages: {data.messages.length}
                  </Text>
                  {data.metadata?.channel && (
                    <Text size={300}>
                      Channel: {data.metadata.channel}
                    </Text>
                  )}
                </div>

                {/* Messages list with scroll */}
                <div className={styles.messagesContainer}>
                  {data.messages.map((message, index) => (
                    <div
                      key={`${message.timestamp}-${index}`}
                      className={`${styles.message} ${styles[message.role]}`}
                    >
                      <div className={styles.messageHeader}>
                        <Badge
                          color={
                            message.role === 'user'
                              ? 'brand'
                              : message.role === 'assistant'
                              ? 'success'
                              : 'subtle'
                          }
                        >
                          {message.role === 'user'
                            ? '👤 User'
                            : message.role === 'assistant'
                            ? '🤖 Bot'
                            : '⚙️ System'}
                        </Badge>
                        <Text size={200} className={styles.messageTime}>
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </Text>
                      </div>
                      <div className={styles.messageContent}>
                        <Text size={300}>{message.content}</Text>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className={styles.noData}>
                <Text size={400} weight="semibold">
                  No messages found
                </Text>
                <Text size={300}>
                  This conversation has no recorded messages.
                </Text>
                <Text size={200} className={styles.hint}>
                  💡 Make sure your system is logging conversation messages to Application
                  Insights with event names "BotMessageReceived" (user) and "BotMessageSend" (bot)
                  with a "text" field in customDimensions
                </Text>
              </div>
            )}
          </DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="secondary">Close</Button>
            </DialogTrigger>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default ConversationTranscript;
