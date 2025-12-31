/**
 * API Service Layer
 * Handles all HTTP requests to Azure Automation and Application Insights
 */

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import {
  EvaluationRequest,
  EvaluationResponse,
  EvaluationStatus,
  EvaluationResult,
  DashboardData,
  ApiError,
  PaginatedResponse,
  EvaluationSummary,
  ConversationTranscript,
} from './types';
import {
  API_ENDPOINTS,
  API_CONFIG,
  RETRY_CONFIG,
} from '../utils/constants';

/**
 * Create axios instance with default configuration
 */
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    timeout: 120000, // 2 minutes for complex queries
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor for adding auth headers
  client.interceptors.request.use(
    (config) => {
      // Add Application Insights API key if querying AI
      if (config.url?.includes('applicationinsights.io')) {
        config.headers['x-api-key'] = API_CONFIG.APP_INSIGHTS_API_KEY;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      const apiError: ApiError = {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message,
        timestamp: new Date().toISOString(),
      };

      if (error.response) {
        apiError.code = `HTTP_${error.response.status}`;
        
        // Try to extract error message from response
        const responseData = error.response.data as any;
        if (responseData) {
          if (typeof responseData === 'string') {
            apiError.message = responseData;
          } else if (responseData.message) {
            apiError.message = responseData.message;
          } else if (responseData.error) {
            apiError.message = typeof responseData.error === 'string' 
              ? responseData.error 
              : JSON.stringify(responseData.error);
          } else {
            apiError.message = error.message;
          }
          apiError.details = JSON.stringify(responseData);
        }

        // Log detailed error for debugging
        console.error('API Error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers,
        });
      } else if (error.request) {
        // Request was made but no response received
        apiError.code = 'NETWORK_ERROR';
        apiError.message = 'No response received from server. Please check your network connection.';
        console.error('Network Error - No response:', error.request);
      }

      return Promise.reject(apiError);
    }
  );

  return client;
};

export const apiClient = createApiClient();

/**
 * Retry logic for failed requests
 */
const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  maxAttempts: number = RETRY_CONFIG.MAX_ATTEMPTS,
  delay: number = RETRY_CONFIG.INITIAL_DELAY
): Promise<T> => {
  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxAttempts) {
        const waitTime = Math.min(
          delay * Math.pow(RETRY_CONFIG.BACKOFF_MULTIPLIER, attempt - 1),
          RETRY_CONFIG.MAX_DELAY
        );
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError;
};

/**
 * Trigger evaluation webhook in Azure Automation
 */
export const triggerEvaluation = async (
  request: EvaluationRequest
): Promise<EvaluationResponse> => {
  const requestFn = async () => {
    const payload = {
      conversationId: request.conversationId,
      userId: request.userId || 'anonymous',
      timestamp: request.timestamp || new Date().toISOString(),
      webhookUrl: request.webhookUrl,
      metadata: {
        source: 'web-ui',
        version: '1.0.0',
      },
    };

    console.log('Triggering evaluation with payload:', payload);

    const response = await apiClient.post<EvaluationResponse>(
      API_ENDPOINTS.WEBHOOK,
      payload
    );

    console.log('Trigger evaluation response:', response.data);

    // Handle case where Azure Function returns 200 with data
    if (response.data) {
      // If response has required fields, return it
      if (typeof response.data === 'object') {
        // Create a valid response even if some fields are missing
        return {
          jobId: response.data.jobId || `job-${Date.now()}`,
          status: response.data.status || 'queued',
          message: response.data.message || 'Evaluation triggered successfully',
          timestamp: response.data.timestamp || new Date().toISOString(),
          estimatedDuration: response.data.estimatedDuration,
        } as EvaluationResponse;
      }
    }

    // If response is not in expected format, throw error
    throw new Error('Invalid response format from server');
  };

  return retryRequest(requestFn);
};

/**
 * Get Azure Automation runbook job status
 */
export const getRunbookJobStatus = async (
  jobId: string
): Promise<EvaluationStatus> => {
  const response = await apiClient.post(
    API_ENDPOINTS.JOB_STATUS,
    { jobId }
  );

  if (!response.data) {
    throw new Error('No data received from server');
  }

  // Map the response to EvaluationStatus format
  return {
    jobId: response.data.jobId,
    conversationId: response.data.conversationId || '',
    phase: response.data.phase,
    progress: response.data.progress,
    currentStep: response.data.status,
    startTime: response.data.startTime,
    estimatedCompletion: response.data.endTime || '',
    error: response.data.exception ? {
      code: 'RUNBOOK_ERROR',
      message: response.data.exception
    } : undefined
  };
};

/**
 * Poll evaluation status from Application Insights
 */
export const getEvaluationStatus = async (
  jobId: string
): Promise<EvaluationStatus> => {
  // First, try to get status from Azure Automation
  try {
    return await getRunbookJobStatus(jobId);
  } catch (error) {
    // If runbook status fails, fall back to App Insights logs
    console.log('Falling back to App Insights for status');
  }

  const kqlQuery = `
    customEvents
    | where name == "runbook_evaluation_status"
    | where customDimensions.requestId == "${jobId}"
    | order by timestamp desc
    | take 1
    | project
        jobId = tostring(customDimensions.requestId),
        conversationId = tostring(customDimensions.conversationId),
        phase = tostring(customDimensions.status),
        progress = 50,
        currentStep = tostring(customDimensions.message),
        startTime = tostring(customDimensions.timestamp),
        estimatedCompletion = "",
        errorCode = "",
        errorMessage = ""
  `;

  const response = await apiClient.post(
    API_ENDPOINTS.STATUS,
    {
      query: kqlQuery,
    }
  );

  // Check if response has the expected Application Insights format
  if (!response.data) {
    throw new Error('No data received from server');
  }

  // Handle Application Insights response format
  if (response.data.tables && Array.isArray(response.data.tables) && response.data.tables.length > 0) {
    const table = response.data.tables[0];
    if (!table.rows || table.rows.length === 0) {
      throw new Error('Status not found');
    }

    const row = table.rows[0];
    const status: EvaluationStatus = {
      jobId: row[0],
      conversationId: row[1],
      phase: row[2],
      progress: row[3] || 0,
      currentStep: row[4] || '',
      startTime: row[5],
      estimatedCompletion: row[6],
    };

    if (row[7]) {
      status.error = {
        code: row[7],
        message: row[8],
      };
    }

    return status;
  }

  // Handle direct object format (if your Azure Function returns data differently)
  if (typeof response.data === 'object' && response.data.jobId) {
    return response.data as EvaluationStatus;
  }

  throw new Error('Invalid response format from server');
};

/**
 * Get evaluation results
 */
export const getEvaluationResult = async (
  jobId: string
): Promise<EvaluationResult> => {
  const kqlQuery = `
    customEvents
    | where name == "conversation_evaluation_azure_openai"
    | where customDimensions.requestId == "${jobId}"
    | order by timestamp desc
    | take 1
    | project
        jobId = tostring(customDimensions.requestId),
        conversationId = tostring(customDimensions.conversationId),
        overallScore = todouble(customDimensions.overallScore),
        passed = tobool(customDimensions.passed),
        evaluatedAt = tostring(timestamp),
        duration = 0,
        helpfulness_score = todouble(customDimensions.helpfulness_score),
        professionalism_score = todouble(customDimensions.professionalism_score),
        relevancy_score = todouble(customDimensions.relevancy_score),
        problem_resolution_score = todouble(customDimensions.problem_resolution_score)
  `;

  const response = await apiClient.post(
    API_ENDPOINTS.RESULTS,
    {
      query: kqlQuery,
    }
  );

  // Check if response has data
  if (!response.data) {
    throw new Error('No data received from server');
  }

  // Handle Application Insights response format
  if (response.data.tables && Array.isArray(response.data.tables) && response.data.tables.length > 0) {
    const table = response.data.tables[0];
    if (!table.rows || table.rows.length === 0) {
      throw new Error('Results not found');
    }

    const row = table.rows[0];
    
    // Build metrics from individual score fields
    const metrics = {
      helpfulness: {
        name: 'Helpfulness',
        score: (parseFloat(row[6]) || 0) * 100,
        weight: 1,
        category: 'quality' as const,
        threshold: 70,
        passed: (parseFloat(row[6]) || 0) >= 0.7,
      },
      professionalism: {
        name: 'Professionalism',
        score: (parseFloat(row[7]) || 0) * 100,
        weight: 1,
        category: 'quality' as const,
        threshold: 75,
        passed: (parseFloat(row[7]) || 0) >= 0.75,
      },
      accuracy: {
        name: 'Relevancy',
        score: (parseFloat(row[8]) || 0) * 100,
        weight: 1,
        category: 'quality' as const,
        threshold: 80,
        passed: (parseFloat(row[8]) || 0) >= 0.8,
      },
      clarity: {
        name: 'Problem Resolution',
        score: (parseFloat(row[9]) || 0) * 100,
        weight: 1,
        category: 'quality' as const,
        threshold: 70,
        passed: (parseFloat(row[9]) || 0) >= 0.7,
      },
      empathy: {
        name: 'Empathy',
        score: 0,
        weight: 1,
        category: 'engagement' as const,
        threshold: 65,
        passed: false,
      },
      compliance: {
        name: 'Compliance',
        score: 0,
        weight: 1,
        category: 'compliance' as const,
        threshold: 90,
        passed: false,
      },
      responseTime: {
        name: 'Response Time',
        score: 0,
        weight: 1,
        category: 'technical' as const,
        threshold: 70,
        passed: false,
      },
      resolutionRate: {
        name: 'Resolution Rate',
        score: 0,
        weight: 1,
        category: 'technical' as const,
        threshold: 75,
        passed: false,
      },
    };
    
    return {
      jobId: row[0],
      conversationId: row[1],
      overallScore: (parseFloat(row[2]) || 0) * 100,
      passed: row[3] === true || row[3] === 'true',
      evaluatedAt: row[4],
      duration: parseInt(row[5]) || 0,
      metrics,
      summary: {
        strengths: ['Evaluation completed successfully'],
        improvements: [],
        criticalIssues: [],
      },
      metadata: {
        evaluatorVersion: '1.0',
        modelUsed: 'Azure OpenAI',
        dataSource: 'Application Insights',
      },
    };
  }

  // Handle direct object format (if your Azure Function returns data differently)
  if (typeof response.data === 'object' && response.data.jobId) {
    return response.data as EvaluationResult;
  }

  throw new Error('Invalid response format from server');
};

/**
 * Fetch dashboard data
 */
export const getDashboardData = async (conversationIdFilter?: string, timeRange: string = '30d'): Promise<DashboardData> => {
  // Build KQL query with optional conversation ID filter and time range
  const conversationFilter = conversationIdFilter 
    ? `| where customDimensions.conversationId == "${conversationIdFilter}"` 
    : '';
  
  const kqlQuery = `
    customEvents
    | where name == "conversation_evaluation_azure_openai"
    | where timestamp > ago(${timeRange})
    ${conversationFilter}
    | project
        jobId = tostring(customDimensions.requestId),
        conversationId = tostring(customDimensions.conversationId),
        overallScore = todouble(customDimensions.overallScore),
        passed = tobool(customDimensions.passed),
        evaluatedAt = timestamp,
        duration = 0,
        evaluationModel = tostring(customDimensions.evaluationModel),
        tokensUsed = tostring(customDimensions.tokensUsed),
        evaluationSource = tostring(customDimensions.evaluationSource),
        overallAssessment = tostring(customDimensions.overallAssessment),
        helpfulness_score = todouble(customDimensions.helpfulness_score),
        helpfulness_passed = tobool(customDimensions.helpfulness_passed),
        helpfulness_reasoning = tostring(customDimensions.helpfulness_reasoning),
        professionalism_score = todouble(customDimensions.professionalism_score),
        professionalism_passed = tobool(customDimensions.professionalism_passed),
        professionalism_reasoning = tostring(customDimensions.professionalism_reasoning),
        relevancy_score = todouble(customDimensions.relevancy_score),
        relevancy_passed = tobool(customDimensions.relevancy_passed),
        relevancy_reasoning = tostring(customDimensions.relevancy_reasoning),
        problem_resolution_score = todouble(customDimensions.problem_resolution_score),
        problem_resolution_passed = tobool(customDimensions.problem_resolution_passed),
        problem_resolution_reasoning = tostring(customDimensions.problem_resolution_reasoning)
    | order by evaluatedAt desc
  `;

  console.log('Dashboard KQL Query:', kqlQuery);

  const response = await apiClient.post(
    API_ENDPOINTS.DASHBOARD,
    {
      query: kqlQuery,
    }
  );

  console.log('Dashboard API Response:', response.data);

  // Check if response has data
  if (!response.data) {
    console.error('No data received from server');
    throw new Error('No data received from server');
  }

  // Handle Application Insights response format
  if (response.data.tables && Array.isArray(response.data.tables) && response.data.tables.length > 0) {
    const table = response.data.tables[0];
    
    console.log('Table data:', table);
    console.log('Number of rows:', table.rows?.length || 0);
    
    // If no data, return empty dashboard
    if (!table.rows || table.rows.length === 0) {
      console.log('No evaluation data found in Application Insights');
      return {
        summary: {
          totalEvaluations: 0,
          averageScore: 0,
          passRate: 0,
          averageDuration: 0,
          lastUpdated: new Date().toISOString(),
        },
        recentEvaluations: [],
        scoreDistribution: [],
        metricAverages: [],
        trends: [],
      };
    }

    // Parse all evaluation rows
    const evaluations = table.rows.map((row: any[]) => ({
      jobId: row[0] || '',
      conversationId: row[1] || '',
      overallScore: (parseFloat(row[2]) || 0) * 100, // Convert 0-1 scale to 0-100 percentage
      passed: row[3] === true || row[3] === 'true',
      evaluatedAt: row[4] || new Date().toISOString(),
      duration: parseInt(row[5]) || 0,
      evaluationModel: row[6] || '',
      tokensUsed: row[7] || '',
      evaluationSource: row[8] || '',
      overallAssessment: row[9] || '',
      helpfulness_score: (parseFloat(row[10]) || 0) * 100, // Convert to percentage
      helpfulness_passed: row[11] === true || row[11] === 'true',
      helpfulness_reasoning: row[12] || '',
      professionalism_score: (parseFloat(row[13]) || 0) * 100, // Convert to percentage
      professionalism_passed: row[14] === true || row[14] === 'true',
      professionalism_reasoning: row[15] || '',
      relevancy_score: (parseFloat(row[16]) || 0) * 100, // Convert to percentage
      relevancy_passed: row[17] === true || row[17] === 'true',
      relevancy_reasoning: row[18] || '',
      problem_resolution_score: (parseFloat(row[19]) || 0) * 100, // Convert to percentage
      problem_resolution_passed: row[20] === true || row[20] === 'true',
      problem_resolution_reasoning: row[21] || '',
    }));

    // Calculate summary statistics with business metrics
    const totalEvaluations = evaluations.length;
    const passedCount = evaluations.filter((e: any) => e.passed).length;
    const totalScore = evaluations.reduce((sum: number, e: any) => sum + e.overallScore, 0);
    const totalDuration = evaluations.reduce((sum: number, e: any) => sum + e.duration, 0);
    
    // Calculate average tokens used
    const totalTokens = evaluations.reduce((sum: number, e: any) => {
      const tokens = parseInt(e.tokensUsed) || 0;
      return sum + tokens;
    }, 0);
    const avgTokens = totalEvaluations > 0 ? Math.round(totalTokens / totalEvaluations) : 0;
    
    // Calculate metric-specific averages for business insights
    const totalHelpfulness = evaluations.reduce((sum: number, e: any) => sum + (e.helpfulness_score || 0), 0);
    const totalProfessionalism = evaluations.reduce((sum: number, e: any) => sum + (e.professionalism_score || 0), 0);
    const totalRelevancy = evaluations.reduce((sum: number, e: any) => sum + (e.relevancy_score || 0), 0);
    const totalProblemResolution = evaluations.reduce((sum: number, e: any) => sum + (e.problem_resolution_score || 0), 0);
    
    const avgHelpfulness = totalEvaluations > 0 ? totalHelpfulness / totalEvaluations : 0;
    const avgProfessionalism = totalEvaluations > 0 ? totalProfessionalism / totalEvaluations : 0;
    const avgRelevancy = totalEvaluations > 0 ? totalRelevancy / totalEvaluations : 0;
    const avgProblemResolution = totalEvaluations > 0 ? totalProblemResolution / totalEvaluations : 0;

    // Build score distribution
    const scoreRanges: { [key: string]: number } = {
      '90-100': 0,
      '75-89': 0,
      '60-74': 0,
      '40-59': 0,
      '0-39': 0,
    };

    evaluations.forEach((e: any) => {
      const score = e.overallScore;
      if (score >= 90) scoreRanges['90-100']++;
      else if (score >= 75) scoreRanges['75-89']++;
      else if (score >= 60) scoreRanges['60-74']++;
      else if (score >= 40) scoreRanges['40-59']++;
      else scoreRanges['0-39']++;
    });

    // Generate trend data by grouping evaluations by time periods
    const generateTrends = () => {
      const trends: any[] = [];
      const timeGrouping = timeRange === '30m' || timeRange === '24h' ? 'hourly' :
                          timeRange === '48h' || timeRange === '7d' ? 'daily' : 'weekly';
      
      const grouped = new Map<string, any[]>();
      
      evaluations.forEach((e: any) => {
        const date = new Date(e.evaluatedAt);
        let key: string;
        
        if (timeGrouping === 'hourly') {
          key = `${date.getMonth()+1}/${date.getDate()} ${date.getHours()}:00`;
        } else if (timeGrouping === 'daily') {
          key = `${date.getMonth()+1}/${date.getDate()}`;
        } else {
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = `${weekStart.getMonth()+1}/${weekStart.getDate()}`;
        }
        
        if (!grouped.has(key)) {
          grouped.set(key, []);
        }
        grouped.get(key)!.push(e);
      });
      
      grouped.forEach((items, date) => {
        const avgScore = items.reduce((sum: number, e: any) => sum + e.overallScore, 0) / items.length;
        const passed = items.filter((e: any) => e.passed).length;
        const passRate = (passed / items.length) * 100;
        const avgHelp = items.reduce((sum: number, e: any) => sum + e.helpfulness_score, 0) / items.length;
        const avgProf = items.reduce((sum: number, e: any) => sum + e.professionalism_score, 0) / items.length;
        const avgRel = items.reduce((sum: number, e: any) => sum + e.relevancy_score, 0) / items.length;
        const avgProb = items.reduce((sum: number, e: any) => sum + e.problem_resolution_score, 0) / items.length;
        
        trends.push({
          date,
          overallScore: avgScore,
          passRate,
          totalConversations: items.length,
          helpfulness: avgHelp,
          professionalism: avgProf,
          relevancy: avgRel,
          problemResolution: avgProb,
        });
      });
      
      return trends.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      });
    };

    // Identify failed conversations
    const failedConversations = evaluations
      .filter((e: any) => !e.passed)
      .map((e: any) => {
        const failedMetrics: string[] = [];
        if (!e.helpfulness_passed) failedMetrics.push('Helpfulness');
        if (!e.professionalism_passed) failedMetrics.push('Professionalism');
        if (!e.relevancy_passed) failedMetrics.push('Relevancy');
        if (!e.problem_resolution_passed) failedMetrics.push('Problem Resolution');
        
        return {
          conversationId: e.conversationId,
          overallScore: e.overallScore,
          evaluatedAt: e.evaluatedAt,
          failedMetrics,
          criticalIssues: failedMetrics.length,
        };
      })
      .sort((a: any, b: any) => a.overallScore - b.overallScore);

    return {
      summary: {
        totalEvaluations,
        averageScore: totalEvaluations > 0 ? totalScore / totalEvaluations : 0,
        passRate: totalEvaluations > 0 ? (passedCount / totalEvaluations) * 100 : 0,
        averageDuration: totalEvaluations > 0 ? totalDuration / totalEvaluations : 0,
        averageTokens: avgTokens,
        avgHelpfulness,
        avgProfessionalism,
        avgRelevancy,
        avgProblemResolution,
        lastUpdated: new Date().toISOString(),
      },
      recentEvaluations: evaluations.map((e: any) => ({
        ...e, // Include all fields from the query
        score: e.overallScore,
        topMetric: 'N/A',
        lowestMetric: 'N/A',
      })),
      scoreDistribution: Object.entries(scoreRanges).map(([range, count]) => ({
        range,
        count,
        percentage: totalEvaluations > 0 ? (count / totalEvaluations) * 100 : 0,
      })),
      metricAverages: [],
      trends: generateTrends(),
      failedConversations,
    };
  }

  // Handle direct object format (if your Azure Function returns data differently)
  if (typeof response.data === 'object') {
    // If response is already in DashboardData format
    if (response.data.summary) {
      return response.data as DashboardData;
    }
    
    // If response is an array of evaluations
    if (Array.isArray(response.data)) {
      const evaluations = response.data;
      const totalEvaluations = evaluations.length;
      const passedCount = evaluations.filter((e: any) => e.passed).length;
      
      return {
        summary: {
          totalEvaluations,
          averageScore: totalEvaluations > 0 
            ? evaluations.reduce((sum: number, e: any) => sum + (e.overallScore || 0), 0) / totalEvaluations 
            : 0,
          passRate: totalEvaluations > 0 ? (passedCount / totalEvaluations) * 100 : 0,
          averageDuration: totalEvaluations > 0
            ? evaluations.reduce((sum: number, e: any) => sum + (e.duration || 0), 0) / totalEvaluations
            : 0,
          lastUpdated: new Date().toISOString(),
        },
        recentEvaluations: evaluations.slice(0, 10).map((e: any) => ({
          jobId: e.jobId || '',
          conversationId: e.conversationId || '',
          score: e.overallScore || 0,
          passed: e.passed || false,
          evaluatedAt: e.evaluatedAt || new Date().toISOString(),
          duration: e.duration || 0,
          topMetric: 'N/A',
          lowestMetric: 'N/A',
        })),
        scoreDistribution: [],
        metricAverages: [],
        trends: [],
      };
    }
  }

  // Return empty dashboard if can't parse
  console.log('Could not parse response data, returning empty dashboard');
  return {
    summary: {
      totalEvaluations: 0,
      averageScore: 0,
      passRate: 0,
      averageDuration: 0,
      lastUpdated: new Date().toISOString(),
    },
    recentEvaluations: [],
    scoreDistribution: [],
    metricAverages: [],
    trends: [],
  };
};

/**
 * Get recent evaluations with pagination
 */
export const getRecentEvaluations = async (
  page: number = 1,
  pageSize: number = 10
): Promise<PaginatedResponse<EvaluationSummary>> => {
  const skip = (page - 1) * pageSize;
  
  const kqlQuery = `
    customEvents
    | where name == "EvaluationCompleted"
    | order by timestamp desc
    | skip ${skip}
    | take ${pageSize}
    | project
        jobId = tostring(customDimensions.jobId),
        conversationId = tostring(customDimensions.conversationId),
        score = todouble(customDimensions.overallScore),
        passed = tobool(customDimensions.passed),
        evaluatedAt = timestamp,
        duration = toint(customDimensions.duration)
  `;

  const response = await apiClient.post(
    API_ENDPOINTS.DASHBOARD,
    {
      query: kqlQuery,
    }
  );

  // Parse response and return paginated data
  return {
    data: [],
    pagination: {
      currentPage: page,
      pageSize,
      totalItems: 0,
      totalPages: 0,
    },
  };
};

/**
 * Get conversation transcript
 */
export const getConversationTranscript = async (
  conversationId: string
): Promise<ConversationTranscript> => {
  const kqlQuery = `
    customEvents
    | where (name contains "BotMessage")
    | where customDimensions.conversationId == "${conversationId}"
    | order by timestamp asc
    | project
        role = iff(name == "BotMessageReceived", "user", 
               iff(name == "BotMessageSend", "assistant", "system")),
        content = tostring(customDimensions.text),
        timestamp = timestamp,
        userId = tostring(customDimensions.recipientId),
        channel = tostring(customDimensions.channelId)
  `;

  console.log('Fetching transcript for conversation:', conversationId);

  const response = await apiClient.post(
    API_ENDPOINTS.DASHBOARD,
    {
      query: kqlQuery,
    }
  );

  console.log('Transcript API Response:', response.data);

  // Check if response has data
  if (!response.data) {
    throw new Error('No data received from server');
  }

  // Handle Application Insights response format
  if (response.data.tables && Array.isArray(response.data.tables) && response.data.tables.length > 0) {
    const table = response.data.tables[0];
    
    // If no messages found, return empty transcript
    if (!table.rows || table.rows.length === 0) {
      console.log('No conversation messages found in Application Insights');
      return {
        conversationId,
        messages: [],
        startTime: new Date().toISOString(),
        metadata: {},
      };
    }

    // Parse all messages
    const messages = table.rows.map((row: any[]) => ({
      role: (row[0] || 'user') as 'user' | 'assistant' | 'system',
      content: row[1] || '',
      timestamp: row[2] || new Date().toISOString(),
    }));

    const startTime = messages.length > 0 ? messages[0].timestamp : new Date().toISOString();
    const endTime = messages.length > 0 ? messages[messages.length - 1].timestamp : undefined;
    
    return {
      conversationId,
      messages,
      startTime,
      endTime,
      metadata: {
        userId: table.rows[0]?.[3],
        channel: table.rows[0]?.[4],
      },
    };
  }

  // Return empty transcript if can't parse
  console.log('Could not parse transcript data, returning empty transcript');
  return {
    conversationId,
    messages: [],
    startTime: new Date().toISOString(),
    metadata: {},
  };
};

/**
 * Health check endpoint
 */
export const healthCheck = async (): Promise<boolean> => {
  try {
    await apiClient.get('/health');
    return true;
  } catch {
    return false;
  }
};

/**
 * Export all API methods
 */
export const api = {
  triggerEvaluation,
  getEvaluationStatus,
  getRunbookJobStatus,
  getEvaluationResult,
  getDashboardData,
  getRecentEvaluations,
  getConversationTranscript,
  healthCheck,
};

export default api;
