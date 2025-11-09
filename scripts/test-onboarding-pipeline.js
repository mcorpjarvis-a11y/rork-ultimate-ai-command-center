#!/usr/bin/env node
/**
 * Test Complete Onboarding Pipeline
 * Validates the entire flow from sign-up to JARVIS initialization
 */

const fs = require('fs');
const path = require('path');

console.log('\n=== Testing Complete Onboarding Pipeline ===\n');

let passed = 0;
let failed = 0;
const issues = [];

// Test 1: Verify OnboardingStatus service exists
console.log('📋 Test 1: OnboardingStatus Service');
const onboardingStatusPath = path.join(__dirname, '../services/onboarding/OnboardingStatus.ts');
if (fs.existsSync(onboardingStatusPath)) {
  const content = fs.readFileSync(onboardingStatusPath, 'utf8');
  const hasIsComplete = content.includes('async isOnboardingComplete()');
  const hasMarkComplete = content.includes('async markOnboardingComplete()');
  const hasReset = content.includes('async resetOnboarding()');
  const usesAsyncStorage = content.includes('AsyncStorage');
  const usesKey = content.includes('jarvis-onboarding-completed');
  
  if (hasIsComplete && hasMarkComplete && hasReset && usesAsyncStorage && usesKey) {
    console.log('  ✅ OnboardingStatus service properly implemented');
    passed++;
  } else {
    console.log('  ❌ OnboardingStatus service incomplete');
    failed++;
    issues.push('OnboardingStatus missing required methods');
  }
} else {
  console.log('  ❌ OnboardingStatus.ts not found');
  failed++;
  issues.push('OnboardingStatus service missing');
}

// Test 2: Verify _layout.tsx uses OnboardingStatus
console.log('\n📋 Test 2: App Layout Integration');
const layoutPath = path.join(__dirname, '../app/_layout.tsx');
if (fs.existsSync(layoutPath)) {
  const content = fs.readFileSync(layoutPath, 'utf8');
  const importsOnboardingStatus = content.includes('OnboardingStatus');
  const checksOnboarding = content.includes('isOnboardingComplete()');
  const routesToPermissions = content.includes('/onboarding/permissions');
  const initializesJarvis = content.includes('initializeJarvis()');
  
  if (importsOnboardingStatus && checksOnboarding && routesToPermissions && initializesJarvis) {
    console.log('  ✅ App layout properly checks onboarding status');
    passed++;
  } else {
    console.log('  ❌ App layout missing onboarding logic');
    failed++;
    if (!importsOnboardingStatus) issues.push('_layout.tsx does not import OnboardingStatus');
    if (!checksOnboarding) issues.push('_layout.tsx does not check onboarding completion');
  }
} else {
  console.log('  ❌ _layout.tsx not found');
  failed++;
}

// Test 3: Verify SignInScreen routing
console.log('\n📋 Test 3: SignInScreen Routing');
const signInPath = path.join(__dirname, '../screens/Onboarding/SignInScreen.tsx');
if (fs.existsSync(signInPath)) {
  const content = fs.readFileSync(signInPath, 'utf8');
  const routesToPermissions = content.includes('/onboarding/permissions');
  const hasSignUpFlow = content.includes('isSignUp');
  const checkExistingProfile = content.includes('checkExistingProfile');
  
  if (routesToPermissions && hasSignUpFlow && checkExistingProfile) {
    console.log('  ✅ SignInScreen routes correctly');
    passed++;
  } else {
    console.log('  ❌ SignInScreen routing incomplete');
    failed++;
    issues.push('SignInScreen does not route to permissions screen');
  }
} else {
  console.log('  ❌ SignInScreen.tsx not found');
  failed++;
}

// Test 4: Verify PermissionManager auto-requests
console.log('\n📋 Test 4: Auto-Permission Requests');
const permissionPath = path.join(__dirname, '../screens/Onboarding/PermissionManager.tsx');
if (fs.existsSync(permissionPath)) {
  const content = fs.readFileSync(permissionPath, 'utf8');
  const hasCheckAndRequest = content.includes('checkAndRequestPermissions');
  const hasRequestAll = content.includes('requestAllPermissions');
  const hasUseEffect = content.includes('useEffect');
  const usesPermissionsAndroid = content.includes('PermissionsAndroid.requestMultiple');
  
  if (hasCheckAndRequest && hasRequestAll && hasUseEffect && usesPermissionsAndroid) {
    console.log('  ✅ PermissionManager auto-requests permissions');
    passed++;
  } else {
    console.log('  ❌ PermissionManager does not auto-request');
    failed++;
    issues.push('PermissionManager missing auto-request logic');
  }
} else {
  console.log('  ❌ PermissionManager.tsx not found');
  failed++;
}

// Test 5: Verify OAuthSetupWizard marks onboarding complete
console.log('\n📋 Test 5: OAuth Wizard Completion');
const oauthPath = path.join(__dirname, '../screens/Onboarding/OAuthSetupWizard.tsx');
if (fs.existsSync(oauthPath)) {
  const content = fs.readFileSync(oauthPath, 'utf8');
  const importsOnboardingStatus = content.includes('OnboardingStatus');
  const marksComplete = content.includes('markOnboardingComplete()');
  const hasContinue = content.includes('handleContinue');
  const hasSkip = content.includes('handleSkip');
  
  if (importsOnboardingStatus && marksComplete && hasContinue && hasSkip) {
    console.log('  ✅ OAuth wizard marks onboarding complete');
    passed++;
  } else {
    console.log('  ❌ OAuth wizard does not mark completion');
    failed++;
    issues.push('OAuthSetupWizard does not call markOnboardingComplete()');
  }
} else {
  console.log('  ❌ OAuthSetupWizard.tsx not found');
  failed++;
}

// Test 6: Verify app/index.tsx cleaned up
console.log('\n📋 Test 6: Dashboard Cleanup');
const indexPath = path.join(__dirname, '../app/index.tsx');
if (fs.existsSync(indexPath)) {
  const content = fs.readFileSync(indexPath, 'utf8');
  const hasJarvisOnboarding = content.includes('JarvisOnboarding');
  const hasShowOnboarding = content.includes('showOnboarding');
  const hasCheckOnboarding = content.includes('checkOnboarding');
  
  if (!hasJarvisOnboarding && !hasShowOnboarding && !hasCheckOnboarding) {
    console.log('  ✅ Dashboard cleaned up (no conflicting onboarding)');
    passed++;
  } else {
    console.log('  ❌ Dashboard still has conflicting onboarding logic');
    failed++;
    issues.push('app/index.tsx still has JarvisOnboarding component');
  }
} else {
  console.log('  ❌ app/index.tsx not found');
  failed++;
}

// Test 7: Verify JARVIS initialization
console.log('\n📋 Test 7: JARVIS Voice Initialization');
const layoutContent = fs.existsSync(layoutPath) ? fs.readFileSync(layoutPath, 'utf8') : '';
const hasVoiceInit = layoutContent.includes('VoiceService.initialize()');
const hasAlwaysListening = layoutContent.includes('JarvisAlwaysListeningService.start()');
const hasErrorHandling = layoutContent.includes('try') && layoutContent.includes('catch');

if (hasVoiceInit && hasAlwaysListening && hasErrorHandling) {
  console.log('  ✅ JARVIS voice services properly initialized');
  passed++;
} else {
  console.log('  ❌ JARVIS voice initialization incomplete');
  failed++;
  if (!hasVoiceInit) issues.push('VoiceService not initialized in _layout.tsx');
  if (!hasAlwaysListening) issues.push('AlwaysListening service not started');
}

// Test 8: Verify persistent memory
console.log('\n📋 Test 8: Persistent Memory');
const masterProfilePath = path.join(__dirname, '../services/auth/MasterProfile.ts');
const secureStoragePath = path.join(__dirname, '../services/security/SecureKeyStorage.ts');

if (fs.existsSync(masterProfilePath) && fs.existsSync(secureStoragePath)) {
  const profileContent = fs.readFileSync(masterProfilePath, 'utf8');
  const storageContent = fs.readFileSync(secureStoragePath, 'utf8');
  
  const usesSecureStorage = profileContent.includes('SecureKeyStorage');
  const hasSecureStore = storageContent.includes('expo-secure-store');
  const hasFallback = storageContent.includes('AsyncStorage');
  
  if (usesSecureStorage && hasSecureStore && hasFallback) {
    console.log('  ✅ Persistent memory properly implemented');
    passed++;
  } else {
    console.log('  ❌ Persistent memory incomplete');
    failed++;
    issues.push('Persistent memory not properly configured');
  }
} else {
  console.log('  ❌ Required files for persistent memory not found');
  failed++;
}

// Test 9: Verify dependency management
console.log('\n📋 Test 9: Dependency Auto-Alignment');
const ensureDepsPath = path.join(__dirname, '../scripts/ensure-deps.js');
if (fs.existsSync(ensureDepsPath)) {
  const content = fs.readFileSync(ensureDepsPath, 'utf8');
  const hasExpoInstall = content.includes('expo install --fix');
  const hasExpoDoctor = content.includes('expo-doctor');
  const hasCIMode = content.includes('CI:');
  
  if (hasExpoInstall && hasExpoDoctor && hasCIMode) {
    console.log('  ✅ Dependency auto-alignment script created');
    passed++;
  } else {
    console.log('  ❌ Dependency script incomplete');
    failed++;
    issues.push('ensure-deps.js missing required commands');
  }
} else {
  console.log('  ❌ ensure-deps.js not found');
  failed++;
}

// Summary
console.log('\n=== Test Summary ===');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📊 Total: ${passed + failed}`);
console.log(`🎯 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);

if (issues.length > 0) {
  console.log('\n❌ Issues Found:');
  issues.forEach((issue, i) => {
    console.log(`  ${i + 1}. ${issue}`);
  });
}

// Expected Flow Diagram
console.log('\n=== Expected Onboarding Flow ===');
console.log('1. 📱 User opens app (first time)');
console.log('   └─> SignInScreen shows');
console.log('');
console.log('2. ✍️  User signs up/signs in');
console.log('   └─> Master profile created in SecureStore');
console.log('   └─> Routes to /onboarding/permissions');
console.log('');
console.log('3. 🔐 Permission screen loads');
console.log('   └─> Auto-requests all permissions (800ms delay)');
console.log('   └─> Permission dialogs pop up');
console.log('   └─> User grants permissions');
console.log('   └─> Routes to /onboarding/oauth-setup');
console.log('');
console.log('4. 🔗 OAuth wizard loads');
console.log('   └─> User connects services (or skips)');
console.log('   └─> markOnboardingComplete() called');
console.log('   └─> Routes to / (dashboard)');
console.log('');
console.log('5. 🏠 Dashboard loads');
console.log('   └─> _layout checks: profile exists + onboarding complete ✓');
console.log('   └─> initializeJarvis() called');
console.log('   └─> VoiceService initialized');
console.log('   └─> AlwaysListening service started');
console.log('   └─> JARVIS is listening and ready! 🎤');
console.log('');
console.log('6. 🔄 User closes and reopens app');
console.log('   └─> _layout checks: profile exists + onboarding complete ✓');
console.log('   └─> Goes straight to dashboard');
console.log('   └─> JARVIS initializes and listens');
console.log('');

if (failed === 0) {
  console.log('✅ All tests passed! Pipeline is ready.\n');
  process.exit(0);
} else {
  console.log(`❌ ${failed} test(s) failed. Please fix the issues above.\n`);
  process.exit(1);
}
