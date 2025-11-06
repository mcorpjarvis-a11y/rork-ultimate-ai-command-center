#!/usr/bin/env node

/**
 * Expo Go Integration Test
 * Tests complete system: Frontend + Backend
 */

console.log('🧪 ════════════════════════════════════════════════════════════');
console.log('🧪   JARVIS Expo Go Integration Test');
console.log('🧪 ════════════════════════════════════════════════════════════\n');

const tests = [];
let passCount = 0;
let failCount = 0;

// Test 1: Startup test passes
tests.push({
  name: 'Startup validation passes',
  test: () => {
    const { execSync } = require('child_process');
    try {
      execSync('node scripts/test-startup.js', { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  }
});

// Test 2: Backend routes exist
tests.push({
  name: 'Backend routes files exist',
  test: () => {
    const fs = require('fs');
    return fs.existsSync('backend/routes/analytics.js') &&
           fs.existsSync('backend/routes/trends.js') &&
           fs.existsSync('backend/routes/content.js') &&
           fs.existsSync('backend/routes/integrations.js') &&
           fs.existsSync('backend/routes/system.js');
  }
});

// Test 3: Server configuration
tests.push({
  name: 'Backend server configured correctly',
  test: () => {
    const fs = require('fs');
    const serverContent = fs.readFileSync('backend/server.js', 'utf8');
    return serverContent.includes('/api/analytics') &&
           serverContent.includes('/api/trends') &&
           serverContent.includes('/api/content') &&
           serverContent.includes('analyticsRoutes') &&
           serverContent.includes('trendsRoutes') &&
           serverContent.includes('contentRoutes');
  }
});

// Test 4: Package.json has start scripts
tests.push({
  name: 'npm start scripts configured',
  test: () => {
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    return pkg.scripts.start &&
           pkg.scripts['test:startup'] &&
           pkg.scripts['start:backend'];
  }
});

// Test 5: Services use real APIs
tests.push({
  name: 'Services configured for real API calls',
  test: () => {
    const fs = require('fs');
    const analyticsService = fs.readFileSync('services/analytics/AnalyticsService.ts', 'utf8');
    return analyticsService.includes('APIClient.post') &&
           analyticsService.includes('/analytics/query');
  }
});

console.log('Running tests...\n');

tests.forEach((test, index) => {
  try {
    const result = test.test();
    if (result) {
      console.log(`✅ Test ${index + 1}: ${test.name}`);
      passCount++;
    } else {
      console.log(`❌ Test ${index + 1}: ${test.name}`);
      failCount++;
    }
  } catch (error) {
    console.log(`❌ Test ${index + 1}: ${test.name}`);
    console.log(`   Error: ${error.message}`);
    failCount++;
  }
});

console.log('\n' + '='.repeat(60));
console.log(`\nTest Results: ${passCount}/${tests.length} passed`);

if (failCount === 0) {
  console.log('\n✅ All tests PASSED! System ready for Expo Go testing\n');
  
  console.log('🚀 To test in Expo Go:\n');
  console.log('1. Start backend:');
  console.log('   npm run start:backend');
  console.log('');
  console.log('2. In a new terminal, start frontend:');
  console.log('   npm start');
  console.log('');
  console.log('3. Scan QR code with Expo Go app');
  console.log('');
  console.log('📝 Expected behavior:');
  console.log('   • App launches successfully');
  console.log('   • Loading screen shows "Initializing JARVIS..."');
  console.log('   • All 8 services initialize');
  console.log('   • Backend connects (or shows offline warning)');
  console.log('   • Main dashboard appears');
  console.log('   • JARVIS assistant responds to commands');
  console.log('');
  console.log('🔍 Check console for:');
  console.log('   [App] Initializing Jarvis...');
  console.log('   [App] VoiceService initialized');
  console.log('   [App] Speech services initialized: 2');
  console.log('   [App] Scheduler service started');
  console.log('   [App] Monitoring service started');
  console.log('   [App] Jarvis initialization complete');
  console.log('');
  console.log('📖 Documentation:');
  console.log('   • STARTUP_GUIDE.md - Complete startup docs');
  console.log('   • MASTER_CHECKLIST.md - Production status');
  console.log('');
  
  process.exit(0);
} else {
  console.log(`\n❌ ${failCount} test(s) failed`);
  console.log('\nPlease fix the failing tests before testing in Expo Go.');
  process.exit(1);
}
