import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  const { email, password, name } = await req.json();
  if (!email || !password) {
    return new Response(JSON.stringify({ message: 'Email and password are required' }), { status: 400 });
  }
  try {
    await dbConnect();
    const existing = await User.findOne({ email });
    if (existing) {
      return new Response(JSON.stringify({ message: 'User already exists' }), { status: 409 });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashed, name });
    return new Response(JSON.stringify({ id: user._id, email: user.email, name: user.name }), { status: 201 });
  } catch (err: any) {
    return new Response(JSON.stringify({ message: 'Registration failed', error: err?.message }), { status: 500 });
  }
}
