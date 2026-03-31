import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { EcomUser, User } from '@/models';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  return parts[1];
}

// Get all users (Admin only - using main auth system)
export async function GET(req: Request) {
  try {
    // Check authentication using main auth system
    const authHeader = req.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify JWT token (main auth system)
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Check if current user is admin (using main User model)
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 401 }
      );
    }
    
    // Temporary: Log user details for debugging
    console.log('Current user debug:', {
      id: currentUser._id,
      email: currentUser.email,
      role: currentUser.role,
      isAdmin: currentUser.role === 'admin'
    });
    
    if (currentUser.role !== 'admin') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Admin access required',
          debug: {
            userRole: currentUser.role,
            userEmail: currentUser.email,
            required: 'admin'
          }
        },
        { status: 403 }
      );
    }
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Get total count
    const total = await EcomUser.countDocuments({});
    
    // Get paginated users (excluding passwords)
    const users = await EcomUser.find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// Create a new user (Admin only)
export async function POST(req: Request) {
  try {
    // Check authentication using main auth system
    const authHeader = req.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify JWT token (main auth system)
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Check if current user is admin (using main User model)
    const currentUser = await User.findById(decoded.id);
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    const { name, email, phone, password, role = 'user' } = await req.json();

    // Input validation
    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if user already exists with email or phone
    const existingUser = await EcomUser.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User with this email or phone already exists' },
        { status: 400 }
      );
    }

    // Create new user
    const user = await EcomUser.create({
      name,
      email,
      phone,
      password,
      role,
      isActive: true
    });

    // Return user data (excluding password)
    const userData = user.toObject();
    delete userData.password;

    return NextResponse.json(
      { success: true, data: userData },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create user' },
      { status: 500 }
    );
  }
}
