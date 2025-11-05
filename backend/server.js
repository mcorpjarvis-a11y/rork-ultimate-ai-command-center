const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const voiceRoutes = require('./routes/voice');
const askRoutes = require('./routes/ask');
const integrationsRoutes = require('./routes/integrations');
const mediaRoutes = require('./routes/media');
const logsRoutes = require('./routes/logs');
const settingsRoutes = require('./routes/settings');
const systemRoutes = require('./routes/system');

// Import tRPC server for backwards compatibility
const { trpcServer } = require('@hono/trpc-server');
const { appRouter } = require('./trpc/app-router');
const { createContext } = require('./trpc/create-context');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/', (req, res) => {
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

// tRPC support (backwards compatibility)
app.use('/trpc', (req, res, next) => {
  // Convert Express req/res to Hono-compatible format
  const context = createContext({ req, res });
  
  // Simple tRPC handler
  const path = req.path.replace('/trpc/', '');
  const [namespace, procedure] = path.split('.');
  
  res.json({
    message: `tRPC endpoint: ${namespace}.${procedure}`,
    note: 'Use /api routes for full functionality'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    status: err.status || 500
  });
});

// 404 handler
app.use((req, res) => {
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
  console.log('   • /api/voice       - Text-to-speech and speech-to-text');
  console.log('   • /api/ask         - AI reasoning (Gemini, Hugging Face, OpenAI)');
  console.log('   • /api/integrations - Connected APIs (Google, Discord, YouTube)');
  console.log('   • /api/media       - Upload, storage, transcription');
  console.log('   • /api/logs        - System and user logs');
  console.log('   • /api/settings    - App configuration');
  console.log('   • /api/system      - System status and info');
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
