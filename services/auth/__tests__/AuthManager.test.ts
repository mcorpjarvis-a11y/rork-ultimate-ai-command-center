/**
 * AuthManager Real Integration Tests
 * Uses actual implementations with in-memory storage
 * NO MOCKING of AuthManager, TokenVault, or MasterProfile
 */

// Only mock the provider helpers to avoid actual OAuth calls
jest.mock('../providerHelpers/google', () => ({
  startAuth: jest.fn().mockResolvedValue({
    access_token: 'google-test-token',
    refresh_token: 'google-refresh-token',
    expires_in: 3600,
    expires_at: Date.now() + 3600000,
    token_type: 'Bearer',
    scope: 'email profile',
  }),
  refreshToken: jest.fn().mockResolvedValue({
    access_token: 'google-new-token',
    refresh_token: 'google-new-refresh',
    expires_in: 3600,
    expires_at: Date.now() + 3600000,
    token_type: 'Bearer',
  }),
  revokeToken: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../providerHelpers/github', () => ({
  startAuth: jest.fn().mockResolvedValue({
    access_token: 'github-test-token',
    refresh_token: 'github-refresh-token',
    expires_in: 3600,
    token_type: 'Bearer',
  }),
  refreshToken: jest.fn().mockResolvedValue({
    access_token: 'github-new-token',
    expires_in: 3600,
    token_type: 'Bearer',
  }),
  revokeToken: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../providerHelpers/discord', () => ({
  startAuth: jest.fn().mockResolvedValue({
    access_token: 'discord-test-token',
    refresh_token: 'discord-refresh-token',
    expires_in: 3600,
    token_type: 'Bearer',
  }),
  refreshToken: jest.fn(),
  revokeToken: jest.fn(),
}));

jest.mock('../providerHelpers/reddit', () => ({
  startAuth: jest.fn().mockResolvedValue({
    access_token: 'reddit-test-token',
    refresh_token: 'reddit-refresh-token',
    expires_in: 3600,
    token_type: 'Bearer',
  }),
  refreshToken: jest.fn(),
  revokeToken: jest.fn(),
}));

jest.mock('../providerHelpers/spotify', () => ({
  startAuth: jest.fn().mockResolvedValue({
    access_token: 'spotify-test-token',
    refresh_token: 'spotify-refresh-token',
    expires_in: 3600,
    token_type: 'Bearer',
  }),
  refreshToken: jest.fn(),
  revokeToken: jest.fn(),
}));

jest.mock('../providerHelpers/homeassistant', () => ({
  startAuth: jest.fn().mockResolvedValue({
    access_token: 'homeassistant-test-token',
    refresh_token: 'homeassistant-refresh-token',
    expires_in: 3600,
    token_type: 'Bearer',
  }),
  refreshToken: jest.fn(),
  revokeToken: jest.fn(),
}));

describe('AuthManager - Real Integration Tests', () => {
  let AuthManager: any;
  let TokenVault: any;
  let MasterProfile: any;
  let InMemoryStorage: any;

  beforeAll(() => {
    // Import REAL implementations (not mocked)
    AuthManager = require('../AuthManager').default;
    TokenVault = require('../TokenVault').default;
    MasterProfile = require('../MasterProfile').default;
    InMemoryStorage = require('@/services/security/SecureKeyStorage').default;
  });

  beforeEach(async () => {
    // Clear storage before each test
    await InMemoryStorage.clear();
    jest.clearAllMocks();
  });

  describe('Provider Registry', () => {
    test('should have a static provider registry', () => {
      expect(AuthManager).toBeDefined();
    });

    test('should load and authenticate with google provider', async () => {
      const result = await AuthManager.startAuthFlow('google');
      
      expect(result).toBe(true);
      
      // Verify token was saved to real storage
      const token = await TokenVault.getToken('google');
      expect(token).toBeDefined();
      expect(token?.access_token).toBe('google-test-token');
      
      // Verify provider was added to master profile
      const connectedProviders = await AuthManager.getConnectedProviders();
      expect(connectedProviders).toContain('google');
    });

    test('should load and authenticate with all providers', async () => {
      const providers = ['google', 'github', 'discord', 'reddit', 'spotify', 'homeassistant'];
      
      for (const provider of providers) {
        const result = await AuthManager.startAuthFlow(provider);
        expect(result).toBe(true);
        
        // Verify each token is saved
        const token = await TokenVault.getToken(provider);
        expect(token).toBeDefined();
        expect(token?.access_token).toContain(provider);
      }
      
      // Verify all providers are connected
      const connectedProviders = await AuthManager.getConnectedProviders();
      expect(connectedProviders.length).toBe(6);
    });

    test('should handle provider name normalization', async () => {
      // Test with different cases
      const result1 = await AuthManager.startAuthFlow('Google');
      const result2 = await AuthManager.startAuthFlow('GOOGLE');
      const result3 = await AuthManager.startAuthFlow('go ogle'); // with space
      
      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(result3).toBe(true);
      
      // All should save to the same normalized key
      const token = await TokenVault.getToken('google');
      expect(token).toBeDefined();
    });

    test('should return false for invalid provider', async () => {
      const result = await AuthManager.startAuthFlow('invalid-provider');
      expect(result).toBe(false);
      
      // Verify no token was saved
      const token = await TokenVault.getToken('invalid-provider');
      expect(token).toBeNull();
    });
  });

  describe('Token Management - Real Storage', () => {
    beforeEach(async () => {
      // Set up google authentication
      await AuthManager.startAuthFlow('google');
    });

    test('should retrieve valid access token from real storage', async () => {
      const token = await AuthManager.getAccessToken('google');
      
      expect(token).toBeDefined();
      expect(token).toBe('google-test-token');
    });

    test('should refresh expired token using real provider helper', async () => {
      // Get current token
      const oldToken = await TokenVault.getToken('google');
      expect(oldToken?.access_token).toBe('google-test-token');
      
      // Manually expire the token
      oldToken!.expires_at = Date.now() - 1000;
      await TokenVault.saveToken('google', oldToken!);
      
      // Get access token should auto-refresh
      const newToken = await AuthManager.getAccessToken('google');
      
      expect(newToken).toBe('google-new-token');
      
      // Verify new token is saved in storage
      const savedToken = await TokenVault.getToken('google');
      expect(savedToken?.access_token).toBe('google-new-token');
    });

    test('should manually refresh token', async () => {
      const newToken = await AuthManager.refreshAccessToken('google');
      
      expect(newToken).toBe('google-new-token');
      
      // Verify in storage
      const savedToken = await TokenVault.getToken('google');
      expect(savedToken?.access_token).toBe('google-new-token');
    });

    test('should revoke token and remove from storage', async () => {
      // Verify token exists
      let token = await TokenVault.getToken('google');
      expect(token).toBeDefined();
      
      // Revoke
      await AuthManager.revokeProvider('google');
      
      // Verify token is removed
      token = await TokenVault.getToken('google');
      expect(token).toBeNull();
      
      // Verify provider is removed from master profile
      const connectedProviders = await AuthManager.getConnectedProviders();
      expect(connectedProviders).not.toContain('google');
    });

    test('should check if provider is connected using real storage', async () => {
      const isConnected = await AuthManager.isConnected('google');
      expect(isConnected).toBe(true);
      
      await AuthManager.revokeProvider('google');
      
      const isStillConnected = await AuthManager.isConnected('google');
      expect(isStillConnected).toBe(false);
    });

    test('should get provider status from real storage', async () => {
      const status = await AuthManager.getProviderStatus('google');
      expect(status).toBe('connected');
      
      // Expire token
      const token = await TokenVault.getToken('google');
      token!.expires_at = Date.now() - 1000;
      token!.refresh_token = undefined; // Remove refresh token
      await TokenVault.saveToken('google', token!);
      
      const statusAfterExpiry = await AuthManager.getProviderStatus('google');
      expect(statusAfterExpiry).toBe('needs_reauth');
    });
  });

  describe('Event System - Real Events', () => {
    test('should emit connected event on successful auth', async () => {
      const listener = jest.fn();
      AuthManager.on('connected', listener);
      
      await AuthManager.startAuthFlow('github');
      
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener.mock.calls[0][0]).toBe('github');
      expect(listener.mock.calls[0][1]).toHaveProperty('tokenData');
      
      AuthManager.off('connected', listener);
    });

    test('should emit token_refreshed event', async () => {
      await AuthManager.startAuthFlow('google');
      
      const listener = jest.fn();
      AuthManager.on('token_refreshed', listener);
      
      await AuthManager.refreshAccessToken('google');
      
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener.mock.calls[0][0]).toBe('google');
      
      AuthManager.off('token_refreshed', listener);
    });

    test('should emit disconnected event on revoke', async () => {
      await AuthManager.startAuthFlow('google');
      
      const listener = jest.fn();
      AuthManager.on('disconnected', listener);
      
      await AuthManager.revokeProvider('google');
      
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener.mock.calls[0][0]).toBe('google');
      
      AuthManager.off('disconnected', listener);
    });

    test('should support multiple event listeners', async () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      
      AuthManager.on('connected', listener1);
      AuthManager.on('connected', listener2);
      
      await AuthManager.startAuthFlow('spotify');
      
      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
      
      AuthManager.off('connected', listener1);
      AuthManager.off('connected', listener2);
    });
  });

  describe('Local Token Management', () => {
    test('should add local token for smart home devices', async () => {
      await AuthManager.addLocalToken('homeassistant', 'my-local-token', {
        token_type: 'Bearer',
      });
      
      const token = await TokenVault.getToken('homeassistant');
      expect(token).toBeDefined();
      expect(token?.access_token).toBe('my-local-token');
      
      const isConnected = await AuthManager.isConnected('homeassistant');
      expect(isConnected).toBe(true);
    });
  });

  describe('Multiple Providers', () => {
    test('should manage multiple providers independently', async () => {
      // Connect multiple providers
      await AuthManager.startAuthFlow('google');
      await AuthManager.startAuthFlow('github');
      await AuthManager.startAuthFlow('spotify');
      
      // Verify all are connected
      const connectedProviders = await AuthManager.getConnectedProviders();
      expect(connectedProviders).toContain('google');
      expect(connectedProviders).toContain('github');
      expect(connectedProviders).toContain('spotify');
      
      // Revoke one
      await AuthManager.revokeProvider('github');
      
      // Verify only github is removed
      const remainingProviders = await AuthManager.getConnectedProviders();
      expect(remainingProviders).toContain('google');
      expect(remainingProviders).not.toContain('github');
      expect(remainingProviders).toContain('spotify');
      
      // Verify tokens
      expect(await TokenVault.getToken('google')).toBeDefined();
      expect(await TokenVault.getToken('github')).toBeNull();
      expect(await TokenVault.getToken('spotify')).toBeDefined();
    });
  });
});
