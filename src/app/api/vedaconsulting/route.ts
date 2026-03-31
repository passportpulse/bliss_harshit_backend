import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Vedaconsulting from '@/models/Vedaconsulting';

export async function GET() {
  await dbConnect();
  const data = await Vedaconsulting.find().sort({ createdAt: -1 });
  return NextResponse.json({ data });
}

export async function POST(req: Request) {
  await dbConnect();
  const body = await req.json();
  const { name, email, contactNo, location, healthIssue } = body;
  if (!name || !email || !contactNo || !location || !healthIssue) {
    return NextResponse.json({ message: 'All fields are required.' }, { status: 400 });
  }
  const created = await Vedaconsulting.create({ name, email, contactNo, location, healthIssue });
  return NextResponse.json({ data: created });
}
