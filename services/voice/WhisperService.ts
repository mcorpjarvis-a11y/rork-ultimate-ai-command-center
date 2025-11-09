/**
 * WhisperService - OpenAI Whisper Speech-to-Text Integration
 * Provides real STT functionality using OpenAI's Whisper API
 */

export interface WhisperTranscriptionOptions {
  language?: string;
  prompt?: string;
  temperature?: number;
  response_format?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
}

export interface WhisperTranscriptionResult {
  success: boolean;
  text?: string;
  error?: string;
  duration?: number;
  language?: string;
}

class WhisperService {
  private readonly baseURL = 'https://api.openai.com/v1/audio/transcriptions';
  private readonly model = 'whisper-1';

  /**
   * Transcribe audio using OpenAI Whisper API
   * @param audioData Base64 encoded audio data or Blob
   * @param apiKey OpenAI API key
   * @param options Transcription options
   * @returns Transcription result
   */
  async transcribe(
    audioData: string | Blob,
    apiKey: string,
    options: WhisperTranscriptionOptions = {}
  ): Promise<WhisperTranscriptionResult> {
    if (!apiKey) {
      return {
        success: false,
        error: 'OpenAI API key is required',
      };
    }

    try {
      const formData = new FormData();
      
      // Convert audio data to Blob if it's base64
      let audioBlob: Blob;
      if (typeof audioData === 'string') {
        // Remove data URL prefix if present
        const base64Data = audioData.replace(/^data:audio\/[a-z]+;base64,/, '');
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        audioBlob = new Blob([bytes], { type: 'audio/wav' });
      } else {
        audioBlob = audioData;
      }

      formData.append('file', audioBlob, 'audio.wav');
      formData.append('model', this.model);
      
      if (options.language) {
        formData.append('language', options.language);
      }
      if (options.prompt) {
        formData.append('prompt', options.prompt);
      }
      if (options.temperature !== undefined) {
        formData.append('temperature', options.temperature.toString());
      }
      if (options.response_format) {
        formData.append('response_format', options.response_format);
      }

      const startTime = Date.now();
      
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        body: formData,
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[WhisperService] Transcription failed:', errorText);
        return {
          success: false,
          error: `Whisper API error: ${response.status} - ${errorText}`,
          duration,
        };
      }

      const result = await response.json();

      return {
        success: true,
        text: result.text || result,
        language: result.language,
        duration,
      };
    } catch (error) {
      console.error('[WhisperService] Transcription error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown transcription error',
      };
    }
  }

  /**
   * Check if Whisper service is available (API key is configured)
   * @param apiKey API key to check
   * @returns True if service is available
   */
  isAvailable(apiKey?: string): boolean {
    const key = apiKey || process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    return !!key;
  }

  /**
   * Get supported audio formats
   * @returns Array of supported mime types
   */
  getSupportedFormats(): string[] {
    return [
      'audio/wav',
      'audio/mpeg',
      'audio/mp3',
      'audio/mp4',
      'audio/m4a',
      'audio/webm',
      'audio/ogg',
      'audio/flac',
    ];
  }
}

export default new WhisperService();
