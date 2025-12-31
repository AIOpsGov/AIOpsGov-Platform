/**
 * Conversation API Service
 * Handles fetching user conversations from Application Insights
 */

import axios from 'axios';

const FUNCTION_APP_URL = import.meta.env.VITE_FUNCTION_APP_URL || 'https://your-function-app-url.azurewebsites.net';

// Create a dedicated axios instance for conversation tracking
const conversationClient = axios.create({
  baseURL: FUNCTION_APP_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ConversationMessage {
  timestamp: string;
  fromBot: boolean;
  text: string;
  userName?: string;
}

export interface UserConversation {
  conversationId: string;
  agentName: string;
  startTime: string;
  endTime: string;
  messageCount: number;
  status: 'completed' | 'in-progress' | 'abandoned';
  lastMessage?: string;
}

export interface ConversationTranscript {
  conversationId: string;
  agentName: string;
  startTime: string;
  endTime: string;
  messages: ConversationMessage[];
  totalMessages: number;
}

export interface TrackConversationParams {
  userId: string;
  userName: string;
  agentId: string;
  agentName: string;
  sessionId: string;
  action?: string;
}

/**
 * Track conversation session start
 * This links Azure AD user to their conversations
 */
export const trackConversationStart = async (params: TrackConversationParams): Promise<void> => {
  console.log('[conversationApi] trackConversationStart called', params);
  console.log('[conversationApi] Using Function App URL:', FUNCTION_APP_URL);
  
  try {
    const response = await conversationClient.post('/api/track-conversation', {
      userId: params.userId,
      userName: params.userName,
      agentId: params.agentId,
      agentName: params.agentName,
      sessionId: params.sessionId,
      action: params.action || 'conversation_start',
    });
    
    console.log('[conversationApi] trackConversationStart response:', response.status, response.data);
  } catch (error) {
    console.error('[conversationApi] Error tracking conversation start:', error);
    if (axios.isAxiosError(error)) {
      console.error('[conversationApi] Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
      });
    }
    throw error;
  }
};

/**
 * Get user's conversations from Application Insights
 */
export const getUserConversations = async (
  userId: string,
  timeRangeMinutes: number = 43200 // 30 days default
): Promise<UserConversation[]> => {
  console.log('[conversationApi] getUserConversations called', { userId, timeRangeMinutes });
  
  try {
    const response = await conversationClient.post('/api/get-user-conversations', {
      userId,
      timeRange: `${Math.floor(timeRangeMinutes / 1440)}d`, // Convert minutes to days
    });

    console.log('[conversationApi] Response status:', response.status);
    console.log('[conversationApi] Full response data:', JSON.stringify(response.data, null, 2));
    
    if (response.data?.tables?.[0]?.rows) {
      const rows = response.data.tables[0].rows;
      const columns = response.data.tables[0].columns;
      
      console.log('[conversationApi] Columns:', columns);
      console.log('[conversationApi] Raw rows:', rows);
      
      const conversations = rows.map((row: any[]) => {
        const conv = {
          conversationId: row[0],
          agentName: row[1],
          startTime: row[4],        // userId is at row[2], userName at row[3], startTime is row[4]
          endTime: row[5],
          messageCount: row[7],      // duration is at row[6], messageCount is row[7]
          lastMessage: row[9] || '', // firstMessage is at row[9]
          status: row[8],
        };
        console.log('[conversationApi] Mapped conversation:', conv);
        return conv;
      });
      
      console.log('[conversationApi] Final parsed conversations:', conversations);
      return conversations;
    }
    
    console.log('[conversationApi] No rows in response data');
    return [];
  } catch (error) {
    console.error('[conversationApi] Error fetching user conversations:', error);
    if (axios.isAxiosError(error)) {
      console.error('[conversationApi] Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
    }
    throw error;
  }
};

/**
 * Get full conversation transcript
 */
export const getConversationTranscript = async (
  conversationId: string
): Promise<ConversationTranscript> => {
  try {
    const query = `
      customEvents
      | where name in ("BotMessageSend", "BotMessageReceived")
      | where tostring(customDimensions.conversationId) == "${conversationId}"
      | extend messageText = tostring(customDimensions.text)
      | extend fromBot = case(name == "BotMessageSend", true, false)
      | extend agentName = tostring(cloud_RoleInstance)
      | extend userName = tostring(customDimensions.userName)
      | order by timestamp asc
      | project 
          timestamp,
          fromBot,
          text = messageText,
          agentName,
          userName
    `;

    const response = await conversationClient.post('/api/query-insights', { query });
    
    if (response.data?.tables?.[0]?.rows) {
      const rows = response.data.tables[0].rows;
      const messages: ConversationMessage[] = rows.map((row: any[]) => ({
        timestamp: row[0],
        fromBot: row[1],
        text: row[2] || '(No message text)',
        userName: row[4],
      }));

      return {
        conversationId,
        agentName: rows[0]?.[3] || 'Unknown Agent',
        startTime: rows[0]?.[0] || '',
        endTime: rows[rows.length - 1]?.[0] || '',
        messages,
        totalMessages: messages.length,
      };
    }
    
    throw new Error('No transcript found');
  } catch (error) {
    console.error('Error fetching conversation transcript:', error);
    throw error;
  }
};

/**
 * Time range options for filtering
 */
export const TIME_RANGE_OPTIONS = [
  { label: 'Last 30 minutes', value: 30 },
  { label: 'Last 24 hours', value: 1440 },
  { label: 'Last 7 days', value: 10080 },
  { label: 'Last 30 days', value: 43200 },
] as const;
