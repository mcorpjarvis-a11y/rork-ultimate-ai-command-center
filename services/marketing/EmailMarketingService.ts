import AsyncStorage from '@react-native-async-storage/async-storage';
import AIService from '../ai/AIService';

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  status: 'draft' | 'scheduled' | 'sent' | 'paused';
  audienceSize: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  scheduledFor?: number;
  sentAt?: number;
  tags: string[];
  template: string;
  personalization: boolean;
  aiGenerated: boolean;
}

export interface EmailList {
  id: string;
  name: string;
  subscribers: number;
  growthRate: number;
  engagementScore: number;
  tags: string[];
  createdAt: number;
}

export interface EmailTemplate {
  id: string;
  name: string;
  category: 'promotional' | 'newsletter' | 'welcome' | 'abandoned_cart' | 'product_launch' | 'event';
  subject: string;
  content: string;
  previewText: string;
  thumbnailUrl?: string;
  usageCount: number;
}

export interface EmailAutomation {
  id: string;
  name: string;
  trigger: 'signup' | 'purchase' | 'abandoned_cart' | 'birthday' | 'milestone' | 'inactive';
  action: string;
  delay: number; // in hours
  active: boolean;
  sentCount: number;
  conversionRate: number;
}

class EmailMarketingService {
  private static instance: EmailMarketingService;
  private campaigns: EmailCampaign[] = [];
  private lists: EmailList[] = [];
  private templates: EmailTemplate[] = [];
  private automations: EmailAutomation[] = [];
  private STORAGE_KEY = 'jarvis_email_marketing';

  private constructor() {
    this.loadState();
    this.initializeSampleData();
  }

  static getInstance(): EmailMarketingService {
    if (!EmailMarketingService.instance) {
      EmailMarketingService.instance = new EmailMarketingService();
    }
    return EmailMarketingService.instance;
  }

  private async loadState(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.campaigns = data.campaigns || [];
        this.lists = data.lists || [];
        this.templates = data.templates || [];
        this.automations = data.automations || [];
        console.log('[EmailMarketing] State loaded successfully');
      }
    } catch (error) {
      console.error('[EmailMarketing] Failed to load state:', error);
    }
  }

  private async saveState(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify({
        campaigns: this.campaigns,
        lists: this.lists,
        templates: this.templates,
        automations: this.automations,
      }));
      console.log('[EmailMarketing] State saved successfully');
    } catch (error) {
      console.error('[EmailMarketing] Failed to save state:', error);
    }
  }

  private initializeSampleData(): void {
    if (this.lists.length === 0) {
      this.lists = [
        {
          id: '1',
          name: 'VIP Subscribers',
          subscribers: 5420,
          growthRate: 12.5,
          engagementScore: 89,
          tags: ['vip', 'high-value'],
          createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
        },
        {
          id: '2',
          name: 'Newsletter Subscribers',
          subscribers: 18350,
          growthRate: 8.3,
          engagementScore: 67,
          tags: ['newsletter', 'engaged'],
          createdAt: Date.now() - 180 * 24 * 60 * 60 * 1000,
        },
        {
          id: '3',
          name: 'Product Buyers',
          subscribers: 3290,
          growthRate: 15.7,
          engagementScore: 94,
          tags: ['buyers', 'high-intent'],
          createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
        },
      ];
    }

    if (this.templates.length === 0) {
      this.templates = [
        {
          id: '1',
          name: 'Product Launch',
          category: 'product_launch',
          subject: '🚀 Introducing [Product Name] - You\'ll Love This!',
          content: '<h1>Exciting News!</h1><p>We\'re thrilled to announce...</p>',
          previewText: 'Get early access to our latest creation',
          usageCount: 45,
        },
        {
          id: '2',
          name: 'Weekly Newsletter',
          category: 'newsletter',
          subject: '📰 This Week\'s Top Stories & Updates',
          content: '<h1>Weekly Roundup</h1><p>Here\'s what happened this week...</p>',
          previewText: 'Your weekly dose of insights and updates',
          usageCount: 120,
        },
        {
          id: '3',
          name: 'Welcome Series',
          category: 'welcome',
          subject: '👋 Welcome! Here\'s What to Expect',
          content: '<h1>Welcome Aboard!</h1><p>Thanks for subscribing...</p>',
          previewText: 'Start your journey with us',
          usageCount: 890,
        },
      ];
    }

    if (this.automations.length === 0) {
      this.automations = [
        {
          id: '1',
          name: 'Welcome Email Series',
          trigger: 'signup',
          action: 'Send welcome email and introduce features',
          delay: 0,
          active: true,
          sentCount: 1250,
          conversionRate: 23.5,
        },
        {
          id: '2',
          name: 'Abandoned Cart Recovery',
          trigger: 'abandoned_cart',
          action: 'Send reminder with 10% discount code',
          delay: 24,
          active: true,
          sentCount: 456,
          conversionRate: 18.3,
        },
        {
          id: '3',
          name: 'Re-engagement Campaign',
          trigger: 'inactive',
          action: 'Send "We miss you" email with exclusive offer',
          delay: 720, // 30 days
          active: true,
          sentCount: 234,
          conversionRate: 12.7,
        },
      ];
    }

    if (this.campaigns.length === 0) {
      this.campaigns = [
        {
          id: '1',
          name: 'Black Friday Mega Sale',
          subject: '🎁 Up to 70% OFF - Black Friday Exclusive!',
          content: 'Amazing deals await you...',
          status: 'sent',
          audienceSize: 18350,
          openRate: 42.5,
          clickRate: 15.8,
          conversionRate: 8.2,
          sentAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
          tags: ['sale', 'promotional'],
          template: 'promotional',
          personalization: true,
          aiGenerated: false,
        },
        {
          id: '2',
          name: 'New Product Launch',
          subject: '🚀 Revolutionary New Product - Get 20% Off!',
          content: 'We\'re excited to introduce...',
          status: 'scheduled',
          audienceSize: 5420,
          openRate: 0,
          clickRate: 0,
          conversionRate: 0,
          scheduledFor: Date.now() + 2 * 24 * 60 * 60 * 1000,
          tags: ['product', 'launch'],
          template: 'product_launch',
          personalization: true,
          aiGenerated: true,
        },
      ];
    }
  }

  async generateCampaignWithAI(
    campaignType: string,
    targetAudience: string,
    productOrTopic: string,
    tone: string = 'professional'
  ): Promise<{ subject: string; content: string; previewText: string }> {
    console.log('[EmailMarketing] Generating campaign with AI...');

    const prompt = `Create an email marketing campaign with the following details:
- Campaign Type: ${campaignType}
- Target Audience: ${targetAudience}
- Product/Topic: ${productOrTopic}
- Tone: ${tone}

Generate:
1. A compelling subject line (max 60 characters)
2. Email preview text (max 100 characters)
3. Full email content in HTML format

Make it engaging, conversion-focused, and personalized.`;

    try {
      const result = await AIService.generateText(prompt, {
        temperature: 0.8,
        maxTokens: 1000,
      });

      // Parse AI response (simplified - in real app, use structured output)
      const lines = result.split('\n');
      const subject = lines.find(l => l.includes('Subject:'))?.replace('Subject:', '').trim() || 
                     '🎯 Special Offer Just for You!';
      const previewText = lines.find(l => l.includes('Preview:'))?.replace('Preview:', '').trim() || 
                         'Open to discover something amazing';
      const content = result.replace(/Subject:.*\n/g, '').replace(/Preview:.*\n/g, '').trim();

      return { subject, content, previewText };
    } catch (error) {
      console.error('[EmailMarketing] AI generation failed:', error);
      return {
        subject: `${campaignType} - ${productOrTopic}`,
        content: `<h1>${productOrTopic}</h1><p>Exciting updates for ${targetAudience}...</p>`,
        previewText: 'Open to learn more',
      };
    }
  }

  async createCampaign(
    name: string,
    subject: string,
    content: string,
    listId: string,
    options: {
      scheduledFor?: number;
      tags?: string[];
      template?: string;
      personalization?: boolean;
      aiGenerated?: boolean;
    } = {}
  ): Promise<EmailCampaign> {
    const list = this.lists.find(l => l.id === listId);
    const campaign: EmailCampaign = {
      id: Date.now().toString(),
      name,
      subject,
      content,
      status: options.scheduledFor ? 'scheduled' : 'draft',
      audienceSize: list?.subscribers || 0,
      openRate: 0,
      clickRate: 0,
      conversionRate: 0,
      scheduledFor: options.scheduledFor,
      tags: options.tags || [],
      template: options.template || 'custom',
      personalization: options.personalization || false,
      aiGenerated: options.aiGenerated || false,
    };

    this.campaigns.unshift(campaign);
    await this.saveState();

    console.log(`[EmailMarketing] Campaign created: ${name}`);
    return campaign;
  }

  async sendCampaign(campaignId: string): Promise<void> {
    const campaign = this.campaigns.find(c => c.id === campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    campaign.status = 'sent';
    campaign.sentAt = Date.now();
    
    // Simulate analytics
    setTimeout(() => {
      campaign.openRate = Math.random() * 30 + 25; // 25-55%
      campaign.clickRate = Math.random() * 10 + 5; // 5-15%
      campaign.conversionRate = Math.random() * 5 + 2; // 2-7%
      this.saveState();
    }, 5000);

    await this.saveState();
    console.log(`[EmailMarketing] ✅ Campaign sent: ${campaign.name}`);
  }

  async pauseCampaign(campaignId: string): Promise<void> {
    const campaign = this.campaigns.find(c => c.id === campaignId);
    if (campaign) {
      campaign.status = 'paused';
      await this.saveState();
      console.log(`[EmailMarketing] Campaign paused: ${campaign.name}`);
    }
  }

  async deleteCampaign(campaignId: string): Promise<void> {
    this.campaigns = this.campaigns.filter(c => c.id !== campaignId);
    await this.saveState();
    console.log('[EmailMarketing] Campaign deleted');
  }

  async createList(name: string, tags: string[]): Promise<EmailList> {
    const list: EmailList = {
      id: Date.now().toString(),
      name,
      subscribers: 0,
      growthRate: 0,
      engagementScore: 0,
      tags,
      createdAt: Date.now(),
    };

    this.lists.push(list);
    await this.saveState();

    console.log(`[EmailMarketing] List created: ${name}`);
    return list;
  }

  async createAutomation(
    name: string,
    trigger: EmailAutomation['trigger'],
    action: string,
    delay: number
  ): Promise<EmailAutomation> {
    const automation: EmailAutomation = {
      id: Date.now().toString(),
      name,
      trigger,
      action,
      delay,
      active: true,
      sentCount: 0,
      conversionRate: 0,
    };

    this.automations.push(automation);
    await this.saveState();

    console.log(`[EmailMarketing] Automation created: ${name}`);
    return automation;
  }

  async toggleAutomation(automationId: string): Promise<void> {
    const automation = this.automations.find(a => a.id === automationId);
    if (automation) {
      automation.active = !automation.active;
      await this.saveState();
      console.log(`[EmailMarketing] Automation ${automation.active ? 'activated' : 'deactivated'}`);
    }
  }

  getCampaigns(): EmailCampaign[] {
    return [...this.campaigns];
  }

  getLists(): EmailList[] {
    return [...this.lists];
  }

  getTemplates(): EmailTemplate[] {
    return [...this.templates];
  }

  getAutomations(): EmailAutomation[] {
    return [...this.automations];
  }

  getStats(): {
    totalSubscribers: number;
    totalCampaigns: number;
    averageOpenRate: number;
    averageClickRate: number;
    totalRevenue: number;
  } {
    const sentCampaigns = this.campaigns.filter(c => c.status === 'sent');
    const totalSubscribers = this.lists.reduce((sum, l) => sum + l.subscribers, 0);
    
    return {
      totalSubscribers,
      totalCampaigns: this.campaigns.length,
      averageOpenRate: sentCampaigns.length > 0
        ? sentCampaigns.reduce((sum, c) => sum + c.openRate, 0) / sentCampaigns.length
        : 0,
      averageClickRate: sentCampaigns.length > 0
        ? sentCampaigns.reduce((sum, c) => sum + c.clickRate, 0) / sentCampaigns.length
        : 0,
      totalRevenue: sentCampaigns.reduce((sum, c) => 
        sum + (c.audienceSize * c.conversionRate / 100 * 50), 0), // Estimated at $50 per conversion
    };
  }
}

export default EmailMarketingService.getInstance();
