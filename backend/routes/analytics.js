const express = require('express');
const router = express.Router();

// In-memory storage for single-user app
const analyticsData = {
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

// GET /api/analytics/:platform - Get analytics for specific platform
router.get('/:platform', (req, res) => {
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
  const timeline = [];
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
router.post('/query', (req, res) => {
  const { period, startDate, endDate, metrics = [], platforms = [], contentIds = [] } = req.body;
  
  const days = Math.ceil((endDate - startDate) / (24 * 60 * 60 * 1000));
  
  // Generate time series for each metric
  const result = {
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
router.post('/revenue', (req, res) => {
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
router.post('/events', (req, res) => {
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
router.post('/insights', (req, res) => {
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
          payload: { screen: 'ContentEngine' }
        }
      ],
      createdAt: Date.now()
    },
    {
      id: 'insight_' + (Date.now() + 1),
      type: 'neutral',
      title: 'Audience Preference Shift',
      description: 'Your audience engages more during evening hours (6-9 PM)',
      recommendation: 'Schedule posts for peak engagement times',
      impact: 'medium',
      actionable: true,
      createdAt: Date.now()
    }
  ];
  
  res.json(insights);
});

// POST /api/analytics/predict - Predict performance
router.post('/predict', (req, res) => {
  const { contentId, platform } = req.body;
  
  const predictedViews = Math.floor(Math.random() * 50000) + 10000;
  const predictedEngagement = Math.random() * 5 + 2;
  
  res.json({
    predictedViews,
    predictedEngagement,
    confidence: Math.random() * 30 + 65,
    timeline: generateTimeSeries(7, 1000, 10000)
  });
});

// GET /api/analytics/audience - Get audience insights
router.get('/audience', (req, res) => {
  res.json({
    demographics: {
      age: {
        '18-24': 25,
        '25-34': 40,
        '35-44': 20,
        '45-54': 10,
        '55+': 5
      },
      gender: {
        male: 45,
        female: 52,
        other: 3
      },
      location: {
        'United States': 35,
        'United Kingdom': 15,
        'Canada': 12,
        'Australia': 10,
        'Other': 28
      }
    },
    interests: [
      'Technology',
      'Entertainment',
      'Business',
      'Lifestyle',
      'Gaming',
      'Travel',
      'Food'
    ],
    behaviors: {
      mobile: 75,
      desktop: 20,
      tablet: 5
    },
    activeHours: [0, 0, 0, 0, 0, 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 45, 40, 35, 30, 25, 15, 5, 0]
  });
});

// GET /api/analytics/top-content - Get top performing content
router.get('/top-content', (req, res) => {
  const { limit = 10, period = 'week' } = req.query;
  
  const topContent = [];
  for (let i = 0; i < Math.min(limit, 10); i++) {
    topContent.push({
      id: 'content_' + (Date.now() + i),
      title: `Top Content #${i + 1}`,
      type: ['post', 'video', 'story', 'reel'][Math.floor(Math.random() * 4)],
      platform: ['Instagram', 'TikTok', 'YouTube', 'Twitter'][Math.floor(Math.random() * 4)],
      views: Math.floor(Math.random() * 100000) + 10000,
      likes: Math.floor(Math.random() * 10000) + 1000,
      comments: Math.floor(Math.random() * 1000) + 100,
      shares: Math.floor(Math.random() * 500) + 50,
      engagement: Math.random() * 10 + 2,
      revenue: Math.floor(Math.random() * 5000) + 500,
      createdAt: Date.now() - (i * 24 * 60 * 60 * 1000)
    });
  }
  
  res.json(topContent);
});

// Helper function to generate time series data
function generateTimeSeries(days, min, max) {
  const data = [];
  const now = Date.now();
  
  for (let i = 0; i < days; i++) {
    const timestamp = now - (days - i - 1) * 24 * 60 * 60 * 1000;
    const value = Math.floor(Math.random() * (max - min)) + min;
    const change = i > 0 ? value - data[i - 1].value : 0;
    const changePercent = i > 0 ? (change / data[i - 1].value) * 100 : 0;
    
    data.push({
      timestamp,
      value,
      change,
      changePercent
    });
  }
  
  return data;
}

module.exports = router;
