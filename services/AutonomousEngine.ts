interface Campaign {
  id: string;
  name: string;
  platform: string;
  spend: number;
  revenue: number;
  roi: number;
  trend: 'up' | 'down' | 'stable';
  risk: number;
  status: 'active' | 'testing' | 'paused' | 'killed';
  createdAt: Date;
  lastOptimized: Date;
}

interface Opportunity {
  id: string;
  type: 'product' | 'content' | 'campaign' | 'partnership' | 'arbitrage';
  title: string;
  description: string;
  projectedRevenue: number;
  investment: number;
  roi: number;
  confidence: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  actionRequired: 'approve' | 'configure' | 'none';
  discoveredAt: Date;
}

interface AutonomousAction {
  id: string;
  type: string;
  action: string;
  result: string;
  impact: number;
  timestamp: Date;
}

interface PerformanceMetrics {
  revenue: {
    today: number;
    week: number;
    month: number;
    year: number;
    change: number;
  };
  profit: {
    today: number;
    week: number;
    month: number;
    margin: number;
  };
  campaigns: {
    active: number;
    avgRoi: number;
    topPerformer: string;
  };
  content: {
    posted: number;
    avgEngagement: number;
    viralPieces: number;
  };
}

export class AutonomousEngine {
  private static instance: AutonomousEngine;
  private campaigns: Campaign[] = [];
  private opportunities: Opportunity[] = [];
  private actions: AutonomousAction[] = [];
  private autonomyLevel: 'conservative' | 'moderate' | 'aggressive' = 'moderate';

  private constructor() {
    this.initializeMockData();
  }

  static getInstance(): AutonomousEngine {
    if (!AutonomousEngine.instance) {
      AutonomousEngine.instance = new AutonomousEngine();
    }
    return AutonomousEngine.instance;
  }

  private initializeMockData(): void {
    this.campaigns = [
      {
        id: 'camp_1',
        name: 'TikTok Pet Products',
        platform: 'TikTok Ads',
        spend: 450,
        revenue: 1680,
        roi: 3.73,
        trend: 'up',
        risk: 0.15,
        status: 'active',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        lastOptimized: new Date(),
      },
      {
        id: 'camp_2',
        name: 'Instagram Fashion',
        platform: 'Meta Ads',
        spend: 320,
        revenue: 750,
        roi: 2.34,
        trend: 'stable',
        risk: 0.25,
        status: 'active',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        lastOptimized: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'camp_3',
        name: 'YouTube Course Promo',
        platform: 'Google Ads',
        spend: 580,
        revenue: 890,
        roi: 1.53,
        trend: 'down',
        risk: 0.65,
        status: 'testing',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        lastOptimized: new Date(),
      },
    ];

    this.opportunities = [
      {
        id: 'opp_1',
        type: 'product',
        title: 'Personalized Dog Collars',
        description: 'Trending niche with low competition. Custom engraved pet accessories.',
        projectedRevenue: 3200,
        investment: 500,
        roi: 6.4,
        confidence: 0.87,
        priority: 'high',
        actionRequired: 'approve',
        discoveredAt: new Date(),
      },
      {
        id: 'opp_2',
        type: 'content',
        title: 'AI Art Tutorial Series',
        description: 'High search volume, create 10-part series for YouTube monetization.',
        projectedRevenue: 1500,
        investment: 200,
        roi: 7.5,
        confidence: 0.72,
        priority: 'medium',
        actionRequired: 'approve',
        discoveredAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: 'opp_3',
        type: 'arbitrage',
        title: 'Cross-Platform Arbitrage',
        description: 'Product selling for $45 on Amazon, source at $12 from AliExpress.',
        projectedRevenue: 2800,
        investment: 1200,
        roi: 2.33,
        confidence: 0.91,
        priority: 'critical',
        actionRequired: 'approve',
        discoveredAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      },
      {
        id: 'opp_4',
        type: 'partnership',
        title: 'Influencer Collaboration',
        description: 'Micro-influencer (50K followers) wants to promote products for $400.',
        projectedRevenue: 1800,
        investment: 400,
        roi: 4.5,
        confidence: 0.68,
        priority: 'medium',
        actionRequired: 'approve',
        discoveredAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
      },
    ];

    this.actions = [
      {
        id: 'act_1',
        type: 'optimization',
        action: 'Killed 3 underperforming Facebook ads',
        result: 'Saved $85/day in wasted spend',
        impact: 85,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
      {
        id: 'act_2',
        type: 'scaling',
        action: 'Increased TikTok campaign budget by 40%',
        result: 'ROI maintained at 3.7x, revenue +$280',
        impact: 280,
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      },
      {
        id: 'act_3',
        type: 'content',
        action: 'Posted 8 pieces of content across platforms',
        result: 'Avg engagement: 8.2%, 3 went viral',
        impact: 1200,
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
      },
    ];
  }

  async analyzeCampaign(campaignId: string): Promise<{
    shouldScale: boolean;
    recommendation: string;
    reasoning: string;
  }> {
    const campaign = this.campaigns.find((c) => c.id === campaignId);
    if (!campaign) {
      return {
        shouldScale: false,
        recommendation: 'Campaign not found',
        reasoning: 'Invalid campaign ID',
      };
    }

    const roi = campaign.roi;
    const trend = campaign.trend;
    const risk = campaign.risk;

    if (roi > 2.5 && trend === 'up' && risk < 0.3) {
      return {
        shouldScale: true,
        recommendation: 'Scale by 40%',
        reasoning: `Strong ROI (${roi.toFixed(2)}x), upward trend, low risk (${(risk * 100).toFixed(0)}%)`,
      };
    }

    if (roi > 2.0 && trend === 'stable' && risk < 0.4) {
      return {
        shouldScale: true,
        recommendation: 'Scale by 20%',
        reasoning: `Good ROI (${roi.toFixed(2)}x), stable performance, acceptable risk`,
      };
    }

    if (roi < 1.5 || risk > 0.6) {
      return {
        shouldScale: false,
        recommendation: 'Pause and optimize',
        reasoning: `Low ROI (${roi.toFixed(2)}x) or high risk (${(risk * 100).toFixed(0)}%)`,
      };
    }

    return {
      shouldScale: false,
      recommendation: 'Monitor closely',
      reasoning: 'Performance metrics within acceptable range but not optimal',
    };
  }

  async findOpportunities(): Promise<Opportunity[]> {
    return this.opportunities.sort((a, b) => {
      const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
      const aScore = a.roi * a.confidence * priorityWeight[a.priority];
      const bScore = b.roi * b.confidence * priorityWeight[b.priority];
      return bScore - aScore;
    });
  }

  async executeAutonomousAction(
    type: string,
    description: string,
  ): Promise<{ success: boolean; message: string }> {
    const action: AutonomousAction = {
      id: `act_${Date.now()}`,
      type,
      action: description,
      result: 'Executed successfully',
      impact: 0,
      timestamp: new Date(),
    };

    this.actions.unshift(action);

    if (this.actions.length > 100) {
      this.actions = this.actions.slice(0, 100);
    }

    console.log(`[AUTONOMOUS] ${type}: ${description}`);

    return {
      success: true,
      message: `Action executed: ${description}`,
    };
  }

  async optimizeCampaigns(): Promise<{
    optimized: number;
    killed: number;
    scaled: number;
    saved: number;
    gained: number;
  }> {
    let optimized = 0;
    let killed = 0;
    let scaled = 0;
    let saved = 0;
    let gained = 0;

    for (const campaign of this.campaigns) {
      const analysis = await this.analyzeCampaign(campaign.id);

      if (analysis.shouldScale && campaign.status === 'active') {
        scaled++;
        gained += campaign.revenue * 0.3;
        await this.executeAutonomousAction(
          'scaling',
          `Scaled ${campaign.name} - ${analysis.recommendation}`,
        );
      } else if (campaign.roi < 1.5 && campaign.status === 'active') {
        killed++;
        saved += campaign.spend;
        campaign.status = 'killed';
        await this.executeAutonomousAction(
          'optimization',
          `Killed underperforming campaign: ${campaign.name}`,
        );
      }

      optimized++;
      campaign.lastOptimized = new Date();
    }

    return { optimized, killed, scaled, saved, gained };
  }

  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    const totalRevenue = this.campaigns.reduce((sum, c) => sum + c.revenue, 0);
    const totalSpend = this.campaigns.reduce((sum, c) => sum + c.spend, 0);
    const avgRoi = this.campaigns.reduce((sum, c) => sum + c.roi, 0) / this.campaigns.length;

    return {
      revenue: {
        today: totalRevenue * 0.1,
        week: totalRevenue * 0.5,
        month: totalRevenue,
        year: totalRevenue * 12,
        change: 12.5,
      },
      profit: {
        today: (totalRevenue - totalSpend) * 0.1,
        week: (totalRevenue - totalSpend) * 0.5,
        month: totalRevenue - totalSpend,
        margin: ((totalRevenue - totalSpend) / totalRevenue) * 100,
      },
      campaigns: {
        active: this.campaigns.filter((c) => c.status === 'active').length,
        avgRoi,
        topPerformer: this.campaigns.sort((a, b) => b.roi - a.roi)[0]?.name || 'None',
      },
      content: {
        posted: 47,
        avgEngagement: 8.2,
        viralPieces: 3,
      },
    };
  }

  getRecentActions(limit: number = 10): AutonomousAction[] {
    return this.actions.slice(0, limit);
  }

  getCampaigns(): Campaign[] {
    return this.campaigns;
  }

  getOpportunities(): Opportunity[] {
    return this.opportunities;
  }

  async approveOpportunity(opportunityId: string): Promise<boolean> {
    const index = this.opportunities.findIndex((o) => o.id === opportunityId);
    if (index === -1) return false;

    const opportunity = this.opportunities[index];
    await this.executeAutonomousAction(
      'opportunity',
      `Approved: ${opportunity.title} - Projected revenue: $${opportunity.projectedRevenue}`,
    );

    this.opportunities.splice(index, 1);
    return true;
  }

  async rejectOpportunity(opportunityId: string): Promise<boolean> {
    const index = this.opportunities.findIndex((o) => o.id === opportunityId);
    if (index === -1) return false;

    this.opportunities.splice(index, 1);
    return true;
  }

  setAutonomyLevel(level: 'conservative' | 'moderate' | 'aggressive'): void {
    this.autonomyLevel = level;
    console.log(`Autonomy level set to: ${level}`);
  }

  getAutonomyLevel(): string {
    return this.autonomyLevel;
  }
}

export default AutonomousEngine.getInstance();
