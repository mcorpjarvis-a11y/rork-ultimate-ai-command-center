/**
 * Backend-safe shim for expo-audio
 * 
 * Provides stub implementations for expo-audio functionality.
 * Audio recording is not available in Node.js backend.
 */

// Mock AudioModule
const AudioModule = {
  // Add any methods that might be called
};

export default AudioModule;

// Mock types and exports
export interface AudioRecorder {
  startAsync: () => Promise<void>;
  stopAsync: () => Promise<{ uri: string }>;
  getStatusAsync: () => Promise<any>;
}

export const RecordingPresets = {
  HIGH_QUALITY: {},
  LOW_QUALITY: {},
};
