/**
 * TwitterAPIService - Real Twitter API v2 integration
 * Handles tweets, analytics, and engagement
 */

export interface Tweet {
  id: string;
  text: string;
  created_at: string;
  author_id: string;
  public_metrics: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
    impression_count?: number;
  };
  attachments?: {
    media_keys?: string[];
  };
}

export interface TwitterAnalytics {
  tweets: number;
  impressions: number;
  engagements: number;
  engagement_rate: number;
  followers: number;
  following: number;
}

export interface TweetOptions {
  text: string;
  media_ids?: string[];
  poll_options?: string[];
  poll_duration_minutes?: number;
  reply_to?: string;
  quote_tweet?: string;
}

class TwitterAPIService {
  private readonly baseURL = 'https://api.twitter.com/2';
  private readonly uploadURL = 'https://upload.twitter.com/1.1';

  /**
   * Post a tweet
   */
  async postTweet(accessToken: string, options: TweetOptions): Promise<Tweet> {
    try {
      const payload: any = {
        text: options.text,
      };

      if (options.media_ids && options.media_ids.length > 0) {
        payload.media = {
          media_ids: options.media_ids,
        };
      }

      if (options.poll_options && options.poll_options.length > 0) {
        payload.poll = {
          options: options.poll_options,
          duration_minutes: options.poll_duration_minutes || 1440,
        };
      }

      if (options.reply_to) {
        payload.reply = {
          in_reply_to_tweet_id: options.reply_to,
        };
      }

      if (options.quote_tweet) {
        payload.quote_tweet_id = options.quote_tweet;
      }

      const response = await fetch(`${this.baseURL}/tweets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to post tweet: ${JSON.stringify(error)}`);
      }

      const data = await response.json();
      console.log('[Twitter] Tweet posted:', data.data.id);
      return data.data;
    } catch (error) {
      console.error('[Twitter] Failed to post tweet:', error);
      throw error;
    }
  }

  /**
   * Upload media for tweet
   */
  async uploadMedia(accessToken: string, mediaData: Buffer | string, mediaType: 'image/jpeg' | 'image/png' | 'video/mp4'): Promise<string> {
    try {
      // Initialize upload
      const initResponse = await fetch(`${this.uploadURL}/media/upload.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          command: 'INIT',
          total_bytes: mediaData.length.toString(),
          media_type: mediaType,
        }).toString(),
      });

      if (!initResponse.ok) {
        throw new Error('Failed to initialize media upload');
      }

      const initData = await initResponse.json();
      const mediaId = initData.media_id_string;

      // Upload media
      const uploadResponse = await fetch(`${this.uploadURL}/media/upload.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: new FormData().append('command', 'APPEND').append('media_id', mediaId).append('media', mediaData).append('segment_index', '0'),
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload media');
      }

      // Finalize upload
      const finalizeResponse = await fetch(`${this.uploadURL}/media/upload.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          command: 'FINALIZE',
          media_id: mediaId,
        }).toString(),
      });

      if (!finalizeResponse.ok) {
        throw new Error('Failed to finalize media upload');
      }

      console.log('[Twitter] Media uploaded:', mediaId);
      return mediaId;
    } catch (error) {
      console.error('[Twitter] Media upload failed:', error);
      throw error;
    }
  }

  /**
   * Delete a tweet
   */
  async deleteTweet(accessToken: string, tweetId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/tweets/${tweetId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to delete tweet: ${JSON.stringify(error)}`);
      }

      console.log('[Twitter] Tweet deleted:', tweetId);
    } catch (error) {
      console.error('[Twitter] Failed to delete tweet:', error);
      throw error;
    }
  }

  /**
   * Get user's tweets
   */
  async getUserTweets(
    accessToken: string,
    userId: string,
    maxResults: number = 10
  ): Promise<Tweet[]> {
    try {
      const params = new URLSearchParams({
        'tweet.fields': 'created_at,public_metrics,attachments',
        'max_results': maxResults.toString(),
      });

      const response = await fetch(
        `${this.baseURL}/users/${userId}/tweets?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to get tweets: ${JSON.stringify(error)}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('[Twitter] Failed to get tweets:', error);
      throw error;
    }
  }

  /**
   * Get tweet by ID
   */
  async getTweet(accessToken: string, tweetId: string): Promise<Tweet> {
    try {
      const params = new URLSearchParams({
        'tweet.fields': 'created_at,public_metrics,attachments,author_id',
      });

      const response = await fetch(
        `${this.baseURL}/tweets/${tweetId}?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to get tweet: ${JSON.stringify(error)}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('[Twitter] Failed to get tweet:', error);
      throw error;
    }
  }

  /**
   * Like a tweet
   */
  async likeTweet(accessToken: string, userId: string, tweetId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/users/${userId}/likes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tweet_id: tweetId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to like tweet: ${JSON.stringify(error)}`);
      }

      console.log('[Twitter] Tweet liked:', tweetId);
    } catch (error) {
      console.error('[Twitter] Failed to like tweet:', error);
      throw error;
    }
  }

  /**
   * Unlike a tweet
   */
  async unlikeTweet(accessToken: string, userId: string, tweetId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/users/${userId}/likes/${tweetId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to unlike tweet: ${JSON.stringify(error)}`);
      }

      console.log('[Twitter] Tweet unliked:', tweetId);
    } catch (error) {
      console.error('[Twitter] Failed to unlike tweet:', error);
      throw error;
    }
  }

  /**
   * Retweet
   */
  async retweet(accessToken: string, userId: string, tweetId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/users/${userId}/retweets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tweet_id: tweetId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to retweet: ${JSON.stringify(error)}`);
      }

      console.log('[Twitter] Retweeted:', tweetId);
    } catch (error) {
      console.error('[Twitter] Failed to retweet:', error);
      throw error;
    }
  }

  /**
   * Get user analytics
   */
  async getUserAnalytics(accessToken: string, userId: string): Promise<TwitterAnalytics> {
    try {
      // Get user info
      const userResponse = await fetch(
        `${this.baseURL}/users/${userId}?user.fields=public_metrics`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!userResponse.ok) {
        throw new Error('Failed to get user info');
      }

      const userData = await userResponse.json();
      const metrics = userData.data.public_metrics;

      // Get recent tweets for engagement calculation
      const tweets = await this.getUserTweets(accessToken, userId, 100);
      
      let totalImpressions = 0;
      let totalEngagements = 0;

      tweets.forEach(tweet => {
        if (tweet.public_metrics) {
          totalImpressions += tweet.public_metrics.impression_count || 0;
          totalEngagements += 
            (tweet.public_metrics.retweet_count || 0) +
            (tweet.public_metrics.reply_count || 0) +
            (tweet.public_metrics.like_count || 0) +
            (tweet.public_metrics.quote_count || 0);
        }
      });

      const engagement_rate = totalImpressions > 0 
        ? (totalEngagements / totalImpressions) * 100 
        : 0;

      return {
        tweets: metrics.tweet_count,
        impressions: totalImpressions,
        engagements: totalEngagements,
        engagement_rate,
        followers: metrics.followers_count,
        following: metrics.following_count,
      };
    } catch (error) {
      console.error('[Twitter] Failed to get analytics:', error);
      throw error;
    }
  }

  /**
   * Search tweets
   */
  async searchTweets(
    accessToken: string,
    query: string,
    maxResults: number = 10
  ): Promise<Tweet[]> {
    try {
      const params = new URLSearchParams({
        query,
        'tweet.fields': 'created_at,public_metrics,author_id',
        'max_results': maxResults.toString(),
      });

      const response = await fetch(
        `${this.baseURL}/tweets/search/recent?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to search tweets: ${JSON.stringify(error)}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('[Twitter] Failed to search tweets:', error);
      throw error;
    }
  }
}

export default new TwitterAPIService();
