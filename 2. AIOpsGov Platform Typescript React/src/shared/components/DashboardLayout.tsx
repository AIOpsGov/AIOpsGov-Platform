/**
 * Dashboard Layout - Shared Component
 * Common layout wrapper for all industry dashboards
 */

import React from 'react';
import { Text } from '@fluentui/react-components';
import styles from './DashboardLayout.module.css';

export interface DashboardLayoutProps {
  title: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  title,
  subtitle,
  headerActions,
  children,
}) => {
  return (
    <div className={styles.layout}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <Text size={800} weight="bold" className={styles.title}>{title}</Text>
          {subtitle && <Text size={400} className={styles.subtitle}>{subtitle}</Text>}
        </div>
        {headerActions && <div className={styles.headerActions}>{headerActions}</div>}
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
};
