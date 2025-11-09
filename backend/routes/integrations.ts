import express, { Request, Response, Router } from 'express';
import AuthManager from '../../services/auth/AuthManager';
import TokenVault from '../../services/auth/TokenVault';
import YouTubeAPIService from '../../services/social/YouTubeAPIService';
import InstagramAPIService from '../../services/social/InstagramAPIService';
import TwitterAPIService from '../../services/social/TwitterAPIService';

const router: Router = express.Router();

/**
 * Real Integrations Routes
 * Uses AuthManager for OAuth and real API calls for YouTube, Instagram, Twitter
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
      if (status === 'connected') {
        // Get token data for additional information
        const tokenData = await TokenVault.getToken(provider);
        
        accounts.push({
          id: provider,
          platform: provider,
          username: null, // Profile information not available from current API
          connected: true,
          connectedAt: undefined, // Connection timestamp not tracked in current implementation
          expiresAt: tokenData?.expires_at,
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
    const isConnected = await AuthManager.isConnected(platform);
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

      case 'instagram':
        // Instagram Business Account ID must be provided or configured
        // The Business Account ID cannot be retrieved from access token alone
        return res.status(400).json({
          success: false,
          error: 'Instagram Business Account ID is required for posting.',
          message: 'Please provide your Instagram Business Account ID. This can be obtained from your Instagram Business account settings.',
          guidance: {
            steps: [
              'Go to Instagram Business account settings',
              'Find your Instagram Business Account ID',
              'Configure it in the application or provide it with the request'
            ]
          }
        });

      case 'twitter':
      case 'x':
        result = await TwitterAPIService.postTweet(accessToken, {
          text: content,
          media_ids: mediaUrls,
        });
        
        return res.json({
          success: true,
          platform: 'twitter',
          data: result,
          message: 'Tweet posted successfully',
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

    const isConnected = await AuthManager.isConnected(platform as string);
    if (!isConnected) {
      return res.status(403).json({ 
        success: false, 
        error: `${platform} is not connected` 
      });
    }

    const accessToken = await AuthManager.getAccessToken(platform as string);
    if (!accessToken) {
      return res.status(403).json({ 
        success: false, 
        error: `No valid access token for ${platform}` 
      });
    }

    let analytics;

    switch ((platform as string).toLowerCase()) {
      case 'youtube':
        const start = (startDate as string) || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const end = (endDate as string) || new Date().toISOString().split('T')[0];
        
        analytics = await YouTubeAPIService.getAnalytics(accessToken, start, end);
        
        return res.json({
          success: true,
          platform: 'youtube',
          data: analytics,
          period: { startDate: start, endDate: end },
        });

      case 'instagram':
        // Instagram Business Account ID should be provided in query or configured
        const igUserId = req.query.igUserId as string;
        
        if (!igUserId) {
          return res.status(400).json({
            success: false,
            error: 'Instagram Business Account ID is required for analytics.',
            message: 'Please provide igUserId as a query parameter or configure it in your profile.',
            guidance: {
              example: '/api/integrations/analytics?platform=instagram&igUserId=YOUR_BUSINESS_ACCOUNT_ID',
              steps: [
                'Obtain your Instagram Business Account ID from Instagram Business settings',
                'Pass it as igUserId query parameter'
              ]
            }
          });
        }
        
        analytics = await InstagramAPIService.getInsights(igUserId, accessToken, 'day');
        
        return res.json({
          success: true,
          platform: 'instagram',
          data: analytics,
        });

      case 'twitter':
      case 'x':
        // Twitter user ID should be provided in query parameter
        const twitterUserId = req.query.twitterUserId as string;
        
        if (!twitterUserId) {
          return res.status(400).json({
            success: false,
            error: 'Twitter user ID is required to fetch analytics.',
            message: 'Please provide twitterUserId as a query parameter.',
            guidance: {
              example: '/api/integrations/analytics?platform=twitter&twitterUserId=YOUR_USER_ID',
              steps: [
                'Obtain your Twitter user ID',
                'Pass it as twitterUserId query parameter'
              ]
            }
          });
        }
        
        analytics = await TwitterAPIService.getUserAnalytics(accessToken, twitterUserId);
        
        return res.json({
          success: true,
          platform: 'twitter',
          data: analytics,
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

    const isConnected = await AuthManager.isConnected(platform);
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
      const tokenData = await TokenVault.getToken(provider);
      
      integrations[provider] = {
        connected: status === 'connected',
        profile: null, // Profile information not available from current API
        expiresAt: tokenData?.expires_at,
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
