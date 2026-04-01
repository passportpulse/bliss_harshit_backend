import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  success: boolean;
  url?: string;
  public_id?: string;
  error?: string;
}

export async function uploadToCloudinary(
  file: File,
  folder: string = 'uploads'
): Promise<UploadResult> {
  try {
    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    return new Promise((resolve) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'image',
          format: 'webp', // Convert to webp for better compression
          quality: 'auto:good',
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            resolve({
              success: false,
              error: error.message,
            });
          } else {
            resolve({
              success: true,
              url: result?.secure_url,
              public_id: result?.public_id,
            });
          }
        }
      );

      uploadStream.end(buffer);
    });
  } catch (error: any) {
    console.error('Upload to Cloudinary failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Delete from Cloudinary failed:', error);
    return false;
  }
}

export default cloudinary;
