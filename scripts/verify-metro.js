#!/usr/bin/env node
/**
 * Metro Bundler Verification Script
 * 
 * This script verifies that Metro bundler can successfully:
 * 1. Clear all caches
 * 2. Perform a dry bundle of the app
 * 3. Exit successfully without errors
 * 
 * Used for CI/CD validation and local troubleshooting
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const TEMP_OUTPUT = '/tmp/metro-verification-bundle';

console.log('🔍 Starting Metro Bundler Verification...\n');

// Step 1: Clear caches
console.log('📦 Step 1: Clearing Metro caches...');
try {
  // Clear node_modules/.cache
  const cacheDir = path.join(PROJECT_ROOT, 'node_modules', '.cache');
  if (fs.existsSync(cacheDir)) {
    fs.rmSync(cacheDir, { recursive: true, force: true });
    console.log('  ✓ Cleared node_modules/.cache');
  }

  // Clear watchman if available
  try {
    execSync('watchman watch-del-all 2>/dev/null', { stdio: 'pipe' });
    console.log('  ✓ Cleared watchman cache');
  } catch (err) {
    console.log('  ⚠ Watchman not available (optional)');
  }

  // Clear .expo cache
  const expoCache = path.join(PROJECT_ROOT, '.expo');
  if (fs.existsSync(expoCache)) {
    const metroCache = path.join(expoCache, '.metro');
    if (fs.existsSync(metroCache)) {
      fs.rmSync(metroCache, { recursive: true, force: true });
      console.log('  ✓ Cleared .expo/.metro cache');
    }
  }

  console.log('✅ Cache clearing complete\n');
} catch (error) {
  console.error('❌ Cache clearing failed:', error.message);
  process.exit(1);
}

// Step 2: Test bundle generation
console.log('🔨 Step 2: Testing Metro bundle generation...');
console.log(`   Output directory: ${TEMP_OUTPUT}`);

try {
  // Clean temp output directory
  if (fs.existsSync(TEMP_OUTPUT)) {
    fs.rmSync(TEMP_OUTPUT, { recursive: true, force: true });
  }

  // Run expo export to test bundling
  execSync(
    `npx expo export --platform android --output-dir ${TEMP_OUTPUT}`,
    {
      cwd: PROJECT_ROOT,
      stdio: 'inherit',
      env: {
        ...process.env,
        CI: '1', // Ensure CI mode for non-interactive bundling
      },
    }
  );

  console.log('\n✅ Metro bundle generation successful\n');
} catch (error) {
  console.error('\n❌ Metro bundle generation failed');
  console.error('Error:', error.message);
  process.exit(1);
}

// Step 3: Verify bundle contents
console.log('🔎 Step 3: Verifying bundle contents...');
try {
  const bundleDir = path.join(TEMP_OUTPUT, '_expo', 'static', 'js', 'android');
  
  if (!fs.existsSync(bundleDir)) {
    throw new Error('Bundle directory not found');
  }

  const bundleFiles = fs.readdirSync(bundleDir);
  const hasBundle = bundleFiles.some(file => file.startsWith('entry-') && file.endsWith('.hbc'));

  if (!hasBundle) {
    throw new Error('No bundle file found in output');
  }

  console.log('  ✓ Bundle files present');
  console.log('  ✓ Entry bundle found');
  
  // Check metadata
  const metadataPath = path.join(TEMP_OUTPUT, 'metadata.json');
  if (fs.existsSync(metadataPath)) {
    console.log('  ✓ Metadata file present');
  }

  console.log('✅ Bundle verification complete\n');
} catch (error) {
  console.error('❌ Bundle verification failed:', error.message);
  process.exit(1);
}

// Cleanup
console.log('🧹 Cleaning up temporary files...');
try {
  if (fs.existsSync(TEMP_OUTPUT)) {
    fs.rmSync(TEMP_OUTPUT, { recursive: true, force: true });
    console.log('  ✓ Temporary bundle removed');
  }
} catch (error) {
  console.warn('⚠ Cleanup warning:', error.message);
}

console.log('\n✨ Metro Bundler Verification PASSED ✨\n');
process.exit(0);
