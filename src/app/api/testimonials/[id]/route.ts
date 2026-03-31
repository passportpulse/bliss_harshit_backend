import dbConnect from '@/lib/mongodb';
import Testimonial from '@/models/Testimonial';
import { NextResponse } from 'next/server';

// GET single testimonial
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;
  const testimonial = await Testimonial.findById(id);
  if (!testimonial) {
    return NextResponse.json({ message: 'Testimonial not found' }, { status: 404 });
  }
  return NextResponse.json(testimonial);
}

// PUT update testimonial
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;
  const data = await req.json();
  const { name, image, content, location, rating } = data;
  const updated = await Testimonial.findByIdAndUpdate(
    id,
    { name, image, content, location, rating },
    { new: true }
  );
  if (!updated) {
    return NextResponse.json({ message: 'Testimonial not found' }, { status: 404 });
  }
  return NextResponse.json(updated);
}

// DELETE testimonial
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;
  const deleted = await Testimonial.findByIdAndDelete(id);
  if (!deleted) {
    return NextResponse.json({ message: 'Testimonial not found' }, { status: 404 });
  }
  return NextResponse.json({ message: 'Testimonial deleted' });
}
