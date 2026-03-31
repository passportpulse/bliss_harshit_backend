import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

// Configure upload settings
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export async function POST(request: NextRequest) {
  try {
    console.log('[Upload Blob] Starting upload process...');

    const formData = await request.formData();
    const file = formData.get('image') as File;
    const type = formData.get('type') as string;

    console.log('[Upload Blob] Received file:', {
      name: file?.name,
      size: file?.size,
      type: file?.type,
      uploadType: type
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

    // Generate unique filename with folder structure
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${type}s/${timestamp}_${originalName}`;

    console.log('[Upload Blob] Uploading to Vercel Blob:', filename);

    // Upload to Vercel Blob Storage
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false,
    });

    console.log('[Upload Blob] File uploaded successfully:', blob.url);

    return NextResponse.json({
      success: true,
      url: blob.url,
      filename: filename,
      size: file.size,
      type: file.type
    });

  } catch (error: any) {
    console.error('[Upload Blob] Error:', error);
    console.error('[Upload Blob] Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });

    return NextResponse.json(
      {
        error: 'Failed to upload image',
        details: error.message,
        code: error.code
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      message: 'Vercel Blob upload endpoint. Use POST method with form data.',
      status: 'active',
      environment: process.env.VERCEL ? 'vercel' : 'local'
    },
    { status: 200 }
  );
}
