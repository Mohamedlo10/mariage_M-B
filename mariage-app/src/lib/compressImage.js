import imageCompression from 'browser-image-compression';

/**
 * Compress an image file before uploading.
 * Targets max 800KB and 1920px width.
 * @param {File} file - The original image file
 * @returns {Promise<File>} - The compressed file
 */
export async function compressImage(file) {
  const options = {
    maxSizeMB: 0.8,          // 800KB max
    maxWidthOrHeight: 1920,  // Max dimension
    useWebWorker: true,
    fileType: 'image/jpeg',
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error('Compression failed, using original:', error);
    return file; // Fallback to original if compression fails
  }
}
