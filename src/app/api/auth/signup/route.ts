import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  const { email, password } = await req.json();
  
  if (!email || !password) {
    return new Response(JSON.stringify({ message: 'Email and password are required' }), { status: 400 });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return new Response(JSON.stringify({ message: 'Invalid email format' }), { status: 400 });
  }

  // Validate password strength
  if (password.length < 6) {
    return new Response(JSON.stringify({ message: 'Password must be at least 6 characters long' }), { status: 400 });
  }

  try {
    await dbConnect();
    const existing = await User.findOne({ email });
    if (existing) {
      return new Response(JSON.stringify({ message: 'User already exists' }), { status: 409 });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashed, role: 'ADMIN' });
    return new Response(JSON.stringify({ id: user._id, email: user.email, role: user.role }), { status: 201 });
  } catch (err: any) {
    return new Response(JSON.stringify({ message: 'Registration failed', error: err?.message }), { status: 500 });
  }
} 