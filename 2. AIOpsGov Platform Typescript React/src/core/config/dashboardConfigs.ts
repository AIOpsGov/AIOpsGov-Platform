/**
 * Industry-Specific Dashboard Configurations
 * Defines 20 different Copilot agent dashboards for various industries
 */

import { UserRole } from '../auth/AuthContext';

export interface DashboardConfig {
  id: string;
  name: string;
  description: string;
  industry: string;
  icon: string; // FluentUI icon name
  agentName: string; // Default agent name to monitor
  route: string;
  requiredRoles: UserRole[];
  kpis: KPIConfig[];
  features: DashboardFeature[];
  color: string; // Primary color theme
  appInsightsEnvVar: string; // Environment variable name for App Insights connection
  functionAppEnvVar: string; // Environment variable name for Function App URL
}

export interface KPIConfig {
  id: string;
  name: string;
  description: string;
  metric: string; // The metric to track
  target?: number;
  format: 'number' | 'percentage' | 'duration' | 'currency';
}

export interface DashboardFeature {
  id: string;
  name: string;
  enabled: boolean;
}

/**
 * 20 Industry-Specific Dashboard Configurations
 */
export const DASHBOARD_CONFIGS: DashboardConfig[] = [
  // 1. Legal Services - Case Management Assistant
  {
    id: 'legal-case-management',
    name: 'Legal Case Management',
    description: 'Monitor case intake, document review, and client communication automation',
    industry: 'Legal Services',
    icon: 'Scale',
    agentName: 'Legal Case Management Agent',
    route: '/dashboard/legal-case-management',
    requiredRoles: [UserRole.ADMINISTRATOR, UserRole.LEGAL_USERS],
    color: '#8B4513',
    appInsightsEnvVar: 'VITE_LEGAL_APP_INSIGHTS',
    functionAppEnvVar: 'VITE_LEGAL_FUNCTION_APP_URL',
    kpis: [
      { id: 'case-intake', name: 'Case Intake Rate', description: 'New cases processed', metric: 'totalConversations', format: 'number' },
      { id: 'doc-review', name: 'Document Review', description: 'Documents analyzed', metric: 'documentCount', format: 'number' },
      { id: 'response-time', name: 'Client Response Time', description: 'Avg time to respond', metric: 'avgResponseTime', target: 300, format: 'duration' },
      { id: 'case-accuracy', name: 'Case Classification', description: 'Accurate case categorization', metric: 'accuracyRate', target: 95, format: 'percentage' },
    ],
    features: [
      { id: 'case-tracking', name: 'Case Tracking', enabled: true },
      { id: 'document-analysis', name: 'Document Analysis', enabled: true },
      { id: 'compliance-alerts', name: 'Compliance Alerts', enabled: true },
    ],
  },

  // 2. Construction - Project Planning Assistant
  {
    id: 'construction-project',
    name: 'Construction Project Assistant',
    description: 'Track project inquiries, permit requests, and contractor communications',
    industry: 'Construction',
    icon: 'HomeGroup',
    agentName: 'Construction Project Agent',
    route: '/dashboard/construction-project',
    requiredRoles: [UserRole.ADMINISTRATOR, UserRole.CONSTRUCTION_USERS],
    color: '#FF6B00',
    appInsightsEnvVar: 'VITE_CONSTRUCTION_APP_INSIGHTS',
    functionAppEnvVar: 'VITE_CONSTRUCTION_FUNCTION_APP_URL',
    kpis: [
      { id: 'project-inquiries', name: 'Project Inquiries', description: 'New project requests', metric: 'totalConversations', format: 'number' },
      { id: 'permit-requests', name: 'Permit Requests', description: 'Permits processed', metric: 'permitCount', format: 'number' },
      { id: 'safety-compliance', name: 'Safety Compliance', description: 'Safety checks completed', metric: 'complianceRate', target: 100, format: 'percentage' },
      { id: 'bid-response', name: 'Bid Response Time', description: 'Time to respond to bids', metric: 'avgResponseTime', target: 1800, format: 'duration' },
    ],
    features: [
      { id: 'project-tracking', name: 'Project Tracking', enabled: true },
      { id: 'permit-management', name: 'Permit Management', enabled: true },
      { id: 'safety-alerts', name: 'Safety Alerts', enabled: true },
    ],
  },

  // 3. Healthcare - Patient Support Assistant
  {
    id: 'healthcare-patient',
    name: 'Healthcare Patient Support',
    description: 'Monitor appointment scheduling, medication queries, and patient triage',
    industry: 'Healthcare',
    icon: 'Health',
    agentName: 'Patient Support Agent',
    route: '/dashboard/healthcare-patient',
    requiredRoles: [UserRole.ADMINISTRATOR, UserRole.HEALTHCARE_USERS],
    color: '#00A4EF',
    appInsightsEnvVar: 'VITE_HEALTHCARE_APP_INSIGHTS',
    functionAppEnvVar: 'VITE_HEALTHCARE_FUNCTION_APP_URL',
    kpis: [
      { id: 'appointments', name: 'Appointments Scheduled', description: 'Successful bookings', metric: 'appointmentCount', format: 'number' },
      { id: 'triage-accuracy', name: 'Triage Accuracy', description: 'Correct urgency assessment', metric: 'triageAccuracy', target: 98, format: 'percentage' },
      { id: 'patient-satisfaction', name: 'Patient Satisfaction', description: 'Patient feedback score', metric: 'satisfactionScore', target: 90, format: 'percentage' },
      { id: 'wait-time', name: 'Avg Wait Time', description: 'Time to agent response', metric: 'avgResponseTime', target: 120, format: 'duration' },
    ],
    features: [
      { id: 'appointment-booking', name: 'Appointment Booking', enabled: true },
      { id: 'medication-info', name: 'Medication Information', enabled: true },
      { id: 'hipaa-compliance', name: 'HIPAA Compliance', enabled: true },
    ],
  },

  // 4. Financial Services - Banking Assistant
  {
    id: 'finance-banking',
    name: 'Banking Customer Service',
    description: 'Track account inquiries, loan applications, and fraud detection',
    industry: 'Financial Services',
    icon: 'Money',
    agentName: 'Banking Assistant Agent',
    route: '/dashboard/finance-banking',
    requiredRoles: [UserRole.ADMINISTRATOR, UserRole.FINANCE_USERS],
    color: '#107C10',
    appInsightsEnvVar: 'VITE_FINANCE_APP_INSIGHTS',
    functionAppEnvVar: 'VITE_FINANCE_FUNCTION_APP_URL',
    kpis: [
      { id: 'account-inquiries', name: 'Account Inquiries', description: 'Customer service requests', metric: 'totalConversations', format: 'number' },
      { id: 'loan-applications', name: 'Loan Applications', description: 'Applications processed', metric: 'loanCount', format: 'number' },
      { id: 'fraud-detection', name: 'Fraud Detection', description: 'Suspicious activity flagged', metric: 'fraudAlerts', format: 'number' },
      { id: 'resolution-rate', name: 'First Contact Resolution', description: 'Issues resolved immediately', metric: 'resolutionRate', target: 85, format: 'percentage' },
    ],
    features: [
      { id: 'transaction-tracking', name: 'Transaction Tracking', enabled: true },
      { id: 'fraud-alerts', name: 'Fraud Alerts', enabled: true },
      { id: 'compliance-monitoring', name: 'Compliance Monitoring', enabled: true },
    ],
  },

  // 5. Retail - Customer Service Assistant
  {
    id: 'retail-customer',
    name: 'Retail Customer Service',
    description: 'Monitor order tracking, returns, and product recommendations',
    industry: 'Retail',
    icon: 'ShoppingCart',
    agentName: 'Retail Customer Agent',
    route: '/dashboard/retail-customer',
    requiredRoles: [UserRole.ADMINISTRATOR, UserRole.RETAIL_USERS],
    color: '#E81123',
    appInsightsEnvVar: 'VITE_RETAIL_APP_INSIGHTS',
    functionAppEnvVar: 'VITE_RETAIL_FUNCTION_APP_URL',
    kpis: [
      { id: 'order-inquiries', name: 'Order Inquiries', description: 'Customer order questions', metric: 'totalConversations', format: 'number' },
      { id: 'return-rate', name: 'Return Processing', description: 'Returns handled', metric: 'returnCount', format: 'number' },
      { id: 'upsell-rate', name: 'Upsell Success', description: 'Product recommendations accepted', metric: 'upsellRate', target: 15, format: 'percentage' },
      { id: 'csat-score', name: 'Customer Satisfaction', description: 'CSAT score', metric: 'satisfactionScore', target: 90, format: 'percentage' },
    ],
    features: [
      { id: 'order-tracking', name: 'Order Tracking', enabled: true },
      { id: 'product-recommendations', name: 'Product Recommendations', enabled: true },
      { id: 'returns-management', name: 'Returns Management', enabled: true },
    ],
  },

  // 6. Education - Student Support Assistant
  {
    id: 'education-student',
    name: 'Student Support Services',
    description: 'Track enrollment, course selection, and academic advising',
    industry: 'Education',
    icon: 'Education',
    agentName: 'Student Support Agent',
    route: '/dashboard/education-student',
    requiredRoles: [UserRole.ADMINISTRATOR, UserRole.EDUCATION_USERS],
    appInsightsEnvVar: 'VITE_EDUCATION_APP_INSIGHTS',
    functionAppEnvVar: 'VITE_EDUCATION_FUNCTION_APP_URL',
    color: '#5C2D91',
    kpis: [
      { id: 'enrollment-inquiries', name: 'Enrollment Inquiries', description: 'Student enrollment questions', metric: 'totalConversations', format: 'number' },
      { id: 'course-selection', name: 'Course Selection', description: 'Courses recommended', metric: 'courseCount', format: 'number' },
      { id: 'response-accuracy', name: 'Response Accuracy', description: 'Accurate information provided', metric: 'accuracyRate', target: 95, format: 'percentage' },
      { id: 'student-satisfaction', name: 'Student Satisfaction', description: 'Student feedback score', metric: 'satisfactionScore', target: 88, format: 'percentage' },
    ],
    features: [
      { id: 'enrollment-tracking', name: 'Enrollment Tracking', enabled: true },
      { id: 'course-recommendations', name: 'Course Recommendations', enabled: true },
      { id: 'academic-advising', name: 'Academic Advising', enabled: true },
    ],
  },

  // 7. Insurance - Claims Processing Assistant
  {
    id: 'insurance-claims',
    name: 'Insurance Claims Processing',
    description: 'Monitor claims intake, document processing, and fraud detection',
    industry: 'Insurance',
    icon: 'Shield',
    agentName: 'Claims Processing Agent',
    route: '/dashboard/insurance-claims',
    requiredRoles: [UserRole.ADMINISTRATOR, UserRole.INSURANCE_USERS],
    appInsightsEnvVar: 'VITE_INSURANCE_APP_INSIGHTS',
    functionAppEnvVar: 'VITE_INSURANCE_FUNCTION_APP_URL',
    color: '#0078D4',
    kpis: [
      { id: 'claims-submitted', name: 'Claims Submitted', description: 'New claims received', metric: 'totalConversations', format: 'number' },
      { id: 'processing-time', name: 'Processing Time', description: 'Avg time to process', metric: 'avgProcessingTime', target: 3600, format: 'duration' },
      { id: 'fraud-detection', name: 'Fraud Detection', description: 'Suspicious claims flagged', metric: 'fraudRate', target: 5, format: 'percentage' },
      { id: 'approval-rate', name: 'Auto-Approval Rate', description: 'Claims auto-approved', metric: 'approvalRate', target: 70, format: 'percentage' },
    ],
    features: [
      { id: 'claims-tracking', name: 'Claims Tracking', enabled: true },
      { id: 'document-verification', name: 'Document Verification', enabled: true },
      { id: 'fraud-detection', name: 'Fraud Detection', enabled: true },
    ],
  },

  // 8. Real Estate - Property Inquiry Assistant
  {
    id: 'realestate-property',
    name: 'Real Estate Property Assistant',
    description: 'Track property inquiries, showing schedules, and buyer qualification',
    industry: 'Real Estate',
    icon: 'Home',
    agentName: 'Property Assistant Agent',
    route: '/dashboard/realestate-property',
    requiredRoles: [UserRole.ADMINISTRATOR, UserRole.REALESTATE_USERS],
    appInsightsEnvVar: 'VITE_REALESTATE_APP_INSIGHTS',
    functionAppEnvVar: 'VITE_REALESTATE_FUNCTION_APP_URL',
    color: '#00BCF2',
    kpis: [
      { id: 'property-inquiries', name: 'Property Inquiries', description: 'Customer property questions', metric: 'totalConversations', format: 'number' },
      { id: 'showings-scheduled', name: 'Showings Scheduled', description: 'Property viewings booked', metric: 'showingCount', format: 'number' },
      { id: 'lead-qualification', name: 'Lead Qualification', description: 'Qualified leads generated', metric: 'qualificationRate', target: 60, format: 'percentage' },
      { id: 'response-time', name: 'Response Time', description: 'Time to first response', metric: 'avgResponseTime', target: 600, format: 'duration' },
    ],
    features: [
      { id: 'property-matching', name: 'Property Matching', enabled: true },
      { id: 'showing-scheduling', name: 'Showing Scheduling', enabled: true },
      { id: 'lead-scoring', name: 'Lead Scoring', enabled: true },
    ],
  },

  // 9. Manufacturing - Supply Chain Assistant
  {
    id: 'manufacturing-supply',
    name: 'Supply Chain Management',
    description: 'Monitor inventory queries, order status, and supplier communications',
    industry: 'Manufacturing',
    icon: 'Product',
    agentName: 'Supply Chain Agent',
    route: '/dashboard/manufacturing-supply',
    requiredRoles: [UserRole.ADMINISTRATOR, UserRole.MANUFACTURING_USERS],
    appInsightsEnvVar: 'VITE_MANUFACTURING_APP_INSIGHTS',
    functionAppEnvVar: 'VITE_MANUFACTURING_FUNCTION_APP_URL',
    color: '#FF8C00',
    kpis: [
      { id: 'inventory-inquiries', name: 'Inventory Inquiries', description: 'Stock level queries', metric: 'totalConversations', format: 'number' },
      { id: 'order-status', name: 'Order Status Updates', description: 'Order tracking requests', metric: 'orderCount', format: 'number' },
      { id: 'supply-accuracy', name: 'Supply Accuracy', description: 'Correct inventory information', metric: 'accuracyRate', target: 98, format: 'percentage' },
      { id: 'response-time', name: 'Response Time', description: 'Avg query response time', metric: 'avgResponseTime', target: 180, format: 'duration' },
    ],
    features: [
      { id: 'inventory-tracking', name: 'Inventory Tracking', enabled: true },
      { id: 'order-management', name: 'Order Management', enabled: true },
      { id: 'supplier-alerts', name: 'Supplier Alerts', enabled: true },
    ],
  },

  // 10. Hospitality - Guest Services Assistant
  {
    id: 'hospitality-guest',
    name: 'Hospitality Guest Services',
    description: 'Track reservations, guest requests, and service quality',
    industry: 'Hospitality',
    icon: 'Cafe',
    agentName: 'Guest Services Agent',
    route: '/dashboard/hospitality-guest',
    requiredRoles: [UserRole.ADMINISTRATOR, UserRole.HOSPITALITY_USERS],
    appInsightsEnvVar: 'VITE_HOSPITALITY_APP_INSIGHTS',
    functionAppEnvVar: 'VITE_HOSPITALITY_FUNCTION_APP_URL',
    color: '#F25022',
    kpis: [
      { id: 'reservations', name: 'Reservations', description: 'Bookings made', metric: 'reservationCount', format: 'number' },
      { id: 'guest-requests', name: 'Guest Requests', description: 'Service requests handled', metric: 'totalConversations', format: 'number' },
      { id: 'satisfaction-score', name: 'Guest Satisfaction', description: 'Guest feedback score', metric: 'satisfactionScore', target: 92, format: 'percentage' },
      { id: 'upsell-rate', name: 'Upsell Rate', description: 'Upgrades accepted', metric: 'upsellRate', target: 20, format: 'percentage' },
    ],
    features: [
      { id: 'reservation-management', name: 'Reservation Management', enabled: true },
      { id: 'concierge-services', name: 'Concierge Services', enabled: true },
      { id: 'guest-feedback', name: 'Guest Feedback', enabled: true },
    ],
  },

  // 11. Telecommunications - Technical Support Assistant
  {
    id: 'telecom-support',
    name: 'Telecom Technical Support',
    description: 'Monitor service issues, network troubleshooting, and billing inquiries',
    industry: 'Telecommunications',
    icon: 'Devices4',
    agentName: 'Technical Support Agent',
    route: '/dashboard/telecom-support',
    requiredRoles: [UserRole.ADMINISTRATOR, UserRole.TELECOM_USERS],
    appInsightsEnvVar: 'VITE_TELECOM_APP_INSIGHTS',
    functionAppEnvVar: 'VITE_TELECOM_FUNCTION_APP_URL',
    color: '#7FBA00',
    kpis: [
      { id: 'support-tickets', name: 'Support Tickets', description: 'Issues reported', metric: 'totalConversations', format: 'number' },
      { id: 'resolution-rate', name: 'First Call Resolution', description: 'Issues resolved on first contact', metric: 'resolutionRate', target: 75, format: 'percentage' },
      { id: 'network-uptime', name: 'Network Uptime', description: 'Service availability', metric: 'uptimeRate', target: 99.9, format: 'percentage' },
      { id: 'resolution-time', name: 'Avg Resolution Time', description: 'Time to resolve issues', metric: 'avgResolutionTime', target: 1800, format: 'duration' },
    ],
    features: [
      { id: 'ticket-tracking', name: 'Ticket Tracking', enabled: true },
      { id: 'network-diagnostics', name: 'Network Diagnostics', enabled: true },
      { id: 'billing-support', name: 'Billing Support', enabled: true },
    ],
  },

  // 12. Government - Citizen Services Assistant
  {
    id: 'government-citizen',
    name: 'Government Citizen Services',
    description: 'Track permit applications, information requests, and service inquiries',
    industry: 'Government',
    icon: 'CityNext',
    agentName: 'Citizen Services Agent',
    route: '/dashboard/government-citizen',
    requiredRoles: [UserRole.ADMINISTRATOR, UserRole.GOVERNMENT_USERS],
    appInsightsEnvVar: 'VITE_GOVERNMENT_APP_INSIGHTS',
    functionAppEnvVar: 'VITE_GOVERNMENT_FUNCTION_APP_URL',
    color: '#002050',
    kpis: [
      { id: 'service-requests', name: 'Service Requests', description: 'Citizen inquiries', metric: 'totalConversations', format: 'number' },
      { id: 'permit-applications', name: 'Permit Applications', description: 'Permits processed', metric: 'permitCount', format: 'number' },
      { id: 'response-time', name: 'Response Time', description: 'Time to first response', metric: 'avgResponseTime', target: 3600, format: 'duration' },
      { id: 'satisfaction-score', name: 'Citizen Satisfaction', description: 'Citizen feedback score', metric: 'satisfactionScore', target: 85, format: 'percentage' },
    ],
    features: [
      { id: 'permit-tracking', name: 'Permit Tracking', enabled: true },
      { id: 'information-services', name: 'Information Services', enabled: true },
      { id: 'accessibility-compliance', name: 'Accessibility Compliance', enabled: true },
    ],
  },

  // 13. Transportation - Fleet Management Assistant
  {
    id: 'transport-fleet',
    name: 'Fleet Management Assistant',
    description: 'Monitor vehicle tracking, maintenance scheduling, and driver communications',
    industry: 'Transportation',
    icon: 'Vehicles',
    agentName: 'Fleet Management Agent',
    route: '/dashboard/transport-fleet',
    requiredRoles: [UserRole.ADMINISTRATOR, UserRole.TRANSPORT_USERS],
    appInsightsEnvVar: 'VITE_TRANSPORT_APP_INSIGHTS',
    functionAppEnvVar: 'VITE_TRANSPORT_FUNCTION_APP_URL',
    color: '#00188F',
    kpis: [
      { id: 'vehicle-inquiries', name: 'Vehicle Inquiries', description: 'Fleet status queries', metric: 'totalConversations', format: 'number' },
      { id: 'maintenance-scheduled', name: 'Maintenance Scheduled', description: 'Maintenance appointments', metric: 'maintenanceCount', format: 'number' },
      { id: 'fleet-uptime', name: 'Fleet Uptime', description: 'Vehicle availability', metric: 'uptimeRate', target: 95, format: 'percentage' },
      { id: 'response-time', name: 'Response Time', description: 'Avg query response time', metric: 'avgResponseTime', target: 300, format: 'duration' },
    ],
    features: [
      { id: 'vehicle-tracking', name: 'Vehicle Tracking', enabled: true },
      { id: 'maintenance-scheduling', name: 'Maintenance Scheduling', enabled: true },
      { id: 'driver-support', name: 'Driver Support', enabled: true },
    ],
  },

  // 14. Energy - Utility Customer Service Assistant
  {
    id: 'energy-utility',
    name: 'Utility Customer Service',
    description: 'Track service requests, billing inquiries, and outage reports',
    industry: 'Energy & Utilities',
    icon: 'Lightbulb',
    agentName: 'Utility Customer Agent',
    route: '/dashboard/energy-utility',
    requiredRoles: [UserRole.ADMINISTRATOR, UserRole.ENERGY_USERS],
    appInsightsEnvVar: 'VITE_ENERGY_APP_INSIGHTS',
    functionAppEnvVar: 'VITE_ENERGY_FUNCTION_APP_URL',
    color: '#FFB900',
    kpis: [
      { id: 'service-requests', name: 'Service Requests', description: 'Customer service inquiries', metric: 'totalConversations', format: 'number' },
      { id: 'outage-reports', name: 'Outage Reports', description: 'Power outages reported', metric: 'outageCount', format: 'number' },
      { id: 'billing-resolution', name: 'Billing Resolution', description: 'Billing issues resolved', metric: 'resolutionRate', target: 90, format: 'percentage' },
      { id: 'response-time', name: 'Emergency Response', description: 'Time to respond to emergencies', metric: 'avgResponseTime', target: 600, format: 'duration' },
    ],
    features: [
      { id: 'outage-tracking', name: 'Outage Tracking', enabled: true },
      { id: 'billing-support', name: 'Billing Support', enabled: true },
      { id: 'energy-efficiency', name: 'Energy Efficiency Tips', enabled: true },
    ],
  },

  // 15. Pharmaceutical - Medical Information Assistant
  {
    id: 'pharma-medical',
    name: 'Medical Information Service',
    description: 'Monitor drug information requests, adverse event reporting, and compliance',
    industry: 'Pharmaceutical',
    icon: 'Pill',
    agentName: 'Medical Information Agent',
    route: '/dashboard/pharma-medical',
    requiredRoles: [UserRole.ADMINISTRATOR, UserRole.PHARMA_USERS],
    appInsightsEnvVar: 'VITE_PHARMA_APP_INSIGHTS',
    functionAppEnvVar: 'VITE_PHARMA_FUNCTION_APP_URL',
    color: '#68217A',
    kpis: [
      { id: 'info-requests', name: 'Information Requests', description: 'Drug information queries', metric: 'totalConversations', format: 'number' },
      { id: 'adverse-events', name: 'Adverse Events', description: 'AE reports processed', metric: 'adverseEventCount', format: 'number' },
      { id: 'compliance-rate', name: 'Compliance Rate', description: 'Regulatory compliance', metric: 'complianceRate', target: 100, format: 'percentage' },
      { id: 'response-accuracy', name: 'Response Accuracy', description: 'Accurate medical information', metric: 'accuracyRate', target: 99, format: 'percentage' },
    ],
    features: [
      { id: 'drug-information', name: 'Drug Information', enabled: true },
      { id: 'adverse-event-reporting', name: 'Adverse Event Reporting', enabled: true },
      { id: 'regulatory-compliance', name: 'Regulatory Compliance', enabled: true },
    ],
  },

  // 16. Agriculture - Farm Management Assistant
  {
    id: 'agriculture-farm',
    name: 'Farm Management Assistant',
    description: 'Track crop monitoring, weather alerts, and equipment maintenance',
    industry: 'Agriculture',
    icon: 'Plant',
    agentName: 'Farm Management Agent',
    route: '/dashboard/agriculture-farm',
    requiredRoles: [UserRole.ADMINISTRATOR, UserRole.AGRICULTURE_USERS],
    appInsightsEnvVar: 'VITE_AGRICULTURE_APP_INSIGHTS',
    functionAppEnvVar: 'VITE_AGRICULTURE_FUNCTION_APP_URL',
    color: '#498205',
    kpis: [
      { id: 'farm-inquiries', name: 'Farm Inquiries', description: 'Farmer questions', metric: 'totalConversations', format: 'number' },
      { id: 'weather-alerts', name: 'Weather Alerts', description: 'Alerts sent to farmers', metric: 'alertCount', format: 'number' },
      { id: 'equipment-uptime', name: 'Equipment Uptime', description: 'Equipment availability', metric: 'uptimeRate', target: 92, format: 'percentage' },
      { id: 'crop-yield-improvement', name: 'Yield Improvement', description: 'Productivity gain insights', metric: 'yieldRate', target: 10, format: 'percentage' },
    ],
    features: [
      { id: 'crop-monitoring', name: 'Crop Monitoring', enabled: true },
      { id: 'weather-tracking', name: 'Weather Tracking', enabled: true },
      { id: 'equipment-management', name: 'Equipment Management', enabled: true },
    ],
  },

  // 17. Media - Content Distribution Assistant
  {
    id: 'media-content',
    name: 'Content Distribution Assistant',
    description: 'Monitor content requests, licensing inquiries, and distribution tracking',
    industry: 'Media & Entertainment',
    icon: 'Video',
    agentName: 'Content Distribution Agent',
    route: '/dashboard/media-content',
    requiredRoles: [UserRole.ADMINISTRATOR, UserRole.MEDIA_USERS],
    appInsightsEnvVar: 'VITE_MEDIA_APP_INSIGHTS',
    functionAppEnvVar: 'VITE_MEDIA_FUNCTION_APP_URL',
    color: '#E74856',
    kpis: [
      { id: 'content-requests', name: 'Content Requests', description: 'Content access requests', metric: 'totalConversations', format: 'number' },
      { id: 'licensing-inquiries', name: 'Licensing Inquiries', description: 'License requests', metric: 'licensingCount', format: 'number' },
      { id: 'distribution-rate', name: 'Distribution Success', description: 'Successful content delivery', metric: 'distributionRate', target: 98, format: 'percentage' },
      { id: 'response-time', name: 'Response Time', description: 'Time to fulfill requests', metric: 'avgResponseTime', target: 900, format: 'duration' },
    ],
    features: [
      { id: 'content-catalog', name: 'Content Catalog', enabled: true },
      { id: 'licensing-management', name: 'Licensing Management', enabled: true },
      { id: 'distribution-tracking', name: 'Distribution Tracking', enabled: true },
    ],
  },

  // 18. Logistics - Shipping Assistant
  {
    id: 'logistics-shipping',
    name: 'Logistics Shipping Assistant',
    description: 'Track shipments, delivery schedules, and warehouse operations',
    industry: 'Logistics',
    icon: 'DeliveryTruck',
    agentName: 'Shipping Assistant Agent',
    route: '/dashboard/logistics-shipping',
    requiredRoles: [UserRole.ADMINISTRATOR, UserRole.LOGISTICS_USERS],
    appInsightsEnvVar: 'VITE_LOGISTICS_APP_INSIGHTS',
    functionAppEnvVar: 'VITE_LOGISTICS_FUNCTION_APP_URL',
    color: '#00B294',
    kpis: [
      { id: 'shipment-inquiries', name: 'Shipment Inquiries', description: 'Tracking requests', metric: 'totalConversations', format: 'number' },
      { id: 'delivery-success', name: 'On-Time Delivery', description: 'Deliveries on time', metric: 'deliveryRate', target: 95, format: 'percentage' },
      { id: 'warehouse-efficiency', name: 'Warehouse Efficiency', description: 'Fulfillment speed', metric: 'efficiencyRate', target: 90, format: 'percentage' },
      { id: 'tracking-accuracy', name: 'Tracking Accuracy', description: 'Accurate location updates', metric: 'accuracyRate', target: 99, format: 'percentage' },
    ],
    features: [
      { id: 'shipment-tracking', name: 'Shipment Tracking', enabled: true },
      { id: 'delivery-scheduling', name: 'Delivery Scheduling', enabled: true },
      { id: 'warehouse-management', name: 'Warehouse Management', enabled: true },
    ],
  },

  // 19. Human Resources - Employee Support Assistant
  {
    id: 'hr-employee',
    name: 'HR Employee Support',
    description: 'Monitor benefits inquiries, policy questions, and onboarding support',
    industry: 'Human Resources',
    icon: 'People',
    agentName: 'HR Support Agent',
    route: '/dashboard/hr-employee',
    requiredRoles: [UserRole.ADMINISTRATOR, UserRole.HR_USERS],
    appInsightsEnvVar: 'VITE_HR_APP_INSIGHTS',
    functionAppEnvVar: 'VITE_HR_FUNCTION_APP_URL',
    color: '#8661C5',
    kpis: [
      { id: 'hr-inquiries', name: 'HR Inquiries', description: 'Employee questions', metric: 'totalConversations', format: 'number' },
      { id: 'benefits-enrollment', name: 'Benefits Enrollment', description: 'Benefits signups', metric: 'enrollmentCount', format: 'number' },
      { id: 'policy-accuracy', name: 'Policy Accuracy', description: 'Accurate policy information', metric: 'accuracyRate', target: 98, format: 'percentage' },
      { id: 'employee-satisfaction', name: 'Employee Satisfaction', description: 'Employee feedback score', metric: 'satisfactionScore', target: 88, format: 'percentage' },
    ],
    features: [
      { id: 'benefits-management', name: 'Benefits Management', enabled: true },
      { id: 'policy-information', name: 'Policy Information', enabled: true },
      { id: 'onboarding-support', name: 'Onboarding Support', enabled: true },
    ],
  },

  // 20. IT Services - Help Desk Assistant
  {
    id: 'it-helpdesk',
    name: 'IT Help Desk Assistant',
    description: 'Track support tickets, password resets, and system troubleshooting',
    industry: 'IT Services',
    icon: 'Settings',
    agentName: 'IT Help Desk Agent',
    route: '/dashboard/it-helpdesk',
    requiredRoles: [UserRole.ADMINISTRATOR, UserRole.IT_USERS],
    appInsightsEnvVar: 'VITE_IT_APP_INSIGHTS',
    functionAppEnvVar: 'VITE_IT_FUNCTION_APP_URL',
    color: '#0078D4',
    kpis: [
      { id: 'support-tickets', name: 'Support Tickets', description: 'IT issues reported', metric: 'totalConversations', format: 'number' },
      { id: 'password-resets', name: 'Password Resets', description: 'Self-service resets', metric: 'resetCount', format: 'number' },
      { id: 'first-contact-resolution', name: 'First Contact Resolution', description: 'Issues resolved immediately', metric: 'resolutionRate', target: 80, format: 'percentage' },
      { id: 'avg-resolution-time', name: 'Avg Resolution Time', description: 'Time to resolve tickets', metric: 'avgResolutionTime', target: 2400, format: 'duration' },
    ],
    features: [
      { id: 'ticket-management', name: 'Ticket Management', enabled: true },
      { id: 'self-service-portal', name: 'Self-Service Portal', enabled: true },
      { id: 'knowledge-base', name: 'Knowledge Base', enabled: true },
    ],
  },
];

/**
 * Get dashboard configuration by ID
 */
export const getDashboardConfig = (dashboardId: string): DashboardConfig | undefined => {
  return DASHBOARD_CONFIGS.find(config => config.id === dashboardId);
};

/**
 * Get dashboard configuration by route
 */
export const getDashboardConfigByRoute = (route: string): DashboardConfig | undefined => {
  return DASHBOARD_CONFIGS.find(config => config.route === route);
};

/**
 * Get all dashboard configurations for a specific industry
 */
export const getDashboardsByIndustry = (industry: string): DashboardConfig[] => {
  return DASHBOARD_CONFIGS.filter(config => config.industry === industry);
};

/**
 * Get all unique industries
 */
export const getAllIndustries = (): string[] => {
  return Array.from(new Set(DASHBOARD_CONFIGS.map(config => config.industry)));
};