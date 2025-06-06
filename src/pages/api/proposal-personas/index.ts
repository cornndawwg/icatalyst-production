import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '../../../../generated/prisma';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { type } = req.query;

      const where: any = {
        isActive: true
      };
      
      if (type && typeof type === 'string') where.type = type;

      const personas = await prisma.proposalPersona.findMany({
        where,
        orderBy: { displayName: 'asc' }
      });

      res.status(200).json(personas);
    } catch (error) {
      console.error('Error fetching proposal personas:', error);
      res.status(500).json({ 
        error: 'Failed to fetch proposal personas',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else if (req.method === 'POST') {
    try {
      const personaData = req.body;

      const persona = await prisma.proposalPersona.create({
        data: personaData
      });

      res.status(201).json(persona);
    } catch (error) {
      console.error('Error creating proposal persona:', error);
      res.status(500).json({ 
        error: 'Failed to create proposal persona',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 