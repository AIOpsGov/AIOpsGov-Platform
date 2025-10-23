# AI-Powered Conversation Evaluation System

A comprehensive solution for automated evaluation of customer service conversations using Azure OpenAI, Application Insights, and Azure Automation. This system combines a React TypeScript frontend, Azure Functions backend, and PowerShell-based evaluation engine to provide intelligent conversation quality assessment.

## 🎯 Overview

This project enables automated, scalable evaluation of customer service conversations across multiple quality dimensions including helpfulness, professionalism, relevancy, and problem resolution. Built for organizations using Microsoft Copilot or similar AI-powered customer service tools.

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Frontend (React TypeScript)
- **Conversation Evaluation Trigger**: Intuitive interface to initiate evaluations
- **Real-time Status Tracking**: Live progress updates during evaluation
- **Interactive Dashboard**: Visualize metrics and trends from Application Insights
- **Conversation Transcript Viewer**: View full conversation history with role-based formatting
- **Modern UI**: Built with Microsoft Fluent UI components
- **Theme Support**: Light and dark mode
- **Responsive Design**: Works on desktop and mobile devices

### Backend (Azure Functions)
- **CORS Proxy**: Handles cross-origin requests to Azure services
- **Query Insights**: Executes KQL queries against Application Insights
- **Trigger Evaluation**: Initiates PowerShell runbook via webhook
- **Get Transcript**: Retrieves and formats conversation transcripts

### Evaluation Engine (PowerShell Runbook)
- **Azure OpenAI Integration**: Intelligent conversation analysis
- **Multi-dimensional Scoring**: Evaluates across multiple quality metrics
- **Application Insights Logging**: All results stored for reporting
- **Webhook-triggered**: Automated execution on demand

## 🏗️ Architecture

```
┌─────────────────────┐
│   React Frontend    │
│  (TypeScript/Vite)  │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  Azure Functions    │
│   (CORS Proxy)      │
└──────┬────────┬─────┘
       │        │
       ↓        ↓
┌──────────┐ ┌──────────────────┐
│   App    │ │ Azure Automation │
│ Insights │ │    (Runbook)     │
└──────────┘ └────────┬─────────┘
                      │
                      ↓
              ┌────────────────┐
              │  Azure OpenAI  │
              └────────────────┘
```

## 📁 Project Structure

```
Evaluation project final/
├── Eval Website Typescript React/    # Frontend application
│   ├── src/
│   │   ├── components/               # React components
│   │   │   ├── ConversationEvaluator/
│   │   │   ├── Dashboard/
│   │   │   ├── StatusTracker/
│   │   │   ├── TranscriptViewer/
│   │   │   └── Layout/
│   │   ├── services/                 # API integration
│   │   ├── hooks/                    # Custom React hooks
│   │   └── utils/                    # Utilities
│   ├── package.json
│   ├── vite.config.ts
│   └── README.md
│
├── Eval Functions/                   # Azure Functions backend
│   ├── src/
│   │   └── functions/
│   │       ├── QueryInsights.js
│   │       ├── TriggerEvaluation.js
│   │       └── GetConversationTranscript.js
│   ├── package.json
│   ├── host.json
│   └── DEPLOYMENT_README.md
│
├── Eval PS script/                   # PowerShell runbook
│   └── Conversation Evaluation Script for Runbook.ps1
│
└── README.md                         # This file
```

## 🔧 Prerequisites

### General Requirements
- **Azure Subscription** with permissions to create and manage resources
- **Node.js 18+** and npm
- **Git** for version control

### Azure Resources Required
1. **Azure OpenAI Service**
   - GPT-4 or GPT-3.5-turbo deployment
   - API endpoint and key

2. **Application Insights**
   - For conversation data storage
   - For evaluation results logging
   - API access configured (App ID and API Key)

3. **Azure Automation Account**
   - PowerShell runbook support
   - Webhook enabled
   - Managed identity or service principal for OpenAI access

4. **Azure Function App**
   - Node.js 18+ runtime
   - Consumption or Premium plan
   - CORS configured for your frontend domain

5. **Azure Static Web Apps** (Optional)
   - For frontend hosting
   - Or use any static hosting service

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd "Evaluation project final"
```

### 2. Install Frontend Dependencies

```bash
cd "Eval Website Typescript React"
npm install
```

> **📖 Frontend Setup:** See [Eval Website Typescript React/SETUP_GUIDE.md](Eval%20Website%20Typescript%20React/SETUP_GUIDE.md) for detailed frontend configuration instructions.

### 3. Install Backend Dependencies

```bash
cd "../Eval Functions"
npm install
```

## ⚙️ Configuration

### Frontend Configuration

> **📖 Complete Setup Guide:** See [Eval Website Typescript React/SETUP_GUIDE.md](Eval%20Website%20Typescript%20React/SETUP_GUIDE.md) for detailed instructions.

Copy `app.env` to `.env` and update values in `Eval Website Typescript React/`:

```bash
# Copy the template
cp app.env .env
```

Update `.env`:

```env
# Set to false for production use
VITE_ENABLE_DEMO_MODE=false

# Azure Function App URL (your CORS proxy)
VITE_API_BASE_URL=https://your-function-app.azurewebsites.net/api

# Optional: Polling interval for status updates (milliseconds)
VITE_POLLING_INTERVAL=5000
```

**Where to get values:**
- `VITE_API_BASE_URL`: Azure Portal → Your Function App → Overview → URL + `/api`

> **Note:** `app.env` is the template (safe to commit). `.env` is your personal config (in .gitignore, never commit).

### Backend Configuration (Azure Functions)

Set these in Azure Function App → Configuration → Application Settings:

```
APP_ID=<Application Insights App ID>
API_KEY=<Application Insights API Key>
WEBHOOK_URL=<Azure Automation Webhook URL>
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

### PowerShell Runbook Configuration

Edit `Conversation Evaluation Script for Runbook.ps1` lines 13-20:

```powershell
$AppId = "your-app-insights-app-id"
$ApiKey = "your-app-insights-api-key"
$InstrumentationKey = "your-app-insights-instrumentation-key"
$AzureOpenAIEndpoint = "https://your-resource.openai.azure.com"
$AzureOpenAIApiKey = "your-openai-api-key"
$DeploymentName = "your-deployment-name"
$ApiVersion = "2024-02-15-preview"
```

**⚠️ Security Recommendation**: Store these values in Azure Key Vault and use Managed Identity to retrieve them instead of hardcoding.

## 📦 Deployment

### Deploy Azure Functions

#### Option 1: Using Deployment Script (PowerShell)

```powershell
cd "Eval Functions"
.\deploy-new-function.ps1 -FunctionAppName "your-function-app-name"
```

#### Option 2: Using Azure CLI

```bash
cd "Eval Functions"

# Login to Azure
az login

# Deploy
az functionapp deployment source config-zip \
    --resource-group your-resource-group \
    --name your-function-app-name \
    --src deployment.zip \
    --build-remote true
```

#### Option 3: VS Code Azure Functions Extension

1. Install Azure Functions extension
2. Sign in to Azure
3. Right-click Function App → Deploy to Function App

### Deploy PowerShell Runbook

1. Open Azure Portal → Azure Automation Account
2. Go to **Process Automation → Runbooks**
3. Click **+ Create a runbook**
4. Name: `ConversationEvaluationRunbook`
5. Type: **PowerShell**
6. Runtime version: **7.2** (or latest)
7. Paste the script content from `Conversation Evaluation Script for Runbook.ps1`
8. Click **Save** → **Publish**
9. Go to **Webhooks** → **Add webhook**
10. Copy the webhook URL (save it securely - it won't be shown again)

### Deploy Frontend

#### Option 1: Azure Static Web Apps

```bash
cd "Eval Website Typescript React"

# Build the app
npm run build

# Deploy using Azure Static Web Apps CLI or GitHub Actions
```

#### Option 2: Manual Build & Host

```bash
cd "Eval Website Typescript React"

# Build
npm run build

# The dist/ folder contains production files
# Upload to your hosting service (Azure Blob Storage, Netlify, Vercel, etc.)
```

## 📖 Usage

### Starting the Frontend Locally

```bash
cd "Eval Website Typescript React"
npm run dev
```

Access at `http://localhost:5173`

### Running an Evaluation

1. **Enter Conversation ID**: Input the conversation ID you want to evaluate
2. **Click "Run Evaluation"**: Triggers the evaluation process
3. **Monitor Status**: Watch real-time progress updates
4. **View Results**: Check the dashboard for evaluation metrics

### Viewing Conversation Transcripts

1. Navigate to the Transcript Viewer
2. Enter conversation ID
3. View formatted conversation history with timestamps

### Analyzing Dashboard Metrics

The dashboard displays:
- Recent evaluation results
- Overall quality scores
- Metric breakdowns (helpfulness, professionalism, etc.)
- Trend analysis over time
- Pass/fail rates

## 📚 API Documentation

### Azure Functions Endpoints

#### 1. Query Insights

```http
POST /api/query-insights
Content-Type: application/json

{
  "query": "customEvents | where name == 'EvaluationCompleted' | take 10",
  "timespan": "P7D"
}
```

**Response:**
```json
{
  "tables": [...],
  "statistics": {...}
}
```

#### 2. Trigger Evaluation

```http
POST /api/trigger-evaluation
Content-Type: application/json

{
  "conversationId": "conv-12345",
  "requestId": "req-67890"
}
```

**Response:**
```json
{
  "jobId": "webhook-job-123",
  "status": "initiated",
  "message": "Evaluation started",
  "conversationId": "conv-12345"
}
```

#### 3. Get Conversation Transcript

```http
GET /api/get-transcript?conversationId=conv-12345
```

**Response:**
```json
{
  "conversationId": "conv-12345",
  "transcript": [
    {
      "timestamp": "2024-01-15T10:30:00Z",
      "role": "user",
      "message": "I need help with my order"
    },
    {
      "timestamp": "2024-01-15T10:30:15Z",
      "role": "assistant",
      "message": "I'd be happy to help you with your order..."
    }
  ],
  "summary": {
    "totalMessages": 10,
    "userMessages": 5,
    "botMessages": 5
  }
}
```

## 🐛 Troubleshooting

### Common Issues

#### CORS Errors
- Verify `ALLOWED_ORIGINS` is set correctly in Azure Functions
- Check that frontend URL matches exactly (including https://)
- Ensure CORS is enabled in Azure Function App settings

#### Webhook Not Triggering
- Verify webhook URL is correct in Function App configuration
- Check runbook is published in Azure Automation
- Ensure webhook is not expired
- Review Azure Automation job history for errors

#### Application Insights Query Failures
- Verify App ID and API Key are correct
- Check API key has read permissions
- Ensure data exists for the query timespan
- Validate KQL query syntax

#### OpenAI API Errors
- Verify endpoint URL and API key
- Check deployment name matches your Azure OpenAI deployment
- Ensure quota limits haven't been exceeded
- Review runbook execution logs in Azure Automation

### Debug Mode

Enable debug logging in Azure Functions:

```json
{
  "logging": {
    "logLevel": {
      "default": "Debug"
    }
  }
}
```

View logs:
```bash
az webapp log tail --name your-function-app --resource-group your-rg
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Microsoft Fluent UI** - Beautiful component library
- **React Query** - Powerful data synchronization
- **Azure Team** - Robust cloud services
- **OpenAI** - Advanced language models

## 📞 Support

For issues, questions, or contributions:
- Open an issue in the GitHub repository
- Review existing documentation in component READMEs
- Check Azure service health if experiencing infrastructure issues

## 🔐 Security Considerations

1. **Never commit secrets**: Use environment variables and Azure Key Vault
2. **Rotate keys regularly**: Update API keys and webhook URLs periodically
3. **Use Managed Identity**: Prefer managed identities over API keys where possible
4. **Enable HTTPS only**: Ensure all endpoints use HTTPS
5. **Implement authentication**: Add Azure AD authentication for production use
6. **Monitor access logs**: Review Azure Function and Automation account logs regularly

## 🗺️ Roadmap

- [ ] Add authentication with Azure AD
- [ ] Implement batch evaluation support
- [ ] Add export functionality for reports
- [ ] Create mobile app version
- [ ] Add support for multiple language models
- [ ] Implement custom evaluation criteria
- [ ] Add webhook security validation
- [ ] Create CI/CD pipeline templates

---

**Built with ❤️ for improving customer service quality**
