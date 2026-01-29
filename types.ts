
export interface VideoItem {
  id: string;
  title: string;
  url: string;
  loop: boolean;
}

export type ViewState = 'main' | 'admin' | 'player';

export enum StorageKeys {
  VIDEO_LIST = 'pixel_barber_videos',
  GLOBAL_SETTINGS = 'pixel_barber_settings'
}

export type VideoProvider = 'youtube' | 'cloudinary' | 'direct' | 'unknown';
