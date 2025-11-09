/**
 * YouTubeAPIService - Real YouTube Data API v3 integration
 * Handles video uploads, analytics, and channel management
 */

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnailUrl: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  duration: string;
}

export interface YouTubeAnalytics {
  views: number;
  estimatedMinutesWatched: number;
  averageViewDuration: number;
  subscribersGained: number;
  subscribersLost: number;
  likes: number;
  dislikes: number;
  comments: number;
  shares: number;
}

export interface YouTubeUploadOptions {
  title: string;
  description: string;
  tags?: string[];
  categoryId?: string;
  privacyStatus: 'public' | 'private' | 'unlisted';
  videoFile: Blob | File;
  thumbnailFile?: Blob | File;
}

class YouTubeAPIService {
  private readonly baseURL = 'https://www.googleapis.com/youtube/v3';
  private readonly analyticsBaseURL = 'https://youtubeanalytics.googleapis.com/v2';

  /**
   * Upload a video to YouTube
   */
  async uploadVideo(
    accessToken: string,
    options: YouTubeUploadOptions
  ): Promise<{ videoId: string; url: string }> {
    try {
      // Step 1: Initialize upload
      const metadata = {
        snippet: {
          title: options.title,
          description: options.description,
          tags: options.tags || [],
          categoryId: options.categoryId || '22', // Default to People & Blogs
        },
        status: {
          privacyStatus: options.privacyStatus,
          selfDeclaredMadeForKids: false,
        },
      };

      // Step 2: Upload video using resumable upload
      const uploadUrl = await this.initializeUpload(accessToken, metadata);
      const videoId = await this.uploadVideoFile(uploadUrl, options.videoFile);

      // Step 3: Upload thumbnail if provided
      if (options.thumbnailFile) {
        await this.uploadThumbnail(accessToken, videoId, options.thumbnailFile);
      }

      return {
        videoId,
        url: `https://www.youtube.com/watch?v=${videoId}`,
      };
    } catch (error) {
      console.error('[YouTubeAPIService] Upload failed:', error);
      throw new Error(`Video upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async initializeUpload(accessToken: string, metadata: any): Promise<string> {
    const response = await fetch(`${this.baseURL}/videos?uploadType=resumable&part=snippet,status`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Upload-Content-Type': 'video/*',
      },
      body: JSON.stringify(metadata),
    });

    if (!response.ok) {
      throw new Error(`Failed to initialize upload: ${response.statusText}`);
    }

    const uploadUrl = response.headers.get('Location');
    if (!uploadUrl) {
      throw new Error('No upload URL received');
    }

    return uploadUrl;
  }

  private async uploadVideoFile(uploadUrl: string, videoFile: Blob | File): Promise<string> {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'video/*',
      },
      body: videoFile,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload video file: ${response.statusText}`);
    }

    const data = await response.json();
    return data.id;
  }

  private async uploadThumbnail(accessToken: string, videoId: string, thumbnailFile: Blob | File): Promise<void> {
    const formData = new FormData();
    formData.append('file', thumbnailFile);

    const response = await fetch(`${this.baseURL}/thumbnails/set?videoId=${videoId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      console.warn('[YouTubeAPIService] Thumbnail upload failed:', response.statusText);
    }
  }

  /**
   * Get channel videos
   */
  async getChannelVideos(accessToken: string, maxResults: number = 50): Promise<YouTubeVideo[]> {
    try {
      // First, get the channel's upload playlist ID
      const channelResponse = await fetch(
        `${this.baseURL}/channels?part=contentDetails&mine=true`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!channelResponse.ok) {
        throw new Error('Failed to fetch channel info');
      }

      const channelData = await channelResponse.json();
      const uploadsPlaylistId = channelData.items[0]?.contentDetails?.relatedPlaylists?.uploads;

      if (!uploadsPlaylistId) {
        return [];
      }

      // Get videos from uploads playlist
      const playlistResponse = await fetch(
        `${this.baseURL}/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!playlistResponse.ok) {
        throw new Error('Failed to fetch videos');
      }

      const playlistData = await playlistResponse.json();
      const videoIds = playlistData.items.map((item: any) => item.contentDetails.videoId).join(',');

      // Get detailed video statistics
      const videoResponse = await fetch(
        `${this.baseURL}/videos?part=snippet,statistics,contentDetails&id=${videoIds}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!videoResponse.ok) {
        throw new Error('Failed to fetch video details');
      }

      const videoData = await videoResponse.json();

      return videoData.items.map((video: any) => ({
        id: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        publishedAt: video.snippet.publishedAt,
        thumbnailUrl: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default.url,
        viewCount: parseInt(video.statistics.viewCount || '0', 10),
        likeCount: parseInt(video.statistics.likeCount || '0', 10),
        commentCount: parseInt(video.statistics.commentCount || '0', 10),
        duration: video.contentDetails.duration,
      }));
    } catch (error) {
      console.error('[YouTubeAPIService] Failed to get videos:', error);
      throw error;
    }
  }

  /**
   * Get channel analytics
   */
  async getAnalytics(
    accessToken: string,
    startDate: string,
    endDate: string
  ): Promise<YouTubeAnalytics> {
    try {
      const metrics = 'views,estimatedMinutesWatched,averageViewDuration,subscribersGained,subscribersLost,likes,dislikes,comments,shares';
      
      const response = await fetch(
        `${this.analyticsBaseURL}/reports?ids=channel==MINE&startDate=${startDate}&endDate=${endDate}&metrics=${metrics}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.rows || data.rows.length === 0) {
        return {
          views: 0,
          estimatedMinutesWatched: 0,
          averageViewDuration: 0,
          subscribersGained: 0,
          subscribersLost: 0,
          likes: 0,
          dislikes: 0,
          comments: 0,
          shares: 0,
        };
      }

      const row = data.rows[0];
      
      return {
        views: row[0] || 0,
        estimatedMinutesWatched: row[1] || 0,
        averageViewDuration: row[2] || 0,
        subscribersGained: row[3] || 0,
        subscribersLost: row[4] || 0,
        likes: row[5] || 0,
        dislikes: row[6] || 0,
        comments: row[7] || 0,
        shares: row[8] || 0,
      };
    } catch (error) {
      console.error('[YouTubeAPIService] Failed to get analytics:', error);
      throw error;
    }
  }

  /**
   * Get channel info
   */
  async getChannelInfo(accessToken: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseURL}/channels?part=snippet,statistics,brandingSettings&mine=true`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch channel info');
      }

      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        throw new Error('No channel found');
      }

      const channel = data.items[0];
      
      return {
        id: channel.id,
        title: channel.snippet.title,
        description: channel.snippet.description,
        customUrl: channel.snippet.customUrl,
        publishedAt: channel.snippet.publishedAt,
        thumbnailUrl: channel.snippet.thumbnails.default.url,
        subscriberCount: parseInt(channel.statistics.subscriberCount || '0', 10),
        videoCount: parseInt(channel.statistics.videoCount || '0', 10),
        viewCount: parseInt(channel.statistics.viewCount || '0', 10),
        country: channel.snippet.country,
        keywords: channel.brandingSettings?.channel?.keywords,
      };
    } catch (error) {
      console.error('[YouTubeAPIService] Failed to get channel info:', error);
      throw error;
    }
  }
}

export default new YouTubeAPIService();
