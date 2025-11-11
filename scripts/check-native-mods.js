#!/usr/bin/env node

/**
 * JARVIS Native Module Sanity Check
 * Verifies that React Native TurboModules are properly linked
 */

console.log('\n🔍 Checking React Native TurboModule linking...\n');

let hasError = false;

try {
  // Attempt to import PlatformConstants
  const PlatformConstants = require('react-native/Libraries/Core/PlatformConstants');
  
  if (!PlatformConstants) {
    console.error('❌ PlatformConstants module exists but is undefined');
    hasError = true;
  } else {
    console.log('✅ PlatformConstants module loaded successfully');
    
    // Try to get the platform constants
    const constants = PlatformConstants.getConstants 
      ? PlatformConstants.getConstants()
      : PlatformConstants.default?.getConstants?.();
    
    if (constants) {
      console.log('✅ Platform constants retrieved successfully');
      console.log(`   Platform: ${constants.Platform || 'unknown'}`);
      console.log(`   Version: ${constants.Version || 'unknown'}`);
    } else {
      console.log('⚠️  Could not retrieve platform constants (may be normal in Node environment)');
    }
  }
} catch (error) {
  console.error('❌ Failed to import PlatformConstants:');
  console.error(`   ${error.message}`);
  hasError = true;
}

console.log('');

// Check if react-native is installed correctly
try {
  const reactNative = require('react-native/package.json');
  console.log('✅ React Native package found');
  console.log(`   Version: ${reactNative.version}`);
} catch (error) {
  console.error('❌ React Native package not found');
  console.error(`   ${error.message}`);
  hasError = true;
}

console.log('');

if (hasError) {
  console.error('⚠️  React Native TurboModules not properly linked');
  console.error('');
  console.error('💡 To fix this issue, run:');
  console.error('   1. npx expo install --fix');
  console.error('   2. npx expo prebuild --clean');
  console.error('   3. npm run start -- --clear');
  console.error('');
  console.error('Or use the automated reset script:');
  console.error('   ./scripts/reset-cache.sh');
  console.error('');
  process.exit(1);
} else {
  console.log('✅ All React Native TurboModule checks passed!');
  console.log('');
  process.exit(0);
}
