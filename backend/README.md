# JARVIS Backend - TypeScript Production Setup

## Overview

The JARVIS backend is a fully TypeScript-enabled Express.js server that provides REST API endpoints for the JARVIS AI Command Center. It includes proper type safety, build system, and development workflow.

## Architecture

### Technology Stack
- **Runtime**: Node.js 20+
- **Language**: TypeScript 5.9.x
- **Framework**: Express.js with full TypeScript types
- **Build Tool**: TypeScript Compiler (tsc)
- **Dev Runtime**: tsx (for hot reloading)
- **Module System**: CommonJS

### Directory Structure
```
backend/
├── config/
│   └── environment.ts      # Environment validation and configuration
├── routes/
│   ├── analytics.ts        # Analytics and metrics endpoints
│   ├── ask.ts             # AI reasoning endpoints (Groq, Gemini, HF)
│   ├── content.ts         # Content management
│   ├── integrations.ts    # Social media integrations
│   ├── logs.ts            # System logging
│   ├── media.ts           # Media upload/storage
│   ├── settings.ts        # App settings
│   ├── system.ts          # System health and info
│   ├── trends.ts          # Trend discovery
│   └── voice.ts           # TTS/STT endpoints
├── trpc/
│   ├── app-router.ts      # tRPC router configuration
│   ├── create-context.ts  # tRPC context
│   └── routes/            # tRPC procedure routes
├── dist/                  # Compiled JavaScript output (gitignored)
├── hono.ts               # Hono server with tRPC support
├── server.express.ts     # Main Express server
├── server.ts             # Hono server entry point
└── tsconfig.json         # Backend TypeScript configuration
```

## Getting Started

### Prerequisites
- Node.js 20 or later
- npm or bun package manager

### Installation
```bash
# Install dependencies (from project root)
npm install
```

### Environment Setup

Create a `.env` file in the project root with the following variables:

```bash
# Server Configuration
PORT=3000                    # Backend server port (default: 3000)
HOST=0.0.0.0                # Server host (default: 0.0.0.0)
NODE_ENV=development        # Environment (development/production)
FRONTEND_URL=*              # CORS allowed origin (default: *)

# AI API Keys (at least one recommended)
EXPO_PUBLIC_GROQ_API_KEY=your_groq_key          # Groq (fastest, free)
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_key     # Google Gemini
EXPO_PUBLIC_HF_API_TOKEN=your_hf_token         # HuggingFace
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_key     # OpenAI

# Optional Integrations
YOUTUBE_API_KEY=your_youtube_key
DISCORD_BOT_TOKEN=your_discord_token
TWITTER_API_KEY=your_twitter_key
GOOGLE_CLIENT_ID=your_google_client_id
```

**Environment Validation**: The backend automatically validates environment variables on startup and provides helpful warnings if AI API keys are missing.

## Development Workflow

### Development Mode (Hot Reload)
```bash
# Run with tsx watch (auto-reloads on file changes)
npm run dev:backend

# Or run without watch
npm run start:backend
```

### Production Build
```bash
# Compile TypeScript to JavaScript
npm run build:backend

# Run compiled production build
npm run start:backend:prod
```

### Run All Services
```bash
# Start both backend and frontend
npm run start:all
```

## TypeScript Configuration

### Backend tsconfig.json

Key settings:
- **Target**: ES2020 (modern Node.js features)
- **Module**: CommonJS (Node.js compatibility)
- **Strict Mode**: Enabled with practical relaxations
- **Source Maps**: Enabled for debugging
- **Output**: `backend/dist/`

### Type Safety Features

All routes use proper Express.js TypeScript types:

```typescript
import express, { Request, Response, Router } from 'express';

interface RequestBody {
  field: string;
}

router.post('/endpoint', async (req: Request<{}, {}, RequestBody>, res: Response) => {
  const { field } = req.body;
  // Full type safety and IntelliSense
  res.json({ success: true });
});
```

## API Endpoints

### Core Endpoints

#### Health Check
```
GET /
Response: { status: 'online', message: 'JARVIS Backend API is running', version: '1.0.0', timestamp: ISO-8601 }
```

#### Voice
```
POST /api/voice/tts         - Text-to-speech
POST /api/voice/stt         - Speech-to-text
GET  /api/voice/config      - Voice configuration
```

#### AI Reasoning
```
POST /api/ask               - Ask AI a question
GET  /api/ask/models        - Get available AI models
```

#### Integrations
```
GET  /api/integrations               - List all integrations
GET  /api/integrations/accounts      - Connected social accounts
POST /api/integrations/post          - Post to social media
POST /api/integrations/test/:service - Test integration
```

#### Analytics
```
GET  /api/analytics                  - Overview dashboard
GET  /api/analytics/:platform        - Platform-specific analytics
POST /api/analytics/query            - Complex analytics query
POST /api/analytics/revenue          - Revenue metrics
POST /api/analytics/events           - Track event
POST /api/analytics/insights         - AI insights
```

#### Trends
```
POST /api/trends/discover            - Discover trending topics
GET  /api/trends/:id                 - Get specific trend
POST /api/trends/:id/analyze         - Analyze trend
```

#### Content
```
GET    /api/content                  - List all content
POST   /api/content                  - Create content
GET    /api/content/:id              - Get specific content
PUT    /api/content/:id              - Update content
DELETE /api/content/:id              - Delete content
```

#### Media
```
POST   /api/media/upload             - Upload media file
GET    /api/media/file/:filename     - Get media file
GET    /api/media/list               - List media files
DELETE /api/media/file/:filename     - Delete media file
```

#### Settings
```
GET    /api/settings                 - Get all settings
POST   /api/settings                 - Update settings
GET    /api/settings/:key            - Get specific setting
PUT    /api/settings/:key            - Update specific setting
```

#### System
```
GET /api/system/status              - System status
GET /api/system/health              - Health check
GET /api/system/info                - API information
```

#### Logs
```
GET    /api/logs                    - Get logs
POST   /api/logs                    - Add log entry
DELETE /api/logs                    - Clear logs
```

## Build System

### Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `start:backend` | `tsx backend/server.express.ts` | Development mode with tsx |
| `dev:backend` | `tsx watch backend/server.express.ts` | Development with hot reload |
| `build:backend` | `tsc -p backend/tsconfig.json` | Compile TypeScript |
| `start:backend:prod` | `node backend/dist/server.express.ts` | Run production build |

### Build Process

1. TypeScript files in `backend/**/*.ts` are compiled
2. Output JavaScript placed in `backend/dist/`
3. Source maps generated for debugging
4. Type declarations generated

### Gitignore

The following are excluded from git:
```
backend/dist/           # Compiled output
backend/**/*.js         # Compiled JS files
backend/**/*.js.map     # Source maps
backend/**/*.d.ts       # Type declarations
```

## Error Handling

### Environment Errors
The backend validates environment variables on startup:

```typescript
// Throws EnvironmentError if critical variables are missing
const envConfig = validateEnvironment();

// Logs warnings for missing optional variables (like AI keys)
logEnvironmentInfo(envConfig);
```

### HTTP Error Handling
All routes include proper error handling:

```typescript
try {
  // Route logic
} catch (error) {
  console.error('[Route] Error:', error);
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  res.status(500).json({ error: errorMessage });
}
```

## Debugging

### With Source Maps
1. Build the project: `npm run build:backend`
2. Set breakpoints in original TypeScript files
3. Use Node.js debugger or IDE debugger
4. Source maps will map compiled JS back to TS

### With tsx
1. Run with tsx: `npm run dev:backend`
2. Set breakpoints in TypeScript files
3. Debug directly without compilation

## Production Deployment

### Recommended Process

1. **Build the backend**:
   ```bash
   npm run build:backend
   ```

2. **Verify build**:
   ```bash
   # Check dist folder contains compiled files
   ls -la backend/dist/
   ```

3. **Set environment variables** on your production server

4. **Run production build**:
   ```bash
   npm run start:backend:prod
   ```

5. **Use a process manager** (PM2, systemd, etc.):
   ```bash
   pm2 start backend/dist/server.express.js --name jarvis-backend
   ```

### Environment Variables in Production

Ensure these are set:
- `NODE_ENV=production`
- `PORT=<your-port>`
- `HOST=0.0.0.0` (or your specific host)
- At least one AI API key
- `FRONTEND_URL=<your-frontend-url>` (for CORS)

## Troubleshooting

### "Cannot find module" errors
- Run `npm install` to install dependencies
- Check that `node_modules` exists
- Verify TypeScript files are properly imported with `.js` extensions

### TypeScript compilation errors
- Check `backend/tsconfig.json` configuration
- Run `npm run build:backend` to see full error output
- Ensure all type dependencies are installed (`@types/*` packages)

### Port already in use
- Change `PORT` in `.env` file
- Or kill the process using the port:
  ```bash
  # Find process using port 3000
  lsof -ti:3000
  # Kill it
  kill -9 <PID>
  ```

### AI endpoints not working
- Check that at least one AI API key is configured
- Verify API keys are valid
- Check console for environment warnings on startup

## Contributing

When adding new routes:

1. Create TypeScript file in `backend/routes/`
2. Use proper Express types for Request/Response
3. Export default Router
4. Import and mount in `server.express.ts`
5. Add error handling with type guards
6. Update this documentation

## License

Part of the JARVIS AI Command Center project.
