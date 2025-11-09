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

if (!skipUpdate) {
  console.log('🔍 Checking dependencies...\n');

  try {
    // Check for outdated packages
    try {
      execSync('npm outdated || true', { stdio: 'inherit' });
    } catch (e) {
      // npm outdated exits with 1 if there are outdated packages, which is fine
    }
    
    console.log('\n📦 Updating dependencies to match package.json...\n');
    execSync('npm install', { stdio: 'inherit' });
    
    console.log('\n✅ Dependencies updated successfully!\n');
  } catch (error) {
    console.error('⚠️  Warning: Failed to update dependencies:', error.message);
    console.log('Continuing with current dependencies...\n');
  }
} else {
  console.log('⏭️  Skipping dependency update (--skip-update flag provided)\n');
}

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
  
  let frontend;
  try {
    frontend = spawn(
      isWindows ? 'npx.cmd' : 'npx',
      ['expo', 'start'],
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
  }
}

function checkShutdown() {
  if (!backendRunning && !frontendRunning) {
    console.log('\n✅ All services stopped.\n');
    process.exit(0);
  }
}

process.stdin.resume();
