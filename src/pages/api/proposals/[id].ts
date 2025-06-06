import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '../../../../generated/prisma';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      if (typeof id !== 'string') {
        return res.status(400).json({ error: 'Proposal ID must be a string' });
      }

      const proposal = await prisma.proposal.findUnique({
        where: { id },
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              company: true,
              email: true,
              phone: true
            }
          },
          property: {
            include: {
              address: true
            }
          },
          items: {
            include: {
              product: true
            },
            orderBy: {
              sortOrder: 'asc'
            }
          }
        }
      });

      if (!proposal) {
        return res.status(404).json({ error: 'Proposal not found' });
      }

      res.status(200).json(proposal);
    } catch (error) {
      console.error('Error fetching proposal:', error);
      res.status(500).json({ 
        error: 'Failed to fetch proposal',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else if (req.method === 'PUT') {
    try {
      if (typeof id !== 'string') {
        return res.status(400).json({ error: 'Proposal ID must be a string' });
      }

      const proposalData = req.body;

      const updatedProposal = await prisma.proposal.update({
        where: { id },
        data: proposalData,
        include: {
          customer: true,
          property: true,
          items: {
            include: {
              product: true
            }
          }
        }
      });

      res.status(200).json(updatedProposal);
    } catch (error) {
      console.error('Error updating proposal:', error);
      res.status(500).json({ 
        error: 'Failed to update proposal',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else if (req.method === 'DELETE') {
    try {
      if (typeof id !== 'string') {
        return res.status(400).json({ error: 'Proposal ID must be a string' });
      }

      // Delete proposal (cascade will handle items)
      await prisma.proposal.delete({
        where: { id }
      });

      res.status(200).json({ message: 'Proposal deleted successfully' });
    } catch (error) {
      console.error('Error deleting proposal:', error);
      res.status(500).json({ 
        error: 'Failed to delete proposal',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 