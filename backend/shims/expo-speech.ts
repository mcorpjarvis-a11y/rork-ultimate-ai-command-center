/**
 * Backend-safe shim for expo-speech
 * 
 * Provides a minimal Node.js compatible stub for expo-speech.
 * Speech functionality is not available in Node.js backend.
 */

export const speak = (text: string, options?: any) => {
  console.warn('[expo-speech shim] Speech not available in Node.js backend');
};

export const stop = () => {
  console.warn('[expo-speech shim] Speech not available in Node.js backend');
};

export const isSpeakingAsync = async (): Promise<boolean> => {
  return false;
};

export const pause = () => {
  console.warn('[expo-speech shim] Speech not available in Node.js backend');
};

export const resume = () => {
  console.warn('[expo-speech shim] Speech not available in Node.js backend');
};

export const getAvailableVoicesAsync = async () => {
  return [];
};

export const maxSpeechInputLength = 4000;

export default {
  speak,
  stop,
  isSpeakingAsync,
  pause,
  resume,
  getAvailableVoicesAsync,
  maxSpeechInputLength,
};
