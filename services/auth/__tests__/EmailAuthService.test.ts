/**
 * EmailAuthService Tests
 * Tests for email-based authentication
 */

import EmailAuthService from '../EmailAuthService';
import SecureKeyStorage from '@/services/security/SecureKeyStorage';

// Mock SecureKeyStorage
jest.mock('@/services/security/SecureKeyStorage', () => ({
  __esModule: true,
  default: {
    saveKey: jest.fn(),
    getKey: jest.fn(),
    deleteKey: jest.fn(),
  },
}));

// Mock expo-crypto
jest.mock('expo-crypto', () => ({
  digestStringAsync: jest.fn((algorithm, value) => {
    // Simple mock hash for testing
    return Promise.resolve(`hashed_${value}`);
  }),
  CryptoDigestAlgorithm: {
    SHA256: 'SHA256',
  },
}));

describe('EmailAuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(async () => {
    // Clean up any stored credentials
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    it('should successfully sign up a new user', async () => {
      (SecureKeyStorage.getKey as jest.Mock).mockResolvedValue(null);
      (SecureKeyStorage.saveKey as jest.Mock).mockResolvedValue(undefined);

      const result = await EmailAuthService.signUp({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      expect(result).toBe(true);
      expect(SecureKeyStorage.saveKey).toHaveBeenCalledWith(
        expect.stringContaining('email_auth_credentials_test@example.com'),
        expect.any(String)
      );
    });

    it('should reject invalid email format', async () => {
      await expect(
        EmailAuthService.signUp({
          email: 'invalid-email',
          password: 'password123',
        })
      ).rejects.toThrow('Invalid email format');
    });

    it('should reject weak password', async () => {
      await expect(
        EmailAuthService.signUp({
          email: 'test@example.com',
          password: 'weak',
        })
      ).rejects.toThrow('Password must be at least 8 characters long');
    });

    it('should reject duplicate email', async () => {
      const existingCredentials = {
        email: 'test@example.com',
        passwordHash: 'hashed_password123',
        createdAt: new Date().toISOString(),
      };

      (SecureKeyStorage.getKey as jest.Mock).mockResolvedValue(
        JSON.stringify(existingCredentials)
      );

      await expect(
        EmailAuthService.signUp({
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('User already exists');
    });
  });

  describe('signIn', () => {
    it('should successfully sign in with correct credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        passwordHash: 'hashed_password123',
        createdAt: new Date().toISOString(),
      };

      (SecureKeyStorage.getKey as jest.Mock).mockResolvedValue(
        JSON.stringify(credentials)
      );

      const result = await EmailAuthService.signIn({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toBe(true);
    });

    it('should reject sign in for non-existent user', async () => {
      (SecureKeyStorage.getKey as jest.Mock).mockResolvedValue(null);

      await expect(
        EmailAuthService.signIn({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('User not found');
    });

    it('should reject sign in with incorrect password', async () => {
      const credentials = {
        email: 'test@example.com',
        passwordHash: 'hashed_password123',
        createdAt: new Date().toISOString(),
      };

      (SecureKeyStorage.getKey as jest.Mock).mockResolvedValue(
        JSON.stringify(credentials)
      );

      await expect(
        EmailAuthService.signIn({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Invalid password');
    });
  });

  describe('userExists', () => {
    it('should return true for existing user', async () => {
      const credentials = {
        email: 'test@example.com',
        passwordHash: 'hashed_password123',
        createdAt: new Date().toISOString(),
      };

      (SecureKeyStorage.getKey as jest.Mock).mockResolvedValue(
        JSON.stringify(credentials)
      );

      const exists = await EmailAuthService.userExists('test@example.com');
      expect(exists).toBe(true);
    });

    it('should return false for non-existent user', async () => {
      (SecureKeyStorage.getKey as jest.Mock).mockResolvedValue(null);

      const exists = await EmailAuthService.userExists('nonexistent@example.com');
      expect(exists).toBe(false);
    });
  });

  describe('changePassword', () => {
    it('should successfully change password with correct old password', async () => {
      const credentials = {
        email: 'test@example.com',
        passwordHash: 'hashed_oldpassword',
        createdAt: new Date().toISOString(),
      };

      (SecureKeyStorage.getKey as jest.Mock).mockResolvedValue(
        JSON.stringify(credentials)
      );
      (SecureKeyStorage.saveKey as jest.Mock).mockResolvedValue(undefined);

      const result = await EmailAuthService.changePassword(
        'test@example.com',
        'oldpassword',
        'newpassword123'
      );

      expect(result).toBe(true);
      expect(SecureKeyStorage.saveKey).toHaveBeenCalled();
    });

    it('should reject password change with incorrect old password', async () => {
      const credentials = {
        email: 'test@example.com',
        passwordHash: 'hashed_oldpassword',
        createdAt: new Date().toISOString(),
      };

      (SecureKeyStorage.getKey as jest.Mock).mockResolvedValue(
        JSON.stringify(credentials)
      );

      await expect(
        EmailAuthService.changePassword(
          'test@example.com',
          'wrongpassword',
          'newpassword123'
        )
      ).rejects.toThrow('Invalid password');
    });

    it('should reject weak new password', async () => {
      const credentials = {
        email: 'test@example.com',
        passwordHash: 'hashed_oldpassword',
        createdAt: new Date().toISOString(),
      };

      (SecureKeyStorage.getKey as jest.Mock).mockResolvedValue(
        JSON.stringify(credentials)
      );

      await expect(
        EmailAuthService.changePassword(
          'test@example.com',
          'oldpassword',
          'weak'
        )
      ).rejects.toThrow('New password must be at least 8 characters long');
    });
  });

  describe('deleteAccount', () => {
    it('should successfully delete account with correct password', async () => {
      const credentials = {
        email: 'test@example.com',
        passwordHash: 'hashed_password123',
        createdAt: new Date().toISOString(),
      };

      (SecureKeyStorage.getKey as jest.Mock).mockResolvedValue(
        JSON.stringify(credentials)
      );
      (SecureKeyStorage.deleteKey as jest.Mock).mockResolvedValue(undefined);

      const result = await EmailAuthService.deleteAccount(
        'test@example.com',
        'password123'
      );

      expect(result).toBe(true);
      expect(SecureKeyStorage.deleteKey).toHaveBeenCalledWith(
        expect.stringContaining('email_auth_credentials_test@example.com')
      );
    });

    it('should reject account deletion with incorrect password', async () => {
      const credentials = {
        email: 'test@example.com',
        passwordHash: 'hashed_password123',
        createdAt: new Date().toISOString(),
      };

      (SecureKeyStorage.getKey as jest.Mock).mockResolvedValue(
        JSON.stringify(credentials)
      );

      await expect(
        EmailAuthService.deleteAccount(
          'test@example.com',
          'wrongpassword'
        )
      ).rejects.toThrow('Invalid password');
    });
  });
});
