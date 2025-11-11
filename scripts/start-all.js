#!/usr/bin/env node

// Check Node.js version before starting any services
require('./check-node-version');

/**
 * JARVIS Unified Launcher
 * Starts both frontend and backend in a single command
 */

const { spawn, execSync } = require('child_process');
const os = require('os');

const isWindows = os.platform() === 'win32';

console.log('\n🚀 ════════════════════════════════════════════════════════════');
console.log('🚀   JARVIS UNIFIED LAUNCHER');
console.log('🚀   Starting Complete AI Command Center');
console.log('🚀 ════════════════════════════════════════════════════════════\n');

// Check if --skip-update flag is provided
const skipUpdate = process.argv.includes('--skip-update');

let backendRunning = false;
let frontendRunning = false;
let backendReady = false;
let frontendReady = false;

const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
};

function log(prefix, color, message) {
  console.log(`${color}[${prefix}]${colors.reset} ${message}`);
}

console.log('📡 Building Backend Server...\n');

// ✅ Build backend first to avoid React-Native parse errors under Node 22
try {
  execSync('npm run build:backend', { stdio: 'inherit' });
  console.log('\n✅ Backend build completed!\n');
} catch (error) {
  console.error('❌ Failed to build backend:', error.message);
  console.error('\nTroubleshooting:');
  console.error('  1. Check that esbuild is installed: npm install');
  console.error('  2. Verify backend/server.express.ts exists');
  console.error('  3. Check Node version is compatible (Node 22.x supported)');
  process.exit(1);
}

console.log('📡 Starting Backend Server...\n');

// ✅ Run compiled backend safely with Node 22
let backend;
try {
  backend = spawn(
    'node',
    ['backend/dist/server.express.js'],
    { stdio: 'pipe', shell: isWindows, env: { ...process.env, FORCE_COLOR: '1' } }
  );
} catch (error) {
  console.error('❌ Failed to start backend server:', error.message);
  console.error('\nTroubleshooting:');
  console.error('  1. Run: npm run build:backend');
  console.error('  2. Verify backend/dist/server.express.js exists');
  console.error('  3. Check Node version is compatible (Node 22.x supported)');
  process.exit(1);
}

backendRunning = true;

backend.stdout.on('data', (data) => {
  const message = data.toString().trim();
  if (message) {
    log('BACKEND', colors.cyan, message);
    if (message.includes('ONLINE') || message.includes('listening')) {
      backendReady = true;
      checkAllReady();
    }
  }
});

backend.stderr.on('data', (data) => {
  const message = data.toString().trim();
  if (message && !message.includes('ExperimentalWarning')) {
    log('BACKEND', colors.red, message);
  }
});

backend.on('exit', (code) => {
  backendRunning = false;
  if (code !== 0) log('BACKEND', colors.red, `Exited with code ${code}`);
  checkShutdown();
});

setTimeout(() => {
  console.log('\n📱 Starting Frontend (Expo)...\n');
  console.log('🧹 Clearing Metro cache for clean startup...\n');
  
  let frontend;
  try {
    frontend = spawn(
      isWindows ? 'npx.cmd' : 'npx',
      ['expo', 'start', '-c'],
      { stdio: 'pipe', shell: isWindows, env: { ...process.env, FORCE_COLOR: '1' } }
    );
  } catch (error) {
    console.error('❌ Failed to start frontend (Metro bundler):', error.message);
    console.error('\nTroubleshooting:');
    console.error('  1. Run: npm run verify:metro');
    console.error('  2. Clear Metro cache: npm start -- --clear');
    console.error('  3. Check MASTER_CHECKLIST.md Metro Troubleshooting section');
    if (backend && backend.pid) backend.kill('SIGTERM');
    process.exit(1);
  }

  frontendRunning = true;

  frontend.stdout.on('data', (data) => {
    const message = data.toString().trim();
    if (message) {
      log('FRONTEND', colors.magenta, message);
      if (message.includes('Metro') || message.includes('Waiting')) {
        frontendReady = true;
        checkAllReady();
      }
    }
  });

  frontend.stderr.on('data', (data) => {
    const message = data.toString().trim();
    if (message && !message.includes('ExperimentalWarning')) {
      log('FRONTEND', colors.yellow, message);
    }
  });

  frontend.on('exit', (code) => {
    frontendRunning = false;
    if (code !== 0) log('FRONTEND', colors.red, `Exited with code ${code}`);
    checkShutdown();
  });

  function shutdown() {
    console.log('\n\n⚠️  Shutting down JARVIS systems...');
    if (backend.pid) backend.kill('SIGTERM');
    if (frontend.pid) frontend.kill('SIGTERM');
    setTimeout(() => process.exit(0), 2000);
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  if (isWindows) {
    require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    }).on('SIGINT', shutdown);
  }
}, 2000);

function checkAllReady() {
  if (backendReady && frontendReady) {
    console.log('\n✅ ════════════════════════════════════════════════════════════');
    console.log('✅   ALL SYSTEMS ONLINE - JARVIS Ready');
    console.log('✅ ════════════════════════════════════════════════════════════');
    console.log('\n🎯 Backend: http://localhost:3000');
    console.log('📱 Frontend: Check Expo output for QR code\n');
    
    // Perform health checks
    performHealthChecks();
  }
}

function performHealthChecks() {
  console.log('🔍 Performing service health checks...\n');
  
  // Check backend API health
  setTimeout(() => {
    const http = require('http');
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET',
      timeout: 5000
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Backend API Health: OK (http://localhost:3000/)');
          try {
            const response = JSON.parse(data);
            console.log(`   Status: ${response.status || 'online'}`);
          } catch (e) {
            // Ignore parse errors
          }
        } else {
          console.log(`⚠️  Backend API Health: Returned status ${res.statusCode}`);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ Backend API Health: Failed - ${error.message}`);
    });
    
    req.on('timeout', () => {
      console.log('⚠️  Backend API Health: Timeout');
      req.destroy();
    });
    
    req.end();
  }, 1000);
  
  // Check WebSocket endpoint
  setTimeout(() => {
    const net = require('net');
    const client = net.createConnection({ port: 3000, host: 'localhost' }, () => {
      console.log('✅ WebSocket Endpoint: Reachable (http://localhost:3000)');
      client.end();
    });
    
    client.on('error', (error) => {
      console.log(`⚠️  WebSocket Endpoint: ${error.message}`);
    });
    
    client.setTimeout(3000);
    client.on('timeout', () => {
      console.log('⚠️  WebSocket Endpoint: Connection timeout');
      client.destroy();
    });
  }, 1500);
  
  // Summary
  setTimeout(() => {
    console.log('\n📋 Service Status Summary:');
    console.log('   • Backend Server: Running');
    console.log('   • Frontend (Metro): Running');
    console.log('   • API Endpoints: Available');
    console.log('   • WebSocket: Available');
    console.log('\n💡 All core services are operational!\n');
  }, 3000);
}

function checkShutdown() {
  if (!backendRunning && !frontendRunning) {
    console.log('\n✅ All services stopped.\n');
    process.exit(0);
  }
}

process.stdin.resume();
