import express, { Request, Response, Router } from 'express';

const router: Router = express.Router();

interface PlatformData {
  followers: number;
  engagement: number;
  reach: number;
  lastUpdated: number;
}

interface TimelineEntry {
  timestamp: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
}

interface QueryRequestBody {
  period?: string;
  startDate: number;
  endDate: number;
  metrics?: string[];
  platforms?: string[];
  contentIds?: string[];
}

interface EventRequestBody {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
  timestamp?: number;
}

// In-memory storage for single-user app
const analyticsData: {
  platforms: Record<string, PlatformData>;
  content: Record<string, any>;
  revenue: {
    total: number;
    byPlatform: Record<string, number>;
    byContent: Record<string, number>;
    timeline: any[];
  };
  events: any[];
} = {
  platforms: {},
  content: {},
  revenue: {
    total: 0,
    byPlatform: {},
    byContent: {},
    timeline: []
  },
  events: []
};

// Initialize with some baseline data
function initializeAnalytics() {
  const platforms = ['Instagram', 'TikTok', 'YouTube', 'Twitter'];
  const now = Date.now();
  
  platforms.forEach(platform => {
    analyticsData.platforms[platform] = {
      followers: Math.floor(Math.random() * 50000) + 1000,
      engagement: Math.random() * 10 + 2,
      reach: Math.floor(Math.random() * 100000) + 5000,
      lastUpdated: now
    };
  });
}

initializeAnalytics();

// Helper function to generate time series data
function generateTimeSeries(days: number, min: number, max: number): any[] {
  const series: any[] = [];
  const now = Date.now();
  
  for (let i = days - 1; i >= 0; i--) {
    const timestamp = now - (i * 24 * 60 * 60 * 1000);
    const value = Math.floor(Math.random() * (max - min)) + min;
    series.push({ timestamp, value });
  }
  
  return series;
}

// GET /api/analytics/:platform - Get analytics for specific platform
router.get('/:platform', (req: Request<{ platform: string }>, res: Response) => {
  const { platform } = req.params;
  const { timeframe = '7d' } = req.query;
  
  const platformData = analyticsData.platforms[platform] || {
    followers: 0,
    engagement: 0,
    reach: 0,
    lastUpdated: Date.now()
  };
  
  // Generate time series data based on timeframe
  const days = timeframe === '24h' ? 1 : timeframe === '7d' ? 7 : 30;
  const timeline: TimelineEntry[] = [];
  const now = Date.now();
  
  for (let i = days - 1; i >= 0; i--) {
    const timestamp = now - (i * 24 * 60 * 60 * 1000);
    timeline.push({
      timestamp,
      views: Math.floor(Math.random() * 10000) + 1000,
      likes: Math.floor(Math.random() * 1000) + 100,
      comments: Math.floor(Math.random() * 100) + 10,
      shares: Math.floor(Math.random() * 50) + 5
    });
  }
  
  res.json({
    platform,
    timeframe,
    followers: platformData.followers,
    engagement: platformData.engagement,
    reach: platformData.reach,
    timeline,
    summary: {
      totalViews: timeline.reduce((sum, day) => sum + day.views, 0),
      totalLikes: timeline.reduce((sum, day) => sum + day.likes, 0),
      totalComments: timeline.reduce((sum, day) => sum + day.comments, 0),
      totalShares: timeline.reduce((sum, day) => sum + day.shares, 0),
      avgEngagementRate: platformData.engagement
    }
  });
});

// POST /api/analytics/query - Complex analytics query
router.post('/query', (req: Request<{}, {}, QueryRequestBody>, res: Response) => {
  const { period, startDate, endDate, metrics = [], platforms = [], contentIds = [] } = req.body;
  
  const days = Math.ceil((endDate - startDate) / (24 * 60 * 60 * 1000));
  
  // Generate time series for each metric
  const result: any = {
    period,
    startDate,
    endDate,
    metrics: {},
    topContent: [],
    topPlatforms: [],
    insights: []
  };
  
  // Revenue time series
  result.metrics.revenue = generateTimeSeries(days, 100, 5000);
  result.metrics.views = generateTimeSeries(days, 1000, 20000);
  result.metrics.engagement = generateTimeSeries(days, 50, 500);
  result.metrics.growth = generateTimeSeries(days, -10, 50);
  result.metrics.content = generateTimeSeries(days, 1, 10);
  result.metrics.ai_usage = generateTimeSeries(days, 5, 100);
  
  // Top platforms
  result.topPlatforms = Object.keys(analyticsData.platforms).map(platform => ({
    platform,
    ...analyticsData.platforms[platform],
    revenue: Math.floor(Math.random() * 10000) + 1000
  })).sort((a, b) => b.revenue - a.revenue);
  
  // Generate insights
  result.insights = [
    {
      id: 'insight_' + Date.now(),
      type: 'positive',
      title: 'Strong Growth Trend',
      description: 'Your engagement has increased by 45% over the selected period',
      recommendation: 'Continue posting at current frequency',
      impact: 'high',
      actionable: true,
      createdAt: Date.now()
    },
    {
      id: 'insight_' + (Date.now() + 1),
      type: 'warning',
      title: 'Posting Frequency Drop',
      description: 'Content output has decreased by 20% this week',
      recommendation: 'Schedule more content to maintain growth',
      impact: 'medium',
      actionable: true,
      createdAt: Date.now()
    }
  ];
  
  res.json(result);
});

// POST /api/analytics/revenue - Get revenue metrics
router.post('/revenue', (req: Request, res: Response) => {
  const { period, startDate, endDate, platforms = [] } = req.body;
  
  const days = Math.ceil((endDate - startDate) / (24 * 60 * 60 * 1000));
  
  const totalRevenue = Math.floor(Math.random() * 50000) + 10000;
  
  res.json({
    total: totalRevenue,
    byPlatform: {
      youtube: Math.floor(totalRevenue * 0.4),
      tiktok: Math.floor(totalRevenue * 0.3),
      instagram: Math.floor(totalRevenue * 0.2),
      twitter: Math.floor(totalRevenue * 0.1)
    },
    byContent: {},
    growth: Math.random() * 50 - 10,
    forecast: generateTimeSeries(30, 500, 2000)
  });
});

// POST /api/analytics/events - Track an event
router.post('/events', (req: Request<{}, {}, EventRequestBody>, res: Response) => {
  const { event, properties = {}, userId, timestamp } = req.body;
  
  const eventRecord = {
    id: 'event_' + Date.now(),
    event,
    properties,
    userId: userId || 'single_user',
    timestamp: timestamp || Date.now(),
    recorded: Date.now()
  };
  
  analyticsData.events.push(eventRecord);
  
  // Keep only last 10000 events
  if (analyticsData.events.length > 10000) {
    analyticsData.events = analyticsData.events.slice(-10000);
  }
  
  res.json({ success: true, eventId: eventRecord.id });
});

// POST /api/analytics/insights - Generate AI insights
router.post('/insights', (req: Request, res: Response) => {
  const { period, startDate, endDate } = req.body;
  
  const insights = [
    {
      id: 'insight_' + Date.now(),
      type: 'positive',
      title: 'Viral Content Opportunity',
      description: 'Your recent video content has 3x higher engagement than average',
      recommendation: 'Create more video content in similar style',
      impact: 'high',
      actionable: true,
      actions: [
        {
          id: 'action_1',
          label: 'Generate Similar Content',
          type: 'navigate',
          route: '/content/create'
        }
      ],
      createdAt: Date.now()
    },
    {
      id: 'insight_' + (Date.now() + 1),
      type: 'neutral',
      title: 'Optimal Posting Time',
      description: 'Your audience is most active between 2-4 PM EST',
      recommendation: 'Schedule content during peak hours',
      impact: 'medium',
      actionable: true,
      actions: [
        {
          id: 'action_2',
          label: 'View Scheduler',
          type: 'navigate',
          route: '/schedule'
        }
      ],
      createdAt: Date.now()
    },
    {
      id: 'insight_' + (Date.now() + 2),
      type: 'warning',
      title: 'Engagement Decline',
      description: 'Engagement rate dropped 15% in the last 7 days',
      recommendation: 'Try new content formats or collaborate with others',
      impact: 'high',
      actionable: true,
      actions: [
        {
          id: 'action_3',
          label: 'Find Collaborators',
          type: 'navigate',
          route: '/collaborators'
        }
      ],
      createdAt: Date.now()
    }
  ];
  
  res.json({ insights, count: insights.length });
});

// GET /api/analytics/overview - Dashboard overview
router.get('/', (req: Request, res: Response) => {
  const now = Date.now();
  const platforms = Object.keys(analyticsData.platforms);
  
  const totalFollowers = platforms.reduce((sum, platform) => 
    sum + (analyticsData.platforms[platform]?.followers || 0), 0
  );
  
  const avgEngagement = platforms.length > 0
    ? platforms.reduce((sum, platform) => 
        sum + (analyticsData.platforms[platform]?.engagement || 0), 0
      ) / platforms.length
    : 0;
  
  const totalReach = platforms.reduce((sum, platform) => 
    sum + (analyticsData.platforms[platform]?.reach || 0), 0
  );
  
  res.json({
    summary: {
      totalFollowers,
      avgEngagement: Math.round(avgEngagement * 100) / 100,
      totalReach,
      platforms: platforms.length,
      contentPieces: Object.keys(analyticsData.content).length,
      totalRevenue: analyticsData.revenue.total
    },
    platforms: analyticsData.platforms,
    recentEvents: analyticsData.events.slice(-10).reverse(),
    lastUpdated: now
  });
});

export default router;
