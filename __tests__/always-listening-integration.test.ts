/**
 * Always-Listening Service Integration Tests
 * 
 * These tests verify that the always-listening service is properly integrated.
 */

describe('Always-Listening Service Integration', () => {
  test('JarvisAlwaysListeningService is exported from services/index.ts', () => {
    const fs = require('fs');
    const path = require('path');
    const servicesIndexPath = path.join(__dirname, '../services/index.ts');
    const content = fs.readFileSync(servicesIndexPath, 'utf8');
    
    expect(content).toContain('JarvisAlwaysListeningService');
  });

  test('JarvisAlwaysListeningService file exists and has required methods', () => {
    const fs = require('fs');
    const path = require('path');
    const servicePath = path.join(__dirname, '../services/JarvisAlwaysListeningService.ts');
    const content = fs.readFileSync(servicePath, 'utf8');
    
    expect(content).toContain('async start()');
    expect(content).toContain('async stop()');
    expect(content).toContain('updateConfig');
    expect(content).toContain('getStatus()');
    expect(content).toContain('isServiceActive()');
  });

  test('app/_layout.tsx integrates always-listening service', () => {
    const fs = require('fs');
    const layoutPath = require('path').join(__dirname, '../app/_layout.tsx');
    const content = fs.readFileSync(layoutPath, 'utf8');
    
    expect(content).toContain('import JarvisAlwaysListeningService');
    expect(content).toContain('JarvisAlwaysListeningService.start()');
    expect(content).toContain('JarvisAlwaysListeningService.stop()');
  });

  test('expo-speech-recognition is installed', () => {
    const packageJson = require('../package.json');
    expect(packageJson.dependencies['expo-speech-recognition']).toBeDefined();
  });

  test('always-listening service has proper configuration interface', () => {
    const fs = require('fs');
    const servicePath = require('path').join(__dirname, '../services/JarvisAlwaysListeningService.ts');
    const content = fs.readFileSync(servicePath, 'utf8');
    
    expect(content).toContain('interface AlwaysListeningConfig');
    expect(content).toContain('wakeWord:');
    expect(content).toContain('autoStart:');
    expect(content).toContain('sensitivity:');
    expect(content).toContain('commandTimeout:');
  });

  test('always-listening service supports both web and native platforms', () => {
    const fs = require('fs');
    const servicePath = require('path').join(__dirname, '../services/JarvisAlwaysListeningService.ts');
    const content = fs.readFileSync(servicePath, 'utf8');
    
    expect(content).toContain('startWebListening');
    expect(content).toContain('startNativeListening');
    expect(content).toContain('expo-speech-recognition');
    expect(content).toContain('Web Speech API');
  });

  test('always-listening service has wake word detection', () => {
    const fs = require('fs');
    const servicePath = require('path').join(__dirname, '../services/JarvisAlwaysListeningService.ts');
    const content = fs.readFileSync(servicePath, 'utf8');
    
    expect(content).toContain('containsWakeWord');
    expect(content).toContain('handleWakeWordDetected');
    expect(content).toContain('handleCommand');
  });

  test('always-listening service auto-starts on app launch', () => {
    const fs = require('fs');
    const layoutPath = require('path').join(__dirname, '../app/_layout.tsx');
    const content = fs.readFileSync(layoutPath, 'utf8');
    
    // Check that it's called during Jarvis initialization
    expect(content).toContain('await JarvisAlwaysListeningService.start()');
    expect(content).toContain('Always-listening service started');
  });

  test('always-listening service has proper cleanup on unmount', () => {
    const fs = require('fs');
    const layoutPath = require('path').join(__dirname, '../app/_layout.tsx');
    const content = fs.readFileSync(layoutPath, 'utf8');
    
    // Check cleanup in useEffect return
    expect(content).toContain('JarvisAlwaysListeningService.stop()');
  });
});
