import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  return parts[1];
}

export async function GET(req: Request) {
  try {
    console.log('=== AUTH DEBUG API ===');
    
    const authHeader = req.headers.get('authorization');
    console.log('Auth header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader) {
      return NextResponse.json({
        success: false,
        message: 'No authorization header',
        debug: { hasHeader: false }
      });
    }

    const token = extractTokenFromHeader(authHeader);
    console.log('Token extracted:', token ? 'Yes' : 'No');
    
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'No token in header',
        debug: { hasHeader: true, hasToken: false }
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      console.log('Token decoded, user ID:', decoded.id);
    } catch (error) {
      return NextResponse.json({
        success: false,
        message: 'Invalid token',
        debug: { hasHeader: true, hasToken: true, tokenValid: false }
      });
    }

    await dbConnect();

    const user = await User.findById(decoded.id);
    console.log('User found:', !!user);
    console.log('User role:', user?.role);

    return NextResponse.json({
      success: true,
      debug: {
        hasHeader: true,
        hasToken: true,
        tokenValid: true,
        userFound: !!user,
        userId: decoded.id,
        userEmail: user?.email || 'NOT_FOUND',
        userRole: user?.role || 'NOT_FOUND',
        userName: user?.name || 'NOT_FOUND',
        isAdmin: user?.role === 'admin',
        adminCheck: user?.role === 'admin' ? 'PASS' : 'FAIL'
      }
    });

  } catch (error: any) {
    console.error('Debug API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Server error',
      error: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}