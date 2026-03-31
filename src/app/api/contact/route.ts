import dbConnect from '@/lib/mongodb';
import Contact from '@/models/Contact';
import { NextResponse } from 'next/server';

// POST /api/contact - Create a new contact/consultation
export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    
    // Check if it's a consultation form (has location and healthIssue)
    if (body.location && body.healthIssue) {
      // This is a consultation form submission
      const { name, location, healthIssue } = body;
      
      // Basic validation
      if (!name || !location || !healthIssue) {
        return NextResponse.json(
          { message: 'Name, location, and health issue are required' },
          { status: 400 }
        );
      }

      // Create consultation in MongoDB
      const contact = new Contact({
        name,
        email: `consultation-${Date.now()}@E-commerce.com`, // Generate a placeholder email
        message: `Location: ${location}\nHealth Issue: ${healthIssue}`,
        type: 'consultation',
        status: 'new'
      });

      await contact.save();

      return NextResponse.json(
        { message: 'Consultation request submitted successfully', contact },
        { status: 201 }
      );
    } else {
      // This is a regular contact form submission
      const { name, email, message } = body;
      
      // Basic validation
      if (!name || !email || !message) {
        return NextResponse.json(
          { message: 'Name, email, and message are required' },
          { status: 400 }
        );
      }

      // Create contact in MongoDB
      const contact = new Contact({
        name,
        email,
        message,
        type: 'contact',
        status: 'new'
      });

      await contact.save();

      return NextResponse.json(
        { message: 'Message sent successfully', contact },
        { status: 201 }
      );
    }
  } catch (error: any) {
    console.error('Error processing contact/consultation:', error);
    return NextResponse.json(
      { message: 'Failed to process your request', error: error.message },
      { status: 500 }
    );
  }
}

// GET /api/contact - Fetch all contact/consultation submissions
export async function GET() {
  try {
    await dbConnect();
    
    const contacts = await Contact.find()
      .sort({ createdAt: -1 })
      .lean();

    // Transform the data to match the frontend expectations
    const transformedContacts = contacts.map(contact => {
      const c = contact as any; // or as IContact if imported
      return {
        id: c._id.toString(),
        name: c.name,
        email: c.email,
        message: c.message,
        type: c.type || 'contact',
        status: c.status || 'new',
        createdAt: c.createdAt,
        updatedAt: c.updatedAt
      };
    });

    return NextResponse.json(transformedContacts);
  } catch (error: any) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { message: 'Failed to fetch contacts', error: error.message },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
