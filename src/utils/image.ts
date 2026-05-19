/**
 * Image processing utilities for the Hades project.
 */

/**
 * Loads an image from a URL and returns an HTMLImageElement.
 */
export const loadImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });

/**
 * Stitches multiple images together horizontally into a single image.
 */
export const stitchImages = async (imageUrls: string[]): Promise<string> => {
  if (imageUrls.length === 0) return '';
  if (imageUrls.length === 1) return imageUrls[0];

  console.log(`[ImageUtil] Stitched ${imageUrls.length} screens...`);
  const images = await Promise.all(imageUrls.map(loadImage));

  const totalWidth = images.reduce((sum, img) => sum + img.width, 0);
  const maxHeight = Math.max(...images.map(img => img.height));

  const canvas = document.createElement('canvas');
  canvas.width = totalWidth;
  canvas.height = maxHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) return imageUrls[0];

  let currentX = 0;
  images.forEach(img => {
    ctx.drawImage(img, currentX, 0);
    currentX += img.width;
  });

  return canvas.toDataURL('image/png');
};
