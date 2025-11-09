import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate environment before importing routes
import { validateEnvironment, logEnvironmentInfo } from './config/environment';
import { apiLimiter } from './middleware/rateLimiting';

const envConfig = validateEnvironment();
logEnvironmentInfo(envConfig);

// Import routes
import voiceRoutes from './routes/voice';
import askRoutes from './routes/ask';
import integrationsRoutes from './routes/integrations';
import mediaRoutes from './routes/media';
import logsRoutes from './routes/logs';
import settingsRoutes from './routes/settings';
import systemRoutes from './routes/system';
import analyticsRoutes from './routes/analytics';
import trendsRoutes from './routes/trends';
import contentRoutes from './routes/content';
import monetizationRoutes from './routes/monetization';
import iotRoutes from './routes/iot';

const app: Express = express();
const PORT = envConfig.PORT;
const HOST = envConfig.HOST;

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Get allowed origins from env or use safe defaults
    const allowedOrigins = process.env.FRONTEND_URL 
      ? process.env.FRONTEND_URL.split(',').map(o => o.trim())
      : ['http://localhost:8081', 'http://localhost:19006', 'exp://'];
    
    // Check if origin is allowed or starts with exp:// (Expo)
    const isAllowed = allowedOrigins.some(allowed => 
      allowed === '*' || origin === allowed || origin.startsWith('exp://')
    );
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// Request logging middleware
app.use((_req: Request, _res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${_req.method} ${_req.path}`);
  next();
});

// Health check
app.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    message: 'JARVIS Backend API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/voice', voiceRoutes);
app.use('/api/ask', askRoutes);
app.use('/api/integrations', integrationsRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/trends', trendsRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/monetization', monetizationRoutes);
app.use('/api/iot', iotRoutes);

// tRPC support (backwards compatibility)
app.use('/trpc', (req: Request, res: Response) => {
  // Simple tRPC placeholder
  const pathParts = req.path.replace('/trpc/', '').split('.');
  const [namespace, procedure] = pathParts;
  
  res.json({
    message: `tRPC endpoint: ${namespace}.${procedure || 'unknown'}`,
    note: 'Use /api routes for full functionality'
  });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: err.message || 'Internal server error',
    status: 500
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path
  });
});

// Server startup
const server = app.listen(PORT, HOST, () => {
  console.log('\n🤖 ════════════════════════════════════════════════════════════');
  console.log('🤖   J.A.R.V.I.S. Backend Server');
  console.log('🤖   Just A Rather Very Intelligent System');
  console.log('🤖 ════════════════════════════════════════════════════════════\n');
  console.log('✅ Server is ONLINE');
  console.log(`🌐 Server URL: http://${HOST}:${PORT}`);
  console.log(`📡 API Base: http://${HOST}:${PORT}/api`);
  console.log(`🩺 Health: http://${HOST}:${PORT}/`);
  console.log('\n💡 Available Endpoints:');
  console.log('   • /api/voice        - Text-to-speech and speech-to-text');
  console.log('   • /api/ask          - AI reasoning (Gemini, Hugging Face, OpenAI)');
  console.log('   • /api/integrations - Social accounts and connected APIs');
  console.log('   • /api/analytics    - Performance analytics and insights');
  console.log('   • /api/trends       - Trend discovery and analysis');
  console.log('   • /api/content      - Content management');
  console.log('   • /api/media        - Upload, storage, transcription');
  console.log('   • /api/logs         - System and user logs');
  console.log('   • /api/settings     - App configuration');
  console.log('   • /api/system       - System status and info');
  console.log('\n📝 Logs will appear below...\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Shutting down JARVIS Backend Server...');
  server.close(() => {
    console.log('✅ Server stopped gracefully');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n\n⚠️  Received SIGTERM, shutting down...');
  server.close(() => {
    console.log('✅ Server stopped gracefully');
    process.exit(0);
  });
});

module.exports = app;
export default app;
