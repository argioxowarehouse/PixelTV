
import { VideoProvider } from '../types';

/**
 * Menentukan provider video berdasarkan URL atau kode embed.
 */
export const getVideoProvider = (url: string): VideoProvider => {
  if (!url) return 'unknown';
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be') || (lowerUrl.includes('<iframe') && lowerUrl.includes('youtube'))) {
    return 'youtube';
  }
  
  if (lowerUrl.includes('cloudinary.com')) {
    return 'cloudinary';
  }
  
  // Jika ada tag iframe atau ekstensi video langsung
  if (lowerUrl.includes('<iframe') || /\.(mp4|webm|ogg|mov)$/i.test(lowerUrl)) {
    return 'direct';
  }
  
  return 'unknown';
};

/**
 * Mengekstrak dan memformat sumber video untuk player.
 * Jika berupa iframe, akan mengekstrak atribut 'src'.
 */
export const getPlayerSource = (url: string, loop: boolean = false) => {
  if (!url) return null;
  const provider = getVideoProvider(url);
  let targetUrl = url.trim();

  // Ekstraksi umum untuk kode embed iframe (Cloudinary, YouTube, dll)
  if (targetUrl.toLowerCase().includes('<iframe')) {
    const srcRegex = /src=["']([^"']+)["']/;
    const srcMatch = targetUrl.match(srcRegex);
    if (srcMatch && srcMatch[1]) {
      let extractedSrc = srcMatch[1];
      
      // Jika ini iframe YouTube, pastikan parameter loop dan autoplay ada
      if (extractedSrc.includes('youtube.com/embed/')) {
        const idMatch = extractedSrc.match(/embed\/([^"&?\/\s]{11})/);
        if (idMatch && idMatch[1]) {
          const videoId = idMatch[1];
          const sep = extractedSrc.includes('?') ? '&' : '?';
          if (!extractedSrc.includes('autoplay')) extractedSrc += `${sep}autoplay=1`;
          if (loop && !extractedSrc.includes('loop')) {
            extractedSrc += `&loop=1&playlist=${videoId}`;
          }
        }
      }
      
      return {
        type: 'youtube' as const, // Gunakan renderer iframe
        url: extractedSrc
      };
    }
  }

  // Penanganan URL YouTube langsung
  if (provider === 'youtube') {
    const idRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const idMatch = targetUrl.match(idRegex);
    
    if (idMatch && idMatch[1]) {
      const videoId = idMatch[1];
      const origin = window.location.origin;
      let baseUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&enablejsapi=1&origin=${encodeURIComponent(origin)}`;
      if (loop) baseUrl += `&loop=1&playlist=${videoId}`;
      
      return {
        type: 'youtube' as const,
        url: baseUrl
      };
    }
  }

  // Cloudinary atau Video Langsung (menggunakan tag <video>)
  return {
    type: 'direct' as const,
    url: targetUrl
  };
};

/**
 * Validasi apakah string adalah tautan video yang didukung.
 */
export const isValidVideoLink = (url: string): boolean => {
  return getVideoProvider(url) !== 'unknown';
};
