/**
 * AI Agent Configuration
 * Defines all available AI agents with their roles and URLs
 */

import { UserRole } from '../contexts/AuthContext';

export interface AIAgent {
  id: string;
  name: string;
  description: string;
  icon: string;
  url: string;
  requiredRoles: UserRole[];
  category: 'customer-service' | 'technical' | 'sales' | 'support';
  enabled: boolean;
}

// Define new roles for different agents
export enum AgentRole {
  // Product Advisor roles
  PRODUCT_ADVISOR_USER = 'ProductAdvisor.User',
  
  // Cloud Ops AWX Buddy roles
  CLOUD_OPS_AWX_USER = 'CloudOpsAwx.User',
  
  // Technical Support roles
  TECHNICAL_SUPPORT_USER = 'TechnicalSupport.User',
  
  // Sales Assistant roles
  SALES_ASSISTANT_USER = 'SalesAssistant.User',
  
  // Warranty Assistant roles
  WARRANTY_ASSISTANT_USER = 'WarrantyAssistant.User',
  
  // Order Management roles
  ORDER_MANAGEMENT_USER = 'OrderManagement.User',
  
  // Evaluation roles
  EVALUATION_ADMIN = 'Evaluation.Admin',
  EVALUATION_VIEWER = 'Evaluation.Viewer',
  
  // My Conversations - available to all authenticated users
  CONVERSATIONS_USER = 'Conversations.User',
}

/**
 * Configure your AI agents here
 * Add or modify agents as needed
 */
export const AI_AGENTS: AIAgent[] = [
  {
    id: 'product-advisor',
    name: 'Product Advisor Agent v1.5',
    description: 'Get expert product recommendations and guidance',
    icon: '🛍️',
    url: 'https://copilotstudio.preview.microsoft.com/environments/be34918c-7638-e485-89d8-d253987544c8/bots/cr85a_agent1_ImAs8a/canvas?__version__=2',
    requiredRoles: [AgentRole.PRODUCT_ADVISOR_USER as UserRole],
    category: 'customer-service',
    enabled: true,
  },
  {
    id: 'cloud-ops-awx',
    name: 'Cloud Operations AWX Buddy',
    description: 'Your intelligent assistant for cloud operations and AWX automation',
    icon: '☁️',
    url: 'https://copilotstudio.preview.microsoft.com/environments/be34918c-7638-e485-89d8-d253987544c8/bots/cr85a_cloudOperationsAwxBuddy/webchat?__version__=2',
    requiredRoles: [AgentRole.CLOUD_OPS_AWX_USER as UserRole],
    category: 'technical',
    enabled: true,
  },
  {
    id: 'technical-support',
    name: 'Technical Support',
    description: 'Get help with technical issues and troubleshooting',
    icon: '🔧',
    url: 'https://copilotstudio.preview.microsoft.com/environments/YOUR-ENV-ID/bots/technical-support/canvas',
    requiredRoles: [AgentRole.TECHNICAL_SUPPORT_USER as UserRole],
    category: 'technical',
    enabled: false, // Disabled - update URL when ready
  },
  {
    id: 'sales-assistant',
    name: 'Sales Assistant',
    description: 'Assistance with quotes, pricing, and order processing',
    icon: '💼',
    url: 'https://copilotstudio.preview.microsoft.com/environments/YOUR-ENV-ID/bots/sales-assistant/canvas',
    requiredRoles: [AgentRole.SALES_ASSISTANT_USER as UserRole],
    category: 'sales',
    enabled: false, // Disabled - update URL when ready
  },
  {
    id: 'warranty-assistant',
    name: 'Warranty Assistant',
    description: 'Help with warranty claims and product returns',
    icon: '📋',
    url: 'https://copilotstudio.preview.microsoft.com/environments/YOUR-ENV-ID/bots/warranty-assistant/canvas',
    requiredRoles: [AgentRole.WARRANTY_ASSISTANT_USER as UserRole],
    category: 'support',
    enabled: false, // Disabled - update URL when ready
  },
  {
    id: 'order-management',
    name: 'Order Management',
    description: 'Track and manage customer orders',
    icon: '📦',
    url: 'https://copilotstudio.preview.microsoft.com/environments/YOUR-ENV-ID/bots/order-management/canvas',
    requiredRoles: [AgentRole.ORDER_MANAGEMENT_USER as UserRole],
    category: 'customer-service',
    enabled: false, // Disabled - update URL when ready
  },
];

/**
 * Get agents accessible to user based on their roles
 */
export const getAccessibleAgents = (userRoles: string[]): AIAgent[] => {
  return AI_AGENTS.filter(agent => {
    if (!agent.enabled) return false;
    
    // Check if user has any of the required roles
    return agent.requiredRoles.some(role => userRoles.includes(role));
  });
};

/**
 * Get specific agent by ID
 */
export const getAgentById = (agentId: string): AIAgent | undefined => {
  return AI_AGENTS.find(agent => agent.id === agentId);
};

/**
 * Check if user can access specific agent
 */
export const canAccessAgent = (agentId: string, userRoles: string[]): boolean => {
  const agent = getAgentById(agentId);
  if (!agent || !agent.enabled) return false;
  
  return agent.requiredRoles.some(role => userRoles.includes(role));
};
