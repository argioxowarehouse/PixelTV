
export interface AppState {
  videoUrl: string;
  isPlaying: boolean;
  showSettings: boolean;
  loopEnabled: boolean;
}

export enum StorageKeys {
  VIDEO_SOURCE = 'cloudinary_cinema_source',
  VIDEO_LOOP = 'cloudinary_cinema_loop'
}

export type VideoProvider = 'youtube' | 'cloudinary' | 'direct' | 'unknown';
