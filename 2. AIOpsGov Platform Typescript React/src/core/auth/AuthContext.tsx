/**
 * Authentication Context and Utilities
 * Handles Azure AD Easy Auth with role-based access control
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// User roles matching Azure AD App Registration
export enum UserRole {
  ADMINISTRATOR = 'Administrator',
  LEGAL_USERS = 'LegalUsers',
  CONSTRUCTION_USERS = 'ConstructionUsers',
  HEALTHCARE_USERS = 'HealthcareUsers',
  FINANCE_USERS = 'FinanceUsers',
  RETAIL_USERS = 'RetailUsers',
  EDUCATION_USERS = 'EducationUsers',
  INSURANCE_USERS = 'InsuranceUsers',
  REALESTATE_USERS = 'RealEstateUsers',
  MANUFACTURING_USERS = 'ManufacturingUsers',
  HOSPITALITY_USERS = 'HospitalityUsers',
  TELECOM_USERS = 'TelecomUsers',
  GOVERNMENT_USERS = 'GovernmentUsers',
  TRANSPORT_USERS = 'TransportUsers',
  ENERGY_USERS = 'EnergyUsers',
  PHARMA_USERS = 'PharmaUsers',
  AGRICULTURE_USERS = 'AgricultureUsers',
  MEDIA_USERS = 'MediaUsers',
  LOGISTICS_USERS = 'LogisticsUsers',
  HR_USERS = 'HRUsers',
  IT_USERS = 'ITUsers',
}

// User information from Azure AD
export interface UserInfo {
  userId: string;
  userDetails: string;
  userRoles: string[];
  identityProvider: string;
  claims: Array<{ typ: string; val: string }>;
}

interface AuthContextType {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  isAdministrator: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      // Azure Easy Auth injects user info at this endpoint
      const response = await fetch('/.auth/me');
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        
        // Check if response is actually JSON
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          
          if (data && data.length > 0) {
            const userPrincipal = data[0];
            
            // Extract roles from claims - check both user_claims and claims arrays
            const allClaims = [
              ...(userPrincipal.user_claims || []),
              ...(userPrincipal.claims || [])
            ];
            
            const roleClaims = allClaims.filter(
              (claim: any) => claim.typ === 'roles' || claim.typ.endsWith('/role') || claim.typ.includes('role')
            );
            
            const roles = roleClaims.map((claim: any) => claim.val);

            setUser({
              userId: userPrincipal.user_id,
              userDetails: userPrincipal.user_claims?.find(
                (c: any) => c.typ === 'name' || c.typ.endsWith('/name')
              )?.val || userPrincipal.user_id,
              userRoles: roles,
              identityProvider: userPrincipal.identity_provider,
              claims: userPrincipal.claims,
            });
            return; // Successfully loaded user
          }
        }
      }
      
      // If we get here, Easy Auth is not available (development mode)
      if (import.meta.env.DEV) {
        console.log('Running in development mode - using mock user with ALL roles for full access');
        setUser({
          userId: 'dev-user',
          userDetails: 'Development User (Full Access)',
          userRoles: [
            UserRole.ADMINISTRATOR, // Full admin access
            UserRole.LEGAL_USERS,
            UserRole.CONSTRUCTION_USERS,
            UserRole.HEALTHCARE_USERS,
            UserRole.FINANCE_USERS,
            UserRole.RETAIL_USERS,
            UserRole.EDUCATION_USERS,
            UserRole.INSURANCE_USERS,
            UserRole.REALESTATE_USERS,
            UserRole.MANUFACTURING_USERS,
            UserRole.HOSPITALITY_USERS,
            UserRole.TELECOM_USERS,
            UserRole.GOVERNMENT_USERS,
            UserRole.TRANSPORT_USERS,
            UserRole.ENERGY_USERS,
            UserRole.PHARMA_USERS,
            UserRole.AGRICULTURE_USERS,
            UserRole.MEDIA_USERS,
            UserRole.LOGISTICS_USERS,
            UserRole.HR_USERS,
            UserRole.IT_USERS,
          ],
          identityProvider: 'development',
          claims: [],
        });
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      // In development without Easy Auth, set a mock user
      if (import.meta.env.DEV) {
        setUser({
          userId: 'dev-user',
          userDetails: 'Development User (Full Access)',
          userRoles: [
            UserRole.ADMINISTRATOR, // Full admin access
            UserRole.LEGAL_USERS,
            UserRole.CONSTRUCTION_USERS,
            UserRole.HEALTHCARE_USERS,
            UserRole.FINANCE_USERS,
            UserRole.RETAIL_USERS,
            UserRole.EDUCATION_USERS,
            UserRole.INSURANCE_USERS,
            UserRole.REALESTATE_USERS,
            UserRole.MANUFACTURING_USERS,
            UserRole.HOSPITALITY_USERS,
            UserRole.TELECOM_USERS,
            UserRole.GOVERNMENT_USERS,
            UserRole.TRANSPORT_USERS,
            UserRole.ENERGY_USERS,
            UserRole.PHARMA_USERS,
            UserRole.AGRICULTURE_USERS,
            UserRole.MEDIA_USERS,
            UserRole.LOGISTICS_USERS,
            UserRole.HR_USERS,
            UserRole.IT_USERS,
          ],
          identityProvider: 'development',
          claims: [],
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    
    const roles = Array.isArray(role) ? role : [role];
    return roles.some(r => user.userRoles.includes(r));
  };

  const isAdministrator = hasRole(UserRole.ADMINISTRATOR);

  const logout = () => {
    // Azure Easy Auth logout endpoint
    window.location.href = '/.auth/logout';
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    hasRole,
    isAdministrator,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
