// Free image/document upload utility using Cloudinary
// Cloudinary free tier: 25GB storage, 25GB bandwidth per month

interface CloudinaryResponse {
  public_id: string;
  secure_url: string;
  format: string;
  resource_type: string;
}

// Cloudinary configuration using environment variables
const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'research_uploads',
  apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY,
};

export const uploadToCloudinary = async (file: File, resourceType: 'image' | 'raw' = 'image'): Promise<string> => {
  // Validate file size
  const maxSize = resourceType === 'image' ? 10 * 1024 * 1024 : 50 * 1024 * 1024; // 10MB for images, 50MB for docs
  if (file.size > maxSize) {
    throw new Error(`File too large. Maximum size is ${maxSize / 1024 / 1024}MB for ${resourceType}s.`);
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  formData.append('cloud_name', CLOUDINARY_CONFIG.cloudName);
  
  if (resourceType === 'raw') {
    formData.append('resource_type', 'raw'); // For documents
  }

  try {
    
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/${resourceType}/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: CloudinaryResponse = await response.json();
    
    if (data.secure_url) {
      
      return data.secure_url;
    } else {
      throw new Error('Upload failed - no URL returned');
    }
  } catch (error) {
    console.error('Cloudinary upload failed:', error);
    throw new Error(`Failed to upload ${resourceType}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Alternative free services
export const uploadToImgBB = async (imageFile: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', imageFile);
  
  try {
    // Get free API key from imgbb.com
    const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
    if (!apiKey) {
      throw new Error('ImgBB API key not configured');
    }
    
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    if (data.success) {
      return data.data.url;
    } else {
      throw new Error('ImgBB upload failed');
    }
  } catch (error) {
    console.error('ImgBB upload error:', error);
    throw error;
  }
};

// Validate file before upload
export const validateFile = (file: File, type: 'image' | 'document'): { valid: boolean; error?: string } => {
  const maxSizes = {
    image: 10 * 1024 * 1024, // 10MB
    document: 10 * 1024 * 1024 // 10MB
  };

  const allowedTypes = {
    image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    document: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ]
  };

  if (file.size > maxSizes[type]) {
    return {
      valid: false,
      error: `File too large. Maximum size for ${type}s is ${maxSizes[type] / 1024 / 1024}MB.`
    };
  }

  if (!allowedTypes[type].includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed ${type} types: ${allowedTypes[type].join(', ')}`
    };
  }

  return { valid: true };
};

// Convert to base64 as last resort (for very small files only)
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (file.size > 1024 * 1024) { // 1MB limit for base64
      reject(new Error('File too large for base64 encoding. Use Cloudinary or external hosting.'));
      return;
    }
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};
