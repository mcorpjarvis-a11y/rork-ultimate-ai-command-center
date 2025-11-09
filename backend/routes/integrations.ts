import express, { Request, Response, Router } from 'express';
import AuthManager from '../../services/auth/AuthManager';
import TokenVault from '../../services/auth/TokenVault';
import YouTubeAPIService from '../../services/social/YouTubeAPIService';

const router: Router = express.Router();

/**
 * Real Integrations Routes
 * Uses AuthManager for OAuth and real API calls
 */

interface PostRequestBody {
  platform: string;
  content: string;
  mediaUrls?: string[];
  videoFile?: any;
  hashtags?: string[];
  scheduledFor?: number;
  privacyStatus?: 'public' | 'private' | 'unlisted';
}

interface AnalyticsRequest {
  platform: string;
  startDate?: string;
  endDate?: string;
}

// GET /api/integrations/accounts - Get all connected social accounts
router.get('/accounts', async (req: Request, res: Response) => {
  try {
    const connectedProviders = await AuthManager.getConnectedProviders();
    const accounts = [];

    for (const provider of connectedProviders) {
      const status = await AuthManager.getProviderStatus(provider);
      if (status.connected) {
        accounts.push({
          id: provider,
          platform: provider,
          username: status.profile?.username || status.profile?.displayName || 'Unknown',
          connected: true,
          connectedAt: status.connectedAt,
          expiresAt: status.expiresAt,
        });
      }
    }

    res.json({ success: true, data: accounts });
  } catch (error) {
    console.error('[Integrations] Error fetching accounts:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch accounts' 
    });
  }
});

// POST /api/integrations/social/post - Post to social media
router.post('/social/post', async (req: Request<{}, {}, PostRequestBody>, res: Response) => {
  try {
    const { platform, content, mediaUrls = [], videoFile, hashtags = [], scheduledFor, privacyStatus } = req.body;
    
    if (!platform) {
      return res.status(400).json({ success: false, error: 'Platform is required' });
    }

    // Check if provider is connected
    const isConnected = await AuthManager.isProviderConnected(platform);
    if (!isConnected) {
      return res.status(403).json({ 
        success: false, 
        error: `${platform} is not connected. Please authenticate first.` 
      });
    }

    // Get access token
    const accessToken = await AuthManager.getAccessToken(platform);
    if (!accessToken) {
      return res.status(403).json({ 
        success: false, 
        error: `No valid access token for ${platform}` 
      });
    }

    let result;

    switch (platform.toLowerCase()) {
      case 'youtube':
        if (!videoFile) {
          return res.status(400).json({ 
            success: false, 
            error: 'Video file is required for YouTube uploads' 
          });
        }
        
        result = await YouTubeAPIService.uploadVideo(accessToken, {
          title: content.substring(0, 100), // YouTube title limit
          description: content,
          tags: hashtags,
          privacyStatus: privacyStatus || 'public',
          videoFile: videoFile,
        });
        
        return res.json({
          success: true,
          platform: 'youtube',
          data: result,
          message: 'Video uploaded successfully to YouTube',
        });

      default:
        return res.status(400).json({ 
          success: false, 
          error: `Posting to ${platform} is not yet implemented` 
        });
    }
  } catch (error) {
    console.error('[Integrations] Post error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to post content',
    });
  }
});

// GET /api/integrations/social/analytics - Get platform analytics
router.get('/social/analytics', async (req: Request<{}, {}, {}, AnalyticsRequest>, res: Response) => {
  try {
    const { platform, startDate, endDate } = req.query;
    
    if (!platform) {
      return res.status(400).json({ success: false, error: 'Platform is required' });
    }

    const isConnected = await AuthManager.isProviderConnected(platform);
    if (!isConnected) {
      return res.status(403).json({ 
        success: false, 
        error: `${platform} is not connected` 
      });
    }

    const accessToken = await AuthManager.getAccessToken(platform);
    if (!accessToken) {
      return res.status(403).json({ 
        success: false, 
        error: `No valid access token for ${platform}` 
      });
    }

    let analytics;

    switch (platform.toLowerCase()) {
      case 'youtube':
        const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const end = endDate || new Date().toISOString().split('T')[0];
        
        analytics = await YouTubeAPIService.getAnalytics(accessToken, start, end);
        
        return res.json({
          success: true,
          platform: 'youtube',
          data: analytics,
          period: { startDate: start, endDate: end },
        });

      default:
        return res.status(400).json({ 
          success: false, 
          error: `Analytics for ${platform} is not yet implemented` 
        });
    }
  } catch (error) {
    console.error('[Integrations] Analytics error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch analytics',
    });
  }
});

// GET /api/integrations/social/content - Get recent content from platform
router.get('/social/content', async (req: Request<{}, {}, {}, { platform: string; maxResults?: string }>, res: Response) => {
  try {
    const { platform, maxResults } = req.query;
    
    if (!platform) {
      return res.status(400).json({ success: false, error: 'Platform is required' });
    }

    const isConnected = await AuthManager.isProviderConnected(platform);
    if (!isConnected) {
      return res.status(403).json({ 
        success: false, 
        error: `${platform} is not connected` 
      });
    }

    const accessToken = await AuthManager.getAccessToken(platform);
    if (!accessToken) {
      return res.status(403).json({ 
        success: false, 
        error: `No valid access token for ${platform}` 
      });
    }

    let content;

    switch (platform.toLowerCase()) {
      case 'youtube':
        content = await YouTubeAPIService.getChannelVideos(
          accessToken, 
          maxResults ? parseInt(maxResults, 10) : 50
        );
        
        return res.json({
          success: true,
          platform: 'youtube',
          data: content,
        });

      default:
        return res.status(400).json({ 
          success: false, 
          error: `Content fetching for ${platform} is not yet implemented` 
        });
    }
  } catch (error) {
    console.error('[Integrations] Content fetch error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch content',
    });
  }
});

// GET /api/integrations - Get all integrations status
router.get('/', async (req: Request, res: Response) => {
  try {
    const connectedProviders = await AuthManager.getConnectedProviders();
    const integrations: Record<string, any> = {};

    for (const provider of connectedProviders) {
      const status = await AuthManager.getProviderStatus(provider);
      integrations[provider] = {
        connected: status.connected,
        profile: status.profile,
        expiresAt: status.expiresAt,
        services: getProviderServices(provider),
      };
    }

    res.json({ 
      success: true,
      integrations,
      totalConnected: connectedProviders.length,
    });
  } catch (error) {
    console.error('[Integrations] Error fetching status:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch integrations' 
    });
  }
});

function getProviderServices(provider: string): string[] {
  const services: Record<string, string[]> = {
    youtube: ['Video Upload', 'Analytics', 'Channel Management'],
    google: ['Drive', 'OAuth', 'User Profile'],
    github: ['Repositories', 'Profile'],
    discord: ['Bot', 'Webhooks'],
    reddit: ['Posts', 'Comments'],
    spotify: ['Playlists', 'Playback'],
  };
  return services[provider] || ['OAuth'];
}

export default router;
