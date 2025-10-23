/**
 * Metrics Card Component
 * Displays individual metric statistics
 */

import React from 'react';
import { Card, Text } from '@fluentui/react-components';
import {
  ArrowUp24Regular,
  ArrowDown24Regular,
} from '@fluentui/react-icons';
import { getScoreColor } from '../../utils/formatters';
import styles from './Dashboard.module.css';

interface MetricsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: string;
  icon?: React.ReactElement;
}

/**
 * Card component for displaying a single metric
 */
export const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  color,
  icon,
}) => {
  const displayValue = typeof value === 'number' ? value.toFixed(1) : value;
  const cardColor = color || (typeof value === 'number' ? getScoreColor(value as number) : undefined);

  return (
    <Card className={styles.metricsCard}>
      <div className={styles.metricsCardHeader}>
        <Text size={300} className={styles.metricsCardTitle}>
          {title}
        </Text>
        {icon && <div className={styles.metricsCardIcon}>{icon}</div>}
      </div>

      <div className={styles.metricsCardValue}>
        <Text
          size={800}
          weight="bold"
          style={{ color: cardColor }}
        >
          {displayValue}
        </Text>
      </div>

      {(subtitle || trend) && (
        <div className={styles.metricsCardFooter}>
          {subtitle && (
            <Text size={200} className={styles.metricsCardSubtitle}>
              {subtitle}
            </Text>
          )}
          {trend && trendValue && (
            <div
              className={`${styles.metricsTrend} ${
                trend === 'up' ? styles.metricsTrendUp :
                trend === 'down' ? styles.metricsTrendDown :
                styles.metricsTrendNeutral
              }`}
            >
              {trend === 'up' && <ArrowUp24Regular />}
              {trend === 'down' && <ArrowDown24Regular />}
              <Text size={200} weight="semibold">
                {trendValue}
              </Text>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default MetricsCard;