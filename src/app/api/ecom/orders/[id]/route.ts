import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// Get single order by ID
export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const params = await props.params;

    const order = await Order.findById(params.id)
      .populate('items.product', 'name price images')
      .populate('user', 'firstName lastName email')
      .lean();

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: 'Order not found',
        },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      {
        success: true,
        order,
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('Get order error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch order',
        error: error.message,
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Update order status
export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const params = await props.params;
    const { status, trackingNumber } = await req.json();

    const updateData: any = {};
    if (status) updateData.status = status;
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;

    const order = await Order.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('items.product', 'name price images')
      .populate('user', 'firstName lastName email');

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: 'Order not found',
        },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Order updated successfully',
        order,
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('Update order error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update order',
        error: error.message,
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
