import dbConnect from '@/lib/db';
import User from '@/models/User';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// PUT /api/user/password - Update user password
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
    const { currentPassword, newPassword } = await req.json();
    
    if (!currentPassword || !newPassword) {
      return new Response(JSON.stringify({ message: 'Current password and new password are required' }), { status: 400 });
    }

    if (newPassword.length < 6) {
      return new Response(JSON.stringify({ message: 'New password must be at least 6 characters long' }), { status: 400 });
    }

    await dbConnect();
    const user = await User.findById(decoded.id).select('+password');
    if (!user) {
      return new Response(JSON.stringify({ message: 'User not found' }), { status: 404 });
    }
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return new Response(JSON.stringify({ message: 'Current password is incorrect' }), { status: 400 });
    }
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedNewPassword;
    await user.save();
    return new Response(JSON.stringify({ message: 'Password updated successfully' }), { status: 200 });
  } catch (error: any) {
    console.error('Password update error:', error);
    return new Response(JSON.stringify({ message: 'Failed to update password', error: error.message }), { status: 500 });
  }
} 