/**
 * Monetization Data Models and Service
 * Real revenue stream tracking without placeholders
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export type RevenueStreamType = 
  | 'ads'
  | 'affiliate'
  | 'sponsorship'
  | 'merchandise'
  | 'subscription'
  | 'donations'
  | 'courses'
  | 'consulting'
  | 'other';

export interface RevenueStream {
  id: string;
  type: RevenueStreamType;
  platform: string;
  name: string;
  amount: number;
  currency: string;
  frequency: 'one-time' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: number;
  endDate?: number;
  isActive: boolean;
  notes?: string;
  metadata?: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

export interface RevenueStreamCreate {
  type: RevenueStreamType;
  platform: string;
  name: string;
  amount: number;
  currency?: string;
  frequency: 'one-time' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: number;
  endDate?: number;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface RevenueStreamUpdate {
  type?: RevenueStreamType;
  platform?: string;
  name?: string;
  amount?: number;
  currency?: string;
  frequency?: 'one-time' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate?: number;
  endDate?: number;
  isActive?: boolean;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface RevenueAnalytics {
  totalRevenue: number;
  byType: Record<RevenueStreamType, number>;
  byPlatform: Record<string, number>;
  activeStreams: number;
  growth: number; // Percentage
  periodStart: number;
  periodEnd: number;
}

const STORAGE_KEY = '@jarvis:revenue_streams';

class MonetizationService {
  private streams: Map<string, RevenueStream> = new Map();
  private initialized: boolean = false;

  /**
   * Initialize service and load streams from storage
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const streams: RevenueStream[] = JSON.parse(stored);
        streams.forEach(stream => {
          this.streams.set(stream.id, stream);
        });
        console.log(`[MonetizationService] Loaded ${streams.length} revenue streams`);
      }
      this.initialized = true;
    } catch (error) {
      console.error('[MonetizationService] Failed to load streams:', error);
      this.initialized = true;
    }
  }

  /**
   * Save streams to storage
   */
  private async saveToStorage(): Promise<void> {
    try {
      const streams = Array.from(this.streams.values());
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(streams));
      console.log('[MonetizationService] Saved streams to storage');
    } catch (error) {
      console.error('[MonetizationService] Failed to save streams:', error);
      throw error;
    }
  }

  /**
   * Add a new revenue stream
   */
  async addStream(data: RevenueStreamCreate): Promise<RevenueStream> {
    await this.initialize();

    // Validate amount is numeric and positive
    if (typeof data.amount !== 'number' || data.amount < 0) {
      throw new Error('Amount must be a positive number');
    }

    const now = Date.now();
    const stream: RevenueStream = {
      id: `rev_${now}_${Math.random().toString(36).substr(2, 9)}`,
      type: data.type,
      platform: data.platform,
      name: data.name,
      amount: data.amount,
      currency: data.currency || 'USD',
      frequency: data.frequency,
      startDate: data.startDate,
      endDate: data.endDate,
      isActive: true,
      notes: data.notes,
      metadata: data.metadata,
      createdAt: now,
      updatedAt: now,
    };

    this.streams.set(stream.id, stream);
    await this.saveToStorage();

    console.log('[MonetizationService] Added revenue stream:', stream.id);
    return stream;
  }

  /**
   * Update an existing revenue stream
   */
  async updateStream(id: string, updates: RevenueStreamUpdate): Promise<RevenueStream> {
    await this.initialize();

    const stream = this.streams.get(id);
    if (!stream) {
      throw new Error(`Revenue stream not found: ${id}`);
    }

    // Validate amount if being updated
    if (updates.amount !== undefined && (typeof updates.amount !== 'number' || updates.amount < 0)) {
      throw new Error('Amount must be a positive number');
    }

    const updatedStream: RevenueStream = {
      ...stream,
      ...updates,
      updatedAt: Date.now(),
    };

    this.streams.set(id, updatedStream);
    await this.saveToStorage();

    console.log('[MonetizationService] Updated revenue stream:', id);
    return updatedStream;
  }

  /**
   * Delete a revenue stream
   */
  async deleteStream(id: string): Promise<void> {
    await this.initialize();

    if (!this.streams.has(id)) {
      throw new Error(`Revenue stream not found: ${id}`);
    }

    this.streams.delete(id);
    await this.saveToStorage();

    console.log('[MonetizationService] Deleted revenue stream:', id);
  }

  /**
   * Get a single revenue stream by ID
   */
  async getStream(id: string): Promise<RevenueStream | null> {
    await this.initialize();
    return this.streams.get(id) || null;
  }

  /**
   * List all revenue streams with optional filters
   */
  async listStreams(filters?: {
    type?: RevenueStreamType;
    platform?: string;
    isActive?: boolean;
    startDate?: number;
    endDate?: number;
  }): Promise<RevenueStream[]> {
    await this.initialize();

    let streams = Array.from(this.streams.values());

    if (filters) {
      if (filters.type) {
        streams = streams.filter(s => s.type === filters.type);
      }
      if (filters.platform) {
        streams = streams.filter(s => s.platform === filters.platform);
      }
      if (filters.isActive !== undefined) {
        streams = streams.filter(s => s.isActive === filters.isActive);
      }
      if (filters.startDate) {
        streams = streams.filter(s => s.startDate >= filters.startDate!);
      }
      if (filters.endDate) {
        streams = streams.filter(s => !s.endDate || s.endDate <= filters.endDate!);
      }
    }

    // Sort by creation date, newest first
    streams.sort((a, b) => b.createdAt - a.createdAt);

    return streams;
  }

  /**
   * Get revenue analytics for a period
   */
  async getAnalytics(startDate: number, endDate: number): Promise<RevenueAnalytics> {
    await this.initialize();

    const streams = await this.listStreams({
      startDate,
      endDate,
      isActive: true,
    });

    let totalRevenue = 0;
    const byType: Record<string, number> = {};
    const byPlatform: Record<string, number> = {};

    for (const stream of streams) {
      // Calculate revenue for the period based on frequency
      const periodRevenue = this.calculatePeriodRevenue(stream, startDate, endDate);
      totalRevenue += periodRevenue;

      // Aggregate by type
      byType[stream.type] = (byType[stream.type] || 0) + periodRevenue;

      // Aggregate by platform
      byPlatform[stream.platform] = (byPlatform[stream.platform] || 0) + periodRevenue;
    }

    // Calculate growth (compare with previous period)
    const periodLength = endDate - startDate;
    const previousStartDate = startDate - periodLength;
    const previousEndDate = startDate;
    
    const previousStreams = await this.listStreams({
      startDate: previousStartDate,
      endDate: previousEndDate,
      isActive: true,
    });

    let previousRevenue = 0;
    for (const stream of previousStreams) {
      previousRevenue += this.calculatePeriodRevenue(stream, previousStartDate, previousEndDate);
    }

    const growth = previousRevenue > 0 
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;

    return {
      totalRevenue,
      byType: byType as Record<RevenueStreamType, number>,
      byPlatform,
      activeStreams: streams.length,
      growth,
      periodStart: startDate,
      periodEnd: endDate,
    };
  }

  /**
   * Calculate revenue for a specific period based on frequency
   */
  private calculatePeriodRevenue(stream: RevenueStream, startDate: number, endDate: number): number {
    // Check if stream is active in this period
    if (stream.startDate > endDate) return 0;
    if (stream.endDate && stream.endDate < startDate) return 0;

    const periodDays = (endDate - startDate) / (1000 * 60 * 60 * 24);

    switch (stream.frequency) {
      case 'one-time':
        // Only count if it started in this period
        return stream.startDate >= startDate && stream.startDate <= endDate ? stream.amount : 0;
      
      case 'daily':
        return stream.amount * periodDays;
      
      case 'weekly':
        return (stream.amount / 7) * periodDays;
      
      case 'monthly':
        return (stream.amount / 30) * periodDays;
      
      case 'yearly':
        return (stream.amount / 365) * periodDays;
      
      default:
        return 0;
    }
  }

  /**
   * Clear all revenue streams (for testing/reset)
   */
  async clearAll(): Promise<void> {
    this.streams.clear();
    await AsyncStorage.removeItem(STORAGE_KEY);
    console.log('[MonetizationService] Cleared all revenue streams');
  }
}

export default new MonetizationService();
