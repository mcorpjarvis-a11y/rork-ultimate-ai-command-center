import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { AppState, SystemLog, Persona, MediaAsset, RevenueStream, AIModel, Trend, AnalyticsData, DataSource, AITask, SocialAccount, AIPreferences } from '@/types';
import { ALL_PLATFORMS } from '@/constants/platforms';

const STORAGE_KEY = 'ai_command_center_data';

const defaultState: AppState = {
  metrics: {
    followers: 18258,
    engagementRate: 5.3,
    monthlyRevenue: 2495.52,
    conversionRate: 2.8,
  },
  chartData: [
    { week: 'Week 1', followers: 12000, engagement: 4.2 },
    { week: 'Week 2', followers: 13000, engagement: 4.8 },
    { week: 'Week 3', followers: 15500, engagement: 5.1 },
    { week: 'Week 4', followers: 18258, engagement: 5.3 },
  ],
  insights: [
    {
      id: '1',
      message: 'AI suggests: Post short-form content between 6-8pm for higher reach.',
      timestamp: Date.now() - 3600000,
    },
    {
      id: '2',
      message: 'Your engagement rose 8% this week due to media trend alignment.',
      timestamp: Date.now() - 7200000,
    },
  ],
  apiKeys: [],
  socialAccounts: [
    { id: '1', platform: 'Instagram', username: '@influencer', connected: true, followers: 12500, category: 'social', engagement: 4.2, posts: 342, revenue: 1250.00 },
    { id: '2', platform: 'TikTok', username: '@influencer', connected: true, followers: 8200, category: 'social', engagement: 6.8, posts: 567, revenue: 890.50 },
    { id: '3', platform: 'YouTube', username: 'Influencer Channel', connected: true, followers: 45000, category: 'video', engagement: 3.5, posts: 128, revenue: 5800.00 },
    { id: '4', platform: 'Twitter/X', username: '@influencer', connected: true, followers: 23000, category: 'social', engagement: 2.8, posts: 1240, revenue: 450.00 },
    { id: '5', platform: 'Twitch', username: 'influencer_stream', connected: true, followers: 3500, category: 'gaming', engagement: 8.2, posts: 85, revenue: 2100.00 },
    { id: '6', platform: 'Shopify', username: 'my-store', connected: true, followers: 0, category: 'ecommerce', revenue: 12500.00 },
  ],
  scheduledTasks: [],
  workflowRules: [
    {
      id: '1',
      name: 'Auto-post daily content',
      trigger: 'Daily at 9:00 AM',
      action: 'Generate and post content',
      enabled: true,
    },
    {
      id: '2',
      name: 'Engagement response',
      trigger: 'New comment received',
      action: 'AI generates reply',
      enabled: true,
    },
  ],
  contentItems: [],
  systemLogs: [
    {
      id: '1',
      level: 'success',
      message: 'System initialized successfully',
      timestamp: Date.now() - 60000,
      category: 'System',
    },
    {
      id: '2',
      level: 'info',
      message: 'AI modules loaded',
      timestamp: Date.now() - 120000,
      category: 'AI',
    },
  ],
  notifications: 2,
  personas: [
    {
      id: '1',
      name: 'Professional Educator',
      description: 'Expert in teaching complex topics simply',
      tone: 'Professional, Friendly, Informative',
      topics: ['Technology', 'Education', 'Innovation'],
      targetAudience: 'Young professionals, Students',
      active: true,
      createdAt: Date.now() - 86400000,
    },
    {
      id: '2',
      name: 'Lifestyle Influencer',
      description: 'Casual and relatable content creator',
      tone: 'Casual, Upbeat, Authentic',
      topics: ['Lifestyle', 'Fashion', 'Travel', 'Food'],
      targetAudience: 'Millennials, Gen Z',
      active: true,
      createdAt: Date.now() - 172800000,
    },
  ],
  mediaAssets: [],
  revenueStreams: [
    { id: '1', name: 'YouTube AdSense', type: 'ads', platform: 'YouTube', amount: 5800.00, currency: 'USD', status: 'active', lastPayout: Date.now() - 604800000, nextPayout: Date.now() + 2592000000 },
    { id: '2', name: 'Shopify Store', type: 'merchandise', platform: 'Shopify', amount: 12500.00, currency: 'USD', status: 'active', lastPayout: Date.now() - 259200000 },
    { id: '3', name: 'Patreon Subscriptions', type: 'subscription', platform: 'Patreon', amount: 3200.00, currency: 'USD', status: 'active', nextPayout: Date.now() + 86400000 },
    { id: '4', name: 'Amazon Associates', type: 'affiliate', platform: 'Amazon', amount: 1450.00, currency: 'USD', status: 'active' },
    { id: '5', name: 'Twitch Subscriptions', type: 'subscription', platform: 'Twitch', amount: 2100.00, currency: 'USD', status: 'active' },
    { id: '6', name: 'Brand Sponsorships', type: 'sponsorship', platform: 'Instagram', amount: 8500.00, currency: 'USD', status: 'pending' },
    { id: '7', name: 'Online Course', type: 'courses', platform: 'Teachable', amount: 4200.00, currency: 'USD', status: 'active' },
    { id: '8', name: 'NFT Collection', type: 'nft', platform: 'OpenSea', amount: 15000.00, currency: 'USD', status: 'active' },
  ],
  aiModels: [
    { id: '1', name: 'GPT-4', type: 'text', provider: 'OpenAI', enabled: true, cost: 0.06, tokensUsed: 125000, lastUsed: Date.now() - 3600000, tier: 'premium', maxTokens: 8192, contextWindow: 128000, recommended: true },
    { id: '2', name: 'Claude 3 Opus', type: 'text', provider: 'Anthropic', enabled: true, cost: 0.05, tokensUsed: 98000, lastUsed: Date.now() - 7200000, tier: 'premium', maxTokens: 4096, contextWindow: 200000 },
    { id: '3', name: 'GPT-3.5 Turbo', type: 'text', provider: 'OpenAI', enabled: true, cost: 0.002, tokensUsed: 250000, lastUsed: Date.now() - 1800000, tier: 'paid', maxTokens: 4096, contextWindow: 16385 },
    { id: '4', name: 'Gemini Pro', type: 'multimodal', provider: 'Google', enabled: true, cost: 0.0005, tokensUsed: 76000, lastUsed: Date.now() - 2700000, tier: 'free', maxTokens: 8192, contextWindow: 32768, recommended: true },
    { id: '5', name: 'Gemini 1.5 Flash', type: 'text', provider: 'Google', enabled: true, cost: 0, tokensUsed: 450000, lastUsed: Date.now() - 900000, tier: 'free', maxTokens: 8192, contextWindow: 1000000, recommended: true },
    { id: '6', name: 'Llama 3.1 70B', type: 'text', provider: 'Together AI', enabled: true, cost: 0, tokensUsed: 320000, lastUsed: Date.now() - 3600000, tier: 'free', endpoint: 'https://api.together.xyz/v1', maxTokens: 4096, contextWindow: 128000 },
    { id: '7', name: 'Mixtral 8x7B', type: 'text', provider: 'Together AI', enabled: true, cost: 0, tokensUsed: 180000, lastUsed: Date.now() - 7200000, tier: 'free', endpoint: 'https://api.together.xyz/v1', maxTokens: 4096, contextWindow: 32768 },
    { id: '8', name: 'DALL-E 3', type: 'image', provider: 'OpenAI', enabled: true, cost: 0.12, tokensUsed: 450, lastUsed: Date.now() - 1800000, tier: 'premium', recommended: true },
    { id: '9', name: 'Midjourney', type: 'image', provider: 'Midjourney', enabled: true, cost: 0.08, tokensUsed: 320, lastUsed: Date.now() - 5400000, tier: 'paid' },
    { id: '10', name: 'Stable Diffusion XL', type: 'image', provider: 'Stability AI', enabled: true, cost: 0.02, tokensUsed: 890, lastUsed: Date.now() - 900000, tier: 'paid' },
    { id: '11', name: 'Flux.1 Schnell', type: 'image', provider: 'Black Forest Labs', enabled: true, cost: 0, tokensUsed: 1200, lastUsed: Date.now() - 3600000, tier: 'free', endpoint: 'https://api.together.xyz/v1', recommended: true },
    { id: '12', name: 'ElevenLabs', type: 'audio', provider: 'ElevenLabs', enabled: true, cost: 0.05, tokensUsed: 12000, lastUsed: Date.now() - 10800000, tier: 'paid' },
    { id: '13', name: 'Whisper Large v3', type: 'audio', provider: 'OpenAI', enabled: true, cost: 0, tokensUsed: 8500, lastUsed: Date.now() - 5400000, tier: 'free', recommended: true },
    { id: '14', name: 'Runway Gen-2', type: 'video', provider: 'Runway', enabled: false, cost: 0.25, tokensUsed: 45, lastUsed: null, tier: 'premium' },
    { id: '15', name: 'DeepSeek Coder', type: 'text', provider: 'DeepSeek', enabled: true, cost: 0, tokensUsed: 95000, lastUsed: Date.now() - 1800000, tier: 'free', endpoint: 'https://api.deepseek.com/v1', maxTokens: 4096, contextWindow: 16384, recommended: true },
  ],
  trends: [
    { id: '1', topic: 'AI Automation', platform: 'All', volume: 125000, sentiment: 0.85, growth: 45, relevance: 92, hashtags: ['#AIAutomation', '#FutureTech', '#Innovation'], suggestedContent: 'Create content about how AI is transforming daily workflows', timestamp: Date.now() - 3600000 },
    { id: '2', topic: 'Sustainable Living', platform: 'Instagram', volume: 89000, sentiment: 0.78, growth: 32, relevance: 78, hashtags: ['#EcoFriendly', '#Sustainability', '#GreenLiving'], suggestedContent: 'Share tips on eco-friendly lifestyle choices', timestamp: Date.now() - 7200000 },
    { id: '3', topic: 'NFT Gaming', platform: 'Twitter', volume: 67000, sentiment: 0.65, growth: 28, relevance: 85, hashtags: ['#NFTGaming', '#Web3', '#PlayToEarn'], suggestedContent: 'Discuss the future of gaming and digital ownership', timestamp: Date.now() - 10800000 },
  ],
  analyticsData: [],
  dataSources: [
    { id: '1', name: 'Tech News RSS', type: 'rss', url: 'https://news.ycombinator.com/rss', enabled: true, lastFetch: Date.now() - 1800000, interval: 3600000, dataCount: 1250 },
    { id: '2', name: 'Industry API', type: 'api', url: 'https://api.example.com/trends', enabled: true, lastFetch: Date.now() - 900000, interval: 1800000, dataCount: 890 },
    { id: '3', name: 'Reddit Scraper', type: 'scraper', url: 'https://reddit.com/r/technology', enabled: true, lastFetch: Date.now() - 3600000, interval: 7200000, dataCount: 2340 },
  ],
  aiTaskQueue: [
    { id: '1', type: 'content_generation', description: 'Generate Instagram post about AI trends', status: 'processing', priority: 'high', assignedModel: 'Gemini Pro', progress: 65, createdAt: Date.now() - 300000, startedAt: Date.now() - 120000, modelTier: 'free', costSaved: 0.024 },
    { id: '2', type: 'image_generation', description: 'Create thumbnail for YouTube video', status: 'queued', priority: 'medium', progress: 0, createdAt: Date.now() - 180000 },
    { id: '3', type: 'data_analysis', description: 'Analyze trending topics on Twitter', status: 'completed', priority: 'high', assignedModel: 'Gemini 1.5 Flash', progress: 100, result: { topics: 15, insights: 8 }, createdAt: Date.now() - 600000, startedAt: Date.now() - 480000, completedAt: Date.now() - 60000, modelTier: 'free', costSaved: 0.048 },
    { id: '4', type: 'code_building', description: 'Generate React component for dashboard widget', status: 'completed', priority: 'high', assignedModel: 'DeepSeek Coder', progress: 100, createdAt: Date.now() - 900000, startedAt: Date.now() - 720000, completedAt: Date.now() - 360000, modelTier: 'free', costSaved: 0.072 },
  ],
  aiPreferences: {
    useFreeTierFirst: true,
    maxDailySpend: 100,
    preferredTextModel: 'Gemini 1.5 Flash',
    preferredImageModel: 'Flux.1 Schnell',
    preferredCodeModel: 'DeepSeek Coder',
    preferredDataModel: 'Gemini Pro',
    autoSelectBestModel: true,
    trackCosts: true,
  },
  totalAICost: 24.58,
  totalCostSaved: 156.92,
};

export const [AppProvider, useApp] = createContextHook(() => {
  const [state, setState] = useState<AppState>(defaultState);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadState();
  }, []);

  const loadState = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setState(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveState = async (newState: AppState) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      setState(newState);
    } catch (error) {
      console.error('Failed to save state:', error);
    }
  };

  const updateMetrics = useCallback((metrics: Partial<AppState['metrics']>) => {
    setState((prev) => {
      const newState = { ...prev, metrics: { ...prev.metrics, ...metrics } };
      saveState(newState);
      return newState;
    });
  }, []);

  const addInsight = useCallback((message: string) => {
    setState((prev) => {
      const newInsight = {
        id: Date.now().toString(),
        message,
        timestamp: Date.now(),
      };
      const newState = {
        ...prev,
        insights: [newInsight, ...prev.insights].slice(0, 10),
      };
      saveState(newState);
      return newState;
    });
  }, []);

  const addAPIKey = useCallback((name: string, key: string) => {
    setState((prev) => {
      const newKey = {
        id: Date.now().toString(),
        name,
        key,
        createdAt: Date.now(),
        lastUsed: null,
      };
      const newState = { ...prev, apiKeys: [...prev.apiKeys, newKey] };
      saveState(newState);
      return newState;
    });
  }, []);

  const deleteAPIKey = useCallback((id: string) => {
    setState((prev) => {
      const newState = { ...prev, apiKeys: prev.apiKeys.filter((k) => k.id !== id) };
      saveState(newState);
      return newState;
    });
  }, []);

  const toggleSocialAccount = useCallback((id: string) => {
    setState((prev) => {
      const newState = {
        ...prev,
        socialAccounts: prev.socialAccounts.map((acc) =>
          acc.id === id ? { ...acc, connected: !acc.connected } : acc
        ),
      };
      saveState(newState);
      return newState;
    });
  }, []);

  const addScheduledTask = useCallback((title: string, description: string, scheduledTime: number, type: string) => {
    setState((prev) => {
      const newTask = {
        id: Date.now().toString(),
        title,
        description,
        scheduledTime,
        status: 'pending' as const,
        type,
      };
      const newState = { ...prev, scheduledTasks: [...prev.scheduledTasks, newTask] };
      saveState(newState);
      return newState;
    });
  }, []);

  const deleteScheduledTask = useCallback((id: string) => {
    setState((prev) => {
      const newState = { ...prev, scheduledTasks: prev.scheduledTasks.filter((t) => t.id !== id) };
      saveState(newState);
      return newState;
    });
  }, []);

  const toggleWorkflowRule = useCallback((id: string) => {
    setState((prev) => {
      const newState = {
        ...prev,
        workflowRules: prev.workflowRules.map((rule) =>
          rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
        ),
      };
      saveState(newState);
      return newState;
    });
  }, []);

  const addWorkflowRule = useCallback((name: string, trigger: string, action: string) => {
    setState((prev) => {
      const newRule = {
        id: Date.now().toString(),
        name,
        trigger,
        action,
        enabled: true,
      };
      const newState = { ...prev, workflowRules: [...prev.workflowRules, newRule] };
      saveState(newState);
      return newState;
    });
  }, []);

  const deleteWorkflowRule = useCallback((id: string) => {
    setState((prev) => {
      const newState = { ...prev, workflowRules: prev.workflowRules.filter((r) => r.id !== id) };
      saveState(newState);
      return newState;
    });
  }, []);

  const addContentItem = useCallback((title: string, content: string, type: string) => {
    setState((prev) => {
      const newItem = {
        id: Date.now().toString(),
        title,
        content,
        type,
        createdAt: Date.now(),
        status: 'draft' as const,
      };
      const newState = { ...prev, contentItems: [newItem, ...prev.contentItems] };
      saveState(newState);
      return newState;
    });
  }, []);

  const deleteContentItem = useCallback((id: string) => {
    setState((prev) => {
      const newState = { ...prev, contentItems: prev.contentItems.filter((i) => i.id !== id) };
      saveState(newState);
      return newState;
    });
  }, []);

  const addPersona = useCallback((name: string, description: string, tone: string, topics: string[], targetAudience: string) => {
    setState((prev) => {
      const newPersona: Persona = {
        id: Date.now().toString(),
        name,
        description,
        tone,
        topics,
        targetAudience,
        active: true,
        createdAt: Date.now(),
      };
      const newState = { ...prev, personas: [...prev.personas, newPersona] };
      saveState(newState);
      return newState;
    });
  }, []);

  const togglePersona = useCallback((id: string) => {
    setState((prev) => {
      const newState = {
        ...prev,
        personas: prev.personas.map((p) => (p.id === id ? { ...p, active: !p.active } : p)),
      };
      saveState(newState);
      return newState;
    });
  }, []);

  const deletePersona = useCallback((id: string) => {
    setState((prev) => {
      const newState = { ...prev, personas: prev.personas.filter((p) => p.id !== id) };
      saveState(newState);
      return newState;
    });
  }, []);

  const addMediaAsset = useCallback((title: string, type: MediaAsset['type'], url: string, tags: string[], aiGenerated: boolean, prompt?: string) => {
    setState((prev) => {
      const newAsset: MediaAsset = {
        id: Date.now().toString(),
        title,
        type,
        url,
        tags,
        size: 0,
        createdAt: Date.now(),
        aiGenerated,
        prompt,
      };
      const newState = { ...prev, mediaAssets: [newAsset, ...prev.mediaAssets] };
      saveState(newState);
      return newState;
    });
  }, []);

  const deleteMediaAsset = useCallback((id: string) => {
    setState((prev) => {
      const newState = { ...prev, mediaAssets: prev.mediaAssets.filter((a) => a.id !== id) };
      saveState(newState);
      return newState;
    });
  }, []);

  const addRevenueStream = useCallback((name: string, type: RevenueStream['type'], platform: string, amount: number) => {
    setState((prev) => {
      const newStream: RevenueStream = {
        id: Date.now().toString(),
        name,
        type,
        platform,
        amount,
        currency: 'USD',
        status: 'active',
      };
      const newState = { ...prev, revenueStreams: [...prev.revenueStreams, newStream] };
      saveState(newState);
      return newState;
    });
  }, []);

  const updateRevenueStream = useCallback((id: string, updates: Partial<RevenueStream>) => {
    setState((prev) => {
      const newState = {
        ...prev,
        revenueStreams: prev.revenueStreams.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      };
      saveState(newState);
      return newState;
    });
  }, []);

  const deleteRevenueStream = useCallback((id: string) => {
    setState((prev) => {
      const newState = { ...prev, revenueStreams: prev.revenueStreams.filter((s) => s.id !== id) };
      saveState(newState);
      return newState;
    });
  }, []);

  const toggleAIModel = useCallback((id: string) => {
    setState((prev) => {
      const newState = {
        ...prev,
        aiModels: prev.aiModels.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m)),
      };
      saveState(newState);
      return newState;
    });
  }, []);

  const updateAIPreferences = useCallback((preferences: Partial<AIPreferences>) => {
    setState((prev) => {
      const newState = {
        ...prev,
        aiPreferences: { ...prev.aiPreferences, ...preferences },
      };
      saveState(newState);
      return newState;
    });
  }, []);

  const addAICost = useCallback((cost: number, saved: number = 0) => {
    setState((prev) => {
      const newState = {
        ...prev,
        totalAICost: prev.totalAICost + cost,
        totalCostSaved: prev.totalCostSaved + saved,
      };
      saveState(newState);
      return newState;
    });
  }, []);

  const addTrend = useCallback((topic: string, platform: string, volume: number, sentiment: number, growth: number) => {
    setState((prev) => {
      const newTrend: Trend = {
        id: Date.now().toString(),
        topic,
        platform,
        volume,
        sentiment,
        growth,
        relevance: 0,
        hashtags: [],
        suggestedContent: '',
        timestamp: Date.now(),
      };
      const newState = { ...prev, trends: [newTrend, ...prev.trends].slice(0, 50) };
      saveState(newState);
      return newState;
    });
  }, []);

  const addDataSource = useCallback((name: string, type: DataSource['type'], url: string, interval: number) => {
    setState((prev) => {
      const newSource: DataSource = {
        id: Date.now().toString(),
        name,
        type,
        url,
        enabled: true,
        lastFetch: null,
        interval,
        dataCount: 0,
      };
      const newState = { ...prev, dataSources: [...prev.dataSources, newSource] };
      saveState(newState);
      return newState;
    });
  }, []);

  const toggleDataSource = useCallback((id: string) => {
    setState((prev) => {
      const newState = {
        ...prev,
        dataSources: prev.dataSources.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)),
      };
      saveState(newState);
      return newState;
    });
  }, []);

  const deleteDataSource = useCallback((id: string) => {
    setState((prev) => {
      const newState = { ...prev, dataSources: prev.dataSources.filter((s) => s.id !== id) };
      saveState(newState);
      return newState;
    });
  }, []);

  const addAITask = useCallback((type: AITask['type'], description: string, priority: AITask['priority']) => {
    setState((prev) => {
      const newTask: AITask = {
        id: Date.now().toString(),
        type,
        description,
        status: 'queued',
        priority,
        progress: 0,
        createdAt: Date.now(),
      };
      const newState = { ...prev, aiTaskQueue: [newTask, ...prev.aiTaskQueue] };
      saveState(newState);
      return newState;
    });
  }, []);

  const updateAITask = useCallback((id: string, updates: Partial<AITask>) => {
    setState((prev) => {
      const newState = {
        ...prev,
        aiTaskQueue: prev.aiTaskQueue.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      };
      saveState(newState);
      return newState;
    });
  }, []);

  const deleteAITask = useCallback((id: string) => {
    setState((prev) => {
      const newState = { ...prev, aiTaskQueue: prev.aiTaskQueue.filter((t) => t.id !== id) };
      saveState(newState);
      return newState;
    });
  }, []);

  const connectSocialAccount = useCallback((platform: string, username: string, category: SocialAccount['category']) => {
    setState((prev) => {
      const newAccount: SocialAccount = {
        id: Date.now().toString(),
        platform,
        username,
        connected: true,
        followers: 0,
        category,
        engagement: 0,
        posts: 0,
        revenue: 0,
      };
      const newState = { ...prev, socialAccounts: [...prev.socialAccounts, newAccount] };
      saveState(newState);
      return newState;
    });
  }, []);

  const updateSocialAccount = useCallback((id: string, updates: Partial<SocialAccount>) => {
    setState((prev) => {
      const newState = {
        ...prev,
        socialAccounts: prev.socialAccounts.map((acc) => (acc.id === id ? { ...acc, ...updates } : acc)),
      };
      saveState(newState);
      return newState;
    });
  }, []);

  const deleteSocialAccount = useCallback((id: string) => {
    setState((prev) => {
      const newState = { ...prev, socialAccounts: prev.socialAccounts.filter((a) => a.id !== id) };
      saveState(newState);
      return newState;
    });
  }, []);

  const addSystemLog = useCallback((level: SystemLog['level'], message: string, category: string) => {
    setState((prev) => {
      const newLog = {
        id: Date.now().toString(),
        level,
        message,
        timestamp: Date.now(),
        category,
      };
      const newState = {
        ...prev,
        systemLogs: [newLog, ...prev.systemLogs].slice(0, 100),
      };
      saveState(newState);
      return newState;
    });
  }, []);

  const resetAll = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setState(defaultState);
  }, []);

  const backupData = useCallback(async (): Promise<string> => {
    return JSON.stringify(state, null, 2);
  }, [state]);

  const restoreData = useCallback(async (data: string) => {
    try {
      const parsed = JSON.parse(data);
      await saveState(parsed);
      return true;
    } catch (error) {
      console.error('Failed to restore data:', error);
      return false;
    }
  }, []);

  return useMemo(
    () => ({
      state,
      isLoading,
      updateMetrics,
      addInsight,
      addAPIKey,
      deleteAPIKey,
      toggleSocialAccount,
      addScheduledTask,
      deleteScheduledTask,
      toggleWorkflowRule,
      addWorkflowRule,
      deleteWorkflowRule,
      addContentItem,
      deleteContentItem,
      addSystemLog,
      resetAll,
      backupData,
      restoreData,
      addPersona,
      togglePersona,
      deletePersona,
      addMediaAsset,
      deleteMediaAsset,
      addRevenueStream,
      updateRevenueStream,
      deleteRevenueStream,
      toggleAIModel,
      addTrend,
      addDataSource,
      toggleDataSource,
      deleteDataSource,
      addAITask,
      updateAITask,
      deleteAITask,
      connectSocialAccount,
      updateSocialAccount,
      deleteSocialAccount,
      updateAIPreferences,
      addAICost,
    }),
    [
      state,
      isLoading,
      updateMetrics,
      addInsight,
      addAPIKey,
      deleteAPIKey,
      toggleSocialAccount,
      addScheduledTask,
      deleteScheduledTask,
      toggleWorkflowRule,
      addWorkflowRule,
      deleteWorkflowRule,
      addContentItem,
      deleteContentItem,
      addSystemLog,
      resetAll,
      backupData,
      restoreData,
      addPersona,
      togglePersona,
      deletePersona,
      addMediaAsset,
      deleteMediaAsset,
      addRevenueStream,
      updateRevenueStream,
      deleteRevenueStream,
      toggleAIModel,
      addTrend,
      addDataSource,
      toggleDataSource,
      deleteDataSource,
      addAITask,
      updateAITask,
      deleteAITask,
      connectSocialAccount,
      updateSocialAccount,
      deleteSocialAccount,
      updateAIPreferences,
      addAICost,
    ]
  );
});
