export interface MetricData {
  followers: number;
  engagementRate: number;
  monthlyRevenue: number;
  conversionRate: number;
}

export interface ChartDataPoint {
  week: string;
  followers: number;
  engagement: number;
}

export interface AIInsight {
  id: string;
  message: string;
  timestamp: number;
}

export interface APIKey {
  id: string;
  name: string;
  key: string;
  createdAt: number;
  lastUsed: number | null;
}

export interface SocialAccount {
  id: string;
  platform: string;
  username: string;
  connected: boolean;
  followers: number;
  category: 'social' | 'gaming' | 'ecommerce' | 'video' | 'messaging' | 'professional' | 'other';
  apiKey?: string;
  accessToken?: string;
  refreshToken?: string;
  lastSync?: number;
  engagement?: number;
  posts?: number;
  revenue?: number;
}

export interface ScheduledTask {
  id: string;
  title: string;
  description: string;
  scheduledTime: number;
  status: 'pending' | 'completed' | 'failed';
  type: string;
}

export interface WorkflowRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  enabled: boolean;
}

export interface ContentItem {
  id: string;
  title: string;
  content: string;
  type: string;
  createdAt: number;
  status: 'draft' | 'published' | 'scheduled';
}

export interface SystemLog {
  id: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  timestamp: number;
  category: string;
}

export interface Persona {
  id: string;
  name: string;
  description: string;
  tone: string;
  topics: string[];
  targetAudience: string;
  active: boolean;
  createdAt: number;
}

export interface MediaAsset {
  id: string;
  title: string;
  type: 'image' | 'video' | 'audio' | 'gif';
  url: string;
  thumbnail?: string;
  duration?: number;
  size: number;
  tags: string[];
  createdAt: number;
  aiGenerated: boolean;
  prompt?: string;
}

export interface RevenueStream {
  id: string;
  name: string;
  type: 'sponsorship' | 'affiliate' | 'subscription' | 'ads' | 'merchandise' | 'tips' | 'courses' | 'nft';
  platform: string;
  amount: number;
  currency: string;
  status: 'active' | 'pending' | 'paused';
  lastPayout?: number;
  nextPayout?: number;
}

export interface AIModel {
  id: string;
  name: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'multimodal';
  provider: string;
  enabled: boolean;
  cost: number;
  tokensUsed: number;
  lastUsed: number | null;
  tier: 'free' | 'paid' | 'premium';
  apiKey?: string;
  endpoint?: string;
  maxTokens?: number;
  contextWindow?: number;
  recommended?: boolean;
}

export interface AITask {
  id: string;
  type: 'content_generation' | 'image_generation' | 'video_editing' | 'trend_analysis' | 'engagement' | 'scheduling' | 'optimization' | 'report_generation' | 'code_building' | 'data_analysis';
  description: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedModel?: string;
  progress: number;
  result?: any;
  error?: string;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  costSaved?: number;
  modelTier?: 'free' | 'paid' | 'premium';
}

export interface Trend {
  id: string;
  topic: string;
  platform: string;
  volume: number;
  sentiment: number;
  growth: number;
  relevance: number;
  hashtags: string[];
  suggestedContent: string;
  timestamp: number;
}

export interface AnalyticsData {
  platform: string;
  date: string;
  impressions: number;
  reach: number;
  engagement: number;
  clicks: number;
  shares: number;
  comments: number;
  likes: number;
  saves: number;
  revenue: number;
}

export interface DataSource {
  id: string;
  name: string;
  type: 'rss' | 'api' | 'webhook' | 'scraper' | 'database';
  url: string;
  enabled: boolean;
  lastFetch: number | null;
  interval: number;
  dataCount: number;
}

export interface AIPreferences {
  useFreeTierFirst: boolean;
  maxDailySpend: number;
  preferredTextModel: string;
  preferredImageModel: string;
  preferredCodeModel: string;
  preferredDataModel: string;
  autoSelectBestModel: boolean;
  trackCosts: boolean;
}

export interface AppState {
  metrics: MetricData;
  chartData: ChartDataPoint[];
  insights: AIInsight[];
  apiKeys: APIKey[];
  socialAccounts: SocialAccount[];
  scheduledTasks: ScheduledTask[];
  workflowRules: WorkflowRule[];
  contentItems: ContentItem[];
  systemLogs: SystemLog[];
  notifications: number;
  personas: Persona[];
  mediaAssets: MediaAsset[];
  revenueStreams: RevenueStream[];
  aiModels: AIModel[];
  trends: Trend[];
  analyticsData: AnalyticsData[];
  dataSources: DataSource[];
  aiTaskQueue: AITask[];
  aiPreferences: AIPreferences;
  totalAICost: number;
  totalCostSaved: number;
}
