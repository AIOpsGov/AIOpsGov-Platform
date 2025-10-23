# Azure Functions Deployment Guide

This guide explains how to deploy your Azure Functions.

## Prerequisites

- **Azure CLI** installed: [Install Azure CLI](https://aka.ms/installazurecli)
- **Azure Account** with permissions to deploy to the Function App
- **Function App Name** (e.g., `my-conversation-eval-functions`)
- **Resource Group Name** (optional - script will auto-detect)

## Deployment Methods

### Method 1: Manual Azure CLI Commands

```bash
# 1. Login to Azure
az login

# 2. Set your subscription (if you have multiple)
az account set --subscription "Your-Subscription-Name"

# 3. Create deployment package
New-Item -ItemType Directory -Name "build" -Force; Get-ChildItem -Path "." -Exclude "DEPLOYMENT_README.md", "build", "deployment.zip" | Copy-Item -Destination "build/" -Recurse -Force; Push-Location "build"; Compress-Archive -Path "*" -DestinationPath "../deployment.zip" -Force; Pop-Location; Remove-Item "build" -Recurse -Force; Write-Host "Deployment package created: deployment.zip (excluding DEPLOYMENT_README.md)" -ForegroundColor Green


# 4. Deploy to Azure
az functionapp deployment source config-zip --resource-group your-resource-group --name your-function-app-name --src deployment.zip --build-remote true

# 5. Set Variables within you function app
az functionapp config appsettings set --name "Function name" --resource-group "RG Name" --settings APP_INSIGHTS_APP_ID="<id>" APP_INSIGHTS_API_KEY="<key>" WEBHOOK_URL="<WebhookURL>"

# 6. Cleanup
rm -rf build deployment.zip
```

### Method 4: VS Code Azure Functions Extension

1. Install the **Azure Functions** extension in VS Code
2. Sign in to Azure (Azure icon in sidebar)
3. Right-click your Function App
4. Select **Deploy to Function App**
5. Confirm the deployment


## Verify Deployment

After deployment, test the new endpoint:

```bash
# Test with curl
curl "https://your-function-app-name.azurewebsites.net/api/get-transcript?conversationId=YOUR_CONVERSATION_ID"

# Or with PowerShell
Invoke-RestMethod -Uri "https://your-function-app-name.azurewebsites.net/api/get-transcript?conversationId=YOUR_CONVERSATION_ID"
```

## New Endpoints Available

After deployment, you'll have 3 endpoints:

1. **Query Insights** (existing)
   - URL: `/api/query-insights`
   - Method: POST
   - Purpose: Query Application Insights data

2. **Trigger Evaluation** (existing)
   - URL: `/api/trigger-evaluation`
   - Method: POST
   - Purpose: Trigger the evaluation runbook

3. **Get Conversation Transcript** (NEW)
   - URL: `/api/get-transcript`
   - Method: GET or POST
   - Purpose: Retrieve full conversation transcript
   - Parameters: `conversationId` (required)

## Using from React TypeScript App

```typescript
// Fetch conversation transcript
async function getConversationTranscript(conversationId: string) {
  const response = await fetch(
    `https://your-function-app.azurewebsites.net/api/get-transcript?conversationId=${conversationId}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch transcript');
  }
  
  const data = await response.json();
  return data;
}

// Response interface
interface TranscriptMessage {
  timestamp: string;
  role: 'user' | 'assistant';
  message: string;
  eventName: string;
}

interface TranscriptResponse {
  conversationId: string;
  transcript: TranscriptMessage[];
  summary: {
    totalEvents: number;
    totalMessages: number;
    userMessages: number;
    botMessages: number;
    firstMessageTime: string;
    lastMessageTime: string;
  };
  events: any[];
  queryTime: string;
}

// Usage example
const transcript = await getConversationTranscript('bw_session_123456');
console.log('Conversation has', transcript.summary.totalMessages, 'messages');

// Display in React
transcript.transcript.forEach(msg => {
  console.log(`[${msg.role}]: ${msg.message}`);
});
```

## Troubleshooting

### Error: "Azure CLI not found"
- Install Azure CLI: https://aka.ms/installazurecli

### Error: "Not logged in to Azure"
- Run: `az login`

### Error: "Function App not found"
- Check the Function App name and Resource Group
- Verify you have permissions to access the Function App

### Error: "Deployment failed"
- Check Azure Portal for detailed error logs
- Verify your `package.json` and `host.json` are correct
- Check Function App logs in Azure Portal

### Need to check logs?
```bash
# Stream logs from Function App
az webapp log tail --name your-function-app-name --resource-group your-resource-group
```

## Environment Variables

Make sure these are set in your Azure Function App settings:

- `APP_ID`: Application Insights App ID
- `API_KEY`: Application Insights API Key
- `WEBHOOK_URL`: Webhook URL for evaluation runbook

Check/update in Azure Portal:
1. Go to your Function App
2. Settings → Configuration
3. Application settings

## Files Included

- `GetConversationTranscript.js`: New function to retrieve conversation transcripts
- `QueryInsights.js`: Existing function (unchanged)
- `TriggerEvaluation.js`: Existing function (unchanged)
- `DEPLOYMENT_README.md`: This file


That's it! Your new function is now deployed and ready to use. 
