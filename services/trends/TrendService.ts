import APIClient from '@/services/core/APIClient';
import CacheManager from '@/services/storage/CacheManager';
import AIService from '@/services/ai/AIService';
import { Trend } from '@/types/models.types';

export interface TrendSearchOptions {
  platform?: string;
  category?: string;
  region?: string;
  language?: string;
  limit?: number;
  minScore?: number;
}

export interface TrendAlert {
  id: string;
  trend: Trend;
  reason: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  actionable: boolean;
  recommendations: string[];
  createdAt: number;
}

class TrendService {
  private trends: Map<string, Trend>;
  private alerts: TrendAlert[];
  private monitoringIntervals: Map<string, ReturnType<typeof setInterval>>;

  constructor() {
    this.trends = new Map();
    this.alerts = [];
    this.monitoringIntervals = new Map();
  }

  async discoverTrends(options: TrendSearchOptions = {}): Promise<Trend[]> {
    console.log('[TrendService] Discovering trends...');

    const cacheKey = `trends:${JSON.stringify(options)}`;
    const cached = CacheManager.get<Trend[]>(cacheKey);

    if (cached) {
      console.log('[TrendService] Returning cached trends');
      return cached;
    }

    try {
      const response = await APIClient.post<Trend[]>('/trends/discover', options);

      if (response.success && response.data) {
        response.data.forEach(trend => this.trends.set(trend.id, trend));
        CacheManager.set(cacheKey, response.data, 5 * 60 * 1000);
        return response.data;
      }
    } catch (error) {
      console.error('[TrendService] Error discovering trends:', error);
    }

    return this.generateMockTrends(options);
  }

  async getTrendById(id: string): Promise<Trend | undefined> {
    if (this.trends.has(id)) {
      return this.trends.get(id);
    }

    try {
      const response = await APIClient.get<Trend>(`/trends/${id}`);
      if (response.success && response.data) {
        this.trends.set(response.data.id, response.data);
        return response.data;
      }
    } catch (error) {
      console.error('[TrendService] Error fetching trend:', error);
    }

    return undefined;
  }

  async analyzeTrend(trendId: string): Promise<{
    analysis: string;
    opportunities: string[];
    risks: string[];
    contentIdeas: string[];
    targetAudience: string[];
    bestPlatforms: string[];
  }> {
    console.log(`[TrendService] Analyzing trend: ${trendId}`);

    const trend = await this.getTrendById(trendId);
    if (!trend) {
      throw new Error('Trend not found');
    }

    const cacheKey = `trend_analysis:${trendId}`;
    const cached = CacheManager.get<any>(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const response = await APIClient.post(`/trends/${trendId}/analyze`, {});

      if (response.success && response.data) {
        CacheManager.set(cacheKey, response.data, 15 * 60 * 1000);
        return response.data;
      }
    } catch (error) {
      console.error('[TrendService] Error analyzing trend:', error);
    }

    return {
      analysis: `Trend "${trend.topic}" is ${trend.growth > 0 ? 'growing' : 'declining'} with a score of ${trend.score}/100`,
      opportunities: [
        'Create content before peak saturation',
        'Leverage related hashtags for visibility',
        'Cross-post across multiple platforms',
      ],
      risks: [
        'Trend may be short-lived',
        'High competition expected',
      ],
      contentIdeas: [
        `${trend.topic} tutorial`,
        `My take on ${trend.topic}`,
        `${trend.topic} explained`,
      ],
      targetAudience: ['Young adults', 'Tech enthusiasts'],
      bestPlatforms: [trend.platform, 'Instagram', 'TikTok'],
    };
  }

  async predictTrendTrajectory(
    topic: string,
    platform: string,
    days: number = 7
  ): Promise<{
    prediction: string;
    confidence: number;
    timeline: { date: number; score: number }[];
    recommendations: string[];
  }> {
    console.log(`[TrendService] Predicting trajectory for: ${topic}`);

    return AIService.predictTrend({
      topic,
      platform,
      timeframe: days,
    });
  }

  async monitorTrend(trendId: string, callback: (alert: TrendAlert) => void): Promise<() => void> {
    console.log(`[TrendService] Monitoring trend: ${trendId}`);

    const interval = setInterval(async () => {
      try {
        const trend = await this.getTrendById(trendId);
        if (!trend) return;

        const previousTrend = this.trends.get(trendId);
        if (!previousTrend) return;

        const scoreChange = trend.score - previousTrend.score;
        const growthChange = trend.growth - previousTrend.growth;

        if (Math.abs(scoreChange) > 10 || Math.abs(growthChange) > 20) {
          const alert: TrendAlert = {
            id: `alert_${Date.now()}`,
            trend,
            reason: scoreChange > 0 ? 'Significant growth detected' : 'Significant decline detected',
            urgency: Math.abs(scoreChange) > 20 ? 'high' : 'medium',
            actionable: true,
            recommendations: [
              scoreChange > 0 ? 'Create content immediately' : 'Pivot to related trends',
              'Monitor competitor activity',
            ],
            createdAt: Date.now(),
          };

          this.alerts.push(alert);
          callback(alert);
        }

        this.trends.set(trendId, trend);
      } catch (error) {
        console.error('[TrendService] Error monitoring trend:', error);
      }
    }, 60000);

    this.monitoringIntervals.set(trendId, interval);

    return () => this.stopMonitoring(trendId);
  }

  stopMonitoring(trendId: string): void {
    const interval = this.monitoringIntervals.get(trendId);
    if (interval) {
      clearInterval(interval);
      this.monitoringIntervals.delete(trendId);
      console.log(`[TrendService] Stopped monitoring: ${trendId}`);
    }
  }

  async searchTrendsByKeyword(keyword: string, options: TrendSearchOptions = {}): Promise<Trend[]> {
    console.log(`[TrendService] Searching trends: ${keyword}`);

    try {
      const response = await APIClient.get<Trend[]>(
        `/trends/search?q=${encodeURIComponent(keyword)}&${this.buildQueryString(options)}`
      );

      if (response.success && response.data) {
        response.data.forEach(trend => this.trends.set(trend.id, trend));
        return response.data;
      }
    } catch (error) {
      console.error('[TrendService] Error searching trends:', error);
    }

    return Array.from(this.trends.values()).filter(trend =>
      trend.topic.toLowerCase().includes(keyword.toLowerCase()) ||
      trend.hashtags.some(tag => tag.toLowerCase().includes(keyword.toLowerCase())) ||
      trend.keywords.some(kw => kw.toLowerCase().includes(keyword.toLowerCase()))
    );
  }

  async getViralOpportunities(platform?: string): Promise<Trend[]> {
    console.log('[TrendService] Finding viral opportunities...');

    const allTrends = await this.discoverTrends({
      platform,
      minScore: 70,
      limit: 20,
    });

    return allTrends
      .filter(trend => trend.prediction.viralPotential > 75)
      .sort((a, b) => b.prediction.viralPotential - a.prediction.viralPotential);
  }

  async compareTopics(topics: string[], platform: string): Promise<{
    comparison: Record<string, { score: number; growth: number; viralPotential: number }>;
    winner: string;
    recommendation: string;
  }> {
    console.log(`[TrendService] Comparing ${topics.length} topics`);

    const comparison: Record<string, any> = {};
    let winner = topics[0];
    let maxScore = 0;

    for (const topic of topics) {
      const trends = await this.searchTrendsByKeyword(topic, { platform, limit: 1 });
      if (trends.length > 0) {
        const trend = trends[0];
        comparison[topic] = {
          score: trend.score,
          growth: trend.growth,
          viralPotential: trend.prediction.viralPotential,
        };

        if (trend.score > maxScore) {
          maxScore = trend.score;
          winner = topic;
        }
      } else {
        comparison[topic] = {
          score: 0,
          growth: 0,
          viralPotential: 0,
        };
      }
    }

    return {
      comparison,
      winner,
      recommendation: `Focus on "${winner}" - it has the highest trend score and growth potential`,
    };
  }

  getAlerts(): TrendAlert[] {
    return this.alerts.sort((a, b) => b.createdAt - a.createdAt);
  }

  clearAlerts(): void {
    this.alerts = [];
    console.log('[TrendService] Alerts cleared');
  }

  stopAllMonitoring(): void {
    this.monitoringIntervals.forEach((interval) => clearInterval(interval));
    this.monitoringIntervals.clear();
    console.log('[TrendService] Stopped all monitoring');
  }

  private buildQueryString(options: TrendSearchOptions): string {
    const params: string[] = [];

    if (options.platform) params.push(`platform=${options.platform}`);
    if (options.category) params.push(`category=${options.category}`);
    if (options.region) params.push(`region=${options.region}`);
    if (options.language) params.push(`language=${options.language}`);
    if (options.limit) params.push(`limit=${options.limit}`);
    if (options.minScore) params.push(`minScore=${options.minScore}`);

    return params.join('&');
  }

  private generateMockTrends(options: TrendSearchOptions): Trend[] {
    const topics = [
      'AI Content Creation',
      'Viral Marketing',
      'Short Form Video',
      'Social Commerce',
      'Live Streaming',
      'Creator Economy',
      'NFT Integration',
      'Web3 Social',
    ];

    return topics.slice(0, options.limit || 10).map((topic, i) => ({
      id: `trend_${Date.now()}_${i}`,
      topic,
      platform: options.platform || 'TikTok',
      score: Math.floor(Math.random() * 40) + 60,
      volume: Math.floor(Math.random() * 1000000),
      sentiment: Math.random() * 2 - 1,
      growth: Math.random() * 100 - 20,
      relatedTopics: topics.filter(t => t !== topic).slice(0, 3),
      hashtags: [`#${topic.replace(/\s/g, '')}`, '#trending', '#viral'],
      keywords: topic.split(' '),
      firstSeen: Date.now() - Math.floor(Math.random() * 86400000),
      lastUpdated: Date.now(),
      prediction: {
        peakTime: Date.now() + Math.floor(Math.random() * 604800000),
        declineTime: Date.now() + Math.floor(Math.random() * 1209600000),
        viralPotential: Math.floor(Math.random() * 40) + 60,
      },
    }));
  }
}

export default new TrendService();
