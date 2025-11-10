#!/usr/bin/env node
/**
 * ensure-deps.js - Auto-align dependencies non-interactively
 * Runs expo install --fix and expo-doctor to reduce version prompts
 * Called from postinstall and prestart scripts
 */

const { execSync } = require('child_process');
const path = require('path');

const normalize = (value) => String(value || '').toLowerCase();
const isTruthy = (value) => ['1', 'true', 'yes', 'on'].includes(normalize(value));

const isCI = isTruthy(process.env.CI) || isTruthy(process.env.GITHUB_ACTIONS);
const skipRequested = isTruthy(process.env.SKIP_ENSURE_DEPS);
const offlineMode = isTruthy(process.env.NPM_CONFIG_OFFLINE) || isTruthy(process.env.OFFLINE_MODE);

if (isCI || skipRequested || offlineMode) {
  const reasons = [];
  if (isCI) reasons.push('CI environment');
  if (skipRequested) reasons.push('SKIP_ENSURE_DEPS flag');
  if (offlineMode) reasons.push('offline mode');

  console.log(`[ensure-deps] Skipping dependency alignment (${reasons.join(', ') || 'no internet detected'})`);
  console.log('[ensure-deps] Install will rely on package-lock.json versions.');
  process.exit(0);
}

console.log('[ensure-deps] Running dependency alignment...');

try {
  // Update dependencies to latest compatible versions
  console.log('[ensure-deps] Running: npm update');
  
  try {
    execSync('npm update', {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
      env: { ...process.env, CI: 'true' } // Non-interactive mode
    });
    console.log('[ensure-deps] ✓ Dependencies updated');
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
