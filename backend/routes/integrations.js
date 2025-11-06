const express = require('express');
const router = express.Router();

/**
 * Integrations Routes
 * Handles all connected APIs and social media accounts
 */

// In-memory storage for connected accounts
const connectedAccounts = new Map();

// Initialize with demo account
connectedAccounts.set('demo_instagram', {
  id: 'demo_instagram',
  platform: 'Instagram',
  username: 'demo_user',
  connected: true,
  accessToken: 'demo_token',
  stats: {
    followers: 15234,
    following: 892,
    posts: 156
  }
});

// GET /api/integrations/accounts - Get all connected social accounts
router.get('/accounts', (req, res) => {
  const accounts = Array.from(connectedAccounts.values());
  res.json({ success: true, data: accounts });
});

// POST /api/integrations/post - Post to social media
router.post('/post', (req, res) => {
  const { accountId, content, mediaUrls = [], hashtags = [], scheduledFor } = req.body;
  
  const account = connectedAccounts.get(accountId);
  if (!account) {
    return res.status(404).json({ success: false, error: 'Account not found' });
  }
  
  const post = {
    id: 'post_' + Date.now(),
    accountId,
    platform: account.platform,
    content,
    mediaUrls,
    hashtags,
    scheduledFor,
    postedAt: scheduledFor || Date.now(),
    status: scheduledFor ? 'scheduled' : 'published',
    stats: {
      likes: 0,
      comments: 0,
      shares: 0,
      views: 0
    }
  };
  
  res.json({ success: true, data: post });
});

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
    },
    socialAccounts: connectedAccounts.size
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
