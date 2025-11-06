import express, { Request, Response, Router } from 'express';

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

    // Return configuration needed message
    res.json({
      success: false,
      message: 'Speech-to-text not configured. Use text input or add STT endpoint.',
      guidance: {
        steps: [
          'Get API key from Google Cloud Console',
          'Add GOOGLE_STT_API_KEY to .env file',
          'Restart backend server'
        ]
      }
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
router.get('/config', (req: Request, res: Response) => {
  res.json({
    ttsAvailable: true,
    sttAvailable: false,
    defaultVoice: 'en-GB-Wavenet-D',
    defaultLanguage: 'en-GB',
    defaultRate: 1.1,
    defaultPitch: 0.9
  });
});

export default router;
