/**
 * Status Classification Utility
 * Provides green/red status determination based on metrics
 */

export type StatusColor = 'green' | 'red';

export interface StatusResult {
  color: StatusColor;
  reason: string;
  severity: 'ok' | 'warning' | 'critical';
}

/**
 * Sentiment Status Rules:
 * - 0% sentiment = RED (upset customers)
 * - < 50% sentiment = RED (problem state)
 * - >= 50% sentiment = GREEN (healthy)
 * 
 * Note: Neutral sentiment is counted as positive (not upset/problematic)
 */
export const getSentimentStatus = (
  sentimentScore: number,
  sentimentPercentage?: number
): StatusResult => {
  const percentage = sentimentPercentage ?? sentimentScore * 100;

  // Sentiment = 0% is always red (upset customers)
  if (percentage === 0) {
    return {
      color: 'red',
      reason: 'Upset customers detected (0% positive sentiment)',
      severity: 'critical',
    };
  }

  // Below 50% is problem state
  if (percentage < 50) {
    return {
      color: 'red',
      reason: `Low customer satisfaction (${percentage.toFixed(0)}% positive)`,
      severity: 'warning',
    };
  }

  // 50% and above is healthy
  return {
    color: 'green',
    reason: `Good customer sentiment (${percentage.toFixed(0)}% positive)`,
    severity: 'ok',
  };
};

/**
 * Runtime Status Rules:
 * - > 5 minutes = RED (performance issue)
 * - > 3 minutes = warning
 * - <= 3 minutes = GREEN
 */
export const getRuntimeStatus = (
  runtimeMinutes: number,
  flowName: string = 'Flow'
): StatusResult => {
  if (runtimeMinutes > 5) {
    return {
      color: 'red',
      reason: `${flowName} exceeds 5 minute threshold (${runtimeMinutes.toFixed(1)}m)`,
      severity: 'critical',
    };
  }

  if (runtimeMinutes > 3) {
    return {
      color: 'red',
      reason: `${flowName} runtime elevated (${runtimeMinutes.toFixed(1)}m)`,
      severity: 'warning',
    };
  }

  return {
    color: 'green',
    reason: `${flowName} runtime healthy (${runtimeMinutes.toFixed(1)}m)`,
    severity: 'ok',
  };
};

/**
 * Accuracy Status Rules:
 * - < 70% = RED
 * - 70-80% = warning
 * - > 80% = GREEN
 */
export const getAccuracyStatus = (
  accuracyPercentage: number
): StatusResult => {
  if (accuracyPercentage < 70) {
    return {
      color: 'red',
      reason: `Low accuracy (${accuracyPercentage.toFixed(1)}%)`,
      severity: 'critical',
    };
  }

  if (accuracyPercentage < 80) {
    return {
      color: 'red',
      reason: `Below target accuracy (${accuracyPercentage.toFixed(1)}%)`,
      severity: 'warning',
    };
  }

  return {
    color: 'green',
    reason: `Good accuracy (${accuracyPercentage.toFixed(1)}%)`,
    severity: 'ok',
  };
};

/**
 * Combined Health Status:
 * Returns overall status based on multiple metrics
 */
export const getCombinedStatus = (metrics: {
  sentimentScore?: number;
  accuracyScore?: number;
  avgRuntimeMinutes?: number;
  errorRate?: number;
}): StatusResult => {
  const issues: string[] = [];
  let maxSeverity: 'ok' | 'warning' | 'critical' = 'ok';

  // Check sentiment
  if (metrics.sentimentScore !== undefined) {
    const sentimentStatus = getSentimentStatus(metrics.sentimentScore);
    if (sentimentStatus.color === 'red') {
      issues.push(sentimentStatus.reason);
      if (sentimentStatus.severity === 'critical') maxSeverity = 'critical';
      else if (maxSeverity !== 'critical') maxSeverity = 'warning';
    }
  }

  // Check accuracy
  if (metrics.accuracyScore !== undefined) {
    const accuracyStatus = getAccuracyStatus(metrics.accuracyScore * 100);
    if (accuracyStatus.color === 'red') {
      issues.push(accuracyStatus.reason);
      if (accuracyStatus.severity === 'critical') maxSeverity = 'critical';
      else if (maxSeverity !== 'critical') maxSeverity = 'warning';
    }
  }

  // Check runtime
  if (metrics.avgRuntimeMinutes !== undefined) {
    const runtimeStatus = getRuntimeStatus(metrics.avgRuntimeMinutes);
    if (runtimeStatus.color === 'red') {
      issues.push(runtimeStatus.reason);
      if (runtimeStatus.severity === 'critical') maxSeverity = 'critical';
      else if (maxSeverity !== 'critical') maxSeverity = 'warning';
    }
  }

  // Check error rate
  if (metrics.errorRate !== undefined && metrics.errorRate > 5) {
    issues.push(`High error rate (${metrics.errorRate.toFixed(1)}%)`);
    maxSeverity = 'critical';
  }

  if (issues.length === 0) {
    return {
      color: 'green',
      reason: 'All metrics healthy',
      severity: 'ok',
    };
  }

  return {
    color: 'red',
    reason: issues.join('; '),
    severity: maxSeverity,
  };
};

/**
 * Get status badge color for Fluent UI components
 */
export const getFluentUIBadgeColor = (
  status: StatusColor
): 'success' | 'danger' => {
  return status === 'green' ? 'success' : 'danger';
};

/**
 * Get status icon emoji
 */
export const getStatusIcon = (status: StatusColor): string => {
  return status === 'green' ? '✅' : '🔴';
};
