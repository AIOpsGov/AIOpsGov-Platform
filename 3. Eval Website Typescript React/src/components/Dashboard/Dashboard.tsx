/**
 * Dashboard Component
 * Main dashboard displaying evaluation statistics and results
 */

import React from 'react';
import {
  Card,
  Text,
  Button,
  Spinner,
  Badge,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Input,
  Field,
  Dropdown,
  Option,
} from '@fluentui/react-components';
import {
  ArrowSync24Regular,
  CheckmarkCircle24Filled,
  DismissCircle24Filled,
  ChartMultiple24Regular,
  DataUsage24Regular,
  Timer24Regular,
  People24Regular,
  Dismiss24Regular,
  Filter24Regular,
} from '@fluentui/react-icons';
import { useDashboard } from '../../hooks/useDashboard';
import { MetricsCard } from './MetricsCard';
import { EvaluationChart } from './EvaluationChart';
import { EvaluationDetails } from './EvaluationDetails';
import { ConversationTranscript } from './ConversationTranscript';
import {
  formatDuration,
  formatRelativeTime,
  formatConversationId,
  formatPercentage,
  getScoreColor,
  getScoreLabel,
} from '../../utils/formatters';
import styles from './Dashboard.module.css';

/**
 * Main dashboard component with statistics and charts
 */
export const Dashboard: React.FC = () => {
  const { 
    data, 
    isLoading, 
    error, 
    refetch, 
    isRefetching,
    conversationIdFilter,
    setConversationIdFilter,
    timeRange,
    setTimeRange,
  } = useDashboard();

  const [tableFilter, setTableFilter] = React.useState('all'); // 'all', 'passed', 'failed'
  const [tableSearch, setTableSearch] = React.useState('');

  const timeRangeOptions = [
    { key: '30m', text: 'Last 30 Minutes' },
    { key: '24h', text: 'Last 24 Hours' },
    { key: '48h', text: 'Last 48 Hours' },
    { key: '7d', text: 'Last 7 Days' },
    { key: '30d', text: 'Last 30 Days' },
    { key: '90d', text: 'Last 90 Days' },
  ];

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConversationIdFilter(e.target.value);
  };

  const handleClearFilter = () => {
    setConversationIdFilter('');
  };

  const handleTableSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTableSearch(e.target.value);
  };

  const handleClearTableSearch = () => {
    setTableSearch('');
  };

  // Filter recent evaluations based on table filters
  const filteredEvaluations = React.useMemo(() => {
    if (!data || !data.recentEvaluations) return [];
    
    return data.recentEvaluations.filter((evaluation) => {
      // Filter by pass/fail status
      if (tableFilter === 'passed' && !evaluation.passed) return false;
      if (tableFilter === 'failed' && evaluation.passed) return false;
      
      // Filter by conversation ID search
      if (tableSearch && !evaluation.conversationId.toLowerCase().includes(tableSearch.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }, [data, tableFilter, tableSearch]);

  if (isLoading) {
    return (
      <Card className={styles.card}>
        <div className={styles.loading}>
          <Spinner size="large" label="Loading dashboard data..." />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={styles.card}>
        <div className={styles.error}>
          <Text size={400} weight="semibold">
            Failed to load dashboard data
          </Text>
          <Text size={300}>{error}</Text>
          <Button appearance="primary" onClick={refetch}>
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  if (!data || data.summary.totalEvaluations === 0) {
    return (
      <div className={styles.dashboard}>
        {/* Header */}
        <div className={styles.dashboardHeader}>
          <div>
            <Text size={600} weight="semibold">
              Evaluation Dashboard
            </Text>
          </div>
          <Button
            appearance="subtle"
            icon={<ArrowSync24Regular />}
            onClick={refetch}
            disabled={isRefetching}
          >
            {isRefetching ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        {/* Filter Section - Still show even with no data */}
        <Card className={styles.filterCard}>
          <Field
            label="Filter by Conversation ID"
            hint="Enter a conversation ID to see evaluations for that specific conversation (last 30 days)"
          >
            <div className={styles.filterInput}>
              <Input
                value={conversationIdFilter}
                onChange={handleFilterChange}
                placeholder="e.g., conv-2024-abc123"
                contentBefore={<Filter24Regular />}
                contentAfter={
                  conversationIdFilter && (
                    <Button
                      appearance="transparent"
                      icon={<Dismiss24Regular />}
                      size="small"
                      onClick={handleClearFilter}
                      title="Clear filter"
                    />
                  )
                }
              />
            </div>
          </Field>
          {conversationIdFilter && (
            <Text size={200} className={styles.filterNote}>
              Showing results for: <strong>{conversationIdFilter}</strong>
            </Text>
          )}
        </Card>

        <Card className={styles.card}>
          <div className={styles.noData}>
            <Text size={500} weight="semibold">No evaluation data available</Text>
            <Text size={300} className={styles.noDataText}>
              {conversationIdFilter 
                ? `No evaluations found for conversation ID: "${conversationIdFilter}"`
                : 'No evaluations have been completed yet. Run an evaluation to see results here.'
              }
            </Text>
            <Text size={200} className={styles.noDataHint}>
              💡 Tip: Make sure your Azure Function is logging "EvaluationCompleted" events to Application Insights with custom dimensions: jobId, conversationId, overallScore, passed, duration
            </Text>
            <Text size={200} className={styles.noDataHint}>
              🔍 Check the browser console (F12) for detailed query results
            </Text>
            <Button appearance="primary" onClick={refetch}>
              Refresh
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.dashboardHeader}>
        <div className={styles.headerTextContainer}>
          <Text size={600} weight="semibold" as="div">
            Evaluation Dashboard
          </Text>
          <Text size={300} className={styles.lastUpdated} as="div">
            Last updated: {formatRelativeTime(data.summary.lastUpdated)}
          </Text>
        </div>
        <Button
          appearance="subtle"
          icon={<ArrowSync24Regular />}
          onClick={refetch}
          disabled={isRefetching}
        >
          {isRefetching ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Filter Section */}
      <Card className={styles.filterCard}>
        <div className={styles.filterContainer}>
          <Field
            label="Filter by Conversation ID"
            hint="Enter a conversation ID to see evaluations for that specific conversation"
            className={styles.filterField}
          >
            <Input
              value={conversationIdFilter}
              onChange={handleFilterChange}
              placeholder="e.g., conv-2024-abc123"
              contentBefore={<Filter24Regular />}
              contentAfter={
                conversationIdFilter && (
                  <Button
                    appearance="transparent"
                    icon={<Dismiss24Regular />}
                    size="small"
                    onClick={handleClearFilter}
                    title="Clear filter"
                  />
                )
              }
            />
          </Field>
          
          <Field
            label="Time Range"
            hint="Select the time period for evaluation data"
            className={styles.filterField}
          >
            <Dropdown
              value={timeRangeOptions.find(opt => opt.key === timeRange)?.text || 'Last 30 Days'}
              selectedOptions={[timeRange]}
              onOptionSelect={(_, data) => setTimeRange(data.optionValue as string)}
            >
              {timeRangeOptions.map((option) => (
                <Option key={option.key} value={option.key}>
                  {option.text}
                </Option>
              ))}
            </Dropdown>
          </Field>
        </div>
        
        {conversationIdFilter && (
          <Text size={200} className={styles.filterNote}>
            Showing results for: <strong>{conversationIdFilter}</strong>
          </Text>
        )}
      </Card>

      {/* Summary Metrics */}
      <div className={styles.metricsGrid}>
        <MetricsCard
          title="Total Conversations"
          value={data.summary.totalEvaluations}
          icon={<ChartMultiple24Regular />}
          subtitle="Evaluated (Last 30 days)"
        />
        <MetricsCard
          title="Customer Satisfaction"
          value={`${data.summary.averageScore.toFixed(1)}%`}
          icon={<DataUsage24Regular />}
          subtitle={`${getScoreLabel(data.summary.averageScore)} - Overall Quality`}
          color={getScoreColor(data.summary.averageScore)}
        />
        <MetricsCard
          title="Success Rate"
          value={`${data.summary.passRate.toFixed(1)}%`}
          icon={<CheckmarkCircle24Filled />}
          subtitle="Conversations meeting quality threshold"
          color={getScoreColor(data.summary.passRate)}
        />
        <MetricsCard
          title="AI Efficiency"
          value={`${data.summary.averageTokens || 0}`}
          icon={<Timer24Regular />}
          subtitle="Avg tokens per conversation"
        />
      </div>

      {/* Business Insights Section */}
      <Card className={styles.insightsCard}>
        <div className={styles.insightsHeader}>
          <Text size={500} weight="semibold">Business Insights</Text>
        </div>
        <div className={styles.insightsGrid}>
          <div className={styles.insightItem}>
            <Text size={300} weight="semibold" className={styles.insightLabel}>
              🎯 Helpfulness Score
            </Text>
            <Text size={400} weight="bold" style={{ color: getScoreColor(data.summary.avgHelpfulness || 0) }}>
              {(data.summary.avgHelpfulness || 0).toFixed(1)}%
            </Text>
            <Text size={200} className={styles.insightDescription}>
              How well the AI addresses customer needs
            </Text>
          </div>
          <div className={styles.insightItem}>
            <Text size={300} weight="semibold" className={styles.insightLabel}>
              👔 Professionalism Score
            </Text>
            <Text size={400} weight="bold" style={{ color: getScoreColor(data.summary.avgProfessionalism || 0) }}>
              {(data.summary.avgProfessionalism || 0).toFixed(1)}%
            </Text>
            <Text size={200} className={styles.insightDescription}>
              Brand tone and communication quality
            </Text>
          </div>
          <div className={styles.insightItem}>
            <Text size={300} weight="semibold" className={styles.insightLabel}>
              🎪 Relevancy Score
            </Text>
            <Text size={400} weight="bold" style={{ color: getScoreColor(data.summary.avgRelevancy || 0) }}>
              {(data.summary.avgRelevancy || 0).toFixed(1)}%
            </Text>
            <Text size={200} className={styles.insightDescription}>
              Accuracy of product recommendations
            </Text>
          </div>
          <div className={styles.insightItem}>
            <Text size={300} weight="semibold" className={styles.insightLabel}>
              ✅ Problem Resolution
            </Text>
            <Text size={400} weight="bold" style={{ color: getScoreColor(data.summary.avgProblemResolution || 0) }}>
              {(data.summary.avgProblemResolution || 0).toFixed(1)}%
            </Text>
            <Text size={200} className={styles.insightDescription}>
              Customer issue resolution effectiveness
            </Text>
          </div>
        </div>
      </Card>

      {/* Charts Section */}
      <div className={styles.chartsGrid}>
        {data.scoreDistribution && data.scoreDistribution.length > 0 && (
          <Card className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <div className={styles.chartHeaderText}>
                <Text size={500} weight="semibold" as="div">Quality Distribution</Text>
                <Text size={200} className={styles.chartSubtitle} as="div">
                  How conversations perform across quality bands
                </Text>
              </div>
            </div>
            <div className={styles.distributionLegend}>
              <div className={styles.legendItem}>
                <Badge appearance="tint" style={{ backgroundColor: '#107C10' }}>90-100%</Badge>
                <Text size={200}>Excellent - Exceeds expectations</Text>
              </div>
              <div className={styles.legendItem}>
                <Badge appearance="tint" style={{ backgroundColor: '#0078D4' }}>75-89%</Badge>
                <Text size={200}>Good - Meets quality standards</Text>
              </div>
              <div className={styles.legendItem}>
                <Badge appearance="tint" style={{ backgroundColor: '#FFB900' }}>60-74%</Badge>
                <Text size={200}>Fair - Needs improvement</Text>
              </div>
              <div className={styles.legendItem}>
                <Badge appearance="tint" style={{ backgroundColor: '#D13438' }}>&lt;60%</Badge>
                <Text size={200}>Poor - Requires attention</Text>
              </div>
            </div>
            <EvaluationChart
              type="distribution"
              data={data.scoreDistribution}
              title=""
            />
          </Card>
        )}
        {data.metricAverages && data.metricAverages.length > 0 && (
          <EvaluationChart
            type="metrics"
            data={data.metricAverages}
            title="Average Scores by Metric"
          />
        )}
      </div>

      {data.trends && data.trends.length > 0 && (
        <div className={styles.trendsSection}>
          <EvaluationChart
            type="trends"
            data={data.trends}
            title="Performance Trends"
          />
        </div>
      )}

      {/* Recent Evaluations Table */}
      <Card className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <Text size={500} weight="semibold">
            Recent Evaluations
          </Text>
        </div>

        {/* Table Filters */}
        <div className={styles.tableFilters}>
          <div className={styles.tableSearchBox}>
            <Input
              value={tableSearch}
              onChange={handleTableSearchChange}
              placeholder="Search by conversation ID..."
              size="small"
              contentAfter={
                tableSearch && (
                  <Button
                    appearance="transparent"
                    icon={<Dismiss24Regular />}
                    size="small"
                    onClick={handleClearTableSearch}
                    title="Clear search"
                  />
                )
              }
            />
          </div>
          <div className={styles.tableFilterButtons}>
            <Button
              appearance={tableFilter === 'all' ? 'primary' : 'subtle'}
              onClick={() => setTableFilter('all')}
              size="small"
            >
              All ({data.recentEvaluations?.length || 0})
            </Button>
            <Button
              appearance={tableFilter === 'passed' ? 'primary' : 'subtle'}
              onClick={() => setTableFilter('passed')}
              size="small"
              icon={<CheckmarkCircle24Filled />}
            >
              Passed ({data.recentEvaluations?.filter(e => e.passed).length || 0})
            </Button>
            <Button
              appearance={tableFilter === 'failed' ? 'primary' : 'subtle'}
              onClick={() => setTableFilter('failed')}
              size="small"
              icon={<DismissCircle24Filled />}
            >
              Failed ({data.recentEvaluations?.filter(e => !e.passed).length || 0})
            </Button>
          </div>
        </div>
        
        {filteredEvaluations && filteredEvaluations.length > 0 ? (
          <div className={styles.tableContainer}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>Conversation ID</TableHeaderCell>
                  <TableHeaderCell>Score</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Evaluated</TableHeaderCell>
                  <TableHeaderCell>Actions</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvaluations.map((evaluation, index) => (
                  <React.Fragment key={evaluation.jobId || `eval-${index}`}>
                    <TableRow>
                      <TableCell>
                        <Text
                          size={300}
                          font="monospace"
                          title={evaluation.conversationId}
                        >
                          {formatConversationId(evaluation.conversationId)}
                        </Text>
                      </TableCell>
                      <TableCell>
                        <Text
                          size={300}
                          weight="semibold"
                          style={{ color: getScoreColor(evaluation.score) }}
                        >
                          {evaluation.score.toFixed(1)}%
                        </Text>
                      </TableCell>
                      <TableCell>
                        <Badge
                          color={evaluation.passed ? 'success' : 'danger'}
                          icon={
                            evaluation.passed ? (
                              <CheckmarkCircle24Filled style={{ color: '#107C10' }} />
                            ) : (
                              <DismissCircle24Filled style={{ color: '#D13438' }} />
                            )
                          }
                        >
                          {evaluation.passed ? 'Passed' : 'Failed'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Text size={300}>
                          {formatRelativeTime(evaluation.evaluatedAt)}
                        </Text>
                      </TableCell>
                      <TableCell>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <ConversationTranscript conversationId={evaluation.conversationId} />
                          <EvaluationDetails evaluation={evaluation} />
                        </div>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className={styles.noData}>
            <Text size={300}>
              {tableSearch || tableFilter !== 'all' 
                ? 'No evaluations match the current filters' 
                : 'No recent evaluations'}
            </Text>
            {(tableSearch || tableFilter !== 'all') && (
              <Button 
                appearance="subtle" 
                size="small"
                onClick={() => {
                  setTableSearch('');
                  setTableFilter('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
