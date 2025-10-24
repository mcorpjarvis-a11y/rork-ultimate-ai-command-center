import { SOCIAL_PLATFORMS } from '@/config/api.config';
import APIClient from '@/services/core/APIClient';
import StorageManager from '@/services/storage/StorageManager';
import { SocialAccount, Content, PlatformStats } from '@/types/models.types';

export interface PostOptions {
  content: string;
  mediaUrls?: string[];
  scheduledFor?: number;
  hashtags?: string[];
  mentions?: string[];
  location?: string;
  autoOptimize?: boolean;
}

export interface SocialMetrics {
  followers: number;
  engagement: number;
  reach: number;
  impressions: number;
  clicks: number;
}

class SocialMediaService {
  private connectedAccounts: Map<string, SocialAccount>;

  constructor() {
    this.connectedAccounts = new Map();
    this.loadAccounts();
  }

  private async loadAccounts(): Promise<void> {
    try {
      const accounts = await StorageManager.get<SocialAccount[]>('social_accounts', []);
      if (accounts) {
        accounts.forEach(acc => this.connectedAccounts.set(acc.id, acc));
        console.log(`[SocialMediaService] Loaded ${accounts.length} connected accounts`);
      }
    } catch (error) {
      console.error('[SocialMediaService] Failed to load accounts:', error);
    }
  }

  private async saveAccounts(): Promise<void> {
    try {
      const accounts = Array.from(this.connectedAccounts.values());
      await StorageManager.set('social_accounts', accounts);
      console.log('[SocialMediaService] Saved accounts');
    } catch (error) {
      console.error('[SocialMediaService] Failed to save accounts:', error);
    }
  }

  async connectAccount(
    platform: string,
    credentials: { accessToken: string; refreshToken?: string; expiresAt?: number }
  ): Promise<SocialAccount> {
    console.log(`[SocialMediaService] Connecting ${platform} account`);

    const accountInfo = await this.fetchAccountInfo(platform, credentials.accessToken);

    const account: SocialAccount = {
      id: `${platform}_${accountInfo.id}`,
      platform,
      username: accountInfo.username,
      accountId: accountInfo.id,
      accessToken: credentials.accessToken,
      refreshToken: credentials.refreshToken,
      expiresAt: credentials.expiresAt,
      isActive: true,
      connectedAt: Date.now(),
      stats: {
        followers: accountInfo.followers || 0,
        following: accountInfo.following || 0,
        posts: accountInfo.posts || 0,
        engagement: 0,
        reach: 0,
        lastUpdated: Date.now(),
      },
      permissions: accountInfo.permissions || [],
    };

    this.connectedAccounts.set(account.id, account);
    await this.saveAccounts();

    console.log(`[SocialMediaService] Connected ${platform} account: ${account.username}`);
    return account;
  }

  async disconnectAccount(accountId: string): Promise<void> {
    console.log(`[SocialMediaService] Disconnecting account ${accountId}`);
    this.connectedAccounts.delete(accountId);
    await this.saveAccounts();
  }

  async refreshToken(accountId: string): Promise<void> {
    const account = this.connectedAccounts.get(accountId);
    if (!account || !account.refreshToken) {
      throw new Error('Account not found or no refresh token available');
    }

    console.log(`[SocialMediaService] Refreshing token for ${accountId}`);

    const platformConfig = SOCIAL_PLATFORMS[account.platform as keyof typeof SOCIAL_PLATFORMS];
    if (!platformConfig) {
      throw new Error(`Platform ${account.platform} not supported`);
    }

    const response = await APIClient.post<{ access_token: string; expires_in: number }>(
      `${platformConfig.baseURL}/oauth/token`,
      {
        grant_type: 'refresh_token',
        refresh_token: account.refreshToken,
      }
    );

    if (response.success && response.data) {
      account.accessToken = response.data.access_token;
      account.expiresAt = Date.now() + response.data.expires_in * 1000;
      await this.saveAccounts();
      console.log(`[SocialMediaService] Token refreshed for ${accountId}`);
    }
  }

  async post(accountId: string, options: PostOptions): Promise<Content> {
    const account = this.connectedAccounts.get(accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    console.log(`[SocialMediaService] Posting to ${account.platform} as ${account.username}`);

    if (account.expiresAt && account.expiresAt < Date.now()) {
      await this.refreshToken(accountId);
    }

    const platformConfig = SOCIAL_PLATFORMS[account.platform as keyof typeof SOCIAL_PLATFORMS];
    if (!platformConfig) {
      throw new Error(`Platform ${account.platform} not supported`);
    }

    const optimizedContent = options.autoOptimize
      ? await this.optimizeForPlatform(options.content, account.platform)
      : options.content;

    const postData = this.formatPostData(account.platform, {
      ...options,
      content: optimizedContent,
    });

    const response = await APIClient.post(
      `${platformConfig.baseURL}/posts`,
      postData,
      {
        headers: {
          Authorization: `Bearer ${account.accessToken}`,
        },
      }
    );

    if (!response.success) {
      throw new Error(`Failed to post to ${account.platform}: ${response.error?.message}`);
    }

    const content: Content = {
      id: response.data.id,
      title: options.content.substring(0, 100),
      description: options.content,
      type: options.mediaUrls && options.mediaUrls.length > 0 ? 'mixed' : 'text',
      status: options.scheduledFor ? 'scheduled' : 'published',
      platforms: [account.platform],
      mediaUrls: options.mediaUrls || [],
      tags: options.hashtags || [],
      category: 'social',
      aiGenerated: false,
      performance: {
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        saves: 0,
        clicks: 0,
        engagement: 0,
        reach: 0,
        revenue: 0,
        ctr: 0,
        conversionRate: 0,
        platformStats: {},
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
      publishedAt: options.scheduledFor || Date.now(),
      metadata: {
        accountId,
        platform: account.platform,
      },
    };

    console.log(`[SocialMediaService] Posted successfully: ${content.id}`);
    return content;
  }

  async getMetrics(accountId: string): Promise<SocialMetrics> {
    const account = this.connectedAccounts.get(accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    console.log(`[SocialMediaService] Fetching metrics for ${account.platform}`);

    if (account.expiresAt && account.expiresAt < Date.now()) {
      await this.refreshToken(accountId);
    }

    const platformConfig = SOCIAL_PLATFORMS[account.platform as keyof typeof SOCIAL_PLATFORMS];
    if (!platformConfig) {
      throw new Error(`Platform ${account.platform} not supported`);
    }

    const response = await APIClient.get<SocialMetrics>(
      `${platformConfig.baseURL}/insights`,
      {
        headers: {
          Authorization: `Bearer ${account.accessToken}`,
        },
      }
    );

    if (!response.success || !response.data) {
      throw new Error(`Failed to fetch metrics: ${response.error?.message}`);
    }

    account.stats = {
      ...account.stats,
      followers: response.data.followers,
      engagement: response.data.engagement,
      reach: response.data.reach,
      lastUpdated: Date.now(),
    };

    await this.saveAccounts();

    return response.data;
  }

  async getContentPerformance(accountId: string, contentId: string): Promise<PlatformStats> {
    const account = this.connectedAccounts.get(accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    console.log(`[SocialMediaService] Fetching performance for content ${contentId}`);

    if (account.expiresAt && account.expiresAt < Date.now()) {
      await this.refreshToken(accountId);
    }

    const platformConfig = SOCIAL_PLATFORMS[account.platform as keyof typeof SOCIAL_PLATFORMS];
    if (!platformConfig) {
      throw new Error(`Platform ${account.platform} not supported`);
    }

    const response = await APIClient.get<any>(
      `${platformConfig.baseURL}/posts/${contentId}/insights`,
      {
        headers: {
          Authorization: `Bearer ${account.accessToken}`,
        },
      }
    );

    if (!response.success || !response.data) {
      throw new Error(`Failed to fetch content performance: ${response.error?.message}`);
    }

    const stats: PlatformStats = {
      platform: account.platform,
      views: response.data.views || 0,
      engagement: response.data.engagement || 0,
      revenue: response.data.revenue || 0,
      trending: response.data.trending || false,
      viralScore: response.data.viral_score || 0,
    };

    return stats;
  }

  async deletePost(accountId: string, postId: string): Promise<void> {
    const account = this.connectedAccounts.get(accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    console.log(`[SocialMediaService] Deleting post ${postId} from ${account.platform}`);

    if (account.expiresAt && account.expiresAt < Date.now()) {
      await this.refreshToken(accountId);
    }

    const platformConfig = SOCIAL_PLATFORMS[account.platform as keyof typeof SOCIAL_PLATFORMS];
    if (!platformConfig) {
      throw new Error(`Platform ${account.platform} not supported`);
    }

    const response = await APIClient.delete(
      `${platformConfig.baseURL}/posts/${postId}`,
      {
        headers: {
          Authorization: `Bearer ${account.accessToken}`,
        },
      }
    );

    if (!response.success) {
      throw new Error(`Failed to delete post: ${response.error?.message}`);
    }

    console.log(`[SocialMediaService] Post deleted successfully`);
  }

  async crossPost(content: Content, accountIds: string[]): Promise<Record<string, Content>> {
    console.log(`[SocialMediaService] Cross-posting to ${accountIds.length} platforms`);

    const results: Record<string, Content> = {};

    await Promise.allSettled(
      accountIds.map(async (accountId) => {
        try {
          const account = this.connectedAccounts.get(accountId);
          if (!account) {
            throw new Error(`Account ${accountId} not found`);
          }

          const variation = {
            platform: account.platform,
            content: content.description,
            mediaUrls: content.mediaUrls,
            hashtags: content.tags,
            mentions: [],
            optimized: false,
          };

          const posted = await this.post(accountId, {
            content: variation.content,
            mediaUrls: variation.mediaUrls,
            hashtags: variation.hashtags,
            mentions: variation.mentions,
            autoOptimize: true,
          });

          results[accountId] = posted;
        } catch (error) {
          console.error(`[SocialMediaService] Failed to post to ${accountId}:`, error);
        }
      })
    );

    return results;
  }

  private async optimizeForPlatform(content: string, platform: string): Promise<string> {
    console.log(`[SocialMediaService] Optimizing content for ${platform}`);

    const limits: Record<string, number> = {
      twitter: 280,
      instagram: 2200,
      facebook: 63206,
      linkedin: 3000,
      tiktok: 2200,
      youtube: 5000,
    };

    const limit = limits[platform] || 1000;

    if (content.length > limit) {
      return content.substring(0, limit - 3) + '...';
    }

    return content;
  }

  private formatPostData(platform: string, options: PostOptions): any {
    const base = {
      text: options.content,
      media: options.mediaUrls,
    };

    switch (platform) {
      case 'twitter':
        return {
          ...base,
          status: options.content,
        };
      case 'instagram':
        return {
          ...base,
          caption: options.content,
          location: options.location,
        };
      case 'facebook':
        return {
          ...base,
          message: options.content,
          published: !options.scheduledFor,
        };
      case 'linkedin':
        return {
          ...base,
          commentary: options.content,
        };
      case 'tiktok':
        return {
          ...base,
          description: options.content,
          hashtags: options.hashtags,
        };
      default:
        return base;
    }
  }

  private async fetchAccountInfo(
    platform: string,
    accessToken: string
  ): Promise<{ id: string; username: string; followers?: number; following?: number; posts?: number; permissions?: string[] }> {
    const platformConfig = SOCIAL_PLATFORMS[platform as keyof typeof SOCIAL_PLATFORMS];
    if (!platformConfig) {
      throw new Error(`Platform ${platform} not supported`);
    }

    const response = await APIClient.get(
      `${platformConfig.baseURL}/me`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.success || !response.data) {
      throw new Error(`Failed to fetch account info: ${response.error?.message}`);
    }

    return {
      id: response.data.id,
      username: response.data.username || response.data.name,
      followers: response.data.followers_count,
      following: response.data.following_count,
      posts: response.data.media_count || response.data.statuses_count,
      permissions: response.data.permissions,
    };
  }

  getConnectedAccounts(): SocialAccount[] {
    return Array.from(this.connectedAccounts.values());
  }

  getAccountById(id: string): SocialAccount | undefined {
    return this.connectedAccounts.get(id);
  }

  getAccountsByPlatform(platform: string): SocialAccount[] {
    return this.getConnectedAccounts().filter(acc => acc.platform === platform);
  }

  isConnected(platform: string): boolean {
    return this.getAccountsByPlatform(platform).length > 0;
  }
}

export default new SocialMediaService();
