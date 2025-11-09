/**
 * Tests for JarvisAPIRouter - AI Provider Integration
 */

import { queryJarvis, testAPIKey, queryJarvisAuto, getAvailableProviders } from '../services/JarvisAPIRouter';

// Mock fetch globally
global.fetch = jest.fn();

describe('JarvisAPIRouter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('HuggingFace Integration', () => {
    it('should successfully query HuggingFace API', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [{ generated_text: 'Test response from HuggingFace' }],
      });

      const result = await queryJarvis('Hello', 'huggingface', 'test-key');

      expect(result.success).toBe(true);
      expect(result.content).toBe('Test response from HuggingFace');
      expect(result.provider).toBe('huggingface');
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should handle HuggingFace API error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        text: async () => 'API Error',
      });

      const result = await queryJarvis('Hello', 'huggingface', 'test-key');

      expect(result.success).toBe(false);
      expect(result.error).toContain('HuggingFace API Error');
      expect(result.provider).toBe('huggingface');
    });

    it('should return error when HuggingFace API key is missing', async () => {
      const result = await queryJarvis('Hello', 'huggingface');

      expect(result.success).toBe(false);
      expect(result.error).toBe('HuggingFace API key not found');
      expect(result.provider).toBe('huggingface');
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('Together AI Integration', () => {
    it('should successfully query Together AI API', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Test response from Together AI' } }],
        }),
      });

      const result = await queryJarvis('Hello', 'togetherai', 'test-key');

      expect(result.success).toBe(true);
      expect(result.content).toBe('Test response from Together AI');
      expect(result.provider).toBe('togetherai');
    });

    it('should handle Together AI API error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        text: async () => 'API Error',
      });

      const result = await queryJarvis('Hello', 'togetherai', 'test-key');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Together AI API Error');
    });

    it('should return error when Together AI API key is missing', async () => {
      const result = await queryJarvis('Hello', 'togetherai');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Together AI API key not found');
    });
  });

  describe('DeepSeek Integration', () => {
    it('should successfully query DeepSeek API', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Test response from DeepSeek' } }],
        }),
      });

      const result = await queryJarvis('Hello', 'deepseek', 'test-key');

      expect(result.success).toBe(true);
      expect(result.content).toBe('Test response from DeepSeek');
      expect(result.provider).toBe('deepseek');
    });

    it('should handle DeepSeek API error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        text: async () => 'API Error',
      });

      const result = await queryJarvis('Hello', 'deepseek', 'test-key');

      expect(result.success).toBe(false);
      expect(result.error).toContain('DeepSeek API Error');
    });

    it('should return error when DeepSeek API key is missing', async () => {
      const result = await queryJarvis('Hello', 'deepseek');

      expect(result.success).toBe(false);
      expect(result.error).toBe('DeepSeek API key not found');
    });
  });

  describe('testAPIKey', () => {
    it('should return true for valid API key', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Response' } }],
        }),
      });

      const result = await testAPIKey('groq', 'valid-key');

      expect(result).toBe(true);
    });

    it('should return false for invalid API key', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        text: async () => 'Unauthorized',
      });

      const result = await testAPIKey('groq', 'invalid-key');

      expect(result).toBe(false);
    });
  });

  describe('queryJarvisAuto', () => {
    it('should use first available provider', async () => {
      // Set environment variable for second provider (groq)
      delete process.env.EXPO_PUBLIC_GEMINI_API_KEY;  // google won't work
      process.env.EXPO_PUBLIC_GROQ_API_KEY = 'test-key';

      // Groq provider succeeds
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Success from Groq' } }],
        }),
      });

      const result = await queryJarvisAuto('Hello');

      // Should skip google (no key), then use groq (succeed)
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(result.success).toBe(true);
      expect(result.content).toBe('Success from Groq');
      expect(result.provider).toBe('groq');
    });

    it('should return error when no provider is available', async () => {
      // Clear all env vars
      delete process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      delete process.env.EXPO_PUBLIC_GROQ_API_KEY;
      delete process.env.EXPO_PUBLIC_TOGETHER_API_KEY;
      delete process.env.EXPO_PUBLIC_HF_API_TOKEN;
      delete process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY;

      const result = await queryJarvisAuto('Hello');

      expect(result.success).toBe(false);
      expect(result.error).toContain('No AI provider available');
    });
  });

  describe('getAvailableProviders', () => {
    it('should return list of configured providers', () => {
      process.env.EXPO_PUBLIC_GEMINI_API_KEY = 'test';
      process.env.EXPO_PUBLIC_GROQ_API_KEY = 'test';

      const providers = getAvailableProviders();

      expect(providers).toContain('google');
      expect(providers).toContain('groq');
      expect(providers.length).toBeGreaterThanOrEqual(2);
    });

    it('should return empty array when no providers configured', () => {
      delete process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      delete process.env.EXPO_PUBLIC_GROQ_API_KEY;
      delete process.env.EXPO_PUBLIC_TOGETHER_API_KEY;
      delete process.env.EXPO_PUBLIC_HF_API_TOKEN;
      delete process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY;

      const providers = getAvailableProviders();

      expect(providers).toEqual([]);
    });
  });
});
