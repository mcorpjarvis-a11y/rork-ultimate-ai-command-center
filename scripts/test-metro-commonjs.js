#!/usr/bin/env node

/**
 * Metro Config CommonJS Validation Script
 * Validates that metro.config.cjs is pure CommonJS and compatible with Termux/Node.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Metro Config CommonJS Validation...\n');

const projectRoot = path.resolve(__dirname, '..');
const metroConfigPath = path.join(projectRoot, 'metro.config.cjs');
const metroConfigContent = fs.readFileSync(metroConfigPath, 'utf8');

let allPass = true;

// Test 1: File exists
console.log('✓ Test 1: metro.config.cjs exists');

// Test 2: Uses require() instead of import
const hasRequire = metroConfigContent.includes('require(');
const hasImport = /^\s*import\s+.*from/m.test(metroConfigContent);
const test2Pass = hasRequire && !hasImport;
if (test2Pass) {
  console.log('✓ Test 2: Uses require() instead of import');
} else {
  console.log('✗ Test 2: FAILED - Should use require(), not import');
  allPass = false;
}

// Test 3: Uses module.exports instead of export
const hasModuleExports = /module\.exports\s*=/.test(metroConfigContent);
const hasExport = /^\s*export\s+(default|const|\{)/m.test(metroConfigContent);
const test3Pass = hasModuleExports && !hasExport;
if (test3Pass) {
  console.log('✓ Test 3: Uses module.exports instead of export');
} else {
  console.log('✗ Test 3: FAILED - Should use module.exports, not export');
  allPass = false;
}

// Test 4: Exports config object directly
const exportsConfigDirectly = /module\.exports\s*=\s*config/.test(metroConfigContent);
if (exportsConfigDirectly) {
  console.log('✓ Test 4: Exports config object directly (not as default)');
} else {
  console.log('✗ Test 4: FAILED - Should export config object directly');
  allPass = false;
}

// Test 5: start-all.js has -c flag
const startAllPath = path.join(projectRoot, 'scripts', 'start-all.js');
const startAllContent = fs.readFileSync(startAllPath, 'utf8');
const hasClearFlag = startAllContent.includes("'-c'") || startAllContent.includes('"-c"');
if (hasClearFlag) {
  console.log('✓ Test 5: start-all.js includes Metro cache clearing flag (-c)');
} else {
  console.log('✗ Test 5: FAILED - start-all.js should include -c flag for expo start');
  allPass = false;
}

// Test 6: No ES6 imports of metro.config in scripts
const scriptFiles = fs.readdirSync(path.join(projectRoot, 'scripts'))
  .filter(f => f.endsWith('.js') && f !== 'test-metro-commonjs.js');

let hasESMImport = false;
for (const file of scriptFiles) {
  const content = fs.readFileSync(path.join(projectRoot, 'scripts', file), 'utf8');
  if (/import.*metro.*from/i.test(content)) {
    console.log(`✗ Test 6: FAILED - ${file} uses ES6 import for metro`);
    hasESMImport = true;
    allPass = false;
  }
}
if (!hasESMImport) {
  console.log('✓ Test 6: No ES6 imports of metro.config in scripts');
}

// Summary
console.log('\n' + '═'.repeat(60));
if (allPass) {
  console.log('✅ All Metro Config CommonJS validation tests PASSED');
  console.log('═'.repeat(60) + '\n');
  process.exit(0);
} else {
  console.log('❌ Some Metro Config CommonJS validation tests FAILED');
  console.log('═'.repeat(60) + '\n');
  process.exit(1);
}
