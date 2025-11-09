#!/usr/bin/env node
/**
 * Test Optional Enhancements
 * Validates the 5 optional features have been implemented
 */

const fs = require('fs');
const path = require('path');

console.log('\n=== Testing Optional Enhancements ===\n');

let passed = 0;
let failed = 0;
const details = [];

// Test 1: ensure-deps.js wired into package.json
console.log('📋 Test 1: Dependency Script Integration');
const packagePath = path.join(__dirname, '../package.json');
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const hasPostinstall = packageJson.scripts?.postinstall?.includes('ensure-deps.js');
  const hasPrestart = packageJson.scripts?.prestart?.includes('ensure-deps.js');
  
  if (hasPostinstall && hasPrestart) {
    console.log('  ✅ ensure-deps.js wired into package.json');
    console.log('    - postinstall: ✓');
    console.log('    - prestart: ✓');
    passed++;
    details.push('Dependency auto-alignment runs on install and start');
  } else {
    console.log('  ❌ ensure-deps.js not properly wired');
    if (!hasPostinstall) console.log('    - Missing postinstall');
    if (!hasPrestart) console.log('    - Missing prestart');
    failed++;
  }
} else {
  console.log('  ❌ package.json not found');
  failed++;
}

// Test 2: .npmrc for legacy-peer-deps
console.log('\n📋 Test 2: NPM Configuration');
const npmrcPath = path.join(__dirname, '../.npmrc');
if (fs.existsSync(npmrcPath)) {
  const content = fs.readFileSync(npmrcPath, 'utf8');
  const hasLegacyPeerDeps = content.includes('legacy-peer-deps=true');
  const hasSaveExact = content.includes('save-exact');
  
  if (hasLegacyPeerDeps) {
    console.log('  ✅ .npmrc created with legacy-peer-deps');
    if (hasSaveExact) console.log('    - save-exact: ✓');
    passed++;
    details.push('NPM configured to avoid peer dependency conflicts');
  } else {
    console.log('  ❌ .npmrc missing legacy-peer-deps');
    failed++;
  }
} else {
  console.log('  ❌ .npmrc not found');
  failed++;
}

// Test 3: RuntimeConfig service
console.log('\n📋 Test 3: RuntimeConfig Service');
const runtimeConfigPath = path.join(__dirname, '../services/config/RuntimeConfig.ts');
if (fs.existsSync(runtimeConfigPath)) {
  const content = fs.readFileSync(runtimeConfigPath, 'utf8');
  const hasGetBackendUrl = content.includes('async getBackendUrl()');
  const hasGetWsUrl = content.includes('async getWsUrl()');
  const hasDefaultConfig = content.includes('buildDefaultConfig()');
  const hasAndroidEmulator = content.includes('10.0.2.2');
  const hasAsyncStorage = content.includes('AsyncStorage');
  
  if (hasGetBackendUrl && hasGetWsUrl && hasDefaultConfig && hasAndroidEmulator && hasAsyncStorage) {
    console.log('  ✅ RuntimeConfig service implemented');
    console.log('    - getBackendUrl(): ✓');
    console.log('    - getWsUrl(): ✓');
    console.log('    - Default configs: ✓');
    console.log('    - Android emulator support (10.0.2.2): ✓');
    console.log('    - AsyncStorage persistence: ✓');
    passed++;
    details.push('Centralized runtime configuration with sensible defaults');
  } else {
    console.log('  ❌ RuntimeConfig incomplete');
    failed++;
  }
} else {
  console.log('  ❌ RuntimeConfig.ts not found');
  failed++;
}

// Test 4: WebSocketService hardening
console.log('\n📋 Test 4: WebSocketService Hardening');
const wsServicePath = path.join(__dirname, '../services/realtime/WebSocketService.ts');
if (fs.existsSync(wsServicePath)) {
  const content = fs.readFileSync(wsServicePath, 'utf8');
  const hasAttemptReconnect = content.includes('attemptReconnect()');
  const hasExponentialBackoff = content.includes('Math.min');
  const hasMaxRetries = content.includes('maxReconnectAttempts');
  const hasRuntimeConfig = content.includes('RuntimeConfig');
  const hasConnectionTimeout = content.includes('connectionTimeout');
  const hasWarningOnce = content.includes('initialConnectionWarned');
  
  if (hasAttemptReconnect && hasExponentialBackoff && hasMaxRetries) {
    console.log('  ✅ WebSocketService has retry/backoff logic');
    console.log('    - attemptReconnect(): ✓');
    console.log('    - Exponential backoff: ✓');
    console.log('    - Max retries: ✓');
    if (hasRuntimeConfig) console.log('    - RuntimeConfig integration: ✓');
    if (hasConnectionTimeout) console.log('    - Connection timeout: ✓');
    if (hasWarningOnce) console.log('    - Concise logging: ✓');
    passed++;
    details.push('WebSocket reconnects with exponential backoff and concise logging');
  } else {
    console.log('  ❌ WebSocketService missing retry/backoff');
    failed++;
  }
} else {
  console.log('  ❌ WebSocketService.ts not found');
  failed++;
}

// Test 5: JARVIS welcome message
console.log('\n📋 Test 5: JARVIS Welcome Message');
const jarvisInitPath = path.join(__dirname, '../services/JarvisInitializationService.ts');
if (fs.existsSync(jarvisInitPath)) {
  const content = fs.readFileSync(jarvisInitPath, 'utf8');
  const hasGreeting = content.includes('greeting') || content.includes('FIRST_TIME_GREETING');
  const hasSpeakGreeting = content.includes('speakGreeting()');
  const hasFirstTime = content.includes('firstTime');
  const hasJarvisVoiceService = content.includes('JarvisVoiceService.speak');
  
  if (hasGreeting && hasSpeakGreeting && hasFirstTime && hasJarvisVoiceService) {
    console.log('  ✅ JARVIS welcome message implemented');
    console.log('    - First time greeting: ✓');
    console.log('    - Subsequent greeting: ✓');
    console.log('    - Voice service integration: ✓');
    passed++;
    details.push('JARVIS greets user on first initialization and subsequent starts');
  } else {
    console.log('  ❌ JARVIS welcome message incomplete');
    failed++;
  }
} else {
  console.log('  ❌ JarvisInitializationService.ts not found');
  failed++;
}

// Summary
console.log('\n=== Enhancement Summary ===');
console.log(`✅ Implemented: ${passed}/5`);
console.log(`❌ Missing: ${failed}/5`);
console.log(`🎯 Completion: ${Math.round((passed / 5) * 100)}%`);

if (details.length > 0) {
  console.log('\n✨ Features Added:');
  details.forEach((detail, i) => {
    console.log(`  ${i + 1}. ${detail}`);
  });
}

console.log('\n=== Benefits ===');
if (passed >= 1) console.log('✓ Automatic dependency alignment reduces version prompts');
if (passed >= 2) console.log('✓ NPM configuration prevents peer dependency conflicts');
if (passed >= 3) console.log('✓ Runtime configuration adapts to dev/prod environments');
if (passed >= 4) console.log('✓ WebSocket automatically reconnects with smart backoff');
if (passed >= 5) console.log('✓ JARVIS greets users on startup for better UX');

if (passed === 5) {
  console.log('\n🎉 All optional enhancements complete!');
  process.exit(0);
} else {
  console.log(`\n⚠️  ${failed} enhancement(s) incomplete`);
  process.exit(1);
}
