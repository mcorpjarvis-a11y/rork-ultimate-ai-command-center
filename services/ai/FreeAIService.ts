import { FREE_AI_MODELS } from '@/config/api.config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_PREFIX = '@free_ai_keys:';

export interface FreeAIProvider {
  id: string;
  name: string;
  baseURL: string;
  apiKey: string;
  tier: 'free' | 'freemium';
  status: 'not_configured' | 'configured' | 'connected' | 'error';
  rateLimits: { requests: number; window: number };
  models: {
    text?: Record<string, string>;
    image?: Record<string, string>;
    audio?: Record<string, string>;
    code?: Record<string, string>;
  };
}

class FreeAIService {
  private providers: Map<string, FreeAIProvider> = new Map();
  private requestCounts: Map<string, { count: number; resetAt: number }> = new Map();

  constructor() {
    this.initializeProviders();
    console.log('[FreeAIService] Initialized with API keys:');
    console.log('[FreeAIService] - Groq:', this.providers.get('groq')?.apiKey ? '✓ Configured' : '✗ Not configured');
    console.log('[FreeAIService] - Hugging Face:', this.providers.get('huggingface')?.apiKey ? '✓ Configured' : '✗ Not configured');
  }

  private initializeProviders() {
    Object.entries(FREE_AI_MODELS).forEach(([id, config]) => {
      this.providers.set(id, {
        id,
        name: this.getProviderName(id),
        baseURL: config.baseURL,
        apiKey: config.apiKey,
        tier: config.tier as 'free' | 'freemium',
        status: config.apiKey ? 'configured' : 'not_configured',
        rateLimits: config.rateLimits,
        models: config.models,
      });
    });
  }

  private getProviderName(id: string): string {
    const names: Record<string, string> = {
      huggingface: 'Hugging Face',
      togetherai: 'Together AI',
      deepseek: 'DeepSeek',
      groq: 'Groq',
      replicate: 'Replicate',
    };
    return names[id] || id;
  }

  async loadAPIKeys(): Promise<void> {
    console.log('[FreeAIService] Loading API keys from storage...');
    for (const [id, provider] of this.providers.entries()) {
      try {
        const stored = await AsyncStorage.getItem(`${STORAGE_KEY_PREFIX}${id}`);
        if (stored) {
          provider.apiKey = stored;
          provider.status = 'configured';
          console.log(`[FreeAIService] Loaded key for ${provider.name}`);
        }
      } catch (error) {
        console.error(`[FreeAIService] Failed to load key for ${id}:`, error);
      }
    }
  }

  async saveAPIKey(providerId: string, apiKey: string): Promise<boolean> {
    try {
      await AsyncStorage.setItem(`${STORAGE_KEY_PREFIX}${providerId}`, apiKey);
      const provider = this.providers.get(providerId);
      if (provider) {
        provider.apiKey = apiKey;
        provider.status = 'configured';
        console.log(`[FreeAIService] Saved key for ${provider.name}`);
      }
      return true;
    } catch (error) {
      console.error(`[FreeAIService] Failed to save key for ${providerId}:`, error);
      return false;
    }
  }

  getAllProviders(): FreeAIProvider[] {
    return Array.from(this.providers.values());
  }

  getProvider(id: string): FreeAIProvider | undefined {
    return this.providers.get(id);
  }

  getConfiguredProviders(): FreeAIProvider[] {
    return Array.from(this.providers.values()).filter(p => p.status !== 'not_configured');
  }

  async testConnection(providerId: string): Promise<{ success: boolean; message: string }> {
    const provider = this.providers.get(providerId);
    if (!provider) {
      return { success: false, message: 'Provider not found' };
    }

    if (!provider.apiKey || provider.apiKey === '') {
      return { success: false, message: 'API key not configured' };
    }

    console.log(`[FreeAIService] Testing connection for ${provider.name}...`);

    try {
      switch (providerId) {
        case 'groq':
          return await this.testGroq(provider);
        case 'huggingface':
          return await this.testHuggingFace(provider);
        case 'togetherai':
          return await this.testTogetherAI(provider);
        case 'deepseek':
          return await this.testDeepSeek(provider);
        case 'replicate':
          return await this.testReplicate(provider);
        default:
          return { success: true, message: `${provider.name} configured (test not implemented)` };
      }
    } catch (error: any) {
      provider.status = 'error';
      console.error(`[FreeAIService] Test failed for ${provider.name}:`, error);
      return { success: false, message: `Test failed: ${error.message}` };
    }
  }

  private async testGroq(provider: FreeAIProvider): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${provider.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 5,
      }),
    });

    if (response.ok) {
      provider.status = 'connected';
      return { success: true, message: 'Groq connected successfully!' };
    } else {
      provider.status = 'error';
      const error = await response.text();
      return { success: false, message: `Groq error: ${error}` };
    }
  }

  private async testHuggingFace(provider: FreeAIProvider): Promise<{ success: boolean; message: string }> {
    const model = provider.models.text?.['mistral-7b'];
    if (!model) {
      return { success: false, message: 'No test model available' };
    }

    const response = await fetch(`${provider.baseURL}/${model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: 'test',
        parameters: { max_new_tokens: 5 },
      }),
    });

    if (response.ok) {
      provider.status = 'connected';
      return { success: true, message: 'Hugging Face connected successfully!' };
    } else {
      provider.status = 'error';
      const error = await response.text();
      return { success: false, message: `Hugging Face error: ${error}` };
    }
  }

  private async testTogetherAI(provider: FreeAIProvider): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${provider.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 5,
      }),
    });

    if (response.ok) {
      provider.status = 'connected';
      return { success: true, message: 'Together AI connected successfully!' };
    } else {
      provider.status = 'error';
      const error = await response.text();
      return { success: false, message: `Together AI error: ${error}` };
    }
  }

  private async testDeepSeek(provider: FreeAIProvider): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${provider.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 5,
      }),
    });

    if (response.ok) {
      provider.status = 'connected';
      return { success: true, message: 'DeepSeek connected successfully!' };
    } else {
      provider.status = 'error';
      const error = await response.text();
      return { success: false, message: `DeepSeek error: ${error}` };
    }
  }

  private async testReplicate(provider: FreeAIProvider): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${provider.baseURL}/predictions`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${provider.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'test',
        input: { prompt: 'test' },
      }),
    });

    if (response.status === 201 || response.status === 200) {
      provider.status = 'connected';
      return { success: true, message: 'Replicate connected successfully!' };
    } else {
      provider.status = 'error';
      const error = await response.text();
      return { success: false, message: `Replicate error: ${error}` };
    }
  }

  async generateText(
    prompt: string,
    options: {
      provider?: string;
      model?: string;
      maxTokens?: number;
      temperature?: number;
    } = {}
  ): Promise<string> {
    const provider = options.provider
      ? this.providers.get(options.provider)
      : this.selectBestProvider('text');

    if (!provider || provider.status !== 'connected') {
      throw new Error('No configured provider available for text generation');
    }

    if (!this.checkRateLimit(provider.id)) {
      throw new Error(`Rate limit exceeded for ${provider.name}. Please wait.`);
    }

    console.log(`[FreeAIService] Generating text with ${provider.name}...`);

    switch (provider.id) {
      case 'groq':
        return await this.generateTextGroq(provider, prompt, options);
      case 'togetherai':
        return await this.generateTextTogetherAI(provider, prompt, options);
      case 'deepseek':
        return await this.generateTextDeepSeek(provider, prompt, options);
      case 'huggingface':
        return await this.generateTextHuggingFace(provider, prompt, options);
      default:
        throw new Error(`Text generation not implemented for ${provider.name}`);
    }
  }

  private async generateTextGroq(
    provider: FreeAIProvider,
    prompt: string,
    options: any
  ): Promise<string> {
    const model = options.model || 'llama-3.1-8b-instant';
    
    const response = await fetch(`${provider.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options.maxTokens || 1024,
        temperature: options.temperature || 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private async generateTextTogetherAI(
    provider: FreeAIProvider,
    prompt: string,
    options: any
  ): Promise<string> {
    const model = options.model || 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo';
    
    const response = await fetch(`${provider.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options.maxTokens || 1024,
        temperature: options.temperature || 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Together AI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private async generateTextDeepSeek(
    provider: FreeAIProvider,
    prompt: string,
    options: any
  ): Promise<string> {
    const model = options.model || 'deepseek-chat';
    
    const response = await fetch(`${provider.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options.maxTokens || 1024,
        temperature: options.temperature || 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private async generateTextHuggingFace(
    provider: FreeAIProvider,
    prompt: string,
    options: any
  ): Promise<string> {
    const model = provider.models.text?.['mistral-7b'];
    if (!model) {
      throw new Error('No text model available for Hugging Face');
    }

    const response = await fetch(`${provider.baseURL}/${model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: options.maxTokens || 1024,
          temperature: options.temperature || 0.7,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.statusText}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data[0]?.generated_text || '' : data.generated_text || '';
  }

  private selectBestProvider(taskType: 'text' | 'image' | 'audio' | 'code'): FreeAIProvider | undefined {
    const configured = this.getConfiguredProviders().filter(p => p.status === 'connected');

    for (const provider of configured) {
      if (provider.models[taskType] && this.checkRateLimit(provider.id)) {
        console.log(`[FreeAIService] Selected ${provider.name} for ${taskType} task`);
        return provider;
      }
    }

    return configured[0];
  }

  private checkRateLimit(providerId: string): boolean {
    const provider = this.providers.get(providerId);
    if (!provider) return false;

    const now = Date.now();
    const rateInfo = this.requestCounts.get(providerId);

    if (!rateInfo || now > rateInfo.resetAt) {
      this.requestCounts.set(providerId, {
        count: 1,
        resetAt: now + provider.rateLimits.window,
      });
      return true;
    }

    if (rateInfo.count < provider.rateLimits.requests) {
      rateInfo.count++;
      return true;
    }

    console.warn(`[FreeAIService] Rate limit exceeded for ${provider.name}`);
    return false;
  }

  async getStats(): Promise<{
    totalProviders: number;
    configured: number;
    connected: number;
    totalRequests: number;
  }> {
    const providers = Array.from(this.providers.values());
    const totalRequests = Array.from(this.requestCounts.values()).reduce(
      (sum, info) => sum + info.count,
      0
    );

    return {
      totalProviders: providers.length,
      configured: providers.filter(p => p.status !== 'not_configured').length,
      connected: providers.filter(p => p.status === 'connected').length,
      totalRequests,
    };
  }

  async generateImage(
    prompt: string,
    options: { provider?: string; model?: string; size?: string } = {}
  ): Promise<{ url?: string; base64?: string }> {
    const provider = options.provider
      ? this.providers.get(options.provider)
      : this.selectBestProvider('image');

    if (!provider || provider.status !== 'connected') {
      throw new Error('No configured provider available for image generation');
    }

    console.log(`[FreeAIService] Generating image with ${provider.name}...`);

    if (provider.id === 'togetherai') {
      const model = options.model || 'black-forest-labs/FLUX.1-schnell-Free';
      const response = await fetch(`${provider.baseURL}/images/generations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${provider.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          prompt,
          n: 1,
          size: options.size || '1024x1024',
        }),
      });

      if (!response.ok) {
        throw new Error(`Together AI image generation failed: ${response.statusText}`);
      }

      const data = await response.json();
      return { url: data.data[0].url };
    }

    throw new Error(`Image generation not implemented for ${provider.name}`);
  }

  /**
   * Test a specific provider connection
   * Wrapper around testConnection for easier use
   */
  async testProvider(providerId: string): Promise<void> {
    const result = await this.testConnection(providerId);
    if (!result.success) {
      throw new Error(result.message);
    }
  }
}

export default new FreeAIService();
