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

// GET /api/customers/[id]/projects
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

    const { status } = req.query;

    // Build where clause
    const where: any = { customerId };

    // Filter by status if provided
    if (status && typeof status === 'string') {
      where.status = status;
    }

    // Get projects with filters
    const projects = await prisma.project.findMany({
      where,
      include: {
        teamMembers: {
          include: {
            teamMember: true,
          },
        },
        documents: true,
        milestones: true,
        budget: {
          include: {
            lineItems: true,
          },
        },
        property: {
          include: {
            address: true,
          },
        },
      },
      orderBy: { startDate: 'desc' },
    });

    res.status(200).json(projects);
  } catch (error) {
    console.error(`Error in GET /api/customers/${customerId}/projects:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /api/customers/[id]/projects
async function handlePost(
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

    const {
      name,
      description,
      propertyId,
      startDate,
      endDate,
      status = 'planning',
    } = req.body;

    // Validate required fields
    if (!name || !description || !propertyId || !startDate) {
      return res.status(400).json({
        error: 'Missing required fields: name, description, propertyId, startDate',
      });
    }

    // Validate property belongs to customer
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        customerId: customerId,
      },
    });

    if (!property) {
      return res.status(400).json({
        error: 'Property does not belong to this customer',
      });
    }

    // Create new project
    const newProject = await prisma.project.create({
      data: {
        name,
        description,
        status,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        customer: { connect: { id: customerId } },
        property: { connect: { id: propertyId } },
      },
      include: {
        teamMembers: {
          include: {
            teamMember: true,
          },
        },
        documents: true,
        milestones: true,
        budget: {
          include: {
            lineItems: true,
          },
        },
        property: {
          include: {
            address: true,
          },
        },
      },
    });

    res.status(201).json(newProject);
  } catch (error) {
    console.error(`Error in POST /api/customers/${customerId}/projects:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 