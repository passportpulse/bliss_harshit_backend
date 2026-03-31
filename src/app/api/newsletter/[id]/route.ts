import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Newsletter from '@/models/Newsletter';

export async function PUT(req: Request, context: { params: any }) {
  await dbConnect();
  const { id } = context.params;
  const body = await req.json();
  const { email, isActive } = body;
  const updated = await Newsletter.findByIdAndUpdate(id, { email, isActive }, { new: true });
  if (!updated) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(req: Request, context: { params: any }) {
  await dbConnect();
  const { id } = context.params;
  const deleted = await Newsletter.findByIdAndDelete(id);
  if (!deleted) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json({ message: 'Deleted' });
}
