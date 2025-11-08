#!/usr/bin/env node

/**
 * Provider Registry Validation Script
 * Validates that all provider helpers are properly loaded and accessible
 * Tests the static provider registry in AuthManager
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Provider Registry...\n');

const projectRoot = path.resolve(__dirname, '..');
const providersDir = path.join(projectRoot, 'services', 'auth', 'providerHelpers');
const authManagerPath = path.join(projectRoot, 'services', 'auth', 'AuthManager.ts');

let hasErrors = false;
const expectedProviders = [];

// Check 1: Provider helpers directory exists
console.log('✓ Checking provider helpers directory...');
if (!fs.existsSync(providersDir)) {
  console.error('✗ ERROR: Provider helpers directory not found!');
  process.exit(1);
} else {
  console.log('  ✓ Provider helpers directory exists');
}

// Check 2: Discover available provider helpers
console.log('\n✓ Discovering provider helper files...');
const files = fs.readdirSync(providersDir);
const providerFiles = files.filter(f => f.endsWith('.ts') && f !== 'config.ts');

providerFiles.forEach(file => {
  const providerName = file.replace('.ts', '');
  expectedProviders.push(providerName);
  console.log(`  ✓ Found provider helper: ${providerName}`);
});

console.log(`\n  Total provider helpers found: ${expectedProviders.length}`);

// Check 3: Validate AuthManager has static imports for all providers
console.log('\n✓ Validating AuthManager.ts static imports...');
if (!fs.existsSync(authManagerPath)) {
  console.error('✗ ERROR: AuthManager.ts not found!');
  process.exit(1);
}

const authManagerContent = fs.readFileSync(authManagerPath, 'utf8');

// Check for static imports
expectedProviders.forEach(provider => {
  const importPattern = new RegExp(`import \\* as ${provider}Provider from '\\.\/providerHelpers\/${provider}'`);
  if (!importPattern.test(authManagerContent)) {
    console.error(`✗ ERROR: Missing static import for ${provider}`);
    hasErrors = true;
  } else {
    console.log(`  ✓ Static import found for ${provider}`);
  }
});

// Check 4: Validate PROVIDER_REGISTRY includes all providers
console.log('\n✓ Validating PROVIDER_REGISTRY...');

// Check if PROVIDER_REGISTRY exists
if (!authManagerContent.includes('PROVIDER_REGISTRY')) {
  console.error('✗ ERROR: PROVIDER_REGISTRY not found in AuthManager.ts');
  hasErrors = true;
} else {
  console.log('  ✓ PROVIDER_REGISTRY found');
  
  // Check each provider is in the registry
  expectedProviders.forEach(provider => {
    const registryPattern = new RegExp(`${provider}:\\s*${provider}Provider`);
    if (!registryPattern.test(authManagerContent)) {
      console.error(`✗ ERROR: ${provider} not registered in PROVIDER_REGISTRY`);
      hasErrors = true;
    } else {
      console.log(`  ✓ ${provider} registered in PROVIDER_REGISTRY`);
    }
  });
}

// Check 5: Verify no dynamic imports remain
console.log('\n✓ Checking for dynamic imports...');
const dynamicImportPattern = /import\s*\([`'"]/;
if (dynamicImportPattern.test(authManagerContent)) {
  console.error('✗ ERROR: Dynamic imports still present in AuthManager.ts');
  console.error('  Metro bundler cannot handle dynamic imports with template literals');
  hasErrors = true;
} else {
  console.log('  ✓ No dynamic imports found (Metro bundler compatible)');
}

// Check 6: Verify getProviderHelper is synchronous
console.log('\n✓ Checking getProviderHelper method...');
const asyncGetProviderPattern = /async\s+getProviderHelper|getProviderHelper.*:\s*Promise/;
if (asyncGetProviderPattern.test(authManagerContent)) {
  console.error('✗ ERROR: getProviderHelper is still async');
  console.error('  With static imports, this method should be synchronous');
  hasErrors = true;
} else {
  console.log('  ✓ getProviderHelper is synchronous');
}

// Summary
console.log('\n' + '═'.repeat(60));
if (hasErrors) {
  console.error('❌ Provider registry validation FAILED');
  console.log('═'.repeat(60) + '\n');
  process.exit(1);
} else {
  console.log('✅ Provider registry validation PASSED');
  console.log(`✅ All ${expectedProviders.length} providers are properly registered`);
  console.log('═'.repeat(60) + '\n');
  process.exit(0);
}
