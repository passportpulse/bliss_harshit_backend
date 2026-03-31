import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Vedaconsulting from '@/models/Vedaconsulting';

export async function GET(req: Request, context: { params: any }) {
  await dbConnect();
  const { id } = context.params;
  const item = await Vedaconsulting.findById(id);
  if (!item) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(req: Request, context: { params: any }) {
  await dbConnect();
  const { id } = context.params;
  const body = await req.json();
  const { name, email, contactNo, location, healthIssue } = body;
  if (!name || !email || !contactNo || !location || !healthIssue) {
    return NextResponse.json({ message: 'All fields are required.' }, { status: 400 });
  }
  const updated = await Vedaconsulting.findByIdAndUpdate(id, { name, email, contactNo, location, healthIssue }, { new: true });
  if (!updated) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(req: Request, context: { params: any }) {
  await dbConnect();
  const { id } = context.params;
  const deleted = await Vedaconsulting.findByIdAndDelete(id);
  if (!deleted) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json({ message: 'Deleted' });
}
