import express, { Request, Response, Router } from 'express';
import { queryJarvis } from '../../services/JarvisAPIRouter';

const router: Router = express.Router();

/**
 * Ask/Reasoning Routes
 * Main AI reasoning route - connects to Gemini, Hugging Face, or OpenAI
 */

interface AskRequestBody {
  question: string;
  context?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

// Provider to display name mapping
const PROVIDER_DISPLAY_NAMES: Record<string, string> = {
  'google': 'Gemini',
  'groq': 'Groq',
  'huggingface': 'HuggingFace',
  'togetherai': 'Together.ai',
  'deepseek': 'DeepSeek',
};

// Main reasoning endpoint
router.post('/', async (req: Request<{}, {}, AskRequestBody>, res: Response) => {
  try {
    const { question, context, model, temperature, maxTokens } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // Construct the prompt with context
    const prompt = context 
      ? `${context}\n\nUser: ${question}` 
      : question;

    // Determine which provider to use based on model preference
    const providers: Array<'groq' | 'google'> = [];
    
    if (!model || model === 'groq') {
      providers.push('groq');
    }
    if (!model || model === 'gemini' || model === 'google') {
      providers.push('google');
    }
    
    // If no specific model requested, try in order of preference
    if (!model) {
      providers.splice(0, providers.length, 'groq', 'google');
    }

    let result;
    let usedProvider;

    // Try each provider in order until one succeeds
    for (const provider of providers) {
      result = await queryJarvis(prompt, provider);
      if (result.success) {
        usedProvider = provider;
        break;
      }
    }

    if (result && result.success && result.content) {
      res.json({
        success: true,
        answer: result.content,
        service: usedProvider ? PROVIDER_DISPLAY_NAMES[usedProvider] || usedProvider : 'Unknown',
        model: model || 'auto'
      });
    } else {
      res.json({
        success: false,
        message: result?.error || 'No AI service available. Please add API keys.',
        guidance: {
          services: [
            { name: 'Groq', env: 'EXPO_PUBLIC_GROQ_API_KEY', url: 'https://console.groq.com', tier: 'free' },
            { name: 'Gemini', env: 'EXPO_PUBLIC_GEMINI_API_KEY', url: 'https://makersuite.google.com', tier: 'free' },
            { name: 'HuggingFace', env: 'EXPO_PUBLIC_HF_API_TOKEN', url: 'https://huggingface.co/settings/tokens', tier: 'free' }
          ]
        }
      });
    }
  } catch (error) {
    console.error('[Ask] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
});

// Get available models
router.get('/models', (req: Request, res: Response) => {
  const models = [];

  if (process.env.EXPO_PUBLIC_GROQ_API_KEY) {
    models.push({
      id: 'groq',
      name: 'Groq (Llama 3.1)',
      provider: 'Groq',
      available: true,
      tier: 'free',
      speed: 'very_fast'
    });
  }

  if (process.env.EXPO_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY) {
    models.push({
      id: 'gemini',
      name: 'Gemini Pro',
      provider: 'Google',
      available: true,
      tier: 'free',
      speed: 'fast'
    });
  }

  if (process.env.EXPO_PUBLIC_HF_API_TOKEN || process.env.HUGGINGFACE_API_KEY) {
    models.push({
      id: 'huggingface',
      name: 'Mistral 7B',
      provider: 'HuggingFace',
      available: true,
      tier: 'free',
      speed: 'moderate'
    });
  }

  res.json({ models, count: models.length });
});

export default router;
