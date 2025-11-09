#!/usr/bin/env node

/**
 * Backend Isolation Verification Script
 * 
 * This script performs multiple checks to ensure backend code isolation:
 * 1. Verifies that the backend can start successfully (sanity check)
 * 2. Scans backend source code for forbidden imports (react-native, expo, etc.)
 * 3. Exits with code 0 if all checks pass, non-zero otherwise
 * 
 * Run this in CI to catch accidental coupling between server and mobile code.
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Forbidden patterns in backend code
const FORBIDDEN_PATTERNS = [
  { pattern: /from\s+['"]react-native['"]/g, name: 'react-native' },
  { pattern: /require\s*\(\s*['"]react-native['"]\s*\)/g, name: 'react-native (require)' },
  { pattern: /from\s+['"]react-native-web['"]/g, name: 'react-native-web' },
  { pattern: /from\s+['"]expo['"]/g, name: 'expo' },
  { pattern: /from\s+['"]expo-router['"]/g, name: 'expo-router' },
  { pattern: /from\s+['"]expo-[^'"]+['"]/g, name: 'expo-* modules' },
  { pattern: /from\s+['"]@expo\/[^'"]+['"]/g, name: '@expo/* modules' },
  { pattern: /from\s+['"]react['"]/g, name: 'react' },
  { pattern: /from\s+['"]react-dom['"]/g, name: 'react-dom' },
];

/**
 * Recursively scan directory for TypeScript files
 */
function scanDirectory(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and dist
      if (entry.name === 'node_modules' || entry.name === 'dist') {
        continue;
      }
      scanDirectory(fullPath, files);
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Check a file for forbidden imports
 */
function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const violations = [];
  
  for (const { pattern, name } of FORBIDDEN_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      violations.push({
        file: filePath,
        pattern: name,
        matches: matches,
      });
    }
  }
  
  return violations;
}

/**
 * Scan backend for forbidden imports
 */
async function scanBackendForForbiddenImports() {
  log('\n🔍 Scanning backend for forbidden imports...', colors.cyan);
  
  const backendDir = path.join(__dirname, '..', 'backend');
  const files = scanDirectory(backendDir);
  
  log(`   Found ${files.length} TypeScript files to check`, colors.blue);
  
  const allViolations = [];
  
  for (const file of files) {
    const violations = checkFile(file);
    if (violations.length > 0) {
      allViolations.push(...violations);
    }
  }
  
  if (allViolations.length > 0) {
    log('\n❌ Found forbidden imports in backend:', colors.red);
    for (const violation of allViolations) {
      log(`   ${violation.file}`, colors.yellow);
      log(`   → Forbidden: ${violation.pattern}`, colors.red);
      for (const match of violation.matches) {
        log(`     ${match}`, colors.red);
      }
    }
    return false;
  }
  
  log('✅ No forbidden imports found', colors.green);
  return true;
}

/**
 * Test that backend can start successfully
 */
async function testBackendStartup() {
  log('\n🚀 Testing backend startup...', colors.cyan);
  
  const distPath = path.join(__dirname, '..', 'backend', 'dist', 'server.express.js');
  
  if (!fs.existsSync(distPath)) {
    log('❌ Backend dist file not found. Build must have failed.', colors.red);
    return false;
  }
  
  return new Promise((resolve) => {
    const child = spawn('node', [distPath], {
      cwd: path.join(__dirname, '..'),
      env: { ...process.env, PORT: '0' }, // Use random port
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    
    let output = '';
    let hasStarted = false;
    
    const timeout = setTimeout(() => {
      if (!hasStarted) {
        log('❌ Backend startup timed out', colors.red);
        child.kill();
        resolve(false);
      }
    }, 10000); // 10 second timeout
    
    child.stdout.on('data', (data) => {
      output += data.toString();
      
      // Look for success indicators
      if (output.includes('Server is ONLINE') || output.includes('listening on')) {
        hasStarted = true;
        clearTimeout(timeout);
        log('✅ Backend started successfully', colors.green);
        
        // Give it a moment to settle, then kill
        setTimeout(() => {
          child.kill();
          resolve(true);
        }, 1000);
      }
    });
    
    child.stderr.on('data', (data) => {
      const err = data.toString();
      
      // Check for the TransformError we're trying to prevent
      if (err.includes('TransformError') || err.includes('Unexpected "typeof"')) {
        clearTimeout(timeout);
        log('❌ Backend failed with TransformError (react-native leaked into build)', colors.red);
        log(err, colors.red);
        child.kill();
        resolve(false);
      }
    });
    
    child.on('exit', (code) => {
      clearTimeout(timeout);
      if (!hasStarted) {
        log(`❌ Backend exited with code ${code} before starting`, colors.red);
        if (output) {
          log('Output:', colors.yellow);
          log(output, colors.yellow);
        }
        resolve(false);
      }
    });
    
    child.on('error', (err) => {
      clearTimeout(timeout);
      log(`❌ Failed to start backend: ${err.message}`, colors.red);
      resolve(false);
    });
  });
}

/**
 * Main verification function
 */
async function main() {
  log('\n════════════════════════════════════════════════════════════', colors.blue);
  log('  Backend Isolation Verification', colors.blue);
  log('════════════════════════════════════════════════════════════\n', colors.blue);
  
  // Step 1: Scan for forbidden imports
  const scanPassed = await scanBackendForForbiddenImports();
  
  // Step 2: Test startup
  const startupPassed = await testBackendStartup();
  
  // Summary
  log('\n════════════════════════════════════════════════════════════', colors.blue);
  log('  Verification Summary', colors.blue);
  log('════════════════════════════════════════════════════════════', colors.blue);
  log(`  Import scan:     ${scanPassed ? '✅ PASS' : '❌ FAIL'}`, scanPassed ? colors.green : colors.red);
  log(`  Startup test:    ${startupPassed ? '✅ PASS' : '❌ FAIL'}`, startupPassed ? colors.green : colors.red);
  log('════════════════════════════════════════════════════════════\n', colors.blue);
  
  if (scanPassed && startupPassed) {
    log('✅ All checks passed!', colors.green);
    process.exit(0);
  } else {
    log('❌ Some checks failed. See details above.', colors.red);
    process.exit(1);
  }
}

// Run the verification
main().catch((error) => {
  log(`\n❌ Unexpected error: ${error.message}`, colors.red);
  console.error(error);
  process.exit(1);
});
