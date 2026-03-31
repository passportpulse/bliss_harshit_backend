import dbConnect from '@/lib/mongodb';
import { Category, SubCategory } from '@/models';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';
import { Types } from 'mongoose';

// Lean interfaces
interface ICategoryLean {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  createdAt: Date;
}

interface ISubCategoryLean {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  category: Types.ObjectId;
}

// ================= GET =================
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;

    const category = (await Category.findById(id).lean()) as ICategoryLean | null;
    if (!category) {
      return new Response(JSON.stringify({ message: 'Category not found' }), { status: 404 });
    }

    const subCategories = (await SubCategory.find({ category: id }).lean()) as unknown as ISubCategoryLean[];

    let productCount = 0;
    try {
      const Product = (await import('@/models/Product')).default;
      productCount = await Product.countDocuments({ category: id });
    } catch (e) {}

    const response = {
      id: category._id,
      name: category.name,
      slug: category.slug,
      createdAt: category.createdAt,
      subCategories: subCategories.map((sc) => ({
        id: sc._id,
        name: sc.name,
        slug: sc.slug,
      })),
      _count: { products: productCount },
    };

    return new Response(JSON.stringify(response), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Failed to fetch category' }), { status: 500 });
  }
}

// ================= PUT =================
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const { name } = await req.json();

    if (!name || name.trim() === '') {
      return new Response(JSON.stringify({ message: 'Category name is required' }), { status: 400 });
    }

    // Generate slug
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Check for duplicate slug
    const existingCategory = await Category.findOne({ slug, _id: { $ne: id } });
    if (existingCategory) {
      return new Response(JSON.stringify({ message: 'A category with this name already exists' }), { status: 400 });
    }

    const category = (await Category.findByIdAndUpdate(
      id,
      { name: name.trim(), slug },
      { new: true }
    ).lean()) as ICategoryLean | null;

    if (!category) {
      return new Response(JSON.stringify({ message: 'Category not found' }), { status: 404 });
    }

    const subCategories = (await SubCategory.find({ category: id }).lean()) as unknown as ISubCategoryLean[];

    let productCount = 0;
    try {
      const Product = (await import('@/models/Product')).default;
      productCount = await Product.countDocuments({ category: id });
    } catch (e) {}

    const response = {
      id: category._id,
      name: category.name,
      slug: category.slug,
      createdAt: category.createdAt,
      subCategories: subCategories.map((sc) => ({
        id: sc._id,
        name: sc.name,
        slug: sc.slug,
      })),
      _count: { products: productCount },
    };

    return new Response(JSON.stringify(response), { status: 200 });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ message: 'Failed to update category', error: error.message }),
      { status: 500 }
    );
  }
}

// ================= DELETE =================
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;

    let productCount = 0;
    try {
      const Product = (await import('@/models/Product')).default;
      productCount = await Product.countDocuments({ category: id });
    } catch (e) {}

    if (productCount > 0) {
      return new Response(
        JSON.stringify({
          message:
            'Cannot delete category with existing products. Please remove or reassign products first.',
        }),
        { status: 400 }
      );
    }

    // Delete subcategories
    await SubCategory.deleteMany({ category: id });

    // Delete category
    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) {
      return new Response(JSON.stringify({ message: 'Category not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: 'Category deleted successfully' }), {
      status: 200,
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ message: 'Failed to delete category', error: error.message }),
      { status: 500 }
    );
  }
}
