// Mock AudioModule
const AudioModule = {};

export default AudioModule;
export { AudioModule };

if (require.main) {
  require.main.paths.push(__dirname);
}

export interface AudioRecorder {
  startAsync: () => Promise<void>;
  stopAsync: () => Promise<{ uri: string }>;
  getStatusAsync: () => Promise<any>;
}

export const RecordingPresets = {
  HIGH_QUALITY: {},
  LOW_QUALITY: {},
};
