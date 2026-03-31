// GET /api/auth/profile
import dbConnect from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing token' });
  }
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
  await dbConnect();
  const user = await User.findById(payload.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  return res.status(200).json({ id: user._id, email: user.email, name: user.name, role: user.role });
  } catch (err: any) {
    return res.status(401).json({ message: 'Invalid token', error: err?.message });
  }
}

