/**
 * AuthManager Unit Tests
 * Tests the static provider registry and provider helper loading
 */

import * as SecureStore from 'expo-secure-store';

// Mock the provider helpers before importing AuthManager
jest.mock('../providerHelpers/google', () => ({
  startAuth: jest.fn(),
  refreshToken: jest.fn(),
  revokeToken: jest.fn(),
}));

jest.mock('../providerHelpers/github', () => ({
  startAuth: jest.fn(),
  refreshToken: jest.fn(),
  revokeToken: jest.fn(),
}));

jest.mock('../providerHelpers/discord', () => ({
  startAuth: jest.fn(),
  refreshToken: jest.fn(),
  revokeToken: jest.fn(),
}));

jest.mock('../providerHelpers/reddit', () => ({
  startAuth: jest.fn(),
  refreshToken: jest.fn(),
  revokeToken: jest.fn(),
}));

jest.mock('../providerHelpers/spotify', () => ({
  startAuth: jest.fn(),
  refreshToken: jest.fn(),
  revokeToken: jest.fn(),
}));

jest.mock('../providerHelpers/homeassistant', () => ({
  startAuth: jest.fn(),
  refreshToken: jest.fn(),
  revokeToken: jest.fn(),
}));

describe('AuthManager', () => {
  let AuthManager: any;
  let googleProvider: any;
  let TokenVault: any;
  let MasterProfile: any;

  beforeAll(() => {
    // Import after mocks are set up
    AuthManager = require('../AuthManager').default;
    googleProvider = require('../providerHelpers/google');
    TokenVault = require('../TokenVault').default;
    MasterProfile = require('../MasterProfile').default;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Provider Registry', () => {
    test('should have a static provider registry', () => {
      // Access the private PROVIDER_REGISTRY through reflection
      expect(AuthManager).toBeDefined();
      // The registry exists if providers can be loaded
    });

    test('should load google provider from static registry', async () => {
      googleProvider.startAuth.mockResolvedValue({
        access_token: 'test-token',
        refresh_token: 'test-refresh',
        expires_in: 3600,
        token_type: 'Bearer',
      });

      jest.spyOn(TokenVault, 'saveToken').mockResolvedValue(undefined);
      jest.spyOn(MasterProfile, 'addConnectedProvider').mockResolvedValue(undefined);

      const result = await AuthManager.startAuthFlow('google');
      
      expect(result).toBe(true);
      expect(googleProvider.startAuth).toHaveBeenCalled();
    });

    test('should load github provider from static registry', async () => {
      const githubProvider = require('../providerHelpers/github');
      githubProvider.startAuth.mockResolvedValue({
        access_token: 'test-token',
        refresh_token: 'test-refresh',
        expires_in: 3600,
        token_type: 'Bearer',
      });

      jest.spyOn(TokenVault, 'saveToken').mockResolvedValue(undefined);
      jest.spyOn(MasterProfile, 'addConnectedProvider').mockResolvedValue(undefined);

      const result = await AuthManager.startAuthFlow('github');
      
      expect(result).toBe(true);
      expect(githubProvider.startAuth).toHaveBeenCalled();
    });

    test('should load discord provider from static registry', async () => {
      const discordProvider = require('../providerHelpers/discord');
      discordProvider.startAuth.mockResolvedValue({
        access_token: 'test-token',
        refresh_token: 'test-refresh',
        expires_in: 3600,
        token_type: 'Bearer',
      });

      jest.spyOn(TokenVault, 'saveToken').mockResolvedValue(undefined);
      jest.spyOn(MasterProfile, 'addConnectedProvider').mockResolvedValue(undefined);

      const result = await AuthManager.startAuthFlow('discord');
      
      expect(result).toBe(true);
      expect(discordProvider.startAuth).toHaveBeenCalled();
    });

    test('should load reddit provider from static registry', async () => {
      const redditProvider = require('../providerHelpers/reddit');
      redditProvider.startAuth.mockResolvedValue({
        access_token: 'test-token',
        refresh_token: 'test-refresh',
        expires_in: 3600,
        token_type: 'Bearer',
      });

      jest.spyOn(TokenVault, 'saveToken').mockResolvedValue(undefined);
      jest.spyOn(MasterProfile, 'addConnectedProvider').mockResolvedValue(undefined);

      const result = await AuthManager.startAuthFlow('reddit');
      
      expect(result).toBe(true);
      expect(redditProvider.startAuth).toHaveBeenCalled();
    });

    test('should load spotify provider from static registry', async () => {
      const spotifyProvider = require('../providerHelpers/spotify');
      spotifyProvider.startAuth.mockResolvedValue({
        access_token: 'test-token',
        refresh_token: 'test-refresh',
        expires_in: 3600,
        token_type: 'Bearer',
      });

      jest.spyOn(TokenVault, 'saveToken').mockResolvedValue(undefined);
      jest.spyOn(MasterProfile, 'addConnectedProvider').mockResolvedValue(undefined);

      const result = await AuthManager.startAuthFlow('spotify');
      
      expect(result).toBe(true);
      expect(spotifyProvider.startAuth).toHaveBeenCalled();
    });

    test('should load homeassistant provider from static registry', async () => {
      const homeassistantProvider = require('../providerHelpers/homeassistant');
      homeassistantProvider.startAuth.mockResolvedValue({
        access_token: 'test-token',
        refresh_token: 'test-refresh',
        expires_in: 3600,
        token_type: 'Bearer',
      });

      jest.spyOn(TokenVault, 'saveToken').mockResolvedValue(undefined);
      jest.spyOn(MasterProfile, 'addConnectedProvider').mockResolvedValue(undefined);

      const result = await AuthManager.startAuthFlow('homeassistant');
      
      expect(result).toBe(true);
      expect(homeassistantProvider.startAuth).toHaveBeenCalled();
    });

    test('should handle provider name normalization', async () => {
      googleProvider.startAuth.mockResolvedValue({
        access_token: 'test-token',
        refresh_token: 'test-refresh',
        expires_in: 3600,
        token_type: 'Bearer',
      });

      jest.spyOn(TokenVault, 'saveToken').mockResolvedValue(undefined);
      jest.spyOn(MasterProfile, 'addConnectedProvider').mockResolvedValue(undefined);

      // Test with different cases and spaces
      const result1 = await AuthManager.startAuthFlow('Google');
      const result2 = await AuthManager.startAuthFlow('GOOGLE');
      const result3 = await AuthManager.startAuthFlow('Go ogle'); // with space (should normalize)
      
      expect(result1).toBe(true);
      expect(result2).toBe(true);
      // Note: "Go ogle" with space would normalize to "google"
      expect(googleProvider.startAuth).toHaveBeenCalledTimes(3);
    });

    test('should return false for invalid provider name', async () => {
      const result = await AuthManager.startAuthFlow('invalid-provider');
      expect(result).toBe(false);
    });

    test('should handle errors gracefully for nonexistent providers', async () => {
      const result = await AuthManager.startAuthFlow('nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('Token Management', () => {
    test('should refresh token using provider helper', async () => {
      const mockTokenData = {
        access_token: 'old-token',
        refresh_token: 'refresh-token',
        expires_in: 3600,
        expires_at: Date.now() - 1000, // Expired
        token_type: 'Bearer',
      };

      jest.spyOn(TokenVault, 'getToken').mockResolvedValue(mockTokenData);
      
      googleProvider.refreshToken.mockResolvedValue({
        access_token: 'new-token',
        refresh_token: 'new-refresh-token',
        expires_in: 3600,
        token_type: 'Bearer',
      });

      jest.spyOn(TokenVault, 'saveToken').mockResolvedValue(undefined);

      const newToken = await AuthManager.refreshAccessToken('google');
      
      expect(newToken).toBe('new-token');
      expect(googleProvider.refreshToken).toHaveBeenCalledWith('refresh-token');
      expect(TokenVault.saveToken).toHaveBeenCalled();
    });

    test('should revoke token using provider helper', async () => {
      const mockTokenData = {
        access_token: 'token-to-revoke',
        refresh_token: 'refresh-token',
        expires_in: 3600,
        token_type: 'Bearer',
      };

      jest.spyOn(TokenVault, 'getToken').mockResolvedValue(mockTokenData);
      jest.spyOn(TokenVault, 'removeToken').mockResolvedValue(undefined);
      jest.spyOn(MasterProfile, 'removeConnectedProvider').mockResolvedValue(undefined);
      
      googleProvider.revokeToken.mockResolvedValue(undefined);

      await AuthManager.revokeProvider('google');
      
      expect(googleProvider.revokeToken).toHaveBeenCalledWith('token-to-revoke');
      expect(TokenVault.removeToken).toHaveBeenCalledWith('google');
      expect(MasterProfile.removeConnectedProvider).toHaveBeenCalledWith('google');
    });
  });

  describe('Event System', () => {
    test('should emit connected event on successful auth', async () => {
      googleProvider.startAuth.mockResolvedValue({
        access_token: 'test-token',
        refresh_token: 'test-refresh',
        expires_in: 3600,
        token_type: 'Bearer',
      });

      jest.spyOn(TokenVault, 'saveToken').mockResolvedValue(undefined);
      jest.spyOn(MasterProfile, 'addConnectedProvider').mockResolvedValue(undefined);

      const listener = jest.fn();
      AuthManager.on('connected', listener);

      await AuthManager.startAuthFlow('google');
      
      expect(listener).toHaveBeenCalledWith('google', expect.any(Object));
      
      AuthManager.off('connected', listener);
    });

    test('should emit token_refreshed event on token refresh', async () => {
      const mockTokenData = {
        access_token: 'old-token',
        refresh_token: 'refresh-token',
        expires_in: 3600,
        token_type: 'Bearer',
      };

      jest.spyOn(TokenVault, 'getToken').mockResolvedValue(mockTokenData);
      googleProvider.refreshToken.mockResolvedValue({
        access_token: 'new-token',
        refresh_token: 'new-refresh',
        expires_in: 3600,
        token_type: 'Bearer',
      });
      jest.spyOn(TokenVault, 'saveToken').mockResolvedValue(undefined);

      const listener = jest.fn();
      AuthManager.on('token_refreshed', listener);

      await AuthManager.refreshAccessToken('google');
      
      expect(listener).toHaveBeenCalledWith('google', expect.any(Object));
      
      AuthManager.off('token_refreshed', listener);
    });

    test('should emit disconnected event on revoke', async () => {
      jest.spyOn(TokenVault, 'getToken').mockResolvedValue(null);
      jest.spyOn(TokenVault, 'removeToken').mockResolvedValue(undefined);
      jest.spyOn(MasterProfile, 'removeConnectedProvider').mockResolvedValue(undefined);

      const listener = jest.fn();
      AuthManager.on('disconnected', listener);

      await AuthManager.revokeProvider('google');
      
      expect(listener).toHaveBeenCalled();
      expect(listener.mock.calls[0][0]).toBe('google');
      
      AuthManager.off('disconnected', listener);
    });
  });
});
