#!/usr/bin/env node

/**
 * JARVIS Unified Launcher
 * Starts both frontend and backend in a single command
 */

const { spawn } = require('child_process');
const os = require('os');

const isWindows = os.platform() === 'win32';

console.log('\n🚀 ════════════════════════════════════════════════════════════');
console.log('🚀   JARVIS UNIFIED LAUNCHER');
console.log('🚀   Starting Complete AI Command Center');
console.log('🚀 ════════════════════════════════════════════════════════════\n');

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

console.log('📡 Starting Backend Server...\n');
const backend = spawn(
  isWindows ? 'npx.cmd' : 'npx',
  ['tsx', 'backend/server.express.ts'],
  { stdio: 'pipe', shell: isWindows, env: { ...process.env, FORCE_COLOR: '1' } }
);

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
  
  const frontend = spawn(
    isWindows ? 'npx.cmd' : 'npx',
    ['expo', 'start'],
    { stdio: 'pipe', shell: isWindows, env: { ...process.env, FORCE_COLOR: '1' } }
  );

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
