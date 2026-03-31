import dbConnect from '@/lib/mongodb';
import { SubCategory, Category } from '@/models';
import { NextResponse } from 'next/server';
import { Types } from 'mongoose';

// Type definitions
interface ICategoryDoc {
  _id: Types.ObjectId;
  name: string;
  slug: string;
}

interface ISubCategoryDoc {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  slug: string;
  image?: string;
  category: Types.ObjectId | ICategoryDoc;
  createdAt: Date;
  updatedAt: Date;
}

// GET /api/subcategories - Get all subcategories with pagination
export async function GET(request: Request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Get total count
    const totalCount = await SubCategory.countDocuments();

    // Get subcategories with pagination, populate category, and get product count
    const subcategories = await SubCategory.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'subCategory',
          as: 'products'
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $project: {
          name: 1,
          description: 1,
          slug: 1,
          image: 1,
          category: {
            _id: 1,
            name: 1,
            slug: 1
          },
          productCount: { $size: '$products' },
          createdAt: 1,
          updatedAt: 1
        }
      },
      { $skip: skip },
      { $limit: limit }
    ]);

    // Format the response
    const response = {
      data: subcategories.map(subcat => ({
        _id: subcat._id.toString(),
        name: subcat.name,
        description: subcat.description,
        slug: subcat.slug,
        image: subcat.image,
        _count: {
          products: subcat.productCount || 0
        },
        category: subcat.category ? {
          _id: subcat.category._id.toString(),
          name: subcat.category.name,
          slug: subcat.category.slug
        } : null,
        createdAt: subcat.createdAt,
        updatedAt: subcat.updatedAt
      })),
      pagination: {
        total: totalCount,
        page,
        totalPages: Math.ceil(totalCount / limit),
        limit
      }
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching subcategories:', error);
    return NextResponse.json(
      { message: 'Failed to fetch subcategories', error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/subcategories - Create a new subcategory
export async function POST(request: Request) {
  try {
    await dbConnect();
    
    const { name, description, slug: providedSlug, category: categoryId, image } = await request.json();
    
    // Generate slug from name if not provided
    const slug = providedSlug || name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')      // Replace spaces with -
      .replace(/--+/g, '-')      // Replace multiple - with single -
      .trim();
    
    // Check if subcategory with same name or slug already exists
    const existingSubCategory = await SubCategory.findOne({
      $or: [
        { name },
        { slug }
      ]
    });

    if (existingSubCategory) {
      return NextResponse.json(
        { 
          message: 'Subcategory with this name or slug already exists',
          field: existingSubCategory.name === name ? 'name' : 'slug'
        },
        { status: 400 }
      );
    }

    // Verify category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 }
      );
    }

    // Create the subcategory
    const subCategory = new SubCategory({
      name,
      description,
      slug,
      image,
      category: category._id
    });

    await subCategory.save();

    // Get the created subcategory with populated category
    const result = await SubCategory.findById(subCategory._id)
      .populate<{ category: ICategoryDoc }>('category', 'name slug')
      .lean();

    if (!result) {
      throw new Error('Failed to create subcategory');
    }

    // Prepare the response
    const r = result as any;
    const response = {
      _id: r._id.toString(),
      name: r.name,
      description: r.description,
      slug: r.slug,
      image: r.image,
      category: {
        _id: r.category._id.toString(),
        name: r.category.name,
        slug: r.category.slug
      },
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error('Error creating subcategory:', error);
    return NextResponse.json(
      { message: 'Failed to create subcategory', error: error.message },
      { status: 500 }
    );
  }
}
