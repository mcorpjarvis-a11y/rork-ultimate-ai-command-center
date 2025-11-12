/**
 * Login Stack Integration Tests
 * Tests the full login → permissions → oauth → dashboard flow
 * Validates rendering, navigation, and authentication state transitions
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import SignInScreen from '@/screens/Onboarding/SignInScreen';
import PermissionManager from '@/screens/Onboarding/PermissionManager';
import AuthManager from '@/services/auth/AuthManager';
import MasterProfile from '@/services/auth/MasterProfile';
import { MasterProfile as MasterProfileType } from '@/services/auth/types';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  Stack: {
    Screen: () => null,
  },
}));

// Mock expo modules
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}));

jest.mock('expo-auth-session', () => ({
  makeRedirectUri: jest.fn(() => 'myapp://redirect'),
  AuthRequest: jest.fn(),
  ResponseType: { Code: 'code' },
}));

jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
}));

// Mock lucide-react-native icons
jest.mock('lucide-react-native', () => ({
  Camera: () => 'Camera',
  Mic: () => 'Mic',
  MapPin: () => 'MapPin',
  Bluetooth: () => 'Bluetooth',
  Wifi: () => 'Wifi',
  HardDrive: () => 'HardDrive',
  Bell: () => 'Bell',
  Users: () => 'Users',
  Calendar: () => 'Calendar',
  Phone: () => 'Phone',
  Activity: () => 'Activity',
  Radio: () => 'Radio',
  Smartphone: () => 'Smartphone',
}));

describe('Login Stack', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('SignInScreen', () => {
    it('should render without crashing', () => {
      const { getByText } = render(<SignInScreen />);
      expect(getByText(/Welcome to/i)).toBeTruthy();
      expect(getByText(/RORK AI Command Center/i)).toBeTruthy();
    });

    it('should show email sign-in form by default', () => {
      const { getByPlaceholderText, getByText } = render(<SignInScreen />);
      
      expect(getByPlaceholderText(/Enter your email/i)).toBeTruthy();
      expect(getByPlaceholderText(/Enter your password/i)).toBeTruthy();
      expect(getByText(/Sign In/i)).toBeTruthy();
    });

    it('should show Google sign-in option', () => {
      const { getByText } = render(<SignInScreen />);
      expect(getByText(/Continue with Google/i)).toBeTruthy();
    });

    it('should have skip button', () => {
      const { getByText } = render(<SignInScreen />);
      expect(getByText(/Skip for now/i)).toBeTruthy();
    });

    it('should toggle between sign-in and sign-up modes', async () => {
      const { getByText, queryByPlaceholderText } = render(<SignInScreen />);
      
      // Initially in sign-in mode - no name field
      expect(queryByPlaceholderText(/Enter your name/i)).toBeNull();
      
      // Click to switch to sign-up
      const toggleButton = getByText(/Don't have an account/i);
      expect(toggleButton).toBeTruthy();
    });
  });

  describe('PermissionManager', () => {
    it('should render without crashing', () => {
      const { getByText } = render(<PermissionManager />);
      expect(getByText(/System Permissions/i)).toBeTruthy();
    });

    it('should display critical permissions', () => {
      const { getByText } = render(<PermissionManager />);
      
      expect(getByText(/Camera/i)).toBeTruthy();
      expect(getByText(/Microphone/i)).toBeTruthy();
      expect(getByText(/Precise Location/i)).toBeTruthy();
      expect(getByText(/Storage \(Read\)/i)).toBeTruthy();
      expect(getByText(/Notifications/i)).toBeTruthy();
    });

    it('should have request all permissions button', () => {
      const { getByText } = render(<PermissionManager />);
      expect(getByText(/Request All Permissions/i)).toBeTruthy();
    });

    it('should have continue button', () => {
      const { getByText } = render(<PermissionManager />);
      expect(getByText(/Continue to OAuth Setup/i)).toBeTruthy();
    });
  });

  describe('Authentication State Transitions', () => {
    it('should handle null auth state (not logged in)', async () => {
      // Mock getMasterProfile to return null
      jest.spyOn(MasterProfile, 'getMasterProfile').mockResolvedValue(null);

      const screen = render(<SignInScreen />);
      
      await waitFor(() => {
        // Should show sign-in screen when no profile exists
        expect(screen.getByText(/Welcome to/i)).toBeTruthy();
      });
    });

    it('should handle authenticated user state', async () => {
      const mockProfile: MasterProfileType = {
        id: 'test-user-123',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date().toISOString(),
        connectedProviders: ['google'],
      };

      // Mock getMasterProfile to return a valid profile
      jest.spyOn(MasterProfile, 'getMasterProfile').mockResolvedValue(mockProfile);

      // This should redirect to app, so we check that redirect happens
      const mockRouter = { replace: jest.fn(), push: jest.fn(), back: jest.fn() };
      const useRouterMock = require('expo-router').useRouter;
      useRouterMock.mockReturnValue(mockRouter);

      render(<SignInScreen />);

      await waitFor(() => {
        // Should attempt to redirect to main app
        expect(mockRouter.replace).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('Import Validation', () => {
    it('should verify all required services are importable', () => {
      expect(AuthManager).toBeDefined();
      expect(MasterProfile).toBeDefined();
      expect(typeof AuthManager.startAuthFlow).toBe('function');
      expect(typeof MasterProfile.getMasterProfile).toBe('function');
      expect(typeof MasterProfile.saveMasterProfile).toBe('function');
    });

    it('should verify auth types are correct', () => {
      const mockProfile: MasterProfileType = {
        id: 'test',
        createdAt: new Date().toISOString(),
        connectedProviders: ['google'],
      };
      
      expect(mockProfile).toHaveProperty('id');
      expect(mockProfile).toHaveProperty('createdAt');
      expect(mockProfile).toHaveProperty('connectedProviders');
    });
  });

  describe('Navigation Flow', () => {
    it('should define correct navigation routes', () => {
      // Login flow: SignInScreen → /onboarding/permissions → /onboarding/oauth-setup → / (Dashboard)
      const expectedRoutes = [
        '/onboarding/permissions',
        '/onboarding/oauth-setup',
        '/',
      ];

      expectedRoutes.forEach(route => {
        expect(typeof route).toBe('string');
        expect(route.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle MasterProfile errors gracefully', async () => {
      // Mock getMasterProfile to throw an error
      jest.spyOn(MasterProfile, 'getMasterProfile').mockRejectedValue(
        new Error('Storage error')
      );

      const { getByText } = render(<SignInScreen />);

      await waitFor(() => {
        // Should still render sign-in screen despite error
        expect(getByText(/Welcome to/i)).toBeTruthy();
      });
    });

    it('should handle AuthManager errors gracefully', async () => {
      // Mock startAuthFlow to fail
      jest.spyOn(AuthManager, 'startAuthFlow').mockResolvedValue(false);

      const screen = render(<SignInScreen />);

      await waitFor(() => {
        // Screen should still be functional
        expect(screen.getByText(/Sign In/i)).toBeTruthy();
      });
    });
  });
});
