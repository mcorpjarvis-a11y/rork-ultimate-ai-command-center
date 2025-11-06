export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  tier: 'free' | 'pro' | 'enterprise';
  createdAt: number;
  updatedAt: number;
  preferences: UserPreferences;
  stats: UserStats;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  notifications: NotificationSettings;
  voiceSettings: VoiceSettings;
}

export interface VoiceSettings {
  enabled: boolean;
  wakeWord: string;
  voice: 'jarvis'; // Fixed to JARVIS voice only
  speed: number;
  pitch: number;
  volume: number;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  webhooks: string[];
}

export interface UserStats {
  totalContent: number;
  totalRevenue: number;
  totalViews: number;
  totalEngagement: number;
  contentCreated: number;
  aiInteractions: number;
}

export interface SocialAccount {
  id: string;
  platform: string;
  username: string;
  accountId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  isActive: boolean;
  connectedAt: number;
  stats: SocialAccountStats;
  permissions: string[];
}

export interface SocialAccountStats {
  followers: number;
  following: number;
  posts: number;
  engagement: number;
  reach: number;
  lastUpdated: number;
}

export interface Content {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'image' | 'text' | 'audio' | 'mixed';
  status: 'draft' | 'scheduled' | 'published' | 'failed' | 'archived';
  platforms: string[];
  mediaUrls: string[];
  thumbnailUrl?: string;
  tags: string[];
  category: string;
  aiGenerated: boolean;
  performance: ContentPerformance;
  createdAt: number;
  updatedAt: number;
  publishedAt?: number;
  scheduledFor?: number;
  metadata: Record<string, any>;
}

export interface ContentPerformance {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  clicks: number;
  engagement: number;
  reach: number;
  revenue: number;
  ctr: number;
  conversionRate: number;
  platformStats: Record<string, PlatformStats>;
}

export interface PlatformStats {
  platform: string;
  views: number;
  engagement: number;
  revenue: number;
  trending: boolean;
  viralScore: number;
}

export interface Persona {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  tone: string;
  style: string;
  targetAudience: string;
  platforms: string[];
  contentTypes: string[];
  traits: string[];
  examples: string[];
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  objective: string;
  budget: number;
  spent: number;
  status: 'draft' | 'active' | 'paused' | 'completed';
  platforms: string[];
  targetAudience: AudienceTarget;
  content: string[];
  startDate: number;
  endDate: number;
  performance: CampaignPerformance;
  createdAt: number;
  updatedAt: number;
}

export interface AudienceTarget {
  demographics: {
    ageRange: [number, number];
    gender: string[];
    locations: string[];
    languages: string[];
  };
  interests: string[];
  behaviors: string[];
  customAudiences: string[];
}

export interface CampaignPerformance {
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  roi: number;
  cpa: number;
  cpc: number;
  cpm: number;
}

export interface Trend {
  id: string;
  topic: string;
  platform: string;
  score: number;
  volume: number;
  sentiment: number;
  growth: number;
  relatedTopics: string[];
  hashtags: string[];
  keywords: string[];
  firstSeen: number;
  lastUpdated: number;
  prediction: {
    peakTime: number;
    declineTime: number;
    viralPotential: number;
  };
}

export interface ScheduledPost {
  id: string;
  contentId: string;
  platforms: string[];
  scheduledFor: number;
  status: 'pending' | 'processing' | 'published' | 'failed' | 'cancelled';
  variations: Record<string, PostVariation>;
  autoOptimize: boolean;
  retryAttempts: number;
  createdAt: number;
  updatedAt: number;
}

export interface PostVariation {
  platform: string;
  content: string;
  mediaUrls: string[];
  hashtags: string[];
  mentions: string[];
  location?: string;
  optimized: boolean;
}

export interface AITask {
  id: string;
  type: 'content_generation' | 'analysis' | 'optimization' | 'monitoring' | 'automation';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  input: any;
  output?: any;
  error?: string;
  progress: number;
  startedAt?: number;
  completedAt?: number;
  createdAt: number;
  estimatedDuration?: number;
  aiModel: string;
  tokensUsed?: number;
  cost?: number;
}

export interface Analytics {
  period: 'hour' | 'day' | 'week' | 'month' | 'year';
  startDate: number;
  endDate: number;
  metrics: {
    revenue: TimeSeriesData[];
    views: TimeSeriesData[];
    engagement: TimeSeriesData[];
    growth: TimeSeriesData[];
    content: TimeSeriesData[];
    ai_usage: TimeSeriesData[];
  };
  topContent: Content[];
  topPlatforms: PlatformStats[];
  insights: Insight[];
}

export interface TimeSeriesData {
  timestamp: number;
  value: number;
  change?: number;
  changePercent?: number;
}

export interface Insight {
  id: string;
  type: 'positive' | 'negative' | 'neutral' | 'warning';
  title: string;
  description: string;
  recommendation: string;
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
  actions?: InsightAction[];
  createdAt: number;
}

export interface InsightAction {
  id: string;
  label: string;
  type: string;
  payload: any;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger: WorkflowTrigger;
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  isActive: boolean;
  lastRun?: number;
  runCount: number;
  successCount: number;
  failureCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface WorkflowTrigger {
  type: 'schedule' | 'event' | 'webhook' | 'manual';
  config: Record<string, any>;
}

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between';
  value: any;
}

export interface WorkflowAction {
  type: string;
  config: Record<string, any>;
  order: number;
}

export interface SystemLog {
  id: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'critical';
  category: string;
  message: string;
  details?: any;
  userId?: string;
  timestamp: number;
  source: string;
  stackTrace?: string;
}

export interface APIKey {
  id: string;
  name: string;
  service: string;
  key: string;
  isEncrypted: boolean;
  scopes: string[];
  rateLimit?: number;
  expiresAt?: number;
  lastUsed?: number;
  usageCount: number;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface BackupSnapshot {
  id: string;
  name: string;
  description?: string;
  type: 'full' | 'incremental' | 'differential';
  size: number;
  status: 'creating' | 'completed' | 'failed';
  storageLocation: string;
  includes: string[];
  createdAt: number;
  completedAt?: number;
  expiresAt?: number;
  checksum: string;
}

export interface MediaAsset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document';
  format: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  duration?: number;
  dimensions?: { width: number; height: number };
  metadata: Record<string, any>;
  tags: string[];
  aiGenerated: boolean;
  storageProvider: 'local' | 'googledrive' | 'cloudinary' | 's3';
  isPublic: boolean;
  uploadedAt: number;
  usageCount: number;
}
