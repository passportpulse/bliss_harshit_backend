import dbConnect from '@/lib/db';
import User from '@/models/User';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';

// PUT /api/user/profile - Update user profile
export async function PUT(req: Request) {
  const authHeader = req.headers.get('authorization');
  const token = extractTokenFromHeader(authHeader);
  
  if (!token) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
  }

  const decoded = await verifyToken(token);
  if (!decoded) {
    return new Response(JSON.stringify({ message: 'Invalid token' }), { status: 401 });
  }

  // Ensure we have a valid user ID
  if (!decoded.id) {
    return new Response(JSON.stringify({ message: 'Invalid user ID' }), { status: 401 });
  }

  try {
    const { name, email } = await req.json();
    
    await dbConnect();
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return new Response(JSON.stringify({ message: 'User not found' }), { status: 404 });
    }
    const updateData: any = {};
    if (name !== undefined && name !== null) {
      updateData.name = name.trim();
    }
    if (email !== undefined && email !== null) {
      const trimmedEmail = email.trim().toLowerCase();
      if (trimmedEmail !== currentUser.email) {
        const existingUser = await User.findOne({ email: trimmedEmail, _id: { $ne: decoded.id } });
        if (existingUser) {
          return new Response(JSON.stringify({ message: 'Email is already taken by another user' }), { status: 400 });
        }
      }
      updateData.email = trimmedEmail;
    }
    if (Object.keys(updateData).length === 0) {
      return new Response(JSON.stringify(currentUser), { status: 200 });
    }
    const updatedUser = await User.findByIdAndUpdate(decoded.id, updateData, { new: true, select: 'id name email role createdAt' });
    return new Response(JSON.stringify(updatedUser), { status: 200 });
  } catch (error: any) {
    console.error('Profile update error:', error);
    return new Response(JSON.stringify({ message: 'Failed to update profile', error: error.message }), { status: 500 });
  }
} 