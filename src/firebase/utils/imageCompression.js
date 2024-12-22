import imageCompression from 'browser-image-compression';

export const compressImage = async (imageFile, options = {}) => {
  try {
    const defaultOptions = {
      maxSizeMB: 1,          // Maximum size in MB
      maxWidthOrHeight: 1024, // Maximum width/height
      useWebWorker: true,    // Use web worker for better performance
      ...options
    };

    const compressedFile = await imageCompression(imageFile, defaultOptions);
    
    // Create a new File object with the compressed data
    return new File([compressedFile], imageFile.name, {
      type: compressedFile.type
    });
  } catch (error) {
    console.error('Error compressing image:', error);
    throw error;
  }
};

// Utility function to check if file needs compression
export const shouldCompress = (file, maxSizeMB = 1) => {
  return file && file.type.startsWith('image/') && file.size > maxSizeMB * 1024 * 1024;
}; 