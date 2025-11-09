/**
 * InstagramAPIService - Real Instagram Graph API integration
 * Handles posting, analytics, and content management
 */

export interface InstagramMedia {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
}

export interface InstagramInsights {
  impressions: number;
  reach: number;
  engagement: number;
  follower_count: number;
  profile_views: number;
  website_clicks: number;
}

export interface InstagramPostOptions {
  imageUrl?: string;
  videoUrl?: string;
  caption?: string;
  location?: string;
  accessToken: string;
  igUserId: string;
}

class InstagramAPIService {
  private readonly baseURL = 'https://graph.facebook.com/v18.0';

  /**
   * Create media container (for posting)
   */
  async createMediaContainer(options: InstagramPostOptions): Promise<string> {
    try {
      const params = new URLSearchParams({
        access_token: options.accessToken,
      });

      if (options.imageUrl) {
        params.append('image_url', options.imageUrl);
      } else if (options.videoUrl) {
        params.append('video_url', options.videoUrl);
        params.append('media_type', 'VIDEO');
      } else {
        throw new Error('Either imageUrl or videoUrl is required');
      }

      if (options.caption) {
        params.append('caption', options.caption);
      }

      const response = await fetch(
        `${this.baseURL}/${options.igUserId}/media?${params.toString()}`,
        { method: 'POST' }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to create media container: ${JSON.stringify(error)}`);
      }

      const data = await response.json();
      console.log('[Instagram] Media container created:', data.id);
      return data.id;
    } catch (error) {
      console.error('[Instagram] Failed to create media container:', error);
      throw error;
    }
  }

  /**
   * Publish media container (complete the post)
   */
  async publishMedia(
    igUserId: string,
    containerId: string,
    accessToken: string
  ): Promise<{ id: string }> {
    try {
      const params = new URLSearchParams({
        creation_id: containerId,
        access_token: accessToken,
      });

      const response = await fetch(
        `${this.baseURL}/${igUserId}/media_publish?${params.toString()}`,
        { method: 'POST' }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to publish media: ${JSON.stringify(error)}`);
      }

      const data = await response.json();
      console.log('[Instagram] Media published:', data.id);
      return data;
    } catch (error) {
      console.error('[Instagram] Failed to publish media:', error);
      throw error;
    }
  }

  /**
   * Post image or video to Instagram (combined operation)
   */
  async post(options: InstagramPostOptions): Promise<{ id: string; permalink?: string }> {
    try {
      // Step 1: Create media container
      const containerId = await this.createMediaContainer(options);

      // Step 2: Wait for media to be processed (for videos)
      if (options.videoUrl) {
        await this.waitForMediaProcessing(containerId, options.accessToken);
      }

      // Step 3: Publish the media
      const result = await this.publishMedia(options.igUserId, containerId, options.accessToken);

      return result;
    } catch (error) {
      console.error('[Instagram] Post failed:', error);
      throw error;
    }
  }

  /**
   * Wait for media processing to complete
   */
  private async waitForMediaProcessing(containerId: string, accessToken: string): Promise<void> {
    const maxAttempts = 30;
    const delayMs = 2000;

    for (let i = 0; i < maxAttempts; i++) {
      const status = await this.getMediaStatus(containerId, accessToken);
      
      if (status === 'FINISHED') {
        console.log('[Instagram] Media processing finished');
        return;
      }

      if (status === 'ERROR') {
        throw new Error('Media processing failed');
      }

      // Wait before checking again
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }

    throw new Error('Media processing timeout');
  }

  /**
   * Get media processing status
   */
  private async getMediaStatus(containerId: string, accessToken: string): Promise<string> {
    const response = await fetch(
      `${this.baseURL}/${containerId}?fields=status_code&access_token=${accessToken}`
    );

    if (!response.ok) {
      throw new Error('Failed to get media status');
    }

    const data = await response.json();
    return data.status_code;
  }

  /**
   * Get user media (posts)
   */
  async getUserMedia(
    igUserId: string,
    accessToken: string,
    limit: number = 25
  ): Promise<InstagramMedia[]> {
    try {
      const fields = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count';
      const response = await fetch(
        `${this.baseURL}/${igUserId}/media?fields=${fields}&limit=${limit}&access_token=${accessToken}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to get user media: ${JSON.stringify(error)}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('[Instagram] Failed to get user media:', error);
      throw error;
    }
  }

  /**
   * Get account insights
   */
  async getInsights(
    igUserId: string,
    accessToken: string,
    period: 'day' | 'week' | 'days_28' = 'day'
  ): Promise<InstagramInsights> {
    try {
      const metrics = [
        'impressions',
        'reach',
        'profile_views',
        'website_clicks',
        'follower_count',
      ];

      const response = await fetch(
        `${this.baseURL}/${igUserId}/insights?metric=${metrics.join(',')}&period=${period}&access_token=${accessToken}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to get insights: ${JSON.stringify(error)}`);
      }

      const data = await response.json();
      
      // Parse insights data
      const insights: any = {};
      data.data.forEach((metric: any) => {
        if (metric.values && metric.values.length > 0) {
          insights[metric.name] = metric.values[0].value;
        }
      });

      // Calculate engagement
      const engagement = (insights.reach > 0) 
        ? ((insights.profile_views + insights.website_clicks) / insights.reach) * 100 
        : 0;

      return {
        impressions: insights.impressions || 0,
        reach: insights.reach || 0,
        engagement,
        follower_count: insights.follower_count || 0,
        profile_views: insights.profile_views || 0,
        website_clicks: insights.website_clicks || 0,
      };
    } catch (error) {
      console.error('[Instagram] Failed to get insights:', error);
      throw error;
    }
  }

  /**
   * Get media insights (for specific post)
   */
  async getMediaInsights(
    mediaId: string,
    accessToken: string
  ): Promise<{ impressions: number; reach: number; engagement: number; saved: number }> {
    try {
      const metrics = ['impressions', 'reach', 'engagement', 'saved'];
      
      const response = await fetch(
        `${this.baseURL}/${mediaId}/insights?metric=${metrics.join(',')}&access_token=${accessToken}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to get media insights: ${JSON.stringify(error)}`);
      }

      const data = await response.json();
      
      const insights: any = {};
      data.data.forEach((metric: any) => {
        if (metric.values && metric.values.length > 0) {
          insights[metric.name] = metric.values[0].value;
        }
      });

      return {
        impressions: insights.impressions || 0,
        reach: insights.reach || 0,
        engagement: insights.engagement || 0,
        saved: insights.saved || 0,
      };
    } catch (error) {
      console.error('[Instagram] Failed to get media insights:', error);
      throw error;
    }
  }

  /**
   * Get comments for media
   */
  async getMediaComments(
    mediaId: string,
    accessToken: string
  ): Promise<Array<{ id: string; text: string; username: string; timestamp: string }>> {
    try {
      const response = await fetch(
        `${this.baseURL}/${mediaId}/comments?fields=id,text,username,timestamp&access_token=${accessToken}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to get comments: ${JSON.stringify(error)}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('[Instagram] Failed to get comments:', error);
      throw error;
    }
  }

  /**
   * Reply to comment
   */
  async replyToComment(
    commentId: string,
    message: string,
    accessToken: string
  ): Promise<{ id: string }> {
    try {
      const params = new URLSearchParams({
        message,
        access_token: accessToken,
      });

      const response = await fetch(
        `${this.baseURL}/${commentId}/replies?${params.toString()}`,
        { method: 'POST' }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to reply to comment: ${JSON.stringify(error)}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[Instagram] Failed to reply to comment:', error);
      throw error;
    }
  }
}

export default new InstagramAPIService();
