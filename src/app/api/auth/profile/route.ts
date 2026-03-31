import { User } from '@/models';
import dbConnect from '@/lib/mongodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(req: Request) {
  const auth = req.headers.get('authorization');
  
  if (!auth || !auth.startsWith('Bearer ')) {
    return new Response(
      JSON.stringify({ message: 'Missing token' }), 
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const token = auth.split(' ')[1];
  
  try {
    // Verify JWT token
    const payload = jwt.verify(token, JWT_SECRET) as { id: string };
    
    // Connect to MongoDB
    await dbConnect();
    
    // Find user in database
    const user = await User.findById(payload.id).select('-password');
    
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
      role: user.role
    };

    return new Response(
      JSON.stringify(userData), 
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error: any) {
    console.error('Error in /api/auth/profile:', error);
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
