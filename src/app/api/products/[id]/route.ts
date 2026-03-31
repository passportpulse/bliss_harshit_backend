import dbConnect from '@/lib/mongodb';
// Import all models to ensure they're registered with Mongoose
import { Product, Category, SubCategory, Image } from '@/models';
import { NextResponse } from 'next/server';
import { Types, Document } from 'mongoose';

type ProductParams = {
  params: {
    id: string;
  };
};

interface ICategory {
  _id: Types.ObjectId;
  name: string;
  slug: string;
}

interface IImage {
  _id: Types.ObjectId;
  url: string;
  alt?: string;
}

interface IProduct extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  price: number;
  category?: ICategory | Types.ObjectId;
  subCategory?: ICategory | Types.ObjectId;
  images: IImage[] | Types.ObjectId[];
  [key: string]: any; // For other fields we might not care about
}

// GET /api/products/[id] - Get a specific product
export async function GET(
  request: Request,
  context: { params: any }
) {
  try {
    await dbConnect();
    
    // Get the ID from the route parameters
  const { id } = context.params;
    console.log('Received product ID:', id);
    
    if (!id || id === 'undefined') {
      console.error('Product ID is missing or undefined');
      return NextResponse.json(
        { message: 'Product ID is required' },
        { status: 400 }
      );
    }
    
    // If ID is not a valid ObjectId, try to find by string ID
    if (!Types.ObjectId.isValid(id)) {
      console.log('Invalid ObjectId format, trying to find by string ID:', id);
      try {
        const productByString = await Product.findOne({ _id: id });
        if (productByString) {
          console.log('Found product using string ID');
          return NextResponse.json(productByString);
        }
      } catch (error) {
        console.error('Error finding product by string ID:', error);
      }
      
      return NextResponse.json(
        { 
          message: 'Invalid product ID format', 
          id: id,
          type: typeof id,
          isValidObjectId: Types.ObjectId.isValid(id)
        },
        { status: 400 }
      );
    }

    console.log('Looking for product with ID:', id);
    const product = (await Product.findById(id)
      .populate<{ category: ICategory }>('category', 'name slug')
      .populate<{ subCategory: ICategory }>('subCategory', 'name slug')
      .populate<{ images: IImage[] }>('images', 'url alt')
      .lean()) as unknown as (IProduct & {
        category?: ICategory;
        subCategory?: ICategory;
        images: IImage[];
      }) | null;

    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }

    // Helper function to convert MongoDB document to plain object
    const toPlainObject = (doc: any) => {
      if (!doc) return null;
      const { _id, ...rest } = doc;
      return { id: _id.toString(), ...rest };
    };

    // Convert _id to id and handle ObjectId types
    // Always normalize consumptionInfo for frontend
    const ci = product.consumptionInfo || {};
    const normalizedConsumptionInfo = {
      dosage: typeof ci.dosage === 'string' ? ci.dosage : '',
      bestTime: typeof ci.bestTime === 'string' ? ci.bestTime : '',
      duration: typeof ci.duration === 'string' ? ci.duration : '',
      note: typeof ci.note === 'string' ? ci.note : ''
    };

    const result = {
      ...product,
      id: product._id.toString(),
      _id: undefined,
      category: toPlainObject(product.category),
      subCategory: toPlainObject(product.subCategory),
      images: product.images?.map(img => ({
        id: img._id.toString(),
        url: img.url,
        alt: img.alt
      })) || [],
      consumptionInfo: normalizedConsumptionInfo,
      faq: Array.isArray(product.faq) ? product.faq : []
    };

    // Log the full product result for debugging
    console.log('API /api/products/[id] result:', JSON.stringify(result, null, 2));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { message: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Update a product
export async function PUT(
  request: Request,
  context: { params: any }
) {
  try {
    await dbConnect();
    
    // Get the ID from the route parameters
  const { id } = context.params;
    console.log('Updating product with ID:', id);
    const data = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { message: 'Product ID is required' },
        { status: 400 }
      );
    }
    
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid product ID' },
        { status: 400 }
      );
    }
    
    if (!data.name || !data.description || !data.price || !data.categoryId) {
      return NextResponse.json(
        { message: 'Product name, description, price, and category are required' },
        { status: 400 }
      );
    }
    
    // Verify category exists
    const category = await Category.findById(data.categoryId);
    if (!category) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if product exists
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }

    // Handle image updates if provided
    let imageIds = existingProduct.images || [];
    if (data.images && Array.isArray(data.images)) {
      // First, remove any existing images for this product
      await Image.deleteMany({ product: id });
      
      // Create new image documents
      const createdImages = await Promise.all(
        data.images.map(async (imageData: { url: string; alt?: string }) => {
          const image = new Image({
            url: imageData.url,
            alt: imageData.alt || data.name || 'Product image',
            product: id
          });
          return await image.save();
        })
      );
      imageIds = createdImages.map(img => img._id);
    }

    // Prepare update data
    // Normalize consumptionInfo to always have all fields
    const ci = data.consumptionInfo || {};
    const normalizedConsumptionInfo = {
      dosage: typeof ci.dosage === 'string' ? ci.dosage : '',
      bestTime: typeof ci.bestTime === 'string' ? ci.bestTime : '',
      duration: typeof ci.duration === 'string' ? ci.duration : '',
      note: typeof ci.note === 'string' ? ci.note : ''
    };

    const updateData: any = {
      name: data.name,
      description: data.description,
      price: data.price,
      originalPrice: data.originalPrice,
      rating: data.rating,
      reviewCount: data.reviewCount,
      unitVariants: data.unitVariants,
      consumptionInfo: normalizedConsumptionInfo,
      ingredients: data.ingredients,
      benefits: data.benefits,
      clinicalStudyNote: data.clinicalStudyNote,
      images: imageIds,
      category: new Types.ObjectId(data.categoryId),
      faq: Array.isArray(data.faq) ? data.faq : []
    };

    // Handle subcategory if provided
    if (data.subCategoryId) {
      updateData.subCategory = new Types.ObjectId(data.subCategoryId);
    }

    // Update the product and get the updated document with populated fields
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate<{ category: ICategory }>('category', 'name slug')
      .populate<{ subCategory: ICategory }>('subCategory', 'name slug')
      .populate<{ images: IImage[] }>('images', 'url alt')
      .lean() as any; // Type assertion to handle Mongoose's complex types

    if (!updatedProduct) {
      return NextResponse.json(
        { message: 'Failed to update product' },
        { status: 500 }
      );
    }

    // Helper function to convert MongoDB document to plain object
    const toPlainObject = (doc: any) => {
      if (!doc) return null;
      const { _id, ...rest } = doc;
      return { id: _id.toString(), ...rest };
    };

    // Convert _id to id for the response
    const result = {
      ...updatedProduct,
      id: updatedProduct._id.toString(),
      _id: undefined,
      category: toPlainObject(updatedProduct.category),
      subCategory: toPlainObject(updatedProduct.subCategory),
      images: (updatedProduct.images || []).map((img: any) => ({
        id: img._id.toString(),
        url: img.url,
        alt: img.alt
      }))
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { message: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Delete a product
export async function DELETE(
  request: Request,
  context: { params: any }
) {
  try {
    // Get the ID from the route parameters
  const { id } = context.params;
    console.log('DELETE request for product ID:', id);
    
    if (!id || id === 'undefined') {
      return NextResponse.json(
        { success: false, message: 'Product ID is required' },
        { status: 400 }
      );
    }
    
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid product ID format' },
        { status: 400 }
      );
    }
    
    const connection = await dbConnect();
    const session = await connection.startSession();
    
    if (!Types.ObjectId.isValid(id)) {
      await session.endSession();
      return NextResponse.json(
        { message: 'Invalid product ID format' },
        { status: 400 }
      );
    }

    try {
      await session.withTransaction(async () => {
        // Check if product exists within the transaction
        const existingProduct = await Product.findById(id).session(session);
        if (!existingProduct) {
          throw new Error('Product not found');
        }

        // Delete associated images first
        await Image.deleteMany({ product: id }).session(session);
        
        // Delete the product
        await Product.findByIdAndDelete(id).session(session);
      });
      
      return new Response(null, { status: 204 });
    } finally {
      // Always end the session
      await session.endSession();
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { message: 'Failed to delete product' },
      { status: 500 }
    );
  }
}