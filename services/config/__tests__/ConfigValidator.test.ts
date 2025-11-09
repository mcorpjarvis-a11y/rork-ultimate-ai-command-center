/**
 * ConfigValidator Tests
 * Tests for configuration validation
 */

import ConfigValidator from '../ConfigValidator';

// Mock the API config
jest.mock('@/config/api.config', () => ({
  API_CONFIG: {
    baseURL: 'https://api.jarvis-command.com',
    timeout: 30000,
  },
  WEBSOCKET_CONFIG: {
    url: 'wss://ws.jarvis-command.com',
    reconnectInterval: 5000,
  },
  AI_CONFIG: {
    openai: { baseURL: 'https://api.openai.com/v1' },
  },
}));

describe('ConfigValidator', () => {
  beforeEach(() => {
    // Clear environment variables
    delete process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    delete process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
    delete process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    delete process.env.EXPO_PUBLIC_GROQ_API_KEY;
    delete process.env.EXPO_PUBLIC_HF_API_TOKEN;
  });

  describe('validateConfig', () => {
    it('should validate successfully with proper configuration', () => {
      const result = ConfigValidator.validateConfig();
      
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should return warnings when no AI services are configured', () => {
      const result = ConfigValidator.validateConfig();
      
      // Should have warning about AI services
      expect(result.warnings.some(w => w.includes('AI service'))).toBe(true);
    });

    it('should validate successfully when at least one AI service is configured', () => {
      process.env.EXPO_PUBLIC_GROQ_API_KEY = 'test-key';
      
      const result = ConfigValidator.validateConfig();
      
      // Should not have AI service warning
      expect(result.warnings.some(w => w.includes('AI service'))).toBe(false);
    });
  });

  describe('canRunApp', () => {
    it('should return true when configuration is valid', () => {
      const result = ConfigValidator.validateConfig();
      
      expect(ConfigValidator.canRunApp(result)).toBe(true);
    });

    it('should return true even with warnings', () => {
      const result = ConfigValidator.validateConfig();
      result.warnings.push('Test warning');
      
      expect(ConfigValidator.canRunApp(result)).toBe(true);
    });

    it('should return false with critical errors', () => {
      const result = {
        isValid: false,
        errors: ['Critical error'],
        warnings: [],
      };
      
      expect(ConfigValidator.canRunApp(result)).toBe(false);
    });
  });

  describe('getErrorMessage', () => {
    it('should return empty string for valid configuration', () => {
      const result = {
        isValid: true,
        errors: [],
        warnings: [],
      };
      
      expect(ConfigValidator.getErrorMessage(result)).toBe('');
    });

    it('should format errors properly', () => {
      const result = {
        isValid: false,
        errors: ['Error 1', 'Error 2'],
        warnings: [],
      };
      
      const message = ConfigValidator.getErrorMessage(result);
      
      expect(message).toContain('Configuration Errors:');
      expect(message).toContain('Error 1');
      expect(message).toContain('Error 2');
    });

    it('should format warnings properly', () => {
      const result = {
        isValid: true,
        errors: [],
        warnings: ['Warning 1', 'Warning 2'],
      };
      
      const message = ConfigValidator.getErrorMessage(result);
      
      expect(message).toContain('Warnings:');
      expect(message).toContain('Warning 1');
      expect(message).toContain('Warning 2');
    });
  });

  describe('getNetworkConfigStatus', () => {
    it('should return network configuration status', async () => {
      const status = await ConfigValidator.getNetworkConfigStatus();
      
      expect(status.apiUrl).toBe('https://api.jarvis-command.com');
      expect(status.apiUrlValid).toBe(true);
      expect(status.wsUrl).toBe('wss://ws.jarvis-command.com');
      expect(status.wsUrlValid).toBe(true);
      // canConnectToBackend will be false in test environment
      expect(typeof status.canConnectToBackend).toBe('boolean');
    });
  });
});
