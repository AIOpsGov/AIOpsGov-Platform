/**
 * Main Layout Component
 * Provides consistent layout structure with header and content area
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FluentProvider,
  webLightTheme,
  Text,
  Toolbar,
  ToolbarButton,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  MenuDivider,
  Avatar,
  Badge,
} from '@fluentui/react-components';
import {
  Home24Regular,
  ChartMultiple24Regular,
  SignOut24Regular,
  Person24Regular,
  ChevronDown20Regular,
} from '@fluentui/react-icons';
import { useAuth } from '../../../core/auth/AuthContext';
import styles from './Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Layout wrapper component with navigation
 */
export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout, canAccessEvaluation } = useAuth();
  const [dashboardMenuOpen, setDashboardMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  const isDashboardActive = location.pathname.startsWith('/dynamics365-intent-evaluation');

  return (
    <FluentProvider theme={webLightTheme}>
      <div className={styles.layout}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.titleSection} onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
              <Text size={700} weight="bold" className={styles.title}>
                AIOpsGov
              </Text>
              <Text size={400} className={styles.subtitle}>
                AI Metrics Hub
              </Text>
            </div>
            
            <div className={styles.headerRight}>
              <Toolbar className={styles.toolbar}>
                <ToolbarButton
                  aria-label="Home"
                  icon={<Home24Regular />}
                  onClick={() => navigate('/')}
                  appearance="subtle"
                  data-home-button="true"
                  style={{
                    backgroundColor: 'white',
                    color: 'black'
                  }}
                >
                  Home
                </ToolbarButton>

                {/* Dashboards Dropdown */}
                {canAccessEvaluation && (
                  <Menu open={dashboardMenuOpen} onOpenChange={(e, data) => setDashboardMenuOpen(data.open)}>
                    <MenuTrigger disableButtonEnhancement>
                      <ToolbarButton
                        aria-label="Dashboards"
                        icon={<ChartMultiple24Regular />}
                        appearance={isDashboardActive ? 'primary' : 'subtle'}
                      >
                        Dashboards
                        <ChevronDown20Regular className={styles.chevron} />
                      </ToolbarButton>
                    </MenuTrigger>
                    <MenuPopover>
                      <MenuList>
                        <MenuItem
                          onClick={() => {
                            navigate('/dynamics365-intent-evaluation');
                            setDashboardMenuOpen(false);
                          }}
                        >
                          <div className={styles.menuItemContent}>
                            <div className={styles.menuItemTitle}>AIOpsGov Evaluation</div>
                            <div className={styles.menuItemDescription}>Monitor intent recognition accuracy</div>
                          </div>
                        </MenuItem>
                      </MenuList>
                    </MenuPopover>
                  </Menu>
                )}
              </Toolbar>

              {isAuthenticated && user && (
                <Menu>
                  <MenuTrigger>
                    <div className={styles.userMenu}>
                      <Avatar 
                        name={user.userDetails} 
                        size={32}
                        color="colorful"
                      />
                      <Text size={300} className={styles.userName}>
                        {user.userDetails}
                      </Text>
                    </div>
                  </MenuTrigger>
                  <MenuPopover>
                    <MenuList>
                      <MenuItem icon={<Person24Regular />} disabled>
                        <div>
                          <div>{user.userDetails}</div>
                          <div className={styles.userEmail}>{user.userId}</div>
                        </div>
                      </MenuItem>
                      <MenuDivider />
                      <MenuItem>
                        <div className={styles.rolesSection}>
                          <Text size={200} weight="semibold">Your Roles:</Text>
                          <div className={styles.rolesList}>
                            {user.userRoles.map((role, index) => (
                              <Badge key={index} size="small" appearance="outline">
                                {role.split('.')[1] || role}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </MenuItem>
                      <MenuDivider />
                      <MenuItem icon={<SignOut24Regular />} onClick={logout}>
                        Sign Out
                      </MenuItem>
                    </MenuList>
                  </MenuPopover>
                </Menu>
              )}
            </div>
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
            © 2025 AIOpsGov. All rights reserved.
          </Text>
        </footer>
      </div>
    </FluentProvider>
  );
};

export default Layout;
