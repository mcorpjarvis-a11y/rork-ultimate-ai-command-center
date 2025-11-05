import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BrandDeal {
  id: string;
  brandName: string;
  brandLogo?: string;
  dealType: 'sponsorship' | 'affiliate' | 'ambassador' | 'product_placement' | 'event';
  budget: number;
  duration: string; // e.g., "3 months", "1 post"
  requirements: string[];
  deliverables: string[];
  category: string;
  platforms: string[];
  minFollowers: number;
  engagementRateRequired: number;
  location: string;
  verified: boolean;
  applications: number;
  acceptanceRate: number;
  avgPayoutTime: string;
  postedAt: number;
  expiresAt: number;
  status: 'open' | 'filled' | 'expired';
}

export interface Application {
  id: string;
  dealId: string;
  brandName: string;
  status: 'pending' | 'accepted' | 'rejected' | 'interview';
  appliedAt: number;
  respondedAt?: number;
  message: string;
  portfolio: string[];
  proposedRate?: number;
}

export interface Contract {
  id: string;
  dealId: string;
  brandName: string;
  dealType: string;
  amount: number;
  startDate: number;
  endDate: number;
  status: 'active' | 'completed' | 'cancelled';
  milestones: ContractMilestone[];
  totalPaid: number;
}

export interface ContractMilestone {
  id: string;
  description: string;
  amount: number;
  dueDate: number;
  status: 'pending' | 'completed' | 'overdue';
  completedAt?: number;
}

class BrandMarketplaceService {
  private static instance: BrandMarketplaceService;
  private deals: BrandDeal[] = [];
  private applications: Application[] = [];
  private contracts: Contract[] = [];
  private STORAGE_KEY = 'jarvis_brand_marketplace';

  private constructor() {
    this.loadState();
    this.initializeSampleData();
  }

  static getInstance(): BrandMarketplaceService {
    if (!BrandMarketplaceService.instance) {
      BrandMarketplaceService.instance = new BrandMarketplaceService();
    }
    return BrandMarketplaceService.instance;
  }

  private async loadState(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.deals = data.deals || [];
        this.applications = data.applications || [];
        this.contracts = data.contracts || [];
        console.log('[BrandMarketplace] State loaded successfully');
      }
    } catch (error) {
      console.error('[BrandMarketplace] Failed to load state:', error);
    }
  }

  private async saveState(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify({
        deals: this.deals,
        applications: this.applications,
        contracts: this.contracts,
      }));
      console.log('[BrandMarketplace] State saved successfully');
    } catch (error) {
      console.error('[BrandMarketplace] Failed to save state:', error);
    }
  }

  private initializeSampleData(): void {
    if (this.deals.length === 0) {
      const now = Date.now();
      this.deals = [
        {
          id: '1',
          brandName: 'FitnessTech Pro',
          dealType: 'sponsorship',
          budget: 5000,
          duration: '3 months',
          requirements: [
            'Minimum 100K followers',
            'Fitness/wellness niche',
            '5%+ engagement rate',
            'Instagram + TikTok presence',
          ],
          deliverables: [
            '6 Instagram posts',
            '12 Stories per month',
            '4 TikTok videos',
            '2 YouTube mentions',
          ],
          category: 'Fitness',
          platforms: ['Instagram', 'TikTok', 'YouTube'],
          minFollowers: 100000,
          engagementRateRequired: 5.0,
          location: 'United States',
          verified: true,
          applications: 42,
          acceptanceRate: 15,
          avgPayoutTime: '14 days',
          postedAt: now - 5 * 24 * 60 * 60 * 1000,
          expiresAt: now + 25 * 24 * 60 * 60 * 1000,
          status: 'open',
        },
        {
          id: '2',
          brandName: 'TechGear Inc',
          dealType: 'product_placement',
          budget: 3000,
          duration: '1 video',
          requirements: [
            'Tech review channel',
            '50K+ subscribers',
            'Previous tech sponsorships',
          ],
          deliverables: [
            '1 dedicated YouTube video',
            '3 Instagram posts',
            'Honest review with pros/cons',
          ],
          category: 'Technology',
          platforms: ['YouTube', 'Instagram'],
          minFollowers: 50000,
          engagementRateRequired: 4.0,
          location: 'Worldwide',
          verified: true,
          applications: 28,
          acceptanceRate: 20,
          avgPayoutTime: '7 days',
          postedAt: now - 3 * 24 * 60 * 60 * 1000,
          expiresAt: now + 27 * 24 * 60 * 60 * 1000,
          status: 'open',
        },
        {
          id: '3',
          brandName: 'EcoBeauty Cosmetics',
          dealType: 'ambassador',
          budget: 10000,
          duration: '6 months',
          requirements: [
            'Beauty/lifestyle influencer',
            '200K+ followers',
            'Aligned with sustainable values',
            'Professional content quality',
          ],
          deliverables: [
            '12 Instagram posts',
            '24 Stories per month',
            '2 YouTube videos',
            'Monthly product reviews',
            'Attend 2 brand events',
          ],
          category: 'Beauty',
          platforms: ['Instagram', 'YouTube', 'TikTok'],
          minFollowers: 200000,
          engagementRateRequired: 6.0,
          location: 'North America',
          verified: true,
          applications: 89,
          acceptanceRate: 5,
          avgPayoutTime: '30 days',
          postedAt: now - 7 * 24 * 60 * 60 * 1000,
          expiresAt: now + 23 * 24 * 60 * 60 * 1000,
          status: 'open',
        },
        {
          id: '4',
          brandName: 'GamerGear',
          dealType: 'affiliate',
          budget: 2000,
          duration: 'Ongoing',
          requirements: [
            'Gaming content creator',
            '25K+ followers',
            'Active streaming schedule',
          ],
          deliverables: [
            'Use affiliate link in bio',
            'Mention in 4 streams per month',
            '2 promotional posts',
          ],
          category: 'Gaming',
          platforms: ['Twitch', 'YouTube', 'Twitter'],
          minFollowers: 25000,
          engagementRateRequired: 3.5,
          location: 'Worldwide',
          verified: true,
          applications: 156,
          acceptanceRate: 35,
          avgPayoutTime: '15 days',
          postedAt: now - 2 * 24 * 60 * 60 * 1000,
          expiresAt: now + 28 * 24 * 60 * 60 * 1000,
          status: 'open',
        },
        {
          id: '5',
          brandName: 'FoodieBox',
          dealType: 'sponsorship',
          budget: 1500,
          duration: '1 month',
          requirements: [
            'Food content creator',
            '30K+ followers',
            'Recipe videos',
          ],
          deliverables: [
            '4 recipe videos featuring products',
            '8 Instagram stories',
            '2 TikTok recipe shorts',
          ],
          category: 'Food',
          platforms: ['Instagram', 'TikTok', 'YouTube'],
          minFollowers: 30000,
          engagementRateRequired: 5.0,
          location: 'United States',
          verified: false,
          applications: 34,
          acceptanceRate: 25,
          avgPayoutTime: '21 days',
          postedAt: now - 4 * 24 * 60 * 60 * 1000,
          expiresAt: now + 26 * 24 * 60 * 60 * 1000,
          status: 'open',
        },
      ];
    }

    if (this.applications.length === 0) {
      this.applications = [
        {
          id: '1',
          dealId: '1',
          brandName: 'FitnessTech Pro',
          status: 'pending',
          appliedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
          message: 'I have been creating fitness content for 3 years with high engagement...',
          portfolio: ['instagram.com/myprofile', 'youtube.com/mychannel'],
          proposedRate: 5000,
        },
      ];
    }

    if (this.contracts.length === 0) {
      const now = Date.now();
      this.contracts = [
        {
          id: '1',
          dealId: '2',
          brandName: 'TechGear Inc',
          dealType: 'product_placement',
          amount: 3000,
          startDate: now - 10 * 24 * 60 * 60 * 1000,
          endDate: now + 20 * 24 * 60 * 60 * 1000,
          status: 'active',
          milestones: [
            {
              id: '1',
              description: 'Upload YouTube video',
              amount: 2000,
              dueDate: now + 5 * 24 * 60 * 60 * 1000,
              status: 'pending',
            },
            {
              id: '2',
              description: 'Post Instagram content',
              amount: 1000,
              dueDate: now + 10 * 24 * 60 * 60 * 1000,
              status: 'pending',
            },
          ],
          totalPaid: 0,
        },
      ];
    }
  }

  async applyToDeal(
    dealId: string,
    message: string,
    portfolio: string[],
    proposedRate?: number
  ): Promise<Application> {
    const deal = this.deals.find(d => d.id === dealId);
    if (!deal) {
      throw new Error('Deal not found');
    }

    const application: Application = {
      id: Date.now().toString(),
      dealId,
      brandName: deal.brandName,
      status: 'pending',
      appliedAt: Date.now(),
      message,
      portfolio,
      proposedRate: proposedRate || deal.budget,
    };

    this.applications.unshift(application);
    deal.applications++;
    await this.saveState();

    // Simulate response (30% chance)
    if (Math.random() < 0.3) {
      setTimeout(() => this.simulateResponse(application.id), 8000);
    }

    console.log(`[BrandMarketplace] Applied to ${deal.brandName}`);
    return application;
  }

  private async simulateResponse(applicationId: string): Promise<void> {
    const application = this.applications.find(a => a.id === applicationId);
    if (application && application.status === 'pending') {
      application.status = Math.random() < 0.6 ? 'accepted' : 'rejected';
      application.respondedAt = Date.now();
      
      if (application.status === 'accepted') {
        await this.createContract(application);
      }
      
      await this.saveState();
      console.log(`[BrandMarketplace] Application ${application.status}`);
    }
  }

  private async createContract(application: Application): Promise<void> {
    const deal = this.deals.find(d => d.id === application.dealId);
    if (!deal) return;

    const contract: Contract = {
      id: Date.now().toString(),
      dealId: application.dealId,
      brandName: application.brandName,
      dealType: deal.dealType,
      amount: application.proposedRate || deal.budget,
      startDate: Date.now(),
      endDate: Date.now() + 90 * 24 * 60 * 60 * 1000, // 90 days
      status: 'active',
      milestones: deal.deliverables.map((deliverable, idx) => ({
        id: `${Date.now()}-${idx}`,
        description: deliverable,
        amount: ((application.proposedRate || deal.budget) / deal.deliverables.length),
        dueDate: Date.now() + (idx + 1) * 15 * 24 * 60 * 60 * 1000,
        status: 'pending' as const,
      })),
      totalPaid: 0,
    };

    this.contracts.unshift(contract);
    await this.saveState();
  }

  async completeMilestone(contractId: string, milestoneId: string): Promise<void> {
    const contract = this.contracts.find(c => c.id === contractId);
    if (!contract) {
      throw new Error('Contract not found');
    }

    const milestone = contract.milestones.find(m => m.id === milestoneId);
    if (!milestone) {
      throw new Error('Milestone not found');
    }

    milestone.status = 'completed';
    milestone.completedAt = Date.now();
    contract.totalPaid += milestone.amount;

    if (contract.milestones.every(m => m.status === 'completed')) {
      contract.status = 'completed';
    }

    await this.saveState();
    console.log(`[BrandMarketplace] ✅ Milestone completed: ${milestone.description}`);
  }

  getDeals(filters?: {
    category?: string;
    minBudget?: number;
    dealType?: string;
  }): BrandDeal[] {
    let results = [...this.deals].filter(d => d.status === 'open');

    if (filters?.category) {
      results = results.filter(d => d.category === filters.category);
    }
    if (filters?.minBudget !== undefined) {
      results = results.filter(d => d.budget >= filters.minBudget!);
    }
    if (filters?.dealType) {
      results = results.filter(d => d.dealType === filters.dealType);
    }

    return results.sort((a, b) => b.budget - a.budget);
  }

  getApplications(): Application[] {
    return [...this.applications].sort((a, b) => b.appliedAt - a.appliedAt);
  }

  getContracts(): Contract[] {
    return [...this.contracts].sort((a, b) => b.startDate - a.startDate);
  }

  getActiveContracts(): Contract[] {
    return this.contracts.filter(c => c.status === 'active');
  }

  getStats(): {
    totalDeals: number;
    pendingApplications: number;
    activeContracts: number;
    totalEarned: number;
    avgDealSize: number;
    successRate: number;
  } {
    const completed = this.contracts.filter(c => c.status === 'completed');
    const totalEarned = completed.reduce((sum, c) => sum + c.totalPaid, 0);
    const pending = this.contracts.filter(c => c.status === 'active').reduce((sum, c) => 
      sum + (c.amount - c.totalPaid), 0);
    
    const respondedApps = this.applications.filter(a => a.respondedAt);
    const acceptedApps = this.applications.filter(a => a.status === 'accepted');
    const successRate = respondedApps.length > 0 
      ? (acceptedApps.length / respondedApps.length) * 100 
      : 0;

    return {
      totalDeals: this.deals.filter(d => d.status === 'open').length,
      pendingApplications: this.applications.filter(a => a.status === 'pending').length,
      activeContracts: this.contracts.filter(c => c.status === 'active').length,
      totalEarned: totalEarned + pending,
      avgDealSize: this.deals.length > 0 
        ? this.deals.reduce((sum, d) => sum + d.budget, 0) / this.deals.length 
        : 0,
      successRate,
    };
  }
}

export default BrandMarketplaceService.getInstance();
