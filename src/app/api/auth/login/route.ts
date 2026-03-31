import { User } from '@/models';
import dbConnect from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(req: Request) {
  const { email, password } = await req.json();
  
  if (!email || !password) {
    return new Response(JSON.stringify({ message: 'Email and password are required' }), { status: 400 });
  }

  try {
    // Connect to MongoDB
    await dbConnect();
    
    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return new Response(
        JSON.stringify({ message: 'Invalid credentials' }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Only allow ADMIN users to log in
    if (user.role !== 'ADMIN') {
      return new Response(
        JSON.stringify({ message: 'Access denied. Admin privileges required.' }), 
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return new Response(
        JSON.stringify({ message: 'Invalid credentials' }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        name: user.name,
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data (excluding password)
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    return new Response(
      JSON.stringify({ 
        token, 
        user: userData
      }), 
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error: any) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({ 
        message: 'Login failed', 
        error: error.message 
      }), 
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}
