import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id, interactionId } = req.query;

  if (!id || typeof id !== 'string' || !interactionId || typeof interactionId !== 'string') {
    return res.status(400).json({ error: 'Invalid customer or interaction ID' });
  }

  switch (req.method) {
    case 'GET':
      return handleGet(req, res, id, interactionId);
    case 'PUT':
      return handlePut(req, res, id, interactionId);
    case 'DELETE':
      return handleDelete(req, res, id, interactionId);
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// GET /api/customers/[id]/interactions/[interactionId]
async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse,
  customerId: string,
  interactionId: string
) {
  try {
    // Check if customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Get the specific interaction
    const interaction = await prisma.interaction.findFirst({
      where: {
        id: interactionId,
        customerId: customerId,
      },
    });

    if (!interaction) {
      return res.status(404).json({ error: 'Interaction not found' });
    }

    res.status(200).json(interaction);
  } catch (error) {
    console.error(`Error in GET /api/customers/${customerId}/interactions/${interactionId}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// PUT /api/customers/[id]/interactions/[interactionId]
async function handlePut(
  req: NextApiRequest,
  res: NextApiResponse,
  customerId: string,
  interactionId: string
) {
  try {
    // Check if customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Check if interaction exists and belongs to customer
    const existingInteraction = await prisma.interaction.findFirst({
      where: {
        id: interactionId,
        customerId: customerId,
      },
    });

    if (!existingInteraction) {
      return res.status(404).json({ error: 'Interaction not found' });
    }

    const {
      type,
      date,
      summary,
      details,
      followUpDate,
      followUpNotes,
    } = req.body;

    // Validate required fields
    if (!type || !date || !summary) {
      return res.status(400).json({
        error: 'Missing required fields: type, date, summary',
      });
    }

    // Update interaction
    const updatedInteraction = await prisma.interaction.update({
      where: { id: interactionId },
      data: {
        type,
        date: new Date(date),
        summary,
        details: details || '',
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        followUpNotes,
      },
    });

    // Update customer metrics if necessary
    const latestInteraction = await prisma.interaction.findFirst({
      where: { customerId },
      orderBy: { date: 'desc' },
    });

    if (latestInteraction && latestInteraction.id === interactionId) {
      await prisma.customerMetrics.upsert({
        where: { customerId },
        update: {
          lastInteraction: new Date(date),
          nextScheduledInteraction: followUpDate ? new Date(followUpDate) : null,
        },
        create: {
          customerId,
          totalRevenue: 0,
          projectsCompleted: 0,
          avgResponseTime: 0,
          lastInteraction: new Date(date),
          nextScheduledInteraction: followUpDate ? new Date(followUpDate) : null,
        },
      });
    }

    res.status(200).json(updatedInteraction);
  } catch (error) {
    console.error(`Error in PUT /api/customers/${customerId}/interactions/${interactionId}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// DELETE /api/customers/[id]/interactions/[interactionId]
async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse,
  customerId: string,
  interactionId: string
) {
  try {
    // Check if customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Check if interaction exists and belongs to customer
    const existingInteraction = await prisma.interaction.findFirst({
      where: {
        id: interactionId,
        customerId: customerId,
      },
    });

    if (!existingInteraction) {
      return res.status(404).json({ error: 'Interaction not found' });
    }

    // Delete interaction
    await prisma.interaction.delete({
      where: { id: interactionId },
    });

    // Update customer metrics if this was the latest interaction
    const latestInteraction = await prisma.interaction.findFirst({
      where: { customerId },
      orderBy: { date: 'desc' },
    });

    if (latestInteraction) {
      await prisma.customerMetrics.upsert({
        where: { customerId },
        update: {
          lastInteraction: latestInteraction.date,
        },
        create: {
          customerId,
          totalRevenue: 0,
          projectsCompleted: 0,
          avgResponseTime: 0,
          lastInteraction: latestInteraction.date,
        },
      });
    }

    res.status(204).end();
  } catch (error) {
    console.error(`Error in DELETE /api/customers/${customerId}/interactions/${interactionId}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 