import APIClient from '@/services/core/APIClient';
import StorageManager from '@/services/storage/StorageManager';
import AIService from '@/services/ai/AIService';
import { Content, ScheduledPost, MediaAsset } from '@/types/models.types';
import { PaginatedResponse } from '@/types/api.types';

export interface ContentFilter {
  status?: Content['status'][];
  type?: Content['type'][];
  platforms?: string[];
  tags?: string[];
  search?: string;
  dateRange?: { start: number; end: number };
}

export interface ContentScheduleOptions {
  content: Content;
  platforms: string[];
  scheduledFor: number;
  autoOptimize?: boolean;
  timezone?: string;
}

class ContentService {
  private contentCache: Map<string, Content>;
  private scheduledPosts: Map<string, ScheduledPost>;

  constructor() {
    this.contentCache = new Map();
    this.scheduledPosts = new Map();
    this.loadScheduledPosts();
  }

  private async loadScheduledPosts(): Promise<void> {
    try {
      const posts = await StorageManager.get<ScheduledPost[]>('scheduled_posts', []);
      if (posts) {
        posts.forEach(post => this.scheduledPosts.set(post.id, post));
        console.log(`[ContentService] Loaded ${posts.length} scheduled posts`);
      }
    } catch (error) {
      console.error('[ContentService] Failed to load scheduled posts:', error);
    }
  }

  private async saveScheduledPosts(): Promise<void> {
    try {
      const posts = Array.from(this.scheduledPosts.values());
      await StorageManager.set('scheduled_posts', posts);
    } catch (error) {
      console.error('[ContentService] Failed to save scheduled posts:', error);
    }
  }

  async createContent(
    title: string,
    description: string,
    options: {
      type?: Content['type'];
      platforms?: string[];
      mediaUrls?: string[];
      tags?: string[];
      category?: string;
      aiGenerated?: boolean;
    } = {}
  ): Promise<Content> {
    console.log(`[ContentService] Creating content: ${title}`);

    const content: Content = {
      id: `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      description,
      type: options.type || 'text',
      status: 'draft',
      platforms: options.platforms || [],
      mediaUrls: options.mediaUrls || [],
      tags: options.tags || [],
      category: options.category || 'general',
      aiGenerated: options.aiGenerated || false,
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
      metadata: {},
    };

    this.contentCache.set(content.id, content);

    try {
      const response = await APIClient.post<Content>('/content', content);
      if (response.success && response.data) {
        this.contentCache.set(response.data.id, response.data);
        return response.data;
      }
    } catch (error) {
      console.error('[ContentService] Error creating content:', error);
    }

    return content;
  }

  async updateContent(
    id: string,
    updates: Partial<Content>
  ): Promise<Content> {
    console.log(`[ContentService] Updating content: ${id}`);

    const existing = this.contentCache.get(id);
    if (!existing) {
      throw new Error('Content not found');
    }

    const updated: Content = {
      ...existing,
      ...updates,
      id: existing.id,
      updatedAt: Date.now(),
    };

    this.contentCache.set(id, updated);

    try {
      const response = await APIClient.put<Content>(`/content/${id}`, updated);
      if (response.success && response.data) {
        this.contentCache.set(response.data.id, response.data);
        return response.data;
      }
    } catch (error) {
      console.error('[ContentService] Error updating content:', error);
    }

    return updated;
  }

  async deleteContent(id: string): Promise<void> {
    console.log(`[ContentService] Deleting content: ${id}`);

    this.contentCache.delete(id);

    try {
      await APIClient.delete(`/content/${id}`);
    } catch (error) {
      console.error('[ContentService] Error deleting content:', error);
    }
  }

  async getContent(id: string): Promise<Content | undefined> {
    if (this.contentCache.has(id)) {
      return this.contentCache.get(id);
    }

    try {
      const response = await APIClient.get<Content>(`/content/${id}`);
      if (response.success && response.data) {
        this.contentCache.set(response.data.id, response.data);
        return response.data;
      }
    } catch (error) {
      console.error('[ContentService] Error fetching content:', error);
    }

    return undefined;
  }

  async listContent(
    filter: ContentFilter = {},
    page: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedResponse<Content>> {
    console.log('[ContentService] Listing content with filters');

    try {
      const response = await APIClient.post<PaginatedResponse<Content>>(
        `/content/list?page=${page}&pageSize=${pageSize}`,
        filter
      );

      if (response.success && response.data) {
        response.data.items.forEach(content => {
          this.contentCache.set(content.id, content);
        });
        return response.data;
      }
    } catch (error) {
      console.error('[ContentService] Error listing content:', error);
    }

    return {
      items: Array.from(this.contentCache.values()),
      total: this.contentCache.size,
      page,
      pageSize,
      hasMore: false,
    };
  }

  async scheduleContent(options: ContentScheduleOptions): Promise<ScheduledPost> {
    console.log(`[ContentService] Scheduling content: ${options.content.id}`);

    const variations: Record<string, any> = {};
    
    for (const platform of options.platforms) {
      variations[platform] = {
        platform,
        content: options.content.description,
        mediaUrls: options.content.mediaUrls,
        hashtags: options.content.tags,
        mentions: [],
        optimized: options.autoOptimize || false,
      };
    }

    const scheduledPost: ScheduledPost = {
      id: `scheduled_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      contentId: options.content.id,
      platforms: options.platforms,
      scheduledFor: options.scheduledFor,
      status: 'pending',
      variations,
      autoOptimize: options.autoOptimize || false,
      retryAttempts: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.scheduledPosts.set(scheduledPost.id, scheduledPost);
    await this.saveScheduledPosts();

    try {
      const response = await APIClient.post<ScheduledPost>('/content/schedule', scheduledPost);
      if (response.success && response.data) {
        this.scheduledPosts.set(response.data.id, response.data);
        await this.saveScheduledPosts();
        return response.data;
      }
    } catch (error) {
      console.error('[ContentService] Error scheduling content:', error);
    }

    return scheduledPost;
  }

  async cancelScheduledPost(id: string): Promise<void> {
    console.log(`[ContentService] Canceling scheduled post: ${id}`);

    const post = this.scheduledPosts.get(id);
    if (post) {
      post.status = 'cancelled';
      post.updatedAt = Date.now();
      await this.saveScheduledPosts();
    }

    try {
      await APIClient.delete(`/content/schedule/${id}`);
    } catch (error) {
      console.error('[ContentService] Error canceling scheduled post:', error);
    }
  }

  async generateContentWithAI(
    prompt: string,
    options: {
      type?: 'text' | 'image' | 'video' | 'audio';
      platform?: string;
      style?: string;
      length?: 'short' | 'medium' | 'long';
    } = {}
  ): Promise<Content> {
    console.log('[ContentService] Generating content with AI');

    const result = await AIService.generateContent({
      prompt,
      type: options.type || 'text',
      platform: options.platform,
      style: options.style,
      length: options.length,
    });

    return this.createContent(
      result.content.substring(0, 100),
      result.content,
      {
        type: options.type || 'text',
        platforms: options.platform ? [options.platform] : [],
        tags: result.metadata.hashtags || [],
        aiGenerated: true,
      }
    );
  }

  async optimizeContent(
    id: string,
    platform: string,
    objective: string
  ): Promise<Content> {
    console.log(`[ContentService] Optimizing content ${id} for ${platform}`);

    const content = await this.getContent(id);
    if (!content) {
      throw new Error('Content not found');
    }

    const result = await AIService.optimizeContent(
      content.description,
      platform,
      objective
    );

    return this.updateContent(id, {
      description: result.optimizedContent,
      metadata: {
        ...content.metadata,
        optimizations: {
          platform,
          objective,
          improvements: result.improvements,
          expectedImprovement: result.expectedImprovement,
          optimizedAt: Date.now(),
        },
      },
    });
  }

  async duplicateContent(id: string): Promise<Content> {
    const original = await this.getContent(id);
    if (!original) {
      throw new Error('Content not found');
    }

    return this.createContent(
      `${original.title} (Copy)`,
      original.description,
      {
        type: original.type,
        platforms: original.platforms,
        mediaUrls: original.mediaUrls,
        tags: original.tags,
        category: original.category,
        aiGenerated: original.aiGenerated,
      }
    );
  }

  async uploadMedia(
    file: File | { uri: string; type: string; name: string },
    metadata: {
      tags?: string[];
      description?: string;
    } = {}
  ): Promise<MediaAsset> {
    console.log('[ContentService] Uploading media file');

    const formData = new FormData();
    formData.append('file', file as any);
    formData.append('metadata', JSON.stringify(metadata));

    try {
      const response = await fetch(`${APIClient['baseURL']}/media/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Media upload failed');
      }

      const data = await response.json();
      
      const asset: MediaAsset = {
        id: data.id,
        name: data.name,
        type: data.type,
        format: data.format,
        size: data.size,
        url: data.url,
        thumbnailUrl: data.thumbnailUrl,
        duration: data.duration,
        dimensions: data.dimensions,
        metadata: data.metadata || {},
        tags: metadata.tags || [],
        aiGenerated: false,
        storageProvider: data.storageProvider || 'local',
        isPublic: true,
        uploadedAt: Date.now(),
        usageCount: 0,
      };

      console.log('[ContentService] Media uploaded successfully:', asset.id);
      return asset;
    } catch (error) {
      console.error('[ContentService] Error uploading media:', error);
      throw error;
    }
  }

  async searchContent(query: string): Promise<Content[]> {
    console.log(`[ContentService] Searching content: ${query}`);

    try {
      const response = await APIClient.get<Content[]>(
        `/content/search?q=${encodeURIComponent(query)}`
      );

      if (response.success && response.data) {
        return response.data;
      }
    } catch (error) {
      console.error('[ContentService] Error searching content:', error);
    }

    return Array.from(this.contentCache.values()).filter(content =>
      content.title.toLowerCase().includes(query.toLowerCase()) ||
      content.description.toLowerCase().includes(query.toLowerCase()) ||
      content.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
  }

  getScheduledPosts(): ScheduledPost[] {
    return Array.from(this.scheduledPosts.values())
      .filter(post => post.status !== 'cancelled')
      .sort((a, b) => a.scheduledFor - b.scheduledFor);
  }

  getPendingPosts(): ScheduledPost[] {
    const now = Date.now();
    return this.getScheduledPosts().filter(
      post => post.status === 'pending' && post.scheduledFor <= now
    );
  }

  async batchCreateContent(contents: Array<{
    title: string;
    description: string;
    options?: any;
  }>): Promise<Content[]> {
    console.log(`[ContentService] Batch creating ${contents.length} pieces of content`);

    const results = await Promise.allSettled(
      contents.map(({ title, description, options }) =>
        this.createContent(title, description, options)
      )
    );

    return results
      .filter((r): r is PromiseFulfilledResult<Content> => r.status === 'fulfilled')
      .map(r => r.value);
  }

  async archiveContent(id: string): Promise<Content> {
    return this.updateContent(id, { status: 'archived' });
  }

  async publishContent(id: string): Promise<Content> {
    return this.updateContent(id, {
      status: 'published',
      publishedAt: Date.now(),
    });
  }

  clearCache(): void {
    this.contentCache.clear();
    console.log('[ContentService] Content cache cleared');
  }
}

export default new ContentService();
