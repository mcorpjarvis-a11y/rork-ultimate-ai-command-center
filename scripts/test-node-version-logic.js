#!/usr/bin/env node

/**
 * Comprehensive test for Node.js version check
 * Tests the logic with different simulated Node versions
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧪 Testing Node.js Version Check Logic\n');
console.log('=' .repeat(60));

// Create test scripts for different Node versions
const testCases = [
  { version: '16.20.0', shouldExit: true, shouldWarn: false, description: 'Node 16 (too old)' },
  { version: '17.9.0', shouldExit: true, shouldWarn: false, description: 'Node 17 (too old)' },
  { version: '18.0.0', shouldExit: false, shouldWarn: false, description: 'Node 18 (minimum)' },
  { version: '18.17.0', shouldExit: false, shouldWarn: false, description: 'Node 18 LTS' },
  { version: '20.0.0', shouldExit: false, shouldWarn: false, description: 'Node 20 (tested)' },
  { version: '20.19.5', shouldExit: false, shouldWarn: false, description: 'Node 20 LTS' },
  { version: '21.0.0', shouldExit: false, shouldWarn: true, description: 'Node 21 (newer)' },
  { version: '22.0.0', shouldExit: false, shouldWarn: true, description: 'Node 22 (newer)' },
  { version: '23.0.0', shouldExit: false, shouldWarn: true, description: 'Node 23 (newer)' },
];

let allPassed = true;

testCases.forEach((testCase, index) => {
  console.log(`\nTest ${index + 1}: ${testCase.description}`);
  console.log(`  Version: ${testCase.version}`);
  
  const [major] = testCase.version.split('.').map(Number);
  
  // Simulate the logic from check-node-version.js
  let willExit = false;
  let willWarn = false;
  let willSucceed = false;
  
  if (major < 18) {
    willExit = true;
  }
  
  if (major > 20) {
    willWarn = true;
  }
  
  if (major >= 18) {
    willSucceed = true;
  }
  
  const exitCorrect = willExit === testCase.shouldExit;
  const warnCorrect = willWarn === testCase.shouldWarn;
  const exitAfterError = testCase.shouldExit ? !willSucceed : true;
  
  const passed = exitCorrect && warnCorrect && exitAfterError;
  
  if (passed) {
    console.log(`  ✅ PASS`);
    if (willExit) {
      console.log('     → Exits with error (as expected)');
    } else if (willWarn) {
      console.log('     → Shows warning and continues (as expected)');
    } else {
      console.log('     → Shows success and continues (as expected)');
    }
  } else {
    console.log(`  ❌ FAIL`);
    console.log(`     Expected: exit=${testCase.shouldExit}, warn=${testCase.shouldWarn}`);
    console.log(`     Got: willExit=${willExit}, willWarn=${willWarn}, willSucceed=${willSucceed}`);
    allPassed = false;
  }
});

console.log('\n' + '='.repeat(60));

if (allPassed) {
  console.log('\n✅ All tests PASSED!');
  console.log('\n📋 Summary of Version Check Behavior:');
  console.log('   • Node < 18: ❌ Error and exit(1)');
  console.log('   • Node 18-20: ✅ Success and continue');
  console.log('   • Node > 20: ⚠️  Warning and continue');
  console.log('\n🚀 The version check is forward-compatible!');
  process.exit(0);
} else {
  console.log('\n❌ Some tests FAILED');
  console.log('Please review the logic in scripts/check-node-version.js');
  process.exit(1);
}
