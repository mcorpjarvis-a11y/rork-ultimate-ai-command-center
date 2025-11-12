/**
 * Integration Tests
 * Tests full auth flow initialization and Metro bundler compatibility
 */

describe('Integration Tests', () => {
  describe('Metro Bundler Compatibility', () => {
    test('AuthManager should not use dynamic imports', () => {
      const fs = require('fs');
      const path = require('path');
      const authManagerPath = path.join(__dirname, '..', 'AuthManager.ts');
      const content = fs.readFileSync(authManagerPath, 'utf8');

      // Check for Metro-incompatible patterns
      const dynamicImportPattern = /import\s*\([`'"].*\$\{.*\}.*[`'"]\)/;
      expect(content).not.toMatch(dynamicImportPattern);
    });

    test('AuthManager should use static imports for all providers', () => {
      const fs = require('fs');
      const path = require('path');
      const authManagerPath = path.join(__dirname, '..', 'AuthManager.ts');
      const content = fs.readFileSync(authManagerPath, 'utf8');

      // Should have static imports
      expect(content).toContain("import * as googleProvider from './providerHelpers/google'");
      expect(content).toContain("import * as githubProvider from './providerHelpers/github'");
      expect(content).toContain("import * as discordProvider from './providerHelpers/discord'");
      expect(content).toContain("import * as redditProvider from './providerHelpers/reddit'");
      expect(content).toContain("import * as spotifyProvider from './providerHelpers/spotify'");
      expect(content).toContain("import * as homeassistantProvider from './providerHelpers/homeassistant'");
    });

    test('AuthManager should have a static PROVIDER_REGISTRY', () => {
      const fs = require('fs');
      const path = require('path');
      const authManagerPath = path.join(__dirname, '..', 'AuthManager.ts');
      const content = fs.readFileSync(authManagerPath, 'utf8');

      expect(content).toContain('PROVIDER_REGISTRY');
      expect(content).toContain('google: googleProvider');
      expect(content).toContain('github: githubProvider');
      expect(content).toContain('discord: discordProvider');
      expect(content).toContain('reddit: redditProvider');
      expect(content).toContain('spotify: spotifyProvider');
      expect(content).toContain('homeassistant: homeassistantProvider');
    });

    test('getProviderHelper should be synchronous', () => {
      const fs = require('fs');
      const path = require('path');
      const authManagerPath = path.join(__dirname, '..', 'AuthManager.ts');
      const content = fs.readFileSync(authManagerPath, 'utf8');

      // Check that getProviderHelper is not async
      const asyncGetProviderPattern = /async\s+getProviderHelper/;
      expect(content).not.toMatch(asyncGetProviderPattern);

      // Check that it doesn't return Promise
      const promiseReturnPattern = /getProviderHelper.*:\s*Promise/;
      expect(content).not.toMatch(promiseReturnPattern);
    });
  });

  describe('Metro Configuration', () => {
    test('metro.config.cjs should exist', () => {
      const fs = require('fs');
      const path = require('path');
      const metroConfigPath = path.join(__dirname, '..', '..', '..', 'metro.config.cjs');
      expect(fs.existsSync(metroConfigPath)).toBe(true);
    });

    test('metro.config.js should exist', () => {
      const fs = require('fs');
      const path = require('path');
      const metroProxyPath = path.join(__dirname, '..', '..', '..', 'metro.config.js');
      expect(fs.existsSync(metroProxyPath)).toBe(true);
    });

    test('metro.config.cjs should have proper structure', () => {
      const path = require('path');
      const metroConfigPath = path.join(__dirname, '..', '..', '..', 'metro.config.cjs');
      const config = require(metroConfigPath);

      expect(config).toBeDefined();
      expect(config.resolver).toBeDefined();
      expect(config.resolver.extraNodeModules).toBeDefined();
      expect(config.resolver.extraNodeModules['@']).toBeDefined();
    });

    test('metro.config.cjs should configure @/ path alias', () => {
      const path = require('path');
      const metroConfigPath = path.join(__dirname, '..', '..', '..', 'metro.config.cjs');
      const config = require(metroConfigPath);

      const atAlias = config.resolver.extraNodeModules['@'];
      expect(atAlias).toBeDefined();
      expect(typeof atAlias).toBe('string');
    });

    test('metro.config.cjs should support TypeScript extensions', () => {
      const path = require('path');
      const metroConfigPath = path.join(__dirname, '..', '..', '..', 'metro.config.cjs');
      const config = require(metroConfigPath);

      if (config.resolver.sourceExts) {
        expect(config.resolver.sourceExts).toContain('ts');
        expect(config.resolver.sourceExts).toContain('tsx');
      }
    });
  });

  describe('Startup Script', () => {
    test('start-all.js should include dependency update logic', () => {
      const fs = require('fs');
      const path = require('path');
      const startAllPath = path.join(__dirname, '..', '..', '..', 'scripts', 'start-all.js');
      const content = fs.readFileSync(startAllPath, 'utf8');

      expect(content).toContain('npm install');
      expect(content).toContain('npm outdated');
      expect(content).toContain('--skip-update');
    });

    test('start-all.js should check dependencies before starting', () => {
      const fs = require('fs');
      const path = require('path');
      const startAllPath = path.join(__dirname, '..', '..', '..', 'scripts', 'start-all.js');
      const content = fs.readFileSync(startAllPath, 'utf8');

      expect(content).toContain('Checking dependencies');
      expect(content).toContain('execSync');
    });

    test('start-all.js should handle update failures gracefully', () => {
      const fs = require('fs');
      const path = require('path');
      const startAllPath = path.join(__dirname, '..', '..', '..', 'scripts', 'start-all.js');
      const content = fs.readFileSync(startAllPath, 'utf8');

      expect(content).toContain('catch');
      expect(content).toContain('Continuing with current dependencies');
    });
  });

  describe('Full Auth Flow', () => {
    let AuthManager: any;

    beforeAll(() => {
      // Mock all provider helpers
      jest.mock('../providerHelpers/google', () => ({
        startAuth: jest.fn().mockResolvedValue({
          access_token: 'test-token',
          refresh_token: 'test-refresh',
          expires_in: 3600,
          token_type: 'Bearer',
        }),
        refreshToken: jest.fn(),
        revokeToken: jest.fn(),
      }));

      // Mock TokenVault and MasterProfile
      jest.mock('../TokenVault', () => ({
        default: {
          saveToken: jest.fn().mockResolvedValue(undefined),
          getToken: jest.fn().mockResolvedValue(null),
          removeToken: jest.fn().mockResolvedValue(undefined),
          isTokenExpired: jest.fn().mockReturnValue(false),
        }
      }));

      jest.mock('../MasterProfile', () => ({
        default: {
          addConnectedProvider: jest.fn().mockResolvedValue(undefined),
          removeConnectedProvider: jest.fn().mockResolvedValue(undefined),
          getMasterProfile: jest.fn().mockResolvedValue({
            connectedProviders: []
          }),
        }
      }));

      AuthManager = require('../AuthManager').default;
    });

    test('should initialize without errors', () => {
      expect(AuthManager).toBeDefined();
    });

    test('should have all required methods', () => {
      expect(typeof AuthManager.startAuthFlow).toBe('function');
      expect(typeof AuthManager.getAccessToken).toBe('function');
      expect(typeof AuthManager.refreshAccessToken).toBe('function');
      expect(typeof AuthManager.revokeProvider).toBe('function');
      expect(typeof AuthManager.getConnectedProviders).toBe('function');
      expect(typeof AuthManager.isConnected).toBe('function');
      expect(typeof AuthManager.getProviderStatus).toBe('function');
      expect(typeof AuthManager.addLocalToken).toBe('function');
      expect(typeof AuthManager.on).toBe('function');
      expect(typeof AuthManager.off).toBe('function');
    });

    test('should maintain singleton instance', () => {
      const AuthManager1 = require('../AuthManager').default;
      const AuthManager2 = require('../AuthManager').default;
      expect(AuthManager1).toBe(AuthManager2);
    });
  });

  describe('Backwards Compatibility', () => {
    test('API interface should remain unchanged', () => {
      const fs = require('fs');
      const path = require('path');
      const authManagerPath = path.join(__dirname, '..', 'AuthManager.ts');
      const content = fs.readFileSync(authManagerPath, 'utf8');

      // Check that public methods still exist
      expect(content).toContain('startAuthFlow');
      expect(content).toContain('getAccessToken');
      expect(content).toContain('refreshAccessToken');
      expect(content).toContain('revokeProvider');
      expect(content).toContain('getConnectedProviders');
      expect(content).toContain('isConnected');
      expect(content).toContain('getProviderStatus');
      expect(content).toContain('addLocalToken');
    });

    test('method signatures should be compatible', () => {
      const fs = require('fs');
      const path = require('path');
      const authManagerPath = path.join(__dirname, '..', 'AuthManager.ts');
      const content = fs.readFileSync(authManagerPath, 'utf8');

      // Check async methods remain async
      expect(content).toMatch(/async\s+startAuthFlow/);
      expect(content).toMatch(/async\s+getAccessToken/);
      expect(content).toMatch(/async\s+refreshAccessToken/);
      expect(content).toMatch(/async\s+revokeProvider/);
    });
  });
});
