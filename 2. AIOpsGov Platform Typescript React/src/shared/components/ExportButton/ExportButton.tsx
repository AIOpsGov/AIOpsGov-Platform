/**
 * Export Button Component
 * Allows executives to export dashboard data
 */

import React from 'react';
import {
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  Button,
} from '@fluentui/react-components';
import {
  ArrowDownload24Regular,
  DocumentPdf24Regular,
  TableSimple24Regular,
  Print24Regular,
} from '@fluentui/react-icons';

interface ExportButtonProps {
  dashboardData: any;
  timeRange: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ dashboardData, timeRange }) => {
  const exportToCSV = () => {
    if (!dashboardData || !dashboardData.recentEvaluations) return;

    const headers = [
      'Conversation ID',
      'Overall Score',
      'Status',
      'Helpfulness',
      'Professionalism',
      'Relevancy',
      'Problem Resolution',
      'Tokens Used',
      'Evaluated At',
    ];

    const rows = dashboardData.recentEvaluations.map((evaluation: any) => [
      evaluation.conversationId,
      evaluation.overallScore?.toFixed(2) || evaluation.score?.toFixed(2) || '0',
      evaluation.passed ? 'Passed' : 'Failed',
      evaluation.helpfulness_score?.toFixed(2) || '0',
      evaluation.professionalism_score?.toFixed(2) || '0',
      evaluation.relevancy_score?.toFixed(2) || '0',
      evaluation.problem_resolution_score?.toFixed(2) || '0',
      evaluation.tokensUsed || '0',
      new Date(evaluation.evaluatedAt).toLocaleString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row: any[]) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `copilot-eval-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportSummaryJSON = () => {
    if (!dashboardData) return;

    const summary = {
      exportedAt: new Date().toISOString(),
      timeRange,
      summary: dashboardData.summary,
      scoreDistribution: dashboardData.scoreDistribution,
      failedConversationsCount: dashboardData.failedConversations?.length || 0,
      recentEvaluations: dashboardData.recentEvaluations,
    };

    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `copilot-eval-summary-${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printDashboard = () => {
    window.print();
  };

  const generatePDFReport = () => {
    // For PDF generation, we'd typically use a library like jsPDF or html2canvas
    // For now, we'll use the browser's print to PDF functionality
    alert('Use your browser\'s Print function and select "Save as PDF" as the destination.\n\nTip: Set layout to Landscape for best results!');
    setTimeout(() => window.print(), 500);
  };

  return (
    <Menu>
      <MenuTrigger disableButtonEnhancement>
        <Button
          appearance="primary"
          icon={<ArrowDownload24Regular />}
        >
          Export
        </Button>
      </MenuTrigger>

      <MenuPopover>
        <MenuList>
          <MenuItem
            icon={<TableSimple24Regular />}
            onClick={exportToCSV}
          >
            Export to CSV
          </MenuItem>
          <MenuItem
            icon={<DocumentPdf24Regular />}
            onClick={generatePDFReport}
          >
            Export to PDF
          </MenuItem>
          <MenuItem
            icon={<ArrowDownload24Regular />}
            onClick={exportSummaryJSON}
          >
            Export Summary (JSON)
          </MenuItem>
          <MenuItem
            icon={<Print24Regular />}
            onClick={printDashboard}
          >
            Print Dashboard
          </MenuItem>
        </MenuList>
      </MenuPopover>
    </Menu>
  );
};

export default ExportButton;
