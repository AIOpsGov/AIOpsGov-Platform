# Dashboard API Architecture - Complete Guide

Each dashboard is its own entity with its own:
- ✅ `api.ts` file with dashboard-specific API calls
- ✅ Azure Function App Function names (`solution_{dashboard}_{operation}`)
- ✅ Custom KQL queries for its specific data needs
- ✅ Domain-specific interfaces and types

## 📂 Structure

```
src/features/copilot-agents/dashboards/
├── legal/
│   ├── api.ts                          ← Legal-specific API
│   ├── LegalCaseManagementDashboard.tsx
│   ├── components/
│   └── types.ts
├── finance/
│   ├── api.ts                          ← Finance-specific API
│   ├── FinanceBankingDashboard.tsx
│   ├── components/
│   └── types.ts
├── healthcare/
│   ├── api.ts                          ← Healthcare-specific API
│   ├── HealthcarePatientSupportDashboard.tsx
│   ├── components/
│   └── types.ts
└── ... (all 20 dashboards)
```

## ✅ Created Example API Files

1. **Legal Dashboard** - `src/features/copilot-agents/dashboards/legal/api.ts`
   - `solution_legal_GetAgentPerformance`
   - `solution_legal_GetCaseIntakeMetrics`
   - `solution_legal_GetDocumentAnalysis`
   - `solution_legal_GetClientCommunications`
   - `solution_legal_GetComplianceAlerts`
   - `solution_legal_ExportReport`

2. **Finance Dashboard** - `src/features/copilot-agents/dashboards/finance/api.ts`
   - `solution_finance_GetAgentPerformance`
   - `solution_finance_GetTransactionMetrics`
   - `solution_finance_GetFraudAlerts`
   - `solution_finance_GetAccountInquiries`
   - `solution_finance_GetLoanApplications`
   - `solution_finance_GetComplianceMetrics`
   - `solution_finance_ExportReport`

3. **Healthcare Dashboard** - `src/features/copilot-agents/dashboards/healthcare/api.ts`
   - `solution_healthcare_GetAgentPerformance`
   - `solution_healthcare_GetAppointmentMetrics`
   - `solution_healthcare_GetTriageData`
   - `solution_healthcare_GetPatientInquiries`
   - `solution_healthcare_GetRefillRequests`
   - `solution_healthcare_GetComplianceAudit`
   - `solution_healthcare_ExportReport`

## 🔑 Key Benefits

1. **Independent** - Each dashboard owns its complete API
2. **Domain-Specific** - Custom functions and queries per industry
3. **Type-Safe** - Dashboard-specific TypeScript interfaces
4. **Maintainable** - Clear separation, easy to find and modify
5. **Scalable** - Add/remove dashboards without affecting others

This is the correct architecture for a multi-tenant platform! 🎉
