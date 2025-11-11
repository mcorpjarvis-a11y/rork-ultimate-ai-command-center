#!/usr/bin/env node
/**
 * ensure-deps.js - Auto-align dependencies non-interactively
 * Runs expo install --fix and expo-doctor to reduce version prompts
 * Called from postinstall and prestart scripts
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('[ensure-deps] Running dependency alignment...');

// React-related packages that should be protected from auto-upgrade
const PROTECTED_PACKAGES = [
  'react',
  'react-dom',
  'react-native',
  'react-native-renderer',
  'react-test-renderer'
];

try {
  // Update dependencies to latest compatible versions, excluding React packages
  console.log('[ensure-deps] Running: npm update (excluding React packages)');
  
  try {
    // Read package.json to get all dependencies except protected ones
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    };
    
    // Filter out protected packages
    const packagesToUpdate = Object.keys(allDeps).filter(
      pkg => !PROTECTED_PACKAGES.includes(pkg)
    );
    
    if (packagesToUpdate.length > 0) {
      // Update only non-protected packages
      execSync(`npm update ${packagesToUpdate.join(' ')}`, {
        cwd: path.join(__dirname, '..'),
        stdio: 'inherit',
        env: { ...process.env, CI: 'true' } // Non-interactive mode
      });
      console.log('[ensure-deps] ✓ Dependencies updated (React packages protected)');
    } else {
      console.log('[ensure-deps] ✓ No packages to update');
    }
  } catch (error) {
    console.warn('[ensure-deps] ⚠ npm update completed with warnings (non-blocking)');
  }

  // Run expo install --fix non-interactively
  // This aligns React Native and Expo SDK versions
  console.log('[ensure-deps] Running: npx expo install --fix');
  
  try {
    execSync('npx expo install --fix', {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
      env: { ...process.env, CI: 'true' } // Non-interactive mode
    });
    console.log('[ensure-deps] ✓ Expo dependencies aligned');
  } catch (error) {
    console.warn('[ensure-deps] ⚠ expo install --fix completed with warnings (non-blocking)');
  }

  // Run expo-doctor to check for issues
  console.log('[ensure-deps] Running: npx expo-doctor');
  
  try {
    execSync('npx expo-doctor@latest', {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
      env: { ...process.env, CI: 'true' } // Non-interactive mode
    });
    console.log('[ensure-deps] ✓ Expo doctor check passed');
  } catch (error) {
    console.warn('[ensure-deps] ⚠ expo-doctor found issues (non-blocking)');
  }

  console.log('[ensure-deps] ✓ Dependency alignment complete');
} catch (error) {
  console.error('[ensure-deps] Error during dependency alignment:', error.message);
  // Don't fail the build - just log and continue
  console.log('[ensure-deps] Continuing despite errors...');
}
