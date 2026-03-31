import dbConnect from '@/lib/mongodb';
import Blog from '@/models/Blog';
import Category from '@/models/Category';
import { NextResponse } from 'next/server';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET /api/blogs - Get all blogs with pagination
export async function GET(req: Request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || 'PUBLISHED';
    const category = searchParams.get('category');
    const skip = (page - 1) * limit;

    // Build query
    const query: any = { status };
    
    // Add category filter if provided
    if (category) {
      const categoryDoc = await Category.findOne({ 
        name: { $regex: new RegExp(`^${category}$`, 'i') } 
      });
      
      if (categoryDoc) {
        query.category = categoryDoc._id;
      } else {
        // Return empty result if category not found
        return NextResponse.json(
          {
            data: [],
            pagination: {
              page,
              limit,
              total: 0,
              totalPages: 0
            }
          },
          { headers: corsHeaders }
        );
      }
    }

    // Get total count
    const totalCount = await Blog.countDocuments(query);

    // Get blogs with pagination
    const blogs = await Blog.find(query)
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const response = {
      data: blogs,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      }
    };

    return NextResponse.json(response, { headers: corsHeaders });
  } catch (error: any) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { message: 'Failed to fetch blogs', error: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

// POST /api/blogs - Create a new blog
export async function POST(req: Request) {
  try {
    await dbConnect();
    
    const data = await req.json();
    
    // Validate required fields
    if (!data.title || typeof data.title !== 'string' || data.title.trim() === '') {
      return NextResponse.json(
        { message: 'Title is required' },
        { status: 400 }
      );
    }

    // Generate base slug from title if not provided
    const baseSlug = (data.slug || data.title)
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')      // Replace spaces with hyphens
      .replace(/--+/g, '-')      // Replace multiple hyphens with single
      .trim()
      .slice(0, 50);             // Leave room for random string

    // Check for existing slugs and make unique if needed
    let slug = baseSlug;
    let counter = 1;
    let existingBlog = null;

    // Keep trying until we find a unique slug
    do {
      if (counter > 1) {
        // Append a random string for uniqueness
        const randomString = Math.random().toString(36).substring(2, 6);
        slug = `${baseSlug}-${randomString}`;
      }
      
      existingBlog = await Blog.findOne({ slug });
      counter++;
    } while (existingBlog && counter < 10); // Safety limit to prevent infinite loops

    // Create the blog with the unique slug
    const blog = new Blog({
      ...data,
      slug,
      status: data.status || 'DRAFT',
      publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
      category: data.categoryId || null
    });

    await blog.save();

    // Populate the category details
    const populatedBlog = await Blog.findById(blog._id)
      .populate('category', 'name slug');

    return NextResponse.json(populatedBlog, { status: 201 });
  } catch (error: any) {
    console.error('Error creating blog:', error);
    return NextResponse.json(
      { message: 'Failed to create blog', error: error.message },
      { status: 500 }
    );
  }
}
