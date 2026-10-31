# RootCause AI — Frontend

RootCause AI is a web application that helps developers identify and investigate errors in their applications.

### Features
- View telemetry events and incidents.
- Check incident severity and status.
- View AI-generated root causes.
- Read supporting evidence and suggested fixes.
- Inspect error messages and stack traces.

### How It Works
1. Telemetry events are received by the backend.
2. Incidents are created automatically.
3. AI analyzes newly created incidents.
4. The frontend displays the analysis results.

### Run Frontend
```bash
npm install
npm run dev
```

The frontend communicates with the backend through the API Gateway running on port `8080`.