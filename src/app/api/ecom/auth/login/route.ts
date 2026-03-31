import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import EcomUser from '@/models/EcomUser';
import { generateToken } from '@/lib/ecom-auth';

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

export async function POST(req: Request) {
  try {
    const requestData = await req.json();
    
    // Extract fields with flexible naming
    const login = requestData.login || requestData.email || requestData.emailId || requestData.phone || requestData.phoneNumber;
    const password = requestData.password;

    console.log('Login request data:', { 
      original: requestData,
      processed: { login: !!login, password: !!password }
    });

    // Input validation
    if (!login || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email/Phone and password are required',
          received: { login: !!login, password: !!password },
          originalData: requestData
        },
        { status: 400, headers: corsHeaders }
      );
    }

    await dbConnect();

    // Find user by email or phone
    const user = await EcomUser.findOne({
      $or: [
        { email: login },
        { phone: login }
      ]
    }).select('+password');

    // Check if user exists and is active
    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401, headers: corsHeaders }
      );
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401, headers: corsHeaders }
      );
    }

    // Generate JWT token
    const token = generateToken({
      userId: user._id,
      email: user.email,
      role: user.role
    });

    console.log('Generated JWT token:', token);

    // Handle both old (name) and new (firstName/lastName) user formats
    let firstName = user.firstName;
    let lastName = user.lastName;

    // If user has old 'name' field but not firstName/lastName, split the name
    if (!firstName && (user as any).name) {
      const nameParts = (user as any).name.split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    }

    // Return user data (excluding password)
    const userData = {
      _id: user._id,
      firstName: firstName || '',
      lastName: lastName || '',
      email: user.email,
      phone: user.phone,
      role: user.role,
      token
    };

    return NextResponse.json(
      {
        success: true,
        user: userData,
        token
      },
      { headers: corsHeaders }
    );

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error during login' },
      { status: 500, headers: corsHeaders }
    );
  }
}
