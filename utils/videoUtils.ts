
import { VideoProvider } from '../types';

/**
 * Determines the provider type based on the URL.
 */
export const getVideoProvider = (url: string): VideoProvider => {
  if (!url) return 'unknown';
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
    return 'youtube';
  }
  
  if (lowerUrl.includes('res.cloudinary.com')) {
    return 'cloudinary';
  }
  
  // Check if it ends with common video extensions
  if (/\.(mp4|webm|ogg|mov)$/i.test(lowerUrl)) {
    return 'direct';
  }
  
  return 'unknown';
};

/**
 * Extracts and formats the source for the player.
 */
export const getPlayerSource = (url: string, loop: boolean = false) => {
  if (!url) return null;
  const provider = getVideoProvider(url);
  let targetUrl = url.trim();

  if (provider === 'youtube') {
    // Handle iframe embed code
    if (targetUrl.toLowerCase().includes('<iframe')) {
      const srcRegex = /src=["']([^"']+)["']/;
      const srcMatch = targetUrl.match(srcRegex);
      if (srcMatch && srcMatch[1]) {
        targetUrl = srcMatch[1];
      }
    }

    const idRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const idMatch = targetUrl.match(idRegex);
    
    if (idMatch && idMatch[1]) {
      const videoId = idMatch[1];
      const origin = window.location.origin;
      let baseUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&enablejsapi=1&origin=${encodeURIComponent(origin)}`;
      
      if (loop) {
        // YouTube requires the playlist parameter set to the video ID to loop a single video
        baseUrl += `&loop=1&playlist=${videoId}`;
      }
      
      return {
        type: 'youtube' as const,
        url: baseUrl
      };
    }
  }

  if (provider === 'cloudinary' || provider === 'direct') {
    return {
      type: 'direct' as const,
      url: targetUrl
    };
  }
  
  return null;
};

/**
 * Validates if the string is a valid video link.
 */
export const isValidVideoLink = (url: string): boolean => {
  return getVideoProvider(url) !== 'unknown';
};
