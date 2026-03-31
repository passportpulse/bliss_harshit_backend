import dbConnect from '@/lib/mongodb';
import { SubCategory, Category, Product } from '@/models';

// GET /api/subcategories/[id] - Get a single subcategory
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const subcategory = await SubCategory.findById(id).populate('category').lean();
    if (!subcategory || Array.isArray(subcategory)) {
      return new Response(JSON.stringify({ message: 'Subcategory not found' }), { status: 404 });
    }
    // Count products in this subcategory
    const productCount = await Product.countDocuments({ subCategory: id });
    const response = {
      id: subcategory._id,
      name: subcategory.name,
      slug: subcategory.slug,
      categoryId: subcategory.category?._id?.toString() || '',
      category: subcategory.category ? { id: subcategory.category._id, name: subcategory.category.name } : null,
      _count: { products: productCount },
    };
    return new Response(JSON.stringify(response), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Failed to fetch subcategory' }), { status: 500 });
  }
}

// PUT /api/subcategories/[id] - Update a subcategory
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const { name, categoryId } = await req.json();
    if (!name || !categoryId) {
      return new Response(JSON.stringify({ message: 'Name and categoryId are required' }), { status: 400 });
    }
    // Generate slug
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    // Check for duplicate slug in same category
    const existing = await SubCategory.findOne({ slug, category: categoryId, _id: { $ne: id } });
    if (existing) {
      return new Response(JSON.stringify({ message: 'A subcategory with this name already exists in this category' }), { status: 400 });
    }
    const updated = await SubCategory.findByIdAndUpdate(
      id,
      { name: name.trim(), slug, category: categoryId },
      { new: true }
    ).populate('category').lean();
    if (!updated || Array.isArray(updated)) {
      return new Response(JSON.stringify({ message: 'Subcategory not found' }), { status: 404 });
    }
    // Count products
    const productCount = await Product.countDocuments({ subCategory: id });
    const response = {
      id: updated._id,
      name: updated.name,
      slug: updated.slug,
      categoryId: updated.category?._id?.toString() || '',
      category: updated.category ? { id: updated.category._id, name: updated.category.name } : null,
      _count: { products: productCount },
    };
    return new Response(JSON.stringify(response), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Failed to update subcategory' }), { status: 500 });
  }
}

// DELETE /api/subcategories/[id] - Delete a subcategory
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    // Check if subcategory has products
    const productCount = await Product.countDocuments({ subCategory: id });
    if (productCount > 0) {
      return new Response(JSON.stringify({ message: 'Cannot delete subcategory with existing products. Please remove or reassign products first.' }), { status: 400 });
    }
    const deleted = await SubCategory.findByIdAndDelete(id);
    if (!deleted) {
      return new Response(JSON.stringify({ message: 'Subcategory not found' }), { status: 404 });
    }
    return new Response(JSON.stringify({ message: 'Subcategory deleted successfully' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Failed to delete subcategory' }), { status: 500 });
  }
}
