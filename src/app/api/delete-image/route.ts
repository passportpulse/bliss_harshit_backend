import { NextRequest, NextResponse } from 'next/server';
import { deleteFromCloudinary } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const { public_id } = await request.json();

    if (!public_id) {
      return NextResponse.json(
        { error: 'Public ID is required' },
        { status: 400 }
      );
    }

    console.log('[Delete] Deleting image from Cloudinary:', public_id);
    
    const deleted = await deleteFromCloudinary(public_id);

    if (deleted) {
      console.log('[Delete] Image deleted successfully');
      return NextResponse.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } else {
      console.log('[Delete] Failed to delete image');
      return NextResponse.json(
        { error: 'Failed to delete image' },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Delete error:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete image',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Image delete endpoint. Use POST method with public_id.' },
    { status: 200 }
  );
}
