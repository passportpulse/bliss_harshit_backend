import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';

// Configure upload settings
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export async function POST(request: NextRequest) {
  try {
    console.log('[Upload] Starting Cloudinary upload process...');
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const type = formData.get('type') as string; // 'product', 'blog', 'testimonial', 'banner'

    console.log('[Upload] Received file:', {
      name: file?.name,
      size: file?.size,
      type: file?.type,
      uploadType: type,
    });

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Validate upload type
    if (!type || !['product', 'blog', 'testimonial', 'banner'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid upload type. Must be "product", "blog", "testimonial", or "banner".' },
        { status: 400 }
      );
    }

    // Upload to Cloudinary
    console.log('[Upload] Uploading to Cloudinary...');
    const folder = `bliss/${type}s`;
    const uploadResult = await uploadToCloudinary(file, folder);

    if (!uploadResult.success) {
      return NextResponse.json(
        { error: 'Failed to upload to Cloudinary', details: uploadResult.error },
        { status: 500 }
      );
    }

    console.log('[Upload] Cloudinary upload successful:', uploadResult.url);

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      public_id: uploadResult.public_id,
      filename: file.name,
      size: file.size,
      type: file.type,
      storage: 'cloudinary'
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        error: 'Failed to upload image',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Image upload endpoint. Use POST method with form data.' },
    { status: 200 }
  );
} 