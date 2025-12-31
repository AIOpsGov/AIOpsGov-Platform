/**
 * Stat Card - Shared Component
 * Simple statistic display card
 */

import React from 'react';
import { Card, Text } from '@fluentui/react-components';
import styles from './StatCard.module.css';

export interface StatCardProps {
  label: string;
  value: string | number;
  color?: string;
  size?: 'small' | 'medium' | 'large';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  color = '#0078D4',
  size = 'medium',
}) => {
  return (
    <Card className={`${styles.statCard} ${styles[size]}`}>
      <Text size={200} className={styles.label}>{label}</Text>
      <Text 
        size={size === 'large' ? 900 : size === 'medium' ? 700 : 500} 
        weight="bold" 
        className={styles.value}
        style={{ color }}
      >
        {value}
      </Text>
    </Card>
  );
};
