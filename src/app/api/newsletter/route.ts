import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Newsletter from '@/models/Newsletter';

// POST /api/newsletter - Subscribe to newsletter
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingNewsletter = await Newsletter.findOne({ email });

    if (existingNewsletter) {
      if (existingNewsletter.isActive) {
        return NextResponse.json(
          { message: 'Email is already subscribed to the newsletter' },
          { status: 409 }
        );
      } else {
        // Reactivate the subscription
        existingNewsletter.isActive = true;
        existingNewsletter.updatedAt = new Date();
        await existingNewsletter.save();
        
        return NextResponse.json(
          { message: 'Newsletter subscription reactivated successfully' },
          { status: 200 }
        );
      }
    }

    // Create new subscription
    const newsletter = new Newsletter({
      email,
      isActive: true,
      subscribedAt: new Date(),
      updatedAt: new Date()
    });

    await newsletter.save();

    return NextResponse.json(
      { message: 'Successfully subscribed to the newsletter' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error processing newsletter subscription:', error);
    return NextResponse.json(
      { message: 'Failed to process subscription', error: error.message },
      { status: 500 }
    );
  }
}

// GET /api/newsletter - Get all newsletter subscribers (for admin)
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    const status = searchParams.get('status'); // 'active' or 'inactive'
    const search = searchParams.get('search');

    // Build query
    const query: any = {};
    
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    if (search) {
      query.email = { $regex: search, $options: 'i' };
    }

    // Get total count
    const totalCount = await Newsletter.countDocuments(query);

    // Get subscribers with pagination
    const subscribers = await Newsletter.find(query)
      .sort({ subscribedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Transform the data to match frontend expectations
    const transformedSubscribers = subscribers.map(subscriber => {
      const s = subscriber as any;
      return {
        id: s._id.toString(),
        email: s.email,
        isActive: s.isActive,
        subscribedAt: s.subscribedAt,
        updatedAt: s.updatedAt
      };
    });

    return NextResponse.json({
      data: transformedSubscribers,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      }
    });
  } catch (error: any) {
    console.error('Error fetching newsletter subscribers:', error);
    return NextResponse.json(
      { message: 'Failed to fetch subscribers', error: error.message },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
