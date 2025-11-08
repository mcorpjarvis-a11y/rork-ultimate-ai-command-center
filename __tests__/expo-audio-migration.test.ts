/**
 * Expo Audio Migration Tests
 * 
 * These tests verify that expo-audio is properly installed and replaces expo-av.
 */

describe('Expo Audio Migration', () => {
  test('package.json contains expo-audio dependency', () => {
    const packageJson = require('../package.json');
    expect(packageJson.dependencies['expo-audio']).toBeDefined();
    expect(packageJson.dependencies['expo-audio']).toContain('1.0');
  });

  test('package.json does not contain expo-av dependency', () => {
    const packageJson = require('../package.json');
    expect(packageJson.dependencies['expo-av']).toBeUndefined();
  });

  test('VoiceService imports from expo-audio', () => {
    const fs = require('fs');
    const voiceServicePath = require('path').join(__dirname, '../services/voice/VoiceService.ts');
    const content = fs.readFileSync(voiceServicePath, 'utf8');
    
    expect(content).toContain("import AudioModule from 'expo-audio/build/AudioModule'");
    expect(content).toContain("import type { AudioRecorder } from 'expo-audio'");
    expect(content).toContain("from 'expo-audio'");
    expect(content).not.toContain("from 'expo-av'");
  });

  test('JarvisVoiceService imports from expo-audio', () => {
    const fs = require('fs');
    const servicePath = require('path').join(__dirname, '../services/JarvisVoiceService.ts');
    const content = fs.readFileSync(servicePath, 'utf8');
    
    expect(content).toContain("import AudioModule from 'expo-audio/build/AudioModule'");
    expect(content).toContain("from 'expo-audio'");
    expect(content).not.toContain("from 'expo-av'");
  });

  test('JarvisListenerService imports from expo-audio', () => {
    const fs = require('fs');
    const servicePath = require('path').join(__dirname, '../services/JarvisListenerService.ts');
    const content = fs.readFileSync(servicePath, 'utf8');
    
    expect(content).toContain("import AudioModule from 'expo-audio/build/AudioModule'");
    expect(content).toContain("from 'expo-audio'");
    expect(content).not.toContain("from 'expo-av'");
  });

  test('AIAssistantModal imports from expo-audio', () => {
    const fs = require('fs');
    const componentPath = require('path').join(__dirname, '../components/AIAssistantModal.tsx');
    const content = fs.readFileSync(componentPath, 'utf8');
    
    expect(content).toContain("import AudioModule from 'expo-audio/build/AudioModule'");
    expect(content).toContain("from 'expo-audio'");
    expect(content).not.toContain("from 'expo-av'");
  });

  test('EnhancedAIAssistantModal imports from expo-audio', () => {
    const fs = require('fs');
    const componentPath = require('path').join(__dirname, '../components/EnhancedAIAssistantModal.tsx');
    const content = fs.readFileSync(componentPath, 'utf8');
    
    expect(content).toContain("import AudioModule from 'expo-audio/build/AudioModule'");
    expect(content).toContain("from 'expo-audio'");
    expect(content).not.toContain("from 'expo-av'");
  });
});
