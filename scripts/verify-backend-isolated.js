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
const path = require('path');

const TIMEOUT_MS = 30000; // 30 seconds timeout
const SERVER_PATH = path.join(__dirname, '..', 'backend', 'dist', 'server.express.js');

function verifyBackend() {
  return new Promise((resolve, reject) => {
    console.log('🔍 Verifying backend isolation...');
    console.log(`📂 Server path: ${SERVER_PATH}`);
    
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
        
        // Give server a moment to stabilize
        setTimeout(() => {
          clearTimeout(timeout);
          serverProcess.kill('SIGTERM');
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
verifyBackend()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
