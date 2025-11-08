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
