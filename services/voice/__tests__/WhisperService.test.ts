/**
 * Tests for WhisperService - OpenAI Whisper STT Integration
 */

import WhisperService from '../WhisperService';

// Mock fetch globally
global.fetch = jest.fn();
global.FormData = jest.fn(() => ({
  append: jest.fn(),
})) as any;
global.Blob = jest.fn() as any;
global.atob = jest.fn((str) => Buffer.from(str, 'base64').toString('binary'));

describe('WhisperService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('transcribe', () => {
    it('should successfully transcribe audio with base64 input', async () => {
      const mockResponse = {
        text: 'Hello world',
        language: 'en',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const audioData = 'data:audio/wav;base64,SGVsbG8gV29ybGQ=';
      const result = await WhisperService.transcribe(audioData, 'test-api-key');

      expect(result.success).toBe(true);
      expect(result.text).toBe('Hello world');
      expect(result.language).toBe('en');
      expect(result.duration).toBeGreaterThanOrEqual(0);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should successfully transcribe audio with Blob input', async () => {
      const mockResponse = {
        text: 'Test transcription',
        language: 'en',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const audioBlob = new Blob(['test'], { type: 'audio/wav' });
      const result = await WhisperService.transcribe(audioBlob, 'test-api-key');

      expect(result.success).toBe(true);
      expect(result.text).toBe('Test transcription');
    });

    it('should handle transcription with language option', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ text: 'Hola mundo', language: 'es' }),
      });

      const audioData = 'data:audio/wav;base64,SGVsbG8gV29ybGQ=';
      const result = await WhisperService.transcribe(audioData, 'test-api-key', {
        language: 'es',
      });

      expect(result.success).toBe(true);
      expect(result.language).toBe('es');
    });

    it('should handle API errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized',
      });

      const audioData = 'data:audio/wav;base64,SGVsbG8gV29ybGQ=';
      const result = await WhisperService.transcribe(audioData, 'invalid-key');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Whisper API error');
      expect(result.error).toContain('401');
    });

    it('should return error when API key is missing', async () => {
      const audioData = 'data:audio/wav;base64,SGVsbG8gV29ybGQ=';
      const result = await WhisperService.transcribe(audioData, '');

      expect(result.success).toBe(false);
      expect(result.error).toBe('OpenAI API key is required');
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const audioData = 'data:audio/wav;base64,SGVsbG8gV29ybGQ=';
      const result = await WhisperService.transcribe(audioData, 'test-key');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('should support temperature and prompt options', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ text: 'Test', language: 'en' }),
      });

      const audioData = 'data:audio/wav;base64,SGVsbG8gV29ybGQ=';
      await WhisperService.transcribe(audioData, 'test-key', {
        temperature: 0.5,
        prompt: 'This is a test',
        response_format: 'verbose_json',
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('isAvailable', () => {
    it('should return true when API key is provided', () => {
      const result = WhisperService.isAvailable('test-key');
      expect(result).toBe(true);
    });

    it('should return false when API key is not provided', () => {
      delete process.env.EXPO_PUBLIC_OPENAI_API_KEY;
      const result = WhisperService.isAvailable();
      expect(result).toBe(false);
    });

    it('should check environment variable when no key provided', () => {
      process.env.EXPO_PUBLIC_OPENAI_API_KEY = 'env-key';
      const result = WhisperService.isAvailable();
      expect(result).toBe(true);
    });
  });

  describe('getSupportedFormats', () => {
    it('should return list of supported audio formats', () => {
      const formats = WhisperService.getSupportedFormats();
      
      expect(formats).toContain('audio/wav');
      expect(formats).toContain('audio/mp3');
      expect(formats).toContain('audio/webm');
      expect(formats.length).toBeGreaterThan(0);
    });
  });
});
