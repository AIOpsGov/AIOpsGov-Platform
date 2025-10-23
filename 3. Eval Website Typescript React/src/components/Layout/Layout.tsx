/**
 * Main Layout Component
 * Provides consistent layout structure with header and content area
 */

import React from 'react';
import {
  FluentProvider,
  webLightTheme,
  webDarkTheme,
  Text,
  Button,
  Toolbar,
  ToolbarButton,
} from '@fluentui/react-components';
import {
  WeatherMoon24Regular,
  WeatherSunny24Regular,
  Info24Regular,
} from '@fluentui/react-icons';
import styles from './Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
  theme?: 'light' | 'dark';
  onThemeToggle?: () => void;
}

/**
 * Layout wrapper component with theme support
 */
export const Layout: React.FC<LayoutProps> = ({
  children,
  theme = 'light',
  onThemeToggle,
}) => {
  const currentTheme = theme === 'dark' ? webDarkTheme : webLightTheme;

  return (
    <FluentProvider theme={currentTheme}>
      <div className={styles.layout}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.titleSection}>
              <Text size={600} weight="semibold" className={styles.title}>
                Conversation Evaluation System
              </Text>
              <Text size={300} className={styles.subtitle}>
                Automated conversation quality analysis powered by Azure
              </Text>
            </div>
            
            <Toolbar className={styles.toolbar}>
              <ToolbarButton
                aria-label="Toggle theme"
                icon={theme === 'dark' ? <WeatherSunny24Regular /> : <WeatherMoon24Regular />}
                onClick={onThemeToggle}
              >
                {theme === 'dark' ? 'Light' : 'Dark'} Mode
              </ToolbarButton>
              <ToolbarButton
                aria-label="About"
                icon={<Info24Regular />}
              >
                About
              </ToolbarButton>
            </Toolbar>
          </div>
        </header>

        {/* Main Content */}
        <main className={styles.main}>
          <div className={styles.container}>
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className={styles.footer}>
          <Text size={200} className={styles.footerText}>
            © 2025 Conversation Evaluation System. Powered by Azure Automation & Application Insights.
          </Text>
        </footer>
      </div>
    </FluentProvider>
  );
};

export default Layout;
