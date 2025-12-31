import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Spinner } from '@fluentui/react-components';
import { AuthProvider } from '../core/auth/AuthContext';
import { ProtectedRoute } from '../core/auth/ProtectedRoute/ProtectedRoute';
import { UserRole } from '../core/auth/AuthContext';
import { Layout } from '../shared/components/Layout/Layout';
import { HomePage } from '../pages/HomePage';
import './App.css';

// Lazy load dashboard pages for code splitting
// This reduces initial bundle size and improves performance

// Industry-specific dashboards
const LegalCaseManagementDashboard = lazy(() =>
  import('../features/copilot-agents/dashboards/legal/LegalCaseManagementDashboard')
);
const ConstructionProjectDashboard = lazy(() =>
  import('../features/copilot-agents/dashboards/construction/ConstructionProjectDashboard')
);
const HealthcarePatientSupportDashboard = lazy(() =>
  import('../features/copilot-agents/dashboards/healthcare/HealthcarePatientSupportDashboard')
);
const FinanceBankingDashboard = lazy(() =>
  import('../features/copilot-agents/dashboards/finance/FinanceBankingDashboard')
);
const RetailCustomerDashboard = lazy(() =>
  import('../features/copilot-agents/dashboards/retail/RetailCustomerDashboard')
);
const EducationStudentDashboard = lazy(() =>
  import('../features/copilot-agents/dashboards/education/EducationStudentDashboard')
);
const InsuranceClaimsDashboard = lazy(() =>
  import('../features/copilot-agents/dashboards/insurance/InsuranceClaimsDashboard')
);
const RealEstatePropertyDashboard = lazy(() =>
  import('../features/copilot-agents/dashboards/realestate/RealEstatePropertyDashboard')
);
const ManufacturingQualityDashboard = lazy(() =>
  import('../features/copilot-agents/dashboards/manufacturing/ManufacturingQualityDashboard')
);
const HospitalityGuestDashboard = lazy(() =>
  import('../features/copilot-agents/dashboards/hospitality/HospitalityGuestDashboard')
);
const TelecomSupportDashboard = lazy(() =>
  import('../features/copilot-agents/dashboards/telecom/TelecomSupportDashboard')
);
const GovernmentCitizenDashboard = lazy(() =>
  import('../features/copilot-agents/dashboards/government/GovernmentCitizenDashboard')
);
const TransportLogisticsDashboard = lazy(() =>
  import('../features/copilot-agents/dashboards/transport/TransportLogisticsDashboard')
);
const EnergyUtilityDashboard = lazy(() =>
  import('../features/copilot-agents/dashboards/energy/EnergyUtilityDashboard')
);
const PharmaResearchDashboard = lazy(() =>
  import('../features/copilot-agents/dashboards/pharma/PharmaResearchDashboard')
);
const AgricultureFarmDashboard = lazy(() =>
  import('../features/copilot-agents/dashboards/agriculture/AgricultureFarmDashboard')
);
const MediaContentDashboard = lazy(() =>
  import('../features/copilot-agents/dashboards/media/MediaContentDashboard')
);
const LogisticsWarehouseDashboard = lazy(() =>
  import('../features/copilot-agents/dashboards/logistics/LogisticsWarehouseDashboard')
);
const HREmployeeDashboard = lazy(() =>
  import('../features/copilot-agents/dashboards/hr/HREmployeeDashboard')
);
const ITHelpdeskDashboard = lazy(() =>
  import('../features/copilot-agents/dashboards/it/ITHelpdeskDashboard')
);

/**
 * Loading fallback component shown while dashboard loads
 */
const LoadingFallback: React.FC = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '70vh',
    flexDirection: 'column',
    gap: '1rem'
  }}>
    <Spinner size="large" label="Loading dashboard..." />
  </div>
);

/**
 * Create QueryClient instance with optimized settings for production
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,      // 5 minutes - data considered fresh
      cacheTime: 10 * 60 * 1000,     // 10 minutes - cache retained in memory
      refetchInterval: false,         // No automatic polling
      refetchOnMount: true,           // Refetch when component mounts
    },
  },
});

/**
 * App wrapper with routing, authentication, and QueryClientProvider
 * Includes lazy loading for better performance with multiple dashboards
 */
export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Layout>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Home Page - Public for authenticated users */}
                <Route path="/" element={<HomePage />} />
                
                {/* Industry-Specific Dashboards */}
                
                {/* Legal Services Dashboard */}
                <Route 
                  path="/dashboard/legal-case-management" 
                  element={
                    <ProtectedRoute 
                      requiredRoles={[
                        UserRole.ADMINISTRATOR, 
                        UserRole.LEGAL_USERS
                      ]}
                    >
                      <LegalCaseManagementDashboard />
                    </ProtectedRoute>
                  } 
                />

                {/* Construction Dashboard */}
                <Route 
                  path="/dashboard/construction-project" 
                  element={
                    <ProtectedRoute 
                      requiredRoles={[
                        UserRole.ADMINISTRATOR, 
                        UserRole.CONSTRUCTION_USERS
                      ]}
                    >
                      <ConstructionProjectDashboard />
                    </ProtectedRoute>
                  } 
                />

                {/* Healthcare Dashboard */}
                <Route 
                  path="/dashboard/healthcare-patient" 
                  element={
                    <ProtectedRoute 
                      requiredRoles={[
                        UserRole.ADMINISTRATOR, 
                        UserRole.HEALTHCARE_USERS
                      ]}
                    >
                      <HealthcarePatientSupportDashboard />
                    </ProtectedRoute>
                  } 
                />

                {/* Finance Banking Dashboard */}
                <Route 
                  path="/dashboard/finance-banking" 
                  element={
                    <ProtectedRoute 
                      requiredRoles={[UserRole.ADMINISTRATOR, UserRole.FINANCE_USERS]}
                    >
                      <FinanceBankingDashboard />
                    </ProtectedRoute>
                  } 
                />

                {/* Retail Customer Dashboard */}
                <Route 
                  path="/dashboard/retail-customer" 
                  element={
                    <ProtectedRoute 
                      requiredRoles={[UserRole.ADMINISTRATOR, UserRole.RETAIL_USERS]}
                    >
                      <RetailCustomerDashboard />
                    </ProtectedRoute>
                  } 
                />

                {/* Education Student Dashboard */}
                <Route 
                  path="/dashboard/education-student" 
                  element={
                    <ProtectedRoute 
                      requiredRoles={[UserRole.ADMINISTRATOR, UserRole.EDUCATION_USERS]}
                    >
                      <EducationStudentDashboard />
                    </ProtectedRoute>
                  } 
                />

                {/* Insurance Claims Dashboard */}
                <Route 
                  path="/dashboard/insurance-claims" 
                  element={
                    <ProtectedRoute 
                      requiredRoles={[UserRole.ADMINISTRATOR, UserRole.INSURANCE_USERS]}
                    >
                      <InsuranceClaimsDashboard />
                    </ProtectedRoute>
                  } 
                />

                {/* Real Estate Property Dashboard */}
                <Route 
                  path="/dashboard/realestate-property" 
                  element={
                    <ProtectedRoute 
                      requiredRoles={[UserRole.ADMINISTRATOR, UserRole.REALESTATE_USERS]}
                    >
                      <RealEstatePropertyDashboard />
                    </ProtectedRoute>
                  } 
                />

                {/* Manufacturing Quality Dashboard */}
                <Route 
                  path="/dashboard/manufacturing-quality" 
                  element={
                    <ProtectedRoute 
                      requiredRoles={[UserRole.ADMINISTRATOR, UserRole.MANUFACTURING_USERS]}
                    >
                      <ManufacturingQualityDashboard />
                    </ProtectedRoute>
                  } 
                />

                {/* Hospitality Guest Dashboard */}
                <Route 
                  path="/dashboard/hospitality-guest" 
                  element={
                    <ProtectedRoute 
                      requiredRoles={[UserRole.ADMINISTRATOR, UserRole.HOSPITALITY_USERS]}
                    >
                      <HospitalityGuestDashboard />
                    </ProtectedRoute>
                  } 
                />

                {/* Telecom Support Dashboard */}
                <Route 
                  path="/dashboard/telecom-support" 
                  element={
                    <ProtectedRoute 
                      requiredRoles={[UserRole.ADMINISTRATOR, UserRole.TELECOM_USERS]}
                    >
                      <TelecomSupportDashboard />
                    </ProtectedRoute>
                  } 
                />

                {/* Government Citizen Dashboard */}
                <Route 
                  path="/dashboard/government-citizen" 
                  element={
                    <ProtectedRoute 
                      requiredRoles={[UserRole.ADMINISTRATOR, UserRole.GOVERNMENT_USERS]}
                    >
                      <GovernmentCitizenDashboard />
                    </ProtectedRoute>
                  } 
                />

                {/* Transport Logistics Dashboard */}
                <Route 
                  path="/dashboard/transport-logistics" 
                  element={
                    <ProtectedRoute 
                      requiredRoles={[UserRole.ADMINISTRATOR, UserRole.TRANSPORT_USERS]}
                    >
                      <TransportLogisticsDashboard />
                    </ProtectedRoute>
                  } 
                />

                {/* Energy Utility Dashboard */}
                <Route 
                  path="/dashboard/energy-utility" 
                  element={
                    <ProtectedRoute 
                      requiredRoles={[UserRole.ADMINISTRATOR, UserRole.ENERGY_USERS]}
                    >
                      <EnergyUtilityDashboard />
                    </ProtectedRoute>
                  } 
                />

                {/* Pharma Research Dashboard */}
                <Route 
                  path="/dashboard/pharma-research" 
                  element={
                    <ProtectedRoute 
                      requiredRoles={[UserRole.ADMINISTRATOR, UserRole.PHARMA_USERS]}
                    >
                      <PharmaResearchDashboard />
                    </ProtectedRoute>
                  } 
                />

                {/* Agriculture Farm Dashboard */}
                <Route 
                  path="/dashboard/agriculture-farm" 
                  element={
                    <ProtectedRoute 
                      requiredRoles={[UserRole.ADMINISTRATOR, UserRole.AGRICULTURE_USERS]}
                    >
                      <AgricultureFarmDashboard />
                    </ProtectedRoute>
                  } 
                />

                {/* Media Content Dashboard */}
                <Route 
                  path="/dashboard/media-content" 
                  element={
                    <ProtectedRoute 
                      requiredRoles={[UserRole.ADMINISTRATOR, UserRole.MEDIA_USERS]}
                    >
                      <MediaContentDashboard />
                    </ProtectedRoute>
                  } 
                />

                {/* Logistics Warehouse Dashboard */}
                <Route 
                  path="/dashboard/logistics-warehouse" 
                  element={
                    <ProtectedRoute 
                      requiredRoles={[UserRole.ADMINISTRATOR, UserRole.LOGISTICS_USERS]}
                    >
                      <LogisticsWarehouseDashboard />
                    </ProtectedRoute>
                  } 
                />

                {/* HR Employee Dashboard */}
                <Route 
                  path="/dashboard/hr-employee" 
                  element={
                    <ProtectedRoute 
                      requiredRoles={[UserRole.ADMINISTRATOR, UserRole.HR_USERS]}
                    >
                      <HREmployeeDashboard />
                    </ProtectedRoute>
                  } 
                />

                {/* IT Helpdesk Dashboard */}
                <Route 
                  path="/dashboard/it-helpdesk" 
                  element={
                    <ProtectedRoute 
                      requiredRoles={[UserRole.ADMINISTRATOR, UserRole.IT_USERS]}
                    >
                      <ITHelpdeskDashboard />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Future dashboards can be added here */}
                
                {/* Catch all - redirect to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </Layout>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;