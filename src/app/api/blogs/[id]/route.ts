import dbConnect from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// GET /api/blogs/:id - Get blog by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await context.params; // ✅ await params

    if (!id || typeof id !== 'string' || id.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          message: 'Blog ID is required and must be a non-empty string',
          received: id,
        },
        { status: 400 }
      );
    }

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid blog ID format. Must be a 24-character hex string',
          received: id,
        },
        { status: 400 }
      );
    }

    const blog = await Blog.findById(id).populate('category', 'name slug');

    if (!blog) {
      return NextResponse.json({ message: 'Blog not found' }, { status: 404 });
    }

    return NextResponse.json(blog);
  } catch (error: any) {
    console.error('Error fetching blog:', error);
    return NextResponse.json(
      { message: 'Failed to fetch blog', error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/blogs/:id - Update blog
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await context.params; // ✅ await params

    const data = await request.json();
    const { title, content } = data;

    if (!title || !content) {
      return NextResponse.json(
        { message: 'Title and content are required' },
        { status: 400 }
      );
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      {
        title,
        content,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        updatedAt: new Date(),
        ...(data.image && { image: data.image }),
        ...(data.status && { status: data.status }),
        ...(data.readingTime && { readingTime: data.readingTime }),
        ...(data.categoryId && { category: data.categoryId }),
      },
      { new: true }
    ).populate('category', 'name slug');

    if (!updatedBlog) {
      return NextResponse.json({ message: 'Blog not found' }, { status: 404 });
    }

    return NextResponse.json(updatedBlog);
  } catch (error: any) {
    console.error('Error updating blog:', error);
    return NextResponse.json(
      { message: 'Failed to update blog', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/blogs/:id - Delete blog
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await context.params; // ✅ await params

    const deletedBlog = await Blog.findByIdAndDelete(id);

    if (!deletedBlog) {
      return NextResponse.json({ message: 'Blog not found' }, { status: 404 });
    }

    return new Response(null, { status: 204 });
  } catch (error: any) {
    console.error('Error deleting blog:', error);
    return NextResponse.json(
      {
        message: 'Failed to delete blog',
        error: error.message,
        details: error.name === 'CastError' ? 'Invalid blog ID format' : undefined,
      },
      { status: error.name === 'CastError' ? 400 : 500 }
    );
  }
}
