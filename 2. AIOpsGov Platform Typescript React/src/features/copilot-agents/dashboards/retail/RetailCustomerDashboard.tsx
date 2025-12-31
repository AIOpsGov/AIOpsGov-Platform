/**
 * Retail Customer Experience Dashboard
 * Industry-specific dashboard for retail services
 */

import React, { useState } from 'react';
import { Button, Dropdown, Option, Field, Text } from '@fluentui/react-components';
import { ArrowSync24Regular, DocumentPdf24Regular } from '@fluentui/react-icons';
import { DashboardLayout } from '../../../../shared/components/DashboardLayout';
import { MetricCard } from '../../../../shared/cards/MetricCard';
import { OrderTracking } from './components/OrderTracking';
import { ProductInquiry } from './components/ProductInquiry';
import { ReturnManagement } from './components/ReturnManagement';
import { useCopilotDashboard } from '../../../../shared/hooks/useCopilotDashboard';
import { getDashboardConfig } from '../../../../core/config/dashboardConfigs';
import styles from './RetailCustomerDashboard.module.css';

export const RetailCustomerDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const dashboardConfig = getDashboardConfig('retail-customer');
  
  if (!dashboardConfig) {
    return <div>Dashboard configuration not found</div>;
  }
  
  const {
    sessions,
    topicMetrics,
    agentPerformance,
    anomalies,
    loading,
    error,
    refetch
  } = useCopilotDashboard(dashboardConfig, dashboardConfig.agentName, timeRange);

  const handleRefresh = () => {
    refetch();
  };

  const handleExport = () => {
    console.log('Exporting Retail Customer Experience Report...');
  };

  const headerActions = (
    <div className={styles.headerActions}>
      <Field label="Time Range">
        <Dropdown
          value={timeRange === '24h' ? 'Last 24 Hours' : 
                 timeRange === '7d' ? 'Last 7 Days' : 
                 timeRange === '30d' ? 'Last 30 Days' : 
                 'Last 90 Days'}
          selectedOptions={[timeRange]}
          onOptionSelect={(_, data) => {
            if (data.optionValue) {
              setTimeRange(data.optionValue as string);
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
        icon={<ArrowSync24Regular />}
        onClick={handleRefresh}
        disabled={loading}
      >
        {loading ? 'Refreshing...' : 'Refresh'}
      </Button>
      <Button
        appearance="subtle"
        icon={<DocumentPdf24Regular />}
        onClick={handleExport}
        disabled={!agentPerformance}
      >
        Export Report
      </Button>
    </div>
  );

  if (loading && !agentPerformance && !error) {
    return (
      <DashboardLayout title={dashboardConfig.name} subtitle={dashboardConfig.description}>
        <div className={styles.loading}>Loading retail customer data...</div>
      </DashboardLayout>
    );
  }

  const showPlaceholder = error || !agentPerformance;

  return (
    <DashboardLayout
      title={dashboardConfig.name}
      subtitle={dashboardConfig.description}
      headerActions={headerActions}
    >
      {error && (
        <div className={styles.errorBanner}>
          <strong>⚠️ Failed to load data</strong>
          <p>
            The Function App endpoint may not be deployed or configured. 
            Please set the environment variable: <code>{dashboardConfig.functionAppEnvVar}</code>
          </p>
          <p className={styles.errorDetails}>Error: {error.message}</p>
        </div>
      )}

      <div className={styles.metricsGrid}>
        {dashboardConfig.kpis.map((kpi) => (
          <MetricCard
            key={kpi.id}
            title={kpi.name}
            value={showPlaceholder ? '--' : (agentPerformance?.[kpi.metric as keyof typeof agentPerformance] as number || 0)}
            subtitle={showPlaceholder ? 'No data available' : kpi.description}
            color={dashboardConfig.color}
            target={kpi.target}
            format={kpi.format as any}
          />
        ))}
      </div>

      <OrderTracking 
        data={showPlaceholder ? [] : sessions}
        config={dashboardConfig}
        timeRange={timeRange}
      />

      <ProductInquiry
        data={showPlaceholder ? [] : topicMetrics}
        config={dashboardConfig}
        timeRange={timeRange}
      />

      <ReturnManagement
        conversations={showPlaceholder ? [] : sessions}
        config={dashboardConfig}
      />

      {!showPlaceholder && anomalies.length > 0 && (
        <div className={styles.alertsSection}>
          <h3>Inventory & Quality Alerts</h3>
          {anomalies.map((alert, index) => (
            <div key={index} className={`${styles.alert} ${styles[alert.severity]}`}>
              <strong>{alert.title}</strong>
              <p>{alert.description}</p>
            </div>
          ))}
        </div>
      )}

      {!error && showPlaceholder && (
        <div className={styles.placeholderMessage}>
          <Text size={500}>🛒 Dashboard Ready - Waiting for Data</Text>
          <Text size={300}>
            Configure your Function App and Application Insights to see live metrics here.
          </Text>
        </div>
      )}
    </DashboardLayout>
  );
};

export default RetailCustomerDashboard;
