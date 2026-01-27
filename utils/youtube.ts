
/**
 * Extracts the video source from a YouTube link or a full iframe embed code.
 */
export const getEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  
  let targetUrl = url.trim();

  // Handle iframe embed code
  if (targetUrl.toLowerCase().includes('<iframe')) {
    const srcRegex = /src=["']([^"']+)["']/;
    const srcMatch = targetUrl.match(srcRegex);
    if (srcMatch && srcMatch[1]) {
      targetUrl = srcMatch[1];
    }
  }

  // Regex to capture YouTube Video ID
  const idRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const idMatch = targetUrl.match(idRegex);
  
  if (idMatch && idMatch[1]) {
    const origin = window.location.origin;
    // Adding origin parameter helps with domain-based embed restrictions
    return `https://www.youtube.com/embed/${idMatch[1]}?autoplay=1&rel=0&enablejsapi=1&origin=${encodeURIComponent(origin)}`;
  }
  
  // Direct embed link fallback
  if (targetUrl.includes('youtube.com/embed/')) {
    const separator = targetUrl.includes('?') ? '&' : '?';
    const origin = window.location.origin;
    let final = `${targetUrl}${targetUrl.includes('autoplay') ? '' : separator + 'autoplay=1'}`;
    if (!final.includes('origin=')) {
      final += `&origin=${encodeURIComponent(origin)}`;
    }
    return final;
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
