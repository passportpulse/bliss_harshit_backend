import dbConnect from '@/lib/mongodb';
import Banner from '@/models/Banner';
import { NextResponse } from 'next/server';

// GET all banners
export async function GET() {
  await dbConnect();
  const banners = await Banner.find().sort({ createdAt: -1 });
  return NextResponse.json(banners);
}

// POST create banner
export async function POST(req: Request) {
  await dbConnect();
  const data = await req.json();
  const { title, image, link } = data;
  if (!title || !image) {
    return NextResponse.json({ message: 'Title and image are required' }, { status: 400 });
  }
  const banner = new Banner({ title, image, link });
  await banner.save();
  return NextResponse.json(banner, { status: 201 });
}
