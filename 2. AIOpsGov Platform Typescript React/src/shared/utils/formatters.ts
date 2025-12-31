/**
 * Utility functions for formatting data, dates, and other values
 */

import { SCORE_RANGES } from './constants';

/**
 * Format a number as a percentage
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format a duration in seconds to human-readable format
 */
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes < 60) {
    return remainingSeconds > 0 
      ? `${minutes}m ${remainingSeconds}s`
      : `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  return remainingMinutes > 0
    ? `${hours}h ${remainingMinutes}m`
    : `${hours}h`;
};

/**
 * Format a date to localized string
 */
export const formatDate = (dateString: string, format: 'full' | 'short' | 'time' = 'full'): string => {
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  switch (format) {
    case 'full':
      return date.toLocaleString();
    case 'short':
      return date.toLocaleDateString();
    case 'time':
      return date.toLocaleTimeString();
    default:
      return date.toLocaleString();
  }
};

/**
 * Format a date to relative time (e.g., "5 minutes ago")
 */
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffSec < 60) {
    return 'just now';
  } else if (diffMin < 60) {
    return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
  } else if (diffHour < 24) {
    return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
  } else if (diffDay < 7) {
    return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
  } else {
    return formatDate(dateString, 'short');
  }
};

/**
 * Get color for a score value
 */
export const getScoreColor = (score: number): string => {
  for (const range of Object.values(SCORE_RANGES)) {
    if (score >= range.min && score <= range.max) {
      return range.color;
    }
  }
  return SCORE_RANGES.POOR.color;
};

/**
 * Get score label
 */
export const getScoreLabel = (score: number): string => {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Fair';
  return 'Poor';
};

/**
 * Format a large number with abbreviations (K, M, B)
 */
export const formatLargeNumber = (num: number): string => {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Format conversation ID for display
 */
export const formatConversationId = (id: string, maxLength: number = 20): string => {
  if (id.length <= maxLength) return id;
  const start = Math.floor((maxLength - 3) / 2);
  const end = Math.ceil((maxLength - 3) / 2);
  return `${id.substring(0, start)}...${id.substring(id.length - end)}`;
};

/**
 * Calculate estimated time remaining
 */
export const estimateTimeRemaining = (
  startTime: string,
  currentProgress: number,
  totalProgress: number = 100
): string => {
  if (currentProgress === 0) return 'Calculating...';
  
  const start = new Date(startTime);
  const now = new Date();
  const elapsed = now.getTime() - start.getTime();
  const progressRatio = currentProgress / totalProgress;
  const estimatedTotal = elapsed / progressRatio;
  const remaining = estimatedTotal - elapsed;
  
  return formatDuration(Math.floor(remaining / 1000));
};

/**
 * Sanitize conversation ID input
 */
export const sanitizeConversationId = (id: string): string => {
  return id.trim().replace(/\s+/g, '-');
};

/**
 * Format API error message
 */
export const formatErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.response?.data?.message) return error.response.data.message;
  return 'An unexpected error occurred';
};

/**
 * Generate a unique ID for toast notifications
 */
export const generateToastId = (): string => {
  return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Parse score distribution range
 */
export const parseScoreRange = (range: string): { min: number; max: number } => {
  const [min, max] = range.split('-').map(Number);
  return { min, max };
};

/**
 * Format metric name to display name
 */
export const formatMetricName = (metricName: string): string => {
  return metricName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

/**
 * Calculate pass rate
 */
export const calculatePassRate = (passed: number, total: number): number => {
  if (total === 0) return 0;
  return (passed / total) * 100;
};

/**
 * Format bytes to human readable size
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Deep clone an object
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
