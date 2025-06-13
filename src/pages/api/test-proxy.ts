import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('[Test API] Received request:', req.method, req.url);
  
  res.status(200).json({
    message: 'Test API route is working',
    middleware: 'If you see this, middleware might not be working',
    timestamp: new Date().toISOString()
  });
}