# Frontend Setup Guide

This guide will walk you through setting up the Conversation Evaluation System React frontend application.

## 📋 Prerequisites

Before you begin, ensure you have:

1. **Node.js 18+** installed ([Download here](https://nodejs.org/))
2. **npm** (comes with Node.js)
3. **Azure Function App** deployed with the backend functions
4. Access to **Application Insights** (optional, only if bypassing the Function App proxy)

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
cd "Eval Website Typescript React"
npm install
```

### Step 2: Configure Environment Variables

You **must** configure your environment before running the application.

#### Copy `app.env` to `.env` and update it:

```bash
# Copy the template file
cp app.env .env
```

**On Windows:**
```bash
copy app.env .env
```

#### Open `.env` and update the following values:

```env
# ===========================================
# Demo Mode Configuration
# ===========================================
# Set to false when you're ready to connect to real Azure backend
VITE_ENABLE_DEMO_MODE=false

# ===========================================
# Azure Function App Configuration
# ===========================================
# Replace with your actual Azure Function App URL
VITE_API_BASE_URL=https://YOUR-FUNCTION-APP-NAME.azurewebsites.net/api
```

> **Important:** 
> - `app.env` is the template file with placeholders (safe to commit to Git)
> - `.env` is your personal file with real values (never commit this!)
> - `.env` is already in `.gitignore` to prevent accidental commits

#### Optional: Update Fallback URL in Code (Recommended)

For additional safety, update the fallback URL in `src/utils/constants.ts` (line 12):

```typescript
const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://YOUR-FUNCTION-APP-NAME.azurewebsites.net/api';
```

Replace `'https://your-function-app-name.azurewebsites.net/api'` with your actual Function App URL.

> **Note:** This fallback is only used if `VITE_API_BASE_URL` is not set in `.env`. It's good practice to update it to match your actual Function App URL to avoid confusion during debugging.

#### Required Configuration Values

| Variable | Description | Where to Find It |
|----------|-------------|------------------|
| `VITE_API_BASE_URL` | Your Azure Function App endpoint | Azure Portal → Function App → Overview → URL |

#### Optional Configuration Values

Most other values have sensible defaults, but you can adjust them:

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_POLLING_INTERVAL` | 5000 | How often to check evaluation status (milliseconds) |
| `VITE_MAX_RETRIES` | 3 | Number of retry attempts for failed requests |
| `VITE_REQUEST_TIMEOUT` | 30000 | Request timeout (milliseconds) |
| `VITE_MAX_POLLING_ATTEMPTS` | 120 | Maximum status check attempts |
| `VITE_ENABLE_DARK_MODE` | true | Enable/disable dark mode toggle |
| `VITE_ENABLE_NOTIFICATIONS` | true | Enable browser notifications |

### Step 3: Start Development Server

```bash
npm run dev
```

The application will be available at **http://localhost:5173**

## 🔧 Detailed Configuration

### Understanding Demo Mode

The application has two modes:

#### Demo Mode (VITE_ENABLE_DEMO_MODE=true)
- Uses mock data instead of real Azure services
- Perfect for testing the UI without Azure resources
- No backend required
- **Default setting for first-time setup**

#### Production Mode (VITE_ENABLE_DEMO_MODE=false)
- Connects to your Azure Function App backend
- Requires properly configured Azure resources
- Real evaluation triggering and data fetching

### Getting Your Azure Function App URL

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to your Function App
3. Click on **Overview** in the left sidebar
4. Copy the **URL** shown (looks like: `https://your-function-app-name.azurewebsites.net`)
5. Add `/api` to the end: `https://your-function-app-name.azurewebsites.net/api`
6. Paste this into `.env` as `VITE_API_BASE_URL`

**Example:**
```env
# If your Function App is named "conversation-eval-prod"
VITE_API_BASE_URL=https://conversation-eval-prod.azurewebsites.net/api
```

### Optional: Update Constants File

For consistency and easier debugging, you can also update the fallback URL in the code:

**File:** `src/utils/constants.ts` (Line 12)

**Change from:**
```typescript
const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://your-function-app-name.azurewebsites.net/api';
```

**Change to:**
```typescript
const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://YOUR-ACTUAL-FUNCTION-APP-NAME.azurewebsites.net/api';
```

This fallback is only used if the environment variable isn't set, but updating it helps with debugging and makes the code more personalized to your deployment.

### Verifying Your Configuration

After updating `app.env`, verify your configuration:

1. Start the dev server: `npm run dev`
2. Open the browser console (F12)
3. Look for any configuration errors
4. Try triggering a test evaluation

If demo mode is disabled and you see connection errors, verify:
- Your Function App URL is correct
- The Function App is running
- CORS is properly configured in the Function App
- The Function App has the required environment variables set

## 📦 Building for Production

### Step 1: Ensure Production Configuration

Copy `app.env` to `.env` if you haven't already:

```bash
cp app.env .env
```

Update `.env`:

```env
VITE_ENABLE_DEMO_MODE=false
VITE_API_BASE_URL=https://YOUR-PRODUCTION-FUNCTION-APP.azurewebsites.net/api
```

### Step 2: Build the Application

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

### Step 3: Test the Production Build Locally

```bash
npm run preview
```

This serves the production build locally for testing.

## 🌐 Deployment Options

### Option 1: Azure Static Web Apps (Recommended)

1. **Via Azure Portal:**
   - Create a new Static Web App
   - Connect to your GitHub repository
   - Set build folder to `dist`
   - Set app location to `Eval Website Typescript React`
   - Deploy

2. **Via Azure CLI:**
   ```bash
   az staticwebapp create \
     --name my-evaluation-app \
     --resource-group my-resource-group \
     --source https://github.com/YOUR-USERNAME/YOUR-REPO \
     --location "Central US" \
     --branch main \
     --app-location "Eval Website Typescript React" \
     --output-location "dist"
   ```

### Option 2: Azure Blob Storage + CDN

1. Build the application: `npm run build`
2. Upload `dist/` contents to Azure Blob Storage
3. Enable static website hosting
4. Configure Azure CDN (optional)

### Option 3: Other Hosting Services

The built application (`dist/` folder) can be deployed to:
- **Vercel**: `vercel deploy`
- **Netlify**: `netlify deploy --prod --dir=dist`
- **GitHub Pages**: Use GitHub Actions
- **Any static hosting service**

## 🔐 Environment Variables Security

### Important Security Notes

1. **Never commit actual secrets to Git**
   - The `app.env` file is safe to commit (it contains placeholders)
   - If you create a `.env` file with real values, ensure it's in `.gitignore`

2. **Production Deployments**
   - For Azure Static Web Apps, set environment variables in the Azure Portal
   - For other services, use their environment variable management systems
   - Never include real API keys in the build

3. **Backend Security**
   - All sensitive values (API keys, credentials) should be in the Azure Function App
   - The frontend only needs to know the Function App URL
   - The Function App acts as a secure proxy to Azure services

## 🧪 Testing Your Setup

### Test Checklist

After setup, verify these features work:

- [ ] Application loads without errors
- [ ] You can enter a conversation ID
- [ ] "Run Evaluation" button is clickable
- [ ] Status updates appear after triggering evaluation
- [ ] Dashboard displays data (or shows "no data" message)
- [ ] Theme toggle works (if enabled)
- [ ] No console errors related to configuration

### Common Issues and Solutions

#### Issue: "API_BASE_URL not configured"

**Solution:** 
1. Make sure you copied `app.env` to `.env`
2. Update `VITE_API_BASE_URL` in `.env` with your Function App URL

#### Issue: "CORS Error" or "Network Error"

**Possible causes:**
1. Function App URL is incorrect
2. Function App is not running
3. CORS not configured in Function App
4. You forgot to create `.env` from `app.env`

**Solution:**
1. Verify you copied `app.env` to `.env`
2. Check Function App URL in `.env`
3. Ensure Function App is running in Azure Portal
4. Add your frontend URL to Function App CORS settings:
   ```bash
   az functionapp cors add \
     --name YOUR-FUNCTION-APP-NAME \
     --resource-group YOUR-RESOURCE-GROUP \
     --allowed-origins "https://your-frontend-domain.com"
   ```

#### Issue: "Cannot find module" errors during npm install

**Solution:**
```bash
# Clear npm cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

#### Issue: Build fails with TypeScript errors

**Solution:**
```bash
# Ensure you have the latest dependencies
npm update
npm run build
```

## 🛠️ Development Tips

### Hot Module Replacement

The dev server supports HMR. Changes to your code will reflect instantly without full page reload.

### TypeScript Type Checking

Run type checking without building:
```bash
npm run type-check
```

### Linting

Check code style and quality:
```bash
npm run lint
```

### VS Code Integration

For the best development experience:
1. Install these VS Code extensions:
   - ESLint
   - TypeScript and JavaScript Language Features
   - Vite
2. The project includes workspace settings for proper TypeScript support

## 📚 Additional Resources

- [Main Project README](../README.md) - Complete project documentation
- [Backend Deployment Guide](../Eval%20Functions/DEPLOYMENT_README.md) - Function App setup
- [Azure Function App Docs](https://docs.microsoft.com/azure/azure-functions/)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Fluent UI Documentation](https://react.fluentui.dev/)

## 💡 Next Steps

After completing setup:

1. **Test in demo mode** to familiarize yourself with the UI
2. **Deploy the Azure Functions** backend (see [Backend Deployment Guide](../Eval%20Functions/DEPLOYMENT_README.md))
3. **Configure Azure Automation** runbook with the PowerShell script
4. **Update app.env** with your Function App URL
5. **Disable demo mode** and test with real data
6. **Build and deploy** to production

## 🆘 Need Help?

If you encounter issues:

1. Check the [Troubleshooting section](#common-issues-and-solutions) above
2. Review the main [README.md](../README.md) for architecture details
3. Verify all Azure resources are properly configured
4. Check browser console for specific error messages
5. Open an issue on GitHub with details about your problem

---

**Happy Coding! 🚀**
