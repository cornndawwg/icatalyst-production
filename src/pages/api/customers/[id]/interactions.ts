import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid customer ID' });
  }

  switch (req.method) {
    case 'GET':
      return handleGet(req, res, id);
    case 'POST':
      return handlePost(req, res, id);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// GET /api/customers/[id]/interactions
async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse,
  customerId: string
) {
  try {
    // Check if customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const { type, startDate, endDate } = req.query;

    // Build where clause for interactions
    const where: any = { customerId };

    // Filter by type if provided
    if (type && typeof type === 'string') {
      where.type = type;
    }

    // Filter by date range if provided
    if (startDate && typeof startDate === 'string') {
      where.date = { ...where.date, gte: new Date(startDate) };
    }

    if (endDate && typeof endDate === 'string') {
      where.date = { ...where.date, lte: new Date(endDate) };
    }

    // Get interactions with filters
    const interactions = await prisma.interaction.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    res.status(200).json(interactions);
  } catch (error) {
    console.error(`Error in GET /api/customers/${customerId}/interactions:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /api/customers/[id]/interactions
async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse,
  customerId: string
) {
  try {
    // Check if customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: { metrics: true, interactions: true },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
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

    // Create new interaction
    const newInteraction = await prisma.interaction.create({
      data: {
        type,
        date: new Date(date),
        summary,
        details: details || '',
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        followUpNotes,
        createdBy: 'system', // This would come from your auth system
        customer: { connect: { id: customerId } },
      },
    });

    // Update customer metrics
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

    // Calculate average response time if there are multiple interactions
    const allInteractions = await prisma.interaction.findMany({
      where: { customerId },
      orderBy: { date: 'asc' },
    });

    if (allInteractions.length > 1) {
      const timeDiffs = allInteractions.slice(1).map((interaction: any, index: number) => {
        const prevDate = allInteractions[index].date;
        const currentDate = interaction.date;
        return (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60); // Convert to hours
      });

      const avgResponseTime = Math.round(
        timeDiffs.reduce((sum: number, diff: number) => sum + diff, 0) / timeDiffs.length
      );

      await prisma.customerMetrics.update({
        where: { customerId },
        data: { avgResponseTime },
      });
    }

    res.status(201).json(newInteraction);
  } catch (error) {
    console.error(`Error in POST /api/customers/${customerId}/interactions:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 