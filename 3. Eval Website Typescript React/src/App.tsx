/**
 * Main App Component
 * Combines all major components and manages global state
 */

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/Layout/Layout';
import { ConversationEvaluator } from './components/ConversationEvaluator/ConversationEvaluator';
import { StatusTracker } from './components/StatusTracker/StatusTracker';
import { Dashboard } from './components/Dashboard/Dashboard';
import { useStatusPolling } from './hooks/useStatusPolling';
import { STORAGE_KEYS } from './utils/constants';
import './App.css';

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5000,
    },
  },
});

/**
 * Main application component
 */
const AppContent: React.FC = () => {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    return (saved as 'light' | 'dark') || 'light';
  });

  // Status polling hook for real-time updates
  const { status, isPolling } = useStatusPolling();

  // Toggle theme
  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
  };

  return (
    <Layout theme={theme} onThemeToggle={handleThemeToggle}>
      <div className="app-content">
        {/* Main Evaluation Section */}
        <section className="evaluation-section">
          <ConversationEvaluator />
        </section>

        {/* Status Tracker - Shows when evaluation is in progress */}
        {(status || isPolling) && (
          <section className="status-section">
            <StatusTracker status={status} isPolling={isPolling} />
          </section>
        )}

        {/* Dashboard Section */}
        <section className="dashboard-section">
          <Dashboard />
        </section>
      </div>
    </Layout>
  );
};

/**
 * App wrapper with QueryClientProvider
 */
export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
};

export default App;
