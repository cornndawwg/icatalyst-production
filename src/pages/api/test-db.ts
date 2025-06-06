import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '../../../generated/prisma';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Test database connection
    await prisma.$connect();
    
    // Test simple queries
    const customerCount = await prisma.customer.count();
    const projectCount = await prisma.project.count();
    const propertyCount = await prisma.property.count();
    
    await prisma.$disconnect();
    
    return res.status(200).json({
      status: 'success',
      message: 'Database connection successful',
      counts: {
        customers: customerCount,
        projects: projectCount,
        properties: propertyCount
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Database test error:', error);
    
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error('Error disconnecting from database:', disconnectError);
    }
    
    return res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
} 