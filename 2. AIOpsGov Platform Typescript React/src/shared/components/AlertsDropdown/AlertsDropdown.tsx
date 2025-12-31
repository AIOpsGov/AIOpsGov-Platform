/**
 * Alerts Dropdown Component
 * Displays aggregated alerts and action items in collapsible format
 */

import React, { useState } from 'react';
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  Badge,
  Button,
  Card,
  Text,
} from '@fluentui/react-components';
import {
  Warning24Regular,
  ErrorCircle24Filled,
  ChevronDown24Regular,
  ChevronUp24Regular,
} from '@fluentui/react-icons';

export interface AlertItem {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action?: string;
  actionHandler?: () => void;
  timestamp?: string;
  category: 'runtime' | 'accuracy' | 'sentiment' | 'cost' | 'system';
}

interface AlertsDropdownProps {
  alerts: AlertItem[];
  /** Whether to show expanded by default */
  defaultExpanded?: boolean;
  /** Custom title */
  title?: string;
}

/**
 * AlertsDropdown Component
 * 
 * Aggregates and displays all alerts and action items from:
 * - Runtime threshold violations (PA flow > 5 min)
 * - Low accuracy warnings
 * - Sentiment issues (0% sentiment, negative trends)
 * - Cost alerts (D&T view)
 * - System errors
 */
export const AlertsDropdown: React.FC<AlertsDropdownProps> = ({
  alerts,
  defaultExpanded = true,
  title = 'Alerts & Action Items',
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Group alerts by severity
  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  const highAlerts = alerts.filter(a => a.severity === 'high');
  const mediumAlerts = alerts.filter(a => a.severity === 'medium');
  const lowAlerts = alerts.filter(a => a.severity === 'low');

  const getSeverityColor = (severity: AlertItem['severity']) => {
    switch (severity) {
      case 'critical':
        return '#d13438'; // Red
      case 'high':
        return '#f7630c'; // Orange
      case 'medium':
        return '#ffd33d'; // Yellow
      case 'low':
        return '#0078d4'; // Blue
      default:
        return '#666666';
    }
  };

  const getSeverityIcon = (severity: AlertItem['severity']) => {
    switch (severity) {
      case 'critical':
        return '🔴';
      case 'high':
        return '⚠️';
      case 'medium':
        return '⚡';
      case 'low':
        return 'ℹ️';
      default:
        return '•';
    }
  };

  const getSeverityBadgeColor = (severity: AlertItem['severity']): 'danger' | 'warning' | 'informative' => {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      default:
        return 'informative';
    }
  };

  const getCategoryLabel = (category: AlertItem['category']): string => {
    switch (category) {
      case 'runtime':
        return 'Performance';
      case 'accuracy':
        return 'Quality';
      case 'sentiment':
        return 'Customer Experience';
      case 'cost':
        return 'Cost';
      case 'system':
        return 'System';
      default:
        return 'General';
    }
  };

  if (alerts.length === 0) {
    return null;
  }

  return (
    <Card
      style={{
        padding: '1.5rem',
        marginBottom: '1.5rem',
        border: criticalAlerts.length > 0 ? '2px solid #d13438' : '1px solid #e0e0e0',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: isExpanded ? '1rem' : '0',
          cursor: 'pointer',
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Warning24Regular style={{ color: '#f7630c', fontSize: '24px' }} />
          <Text size={600} weight="semibold">
            {title}
          </Text>
          <Badge appearance="filled" color={criticalAlerts.length > 0 ? 'danger' : 'warning'}>
            {alerts.length}
          </Badge>
          {criticalAlerts.length > 0 && (
            <Badge appearance="filled" color="danger">
              {criticalAlerts.length} Critical
            </Badge>
          )}
        </div>
        <Button
          appearance="transparent"
          icon={isExpanded ? <ChevronUp24Regular /> : <ChevronDown24Regular />}
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
        />
      </div>

      {/* Alert List */}
      {isExpanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Critical Alerts */}
          {criticalAlerts.length > 0 && (
            <div>
              <Text size={400} weight="semibold" style={{ color: '#d13438', marginBottom: '0.5rem', display: 'block' }}>
                Critical Issues
              </Text>
              {criticalAlerts.map((alert) => (
                <AlertItemRow key={alert.id} alert={alert} />
              ))}
            </div>
          )}

          {/* High Priority Alerts */}
          {highAlerts.length > 0 && (
            <div>
              {criticalAlerts.length > 0 && <div style={{ borderTop: '1px solid #e0e0e0', margin: '0.5rem 0' }} />}
              <Text size={400} weight="semibold" style={{ color: '#f7630c', marginBottom: '0.5rem', display: 'block' }}>
                High Priority
              </Text>
              {highAlerts.map((alert) => (
                <AlertItemRow key={alert.id} alert={alert} />
              ))}
            </div>
          )}

          {/* Medium Priority Alerts */}
          {mediumAlerts.length > 0 && (
            <div>
              {(criticalAlerts.length > 0 || highAlerts.length > 0) && (
                <div style={{ borderTop: '1px solid #e0e0e0', margin: '0.5rem 0' }} />
              )}
              <Text size={400} weight="semibold" style={{ color: '#8b8b8b', marginBottom: '0.5rem', display: 'block' }}>
                Medium Priority
              </Text>
              {mediumAlerts.map((alert) => (
                <AlertItemRow key={alert.id} alert={alert} />
              ))}
            </div>
          )}

          {/* Low Priority Alerts */}
          {lowAlerts.length > 0 && (
            <div>
              {(criticalAlerts.length > 0 || highAlerts.length > 0 || mediumAlerts.length > 0) && (
                <div style={{ borderTop: '1px solid #e0e0e0', margin: '0.5rem 0' }} />
              )}
              {lowAlerts.map((alert) => (
                <AlertItemRow key={alert.id} alert={alert} />
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

/**
 * Individual Alert Item Row
 */
const AlertItemRow: React.FC<{ alert: AlertItem }> = ({ alert }) => {
  const getSeverityColor = (severity: AlertItem['severity']) => {
    switch (severity) {
      case 'critical':
        return '#fef6f7';
      case 'high':
        return '#fff4e5';
      case 'medium':
        return '#fffef5';
      case 'low':
        return '#f5f5f5';
      default:
        return '#f5f5f5';
    }
  };

  const getSeverityIcon = (severity: AlertItem['severity']) => {
    switch (severity) {
      case 'critical':
        return '🔴';
      case 'high':
        return '⚠️';
      case 'medium':
        return '⚡';
      case 'low':
        return 'ℹ️';
      default:
        return '•';
    }
  };

  const getCategoryLabel = (category: AlertItem['category']): string => {
    switch (category) {
      case 'runtime':
        return 'Performance';
      case 'accuracy':
        return 'Quality';
      case 'sentiment':
        return 'Customer Experience';
      case 'cost':
        return 'Cost';
      case 'system':
        return 'System';
      default:
        return 'General';
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        padding: '0.75rem',
        backgroundColor: getSeverityColor(alert.severity),
        borderRadius: '8px',
        marginBottom: '0.5rem',
      }}
    >
      <div style={{ fontSize: '20px', marginTop: '0.125rem' }}>
        {getSeverityIcon(alert.severity)}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <Text weight="semibold" size={400}>
            {alert.title}
          </Text>
          <Badge appearance="outline" size="small">
            {getCategoryLabel(alert.category)}
          </Badge>
        </div>
        <Text size={300} style={{ color: '#666', display: 'block', marginBottom: '0.5rem' }}>
          {alert.description}
        </Text>
        {alert.timestamp && (
          <Text size={200} style={{ color: '#999', display: 'block', marginBottom: '0.5rem' }}>
            {new Date(alert.timestamp).toLocaleString()}
          </Text>
        )}
      </div>
      {alert.action && (
        <Button
          size="small"
          appearance="subtle"
          onClick={alert.actionHandler}
        >
          {alert.action}
        </Button>
      )}
    </div>
  );
};
