/**
 * Application-wide constants and configuration values
 */

import { AppConfig } from '../services/types';

/**
 * API Endpoints Configuration
 * Dynamically built from environment variables
 */
const getApiEndpoints = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://your-function-app-name.azurewebsites.net/api';
  
  return {
    WEBHOOK: `${baseUrl}/trigger-evaluation`,
    STATUS: `${baseUrl}/query-insights`,
    DASHBOARD: `${baseUrl}/query-insights`,
    RESULTS: `${baseUrl}/query-insights`,
  };
};

export const API_ENDPOINTS = getApiEndpoints();

export const API_CONFIG = {
  POLLING_INTERVAL: parseInt(import.meta.env.VITE_POLLING_INTERVAL) || 5000,
  REQUEST_TIMEOUT: parseInt(import.meta.env.VITE_REQUEST_TIMEOUT) || 30000,
  MAX_RETRIES: parseInt(import.meta.env.VITE_MAX_RETRIES) || 3,
  ENABLE_DEMO_MODE: import.meta.env.VITE_ENABLE_DEMO_MODE === 'true',
  ENABLE_DEBUG_LOGGING: import.meta.env.VITE_ENABLE_DEBUG_LOGGING === 'true',
};

/**
 * Polling and retry configuration
 */
export const POLLING_CONFIG = {
  INTERVAL: API_CONFIG.POLLING_INTERVAL,
  MAX_ATTEMPTS: parseInt(import.meta.env.VITE_MAX_POLLING_ATTEMPTS) || 120,
  TIMEOUT: parseInt(import.meta.env.VITE_POLLING_TIMEOUT) || 600000,
};

export const RETRY_CONFIG = {
  MAX_ATTEMPTS: API_CONFIG.MAX_RETRIES,
  INITIAL_DELAY: parseInt(import.meta.env.VITE_RETRY_INITIAL_DELAY) || 1000,
  MAX_DELAY: parseInt(import.meta.env.VITE_RETRY_MAX_DELAY) || 10000,
  BACKOFF_MULTIPLIER: parseFloat(import.meta.env.VITE_RETRY_BACKOFF_MULTIPLIER) || 2,
};

/**
 * Feature flags from environment
 */
export const FEATURE_FLAGS = {
  ENABLE_DEMO_MODE: API_CONFIG.ENABLE_DEMO_MODE,
  ENABLE_DARK_MODE: import.meta.env.VITE_ENABLE_DARK_MODE !== 'false',
  ENABLE_NOTIFICATIONS: import.meta.env.VITE_ENABLE_NOTIFICATIONS !== 'false',
  ENABLE_DEBUG_LOGGING: API_CONFIG.ENABLE_DEBUG_LOGGING,
};

/**
 * Default application configuration
 */
export const DEFAULT_APP_CONFIG: AppConfig = {
  apiEndpoints: API_ENDPOINTS,
  pollingInterval: POLLING_CONFIG.INTERVAL,
  retryAttempts: RETRY_CONFIG.MAX_ATTEMPTS,
  retryDelay: RETRY_CONFIG.INITIAL_DELAY,
  theme: 'light',
};

/**
 * Configuration info for debugging
 */
export const CONFIG_INFO = {
  isDemoMode: FEATURE_FLAGS.ENABLE_DEMO_MODE,
  environment: import.meta.env.MODE,
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'not-configured',
  buildTime: import.meta.env.VITE_BUILD_TIME || new Date().toISOString(),
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
};

// Log configuration in development
if (import.meta.env.DEV && FEATURE_FLAGS.ENABLE_DEBUG_LOGGING) {
  console.log('🔧 Application Configuration:', CONFIG_INFO);
  console.log('🌐 API Endpoints:', API_ENDPOINTS);
  console.log('🎛️ Feature Flags:', FEATURE_FLAGS);
}

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