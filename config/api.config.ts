export const API_CONFIG = {
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'https://api.jarvis-command.com',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
};

export const FREE_AI_MODELS = {
  huggingface: {
    baseURL: 'https://api-inference.huggingface.co/models',
    apiKey: process.env.EXPO_PUBLIC_HF_API_TOKEN || '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', // Burner key for development - will be removed before production
    models: {
      text: {
        'mistral-7b': 'mistralai/Mistral-7B-Instruct-v0.2',
        'llama2-7b': 'meta-llama/Llama-2-7b-chat-hf',
        'zephyr-7b': 'HuggingFaceH4/zephyr-7b-beta',
        'falcon-7b': 'tiiuae/falcon-7b-instruct',
      },
      image: {
        'stable-diffusion-xl': 'stabilityai/stable-diffusion-xl-base-1.0',
        'stable-diffusion-2': 'stabilityai/stable-diffusion-2-1',
      },
      audio: {
        'whisper-large': 'openai/whisper-large-v3',
        'bark': 'suno/bark',
      },
    },
    tier: 'free',
    rateLimits: { requests: 1000, window: 3600000 },
  },
  togetherai: {
    baseURL: 'https://api.together.xyz/v1',
    apiKey: process.env.EXPO_PUBLIC_TOGETHER_API_KEY || '',
    models: {
      text: {
        'llama-3.1-70b': 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
        'llama-3.1-8b': 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
        'mixtral-8x7b': 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        'qwen-2-72b': 'Qwen/Qwen2-72B-Instruct',
      },
      image: {
        'flux-schnell': 'black-forest-labs/FLUX.1-schnell-Free',
        'sdxl-turbo': 'stabilityai/sdxl-turbo',
      },
      code: {
        'deepseek-coder-33b': 'deepseek-ai/deepseek-coder-33b-instruct',
        'codellama-70b': 'codellama/CodeLlama-70b-Instruct-hf',
      },
    },
    tier: 'free',
    rateLimits: { requests: 600, window: 60000 },
  },
  deepseek: {
    baseURL: 'https://api.deepseek.com/v1',
    apiKey: process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY || '',
    models: {
      code: {
        'deepseek-coder': 'deepseek-coder',
        'deepseek-chat': 'deepseek-chat',
      },
    },
    tier: 'free',
    rateLimits: { requests: 1000, window: 60000 },
  },
  groq: {
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.EXPO_PUBLIC_GROQ_API_KEY || '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', // Burner key for development - will be removed before production
    models: {
      text: {
        'llama-3.1-70b': 'llama-3.1-70b-versatile',
        'llama-3.1-8b': 'llama-3.1-8b-instant',
        'mixtral-8x7b': 'mixtral-8x7b-32768',
        'gemma-7b': 'gemma-7b-it',
      },
    },
    tier: 'free',
    rateLimits: { requests: 30, window: 60000 },
  },
  replicate: {
    baseURL: 'https://api.replicate.com/v1',
    apiKey: process.env.EXPO_PUBLIC_REPLICATE_API_KEY || '',
    models: {
      text: {
        'llama-3-70b': 'meta/meta-llama-3-70b-instruct',
      },
      image: {
        'flux-schnell': 'black-forest-labs/flux-schnell',
        'sdxl': 'stability-ai/sdxl',
      },
    },
    tier: 'freemium',
    rateLimits: { requests: 100, window: 3600000 },
  },
};

export const AI_CONFIG = {
  openai: {
    baseURL: 'https://api.openai.com/v1',
    model: 'gpt-4-turbo-preview',
    maxTokens: 4096,
    tier: 'paid',
  },
  anthropic: {
    baseURL: 'https://api.anthropic.com/v1',
    model: 'claude-3-opus-20240229',
    maxTokens: 4096,
    tier: 'paid',
  },
  gemini: {
    baseURL: 'https://generativelanguage.googleapis.com/v1beta',
    model: 'gemini-pro',
    apiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY || '',
    tier: 'free',
  },
  toolkit: {
    chatURL: process.env["EXPO_PUBLIC_TOOLKIT_URL"] ? new URL("/agent/chat", process.env["EXPO_PUBLIC_TOOLKIT_URL"]).toString() : 'https://toolkit.jarvis.ai/agent/chat',
    imageGenURL: process.env["EXPO_PUBLIC_IMAGE_GEN_URL"] || 'https://toolkit.jarvis.ai/images/generate/',
    imageEditURL: process.env["EXPO_PUBLIC_IMAGE_EDIT_URL"] || 'https://toolkit.jarvis.ai/images/edit/',
    sttURL: process.env["EXPO_PUBLIC_STT_URL"] || 'https://toolkit.jarvis.ai/stt/transcribe/',
    ttsURL: process.env["EXPO_PUBLIC_TTS_URL"] || 'https://toolkit.jarvis.ai/tts/synthesize/',
  },
};

export const SOCIAL_PLATFORMS = {
  tiktok: { baseURL: 'https://open-api.tiktok.com/v2', version: 'v2' },
  youtube: { baseURL: 'https://www.googleapis.com/youtube/v3', version: 'v3' },
  instagram: { baseURL: 'https://graph.instagram.com', version: 'v19.0' },
  twitter: { baseURL: 'https://api.twitter.com/2', version: '2' },
  facebook: { baseURL: 'https://graph.facebook.com', version: 'v19.0' },
  linkedin: { baseURL: 'https://api.linkedin.com/v2', version: 'v2' },
  snapchat: { baseURL: 'https://adsapi.snapchat.com/v1', version: 'v1' },
  pinterest: { baseURL: 'https://api.pinterest.com/v5', version: 'v5' },
  reddit: { baseURL: 'https://oauth.reddit.com', version: 'v1' },
  discord: { baseURL: 'https://discord.com/api/v10', version: 'v10' },
  telegram: { baseURL: 'https://api.telegram.org', version: 'bot' },
  twitch: { baseURL: 'https://api.twitch.tv/helix', version: 'helix' },
  mastodon: { baseURL: 'https://mastodon.social/api/v1', version: 'v1' },
  threads: { baseURL: 'https://graph.threads.net', version: 'v1' },
};

export const STORAGE_CONFIG = {
  googledrive: {
    scopes: [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/drive.appdata',
    ],
  },
  local: {
    maxSize: 100 * 1024 * 1024,
    cacheExpiry: 7 * 24 * 60 * 60 * 1000,
  },
};

export const WEBSOCKET_CONFIG = {
  url: process.env.EXPO_PUBLIC_WS_URL || 'wss://ws.jarvis-command.com',
  reconnectInterval: 5000,
  maxReconnectAttempts: 10,
};

export const RATE_LIMITS = {
  ai: { requests: 100, window: 60000 },
  social: { requests: 50, window: 60000 },
  analytics: { requests: 200, window: 60000 },
};

// Unified API configuration for JarvisAPIRouter
export const apiConfig = {
  google: {
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/models',
    models: {
      text: {
        'gemini-1.5-pro': 'gemini-1.5-pro',
        'gemini-pro': 'gemini-pro',
      },
    },
  },
  groq: {
    baseURL: 'https://api.groq.com/openai/v1',
    models: {
      text: {
        'llama-3.1-70b': 'llama-3.1-70b-versatile',
        'llama-3.1-8b': 'llama-3.1-8b-instant',
        'mixtral-8x7b': 'mixtral-8x7b-32768',
      },
    },
  },
  huggingface: {
    baseURL: 'https://api-inference.huggingface.co/models',
    models: {
      text: {
        'mistral-7b': 'mistralai/Mistral-7B-Instruct-v0.2',
        'llama2-7b': 'meta-llama/Llama-2-7b-chat-hf',
      },
    },
  },
  togetherai: {
    baseURL: 'https://api.together.xyz/v1',
    models: {
      text: {
        'llama-3.1-70b': 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
        'llama-3.1-8b': 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
      },
    },
  },
  deepseek: {
    baseURL: 'https://api.deepseek.com/v1',
    models: {
      code: {
        'deepseek-coder': 'deepseek-coder',
        'deepseek-chat': 'deepseek-chat',
      },
    },
  },
};
