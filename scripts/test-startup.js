#!/usr/bin/env node
/**
 * Post-build smoke test: launches the compiled backend, waits for "ONLINE",
 * then shuts down gracefully. Exits 1 on any error.
 */
const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Starting backend smoke test...\n');

let output = '';
const backendPath = path.join(__dirname, '..', 'backend', 'dist', 'server.express.js');

const server = spawn('node', [backendPath], { 
  env: { ...process.env, NODE_ENV: 'production', PORT: '3001' } 
});

// Set a timeout for the test
const timeout = setTimeout(() => {
  console.error('❌ Timeout: Backend did not start within 30 seconds');
  server.kill('SIGKILL');
  process.exit(1);
}, 30000);

server.stdout.on('data', d => {
  const m = d.toString();
  output += m;
  process.stdout.write(m); // Show output in real-time
  
  if (/ONLINE/i.test(m)) {
    console.log('\n✅ Backend ONLINE signal detected');
    clearTimeout(timeout);
    server.kill('SIGTERM');
  }
});

server.stderr.on('data', d => {
  const m = d.toString();
  // Ignore experimental warnings but show actual errors
  if (!m.includes('ExperimentalWarning')) {
    process.stderr.write(m);
  }
});

server.on('exit', (code, signal) => {
  clearTimeout(timeout);
  
  if (!/ONLINE/i.test(output)) {
    console.error('\n❌ Backend failed to report ONLINE status\n');
    console.error('Output received:\n', output);
    process.exit(1);
  }
  
  if (code !== null && code !== 0 && signal !== 'SIGTERM') {
    console.error(`\n❌ Backend exited with code ${code}\n`);
    process.exit(1);
  }
  
  console.log('\n🎉 Backend smoke test passed');
  process.exit(0);
});

server.on('error', (error) => {
  clearTimeout(timeout);
  console.error('\n❌ Failed to start backend:', error.message);
  process.exit(1);
});
