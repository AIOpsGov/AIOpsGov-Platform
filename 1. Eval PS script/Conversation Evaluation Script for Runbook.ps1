# Azure Automation Runbook: ConversationEvaluationRunbook-WebhookPOC.ps1
# Purpose: Webhook-triggered conversation evaluation with workbook integration

param(
    [Parameter(Mandatory=$false)]
    [object]$WebhookData
)

Write-Output "=== Azure OpenAI Conversation Evaluation Runbook (Webhook POC) ==="
Write-Output "Runbook started at: $(Get-Date)"

#region Hardcoded Configuration Variables (POC) (I reccomend storing in KV and using system identity to pull values directly from KV)
$AppId = "your app id for appinsights"
$ApiKey = "your api key for app insights"
$InstrumentationKey = "your app insights instrumentationkey"

# Azure OpenAI Configuration
$AzureOpenAIEndpoint = "your Open AI end Point URL.openai.azure.com"  # No trailing slash
$AzureOpenAIApiKey = "your open ai API key"
$DeploymentName = "Your deployment name"
$ApiVersion = "2024-02-15-preview"

# Working Directory and Settings
$WorkingDirectory = Join-Path $env:TEMP "conversation_eval_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
$DaysToQuery = 7 #set as needed
$EvaluationThreshold = 0.7

# Default conversation ID (fallback) - only used if webhook fails
$DefaultConversationId = "Set Default conversation ID"
#endregion

#region Webhook Processing and Status Tracking
# Process webhook data and extract conversation ID from user input
$ConversationId = $DefaultConversationId  # Start with fallback
$RequestId = "manual-$(Get-Date -Format 'HHmmss')"

if ($WebhookData) {
    Write-Output " Runbook triggered by webhook"
    Write-Output "Webhook Headers: $($WebhookData.RequestHeader | ConvertTo-Json -Compress)"
    
    try {
        # Parse webhook body to get user input from workbook
        if ($WebhookData.RequestBody) {
            Write-Output "Raw webhook body: $($WebhookData.RequestBody)"
            
            # Try to parse as JSON first
            try {
                $webhookBody = $WebhookData.RequestBody | ConvertFrom-Json
                
                # Extract conversation ID from workbook parameter
                if ($webhookBody.conversationId -and $webhookBody.conversationId.Trim() -ne "") {
                    $ConversationId = $webhookBody.conversationId.Trim()
                    Write-Output " Using conversation ID from workbook input: $ConversationId"
                } else {
                    Write-Output " No conversationId provided in workbook, using fallback: $ConversationId"
                }
                
                # Extract optional request ID for tracking
                if ($webhookBody.requestId) {
                    $RequestId = $webhookBody.requestId
                }
                
            } catch {
                # If not JSON, try parsing as form data or query string
                Write-Output " Failed to parse as JSON, trying form data parsing..."
                
                # Handle form-encoded data (conversationId=value&requestId=value)
                if ($WebhookData.RequestBody -match "conversationId=([^&]+)") {
                    $ConversationId = [System.Web.HttpUtility]::UrlDecode($matches[1]).Trim()
                    Write-Output " Extracted conversation ID from form data: $ConversationId"
                }
            }
        }
        
        # Validate the conversation ID format (basic validation)
        if ($ConversationId -and $ConversationId.Length -gt 5) {
            Write-Output " Valid conversation ID received: $ConversationId"
        } else {
            Write-Output " Invalid or empty conversation ID, using default: $DefaultConversationId"
            $ConversationId = $DefaultConversationId
        }
        
        Write-Output "Final Request ID: $RequestId"
        Write-Output "Final Conversation ID: $ConversationId"
        
    } catch {
        Write-Output " Failed to parse webhook data, using defaults: $($_.Exception.Message)"
        $ConversationId = $DefaultConversationId
    }
} else {
    Write-Output " Runbook executed manually with default conversation ID: $ConversationId"
}

# Additional validation and cleanup
$ConversationId = $ConversationId -replace '[^\w\-_]', ''  # Remove any invalid characters
if ($ConversationId.Length -eq 0) {
    $ConversationId = $DefaultConversationId
    Write-Output " Conversation ID was empty after cleanup, using default"
}

# Status tracking function for workbook monitoring
function Update-RunbookStatus {
    param(
        [string]$Status, 
        [string]$Message, 
        [object]$Data = $null
    )
    
    $statusUpdate = @{
        conversationId = $ConversationId
        requestId = $RequestId
        status = $Status
        message = $Message
        timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        runbookName = "ConversationEvaluationRunbook"
    }
    
    if ($Data) {
        $statusUpdate.data = $Data
    }
    
    Write-Output "STATUS UPDATE: [$Status] $Message"
    
    # Push status to Application Insights for workbook monitoring
    $telemetryPayload = @{
        name = "Microsoft.ApplicationInsights.$InstrumentationKey.Event"
        time = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        iKey = $InstrumentationKey
        tags = @{
            "ai.cloud.roleInstance" = "EvaluationRunbook-StatusTracker"
            "ai.internal.sdkVersion" = "PowerShell-Runbook-1.0"
        }
        data = @{
            baseType = "EventData"
            baseData = @{
                ver = 2
                name = "runbook_evaluation_status"
                properties = $statusUpdate
            }
        }
    }
    
    try {
        $null = Invoke-RestMethod -Uri "https://dc.services.visualstudio.com/v2/track" `
                                 -Method Post `
                                 -Headers @{'Content-Type' = 'application/json'} `
                                 -Body ($telemetryPayload | ConvertTo-Json -Depth 10) `
                                 -UseBasicParsing `
                                 -TimeoutSec 10
    } catch {
        Write-Output " Failed to update status: $($_.Exception.Message)"
    }
}
#endregion

# Create working directory
if (-not (Test-Path $WorkingDirectory)) {
    New-Item -ItemType Directory -Path $WorkingDirectory -Force | Out-Null
}

Write-Output "Working Directory: $WorkingDirectory"
Write-Output "Target Conversation: $ConversationId"

#region Step 1: Query Application Insights
function Query-AppInsights {
    Write-Output "`nStep 1: Querying Application Insights for conversation: $ConversationId"
    Update-RunbookStatus -Status "QUERYING" -Message "Fetching conversation data from Application Insights"
    
    $query = @"
customEvents
| where timestamp > ago(${DaysToQuery}d)
| where tostring(customDimensions.conversationId) == '$ConversationId' 
    or tostring(customDimensions.ConversationId) == '$ConversationId'
| project timestamp, name, customDimensions, customMeasurements
| order by timestamp asc
"@

    $headers = @{
        'x-api-key' = $ApiKey
        'content-type' = 'application/json'
    }
    
    $body = @{
        query = $query
        timespan = "P${DaysToQuery}D"
    } | ConvertTo-Json
    
    try {
        $result = Invoke-RestMethod -Uri "https://api.applicationinsights.io/v1/apps/$AppId/query" `
                                  -Method Post `
                                  -Headers $headers `
                                  -Body $body `
                                  -UseBasicParsing
        
        if ($result.tables -and $result.tables[0].rows.Count -gt 0) {
            Write-Output " Found $($result.tables[0].rows.Count) events for conversation"
            
            # Show event summary (less verbose for runbook)
            $eventTypes = $result.tables[0].rows | ForEach-Object { $_.Item(1) } | Group-Object | ForEach-Object { "$($_.Name)($($_.Count))" }
            Write-Output "Event types: $($eventTypes -join ', ')"
            
            return $result
        } else {
            Write-Output " No events found for conversation ID: $ConversationId"
            return $null
        }
    }
    catch {
        Write-Output " Failed to query Application Insights: $($_.Exception.Message)"
        return $null
    }
}
#endregion

#region Step 2: Save and Process Query Results
function Save-QueryResults {
    param(
        [object]$QueryResult,
        [string]$FilePath
    )
    
    Write-Output "`nStep 2: Saving and processing conversation data"
    Update-RunbookStatus -Status "PROCESSING" -Message "Processing conversation data and extracting messages"
    
    $conversationData = @{
        conversationId = $ConversationId
        events = @()
        userMessages = @()
        botMessages = @()
        metadata = @{
            queryTime = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
            totalEvents = $QueryResult.tables[0].rows.Count
            requestId = $RequestId
        }
    }
    
    # Process each row from Application Insights
    foreach ($row in $QueryResult.tables[0].rows) {
        $timestamp = $row[0]
        $eventName = $row[1]
        $customDimensionsRaw = $row[2]
        
        # Parse customDimensions JSON
        try {
            if ($customDimensionsRaw -is [string]) {
                $customDimensions = $customDimensionsRaw | ConvertFrom-Json
            } else {
                $customDimensions = $customDimensionsRaw
            }
        } catch {
            Write-Output " Failed to parse customDimensions for event $eventName"
            $customDimensions = @{}
        }
        
        # Try multiple possible field names for message content
        $messageContent = $null
        $possibleMessageFields = @('text', 'message', 'Message', 'content', 'Content', 'body', 'Body')
        
        foreach ($field in $possibleMessageFields) {
            if ($customDimensions.$field) {
                $messageContent = $customDimensions.$field
                break
            }
        }
        
        $event = @{
            timestamp = $timestamp
            eventName = $eventName
            message = $messageContent
            userId = $customDimensions.userId -or $customDimensions.UserId
            role = if ($eventName -like "*User*" -or $eventName -eq "BotMessageReceived") { "user" } else { "assistant" }
        }
        
        $conversationData.events += $event
        
        # Separate user and bot messages for evaluation
        if ($event.role -eq "user" -and $event.message) {
            $conversationData.userMessages += $event.message
        } elseif ($event.role -eq "assistant" -and $event.message) {
            $conversationData.botMessages += $event.message
        }
    }
    
    Write-Output " Processed $($conversationData.events.Count) events: $($conversationData.userMessages.Count) user messages, $($conversationData.botMessages.Count) bot messages"
    
    # Save to JSON file
    $conversationData | ConvertTo-Json -Depth 10 | Out-File -FilePath $FilePath -Encoding UTF8
    Write-Output " Conversation data saved to: $FilePath"
    
    return $conversationData
}
#endregion

#region Step 3: Azure OpenAI Evaluation
function Invoke-AzureOpenAIEvaluation {
    param(
        [object]$ConversationData,
        [string]$OutputFile
    )
    
    Write-Output "`nStep 3: Running Azure OpenAI evaluation"
    Update-RunbookStatus -Status "EVALUATING" -Message "Running AI-powered conversation evaluation"
    
    # Format conversation for evaluation
    $conversationText = ""
    $userMessages = $ConversationData.userMessages
    $botMessages = $ConversationData.botMessages
    
    Write-Output "Available messages: $($userMessages.Count) user, $($botMessages.Count) bot"
    
    # Strategy 1: Pair user/bot messages
    $maxTurns = [Math]::Min($userMessages.Count, $botMessages.Count)
    if ($maxTurns -gt 0) {
        for ($i = 0; $i -lt $maxTurns; $i++) {
            $conversationText += "Turn $($i + 1):`nUser: $($userMessages[$i])`nAssistant: $($botMessages[$i])`n`n"
        }
    }
    
    # Strategy 2: If no paired conversations, try chronological events
    if (-not $conversationText.Trim() -and $ConversationData.events.Count -gt 0) {
        Write-Output "No paired messages found, using chronological events..."
        
        $eventMessages = $ConversationData.events | Where-Object { $_.message } | Sort-Object timestamp
        foreach ($event in $eventMessages) {
            $role = if ($event.eventName -like "*User*" -or $event.eventName -eq "BotMessageReceived") { "User" } else { "Assistant" }
            $conversationText += "$role`: $($event.message)`n`n"
        }
    }
    
    # Strategy 3: Fallback synthetic conversation
    if (-not $conversationText.Trim()) {
        Write-Output "Creating synthetic evaluation content..."
        $conversationText = "System: Single event conversation detected for evaluation.`nEvent Type: $($ConversationData.events[0].eventName)`nContent: Limited conversation data available"
    }
    
    if (-not $conversationText.Trim()) {
        Write-Output " No conversation content found for evaluation"
        return $null
    }
    
    Write-Output " Evaluating conversation content (length: $($conversationText.Length) chars)"
    
    # Create comprehensive evaluation prompt
    $evaluationPrompt = @"
Please evaluate this customer service conversation comprehensively. Provide detailed analysis and scores.

Content to evaluate:
$conversationText

Evaluation Criteria (score 0.0-1.0 each):
1. HELPFULNESS: How well does the assistant address the user's needs and provide useful information?
2. PROFESSIONALISM: Is the communication tone appropriate, respectful, and professional?
3. RELEVANCY: Are the responses relevant and on-topic to the user's queries?
4. PROBLEM_RESOLUTION: How effectively does the conversation work toward resolving user issues?

Respond with valid JSON only:
{
  "helpfulness_score": 0.85,
  "helpfulness_reasoning": "Detailed explanation for helpfulness score",
  "professionalism_score": 0.90,
  "professionalism_reasoning": "Detailed explanation for professionalism score", 
  "relevancy_score": 0.80,
  "relevancy_reasoning": "Detailed explanation for relevancy score",
  "problem_resolution_score": 0.75,
  "problem_resolution_reasoning": "Detailed explanation for problem resolution score",
  "overall_assessment": "Comprehensive overall assessment of the conversation quality"
}
"@

    # Prepare Azure OpenAI request
    $headers = @{
        'Content-Type' = 'application/json'
        'api-key' = $AzureOpenAIApiKey
    }
    
    $requestBody = @{
        messages = @(
            @{
                role = "system"
                content = "You are an expert customer service conversation evaluator. Provide objective, detailed evaluation with specific reasoning. Always respond with valid JSON only."
            },
            @{
                role = "user" 
                content = $evaluationPrompt
            }
        )
        max_tokens = 1500
        temperature = 0.1
        top_p = 0.95
    } | ConvertTo-Json -Depth 10
    
    $uri = "$AzureOpenAIEndpoint/openai/deployments/$DeploymentName/chat/completions?api-version=$ApiVersion"
    
    try {
        Write-Output "Calling Azure OpenAI for evaluation..."
        
        $response = Invoke-RestMethod -Uri $uri `
                                    -Method Post `
                                    -Headers $headers `
                                    -Body $requestBody `
                                    -UseBasicParsing `
                                    -TimeoutSec 60
        
        $aiResponse = $response.choices[0].message.content.Trim()
        Write-Output " Received evaluation response from Azure OpenAI"
        
        # Parse JSON response
        try {
            $evalResult = $aiResponse | ConvertFrom-Json
            
            # Calculate overall score
            $overallScore = ($evalResult.helpfulness_score + $evalResult.professionalism_score + 
                           $evalResult.relevancy_score + $evalResult.problem_resolution_score) / 4
            
            # Create final evaluation result
            $evaluationOutput = @{
                conversationId = $ConversationData.conversationId
                evaluationTime = $ConversationData.metadata.queryTime
                requestId = $RequestId
                metrics = @{
                    helpfulness = @{
                        score = $evalResult.helpfulness_score
                        reasoning = $evalResult.helpfulness_reasoning
                        passed = $evalResult.helpfulness_score -ge $EvaluationThreshold
                    }
                    professionalism = @{
                        score = $evalResult.professionalism_score  
                        reasoning = $evalResult.professionalism_reasoning
                        passed = $evalResult.professionalism_score -ge $EvaluationThreshold
                    }
                    relevancy = @{
                        score = $evalResult.relevancy_score
                        reasoning = $evalResult.relevancy_reasoning
                        passed = $evalResult.relevancy_score -ge $EvaluationThreshold
                    }
                    problem_resolution = @{
                        score = $evalResult.problem_resolution_score
                        reasoning = $evalResult.problem_resolution_reasoning  
                        passed = $evalResult.problem_resolution_score -ge $EvaluationThreshold
                    }
                }
                overallScore = $overallScore
                passed = $overallScore -ge $EvaluationThreshold
                overallAssessment = $evalResult.overall_assessment
                evaluationModel = $DeploymentName
                tokensUsed = $response.usage.total_tokens
                evaluatedContent = $conversationText.Substring(0, [Math]::Min(500, $conversationText.Length))
            }
            
            # Save evaluation results
            $evaluationOutput | ConvertTo-Json -Depth 10 | Out-File -FilePath $OutputFile -Encoding UTF8
            
            Write-Output " Evaluation completed. Overall score: $($overallScore.ToString('F3'))"
            return $evaluationOutput
            
        } catch {
            Write-Output " Failed to parse Azure OpenAI JSON response: $($_.Exception.Message)"
            Write-Output "Raw response: $aiResponse"
            return $null
        }
        
    } catch {
        Write-Output " Failed to call Azure OpenAI: $($_.Exception.Message)"
        return $null
    }
}
#endregion

#region Step 4: Push Results to Application Insights
function Push-EvaluationResults {
    param([object]$EvaluationData)
    
    Write-Output "`nStep 4: Pushing evaluation results to Application Insights"
    Update-RunbookStatus -Status "UPLOADING" -Message "Uploading comprehensive evaluation results"
    
    $currentTime = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    
    # Create comprehensive telemetry payload
    $telemetryPayload = @{
        name = "Microsoft.ApplicationInsights.$InstrumentationKey.Event"
        time = $currentTime
        iKey = $InstrumentationKey
        tags = @{
            "ai.cloud.roleInstance" = "AzureOpenAI-Evaluator-Runbook"
            "ai.internal.sdkVersion" = "PowerShell-Runbook-2.0"
        }
        data = @{
            baseType = "EventData"
            baseData = @{
                ver = 2
                name = "conversation_evaluation_azure_openai"
                properties = @{
                    conversationId = $EvaluationData.conversationId
                    requestId = $EvaluationData.requestId
                    evaluationTime = $EvaluationData.evaluationTime
                    overallScore = $EvaluationData.overallScore.ToString('F3')
                    passed = $EvaluationData.passed.ToString().ToLower()
                    evaluationModel = $EvaluationData.evaluationModel
                    tokensUsed = $EvaluationData.tokensUsed.ToString()
                    overallAssessment = $EvaluationData.overallAssessment
                    evaluationSource = "automation-runbook"
                    # Individual metric scores and reasoning
                    helpfulness_score = $EvaluationData.metrics.helpfulness.score.ToString('F3')
                    helpfulness_passed = $EvaluationData.metrics.helpfulness.passed.ToString().ToLower()
                    helpfulness_reasoning = $EvaluationData.metrics.helpfulness.reasoning
                    professionalism_score = $EvaluationData.metrics.professionalism.score.ToString('F3')
                    professionalism_passed = $EvaluationData.metrics.professionalism.passed.ToString().ToLower()
                    professionalism_reasoning = $EvaluationData.metrics.professionalism.reasoning
                    relevancy_score = $EvaluationData.metrics.relevancy.score.ToString('F3')
                    relevancy_passed = $EvaluationData.metrics.relevancy.passed.ToString().ToLower()
                    relevancy_reasoning = $EvaluationData.metrics.relevancy.reasoning
                    problem_resolution_score = $EvaluationData.metrics.problem_resolution.score.ToString('F3')
                    problem_resolution_passed = $EvaluationData.metrics.problem_resolution.passed.ToString().ToLower()
                    problem_resolution_reasoning = $EvaluationData.metrics.problem_resolution.reasoning
                }
            }
        }
    }
    
    $headers = @{
        'Content-Type' = 'application/json'
    }
    
    try {
        Write-Output "Sending telemetry payload to Application Insights..."
        
        $response = Invoke-RestMethod -Uri "https://dc.services.visualstudio.com/v2/track" `
                                    -Method Post `
                                    -Headers $headers `
                                    -Body ($telemetryPayload | ConvertTo-Json -Depth 10) `
                                    -UseBasicParsing `
                                    -TimeoutSec 30
        
        Write-Output " Evaluation results pushed successfully to Application Insights"
        Write-Output "  → Table: customEvents"
        Write-Output "  → Event Name: conversation_evaluation_azure_openai"
        Write-Output "  → Ingestion delay: 2-3 minutes typical"
        
        return $true
    }
    catch {
        Write-Output " Failed to push results to Application Insights: $($_.Exception.Message)"
        return $false
    }
}
#endregion

#region Step 5: Cleanup
function Invoke-Cleanup {
    Write-Output "`nStep 5: Cleaning up temporary files"
    
    try {
        if (Test-Path $WorkingDirectory) {
            $files = Get-ChildItem $WorkingDirectory
            Write-Output "Cleaning up $($files.Count) temporary files"
            Remove-Item -Path $WorkingDirectory -Recurse -Force
            Write-Output " Cleanup completed successfully"
        } else {
            Write-Output "No cleanup needed - directory doesn't exist"
        }
    }
    catch {
        Write-Output " Cleanup failed: $($_.Exception.Message)"
    }
}
#endregion

#region Main Execution
try {
    # Initialize status
    Update-RunbookStatus -Status "STARTED" -Message "Runbook execution started for conversation evaluation"
    
    $queryFile = Join-Path $WorkingDirectory "conversation_data.json"
    $evaluationFile = Join-Path $WorkingDirectory "evaluation_results.json"
    
    # Step 1: Query Application Insights
    $queryResult = Query-AppInsights
    
    if (-not $queryResult) {
        Update-RunbookStatus -Status "FAILED" -Message "Failed to retrieve conversation data from Application Insights"
        throw "Failed to retrieve conversation data"
    }
    
    # Step 2: Save and process query results
    $conversationData = Save-QueryResults -QueryResult $queryResult -FilePath $queryFile
    
    # Step 3: Run Azure OpenAI evaluation
    $evaluationResult = Invoke-AzureOpenAIEvaluation -ConversationData $conversationData -OutputFile $evaluationFile
    
    if (-not $evaluationResult) {
        Update-RunbookStatus -Status "FAILED" -Message "Azure OpenAI evaluation failed"
        throw "Azure OpenAI evaluation failed"
    }
    
    # Step 4: Push results to Application Insights  
    $pushSuccess = Push-EvaluationResults -EvaluationData $evaluationResult
    
    if ($pushSuccess) {
        # Final success status with results
        Update-RunbookStatus -Status "COMPLETED" -Message "Evaluation completed successfully" -Data @{
            overallScore = $evaluationResult.overallScore
            passed = $evaluationResult.passed
            tokensUsed = $evaluationResult.tokensUsed
        }
        
        Write-Output ""
        Write-Output "🎉 RUNBOOK EXECUTION COMPLETED SUCCESSFULLY!"
        Write-Output "==============================================="
        Write-Output "Conversation ID: $($evaluationResult.conversationId)"
        Write-Output "Request ID: $RequestId"
        Write-Output "Overall Score: $($evaluationResult.overallScore.ToString('F3'))"
        Write-Output "Status: $(if ($evaluationResult.passed) { 'PASSED ' } else { 'FAILED ✗' })"
        Write-Output "Tokens Used: $($evaluationResult.tokensUsed)"
        Write-Output "Model: $($evaluationResult.evaluationModel)"
        Write-Output ""
        Write-Output "Metric Scores:"
        foreach ($metricName in $evaluationResult.metrics.Keys) {
            $metric = $evaluationResult.metrics[$metricName]
            $status = if ($metric.passed) { "PASS" } else { "FAIL" }
            Write-Output "- $($metricName.ToUpper()): $($metric.score.ToString('F3')) ($status)"
        }
        Write-Output ""
        Write-Output " Results uploaded to Application Insights customEvents table"
        Write-Output " Event name: conversation_evaluation_azure_openai"
        Write-Output " Status tracking: runbook_evaluation_status"
        
        # Return structured output for webhook response
        if ($WebhookData) {
            $webhookResponse = @{
                status = "success"
                requestId = $RequestId
                conversationId = $ConversationId
                overallScore = $evaluationResult.overallScore
                passed = $evaluationResult.passed
                tokensUsed = $evaluationResult.tokensUsed
                evaluationTime = $evaluationResult.evaluationTime
                message = "Evaluation completed successfully"
            }
            
            Write-Output ""
            Write-Output "WEBHOOK RESPONSE:"
            Write-Output ($webhookResponse | ConvertTo-Json -Depth 3)
            return $webhookResponse
        }
    } else {
        Update-RunbookStatus -Status "FAILED" -Message "Evaluation completed but failed to upload results to Application Insights"
        throw "Failed to push evaluation results to Application Insights"
    }
    
} catch {
    $errorMessage = "Runbook execution failed: $($_.Exception.Message)"
    Write-Output " $errorMessage"
    Update-RunbookStatus -Status "FAILED" -Message $errorMessage
    
    if ($WebhookData) {
        $errorResponse = @{
            status = "error"
            requestId = $RequestId
            conversationId = $ConversationId
            error = $_.Exception.Message
            message = "Evaluation failed"
        }
        Write-Output "WEBHOOK ERROR RESPONSE:"
        Write-Output ($errorResponse | ConvertTo-Json -Depth 3)
        return $errorResponse
    }
    
    throw
} finally {
    # Always cleanup
    Invoke-Cleanup
}

Write-Output ""
Write-Output "Runbook completed at: $(Get-Date)"
#endregion