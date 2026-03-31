import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { put } from '@vercel/blob';

// Configure upload settings
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Check if running on Vercel
const IS_VERCEL = process.env.VERCEL === '1';

export async function POST(request: NextRequest) {
  try {
    console.log(`[Upload] Starting upload process... (Environment: ${IS_VERCEL ? 'Vercel' : 'Local'})`);
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const type = formData.get('type') as string; // 'product' or 'blog'

    console.log('[Upload] Received file:', {
      name: file?.name,
      size: file?.size,
      type: file?.type,
      uploadType: type,
      environment: IS_VERCEL ? 'vercel' : 'local'
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

    // If on Vercel, use Blob storage
    if (IS_VERCEL) {
      console.log('[Upload] Using Vercel Blob storage...');

      const timestamp = Date.now();
      const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `${type}s/${timestamp}_${originalName}`;

      const blob = await put(filename, file, {
        access: 'public',
        addRandomSuffix: false,
      });

      console.log('[Upload] Blob uploaded successfully:', blob.url);

      return NextResponse.json({
        success: true,
        url: blob.url,
        filename: filename,
        size: file.size,
        type: file.type,
        storage: 'blob'
      });
    }

    // Local file system upload (for development)
    console.log('[Upload] Using local file system...');
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', type + 's');
    console.log('[Upload] Upload directory:', uploadDir);
    console.log('[Upload] Directory exists:', existsSync(uploadDir));

    if (!existsSync(uploadDir)) {
      console.log('[Upload] Creating directory...');
      await mkdir(uploadDir, { recursive: true });
      console.log('[Upload] Directory created successfully');
    }

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}_${originalName}`;
    const filepath = path.join(uploadDir, filename);

    console.log('[Upload] Target filepath:', filepath);

    // Convert file to buffer and save
    console.log('[Upload] Converting file to buffer...');
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log('[Upload] Buffer created, size:', buffer.length);

    console.log('[Upload] Writing file to disk...');
    await writeFile(filepath, buffer);
    console.log('[Upload] File written successfully');

    // Return the public URL
    const publicUrl = `/uploads/${type}s/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: filename,
      size: file.size,
      type: file.type,
      storage: 'local'
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      errno: error.errno,
      syscall: error.syscall,
      path: error.path
    });
    return NextResponse.json(
      {
        error: 'Failed to upload image',
        details: error.message,
        code: error.code,
        path: error.path
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