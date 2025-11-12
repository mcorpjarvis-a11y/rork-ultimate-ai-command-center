/**
 * Tests for backend expo-audio shim
 * 
 * Verifies that the Node.js shim provides the expected API
 * and exports AudioModule correctly for backend builds.
 */

// eslint-disable-next-line no-restricted-imports -- This test is specifically for the expo-audio shim
import AudioModule, { AudioModule as AudioModuleNamed, RecordingPresets } from '../expo-audio';

describe('expo-audio shim', () => {
  it('should export AudioModule as default export', () => {
    expect(AudioModule).toBeDefined();
    expect(typeof AudioModule).toBe('object');
  });

  it('should export AudioModule as named export', () => {
    expect(AudioModuleNamed).toBeDefined();
    expect(typeof AudioModuleNamed).toBe('object');
  });

  it('should have default and named exports reference the same object', () => {
    expect(AudioModule).toBe(AudioModuleNamed);
  });

  it('should export RecordingPresets', () => {
    expect(RecordingPresets).toBeDefined();
    expect(RecordingPresets.HIGH_QUALITY).toBeDefined();
    expect(RecordingPresets.LOW_QUALITY).toBeDefined();
  });

  it('should have RecordingPresets with correct structure', () => {
    expect(typeof RecordingPresets.HIGH_QUALITY).toBe('object');
    expect(typeof RecordingPresets.LOW_QUALITY).toBe('object');
  });
});
