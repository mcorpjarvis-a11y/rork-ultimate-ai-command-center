import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Competitor {
  id: string;
  name: string;
  username: string;
  platform: string;
  followers: number;
  followersGrowth: number;
  engagementRate: number;
  avgLikes: number;
  avgComments: number;
  postsPerWeek: number;
  estimatedRevenue: number;
  niche: string;
  status: 'ahead' | 'close' | 'behind';
  avatarUrl?: string;
  lastChecked: number;
  tracking: boolean;
}

export interface CompetitorAlert {
  id: string;
  competitorId: string;
  competitorName: string;
  type: 'follower_spike' | 'viral_post' | 'new_content' | 'engagement_drop' | 'strategy_change';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: number;
  read: boolean;
}

export interface CompetitorInsight {
  id: string;
  competitorId: string;
  competitorName: string;
  category: 'content_strategy' | 'posting_schedule' | 'engagement' | 'monetization' | 'growth';
  insight: string;
  recommendation: string;
  impact: 'low' | 'medium' | 'high';
  timestamp: number;
}

export interface CompetitorAnalysis {
  totalCompetitors: number;
  averageFollowers: number;
  averageEngagement: number;
  marketPosition: 'leader' | 'contender' | 'challenger' | 'follower';
  threatsIdentified: number;
  opportunitiesFound: number;
}

class CompetitorRadarService {
  private static instance: CompetitorRadarService;
  private competitors: Competitor[] = [];
  private alerts: CompetitorAlert[] = [];
  private insights: CompetitorInsight[] = [];
  private STORAGE_KEY = 'jarvis_competitor_radar';
  private monitoring: boolean = false;

  private constructor() {
    this.loadState();
    this.initializeSampleData();
    this.startMonitoring();
  }

  static getInstance(): CompetitorRadarService {
    if (!CompetitorRadarService.instance) {
      CompetitorRadarService.instance = new CompetitorRadarService();
    }
    return CompetitorRadarService.instance;
  }

  private async loadState(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.competitors = data.competitors || [];
        this.alerts = data.alerts || [];
        this.insights = data.insights || [];
        this.monitoring = data.monitoring || false;
        console.log('[CompetitorRadar] State loaded successfully');
      }
    } catch (error) {
      console.error('[CompetitorRadar] Failed to load state:', error);
    }
  }

  private async saveState(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify({
        competitors: this.competitors,
        alerts: this.alerts,
        insights: this.insights,
        monitoring: this.monitoring,
      }));
      console.log('[CompetitorRadar] State saved successfully');
    } catch (error) {
      console.error('[CompetitorRadar] Failed to save state:', error);
    }
  }

  private initializeSampleData(): void {
    if (this.competitors.length === 0) {
      this.competitors = [
        {
          id: '1',
          name: 'Sarah Johnson',
          username: '@sarahjfitness',
          platform: 'Instagram',
          followers: 450000,
          followersGrowth: 15.2,
          engagementRate: 6.8,
          avgLikes: 28000,
          avgComments: 1200,
          postsPerWeek: 5,
          estimatedRevenue: 18000,
          niche: 'Fitness & Wellness',
          status: 'ahead',
          lastChecked: Date.now(),
          tracking: true,
        },
        {
          id: '2',
          name: 'TechReviewer Pro',
          username: '@techreviewpro',
          platform: 'YouTube',
          followers: 285000,
          followersGrowth: 8.5,
          engagementRate: 5.2,
          avgLikes: 12000,
          avgComments: 850,
          postsPerWeek: 3,
          estimatedRevenue: 12500,
          niche: 'Technology',
          status: 'close',
          lastChecked: Date.now(),
          tracking: true,
        },
        {
          id: '3',
          name: 'Creative Mike',
          username: '@creativemike',
          platform: 'TikTok',
          followers: 1200000,
          followersGrowth: 22.8,
          engagementRate: 12.5,
          avgLikes: 145000,
          avgComments: 8500,
          postsPerWeek: 7,
          estimatedRevenue: 35000,
          niche: 'Entertainment',
          status: 'ahead',
          lastChecked: Date.now(),
          tracking: true,
        },
        {
          id: '4',
          name: 'Cooking with Emma',
          username: '@cookingwithemma',
          platform: 'Instagram',
          followers: 180000,
          followersGrowth: 5.3,
          engagementRate: 4.2,
          avgLikes: 7200,
          avgComments: 420,
          postsPerWeek: 4,
          estimatedRevenue: 6500,
          niche: 'Food & Cooking',
          status: 'behind',
          lastChecked: Date.now(),
          tracking: true,
        },
      ];
    }

    if (this.alerts.length === 0) {
      this.alerts = [
        {
          id: '1',
          competitorId: '1',
          competitorName: 'Sarah Johnson',
          type: 'follower_spike',
          severity: 'high',
          message: 'Gained 15K followers in 24 hours after posting viral workout video',
          timestamp: Date.now() - 2 * 60 * 60 * 1000,
          read: false,
        },
        {
          id: '2',
          competitorId: '3',
          competitorName: 'Creative Mike',
          type: 'viral_post',
          severity: 'critical',
          message: 'Latest TikTok reached 5M views in 6 hours - trending #1 in Entertainment',
          timestamp: Date.now() - 5 * 60 * 60 * 1000,
          read: false,
        },
        {
          id: '3',
          competitorId: '2',
          competitorName: 'TechReviewer Pro',
          type: 'new_content',
          severity: 'medium',
          message: 'Launched new video series covering AI tools - high engagement',
          timestamp: Date.now() - 24 * 60 * 60 * 1000,
          read: true,
        },
      ];
    }

    if (this.insights.length === 0) {
      this.insights = [
        {
          id: '1',
          competitorId: '1',
          competitorName: 'Sarah Johnson',
          category: 'posting_schedule',
          insight: 'Posts consistently at 6 AM and 6 PM EST, achieving 40% higher engagement',
          recommendation: 'Test posting at these times to capture peak audience activity',
          impact: 'high',
          timestamp: Date.now(),
        },
        {
          id: '2',
          competitorId: '3',
          competitorName: 'Creative Mike',
          category: 'content_strategy',
          insight: 'Short-form videos (15-30 seconds) perform 3x better than longer content',
          recommendation: 'Shift content strategy to focus on quick, punchy videos',
          impact: 'high',
          timestamp: Date.now(),
        },
        {
          id: '3',
          competitorId: '2',
          competitorName: 'TechReviewer Pro',
          category: 'monetization',
          insight: 'Successfully launched membership program generating $8K/month additional revenue',
          recommendation: 'Consider implementing similar membership/subscription model',
          impact: 'medium',
          timestamp: Date.now(),
        },
      ];
    }
  }

  private startMonitoring(): void {
    if (this.monitoring) return;
    
    this.monitoring = true;
    
    // Simulate real-time monitoring
    setInterval(() => {
      this.updateCompetitorData();
      this.checkForAlerts();
      this.generateInsights();
    }, 30000); // Check every 30 seconds
  }

  private async updateCompetitorData(): Promise<void> {
    this.competitors = this.competitors.map(competitor => ({
      ...competitor,
      followers: competitor.followers + Math.floor(Math.random() * 100),
      avgLikes: Math.floor(competitor.avgLikes * (1 + (Math.random() - 0.5) * 0.1)),
      lastChecked: Date.now(),
    }));
    await this.saveState();
  }

  private async checkForAlerts(): Promise<void> {
    // Randomly generate alerts (5% chance)
    if (Math.random() < 0.05 && this.competitors.length > 0) {
      const randomCompetitor = this.competitors[Math.floor(Math.random() * this.competitors.length)];
      const alertTypes: CompetitorAlert['type'][] = ['follower_spike', 'viral_post', 'new_content', 'strategy_change'];
      const severities: CompetitorAlert['severity'][] = ['low', 'medium', 'high', 'critical'];
      
      const alert: CompetitorAlert = {
        id: Date.now().toString(),
        competitorId: randomCompetitor.id,
        competitorName: randomCompetitor.name,
        type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        message: `New activity detected from ${randomCompetitor.name}`,
        timestamp: Date.now(),
        read: false,
      };

      this.alerts.unshift(alert);
      await this.saveState();
      console.log(`[CompetitorRadar] 🚨 Alert: ${alert.message}`);
    }
  }

  private async generateInsights(): Promise<void> {
    // Randomly generate insights (3% chance)
    if (Math.random() < 0.03 && this.competitors.length > 0) {
      const randomCompetitor = this.competitors[Math.floor(Math.random() * this.competitors.length)];
      const categories: CompetitorInsight['category'][] = ['content_strategy', 'posting_schedule', 'engagement', 'monetization', 'growth'];
      
      const insight: CompetitorInsight = {
        id: Date.now().toString(),
        competitorId: randomCompetitor.id,
        competitorName: randomCompetitor.name,
        category: categories[Math.floor(Math.random() * categories.length)],
        insight: `AI detected pattern in ${randomCompetitor.name}'s strategy`,
        recommendation: 'Analyze and adapt this strategy to your content',
        impact: 'high',
        timestamp: Date.now(),
      };

      this.insights.unshift(insight);
      await this.saveState();
      console.log(`[CompetitorRadar] 💡 Insight: ${insight.insight}`);
    }
  }

  async addCompetitor(
    name: string,
    username: string,
    platform: string,
    niche: string
  ): Promise<Competitor> {
    const competitor: Competitor = {
      id: Date.now().toString(),
      name,
      username,
      platform,
      followers: Math.floor(Math.random() * 500000) + 10000,
      followersGrowth: Math.random() * 20,
      engagementRate: Math.random() * 10 + 2,
      avgLikes: Math.floor(Math.random() * 50000) + 1000,
      avgComments: Math.floor(Math.random() * 2000) + 100,
      postsPerWeek: Math.floor(Math.random() * 7) + 1,
      estimatedRevenue: Math.floor(Math.random() * 50000) + 1000,
      niche,
      status: 'close',
      lastChecked: Date.now(),
      tracking: true,
    };

    this.competitors.unshift(competitor);
    await this.saveState();

    console.log(`[CompetitorRadar] Competitor added: ${name}`);
    return competitor;
  }

  async removeCompetitor(competitorId: string): Promise<void> {
    this.competitors = this.competitors.filter(c => c.id !== competitorId);
    this.alerts = this.alerts.filter(a => a.competitorId !== competitorId);
    this.insights = this.insights.filter(i => i.competitorId !== competitorId);
    await this.saveState();
    console.log('[CompetitorRadar] Competitor removed');
  }

  async toggleTracking(competitorId: string): Promise<void> {
    const competitor = this.competitors.find(c => c.id === competitorId);
    if (competitor) {
      competitor.tracking = !competitor.tracking;
      await this.saveState();
      console.log(`[CompetitorRadar] Tracking ${competitor.tracking ? 'enabled' : 'disabled'} for ${competitor.name}`);
    }
  }

  async markAlertAsRead(alertId: string): Promise<void> {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.read = true;
      await this.saveState();
    }
  }

  async markAllAlertsAsRead(): Promise<void> {
    this.alerts.forEach(alert => alert.read = true);
    await this.saveState();
  }

  getCompetitors(): Competitor[] {
    return [...this.competitors].sort((a, b) => b.followers - a.followers);
  }

  getAlerts(): CompetitorAlert[] {
    return [...this.alerts].sort((a, b) => b.timestamp - a.timestamp);
  }

  getUnreadAlerts(): CompetitorAlert[] {
    return this.alerts.filter(a => !a.read);
  }

  getInsights(): CompetitorInsight[] {
    return [...this.insights].sort((a, b) => b.timestamp - a.timestamp);
  }

  getAnalysis(): CompetitorAnalysis {
    const totalCompetitors = this.competitors.length;
    const averageFollowers = totalCompetitors > 0
      ? this.competitors.reduce((sum, c) => sum + c.followers, 0) / totalCompetitors
      : 0;
    const averageEngagement = totalCompetitors > 0
      ? this.competitors.reduce((sum, c) => sum + c.engagementRate, 0) / totalCompetitors
      : 0;

    const ahead = this.competitors.filter(c => c.status === 'ahead').length;
    let marketPosition: CompetitorAnalysis['marketPosition'] = 'follower';
    if (ahead === 0) marketPosition = 'leader';
    else if (ahead <= 1) marketPosition = 'contender';
    else if (ahead <= 2) marketPosition = 'challenger';

    return {
      totalCompetitors,
      averageFollowers: Math.round(averageFollowers),
      averageEngagement: Math.round(averageEngagement * 10) / 10,
      marketPosition,
      threatsIdentified: this.alerts.filter(a => a.severity === 'high' || a.severity === 'critical').length,
      opportunitiesFound: this.insights.filter(i => i.impact === 'high').length,
    };
  }

  setMonitoring(enabled: boolean): void {
    this.monitoring = enabled;
    this.saveState();
    console.log(`[CompetitorRadar] Monitoring ${enabled ? 'enabled' : 'disabled'}`);
  }

  isMonitoring(): boolean {
    return this.monitoring;
  }
}

export default CompetitorRadarService.getInstance();
