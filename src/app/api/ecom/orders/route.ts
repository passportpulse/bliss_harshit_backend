import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';

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

// Create new order
export async function POST(req: Request) {
  try {
    await dbConnect();

    const orderData = await req.json();

    // Generate unique order ID
    const orderId = `ORD${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create order
    const order = await Order.create({
      orderId,
      user: orderData.userId || undefined,
      customerEmail: orderData.customerEmail,
      customerPhone: orderData.customerPhone,
      items: orderData.items,
      shippingAddress: orderData.shippingAddress,
      subtotal: orderData.subtotal,
      shippingCharges: orderData.shippingCharges || 0,
      tax: orderData.tax || 0,
      totalPrice: orderData.totalPrice,
      paymentMethod: 'RAZORPAY',
      paymentStatus: 'PAID',
      razorpayOrderId: orderData.razorpayOrderId,
      razorpayPaymentId: orderData.razorpayPaymentId,
      razorpaySignature: orderData.razorpaySignature,
      status: 'PENDING',
      notes: orderData.notes || '',
    });

    // Populate the order with product details
    const populatedOrder = await Order.findById(order._id).populate('items.product', 'name price images');

    return NextResponse.json(
      {
        success: true,
        message: 'Order created successfully',
        order: populatedOrder,
      },
      { status: 201, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create order',
        error: error.message,
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Get orders (supports both customer and admin views)
export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const userId = searchParams.get('userId');

    let query = {};
    // If email or userId provided, filter by customer (for frontend customer view)
    if (email) {
      query = { customerEmail: email };
    } else if (userId) {
      query = { user: userId };
    }
    // Otherwise return all orders (for admin dashboard)

    const orders = await Order.find(query)
      .populate('items.product', 'name price images')
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        orders,
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch orders',
        error: error.message,
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
