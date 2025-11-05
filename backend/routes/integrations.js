const express = require('express');
const router = express.Router();

/**
 * Integrations Routes
 * Handles all connected APIs (Google, Discord, YouTube, etc.)
 */

// Get all integrations status
router.get('/', (req, res) => {
  const integrations = {
    google: {
      configured: !!(process.env.EXPO_PUBLIC_GOOGLE_DRIVE_TOKEN || process.env.GOOGLE_CLIENT_ID),
      services: ['Drive', 'OAuth'],
      status: 'available'
    },
    youtube: {
      configured: !!process.env.YOUTUBE_API_KEY,
      services: ['Data API', 'Analytics'],
      status: process.env.YOUTUBE_API_KEY ? 'connected' : 'not_configured'
    },
    discord: {
      configured: !!process.env.DISCORD_BOT_TOKEN,
      services: ['Bot', 'Webhooks'],
      status: process.env.DISCORD_BOT_TOKEN ? 'connected' : 'not_configured'
    },
    twitter: {
      configured: !!process.env.TWITTER_API_KEY,
      services: ['API v2', 'Posting'],
      status: process.env.TWITTER_API_KEY ? 'connected' : 'not_configured'
    }
  };

  res.json({ integrations });
});

// Test integration connection
router.post('/test/:service', async (req, res) => {
  try {
    const { service } = req.params;
    
    let result = { success: false, message: 'Service not found' };

    switch (service) {
      case 'google':
        if (process.env.EXPO_PUBLIC_GOOGLE_DRIVE_TOKEN) {
          result = { success: true, message: 'Google integration configured' };
        }
        break;
      case 'youtube':
        if (process.env.YOUTUBE_API_KEY) {
          result = { success: true, message: 'YouTube API key configured' };
        }
        break;
      case 'discord':
        if (process.env.DISCORD_BOT_TOKEN) {
          result = { success: true, message: 'Discord bot token configured' };
        }
        break;
      default:
        result = { success: false, message: 'Unknown service' };
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
