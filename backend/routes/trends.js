const express = require('express');
const router = express.Router();

// In-memory trend storage
const trendsData = {
  trends: new Map(),
  categories: ['Technology', 'Entertainment', 'Business', 'Lifestyle', 'Gaming']
};

// POST /api/trends/discover - Discover trends
router.post('/discover', (req, res) => {
  const { platform, category, region, language, limit = 10, minScore } = req.body;
  
  const trends = [];
  const platforms = ['Instagram', 'TikTok', 'YouTube', 'Twitter', 'All'];
  
  for (let i = 0; i < limit; i++) {
    const score = Math.floor(Math.random() * 100);
    if (minScore && score < minScore) continue;
    
    const trend = {
      id: 'trend_' + Date.now() + '_' + i,
      topic: `Trending Topic #${i + 1}`,
      platform: platform || platforms[Math.floor(Math.random() * platforms.length)],
      category: category || trendsData.categories[Math.floor(Math.random() * trendsData.categories.length)],
      score,
      volume: Math.floor(Math.random() * 1000000) + 10000,
      growth: Math.random() * 200 - 50,
      hashtags: [`#trend${i}`, `#viral${i}`, `#trending`],
      region: region || 'United States',
      language: language || 'en',
      sentiment: Math.random() > 0.5 ? 'positive' : Math.random() > 0.5 ? 'neutral' : 'negative',
      peakTime: Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000,
      estimatedReach: Math.floor(Math.random() * 10000000) + 100000,
      discoveredAt: Date.now(),
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000)
    };
    
    trends.push(trend);
    trendsData.trends.set(trend.id, trend);
  }
  
  res.json(trends);
});

// GET /api/trends/:id - Get specific trend
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const trend = trendsData.trends.get(id);
  
  if (!trend) {
    return res.status(404).json({ error: 'Trend not found' });
  }
  
  res.json(trend);
});

// POST /api/trends/:id/analyze - Analyze trend
router.post('/:id/analyze', (req, res) => {
  const { id } = req.params;
  const trend = trendsData.trends.get(id);
  
  if (!trend) {
    return res.status(404).json({ error: 'Trend not found' });
  }
  
  const analysis = {
    analysis: `Trend "${trend.topic}" is ${trend.growth > 0 ? 'growing rapidly' : 'declining'} with a score of ${trend.score}/100`,
    opportunities: [
      'Create content before peak saturation',
      'Leverage related hashtags for visibility',
      'Cross-post across multiple platforms',
      'Engage with early adopters'
    ],
    risks: [
      'Trend may be short-lived',
      'High competition expected',
      'Saturation risk in 48-72 hours'
    ],
    contentIdeas: [
      `${trend.topic} tutorial`,
      `My take on ${trend.topic}`,
      `${trend.topic} explained`,
      `Behind the scenes: ${trend.topic}`
    ],
    targetAudience: ['18-34 year olds', 'Tech enthusiasts', 'Early adopters'],
    bestPlatforms: [trend.platform, 'Instagram', 'TikTok'],
    estimatedROI: Math.random() * 10 + 2,
    recommendedBudget: Math.floor(Math.random() * 500) + 100
  };
  
  res.json(analysis);
});

module.exports = router;
