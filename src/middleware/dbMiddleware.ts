import { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import dbConnect from '@/lib/mongodb';

const dbMiddleware = (handler: NextApiHandler) => async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    // Connect to MongoDB
    await dbConnect();
    
    // Call the actual API handler
    return await handler(req, res);
  } catch (error) {
    console.error('Database connection error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Database connection error' 
    });
  }
};

export default dbMiddleware;
