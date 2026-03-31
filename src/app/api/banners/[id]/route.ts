import dbConnect from '@/lib/mongodb';
import Banner from '@/models/Banner';
import { NextResponse } from 'next/server';

// GET single banner
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;
  const banner = await Banner.findById(id);
  if (!banner) {
    return NextResponse.json({ message: 'Banner not found' }, { status: 404 });
  }
  return NextResponse.json(banner);
}

// PUT update banner
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;
  const data = await req.json();
  const { title, image, link } = data;
  const updated = await Banner.findByIdAndUpdate(
    id,
    { title, image, link },
    { new: true }
  );
  if (!updated) {
    return NextResponse.json({ message: 'Banner not found' }, { status: 404 });
  }
  return NextResponse.json(updated);
}

// DELETE banner
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;
  const deleted = await Banner.findByIdAndDelete(id);
  if (!deleted) {
    return NextResponse.json({ message: 'Banner not found' }, { status: 404 });
  }
  return NextResponse.json({ message: 'Banner deleted' });
}
