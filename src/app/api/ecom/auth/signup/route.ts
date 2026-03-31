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
    const firstName = requestData.firstName || requestData.name?.split(' ')[0] || '';
    const lastName = requestData.lastName || requestData.name?.split(' ').slice(1).join(' ') || '';
    const email = requestData.email;
    const phone = requestData.phone || requestData.contactNumber || requestData.contact || requestData.phoneNumber;
    const password = requestData.password;

    console.log('Signup request data:', {
      original: requestData,
      processed: { firstName, lastName, email, phone: !!phone, password: !!password }
    });

    // Input validation
    if (!firstName || !email || !phone || !password) {
      const missingFields = [];
      if (!firstName) missingFields.push('firstName');
      if (!email) missingFields.push('email');
      if (!phone) missingFields.push('phone/contact number');
      if (!password) missingFields.push('password');

      return NextResponse.json(
        {
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`,
          received: { firstName: !!firstName, lastName: !!lastName, email: !!email, phone: !!phone, password: !!password },
          originalData: requestData
        },
        { status: 400, headers: corsHeaders }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters' },
        { status: 400, headers: corsHeaders }
      );
    }

    await dbConnect();

    // Check if user already exists with email or phone
    const existingUser = await EcomUser.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User with this email or phone already exists' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Create new user
    const user = await EcomUser.create({
      firstName,
      lastName,
      email,
      phone,
      password,
      role: 'user',
      isActive: true
    });

    // Generate JWT token
    const token = generateToken({
      userId: user._id,
      email: user.email,
      role: user.role
    });

    // Return user data (excluding password)
    const userData = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token
    };

    return NextResponse.json(
      { success: true, user: userData, token },
      { status: 201, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error during signup' },
      { status: 500, headers: corsHeaders }
    );
  }
}
