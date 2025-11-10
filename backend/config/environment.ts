/**
 * Environment Configuration and Validation
 * Validates required environment variables for the backend server
 */

interface EnvironmentConfig {
  PORT: number;
  HOST: string;
  NODE_ENV: string;
  FRONTEND_URL?: string;
}

class EnvironmentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnvironmentError';
  }
}

/**
 * Validates and returns typed environment configuration
 * @throws {EnvironmentError} if required variables are missing
 */
export function validateEnvironment(): EnvironmentConfig {
  const errors: string[] = [];
  
  // Optional but recommended variables
  const warnings: string[] = [];
  
  // Validate PORT (with default)
  const port = parseInt(process.env.PORT || '3000', 10);
  if (isNaN(port)) {
    errors.push('PORT must be a valid number');
  }
  
  // Validate HOST (with default)
  const host = process.env.HOST || '0.0.0.0';
  
  // NODE_ENV (with default)
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  // Check for AI API keys (at least one should be configured)
  const hasGemini = !!(process.env.EXPO_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY);
  const hasOpenAI = !!(process.env.EXPO_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY);
  const hasHuggingFace = !!(process.env.EXPO_PUBLIC_HF_API_TOKEN || process.env.HUGGINGFACE_API_KEY);
  const hasGroq = !!process.env.EXPO_PUBLIC_GROQ_API_KEY;
  
  if (!hasGemini && !hasOpenAI && !hasHuggingFace && !hasGroq) {
    warnings.push('No AI API keys configured. AI features will not work until keys are added via Settings.');
    warnings.push('  The app will start in "clean slate" mode with local features only.');
    warnings.push('  Users can add keys later in Settings. Supported providers:');
    warnings.push('    - EXPO_PUBLIC_GROQ_API_KEY (recommended - free & fast)');
    warnings.push('    - EXPO_PUBLIC_GEMINI_API_KEY (Google Gemini)');
    warnings.push('    - EXPO_PUBLIC_HF_API_TOKEN (HuggingFace)');
    warnings.push('    - EXPO_PUBLIC_OPENAI_API_KEY (OpenAI)');
  }
  
  // Display warnings
  if (warnings.length > 0) {
    console.warn('\n⚠️  Environment Warnings:');
    warnings.forEach(warning => console.warn(`   ${warning}`));
    console.warn('');
  }
  
  // Throw if we have critical errors
  if (errors.length > 0) {
    throw new EnvironmentError(
      `Environment validation failed:\n${errors.map(e => `  - ${e}`).join('\n')}`
    );
  }
  
  return {
    PORT: port,
    HOST: host,
    NODE_ENV: nodeEnv,
    FRONTEND_URL: process.env.FRONTEND_URL
  };
}

/**
 * Logs the environment configuration
 */
export function logEnvironmentInfo(config: EnvironmentConfig): void {
  console.log('\n📋 Environment Configuration:');
  console.log(`   NODE_ENV: ${config.NODE_ENV}`);
  console.log(`   PORT: ${config.PORT}`);
  console.log(`   HOST: ${config.HOST}`);
  if (config.FRONTEND_URL) {
    console.log(`   FRONTEND_URL: ${config.FRONTEND_URL}`);
  }
  
  // Check which AI services are available
  const services: string[] = [];
  if (process.env.EXPO_PUBLIC_GROQ_API_KEY) services.push('Groq');
  if (process.env.EXPO_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY) services.push('Gemini');
  if (process.env.EXPO_PUBLIC_HF_API_TOKEN || process.env.HUGGINGFACE_API_KEY) services.push('HuggingFace');
  if (process.env.EXPO_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY) services.push('OpenAI');
  
  if (services.length > 0) {
    console.log(`   AI Services: ${services.join(', ')}`);
  }
  console.log('');
}
