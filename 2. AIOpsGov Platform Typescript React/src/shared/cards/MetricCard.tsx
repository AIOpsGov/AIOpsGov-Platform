/**
 * Metric Card - Shared Component
 * Reusable metric display card
 */

import React from 'react';
import { Card, Text } from '@fluentui/react-components';
import styles from './MetricCard.module.css';

export interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  color?: string;
  icon?: React.ReactNode;
  target?: number;
  format?: 'number' | 'percentage' | 'currency' | 'duration';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  color = '#0078D4',
  icon,
  target,
  format = 'number',
}) => {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'percentage':
        return `${val.toFixed(1)}%`;
      case 'currency':
        return `$${val.toLocaleString()}`;
      case 'duration':
        return val < 60 ? `${val.toFixed(0)}s` : `${(val / 60).toFixed(1)}m`;
      default:
        return val.toLocaleString();
    }
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.direction === 'up') return '↑';
    if (trend.direction === 'down') return '↓';
    return '→';
  };

  const getTrendColor = () => {
    if (!trend) return '#666666';
    if (trend.direction === 'up') return '#107C10';
    if (trend.direction === 'down') return '#D13438';
    return '#666666';
  };

  const meetsTarget = target !== undefined ? Number(value) >= target : true;

  return (
    <Card className={styles.metricCard} style={{ borderLeft: `4px solid ${color}` }}>
      <div className={styles.cardHeader}>
        {icon && <div className={styles.icon} style={{ color }}>{icon}</div>}
        <Text size={300} className={styles.title}>{title}</Text>
      </div>
      
      <div className={styles.cardBody}>
        <Text 
          size={800} 
          weight="bold" 
          className={styles.value}
          style={{ color: target !== undefined ? (meetsTarget ? '#107C10' : '#D13438') : color }}
        >
          {formatValue(value)}
        </Text>
        
        {trend && (
          <div className={styles.trend} style={{ color: getTrendColor() }}>
            <span className={styles.trendIcon}>{getTrendIcon()}</span>
            <Text size={300}>{Math.abs(trend.value)}%</Text>
          </div>
        )}
      </div>

      {subtitle && (
        <Text size={200} className={styles.subtitle}>{subtitle}</Text>
      )}

      {target !== undefined && (
        <Text size={200} className={styles.target}>
          Target: {formatValue(target)}
        </Text>
      )}
    </Card>
  );
};
