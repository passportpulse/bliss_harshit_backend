import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import EcomUser from '@/models/EcomUser';
import { ecomAuthMiddleware } from '@/middlewares/ecom-auth';
import bcrypt from 'bcryptjs';

export const POST = ecomAuthMiddleware(async (req: Request, userId: string) => {
  try {
    const { currentPassword, newPassword } = await req.json();

    // Input validation
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Current and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'New password must be at least 6 characters' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Get user with password
    const user = await EcomUser.findById(userId).select('+password');
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Update password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to change password' },
      { status: 500 }
    );
  }
});
