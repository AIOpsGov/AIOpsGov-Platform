/**
 * Copilot Dashboard Header Component
 * Displays dashboard title, description, and action buttons
 */

import React from 'react';
import { Text, Button, Dropdown, Option, Field } from '@fluentui/react-components';
import {
  ArrowSync24Regular,
  DocumentPdf24Regular,
} from '@fluentui/react-icons';
import { DashboardConfig } from '../../../../core/config/dashboardConfigs';
import styles from './CopilotDashboardHeader.module.css';

interface CopilotDashboardHeaderProps {
  config: DashboardConfig;
  timeRange: string;
  onTimeRangeChange: (timeRange: string) => void;
  onRefresh: () => void;
  onExportReport: () => void;
  loading: boolean;
  hasData: boolean;
}

export const CopilotDashboardHeader: React.FC<CopilotDashboardHeaderProps> = ({
  config,
  timeRange,
  onTimeRangeChange,
  onRefresh,
  onExportReport,
  loading,
  hasData,
}) => {
  // Dynamically get icon component
  const IconComponent = require('@fluentui/react-icons')[`${config.icon}24Regular`];

  return (
    <div className={styles.header} style={{ background: `linear-gradient(135deg, ${config.color}dd 0%, ${config.color}99 100%)` }}>
      <div className={styles.headerTitleSection}>
        {IconComponent && <IconComponent className={styles.headerIcon} />}
        <div className={styles.headerText}>
          <Text size={900} weight="bold" className={styles.mainTitle}>
            {config.name}
          </Text>
          <Text size={400} className={styles.subtitle}>
            {config.description}
          </Text>
          <Text size={300} className={styles.industry}>
            {config.industry}
          </Text>
        </div>
      </div>

      <div className={styles.headerActions}>
        <Field label="Time Range">
          <Dropdown
            value={
              timeRange === '24h' ? 'Last 24 Hours' :
              timeRange === '7d' ? 'Last 7 Days' :
              timeRange === '30d' ? 'Last 30 Days' :
              'Last 90 Days'
            }
            selectedOptions={[timeRange]}
            onOptionSelect={(_, data) => {
              if (data.optionValue) {
                onTimeRangeChange(data.optionValue as string);
              }
            }}
          >
            <Option value="24h">Last 24 Hours</Option>
            <Option value="7d">Last 7 Days</Option>
            <Option value="30d">Last 30 Days</Option>
            <Option value="90d">Last 90 Days</Option>
          </Dropdown>
        </Field>
        <Button
          appearance="subtle"
          icon={<ArrowSync24Regular style={{ color: 'black' }} />}
          onClick={onRefresh}
          disabled={loading}
          style={{
            backgroundColor: 'white',
            color: 'black'
          }}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
        <Button
          appearance="subtle"
          icon={<DocumentPdf24Regular style={{ color: 'black' }} />}
          onClick={onExportReport}
          disabled={!hasData}
          style={{
            backgroundColor: 'white',
            color: 'black'
          }}
        >
          Export Report
        </Button>
      </div>
    </div>
  );
};
