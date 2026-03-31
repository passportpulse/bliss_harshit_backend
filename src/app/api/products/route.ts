import dbConnect from '@/lib/mongodb';
// Import all models to ensure they're registered with Mongoose
import { Product, Category, SubCategory, Image } from '@/models';
import { NextResponse } from 'next/server';
import { Types } from 'mongoose';

// OPTIONS /api/products - Handle CORS preflight requests
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}

// GET /api/products - Get all products with pagination
export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Get total count
    const totalCount = await Product.countDocuments();

    // Get products with pagination
    const products = await Product.find()
      .populate('category', 'name slug')
      .populate('subCategory', 'name slug')
      .populate('images', 'url alt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Add image count to each product
    const productsWithImageCount = products.map((product: any) => ({
      ...product,
      _count: {
        images: product.images?.length || 0
      }
    }));

    const response = {
      data: productsWithImageCount,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      }
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { message: 'Failed to fetch products', error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/products - Create a new product
export async function POST(req: Request) {
  try {
    await dbConnect();

    const data = await req.json();
    console.log('Received product data:', data);


    // Check if product with same name already exists
    const existingProduct = await Product.findOne({ name: data.name });

    if (existingProduct) {
      return NextResponse.json(
        { message: 'Product with this name already exists' },
        { status: 400 }
      );
    }

    // Parse the images if it's a string
    let imagePaths = [];
    try {
      imagePaths = typeof data.images === 'string' ? JSON.parse(data.images) : (data.images || []);
    } catch (e) {
      console.error('Error parsing images:', e);
      imagePaths = [];
    }
    console.log("data", data);
    // Normalize consumptionInfo to always have all fields
    const ci = data.consumptionInfo || {};
    const normalizedConsumptionInfo = {
      dosage: typeof ci.dosage === 'string' ? ci.dosage : '',
      bestTime: typeof ci.bestTime === 'string' ? ci.bestTime : '',
      duration: typeof ci.duration === 'string' ? ci.duration : '',
      note: typeof ci.note === 'string' ? ci.note : ''
    };

    // First, create the product without images
    const product = new Product({
      ...data,
      price: parseFloat(data.price),
      stock: data.stock !== undefined ? parseInt(data.stock) : undefined,
      category: data.categoryId ? new Types.ObjectId(data.categoryId) : null,
      subCategory: data.subCategoryId ? new Types.ObjectId(data.subCategoryId) : null,
      images: [], // Start with empty images array
      consumptionInfo: normalizedConsumptionInfo,
      unitVariants: Array.isArray(data.unitVariants) ? data.unitVariants : [],
      ingredients: Array.isArray(data.ingredients) ? data.ingredients : [],
      benefits: Array.isArray(data.benefits) ? data.benefits : [],
      clinicalStudyNote: typeof data.clinicalStudyNote === 'string' ? data.clinicalStudyNote : '',
      faq: Array.isArray(data.faq) ? data.faq : []
    });
    console.log('Creating product: before saving ', product);


  await product.save();
  // Debug: Log the full product object after save
  const savedProduct = await Product.findById(product._id).lean();
  console.log('Saved product (full):', savedProduct);

    // Then create the images with the product reference
    const createdImages = await Promise.all(
      imagePaths.map(async (path: string) => {
        const image = new Image({
          url: path,
          alt: data.name || 'Product image',
          product: product._id  // Set the product reference
        });
        return await image.save();
      })
    );

    // Update the product with the image references
    product.images = createdImages.map(img => img._id);
    await product.save();

    // Populate the category and subcategory details
    const populatedProduct = await Product.findById(product._id)
      .populate('category', 'name slug')
      .populate('subCategory', 'name slug')
      .populate('images', 'url alt');

    return NextResponse.json(populatedProduct, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { message: 'Failed to create product', error: error.message },
      { status: 500 }
    );
  }
}
