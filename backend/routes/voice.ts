import express, { Request, Response, Router } from 'express';
import WhisperService from '../../services/voice/WhisperService';
import UserProfileService from '../../services/user/UserProfileService';

const router: Router = express.Router();

/**
 * Voice Routes
 * Handles text-to-speech and speech-to-text via JarvisVoiceService
 */

interface TTSRequest {
  text: string;
  voice?: string;
  rate?: number;
  pitch?: number;
  language?: string;
}

interface STTRequest {
  audio: string;
  language?: string;
}

// Text-to-Speech endpoint
router.post('/tts', async (req: Request<{}, {}, TTSRequest>, res: Response) => {
  try {
    const { text, voice, rate, pitch, language } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Return configuration for client-side TTS
    res.json({
      success: true,
      useClientTTS: true,
      text,
      voice: voice || 'en-GB-Standard-D',
      rate: rate || 1.1,
      pitch: pitch || 0.9,
      language: language || 'en-GB'
    });
  } catch (error) {
    console.error('[Voice/TTS] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: errorMessage,
      useClientTTS: true
    });
  }
});

// Speech-to-Text endpoint
router.post('/stt', async (req: Request<{}, {}, STTRequest>, res: Response) => {
  try {
    const { audio, language } = req.body;

    if (!audio) {
      return res.status(400).json({ error: 'Audio data is required' });
    }

    // Check for OpenAI API key from user profile or environment
    let apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    
    // Try to get from UserProfileService if available
    try {
      await UserProfileService.initialize();
      const profile = UserProfileService.getCurrentProfile();
      if (profile?.apiKeys?.openai) {
        apiKey = profile.apiKeys.openai;
      }
    } catch (error) {
      console.log('[Voice/STT] Could not load user profile, using environment key');
    }

    // Check if Whisper service is available
    if (!WhisperService.isAvailable(apiKey)) {
      return res.json({
        success: false,
        message: 'Speech-to-text not configured. Please add an OpenAI API key.',
        guidance: {
          steps: [
            'Get API key from https://platform.openai.com/api-keys',
            'Add EXPO_PUBLIC_OPENAI_API_KEY to .env file or configure in app settings',
            'Restart backend server or refresh the app'
          ]
        }
      });
    }

    // Transcribe using Whisper
    const result = await WhisperService.transcribe(audio, apiKey!, {
      language: language || 'en',
      response_format: 'json',
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error,
        message: 'Speech-to-text transcription failed'
      });
    }

    res.json({
      success: true,
      text: result.text,
      language: result.language,
      duration: result.duration,
    });
  } catch (error) {
    console.error('[Voice/STT] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: errorMessage,
      message: 'Speech-to-text failed. Please use text input.'
    });
  }
});

// Get voice configuration
router.get('/config', async (req: Request, res: Response) => {
  // Check for OpenAI API key
  let apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  
  try {
    await UserProfileService.initialize();
    const profile = UserProfileService.getCurrentProfile();
    if (profile?.apiKeys?.openai) {
      apiKey = profile.apiKeys.openai;
    }
  } catch (error) {
    // Ignore profile loading errors
  }

  const sttAvailable = WhisperService.isAvailable(apiKey);

  res.json({
    ttsAvailable: true,
    sttAvailable,
    sttProvider: sttAvailable ? 'openai-whisper' : null,
    defaultVoice: 'en-GB-Wavenet-D',
    defaultLanguage: 'en-GB',
    defaultRate: 1.1,
    defaultPitch: 0.9,
    supportedAudioFormats: sttAvailable ? WhisperService.getSupportedFormats() : [],
  });
});

export default router;
