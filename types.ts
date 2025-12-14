export interface RecordingConfig {
  audio: boolean;        // Microphone
  systemAudio: boolean;  // System/Tab audio
  quality: '720p' | '1080p';
}

export interface Recording {
  id: string;
  blob: Blob;
  url: string;
  duration: number;
  timestamp: number;
  size: number;
  name: string;
}

export type RecorderState = 'idle' | 'recording' | 'paused';