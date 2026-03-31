import { NextResponse, NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { User } from '@/models';
import dbConnect from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function middleware(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  
  if (!token) {
    return NextResponse.json(
      { message: 'No token provided' },
      { status: 401 }
    );
  }

  try {
    // Verify JWT token
    const decoded: any = jwt.verify(token, JWT_SECRET);
    
    // Connect to MongoDB
    await dbConnect();
    
    // Find user in database
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 401 }
      );
    }

    // Add user to request headers
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-id', user._id.toString());
    requestHeaders.set('x-user-role', user.role);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error: any) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { message: 'Invalid or expired token' },
      { status: 401 }
    );
  }
}

// Specify which routes should use this middleware
export const config = {
  matcher: [
    '/api/dashboard/:path*',
    '/api/profile',
    '/api/users/:path*',
    // Add other protected routes here
  ],
};
