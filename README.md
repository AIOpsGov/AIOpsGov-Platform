# Dashboard Management Guide - Adding and Removing Dashboards

## Overview

This platform uses a **config-driven architecture** that makes adding and removing dashboards simple and maintainable. You can easily copy existing dashboards as templates and customize them for new use cases.

## Architecture Components

### 1. Dashboard Configuration (`dashboardConfigs.ts`)
- **Purpose**: Defines metadata for each dashboard
- **Controls**: What tiles appear on the home page
- **Location**: `src/core/config/dashboardConfigs.ts`

### 2. Routing (`App.tsx`)
- **Purpose**: Maps URLs to dashboard components
- **Controls**: Which URL paths work and what they render
- **Location**: `src/app/App.tsx`

### 3. Dashboard Component Folder
- **Purpose**: Contains the actual dashboard implementation
- **Location**: `src/features/copilot-agents/dashboards/{dashboard-name}/`

## 🔄 How the Routing Flow Works

### Step-by-Step Navigation Flow:

```
1. User lands on Home Page
   ↓
2. HomePage.tsx renders tiles from DASHBOARD_CONFIGS array
   ↓
3. User clicks "View Dashboard" button
   ↓
4. Button calls navigate(dashboard.route)
   Example: navigate('/dashboard/legal-case-management')
   ↓
5. React Router matches URL to a <Route> in App.tsx
   ↓
6. Route's element is <ProtectedRoute> with requiredRoles
   ↓
7. ProtectedRoute checks user's roles via AuthContext
   ↓
8. If authorized: renders <LegalCaseManagementDashboard />
   If not authorized: redirects to unauthorized page
   ↓
9. Dashboard component loads (lazy loaded for performance)
   ↓
10. Dashboard fetches data using its own api.ts
```

### Visual Flow Diagram:

```
┌─────────────────────────────────────────────────────────────────┐
│ HOME PAGE (HomePage.tsx)                                        │
│                                                                 │
│ Reads DASHBOARD_CONFIGS array                                  │
│ Renders cards for each dashboard                               │
│                                                                 │
│ [Legal Case Management]  [Finance]  [Healthcare]               │
│                                                                 │
│ onClick={() => navigate(dashboard.route)}                      │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ↓ navigate('/dashboard/legal-case-management')
                       │
┌──────────────────────┴──────────────────────────────────────────┐
│ ROUTING (App.tsx)                                               │
│                                                                 │
│ <Route path="/dashboard/legal-case-management"                 │
│   element={                                                     │
│     <ProtectedRoute requiredRoles={[...LEGAL_USERS]}>         │
│       <LegalCaseManagementDashboard />                         │
│     </ProtectedRoute>                                           │
│   }                                                             │
│ />                                                              │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ↓ Check user roles
                       │
┌──────────────────────┴──────────────────────────────────────────┐
│ PROTECTED ROUTE (ProtectedRoute.tsx)                           │
│                                                                 │
│ const { user, hasRole } = useAuth();                           │
│                                                                 │
│ if (!hasRole(requiredRoles)) {                                 │
│   return <Navigate to="/unauthorized" />                       │
│ }                                                               │
│                                                                 │
│ return children; // Render dashboard                           │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ↓ User authorized
                       │
┌──────────────────────┴──────────────────────────────────────────┐
│ DASHBOARD COMPONENT                                             │
│ (LegalCaseManagementDashboard.tsx)                             │
│                                                                 │
│ - Renders dashboard UI                                          │
│ - Fetches data using ./api.ts                                  │
│ - Calls solution_legal_* functions                             │
│ - Displays KPIs, charts, tables                                │
└─────────────────────────────────────────────────────────────────┘
```

## ➕ Adding a New Dashboard

### Step 1: Copy an Existing Dashboard Folder

Copy a similar dashboard as your template to reduce development overhead:

```bash
# Navigate to dashboards folder
cd src/features/copilot-agents/dashboards

# Copy an existing dashboard
cp -r legal newdashboard

# Or on Windows PowerShell:
Copy-Item -Path legal -Destination newdashboard -Recurse
```

### Step 2: Update the Dashboard Files

In `src/features/copilot-agents/dashboards/newdashboard/`:

**1. Rename main component file:**
```
LegalCaseManagementDashboard.tsx → NewDashboard.tsx
```

**2. Update the component:**
```typescript
// NewDashboard.tsx
export const NewDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const dashboardConfig = getDashboardConfig('new-dashboard'); // ← Update ID
  
  // ... rest of component
};
```

**3. Create `api.ts` for dashboard-specific API calls:**
```typescript
// api.ts
import axios from 'axios';

const FUNCTION_APP_URL = import.meta.env.VITE_FUNCTION_APP_URL;
const APP_INSIGHTS = import.meta.env.VITE_NEWDASHBOARD_APP_INSIGHTS;

const createNewDashboardClient = () => {
  return axios.create({
    baseURL: FUNCTION_APP_URL,
    timeout: 180000,
    headers: {
      'Content-Type': 'application/json',
      'X-AppInsights-Connection': APP_INSIGHTS,
    },
  });
};

export const getNewDashboardPerformance = async (
  agentName: string,
  timeRange: string
) => {
  const client = createNewDashboardClient();
  const response = await client.post('/api/solution_newdashboard_GetAgentPerformance', {
    agentName,
    timeRange,
  });
  return response.data;
};

// Add more dashboard-specific functions...
```

**4. Customize components folder:**
Update any dashboard-specific components in the `components/` subfolder.

### Step 3: Add to Dashboard Config (`dashboardConfigs.ts`)

Add a new config object to the `DASHBOARD_CONFIGS` array:

```typescript
export const DASHBOARD_CONFIGS: DashboardConfig[] = [
  // ... existing dashboards
  
  // Your new dashboard
  {
    id: 'new-dashboard',                          // ← Unique ID
    name: 'New Dashboard Name',                   // ← Display name
    description: 'Monitor new dashboard features', // ← Description
    industry: 'Your Industry',                    // ← Industry name
    icon: 'Settings',                             // ← FluentUI icon name
    agentName: 'New Dashboard Agent',             // ← Agent name
    route: '/dashboard/new-dashboard',            // ← URL route
    requiredRoles: [                              // ← Azure AD roles
      UserRole.ADMINISTRATOR,
      UserRole.NEWDASHBOARD_USERS,
    ],
    color: '#FF6B00',                             // ← Brand color
    appInsightsEnvVar: 'VITE_NEWDASHBOARD_APP_INSIGHTS',
    functionAppEnvVar: 'VITE_NEWDASHBOARD_FUNCTION_APP_URL',
    kpis: [
      {
        id: 'kpi-1',
        name: 'KPI Name',
        description: 'KPI description',
        metric: 'metricName',
        target: 100,
        format: 'number',
      },
      // ... more KPIs
    ],
    features: [
      { id: 'feature-1', name: 'Feature Name', enabled: true },
      // ... more features
    ],
  },
];
```

### Step 4: Add User Role (`AuthContext.tsx`)

Add the new role to the `UserRole` enum:

```typescript
export enum UserRole {
  ADMINISTRATOR = 'Administrator',
  LEGAL_USERS = 'LegalUsers',
  // ... existing roles
  NEWDASHBOARD_USERS = 'NewDashboardUsers', // ← Add this
}
```

And update the dev user mock to include the new role:

```typescript
// In development mode mock user
userRoles: [
  UserRole.ADMINISTRATOR,
  UserRole.LEGAL_USERS,
  // ... existing roles
  UserRole.NEWDASHBOARD_USERS, // ← Add this
],
```

### Step 5: Add Route in App.tsx

**1. Add lazy import at the top:**
```typescript
const NewDashboard = lazy(() =>
  import('../features/copilot-agents/dashboards/newdashboard/NewDashboard')
);
```

**2. Add route in the Routes section:**
```typescript
<Routes>
  <Route path="/" element={<HomePage />} />
  
  {/* Existing routes... */}
  
  {/* New Dashboard Route */}
  <Route
    path="/dashboard/new-dashboard"
    element={
      <ProtectedRoute
        requiredRoles={[
          UserRole.ADMINISTRATOR,
          UserRole.NEWDASHBOARD_USERS,
        ]}
      >
        <NewDashboard />
      </ProtectedRoute>
    }
  />
  
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

### Step 6: Add Environment Variables

**Frontend `.env`:**
```bash
VITE_NEWDASHBOARD_APP_INSIGHTS=InstrumentationKey=abc123;...
```

**Function App (Azure Portal):**
```bash
NEWDASHBOARD_APPINSIGHTS_CONNECTION=...
NEWDASHBOARD_DATABASE_CONNECTION=...
NEWDASHBOARD_OPENAI_API_KEY=...
```

### Step 7: Create Function App Functions

Create functions in `functionapp/src/functions/`:

```javascript
// solution_newdashboard_GetAgentPerformance.js

const { app } = require('@azure/functions');

app.http('solution_newdashboard_GetAgentPerformance', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'solution_newdashboard_GetAgentPerformance',
    handler: async (request, context) => {
        // Read NEWDASHBOARD-specific env vars
        const appInsights = process.env.NEWDASHBOARD_APPINSIGHTS_CONNECTION;
        
        // Your KQL queries and logic here
        
        return { status: 200, jsonBody: { /* data */ } };
    }
});
```

## ➖ Removing a Dashboard

### Option 1: Hide Dashboard (Keep Code)

**Remove only from `dashboardConfigs.ts`:**
```typescript
export const DASHBOARD_CONFIGS: DashboardConfig[] = [
  // Comment out the dashboard config
  /*
  {
    id: 'unwanted-dashboard',
    name: 'Unwanted Dashboard',
    // ... rest of config
  },
  */
];
```

**Result:**
- ✅ Tile disappears from home page
- ✅ Route still works if user knows URL
- ✅ Code remains for future use

### Option 2: Fully Remove Dashboard

**1. Remove from `dashboardConfigs.ts`** (see above)

**2. Remove from `App.tsx`:**
```typescript
// Comment out or delete the lazy import
/*
const UnwantedDashboard = lazy(() =>
  import('../features/copilot-agents/dashboards/unwanted/UnwantedDashboard')
);
*/

// Comment out or delete the route
/*
<Route
  path="/dashboard/unwanted"
  element={<ProtectedRoute ...><UnwantedDashboard /></ProtectedRoute>}
/>
*/
```

**3. Optionally delete dashboard folder:**
```bash
rm -rf src/features/copilot-agents/dashboards/unwanted
```

**4. Remove role from `AuthContext.tsx`** (optional)

## 🎯 Key Benefits of This Architecture

### 1. **Config-Driven**
- Single source of truth for dashboard metadata
- Easy to enable/disable dashboards

### 2. **Copy-Paste Friendly**
- Duplicate existing dashboard folder as template
- Minimal changes needed to customize

### 3. **Independent Dashboards**
- Each dashboard is self-contained
- Own components, API, functions
- No cross-contamination

### 4. **Role-Based Access**
- Each dashboard can have different roles
- ProtectedRoute enforces authorization
- Easy to configure per client

### 5. **Lazy Loading**
- Only loads dashboard code when needed
- Better initial page load performance
- Automatic code splitting by Vite

### 6. **Multi-Tenant Ready**
- Clone base platform for each client
- Keep only dashboards they need
- Each deployment is independent

## 📋 Quick Reference Checklist

### Adding a New Dashboard:
- [ ] Copy existing dashboard folder as template
- [ ] Rename and update main component
- [ ] Create `api.ts` with dashboard-specific functions
- [ ] Add config to `dashboardConfigs.ts`
- [ ] Add role to `UserRole` enum in `AuthContext.tsx`
- [ ] Add lazy import to `App.tsx`
- [ ] Add route to `App.tsx`
- [ ] Add environment variables to `.env`
- [ ] Create Function App functions (solution_{dashboard}_*)
- [ ] Test the dashboard

### Removing a Dashboard:
- [ ] Remove from `dashboardConfigs.ts` (hide tile)
- [ ] Optional: Remove from `App.tsx` (disable route)
- [ ] Optional: Delete dashboard folder
- [ ] Optional: Remove role from `AuthContext.tsx`

## 🔧 Troubleshooting

### Dashboard tile doesn't appear on home page
-  Check `dashboardConfigs.ts` has the config
-  Verify `HomePage.tsx` is mapping `DASHBOARD_CONFIGS`

### Route returns 404 or redirects to home
-  Check `App.tsx` has matching route
-  Verify route path matches `dashboard.route` in config

### "Access Denied" when clicking dashboard
-  Check user has required role
-  Verify `requiredRoles` in `ProtectedRoute` matches config
-  Check AuthContext has user with correct roles

### Dashboard loads but no data
-  Check `api.ts` function names match Function App
-  Verify environment variables are set correctly
-  Check Function App has dashboard-specific functions
-  Verify Function App environment variables

## 💡 Best Practices

1. **Naming Convention**
   - Dashboard ID: `{industry}-{purpose}` (e.g., `legal-case-management`)
   - Route: `/dashboard/{industry}-{purpose}`
   - Function prefix: `solution_{industry}_`
   - Role: `{INDUSTRY}_USERS`

2. **File Organization**
   ```
   dashboards/{dashboard-name}/
   ├── api.ts                    // Dashboard-specific API
   ├── {DashboardName}.tsx       // Main component
   ├── {DashboardName}.module.css
   ├── components/               // Dashboard components
   └── types.ts                  // Dashboard types (optional)
   ```

3. **Code Reuse**
   - Copy similar dashboard as starting point
   - Reuse shared components from `src/shared/components/`
   - Use common hooks from `src/shared/hooks/`

4. **Testing**
   - Test with different user roles
   - Verify data loading works
   - Check responsive layout
   - Test navigation flow

This architecture makes it simple to scale from 1 to 20+ dashboards while keeping each one independent and maintainable! 🚀
