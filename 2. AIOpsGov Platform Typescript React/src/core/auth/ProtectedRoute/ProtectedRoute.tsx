/**
 * Protected Route Component
 * Restricts access based on user roles
 */

import React from 'react';
import { useAuth, UserRole } from '../AuthContext';
import { Spinner, Text, Button, Card } from '@fluentui/react-components';
import { ShieldError24Regular } from '@fluentui/react-icons';
import styles from './ProtectedRoute.module.css';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
  redirectTo = '/',
}) => {
  const { isLoading, hasRole } = useAuth();

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size="large" label="Loading..." />
      </div>
    );
  }

  // Check if user has required roles
  if (requiredRoles && requiredRoles.length > 0) {
    if (!hasRole(requiredRoles)) {
      return (
        <div className={styles.container}>
          <Card className={styles.accessDenied}>
            <div className={styles.icon}>
              <ShieldError24Regular style={{ width: '64px', height: '64px', color: '#d13438' }} />
            </div>
            <Text size={800} weight="bold" className={styles.deniedTitle}>
              Access Denied
            </Text>
            <Text size={500} className={styles.deniedMessage}>
              You don't have permission to access this page.
            </Text>
            <Text size={300} className={styles.deniedInfo}>
              Required roles: {requiredRoles.map(r => r.split('.')[1]).join(', ')}
            </Text>
            <Text size={300} className={styles.deniedContact}>
              Contact your administrator if you believe this is an error.
            </Text>
            <Button
              appearance="primary"
              size="large"
              onClick={() => window.location.href = redirectTo}
            >
              Return to Home
            </Button>
          </Card>
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
