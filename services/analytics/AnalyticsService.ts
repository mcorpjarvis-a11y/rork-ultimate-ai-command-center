import APIClient from '@/services/core/APIClient';
import CacheManager from '@/services/storage/CacheManager';
import { Analytics, TimeSeriesData, Insight, Content } from '@/types/models.types';

export interface AnalyticsQuery {
  period: 'hour' | 'day' | 'week' | 'month' | 'year';
  startDate: number;
  endDate: number;
  metrics?: string[];
  platforms?: string[];
  contentIds?: string[];
}

export interface RevenueMetrics {
  total: number;
  byPlatform: Record<string, number>;
  byContent: Record<string, number>;
  growth: number;
  forecast: TimeSeriesData[];
}

class AnalyticsService {
  private metricsCache: Map<string, number>;

  constructor() {
    this.metricsCache = new Map();
  }

  async getAnalytics(query: AnalyticsQuery): Promise<Analytics> {
    const cacheKey = `analytics:${JSON.stringify(query)}`;
    const cached = CacheManager.get<Analytics>(cacheKey);
    
    if (cached) {
      console.log('[AnalyticsService] Returning cached analytics');
      return cached;
    }

    console.log('[AnalyticsService] Fetching analytics...');

    try {
      const response = await APIClient.post<Analytics>('/analytics/query', query);

      if (!response.success || !response.data) {
        throw new Error('Failed to fetch analytics');
      }

      CacheManager.set(cacheKey, response.data, 5 * 60 * 1000);
      return response.data;
    } catch (error) {
      console.error('[AnalyticsService] Error fetching analytics:', error);
      return this.generateMockAnalytics(query);
    }
  }

  async getRevenueMetrics(query: Omit<AnalyticsQuery, 'metrics'>): Promise<RevenueMetrics> {
    console.log('[AnalyticsService] Fetching revenue metrics...');

    try {
      const response = await APIClient.post<RevenueMetrics>('/analytics/revenue', query);

      if (!response.success || !response.data) {
        throw new Error('Failed to fetch revenue metrics');
      }

      return response.data;
    } catch (error) {
      console.error('[AnalyticsService] Error fetching revenue metrics:', error);
      return this.generateMockRevenue(query);
    }
  }

  async trackEvent(
    event: string,
    properties: Record<string, any> = {},
    userId?: string
  ): Promise<void> {
    console.log(`[AnalyticsService] Tracking event: ${event}`);

    try {
      await APIClient.post('/analytics/events', {
        event,
        properties,
        userId,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('[AnalyticsService] Error tracking event:', error);
    }
  }

  async trackContentView(contentId: string, platform: string, userId?: string): Promise<void> {
    await this.trackEvent('content_view', {
      contentId,
      platform,
      userId,
    });

    this.incrementMetric(`content:${contentId}:views`);
    this.incrementMetric(`platform:${platform}:views`);
  }

  async trackEngagement(
    contentId: string,
    type: 'like' | 'comment' | 'share' | 'save',
    userId?: string
  ): Promise<void> {
    await this.trackEvent('content_engagement', {
      contentId,
      type,
      userId,
    });

    this.incrementMetric(`content:${contentId}:${type}s`);
  }

  async trackRevenue(
    amount: number,
    source: string,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    console.log(`[AnalyticsService] Tracking revenue: $${amount} from ${source}`);

    await this.trackEvent('revenue', {
      amount,
      source,
      ...metadata,
    });

    this.incrementMetric('total_revenue', amount);
    this.incrementMetric(`revenue:${source}`, amount);
  }

  async generateInsights(query: AnalyticsQuery): Promise<Insight[]> {
    console.log('[AnalyticsService] Generating insights...');

    const cacheKey = `insights:${JSON.stringify(query)}`;
    const cached = CacheManager.get<Insight[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const response = await APIClient.post<Insight[]>('/analytics/insights', query);

      if (!response.success || !response.data) {
        throw new Error('Failed to generate insights');
      }

      CacheManager.set(cacheKey, response.data, 10 * 60 * 1000);
      return response.data;
    } catch (error) {
      console.error('[AnalyticsService] Error generating insights:', error);
      return this.generateMockInsights();
    }
  }

  async predictPerformance(
    contentId: string,
    platform: string
  ): Promise<{
    predictedViews: number;
    predictedEngagement: number;
    confidence: number;
    timeline: TimeSeriesData[];
  }> {
    console.log(`[AnalyticsService] Predicting performance for ${contentId} on ${platform}`);

    try {
      const response = await APIClient.post('/analytics/predict', {
        contentId,
        platform,
      });

      if (!response.success || !response.data) {
        throw new Error('Failed to predict performance');
      }

      return response.data;
    } catch (error) {
      console.error('[AnalyticsService] Error predicting performance:', error);
      return {
        predictedViews: Math.floor(Math.random() * 100000),
        predictedEngagement: Math.random() * 10,
        confidence: Math.random() * 40 + 60,
        timeline: this.generateTimeSeriesData(7),
      };
    }
  }

  async compareContent(contentIds: string[]): Promise<{
    comparison: Record<string, any>;
    winner: string;
    insights: string[];
  }> {
    console.log(`[AnalyticsService] Comparing ${contentIds.length} pieces of content`);

    try {
      const response = await APIClient.post('/analytics/compare', {
        contentIds,
      });

      if (!response.success || !response.data) {
        throw new Error('Failed to compare content');
      }

      return response.data;
    } catch (error) {
      console.error('[AnalyticsService] Error comparing content:', error);
      return {
        comparison: {},
        winner: contentIds[0],
        insights: ['Insufficient data for comparison'],
      };
    }
  }

  async getAudienceInsights(platform?: string): Promise<{
    demographics: {
      age: Record<string, number>;
      gender: Record<string, number>;
      location: Record<string, number>;
    };
    interests: string[];
    behaviors: Record<string, number>;
    activeHours: number[];
  }> {
    console.log('[AnalyticsService] Fetching audience insights...');

    try {
      const response = await APIClient.get('/analytics/audience', {
        headers: platform ? { 'X-Platform': platform } : undefined,
      });

      if (!response.success || !response.data) {
        throw new Error('Failed to fetch audience insights');
      }

      return response.data;
    } catch (error) {
      console.error('[AnalyticsService] Error fetching audience insights:', error);
      return this.generateMockAudienceInsights();
    }
  }

  async getTopPerformingContent(
    limit: number = 10,
    period: 'day' | 'week' | 'month' = 'week'
  ): Promise<Content[]> {
    console.log(`[AnalyticsService] Fetching top ${limit} performing content`);

    try {
      const response = await APIClient.get<Content[]>(
        `/analytics/top-content?limit=${limit}&period=${period}`
      );

      if (!response.success || !response.data) {
        throw new Error('Failed to fetch top content');
      }

      return response.data;
    } catch (error) {
      console.error('[AnalyticsService] Error fetching top content:', error);
      return [];
    }
  }

  async getEngagementRate(contentId: string): Promise<number> {
    const views = this.metricsCache.get(`content:${contentId}:views`) || 0;
    const likes = this.metricsCache.get(`content:${contentId}:likes`) || 0;
    const comments = this.metricsCache.get(`content:${contentId}:comments`) || 0;
    const shares = this.metricsCache.get(`content:${contentId}:shares`) || 0;

    if (views === 0) return 0;

    return ((likes + comments + shares) / views) * 100;
  }

  async exportAnalytics(
    query: AnalyticsQuery,
    format: 'json' | 'csv' | 'pdf' = 'json'
  ): Promise<string> {
    console.log(`[AnalyticsService] Exporting analytics as ${format}`);

    try {
      const response = await APIClient.post<{ url: string }>(
        '/analytics/export',
        { ...query, format }
      );

      if (!response.success || !response.data) {
        throw new Error('Failed to export analytics');
      }

      return response.data.url;
    } catch (error) {
      console.error('[AnalyticsService] Error exporting analytics:', error);
      throw error;
    }
  }

  private incrementMetric(key: string, amount: number = 1): void {
    const current = this.metricsCache.get(key) || 0;
    this.metricsCache.set(key, current + amount);
  }

  private generateTimeSeriesData(days: number): TimeSeriesData[] {
    const data: TimeSeriesData[] = [];
    const now = Date.now();

    for (let i = 0; i < days; i++) {
      const timestamp = now - (days - i - 1) * 24 * 60 * 60 * 1000;
      const value = Math.floor(Math.random() * 10000) + 1000;
      const change = i > 0 ? value - data[i - 1].value : 0;
      const changePercent = i > 0 ? (change / data[i - 1].value) * 100 : 0;

      data.push({
        timestamp,
        value,
        change,
        changePercent,
      });
    }

    return data;
  }

  private generateMockAnalytics(query: AnalyticsQuery): Analytics {
    return {
      period: query.period,
      startDate: query.startDate,
      endDate: query.endDate,
      metrics: {
        revenue: this.generateTimeSeriesData(30),
        views: this.generateTimeSeriesData(30),
        engagement: this.generateTimeSeriesData(30),
        growth: this.generateTimeSeriesData(30),
        content: this.generateTimeSeriesData(30),
        ai_usage: this.generateTimeSeriesData(30),
      },
      topContent: [],
      topPlatforms: [],
      insights: this.generateMockInsights(),
    };
  }

  private generateMockRevenue(query: Omit<AnalyticsQuery, 'metrics'>): RevenueMetrics {
    return {
      total: Math.floor(Math.random() * 100000),
      byPlatform: {
        youtube: Math.floor(Math.random() * 40000),
        tiktok: Math.floor(Math.random() * 30000),
        instagram: Math.floor(Math.random() * 20000),
        twitter: Math.floor(Math.random() * 10000),
      },
      byContent: {},
      growth: Math.random() * 50 - 10,
      forecast: this.generateTimeSeriesData(30),
    };
  }

  private generateMockInsights(): Insight[] {
    return [
      {
        id: 'insight_1',
        type: 'positive',
        title: 'Strong Growth Trend',
        description: 'Your engagement has increased by 45% this week',
        recommendation: 'Continue posting at current frequency',
        impact: 'high',
        actionable: true,
        actions: [
          {
            id: 'action_1',
            label: 'View Details',
            type: 'navigate',
            payload: { screen: 'Analytics' },
          },
        ],
        createdAt: Date.now(),
      },
      {
        id: 'insight_2',
        type: 'warning',
        title: 'Declining Reach',
        description: 'Your reach has decreased by 15% compared to last week',
        recommendation: 'Consider posting during peak hours (6-9 PM)',
        impact: 'medium',
        actionable: true,
        createdAt: Date.now(),
      },
      {
        id: 'insight_3',
        type: 'neutral',
        title: 'Audience Preference',
        description: 'Video content performs 3x better than images',
        recommendation: 'Increase video content production',
        impact: 'high',
        actionable: true,
        createdAt: Date.now(),
      },
    ];
  }

  private generateMockAudienceInsights() {
    return {
      demographics: {
        age: {
          '18-24': 25,
          '25-34': 40,
          '35-44': 20,
          '45-54': 10,
          '55+': 5,
        },
        gender: {
          male: 45,
          female: 52,
          other: 3,
        },
        location: {
          'United States': 35,
          'United Kingdom': 15,
          Canada: 12,
          Australia: 10,
          Other: 28,
        },
      },
      interests: [
        'Technology',
        'Entertainment',
        'Business',
        'Lifestyle',
        'Gaming',
        'Travel',
        'Food',
      ],
      behaviors: {
        mobile: 75,
        desktop: 20,
        tablet: 5,
      },
      activeHours: [0, 0, 0, 0, 0, 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 45, 40, 35, 30, 25, 15, 5, 0],
    };
  }

  getMetric(key: string): number {
    return this.metricsCache.get(key) || 0;
  }

  clearMetrics(): void {
    this.metricsCache.clear();
    console.log('[AnalyticsService] Metrics cache cleared');
  }
}

export default new AnalyticsService();
