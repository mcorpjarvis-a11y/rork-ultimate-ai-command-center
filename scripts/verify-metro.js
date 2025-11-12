#!/usr/bin/env node
/**
 * Metro Bundler Verification Script
 * 
 * This script verifies that Metro bundler can successfully:
 * 1. Check Node version compatibility
 * 2. Clear all caches
 * 3. Perform a dry bundle of the app
 * 4. Test react-native module resolution
 * 5. Exit successfully without errors
 * 
 * Used for CI/CD validation and local troubleshooting
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const TEMP_OUTPUT = '/tmp/metro-verification-bundle';

console.log('🔍 Starting Metro Bundler Verification...\n');

// Step 0: Check Node version
console.log('🔧 Step 0: Checking Node version...');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

console.log(`  Current Node version: ${nodeVersion}`);

if (majorVersion > 20) {
  console.log('\n⚠️  WARNING: Node.js version > 20 detected!');
  console.log('  React Native 0.81.5 with Metro bundler is optimized for Node 20.x LTS');
  console.log('  You may encounter TransformError issues with Node 22+\n');
  console.log('  Recommended action:');
  console.log('    1. Install Node 20.x LTS using nvm:');
  console.log('       nvm install 20');
  console.log('       nvm use 20');
  console.log('    2. Re-run this verification script\n');
  console.log('  Continuing anyway (you may see errors)...\n');
} else if (majorVersion === 20) {
  console.log('  ✓ Node 20.x LTS detected (recommended)');
} else if (majorVersion < 20) {
  console.log('  ⚠️  Node version < 20 detected. Consider upgrading to Node 20.x LTS');
}
console.log('');

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

// Step 4: Test react-native module resolution
console.log('🧪 Step 4: Testing react-native module resolution...');
try {
  // Attempt to resolve react-native entry point
  const reactNativePath = require.resolve('react-native');
  console.log('  ✓ react-native module resolved successfully');
  console.log(`    Path: ${reactNativePath}`);
  
  // Try to load react-native (basic check)
  try {
    require('react-native');
    console.log('  ✓ react-native module loaded without errors');
  } catch (loadError) {
    console.log('  ⚠️  react-native loaded with warnings (expected in Node environment)');
  }
  
  console.log('✅ Module resolution test complete\n');
} catch (error) {
  console.error('❌ react-native module resolution failed:', error.message);
  console.error('\nTroubleshooting:');
  console.error('  1. Run: npm install');
  console.error('  2. Check that react-native@0.81.5 is installed');
  console.error('  3. Clear node_modules and reinstall: rm -rf node_modules && npm install');
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
