/**
 * Integration tests for backend startup and WebSocket
 */

import { validateEnvironment } from '../config/environment';

describe('Backend Startup', () => {
  describe('Environment Validation', () => {
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
      // Save original environment
      originalEnv = { ...process.env };
    });

    afterEach(() => {
      // Restore original environment
      process.env = originalEnv;
    });

    it('should start without API keys', () => {
      // Clear all API keys
      delete process.env.EXPO_PUBLIC_GROQ_API_KEY;
      delete process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      delete process.env.EXPO_PUBLIC_HF_API_TOKEN;
      delete process.env.EXPO_PUBLIC_OPENAI_API_KEY;
      delete process.env.GEMINI_API_KEY;
      delete process.env.OPENAI_API_KEY;
      delete process.env.HUGGINGFACE_API_KEY;

      // Should not throw - just return config with warnings
      expect(() => validateEnvironment()).not.toThrow();

      const config = validateEnvironment();
      expect(config).toBeDefined();
      expect(config.PORT).toBeDefined();
      expect(config.HOST).toBeDefined();
    });

    it('should use default PORT if not set', () => {
      delete process.env.PORT;

      const config = validateEnvironment();
      expect(config.PORT).toBe(3000);
    });

    it('should use default HOST if not set', () => {
      delete process.env.HOST;

      const config = validateEnvironment();
      expect(config.HOST).toBe('0.0.0.0');
    });

    it('should accept custom PORT', () => {
      process.env.PORT = '5000';

      const config = validateEnvironment();
      expect(config.PORT).toBe(5000);
    });

    it('should accept custom HOST', () => {
      process.env.HOST = 'localhost';

      const config = validateEnvironment();
      expect(config.HOST).toBe('localhost');
    });

    it('should work with API keys present', () => {
      process.env.EXPO_PUBLIC_GROQ_API_KEY = 'test-key';

      const config = validateEnvironment();
      expect(config).toBeDefined();
      expect(config.PORT).toBeDefined();
      expect(config.HOST).toBeDefined();
    });
  });

  describe('Clean Slate Mode', () => {
    it('should not require external dependencies', () => {
      // This test verifies that the backend can start without external services
      // by checking that environment validation doesn't throw
      expect(() => validateEnvironment()).not.toThrow();
    });

    it('should support gradual API key addition', () => {
      // Simulate adding keys after startup
      const originalEnv = { ...process.env };

      // Start without keys
      delete process.env.EXPO_PUBLIC_GROQ_API_KEY;
      let config = validateEnvironment();
      expect(config).toBeDefined();

      // Add key later
      process.env.EXPO_PUBLIC_GROQ_API_KEY = 'test-key';
      config = validateEnvironment();
      expect(config).toBeDefined();

      // Restore
      process.env = originalEnv;
    });
  });
});

describe('WebSocket Manager', () => {
  it('should be importable without errors', () => {
    const wsManager = require('../websocket/WebSocketManager').wsManager;
    expect(wsManager).toBeDefined();
    expect(wsManager.getClientCount).toBeDefined();
  });

  it('should start with zero clients', () => {
    const wsManager = require('../websocket/WebSocketManager').wsManager;
    // Before initialization, should have 0 clients
    expect(wsManager.getClientCount()).toBe(0);
  });
});
