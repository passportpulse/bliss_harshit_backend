import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// GET /api/orders - Get all orders with pagination
export async function GET(req: Request) {
  try {
    const auth = req.headers.get('authorization');
    if (!auth || !auth.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Missing token' },
        { status: 401 }
      );
    }

    const token = auth.split(' ')[1];
    const payload = jwt.verify(token, JWT_SECRET) as any;
    
    // Only allow admin to fetch all orders
    if (payload.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Access denied' },
        { status: 403 }
      );
    }

    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Get total count
    const totalCount = await Order.countDocuments();

    // Get orders with pagination
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const response = {
      data: orders,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      }
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { 
        message: error.name === 'JsonWebTokenError' ? 'Invalid token' : 'Failed to fetch orders',
        error: error.message 
      },
      { status: error.name === 'JsonWebTokenError' ? 401 : 500 }
    );
  }
}

// POST /api/orders - Create a new order
export async function POST(req: Request) {
  try {
    await dbConnect();
    
    const data = await req.json();
    
    // Create the order
    const order = new Order({
      ...data,
      status: 'PENDING',  // Default status
      items: data.items.map((item: any) => ({
        product: item.productId,
        quantity: item.quantity,
        price: item.price
      })),
      total: data.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
    });

    await order.save();

    // Populate the user and items
    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('items.product', 'name price');

    return NextResponse.json(populatedOrder, { status: 201 });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { message: 'Failed to create order', error: error.message },
      { status: 500 }
    );
  }
}
