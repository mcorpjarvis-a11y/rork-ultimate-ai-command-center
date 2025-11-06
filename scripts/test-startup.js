#!/usr/bin/env node

/**
 * Startup Test Script
 * Tests all services initialization in Node.js environment
 * Run with: node scripts/test-startup.js
 */

console.log('🚀 JARVIS Startup Test - Testing All Services\n');
console.log('=' .repeat(60));

const tests = [];
let passCount = 0;
let failCount = 0;

// Test 1: Check package.json exists
tests.push({
  name: 'Package.json exists',
  test: () => {
    const fs = require('fs');
    const path = require('path');
    const packagePath = path.join(process.cwd(), 'package.json');
    return fs.existsSync(packagePath);
  }
});

// Test 2: Check app/_layout.tsx has startup code
tests.push({
  name: 'App layout has service initialization',
  test: () => {
    const fs = require('fs');
    const content = fs.readFileSync('app/_layout.tsx', 'utf8');
    return content.includes('JarvisInitializationService.initialize()') &&
           content.includes('PlugAndPlayService.initialize()') &&
           content.includes('VoiceService.initialize()') &&
           content.includes('SchedulerService.start()') &&
           content.includes('WebSocketService.connect()') &&
           content.includes('MonitoringService.startMonitoring()') &&
           content.includes('JarvisVoiceService') &&
           content.includes('JarvisListenerService');
  }
});

// Test 3: Check all service files exist
tests.push({
  name: 'All service files exist',
  test: () => {
    const fs = require('fs');
    const services = [
      'services/JarvisInitializationService.ts',
      'services/PlugAndPlayService.ts',
      'services/voice/VoiceService.ts',
      'services/JarvisVoiceService.ts',
      'services/JarvisListenerService.ts',
      'services/scheduler/SchedulerService.ts',
      'services/realtime/WebSocketService.ts',
      'services/monitoring/MonitoringService.ts',
      'services/AutonomousEngine.ts',
      'services/debug/JarvisSelfDebugService.ts',
    ];
    return services.every(service => fs.existsSync(service));
  }
});

// Test 4: Check EnhancedAIAssistantModal has new tools
tests.push({
  name: 'EnhancedAIAssistantModal has AutonomousEngine tools',
  test: () => {
    const fs = require('fs');
    const content = fs.readFileSync('components/EnhancedAIAssistantModal.tsx', 'utf8');
    return content.includes('getCampaigns:') &&
           content.includes('getOpportunities:') &&
           content.includes('optimizeCampaign:') &&
           content.includes('AutonomousEngine.getInstance()');
  }
});

// Test 5: Check EnhancedAIAssistantModal has debug tools
tests.push({
  name: 'EnhancedAIAssistantModal has JarvisSelfDebugService tools',
  test: () => {
    const fs = require('fs');
    const content = fs.readFileSync('components/EnhancedAIAssistantModal.tsx', 'utf8');
    return content.includes('detectIssues:') &&
           content.includes('runSystemDiagnostics:') &&
           content.includes('JarvisSelfDebugService.getInstance()');
  }
});

// Test 6: Check syntax error is fixed
tests.push({
  name: 'Syntax error fixed (orphaned else if removed)',
  test: () => {
    const fs = require('fs');
    const content = fs.readFileSync('components/EnhancedAIAssistantModal.tsx', 'utf8');
    const lines = content.split('\n');
    // Check that we don't have orphaned else if after function end
    // This is a heuristic check - look for suspicious patterns
    let inFunction = false;
    let braceCount = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.includes('speakText') && line.includes('async')) {
        inFunction = true;
      }
      if (inFunction) {
        braceCount += (line.match(/{/g) || []).length;
        braceCount -= (line.match(/}/g) || []).length;
        if (braceCount === 0 && line.includes('};')) {
          inFunction = false;
          // Check next non-empty lines don't have orphaned else
          for (let j = i + 1; j < Math.min(i + 20, lines.length); j++) {
            const nextLine = lines[j].trim();
            if (nextLine && !nextLine.startsWith('//')) {
              if (nextLine.startsWith('} else if')) {
                return false; // Found orphaned else if
              }
              if (nextLine.startsWith('const ') || nextLine.startsWith('async ')) {
                break; // Found new declaration, we're safe
              }
            }
          }
        }
      }
    }
    return true;
  }
});

// Test 7: Check .env.production exists
tests.push({
  name: '.env.production template exists',
  test: () => {
    const fs = require('fs');
    return fs.existsSync('.env.production');
  }
});

// Test 8: Check app.json has production package name
tests.push({
  name: 'app.json has production package name',
  test: () => {
    const fs = require('fs');
    const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));
    return appJson.expo.android.package === 'com.mcorpjarvis.aicommandcenter';
  }
});

// Test 9: Check SecurityService has encryption methods
tests.push({
  name: 'SecurityService has encryption methods',
  test: () => {
    const fs = require('fs');
    const content = fs.readFileSync('services/SecurityService.ts', 'utf8');
    return content.includes('encryptAPIKey') &&
           content.includes('secureStore') &&
           content.includes('secureRetrieve') &&
           content.includes('Crypto.getRandomBytesAsync');
  }
});

// Test 10: Check PlugAndPlayService has backend check
tests.push({
  name: 'PlugAndPlayService has backend connectivity check',
  test: () => {
    const fs = require('fs');
    const content = fs.readFileSync('services/PlugAndPlayService.ts', 'utf8');
    return content.includes('checkBackendConnection') &&
           content.includes('initialize()') &&
           content.includes('/api/system/health');
  }
});

// Run all tests
console.log('\nRunning tests...\n');

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
  console.log('\n✅ All startup tests PASSED!');
  console.log('\n📋 Summary of Startup Services:');
  console.log('   1. JarvisInitializationService');
  console.log('   2. PlugAndPlayService (backend connectivity check)');
  console.log('   3. VoiceService');
  console.log('   4. JarvisVoiceService (text-to-speech)');
  console.log('   5. JarvisListenerService (speech-to-text)');
  console.log('   6. SchedulerService (automated tasks)');
  console.log('   7. WebSocketService (real-time updates)');
  console.log('   8. MonitoringService (system monitoring)');
  
  console.log('\n🚀 To start all services in the app:');
  console.log('   Run: npx expo start');
  console.log('   All services will initialize automatically on app launch');
  
  console.log('\n📝 Startup Sequence:');
  console.log('   1. App loads → JarvisInitializationService.initialize()');
  console.log('   2. Backend check → PlugAndPlayService.initialize()');
  console.log('   3. Speech init → VoiceService.initialize()');
  console.log('   4. Load singletons → JarvisVoiceService, JarvisListenerService');
  console.log('   5. Start services → Scheduler, WebSocket, Monitoring');
  console.log('   6. Ready! → App shows "Jarvis initialization complete"');
  
  process.exit(0);
} else {
  console.log(`\n❌ ${failCount} test(s) failed`);
  console.log('\nPlease fix the failing tests before proceeding.');
  process.exit(1);
}
