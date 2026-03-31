// GET /api/products
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
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
  jwt.verify(token, JWT_SECRET);
  await dbConnect();
  const products = await Product.find().lean();
  return res.status(200).json(products);
  } catch (err: any) {
    return res.status(401).json({ message: 'Invalid token', error: err?.message });
  }
}

