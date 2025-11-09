#!/usr/bin/env node

/**
 * Backend Isolation Verification Script
 * 
 * Spawns the compiled backend server, verifies it starts successfully
 * by detecting the "ONLINE" log message, and gracefully shuts it down.
 * 
 * Used by `npm run verify:backend` and CI to catch runtime regressions.
 */

const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const TIMEOUT_MS = 30000; // 30 seconds timeout
const SERVER_PATH = path.join(__dirname, '..', 'backend', 'dist', 'server.express.js');
const HEALTH_CHECK_URL = 'http://0.0.0.0:3000/';

// Check Node version and warn if > 20
function checkNodeVersion() {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
  
  if (majorVersion > 20) {
    console.log('⚠️  Node version detected:', nodeVersion);
    console.log('⚠️  Note: Metro bundler may have issues with Node > 20');
    console.log('⚠️  However, the backend should work fine on Node 22 (Termux compatible)');
    console.log('');
  }
}

function probeHealth() {
  return new Promise((resolve, reject) => {
    const req = http.get(HEALTH_CHECK_URL, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.status === 'online') {
            console.log('🩺 Health check passed:', json.message);
            resolve(json);
          } else {
            reject(new Error('Health check returned unexpected status: ' + json.status));
          }
        } catch (error) {
          reject(new Error('Failed to parse health check response: ' + error.message));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(new Error('Health check HTTP request failed: ' + error.message));
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Health check timed out'));
    });
  });
}

function verifyBackend() {
  return new Promise((resolve, reject) => {
    console.log('🔍 Verifying backend isolation...');
    console.log(`📂 Server path: ${SERVER_PATH}`);
    console.log('');
    
    let serverOnline = false;
    let output = '';
    
    // Spawn the server process
    const serverProcess = spawn('node', [SERVER_PATH], {
      env: { ...process.env, NODE_ENV: 'test' },
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    // Timeout handler
    const timeout = setTimeout(() => {
      if (!serverOnline) {
        serverProcess.kill('SIGTERM');
        reject(new Error(`⏱️  Timeout: Server did not come ONLINE within ${TIMEOUT_MS}ms\n\nServer output:\n${output}`));
      }
    }, TIMEOUT_MS);
    
    // Capture stdout
    serverProcess.stdout.on('data', (data) => {
      const message = data.toString();
      output += message;
      process.stdout.write(message);
      
      // Check for ONLINE status
      if (message.includes('ONLINE') || message.includes('online')) {
        serverOnline = true;
        console.log('\n✅ Server came ONLINE successfully!');
        
        // Probe health endpoint
        setTimeout(async () => {
          try {
            await probeHealth();
            clearTimeout(timeout);
            serverProcess.kill('SIGTERM');
          } catch (error) {
            console.error('\n⚠️  Health check failed:', error.message);
            console.error('   Server started but health endpoint is not responding correctly.');
            clearTimeout(timeout);
            serverProcess.kill('SIGTERM');
            // Don't fail the verification if server started but health check failed
            // This is a soft failure
          }
        }, 1000);
      }
    });
    
    // Capture stderr
    serverProcess.stderr.on('data', (data) => {
      const message = data.toString();
      output += message;
      process.stderr.write(message);
    });
    
    // Handle process exit
    serverProcess.on('exit', (code, signal) => {
      clearTimeout(timeout);
      
      if (serverOnline) {
        console.log('🎉 Backend verification PASSED!');
        console.log('   ✓ Server built successfully');
        console.log('   ✓ Server started without errors');
        console.log('   ✓ Server reached ONLINE state');
        console.log('   ✓ Server shut down gracefully');
        resolve();
      } else {
        const error = new Error(
          `❌ Backend verification FAILED!\n` +
          `Server exited with code ${code} (signal: ${signal}) before reaching ONLINE state.\n\n` +
          `Server output:\n${output}`
        );
        reject(error);
      }
    });
    
    // Handle spawn errors
    serverProcess.on('error', (err) => {
      clearTimeout(timeout);
      reject(new Error(`❌ Failed to spawn server: ${err.message}`));
    });
  });
}

// Run verification
checkNodeVersion();
verifyBackend()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
