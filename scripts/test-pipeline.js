#!/usr/bin/env node

/**
 * Comprehensive Test Pipeline Runner
 * Runs all tests in the correct order and reports results
 * Can be used for CI/CD integration
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('\n🧪 ════════════════════════════════════════════════════════════');
console.log('🧪   COMPREHENSIVE TEST PIPELINE');
console.log('🧪   Running All Tests and Validations');
console.log('🧪 ════════════════════════════════════════════════════════════\n');

const tests = [
  {
    name: 'Metro Configuration Validation',
    command: 'npm run test:metro-config',
    critical: true,
  },
  {
    name: 'Provider Registry Validation',
    command: 'npm run test:provider-registry',
    critical: true,
  },
  {
    name: 'Unit Tests (Jest)',
    command: 'npm test -- --passWithNoTests',
    critical: true,
  },
  {
    name: 'ESLint',
    command: 'npm run lint',
    critical: false,
  },
];

const results = {
  passed: [],
  failed: [],
  skipped: [],
};

let hasFailures = false;

for (const test of tests) {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`📋 Running: ${test.name}`);
  console.log(`${'═'.repeat(60)}\n`);

  try {
    execSync(test.command, {
      stdio: 'inherit',
      cwd: path.resolve(__dirname, '..'),
    });
    
    console.log(`\n✅ ${test.name} PASSED\n`);
    results.passed.push(test.name);
  } catch (error) {
    console.error(`\n❌ ${test.name} FAILED\n`);
    results.failed.push(test.name);
    
    if (test.critical) {
      hasFailures = true;
    } else {
      console.log('⚠️  Non-critical test failed, continuing...\n');
    }
  }
}

// Print summary
console.log('\n' + '═'.repeat(60));
console.log('📊 TEST PIPELINE SUMMARY');
console.log('═'.repeat(60) + '\n');

console.log(`✅ Passed: ${results.passed.length}`);
results.passed.forEach(test => {
  console.log(`   ✓ ${test}`);
});

if (results.failed.length > 0) {
  console.log(`\n❌ Failed: ${results.failed.length}`);
  results.failed.forEach(test => {
    console.log(`   ✗ ${test}`);
  });
}

if (results.skipped.length > 0) {
  console.log(`\n⏭️  Skipped: ${results.skipped.length}`);
  results.skipped.forEach(test => {
    console.log(`   - ${test}`);
  });
}

console.log('\n' + '═'.repeat(60));

if (hasFailures) {
  console.error('❌ TEST PIPELINE FAILED');
  console.log('═'.repeat(60) + '\n');
  process.exit(1);
} else {
  console.log('✅ TEST PIPELINE PASSED');
  console.log('═'.repeat(60) + '\n');
  process.exit(0);
}
