/**
 * WARNING: HARDCODED BURNER API KEYS FOR DEVELOPMENT & TESTING
 *
 * This file contains hardcoded API keys for testing purposes only.
 * These keys are associated with burner accounts and will be deleted or rotated.
 * DO NOT use these in production.
 *
 * These keys are included so the program works out-of-the-box during development
 * without requiring manual API key entry for every build/test.
 *
 * This file will be replaced by a secure key management system (.env loading or a startup wizard) in the future.
 */
export const API_KEYS = {
  // Key from user screenshot for "Gemini"
  GOOGLE_GEMINI: 'AIzaSyD8XihT8YcI3ycp0rNkzYpFq61vPoLWJTA',

  // Hardcoded burner key found in the repository
  GROQ: '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',

  // Hardcoded burner key from api.config.ts
  HUGGING_FACE: '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',

  // Add other keys here for testing as needed.
  TOGETHER_AI: '',
  DEEPSEEK: '',
};
