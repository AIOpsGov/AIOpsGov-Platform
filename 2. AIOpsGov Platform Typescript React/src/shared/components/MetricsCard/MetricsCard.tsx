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
    <Card style={{ padding: '1.5rem', minHeight: '150px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <Text size={300} style={{ color: '#666' }}>
          {title}
        </Text>
        {icon && <div>{icon}</div>}
      </div>

      <div style={{ marginBottom: '0.5rem' }}>
        <Text
          size={800}
          weight="bold"
          style={{ color: cardColor }}
        >
          {displayValue}
        </Text>
      </div>

      {(subtitle || trend) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
          {subtitle && (
            <Text size={200} style={{ color: '#888' }}>
              {subtitle}
            </Text>
          )}
          {trend && trendValue && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.25rem',
              color: trend === 'up' ? '#107C10' : trend === 'down' ? '#D13438' : '#666'
            }}>
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