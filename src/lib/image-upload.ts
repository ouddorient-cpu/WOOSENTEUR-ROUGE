'use server';

/**
 * Image Upload Service
 * Uploads images to Cloudinary (free tier) and returns HTTP URLs
 * that can be used by WooCommerce for product imports.
 *
 * Cloudinary free tier: 25 credits/month (25GB storage + 25GB bandwidth)
 */

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

/**
 * Upload an image to Cloudinary
 * @param imageData - Base64 encoded image data (with or without data URI prefix)
 * @param name - Optional name for the image
 * @returns The uploaded image URL or error
 */
export async function uploadImageToCloudinary(
  imageData: string,
  name?: string
): Promise<ImageUploadResult> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    return {
      success: false,
      error: 'Cloudinary not configured. Add CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET.',
    };
  }

  try {
    // Cloudinary accepts the full data URI
    const formData = new FormData();
    formData.append('file', imageData);
    formData.append('upload_preset', uploadPreset);
    if (name) {
      // Sanitize the name for Cloudinary public_id
      const sanitizedName = name.replace(/[^a-zA-Z0-9-_]/g, '-').substring(0, 50);
      formData.append('public_id', `woosenteur/${sanitizedName}-${Date.now()}`);
    }
    formData.append('folder', 'woosenteur-products');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const result = await response.json();

    if (result.secure_url) {
      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
      };
    } else {
      return {
        success: false,
        error: result.error?.message || 'Upload failed',
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network error during upload',
    };
  }
}

/**
 * Check if an image URL needs to be uploaded
 * @param url - The image URL to check
 * @returns true if the URL is a base64 or blob URL that needs uploading
 */
export async function needsUpload(url: string | undefined | null): Promise<boolean> {
  if (!url) return false;
  return url.startsWith('data:') || url.startsWith('blob:');
}

/**
 * Process image URL - upload if needed, return valid HTTP URL
 * @param imageUrl - Original image URL (can be base64, blob, or HTTP)
 * @param productName - Product name for the uploaded image
 * @returns Valid HTTP URL or empty string
 */
export async function processImageUrl(
  imageUrl: string | undefined | null,
  productName?: string
): Promise<string> {
  if (!imageUrl) return '';

  // If already a valid HTTP URL, return as-is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // If base64 or blob, try to upload to Cloudinary
  if (await needsUpload(imageUrl)) {
    const result = await uploadImageToCloudinary(imageUrl, productName);
    if (result.success && result.url) {
      return result.url;
    }
    console.warn('Image upload failed:', result.error);
    return '';
  }

  return '';
}
