#!/usr/bin/env node

/**
 * Metro Bundler Test
 * Tests if Metro can process the AuthManager with static imports
 * This validates that the dynamic import fix actually works
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🔍 Testing Metro Bundler with AuthManager...\n');

const projectRoot = path.resolve(__dirname, '..');

console.log('Starting Metro bundler...');
console.log('This will check if AuthManager.ts can be processed without errors\n');

// Start Metro bundler in validation mode
const metro = spawn(
  'npx',
  ['expo', 'export', '--platform', 'android', '--output-dir', '/tmp/metro-test'],
  {
    cwd: projectRoot,
    stdio: 'pipe',
    shell: true
  }
);

let output = '';
let hasError = false;

metro.stdout.on('data', (data) => {
  const message = data.toString();
  output += message;
  process.stdout.write(message);
  
  // Check for the specific dynamic import error
  if (message.includes('Invalid call at line') || 
      message.includes('import(`./providerHelpers/')) {
    hasError = true;
    console.error('\n❌ FAILED: Dynamic import error detected!');
    console.error('The Metro bundler cannot process dynamic imports.\n');
  }
});

metro.stderr.on('data', (data) => {
  const message = data.toString();
  output += message;
  process.stderr.write(message);
  
  if (message.includes('Invalid call at line') || 
      message.includes('import(`./providerHelpers/')) {
    hasError = true;
  }
});

metro.on('close', (code) => {
  console.log('\n' + '═'.repeat(60));
  
  if (hasError) {
    console.error('❌ Metro bundler test FAILED');
    console.error('Dynamic import errors still present');
    console.log('═'.repeat(60) + '\n');
    process.exit(1);
  } else if (code === 0) {
    console.log('✅ Metro bundler test PASSED');
    console.log('AuthManager can be bundled successfully');
    console.log('═'.repeat(60) + '\n');
    process.exit(0);
  } else {
    console.log(`⚠️  Metro bundler exited with code ${code}`);
    console.log('Check the output above for details');
    console.log('═'.repeat(60) + '\n');
    process.exit(code);
  }
});

// Timeout after 2 minutes
setTimeout(() => {
  console.log('\n⚠️  Test timed out after 2 minutes');
  metro.kill();
  process.exit(1);
}, 120000);
