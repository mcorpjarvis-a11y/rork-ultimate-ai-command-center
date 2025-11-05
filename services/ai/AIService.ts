import { generateObject, generateText } from "ai";
import { createRorkTool, useRorkAgent } from "@rork/toolkit-sdk";
import { AI_CONFIG } from '@/config/api.config';
import APIClient from '@/services/core/APIClient';
import CacheManager from '@/services/storage/CacheManager';
import { AITask } from '@/types/models.types';
import { z } from 'zod';

export interface AIGenerationOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  cache?: boolean;
}

export interface ContentGenerationInput {
  prompt: string;
  type: 'text' | 'image' | 'video' | 'audio';
  platform?: string;
  persona?: string;
  style?: string;
  targetAudience?: string;
  keywords?: string[];
  length?: 'short' | 'medium' | 'long';
}

export interface ContentAnalysisInput {
  content: string;
  mediaUrls?: string[];
  analysisType: 'sentiment' | 'engagement' | 'quality' | 'viral' | 'seo';
}

export interface TrendPredictionInput {
  topic: string;
  platform: string;
  timeframe: number;
  keywords?: string[];
}

class AIService {
  private taskQueue: AITask[] = [];
  private processingTasks: Set<string> = new Set();

  async generateText(
    prompt: string,
    options: AIGenerationOptions = {}
  ): Promise<string> {
    const cacheKey = `ai:text:${this.hashPrompt(prompt)}`;
    
    if (options.cache) {
      const cached = CacheManager.get<string>(cacheKey);
      if (cached) {
        console.log('[AIService] Returning cached text generation');
        return cached;
      }
    }

    console.log('[AIService] Generating text with AI...');
    
    try {
      const result = await generateText({
        messages: [{ role: 'user', content: prompt }],
      });

      if (options.cache) {
        CacheManager.set(cacheKey, result, 30 * 60 * 1000);
      }

      return result;
    } catch (error) {
      console.error('[AIService] Text generation error:', error);
      throw new Error('Failed to generate text with AI');
    }
  }

  async generateObject<T extends z.ZodType>(
    prompt: string,
    schema: T,
    options: AIGenerationOptions = {}
  ): Promise<z.infer<T>> {
    console.log('[AIService] Generating structured object with AI...');
    
    try {
      const result = await generateObject({
        messages: [{ role: 'user', content: prompt }],
        schema,
      });

      return result;
    } catch (error) {
      console.error('[AIService] Object generation error:', error);
      throw new Error('Failed to generate object with AI');
    }
  }

  async generateContent(input: ContentGenerationInput): Promise<{
    content: string;
    metadata: Record<string, any>;
  }> {
    console.log(`[AIService] Generating ${input.type} content for ${input.platform || 'general'}`);

    const systemPrompt = this.buildContentPrompt(input);
    
    const schema = z.object({
      content: z.string().describe('The generated content'),
      hashtags: z.array(z.string()).describe('Relevant hashtags'),
      caption: z.string().describe('Engaging caption'),
      hooks: z.array(z.string()).describe('Attention-grabbing hooks'),
      cta: z.string().describe('Call to action'),
      bestPostTime: z.string().describe('Optimal posting time'),
      estimatedEngagement: z.number().describe('Predicted engagement rate'),
    });

    try {
      const result = await this.generateObject(systemPrompt, schema);
      
      return {
        content: result.content,
        metadata: {
          hashtags: result.hashtags,
          caption: result.caption,
          hooks: result.hooks,
          cta: result.cta,
          bestPostTime: result.bestPostTime,
          estimatedEngagement: result.estimatedEngagement,
          generatedAt: Date.now(),
          platform: input.platform,
        },
      };
    } catch (error) {
      console.error('[AIService] Content generation error:', error);
      throw error;
    }
  }

  async analyzeContent(input: ContentAnalysisInput): Promise<{
    score: number;
    insights: string[];
    recommendations: string[];
    metadata: Record<string, any>;
  }> {
    console.log(`[AIService] Analyzing content for ${input.analysisType}`);

    const prompt = `Analyze this content for ${input.analysisType}:\n\n${input.content}\n\nProvide detailed insights and actionable recommendations.`;

    const schema = z.object({
      score: z.number().min(0).max(100).describe('Overall quality score'),
      sentiment: z.enum(['positive', 'negative', 'neutral']).describe('Content sentiment'),
      insights: z.array(z.string()).describe('Key insights about the content'),
      recommendations: z.array(z.string()).describe('Improvement recommendations'),
      strengths: z.array(z.string()).describe('Content strengths'),
      weaknesses: z.array(z.string()).describe('Areas to improve'),
      viralPotential: z.number().min(0).max(100).describe('Likelihood to go viral'),
      targetAudience: z.string().describe('Best suited audience'),
      keywords: z.array(z.string()).describe('Important keywords found'),
    });

    try {
      const result = await this.generateObject(prompt, schema);

      return {
        score: result.score,
        insights: result.insights,
        recommendations: result.recommendations,
        metadata: {
          sentiment: result.sentiment,
          strengths: result.strengths,
          weaknesses: result.weaknesses,
          viralPotential: result.viralPotential,
          targetAudience: result.targetAudience,
          keywords: result.keywords,
          analyzedAt: Date.now(),
        },
      };
    } catch (error) {
      console.error('[AIService] Content analysis error:', error);
      throw error;
    }
  }

  async predictTrend(input: TrendPredictionInput): Promise<{
    prediction: string;
    confidence: number;
    timeline: Array<{ date: number; score: number }>;
    recommendations: string[];
  }> {
    console.log(`[AIService] Predicting trend for ${input.topic} on ${input.platform}`);

    const prompt = `Predict the trend trajectory for "${input.topic}" on ${input.platform} over the next ${input.timeframe} days. Consider current market conditions, historical data, and emerging patterns.`;

    const schema = z.object({
      prediction: z.string().describe('Detailed trend prediction'),
      confidence: z.number().min(0).max(100).describe('Prediction confidence level'),
      peakDate: z.string().describe('Expected peak date'),
      declineDate: z.string().describe('Expected decline date'),
      viralProbability: z.number().min(0).max(100).describe('Probability of going viral'),
      recommendations: z.array(z.string()).describe('Action recommendations'),
      relatedTopics: z.array(z.string()).describe('Related trending topics'),
      targetDemographics: z.array(z.string()).describe('Best target demographics'),
    });

    try {
      const result = await this.generateObject(prompt, schema);

      const timeline = this.generateTrendTimeline(
        input.timeframe,
        result.peakDate,
        result.viralProbability
      );

      return {
        prediction: result.prediction,
        confidence: result.confidence,
        timeline,
        recommendations: result.recommendations,
      };
    } catch (error) {
      console.error('[AIService] Trend prediction error:', error);
      throw error;
    }
  }

  async optimizeContent(
    content: string,
    platform: string,
    objective: string
  ): Promise<{
    optimizedContent: string;
    improvements: string[];
    expectedImprovement: number;
  }> {
    console.log(`[AIService] Optimizing content for ${platform}`);

    const prompt = `Optimize this content for ${platform} with the objective: ${objective}\n\nOriginal content:\n${content}\n\nProvide an optimized version with detailed improvements.`;

    const schema = z.object({
      optimizedContent: z.string().describe('The optimized content'),
      improvements: z.array(z.string()).describe('List of improvements made'),
      expectedImprovement: z.number().describe('Expected engagement improvement percentage'),
      reasoning: z.string().describe('Why these changes improve the content'),
    });

    try {
      const result = await this.generateObject(prompt, schema);

      return {
        optimizedContent: result.optimizedContent,
        improvements: result.improvements,
        expectedImprovement: result.expectedImprovement,
      };
    } catch (error) {
      console.error('[AIService] Content optimization error:', error);
      throw error;
    }
  }

  async generateImage(prompt: string, size?: string): Promise<{ base64Data: string; mimeType: string }> {
    console.log('[AIService] Generating image with DALL-E 3...');

    try {
      const response = await fetch(AI_CONFIG.toolkit.imageGenURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, size: size || '1024x1024' }),
      });

      if (!response.ok) {
        throw new Error('Image generation failed');
      }

      const data = await response.json();
      return data.image;
    } catch (error) {
      console.error('[AIService] Image generation error:', error);
      throw error;
    }
  }

  async editImage(
    prompt: string,
    images: Array<{ type: 'image'; image: string }>
  ): Promise<{ base64Data: string; mimeType: string }> {
    console.log('[AIService] Editing image with Gemini...');

    try {
      const response = await fetch(AI_CONFIG.toolkit.imageEditURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, images }),
      });

      if (!response.ok) {
        throw new Error('Image editing failed');
      }

      const data = await response.json();
      return data.image;
    } catch (error) {
      console.error('[AIService] Image editing error:', error);
      throw error;
    }
  }

  async transcribeAudio(audioFile: File, language?: string): Promise<{ text: string; language: string }> {
    console.log('[AIService] Transcribing audio...');

    try {
      const formData = new FormData();
      formData.append('audio', audioFile);
      if (language) {
        formData.append('language', language);
      }

      const response = await fetch(AI_CONFIG.toolkit.sttURL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Audio transcription failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[AIService] Audio transcription error:', error);
      throw error;
    }
  }

  async createTask(task: Omit<AITask, 'id' | 'createdAt'>): Promise<AITask> {
    const newTask: AITask = {
      ...task,
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
    };

    this.taskQueue.push(newTask);
    console.log(`[AIService] Created task ${newTask.id}`);

    if (task.status === 'queued') {
      this.processQueue();
    }

    return newTask;
  }

  private async processQueue(): Promise<void> {
    const pendingTasks = this.taskQueue.filter(
      t => t.status === 'queued' && !this.processingTasks.has(t.id)
    );

    if (pendingTasks.length === 0) return;

    const task = pendingTasks[0];
    this.processingTasks.add(task.id);
    task.status = 'processing';
    task.startedAt = Date.now();

    console.log(`[AIService] Processing task ${task.id}`);

    try {
      await this.executeTask(task);
      task.status = 'completed';
      task.completedAt = Date.now();
      task.progress = 100;
    } catch (error: any) {
      console.error(`[AIService] Task ${task.id} failed:`, error);
      task.status = 'failed';
      task.error = error.message;
    } finally {
      this.processingTasks.delete(task.id);
      this.processQueue();
    }
  }

  private async executeTask(task: AITask): Promise<void> {
    switch (task.type) {
      case 'content_generation':
        task.output = await this.generateContent(task.input);
        break;
      case 'analysis':
        task.output = await this.analyzeContent(task.input);
        break;
      case 'optimization':
        task.output = await this.optimizeContent(
          task.input.content,
          task.input.platform,
          task.input.objective
        );
        break;
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  private buildContentPrompt(input: ContentGenerationInput): string {
    let prompt = `Generate ${input.type} content`;
    
    if (input.platform) prompt += ` for ${input.platform}`;
    if (input.persona) prompt += ` using persona: ${input.persona}`;
    if (input.style) prompt += ` in style: ${input.style}`;
    if (input.targetAudience) prompt += ` targeting: ${input.targetAudience}`;
    if (input.keywords?.length) prompt += ` with keywords: ${input.keywords.join(', ')}`;
    if (input.length) prompt += ` (${input.length} length)`;
    
    prompt += `\n\nPrompt: ${input.prompt}`;
    
    return prompt;
  }

  private generateTrendTimeline(
    days: number,
    peakDate: string,
    viralProbability: number
  ): Array<{ date: number; score: number }> {
    const timeline = [];
    const peak = new Date(peakDate).getTime();
    const now = Date.now();

    for (let i = 0; i < days; i++) {
      const date = now + i * 24 * 60 * 60 * 1000;
      const progress = (date - now) / (peak - now);
      const score = Math.min(100, viralProbability * Math.sin(progress * Math.PI));
      timeline.push({ date, score });
    }

    return timeline;
  }

  private hashPrompt(prompt: string): string {
    let hash = 0;
    for (let i = 0; i < prompt.length; i++) {
      const char = prompt.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  getTasks(): AITask[] {
    return this.taskQueue;
  }

  getTaskById(id: string): AITask | undefined {
    return this.taskQueue.find(t => t.id === id);
  }

  cancelTask(id: string): boolean {
    const task = this.getTaskById(id);
    if (task && task.status !== 'completed' && task.status !== 'failed') {
      task.status = 'cancelled';
      this.processingTasks.delete(id);
      return true;
    }
    return false;
  }
}

export default new AIService();
