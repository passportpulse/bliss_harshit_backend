import dbConnect from '@/lib/mongodb';
import { Category, SubCategory } from '@/models';
import { NextResponse } from 'next/server';

// GET /api/categories - Get all categories with pagination
export async function GET(req: Request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Get total count
    const totalCount = await Category.countDocuments();

    // Get categories with pagination and product count
    const categories = await Category.aggregate([
      {
        $lookup: {
          from: 'subcategories',
          localField: '_id',
          foreignField: 'category',
          as: 'subCategories'
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'category',
          as: 'products'
        }
      },
      {
        $addFields: {
          _count: {
            products: { $size: '$products' }
          },
          subCategoryCount: { $size: '$subCategories' }
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          // Explicitly include only the fields we want
          _id: 1,
          id: '$_id',  // Include both _id and id for compatibility
          name: 1,
          slug: 1,
          description: 1,
          image: 1,
          _count: 1,
          subCategoryCount: 1,
          createdAt: 1,
          updatedAt: 1
          // Don't include products array by not listing it here
        }
      }
    ]);

    const response = {
      data: categories,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      }
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { message: 'Failed to fetch categories', error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create a new category
export async function POST(req: Request) {
  try {
    await dbConnect();
    
    const { name, description, slug: providedSlug, image } = await req.json();
    
    // Generate slug from name if not provided
    const slug = providedSlug || name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')      // Replace spaces with -
      .replace(/--+/g, '-')      // Replace multiple - with single -
      .trim();

    // Check if category with same name or slug already exists
    const existingCategory = await Category.findOne({
      $or: [
        { name },
        { slug }
      ]
    });

    if (existingCategory) {
      return NextResponse.json(
        { 
          message: 'Category with this name or slug already exists',
          field: existingCategory.name === name ? 'name' : 'slug'
        },
        { status: 400 }
      );
    }

    // Create the category
    const category = new Category({
      name,
      description,
      slug,
      image,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await category.save();

    // Return the created category without populating subCategories
    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { message: 'Failed to create category', error: error.message },
      { status: 500 }
    );
  }
}