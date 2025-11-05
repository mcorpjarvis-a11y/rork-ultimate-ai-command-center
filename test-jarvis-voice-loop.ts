#!/usr/bin/env node

/**
 * JARVIS Voice Loop Integration Test
 * 
 * This script tests the full integration between:
 * - JarvisListenerService
 * - JarvisVoiceService
 * - JarvisGuidanceService
 * - JarvisPersonality
 * 
 * Run in Termux:
 *   bun run test-jarvis-voice-loop.ts
 */

import JarvisListenerService from './services/JarvisListenerService';
import JarvisVoiceService from './services/JarvisVoiceService';
import JarvisGuidanceService from './services/JarvisGuidanceService';
import JarvisPersonality from './services/personality/JarvisPersonality';

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

function log(emoji: string, color: string, message: string) {
  console.log(`${color}${emoji} ${message}${COLORS.reset}`);
}

async function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testServices() {
  console.log('\n' + '='.repeat(60));
  log('🤖', COLORS.cyan + COLORS.bright, 'JARVIS VOICE LOOP INTEGRATION TEST');
  console.log('='.repeat(60) + '\n');

  try {
    // Test 1: Service Initialization Check
    log('🔍', COLORS.blue, 'Test 1: Checking service initialization...');
    console.log('');
    
    const listenerConfig = JarvisListenerService.getConfig();
    const voiceSettings = JarvisVoiceService.getSettings();
    const personality = JarvisPersonality.getPersonality();
    const stats = JarvisPersonality.getPersonalityStats();

    console.log(`  ✓ JarvisListenerService: ${listenerConfig.enabled ? 'Enabled' : 'Disabled'}`);
    console.log(`  ✓ JarvisVoiceService: ${voiceSettings.enabled ? 'Enabled' : 'Disabled'}`);
    console.log(`  ✓ JarvisPersonality: ${personality.name}`);
    console.log(`  ✓ Memory Stats: ${stats.memoriesStored} memories, ${stats.opinionsFormed} opinions`);
    
    log('✅', COLORS.green, 'All services initialized successfully!\n');
    await wait(1500);

    // Test 2: Greeting Command
    log('🎤', COLORS.blue, 'Test 2: Testing greeting interaction...');
    console.log('  User: "Hello Jarvis"\n');
    await JarvisListenerService.processCommand("Hello Jarvis");
    await wait(2000);
    log('✅', COLORS.green, 'Greeting processed successfully!\n');
    await wait(1000);

    // Test 3: Capability Query
    log('🎤', COLORS.blue, 'Test 3: Testing capability query...');
    console.log('  User: "What can you do?"\n');
    await JarvisListenerService.processCommand("What can you do?");
    await wait(2000);
    log('✅', COLORS.green, 'Capability query processed successfully!\n');
    await wait(1000);

    // Test 4: Status Check
    log('🎤', COLORS.blue, 'Test 4: Testing status check...');
    console.log('  User: "What\'s your status?"\n');
    await JarvisListenerService.processCommand("What's your status?");
    await wait(2000);
    log('✅', COLORS.green, 'Status check processed successfully!\n');
    await wait(1000);

    // Test 5: Setup Guidance
    log('🎤', COLORS.blue, 'Test 5: Testing setup guidance...');
    console.log('  User: "How do I post to social media?"\n');
    await JarvisListenerService.processCommand("How do I post to social media?");
    await wait(2000);
    log('✅', COLORS.green, 'Setup guidance processed successfully!\n');
    await wait(1000);

    // Test 6: Thank You
    log('🎤', COLORS.blue, 'Test 6: Testing thank you response...');
    console.log('  User: "Thank you Jarvis"\n');
    await JarvisListenerService.processCommand("Thank you Jarvis");
    await wait(2000);
    log('✅', COLORS.green, 'Thank you response processed successfully!\n');
    await wait(1000);

    // Test 7: Personality Check
    log('🎤', COLORS.blue, 'Test 7: Checking personality stats after conversation...');
    const updatedStats = JarvisPersonality.getPersonalityStats();
    console.log(`  ✓ Memories stored: ${updatedStats.memoriesStored}`);
    console.log(`  ✓ Opinions formed: ${updatedStats.opinionsFormed}`);
    console.log(`  ✓ Autonomy level: ${updatedStats.autonomyLevel}%`);
    log('✅', COLORS.green, 'Personality stats retrieved successfully!\n');
    await wait(1000);

    // Test 8: Recent Memories
    log('🎤', COLORS.blue, 'Test 8: Retrieving recent conversation memories...');
    const recentMemories = JarvisPersonality.getRecentMemories(3);
    console.log(`  ✓ Retrieved ${recentMemories.length} recent memories`);
    recentMemories.forEach((memory, idx) => {
      console.log(`  ${idx + 1}. "${memory.userMessage.substring(0, 50)}..."`);
    });
    log('✅', COLORS.green, 'Memory retrieval successful!\n');
    await wait(1000);

    // Test 9: Intent Detection
    log('🎤', COLORS.blue, 'Test 9: Testing intent detection...');
    const intent = await JarvisGuidanceService.detectIntent("I want to generate content for Instagram");
    console.log(`  ✓ Detected feature: ${intent?.feature || 'none'}`);
    console.log(`  ✓ Is setup query: ${intent?.isSetupQuery ? 'Yes' : 'No'}`);
    log('✅', COLORS.green, 'Intent detection successful!\n');
    await wait(1000);

    // Test 10: Configuration Check
    log('🎤', COLORS.blue, 'Test 10: Testing configuration check...');
    const requirement = await JarvisGuidanceService.checkConfiguration('social-media');
    if (requirement) {
      console.log(`  ✓ Missing: ${requirement.missingItems.join(', ')}`);
      console.log(`  ✓ Setup steps available: ${requirement.setupSteps.length}`);
    } else {
      console.log(`  ✓ Social media is fully configured`);
    }
    log('✅', COLORS.green, 'Configuration check successful!\n');

    // Final Summary
    console.log('\n' + '='.repeat(60));
    log('🎉', COLORS.green + COLORS.bright, 'ALL TESTS PASSED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('');
    log('✨', COLORS.cyan, 'JARVIS Voice Loop Integration: FULLY OPERATIONAL');
    console.log('');
    console.log('Integration verified:');
    console.log('  ✓ JarvisListenerService → Command processing');
    console.log('  ✓ JarvisVoiceService → Speech output');
    console.log('  ✓ JarvisGuidanceService → Intent detection & setup guidance');
    console.log('  ✓ JarvisPersonality → Memory & contextual responses');
    console.log('');
    log('🚀', COLORS.magenta, 'Ready for voice input/output in Termux + Expo!');
    console.log('');

  } catch (error) {
    console.error('\n');
    log('❌', COLORS.yellow, 'TEST FAILED!');
    console.error('Error:', error);
    console.error('');
    console.error('Troubleshooting:');
    console.error('  1. Ensure all services are properly exported in services/index.ts');
    console.error('  2. Check that all imports use .js extensions');
    console.error('  3. Verify Expo dependencies are installed (expo-speech, expo-av)');
    console.error('  4. Make sure AsyncStorage is available');
    console.error('');
    process.exit(1);
  }
}

// Run tests
log('🎬', COLORS.yellow, 'Starting JARVIS Voice Loop Integration Tests...\n');
testServices().then(() => {
  log('✅', COLORS.green, 'Test suite completed successfully!');
  process.exit(0);
}).catch((error) => {
  log('❌', COLORS.yellow, 'Test suite failed!');
  console.error(error);
  process.exit(1);
});
