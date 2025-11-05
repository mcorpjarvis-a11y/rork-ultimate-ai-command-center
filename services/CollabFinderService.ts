import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Influencer {
  id: string;
  name: string;
  username: string;
  platform: string;
  followers: number;
  engagementRate: number;
  niche: string;
  location: string;
  verified: boolean;
  matchScore: number; // 0-100
  collaborationHistory: number;
  responseRate: number; // percentage
  avgResponseTime: string;
  rateRange: string;
  topContent: string[];
  avatarUrl?: string;
}

export interface CollabRequest {
  id: string;
  influencerId: string;
  influencerName: string;
  status: 'pending' | 'accepted' | 'declined' | 'negotiating' | 'completed';
  type: 'sponsored_post' | 'giveaway' | 'product_review' | 'content_swap' | 'joint_video' | 'takeover';
  proposedBudget: number;
  message: string;
  sentAt: number;
  respondedAt?: number;
  completedAt?: number;
}

export interface Collaboration {
  id: string;
  influencerId: string;
  influencerName: string;
  type: CollabRequest['type'];
  budget: number;
  startDate: number;
  endDate?: number;
  status: 'active' | 'completed' | 'cancelled';
  deliverables: string[];
  deliveredCount: number;
  expectedReach: number;
  actualReach?: number;
  roi?: number;
}

class CollabFinderService {
  private static instance: CollabFinderService;
  private influencers: Influencer[] = [];
  private requests: CollabRequest[] = [];
  private collaborations: Collaboration[] = [];
  private STORAGE_KEY = 'jarvis_collab_finder';

  private constructor() {
    this.loadState();
    this.initializeSampleData();
  }

  static getInstance(): CollabFinderService {
    if (!CollabFinderService.instance) {
      CollabFinderService.instance = new CollabFinderService();
    }
    return CollabFinderService.instance;
  }

  private async loadState(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.influencers = data.influencers || [];
        this.requests = data.requests || [];
        this.collaborations = data.collaborations || [];
        console.log('[CollabFinder] State loaded successfully');
      }
    } catch (error) {
      console.error('[CollabFinder] Failed to load state:', error);
    }
  }

  private async saveState(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify({
        influencers: this.influencers,
        requests: this.requests,
        collaborations: this.collaborations,
      }));
      console.log('[CollabFinder] State saved successfully');
    } catch (error) {
      console.error('[CollabFinder] Failed to save state:', error);
    }
  }

  private initializeSampleData(): void {
    if (this.influencers.length === 0) {
      this.influencers = [
        {
          id: '1',
          name: 'Alex Martinez',
          username: '@alexfitpro',
          platform: 'Instagram',
          followers: 125000,
          engagementRate: 7.2,
          niche: 'Fitness',
          location: 'Los Angeles, CA',
          verified: true,
          matchScore: 95,
          collaborationHistory: 23,
          responseRate: 92,
          avgResponseTime: '4 hours',
          rateRange: '$500 - $1,500',
          topContent: ['Workout Videos', 'Nutrition Tips', 'Supplement Reviews'],
        },
        {
          id: '2',
          name: 'Jamie Chen',
          username: '@jamiecooks',
          platform: 'TikTok',
          followers: 450000,
          engagementRate: 12.5,
          niche: 'Food & Cooking',
          location: 'New York, NY',
          verified: true,
          matchScore: 88,
          collaborationHistory: 45,
          responseRate: 85,
          avgResponseTime: '6 hours',
          rateRange: '$1,000 - $3,000',
          topContent: ['Recipe Videos', 'Food Challenges', 'Restaurant Reviews'],
        },
        {
          id: '3',
          name: 'TechSavvy Sam',
          username: '@techsavvysam',
          platform: 'YouTube',
          followers: 890000,
          engagementRate: 8.9,
          niche: 'Technology',
          location: 'San Francisco, CA',
          verified: true,
          matchScore: 82,
          collaborationHistory: 67,
          responseRate: 78,
          avgResponseTime: '12 hours',
          rateRange: '$2,000 - $5,000',
          topContent: ['Product Reviews', 'Tech Tutorials', 'Unboxing Videos'],
        },
        {
          id: '4',
          name: 'Emma Travel',
          username: '@emmaexplores',
          platform: 'Instagram',
          followers: 275000,
          engagementRate: 9.3,
          niche: 'Travel',
          location: 'Global',
          verified: true,
          matchScore: 79,
          collaborationHistory: 34,
          responseRate: 88,
          avgResponseTime: '8 hours',
          rateRange: '$800 - $2,500',
          topContent: ['Travel Guides', 'Hotel Reviews', 'Adventure Videos'],
        },
        {
          id: '5',
          name: 'Fashion Forward Maya',
          username: '@mayastyle',
          platform: 'Instagram',
          followers: 520000,
          engagementRate: 10.1,
          niche: 'Fashion',
          location: 'Milan, Italy',
          verified: true,
          matchScore: 75,
          collaborationHistory: 89,
          responseRate: 95,
          avgResponseTime: '3 hours',
          rateRange: '$1,500 - $4,000',
          topContent: ['Fashion Hauls', 'Styling Tips', 'Outfit Ideas'],
        },
      ];
    }

    if (this.requests.length === 0) {
      this.requests = [
        {
          id: '1',
          influencerId: '1',
          influencerName: 'Alex Martinez',
          status: 'pending',
          type: 'sponsored_post',
          proposedBudget: 1200,
          message: 'Hi Alex! Love your fitness content. Would you be interested in promoting our new protein powder?',
          sentAt: Date.now() - 24 * 60 * 60 * 1000,
        },
        {
          id: '2',
          influencerId: '2',
          influencerName: 'Jamie Chen',
          status: 'accepted',
          type: 'product_review',
          proposedBudget: 2000,
          message: 'Hey Jamie! We\'d love you to review our new kitchen appliance on TikTok!',
          sentAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
          respondedAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
        },
      ];
    }

    if (this.collaborations.length === 0) {
      this.collaborations = [
        {
          id: '1',
          influencerId: '2',
          influencerName: 'Jamie Chen',
          type: 'product_review',
          budget: 2000,
          startDate: Date.now() - 3 * 24 * 60 * 60 * 1000,
          status: 'active',
          deliverables: ['3 TikTok videos', '2 Instagram stories', '1 Blog post'],
          deliveredCount: 2,
          expectedReach: 500000,
        },
      ];
    }
  }

  async searchInfluencers(filters: {
    niche?: string;
    platform?: string;
    minFollowers?: number;
    maxFollowers?: number;
    minEngagement?: number;
    location?: string;
  }): Promise<Influencer[]> {
    let results = [...this.influencers];

    if (filters.niche) {
      results = results.filter(i => i.niche.toLowerCase().includes(filters.niche!.toLowerCase()));
    }
    if (filters.platform) {
      results = results.filter(i => i.platform === filters.platform);
    }
    if (filters.minFollowers) {
      results = results.filter(i => i.followers >= filters.minFollowers!);
    }
    if (filters.maxFollowers) {
      results = results.filter(i => i.followers <= filters.maxFollowers!);
    }
    if (filters.minEngagement) {
      results = results.filter(i => i.engagementRate >= filters.minEngagement!);
    }
    if (filters.location) {
      results = results.filter(i => i.location.toLowerCase().includes(filters.location!.toLowerCase()));
    }

    return results.sort((a, b) => b.matchScore - a.matchScore);
  }

  async sendCollabRequest(
    influencerId: string,
    type: CollabRequest['type'],
    budget: number,
    message: string
  ): Promise<CollabRequest> {
    const influencer = this.influencers.find(i => i.id === influencerId);
    if (!influencer) {
      throw new Error('Influencer not found');
    }

    const request: CollabRequest = {
      id: Date.now().toString(),
      influencerId,
      influencerName: influencer.name,
      status: 'pending',
      type,
      proposedBudget: budget,
      message,
      sentAt: Date.now(),
    };

    this.requests.unshift(request);
    await this.saveState();

    // Simulate response (20% chance of immediate response)
    if (Math.random() < 0.2) {
      setTimeout(() => {
        this.simulateResponse(request.id);
      }, 5000);
    }

    console.log(`[CollabFinder] Request sent to ${influencer.name}`);
    return request;
  }

  private async simulateResponse(requestId: string): Promise<void> {
    const request = this.requests.find(r => r.id === requestId);
    if (request && request.status === 'pending') {
      // 70% acceptance rate
      request.status = Math.random() < 0.7 ? 'accepted' : 'declined';
      request.respondedAt = Date.now();
      
      if (request.status === 'accepted') {
        // Create collaboration
        await this.createCollaboration(request);
      }
      
      await this.saveState();
      console.log(`[CollabFinder] Request ${request.status} by ${request.influencerName}`);
    }
  }

  private async createCollaboration(request: CollabRequest): Promise<void> {
    const collab: Collaboration = {
      id: Date.now().toString(),
      influencerId: request.influencerId,
      influencerName: request.influencerName,
      type: request.type,
      budget: request.proposedBudget,
      startDate: Date.now(),
      status: 'active',
      deliverables: this.getDefaultDeliverables(request.type),
      deliveredCount: 0,
      expectedReach: Math.floor(Math.random() * 1000000) + 100000,
    };

    this.collaborations.unshift(collab);
    await this.saveState();
  }

  private getDefaultDeliverables(type: CollabRequest['type']): string[] {
    const deliverables = {
      sponsored_post: ['1 Instagram post', '3 Stories', '1 Reel'],
      giveaway: ['1 Giveaway post', '3 Promo stories', '1 Winner announcement'],
      product_review: ['1 Review video', '2 Social posts', '1 Blog article'],
      content_swap: ['1 Guest post', '1 Shared video', '2 Cross-promotions'],
      joint_video: ['1 Collab video', '2 Teaser posts', '1 BTS content'],
      takeover: ['24h Instagram takeover', '10+ Stories', '2 Feed posts'],
    };
    return deliverables[type] || ['Custom deliverables'];
  }

  async updateCollaborationStatus(collabId: string, status: Collaboration['status']): Promise<void> {
    const collab = this.collaborations.find(c => c.id === collabId);
    if (collab) {
      collab.status = status;
      if (status === 'completed') {
        collab.endDate = Date.now();
        collab.actualReach = Math.floor(collab.expectedReach * (0.8 + Math.random() * 0.4)); // 80-120% of expected
        collab.roi = ((collab.actualReach! * 0.05) / collab.budget) * 100; // Simplified ROI calculation
      }
      await this.saveState();
      console.log(`[CollabFinder] Collaboration ${status}: ${collab.influencerName}`);
    }
  }

  async markDeliverable(collabId: string): Promise<void> {
    const collab = this.collaborations.find(c => c.id === collabId);
    if (collab && collab.deliveredCount < collab.deliverables.length) {
      collab.deliveredCount++;
      
      if (collab.deliveredCount === collab.deliverables.length) {
        collab.status = 'completed';
        collab.endDate = Date.now();
      }
      
      await this.saveState();
      console.log(`[CollabFinder] Deliverable marked (${collab.deliveredCount}/${collab.deliverables.length})`);
    }
  }

  getInfluencers(): Influencer[] {
    return [...this.influencers].sort((a, b) => b.matchScore - a.matchScore);
  }

  getRequests(): CollabRequest[] {
    return [...this.requests].sort((a, b) => b.sentAt - a.sentAt);
  }

  getCollaborations(): Collaboration[] {
    return [...this.collaborations].sort((a, b) => b.startDate - a.startDate);
  }

  getActiveCollaborations(): Collaboration[] {
    return this.collaborations.filter(c => c.status === 'active');
  }

  getStats(): {
    totalInfluencers: number;
    pendingRequests: number;
    activeCollabs: number;
    completedCollabs: number;
    totalSpent: number;
    averageROI: number;
    totalReach: number;
  } {
    const completed = this.collaborations.filter(c => c.status === 'completed');
    const totalSpent = this.collaborations.reduce((sum, c) => sum + c.budget, 0);
    const averageROI = completed.length > 0
      ? completed.reduce((sum, c) => sum + (c.roi || 0), 0) / completed.length
      : 0;
    const totalReach = completed.reduce((sum, c) => sum + (c.actualReach || 0), 0);

    return {
      totalInfluencers: this.influencers.length,
      pendingRequests: this.requests.filter(r => r.status === 'pending').length,
      activeCollabs: this.collaborations.filter(c => c.status === 'active').length,
      completedCollabs: completed.length,
      totalSpent,
      averageROI,
      totalReach,
    };
  }
}

export default CollabFinderService.getInstance();
