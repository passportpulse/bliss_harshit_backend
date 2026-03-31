import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import EcomUser from '@/models/EcomUser';
import { ecomAuthMiddleware } from '@/middlewares/ecom-auth';

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

// Get current user profile
export const GET = ecomAuthMiddleware(async (req: Request, userId: string) => {
  try {
    await dbConnect();
    const user = await EcomUser.findById(userId).select('-password');

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Handle both old (name) and new (firstName/lastName) user formats
    const userObj = user.toObject();
    let firstName = userObj.firstName;
    let lastName = userObj.lastName;

    // If user has old 'name' field but not firstName/lastName, split the name
    if (!firstName && (userObj as any).name) {
      const nameParts = (userObj as any).name.split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          ...userObj,
          firstName: firstName || '',
          lastName: lastName || ''
        }
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch profile' },
      { status: 500, headers: corsHeaders }
    );
  }
});

// Update current user profile
export const PUT = ecomAuthMiddleware(async (req: Request, userId: string) => {
  try {
    const body = await req.json();
    await dbConnect();

    // Don't allow changing role or isActive through this endpoint
    if ('role' in body) delete body.role;
    if ('isActive' in body) delete body.isActive;
    if ('password' in body) delete body.password;

    const user = await EcomUser.findByIdAndUpdate(
      userId,
      { $set: body },
      { new: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: user
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update profile' },
      { status: 500, headers: corsHeaders }
    );
  }
});
