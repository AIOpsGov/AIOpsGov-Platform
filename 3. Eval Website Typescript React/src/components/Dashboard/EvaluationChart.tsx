/**
 * Evaluation Chart Component
 * Displays charts for score distribution and trends
 */

import React from 'react';
import { Text, Card } from '@fluentui/react-components';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  ScoreDistribution,
  MetricAverage,
  TrendData,
} from '../../services/types';
import { CHART_COLORS } from '../../utils/constants';
import styles from './Dashboard.module.css';

interface EvaluationChartProps {
  type: 'distribution' | 'metrics' | 'trends';
  data: ScoreDistribution[] | MetricAverage[] | TrendData[];
  title: string;
}

/**
 * Chart component with multiple visualization types
 */
export const EvaluationChart: React.FC<EvaluationChartProps> = ({
  type,
  data,
  title,
}) => {
  const renderDistributionChart = (chartData: ScoreDistribution[]) => {
    // Define colors for each score range
    const getBarColor = (range: string) => {
      if (range === '90-100') return '#107C10'; // Green - Excellent
      if (range === '75-89') return '#0078D4';  // Blue - Good
      if (range === '60-74') return '#FFB900';  // Orange - Fair
      // For ranges below 60 (both 40-59 and 0-39)
      return '#D13438'; // Red - Poor
    };

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="range"
            tick={{ fontSize: 12 }}
            stroke="#666"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="#666"
            label={{ value: 'Count', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
          <Bar
            dataKey="count"
            radius={[8, 8, 0, 0]}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.range)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderMetricsChart = (chartData: MetricAverage[]) => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis
          type="number"
          domain={[0, 100]}
          tick={{ fontSize: 12 }}
          stroke="#666"
        />
        <YAxis
          type="category"
          dataKey="metric"
          tick={{ fontSize: 12 }}
          stroke="#666"
          width={120}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        />
        <Bar
          dataKey="average"
          fill={CHART_COLORS.success}
          radius={[0, 8, 8, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderTrendsChart = (chartData: TrendData[]) => (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
          stroke="#666"
        />
        <YAxis
          tick={{ fontSize: 12 }}
          stroke="#666"
          domain={[0, 100]}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="averageScore"
          stroke={CHART_COLORS.primary}
          strokeWidth={2}
          dot={{ fill: CHART_COLORS.primary, r: 4 }}
          name="Average Score"
        />
        <Line
          type="monotone"
          dataKey="passRate"
          stroke={CHART_COLORS.success}
          strokeWidth={2}
          dot={{ fill: CHART_COLORS.success, r: 4 }}
          name="Pass Rate %"
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const renderChart = () => {
    if (!data || data.length === 0) {
      return (
        <div className={styles.noData}>
          <Text size={400} className={styles.noDataText}>
            No data available
          </Text>
        </div>
      );
    }

    switch (type) {
      case 'distribution':
        return renderDistributionChart(data as ScoreDistribution[]);
      case 'metrics':
        return renderMetricsChart(data as MetricAverage[]);
      case 'trends':
        return renderTrendsChart(data as TrendData[]);
      default:
        return null;
    }
  };

  return (
    <Card className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <Text size={400} weight="semibold">
          {title}
        </Text>
      </div>
      <div className={styles.chartContent}>
        {renderChart()}
      </div>
    </Card>
  );
};

export default EvaluationChart;
