
/**
 * Extracts the video source from a YouTube link or a full iframe embed code.
 */
export const getEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  
  let targetUrl = url.trim();

  // If the user pasted an iframe embed code, try to extract the src attribute
  if (targetUrl.toLowerCase().includes('<iframe')) {
    const srcRegex = /src=["']([^"']+)["']/;
    const srcMatch = targetUrl.match(srcRegex);
    if (srcMatch && srcMatch[1]) {
      targetUrl = srcMatch[1];
    }
  }

  // Regex to capture YouTube Video ID from various URL formats
  const idRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const idMatch = targetUrl.match(idRegex);
  
  if (idMatch && idMatch[1]) {
    // We recreate the embed URL to ensure consistent parameters (autoplay and rel)
    return `https://www.youtube.com/embed/${idMatch[1]}?autoplay=1&rel=0`;
  }
  
  // Fallback: If it's already an embed URL but regex didn't catch the ID perfectly, 
  // we still return it but try to append our params.
  if (targetUrl.includes('youtube.com/embed/')) {
    const separator = targetUrl.includes('?') ? '&' : '?';
    return `${targetUrl}${targetUrl.includes('autoplay') ? '' : separator + 'autoplay=1'}`;
  }
  
  return null;
};

/**
 * Validates if the string looks like a YouTube link or embed code.
 */
export const isValidVideoLink = (url: string): boolean => {
  const lowerUrl = url.toLowerCase();
  return (
    lowerUrl.includes('youtube.com') || 
    lowerUrl.includes('youtu.be') || 
    (lowerUrl.includes('<iframe') && lowerUrl.includes('youtube'))
  );
};
