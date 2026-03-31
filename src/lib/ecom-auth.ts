import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET || 'ecom-secret-key';
const JWT_EXPIRES_IN = '30d';

export interface AuthPayload {
  userId: Types.ObjectId;
  email: string;
  role: 'user' | 'admin';
}

export function generateToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch (error) {
    return null;
  }
}

export function extractToken(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.split(' ')[1];
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

export async function comparePasswords(candidatePassword: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, hashedPassword);
}
