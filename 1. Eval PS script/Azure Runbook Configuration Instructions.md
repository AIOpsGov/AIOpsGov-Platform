#Azure Runbook Configuration Instructions
##Pre-Upload Configuration Requirements
Before uploading this runbook to Azure Automation, you MUST update the following configuration variables in the Hardcoded Configuration Variables section:

1. Application Insights Configuration
$AppId = "your app id for appinsights"           # ← REPLACE with your App Insights Application ID
$ApiKey = "your api key for app insights"        # ← REPLACE with your App Insights API Key  
$InstrumentationKey = "your app insights instrumentationkey"  # ← REPLACE with Instrumentation Key

How to find these values:
-  App ID: Azure Portal → Application Insights → API Access → Application ID
- API Key: Azure Portal → Application Insights → API Access → Create API Key (needs "Read telemetry" permission)
- Instrumentation Key: Azure Portal → Application Insights → Overview → Instrumentation Key

2. Azure OpenAI Configuration
$AzureOpenAIEndpoint = "your Open AI end Point URL.openai.azure.com"  # ← REPLACE with your endpoint
$AzureOpenAIApiKey = "your open ai API key"                          # ← REPLACE with your API key
$DeploymentName = "Your deployment name"                             # ← REPLACE with your model deployment name

How to find these values:
- Endpoint: Azure Portal → Azure OpenAI → Keys and Endpoint → Endpoint (remove https:// and trailing slash)
- API Key: Azure Portal → Azure OpenAI → Keys and Endpoint → Key 1 or Key 2
- Deployment Name: Azure OpenAI Studio → Deployments → Your model deployment name (e.g., "gpt-4", "gpt-35-turbo")

3. Default Conversation ID
$DefaultConversationId = "Set Default conversation ID"  # ← REPLACE with a fallback conversation ID
Set this to: A valid conversation ID from your Application Insights that you want to use as a fallback when the webhook doesn't provide one.

4. Optional: Adjust Settings
$DaysToQuery = 7                    # ← Days to look back for conversation data (adjust as needed)
$EvaluationThreshold = 0.7          # ← Minimum score to consider "passed" (0.0-1.0)
$ApiVersion = "2024-02-15-preview"  # ← Azure OpenAI API version (update if needed)

Store secrets in Key Vault:
1. Enable System-assigned Managed Identity on your Automation Account
2.Grant the Managed Identity Get permissions on Key Vault secrets
3. Replace hardcoded values with Key Vault queries:


# Example Key Vault integration (replace hardcoded values)
$AppId = Get-AzKeyVaultSecret -VaultName "YourKeyVault" -Name "AppInsightsAppId" -AsPlainText
$ApiKey = Get-AzKeyVaultSecret -VaultName "YourKeyVault" -Name "AppInsightsApiKey" -AsPlainText
# ... etc


1. Save as ConversationEvaluationRunbook.ps1
2. Upload to Azure Automation Account → Runbooks → Import
3. Publish the runbook after import
4. Create webhook for website integration