import dbConnect from '@/lib/mongodb';
import Testimonial from '@/models/Testimonial';
import { NextResponse } from 'next/server';

// GET all testimonials
export async function GET() {
  await dbConnect();
  const testimonials = await Testimonial.find().sort({ createdAt: -1 });
  return NextResponse.json(testimonials);
}

// POST create testimonial
export async function POST(req: Request) {
  await dbConnect();
  const data = await req.json();
  const { name, image, content, location, rating } = data;
  if (!name || !content || !location || typeof rating !== 'number') {
    return NextResponse.json({ message: 'All fields (except image) and rating are required' }, { status: 400 });
  }
  const testimonial = new Testimonial({ name, image, content, location, rating });
  await testimonial.save();
  return NextResponse.json(testimonial, { status: 201 });
}
