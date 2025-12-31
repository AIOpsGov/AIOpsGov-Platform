/**
 * Application-wide constants and configuration values
 */

import { AppConfig } from '../services/types';

/**
 * API Endpoints Configuration
 * Uses environment variables or defaults to placeholder
 */
const FUNCTION_APP_URL = import.meta.env.VITE_FUNCTION_APP_URL || 'https://your-function-app-url.azurewebsites.net';

export const API_ENDPOINTS = {
  WEBHOOK: `${FUNCTION_APP_URL}/api/product-advisor/trigger-evaluation`,
  STATUS: `${FUNCTION_APP_URL}/api/product-advisor/query-insights`,
  DASHBOARD: `${FUNCTION_APP_URL}/api/product-advisor/query-insights`,
  RESULTS: `${FUNCTION_APP_URL}/api/product-advisor/query-insights`,
  TRANSCRIPT: `${FUNCTION_APP_URL}/api/product-advisor/get-transcript`,
  TRACK_CONVERSATION: `${FUNCTION_APP_URL}/api/product-advisor/track-conversation`,
  JOB_STATUS: `${FUNCTION_APP_URL}/api/product-advisor/get-job-status`,
};

export const API_CONFIG = {
  POLLING_INTERVAL: 5000,
  REQUEST_TIMEOUT: 30000,
  APP_INSIGHTS_API_KEY: '', // Add your Application Insights API key here
};

/**
 * Polling and retry configuration
 */
export const POLLING_CONFIG = {
  INTERVAL: 5000, // 5 seconds
  MAX_ATTEMPTS: 120, // 10 minutes total
  TIMEOUT: 600000, // 10 minutes
};

export const RETRY_CONFIG = {
  MAX_ATTEMPTS: 3,
  INITIAL_DELAY: 1000, // 1 second
  MAX_DELAY: 10000, // 10 seconds
  BACKOFF_MULTIPLIER: 2,
};

/**
 * Default application configuration
 */
export const DEFAULT_APP_CONFIG: AppConfig = {
  apiEndpoints: {
    webhook: API_ENDPOINTS.WEBHOOK,
    status: API_ENDPOINTS.STATUS,
    dashboard: API_ENDPOINTS.DASHBOARD,
    results: API_ENDPOINTS.RESULTS,
  },
  pollingInterval: POLLING_CONFIG.INTERVAL,
  retryAttempts: RETRY_CONFIG.MAX_ATTEMPTS,
  retryDelay: RETRY_CONFIG.INITIAL_DELAY,
  theme: 'light',
};

/**
 * Evaluation phase display names
 */
export const PHASE_DISPLAY_NAMES: Record<string, string> = {
  idle: 'Ready',
  submitting: 'Submitting Request',
  queued: 'Queued for Processing',
  processing: 'Processing Conversation',
  analyzing: 'Analyzing Results',
  completed: 'Completed',
  failed: 'Failed',
};

/**
 * Evaluation phase progress percentages
 */
export const PHASE_PROGRESS: Record<string, number> = {
  idle: 0,
  submitting: 10,
  queued: 25,
  processing: 50,
  analyzing: 75,
  completed: 100,
  failed: 0,
};

/**
 * Metric thresholds for pass/fail
 */
export const METRIC_THRESHOLDS = {
  helpfulness: 70,
  professionalism: 75,
  accuracy: 80,
  clarity: 70,
  empathy: 65,
  compliance: 90,
  responseTime: 70,
  resolutionRate: 75,
};

/**
 * Score ranges for color coding
 */
export const SCORE_RANGES = {
  EXCELLENT: { min: 90, max: 100, color: '#107C10' },
  GOOD: { min: 75, max: 89, color: '#0078D4' },
  FAIR: { min: 60, max: 74, color: '#FFB900' },
  POOR: { min: 0, max: 59, color: '#D13438' },
};

/**
 * Chart colors for metrics
 */
export const CHART_COLORS = {
  primary: '#0078D4',
  secondary: '#50E6FF',
  success: '#107C10',
  warning: '#FFB900',
  error: '#D13438',
  neutral: '#8A8886',
  accent: '#8764B8',
  highlight: '#00CC6A',
};

/**
 * Dashboard refresh interval (30 seconds)
 */
export const DASHBOARD_REFRESH_INTERVAL = 30000;

/**
 * Maximum items to display in recent evaluations
 */
export const MAX_RECENT_EVALUATIONS = 10;

/**
 * Toast notification durations (milliseconds)
 */
export const TOAST_DURATION = {
  SUCCESS: 4000,
  ERROR: 6000,
  WARNING: 5000,
  INFO: 3000,
};

/**
 * Validation rules
 */
export const VALIDATION = {
  CONVERSATION_ID_MIN_LENGTH: 5,
  CONVERSATION_ID_MAX_LENGTH: 100,
  CONVERSATION_ID_PATTERN: /^[a-zA-Z0-9-_]+$/,
};

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  THEME: 'eval_system_theme',
  LAST_CONVERSATION_ID: 'eval_system_last_conversation_id',
  USER_PREFERENCES: 'eval_system_preferences',
};

/**
 * Date format strings
 */
export const DATE_FORMATS = {
  FULL: 'YYYY-MM-DD HH:mm:ss',
  SHORT: 'MMM DD, YYYY',
  TIME: 'HH:mm:ss',
  RELATIVE: 'relative', // for "5 minutes ago" style
};

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error occurred. Please check your connection.',
  INVALID_CONVERSATION_ID: 'Please enter a valid conversation ID.',
  WEBHOOK_FAILED: 'Failed to trigger evaluation. Please try again.',
  TIMEOUT: 'Evaluation timed out. Please check Azure Automation.',
  UNAUTHORIZED: 'Authentication failed. Please check API credentials.',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
  UNKNOWN: 'An unexpected error occurred.',
};

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  EVALUATION_STARTED: 'Evaluation started successfully!',
  EVALUATION_COMPLETED: 'Evaluation completed successfully!',
  DATA_REFRESHED: 'Dashboard data refreshed.',
};
