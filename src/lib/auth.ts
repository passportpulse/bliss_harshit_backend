import jwt from 'jsonwebtoken';


const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export interface JWTPayload {
  id: string;
  name?: string;
  email: string;
  role: 'ADMIN' | 'CUSTOMER';
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    if (!decoded || !decoded.id) {
      return null;
    }
    // Optionally: Add MongoDB user check here if needed
    return decoded;
  } catch (error) {
    return null;
  }
}

export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
} 