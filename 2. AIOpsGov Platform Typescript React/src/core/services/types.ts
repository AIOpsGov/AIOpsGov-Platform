/**
 * Core TypeScript interfaces and types for the Conversation Evaluation System
 */

/**
 * Status phases during evaluation lifecycle
 */
export enum EvaluationPhase {
  IDLE = 'idle',
  SUBMITTING = 'submitting',
  QUEUED = 'queued',
  PROCESSING = 'processing',
  ANALYZING = 'analyzing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

/**
 * Request payload for triggering evaluation
 */
export interface EvaluationRequest {
  conversationId: string;
  webhookUrl?: string;
  userId?: string;
  timestamp?: string;
}

/**
 * Response from webhook trigger
 */
export interface EvaluationResponse {
  jobId: string;
  status: EvaluationPhase;
  message: string;
  estimatedDuration?: number;
  timestamp: string;
}

/**
 * Real-time status update during evaluation
 */
export interface EvaluationStatus {
  jobId: string;
  conversationId: string;
  phase: EvaluationPhase;
  progress: number; // 0-100
  currentStep: string;
  startTime: string;
  estimatedCompletion?: string;
  error?: {
    code: string;
    message: string;
    details?: string;
  };
}

/**
 * Individual metric result
 */
export interface MetricResult {
  name: string;
  score: number; // 0-100
  weight: number;
  category: 'quality' | 'compliance' | 'engagement' | 'technical';
  details?: string;
  threshold: number;
  passed: boolean;
}

/**
 * Complete evaluation result
 */
export interface EvaluationResult {
  jobId: string;
  conversationId: string;
  overallScore: number; // 0-100
  passed: boolean;
  evaluatedAt: string;
  duration: number; // seconds
  metrics: {
    helpfulness: MetricResult;
    professionalism: MetricResult;
    accuracy: MetricResult;
    clarity: MetricResult;
    empathy: MetricResult;
    compliance: MetricResult;
    responseTime: MetricResult;
    resolutionRate: MetricResult;
  };
  summary: {
    strengths: string[];
    improvements: string[];
    criticalIssues: string[];
  };
  metadata: {
    evaluatorVersion: string;
    modelUsed: string;
    dataSource: string;
  };
}

/**
 * Dashboard statistics
 */
export interface DashboardData {
  summary: {
    totalEvaluations: number;
    averageScore: number;
    passRate: number; // percentage
    averageDuration: number; // seconds
    averageTokens?: number; // AI efficiency metric
    avgHelpfulness?: number; // Business metric
    avgProfessionalism?: number; // Business metric
    avgRelevancy?: number; // Business metric
    avgProblemResolution?: number; // Business metric
    lastUpdated: string;
  };
  recentEvaluations: EvaluationSummary[];
  scoreDistribution: ScoreDistribution[];
  metricAverages: MetricAverage[];
  trends: TrendData[];
  failedConversations?: FailedConversation[];
}

/**
 * Summary of a single evaluation for dashboard
 */
export interface EvaluationSummary {
  jobId: string;
  conversationId: string;
  score: number;
  passed: boolean;
  evaluatedAt: string;
  duration: number;
  topMetric: string;
  lowestMetric: string;
}

/**
 * Score distribution data for charts
 */
export interface ScoreDistribution {
  range: string; // e.g., "0-20", "20-40"
  count: number;
  percentage: number;
}

/**
 * Average scores by metric
 */
export interface MetricAverage {
  metric: string;
  average: number;
  min: number;
  max: number;
  standardDeviation: number;
}

/**
 * Trend data over time
 */
export interface TrendData {
  date: string;
  overallScore: number;
  passRate: number;
  totalConversations: number;
  helpfulness: number;
  professionalism: number;
  relevancy: number;
  problemResolution: number;
}

/**
 * Failed conversation for alerts
 */
export interface FailedConversation {
  conversationId: string;
  overallScore: number;
  evaluatedAt: string;
  failedMetrics: string[];
  criticalIssues: number;
}

/**
 * API Error response
 */
export interface ApiError {
  code: string;
  message: string;
  details?: string;
  timestamp: string;
  requestId?: string;
}

/**
 * Toast notification data
 */
export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

/**
 * Application configuration
 */
export interface AppConfig {
  apiEndpoints: {
    webhook: string;
    status: string;
    dashboard: string;
    results: string;
  };
  pollingInterval: number;
  retryAttempts: number;
  retryDelay: number;
  theme: 'light' | 'dark';
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

/**
 * Conversation message
 */
export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

/**
 * Conversation transcript
 */
export interface ConversationTranscript {
  conversationId: string;
  messages: ConversationMessage[];
  startTime: string;
  endTime?: string;
  metadata?: {
    userId?: string;
    channel?: string;
    [key: string]: any;
  };
}
