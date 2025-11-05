const express = require('express');
const router = express.Router();

/**
 * Voice Routes
 * Handles text-to-speech and speech-to-text via JarvisVoiceService
 */

// Text-to-Speech endpoint
router.post('/tts', async (req, res) => {
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
    res.status(500).json({
      error: error.message,
      useClientTTS: true
    });
  }
});

// Speech-to-Text endpoint
router.post('/stt', async (req, res) => {
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
    res.status(500).json({
      error: error.message,
      message: 'Speech-to-text failed. Please use text input.'
    });
  }
});

// Get voice configuration
router.get('/config', (req, res) => {
  res.json({
    ttsAvailable: true,
    sttAvailable: false,
    defaultVoice: 'en-GB-Wavenet-D',
    defaultLanguage: 'en-GB',
    defaultRate: 1.1,
    defaultPitch: 0.9
  });
});

module.exports = router;
