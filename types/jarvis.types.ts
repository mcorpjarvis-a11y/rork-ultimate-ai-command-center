export interface JarvisSettings {
  voice: {
    enabled: boolean;
    voice: string;
    rate: number;
    pitch: number;
    language: string;
    autoSpeak: boolean;
    volume: number;
  };
  autonomy: {
    maxDailySpend: number;
    maxPerCampaign: number;
    autoPostContent: boolean;
    autoRespondCustomers: boolean;
    autoFulfillOrders: boolean;
    autoOptimizeCampaigns: boolean;
    requireApprovalOver: number;
  };
  notifications: {
    opportunities: boolean;
    alerts: boolean;
    dailyReports: boolean;
    weeklyReports: boolean;
    sound: boolean;
    vibration: boolean;
  };
  display: {
    theme: 'ironman' | 'dark' | 'jarvis';
    compactMode: boolean;
    animations: boolean;
    fps: 30 | 60;
  };
  advanced: {
    debugMode: boolean;
    apiLogging: boolean;
    performanceMonitoring: boolean;
    experimentalFeatures: boolean;
  };
}

export interface JarvisCapability {
  id: string;
  name: string;
  description: string;
  category: 'revenue' | 'content' | 'analytics' | 'automation' | 'social' | 'ai';
  enabled: boolean;
  icon: string;
  status: 'active' | 'inactive' | 'error';
  lastUsed: number | null;
  usageCount: number;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  action?: string;
  completed: boolean;
}

export interface RevenueOpportunity {
  id: string;
  title: string;
  description: string;
  projectedRevenue: number;
  confidence: number;
  effort: 'low' | 'medium' | 'high';
  timeToRevenue: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected' | 'in-progress';
  createdAt: number;
}

export interface AutonomousAction {
  id: string;
  type: 'content_post' | 'ad_optimization' | 'product_listing' | 'customer_response' | 'workflow_trigger';
  description: string;
  platform?: string;
  outcome: string;
  metrics?: {
    revenue?: number;
    engagement?: number;
    clicks?: number;
    conversions?: number;
  };
  timestamp: number;
}

export interface ApprovalRequest {
  id: string;
  type: 'product' | 'content' | 'campaign' | 'spending' | 'partnership';
  title: string;
  description: string;
  details: any;
  projectedImpact: {
    revenue?: number;
    cost?: number;
    roi?: number;
    reach?: number;
  };
  priority: 'low' | 'medium' | 'high' | 'urgent';
  deadline?: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
}
