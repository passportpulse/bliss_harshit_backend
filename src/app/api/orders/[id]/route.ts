import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export async function PATCH(req: Request, context: { params: any }) {
  const auth = req.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ message: 'Missing token' }), { status: 401 });
  }
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    if (payload.role !== 'ADMIN') {
      return new Response(JSON.stringify({ message: 'Access denied' }), { status: 403 });
    }
    const { status } = await req.json();
    if (!status) {
      return new Response(JSON.stringify({ message: 'Order status required' }), { status: 400 });
    }
    await dbConnect();
    const order = await Order.findByIdAndUpdate(context.params.id, { status }, { new: true });
    if (!order) {
      return new Response(JSON.stringify({ message: 'Order not found' }), { status: 404 });
    }
    return new Response(JSON.stringify(order), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ message: 'Invalid token or update failed', error: err?.message }), { status: 401 });
  }
}