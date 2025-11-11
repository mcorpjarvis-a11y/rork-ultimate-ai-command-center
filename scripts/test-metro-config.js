#!/usr/bin/env node

/**
 * Metro Config Validation Script
 * Validates that metro.config.cjs and metro.config.proxy.js exist and have proper structure
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Metro Configuration...\n');

const projectRoot = path.resolve(__dirname, '..');
const metroConfigCjsPath = path.join(projectRoot, 'metro.config.cjs');
const metroConfigProxyPath = path.join(projectRoot, 'metro.config.proxy.js');

let hasErrors = false;

// Check 1: Metro config files exist
console.log('✓ Checking if metro.config.cjs exists...');
if (!fs.existsSync(metroConfigCjsPath)) {
  console.error('✗ ERROR: metro.config.cjs not found!');
  hasErrors = true;
} else {
  console.log('  ✓ metro.config.cjs exists');
}

console.log('✓ Checking if metro.config.proxy.js exists...');
if (!fs.existsSync(metroConfigProxyPath)) {
  console.error('✗ ERROR: metro.config.proxy.js not found!');
  hasErrors = true;
} else {
  console.log('  ✓ metro.config.proxy.js exists');
}

// Check 2: Load and validate metro config structure
if (!hasErrors) {
  console.log('\n✓ Validating metro.config.cjs structure...');
  try {
    const config = require(metroConfigCjsPath);
    
    // Check for resolver configuration
    if (!config.resolver) {
      console.error('✗ ERROR: metro.config.cjs missing resolver configuration');
      hasErrors = true;
    } else {
      console.log('  ✓ Resolver configuration found');
      
      // Check for extraNodeModules
      if (!config.resolver.extraNodeModules) {
        console.error('✗ ERROR: metro.config.cjs missing extraNodeModules');
        hasErrors = true;
      } else {
        console.log('  ✓ extraNodeModules configuration found');
        
        // Check for @/ alias
        if (!config.resolver.extraNodeModules['@']) {
          console.error('✗ ERROR: @/ path alias not configured in extraNodeModules');
          hasErrors = true;
        } else {
          console.log('  ✓ @/ path alias configured');
        }
      }
      
      // Check for sourceExts
      if (!config.resolver.sourceExts) {
        console.warn('⚠ WARNING: sourceExts not explicitly configured (using defaults)');
      } else {
        const hasTs = config.resolver.sourceExts.includes('ts');
        const hasTsx = config.resolver.sourceExts.includes('tsx');
        if (hasTs && hasTsx) {
          console.log('  ✓ TypeScript extensions (.ts, .tsx) configured');
        } else {
          console.warn('⚠ WARNING: TypeScript extensions may not be fully configured');
        }
      }
    }
  } catch (error) {
    console.error('✗ ERROR: Failed to load metro.config.cjs:', error.message);
    hasErrors = true;
  }
}

// Check 3: Verify consistency with babel.config.js
console.log('\n✓ Checking consistency with babel.config.js...');
const babelConfigPath = path.join(projectRoot, 'babel.config.js');
if (fs.existsSync(babelConfigPath)) {
  try {
    const babelConfigContent = fs.readFileSync(babelConfigPath, 'utf8');
    if (babelConfigContent.includes("'@':")) {
      console.log('  ✓ @/ alias also configured in babel.config.js');
    } else {
      console.warn('⚠ WARNING: @/ alias may not be configured in babel.config.js');
    }
  } catch (error) {
    console.warn('⚠ WARNING: Could not read babel.config.js:', error.message);
  }
} else {
  console.warn('⚠ WARNING: babel.config.js not found');
}

// Summary
console.log('\n' + '═'.repeat(60));
if (hasErrors) {
  console.error('❌ Metro configuration validation FAILED');
  console.log('═'.repeat(60) + '\n');
  process.exit(1);
} else {
  console.log('✅ Metro configuration validation PASSED');
  console.log('═'.repeat(60) + '\n');
  process.exit(0);
}
