#!/usr/bin/env node

/**
 * JARVIS Backend Server - Production Ready
 * Serves the tRPC API for the JARVIS AI Command Center
 */

import { serve } from '@hono/node-server';
import app from './hono';

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

console.log('\n🤖 ════════════════════════════════════════════════════════════');
console.log('🤖   J.A.R.V.I.S. Backend Server');
console.log('🤖   Just A Rather Very Intelligent System');
console.log('🤖 ════════════════════════════════════════════════════════════\n');

console.log('⚙️  Initializing backend services...');
console.log(`📡 Starting server on ${HOST}:${PORT}`);

const server = serve({
  fetch: app.fetch,
  port: Number(PORT),
  hostname: HOST,
});

server.on('listening', () => {
  console.log('\n✅ ════════════════════════════════════════════════════════════');
  console.log('✅   JARVIS Backend Server is ONLINE');
  console.log('✅ ════════════════════════════════════════════════════════════');
  console.log(`\n🌐 Server URL: http://${HOST}:${PORT}`);
  console.log(`🔌 tRPC API:   http://${HOST}:${PORT}/trpc`);
  console.log(`🩺 Health:     http://${HOST}:${PORT}/`);
  console.log('\n💡 Available Services:');
  console.log('   • AI Code Writing');
  console.log('   • Code Execution');
  console.log('   • Project Creation');
  console.log('   • Git Operations');
  console.log('   • Dependency Management');
  console.log('\n📝 Logs will appear below...\n');
});

server.on('error', (error) => {
  console.error('\n❌ ════════════════════════════════════════════════════════════');
  console.error('❌   Server Error');
  console.error('❌ ════════════════════════════════════════════════════════════');
  console.error(error);
  process.exit(1);
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

export default server;
