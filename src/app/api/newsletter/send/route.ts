import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Newsletter from '@/models/Newsletter';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  await dbConnect();
  const { subject, message } = await req.json();
  if (!subject || !message) {
    return NextResponse.json({ message: 'Subject and message are required.' }, { status: 400 });
  }
  const emails = await Newsletter.find({ isActive: true }).distinct('email');
  if (!emails.length) {
    return NextResponse.json({ message: 'No active subscribers.' }, { status: 400 });
  }
  // Configure nodemailer (replace with your SMTP config)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: emails,
      subject,
      text: message,
    });
    return NextResponse.json({ message: 'Newsletter sent to all subscribers.' });
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to send newsletter', error: error.message }, { status: 500 });
  }
}
