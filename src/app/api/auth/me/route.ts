import { User } from '@/models';
import dbConnect from '@/lib/mongodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  return parts[1];
}

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  const token = extractTokenFromHeader(authHeader);
  
  if (!token) {
    return new Response(
      JSON.stringify({ message: 'No token provided' }), 
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    
    // Connect to MongoDB
    await dbConnect();
    
    // Find user in database
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return new Response(
        JSON.stringify({ message: 'User not found' }), 
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Return user data (excluding password)
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    };

    return new Response(
      JSON.stringify(userData), 
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error: any) {
    console.error('Error in /api/auth/me:', error);
    return new Response(
      JSON.stringify({ 
        message: 'Authentication failed', 
        error: error.message 
      }), 
      { 
        status: error.name === 'JsonWebTokenError' ? 401 : 500,
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}