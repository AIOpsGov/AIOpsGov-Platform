/**
 * Dashboard Helper Functions
 * Pure utility functions for dashboard UI rendering
 */

import React from 'react';
import { Badge } from '@fluentui/react-components';
import { IntentResult } from '../services/intentApi';

/**
 * Get health color based on score percentage
 */
export const getHealthColor = (score: number): string => {
  if (score >= 80) return '#107c10';
  if (score >= 60) return '#f7630c';
  return '#d13438';
};

/**
 * Get health status text based on score
 */
export const getHealthStatus = (score: number): string => {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  return 'Needs Attention';
};

/**
 * Get confidence color based on score
 */
export const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 0.8) return '#107c10';
  if (confidence >= 0.7) return '#f7630c';
  return '#d13438';
};

/**
 * Generate sentiment badge component
 */
export const getSentimentBadge = (sentiment: string) => {
  const color = sentiment === 'Positive' ? 'success' : 
                sentiment === 'Negative' ? 'danger' : 'warning';
  const icon = sentiment === 'Positive' ? '😊' : 
               sentiment === 'Negative' ? '😟' : '😐';
  return (
    <Badge appearance="tint" color={color}>
      {icon} {sentiment}
    </Badge>
  );
};

/**
 * Generate priority badge based on result properties
 */
export const getPriorityBadge = (result: IntentResult) => {
  const isLowConfidence = result.confidenceScore < 0.7;
  const isNegative = result.sentiment === 'Negative';
  
  if (isNegative && isLowConfidence) {
    return <Badge appearance="filled" color="danger">🔴 URGENT</Badge>;
  } else if (isNegative) {
    return <Badge appearance="tint" color="danger">⚠️ High Priority</Badge>;
  } else if (isLowConfidence) {
    return <Badge appearance="tint" color="warning">⚡ Review Needed</Badge>;
  }
  return null;
};

/**
 * Generate CSV report from intent results
 */
export const generateCSVReport = (results: IntentResult[]): string => {
  const headers = ['Timestamp', 'Category', 'Confidence', 'Sentiment', 'Sentiment Score', 'Comments'];
  const rows = results.map(r => [
    new Date(r.timestamp).toLocaleString(),
    r.category,
    (r.confidenceScore * 100).toFixed(1) + '%',
    r.sentiment,
    (r.sentimentScore * 100).toFixed(1) + '%',
    `"${r.comments.replace(/"/g, '""')}"`
  ]);
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
};

/**
 * Download CSV file
 */
export const downloadCSV = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
};
