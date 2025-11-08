/**
 * Provider Registry Tests
 * Tests that all provider helpers export required functions
 */

describe('Provider Registry', () => {
  const providers = ['google', 'github', 'discord', 'reddit', 'spotify', 'homeassistant'];
  const requiredFunctions = ['startAuth', 'refreshToken', 'revokeToken'];

  providers.forEach(providerName => {
    describe(`${providerName} provider`, () => {
      let provider: any;

      beforeAll(() => {
        // Mock expo modules before importing
        jest.mock('expo-auth-session', () => ({
          makeRedirectUri: jest.fn(() => 'myapp://redirect'),
          AuthRequest: jest.fn().mockImplementation(() => ({
            promptAsync: jest.fn().mockResolvedValue({
              type: 'success',
              authentication: { accessToken: 'test-token' }
            })
          })),
        }));

        jest.mock('expo-web-browser', () => ({
          maybeCompleteAuthSession: jest.fn(),
        }));

        try {
          provider = require(`../providerHelpers/${providerName}`);
        } catch (error) {
          console.error(`Failed to load provider ${providerName}:`, error);
        }
      });

      test('should be importable', () => {
        expect(provider).toBeDefined();
      });

      requiredFunctions.forEach(funcName => {
        test(`should export ${funcName} function`, () => {
          expect(provider[funcName]).toBeDefined();
          expect(typeof provider[funcName]).toBe('function');
        });
      });

      test('should have startAuth that is a function', () => {
        expect(typeof provider.startAuth).toBe('function');
      });

      test('should have refreshToken that is a function', () => {
        expect(typeof provider.refreshToken).toBe('function');
      });

      test('should have revokeToken that is a function', () => {
        expect(typeof provider.revokeToken).toBe('function');
      });
    });
  });

  describe('Provider normalization', () => {
    test('should normalize provider names to lowercase', () => {
      const normalized = 'Google'.toLowerCase().replace(/\s+/g, '');
      expect(normalized).toBe('google');
    });

    test('should remove spaces from provider names', () => {
      const normalized = 'Home Assistant'.toLowerCase().replace(/\s+/g, '');
      expect(normalized).toBe('homeassistant');
    });

    test('should handle all-caps provider names', () => {
      const normalized = 'GITHUB'.toLowerCase().replace(/\s+/g, '');
      expect(normalized).toBe('github');
    });

    test('should handle mixed-case provider names', () => {
      const normalized = 'SpOtIfY'.toLowerCase().replace(/\s+/g, '');
      expect(normalized).toBe('spotify');
    });
  });

  describe('Static imports validation', () => {
    test('all providers should be statically imported in AuthManager', () => {
      const fs = require('fs');
      const path = require('path');
      const authManagerPath = path.join(__dirname, '..', 'AuthManager.ts');
      const content = fs.readFileSync(authManagerPath, 'utf8');

      providers.forEach(provider => {
        const importPattern = new RegExp(`import \\* as ${provider}Provider from '\\.\/providerHelpers\/${provider}'`);
        expect(content).toMatch(importPattern);
      });
    });

    test('all providers should be in PROVIDER_REGISTRY', () => {
      const fs = require('fs');
      const path = require('path');
      const authManagerPath = path.join(__dirname, '..', 'AuthManager.ts');
      const content = fs.readFileSync(authManagerPath, 'utf8');

      providers.forEach(provider => {
        const registryPattern = new RegExp(`${provider}:\\s*${provider}Provider`);
        expect(content).toMatch(registryPattern);
      });
    });

    test('AuthManager should not use dynamic imports', () => {
      const fs = require('fs');
      const path = require('path');
      const authManagerPath = path.join(__dirname, '..', 'AuthManager.ts');
      const content = fs.readFileSync(authManagerPath, 'utf8');

      // Check for dynamic import pattern
      const dynamicImportPattern = /import\s*\([`'"]/;
      expect(content).not.toMatch(dynamicImportPattern);
    });
  });
});
