import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import Blog from '@/models/Blog';

// GET /api/blogs/category/[categoryId] - Get blogs by category
export async function GET(
  req: Request,
  context: { params: any }
) {
  try {
    await dbConnect();
  const { categoryId } = context.params;
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '3');
    const offset = parseInt(searchParams.get('offset') || '0');
    const category = await Category.findById(categoryId);
    if (!category) {
      return new Response(JSON.stringify({ message: 'Category not found' }), { status: 404 });
    }
    const blogs = await Blog.find({
      category: category._id,
      status: 'PUBLISHED'
    })
      .populate('category')
      .sort({ publishedAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean();
    return new Response(JSON.stringify(blogs), {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Failed to fetch blogs' }), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
} 