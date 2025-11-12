#!/usr/bin/env node

/**
 * JARVIS Native Module Sanity Check
 * Verifies that React Native TurboModules are properly configured
 * Updated for React Native 0.76+ New Architecture
 * 
 * Note: TurboModules can only be tested in the React Native runtime,
 * not in Node.js. This script validates configuration.
 */

console.log('\n🔍 Checking React Native TurboModule configuration...\n');

let hasError = false;

// Check if react-native is installed correctly
try {
  const reactNative = require('react-native/package.json');
  console.log('✅ React Native package found');
  console.log(`   Version: ${reactNative.version}`);
  
  // Check if it's the right version for New Architecture
  const [major, minor] = reactNative.version.split('.').map(Number);
  if (major === 0 && minor >= 76) {
    console.log('✅ React Native version supports New Architecture (0.76+)');
  } else if (major === 0 && minor >= 68) {
    console.log('⚠️  React Native version partially supports New Architecture');
  } else {
    console.error('❌ React Native version does not support New Architecture');
    hasError = true;
  }
} catch (error) {
  console.error('❌ React Native package not found');
  console.error(`   ${error.message}`);
  hasError = true;
}

console.log('');

// Check Expo configuration
try {
  const appJson = require('../app.json');
  const newArchEnabled = appJson.expo?.newArchEnabled;
  const jsEngine = appJson.expo?.android?.jsEngine;
  
  console.log('📱 Expo Configuration:');
  console.log(`   New Architecture: ${newArchEnabled ? '✅ Enabled' : '❌ Disabled'}`);
  console.log(`   JS Engine (Android): ${jsEngine || '⚠️  Not specified (should be "hermes")'}`);
  
  if (!newArchEnabled) {
    console.error('❌ New Architecture is not enabled in app.json');
    console.error('   TurboModules require New Architecture to be enabled');
    hasError = true;
  }
  
  if (!jsEngine || jsEngine !== 'hermes') {
    console.error('❌ Hermes JS engine not explicitly configured');
    console.error('   TurboModules work best with Hermes engine');
    hasError = true;
  }
} catch (error) {
  console.error('❌ Could not read app.json configuration');
  console.error(`   ${error.message}`);
  hasError = true;
}

console.log('');

// Check if Expo SDK is installed
try {
  const expoPackage = require('expo/package.json');
  console.log('✅ Expo SDK found');
  console.log(`   Version: ${expoPackage.version}`);
  
  // Check if Expo SDK is compatible with React Native 0.76
  const version = parseInt(expoPackage.version.split('.')[0]);
  if (version >= 54) {
    console.log('✅ Expo SDK version supports React Native 0.76');
  } else {
    console.warn('⚠️  Expo SDK version may not fully support React Native 0.76');
  }
} catch (error) {
  console.error('❌ Expo SDK not found');
  console.error(`   ${error.message}`);
  hasError = true;
}

console.log('');

if (hasError) {
  console.error('❌ Configuration issues detected');
  console.error('');
  console.error('💡 To fix TurboModule issues:');
  console.error('');
  console.error('1. Update app.json to enable New Architecture:');
  console.error('   {');
  console.error('     "expo": {');
  console.error('       "newArchEnabled": true,');
  console.error('       "android": {');
  console.error('         "jsEngine": "hermes"');
  console.error('       }');
  console.error('     }');
  console.error('   }');
  console.error('');
  console.error('2. Rebuild the native project:');
  console.error('   npx expo prebuild --clean');
  console.error('');
  console.error('3. Clear Metro cache and restart:');
  console.error('   npx expo start --clear');
  console.error('');
  console.error('Or use the automated reset script:');
  console.error('   npm run reset:cache');
  console.error('');
  process.exit(1);
} else {
  console.log('✅ All React Native TurboModule configuration checks passed!');
  console.log('');
  console.log('ℹ️  Configuration is correct. TurboModules should work properly.');
  console.log('');
  console.log('📝 Next steps:');
  console.log('   • If you encounter runtime errors, try clearing the Metro cache:');
  console.log('     npx expo start --clear');
  console.log('');
  console.log('   • If the error persists, rebuild the native project:');
  console.log('     npx expo prebuild --clean');
  console.log('');
  console.log('   • For Expo Go, ensure you have the latest version installed');
  console.log('     (TurboModules in New Architecture require Expo SDK 54+)');
  console.log('');
  process.exit(0);
}
