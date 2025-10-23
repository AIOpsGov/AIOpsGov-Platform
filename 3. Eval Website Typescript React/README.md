# Conversation Evaluation System

A professional React TypeScript application for evaluating conversation quality using Azure Automation and Application Insights.

## Features

- 🎯 **Conversation Evaluation**: Trigger automated evaluations via Azure Automation webhooks
- 📊 **Real-time Monitoring**: Track evaluation progress with live status updates
- 📈 **KQL Dashboard**: Visualize evaluation metrics and trends from Application Insights
- 🎨 **Modern UI**: Built with Microsoft Fluent UI components
- 🌙 **Theme Support**: Light and dark mode support
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices

## Technology Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Fluent UI** - Microsoft's design system
- **React Query** - Powerful async state management
- **Axios** - HTTP client for API requests
- **Recharts** - Composable charting library
- **CSS Modules** - Scoped styling

## Project Structure

```
src/
├── components/
│   ├── ConversationEvaluator/    # Main evaluation form component
│   ├── Dashboard/                 # KQL results dashboard
│   ├── StatusTracker/             # Real-time status updates
│   └── Layout/                    # Main layout wrapper
├── services/
│   ├── api.ts                     # API service layer
│   └── types.ts                   # TypeScript interfaces
├── hooks/
│   ├── useEvaluation.ts           # Evaluation logic hook
│   ├── useDashboard.ts            # Dashboard data hook
│   └── useStatusPolling.ts        # Status polling hook
├── utils/
│   ├── formatters.ts              # Data formatting utilities
│   └── constants.ts               # App constants
├── App.tsx                        # Main app component
├── App.css                        # Global styles
└── index.tsx                      # Entry point
```

## Getting Started

### Quick Start

📖 **For detailed setup instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)**

### Prerequisites

- Node.js 18+ and npm
- Azure Function App (backend proxy)
- Azure Automation account with webhook configured (via Function App)
- Application Insights instance (optional, accessed via Function App)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:

Update the `app.env` file with your Azure Function App URL:

```env
# Set to false to connect to real backend
VITE_ENABLE_DEMO_MODE=false

# Your Azure Function App URL
VITE_API_BASE_URL=https://YOUR-FUNCTION-APP-NAME.azurewebsites.net/api
```

3. Start the development server:
```bash
npm run dev
```

The application will open at [http://localhost:5173](http://localhost:5173)

> **Important:** See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for complete configuration instructions, including how to get your Function App URL and troubleshooting tips.

## Configuration

### Azure Automation Webhook

The webhook should accept a POST request with the following payload:

```json
{
  "conversationId": "string",
  "evaluationType": "standard" | "detailed",
  "priority": "low" | "normal" | "high"
}
```

Expected response:

```json
{
  "jobId": "string",
  "status": "pending",
  "message": "Evaluation job created",
  "timestamp": "ISO 8601 timestamp"
}
```

### Application Insights KQL Queries

The application expects the following data structure from Application Insights:

**Evaluation Results Table:**
```kql
customEvents
| where name == "EvaluationCompleted"
| project 
    conversationId = tostring(customDimensions.conversationId),
    jobId = tostring(customDimensions.jobId),
    overallScore = todouble(customDimensions.overallScore),
    metrics = customDimensions.metrics,
    timestamp
```

**Status Updates:**
```kql
customEvents
| where name == "EvaluationStatus"
| where customDimensions.jobId == "{jobId}"
| project 
    status = tostring(customDimensions.status),
    progress = toint(customDimensions.progress),
    timestamp
| order by timestamp desc
```

## Usage

### Running an Evaluation

1. Enter a conversation ID in the input field
2. Click "Run Evaluation" button
3. Monitor real-time status updates in the Status Tracker
4. View results in the Dashboard once completed

### Viewing Dashboard

The dashboard displays:
- Recent evaluations table
- Overall metrics (average score, pass rate)
- Score distribution charts
- Individual metric breakdowns
- Trend analysis over time

## Components

### ConversationEvaluator

Main form component for triggering evaluations. Includes validation, loading states, and error handling.

### Dashboard

Displays aggregated evaluation data with charts and metrics cards. Fetches data from Application Insights using KQL queries.

### StatusTracker

Shows real-time progress through evaluation phases with a progress bar and phase indicators.

### Layout

Main layout wrapper providing consistent structure and navigation.

## Hooks

### useEvaluation

Manages evaluation submission and state:
```typescript
const { startEvaluation, isLoading, error, response } = useEvaluation();
```

### useDashboard

Fetches and manages dashboard data:
```typescript
const { data, isLoading, error, refetch } = useDashboard(queryParams);
```

### useStatusPolling

Polls for evaluation status updates:
```typescript
const { status, progress, isPolling } = useStatusPolling(jobId);
```

## API Integration

### Webhook Endpoint

```typescript
POST {WEBHOOK_URL}
Content-Type: application/json

{
  "conversationId": "conv-12345"
}
```

### Status Polling

```typescript
GET {APP_INSIGHTS_API_URL}/apps/{APP_ID}/query
X-Api-Key: {API_KEY}

query: "customEvents | where customDimensions.jobId == '{jobId}'"
```

### Dashboard Data

```typescript
GET {APP_INSIGHTS_API_URL}/apps/{APP_ID}/query
X-Api-Key: {API_KEY}

query: "customEvents | where name == 'EvaluationCompleted'"
```

## Build

To create a production build:

```bash
npm run build
```

The build folder will contain optimized production files.

## Testing

Run tests with:

```bash
npm test
```

## Deployment

### Azure Static Web Apps

1. Build the application:
```bash
npm run build
```

2. Deploy to Azure Static Web Apps via Azure CLI or GitHub Actions

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
FROM nginx:alpine
COPY --from=0 /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Troubleshooting

### Webhook Connection Issues

- Verify webhook URL is correct and accessible
- Check Azure Automation webhook is enabled
- Ensure authentication headers are configured

### Application Insights Query Errors

- Verify API key has read permissions
- Check App ID is correct
- Ensure KQL queries match your data structure

### CORS Issues

Configure CORS in your Azure Function or API Gateway to allow requests from your domain.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue in the repository.

## Acknowledgments

- Microsoft Fluent UI team for the amazing component library
- React Query team for powerful data synchronization
- Azure team for robust automation and monitoring tools
