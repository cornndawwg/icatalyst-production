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

// GET /api/customers/[id]/properties
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

    // Get properties for the customer
    const properties = await prisma.property.findMany({
      where: { customerId },
      include: {
        photos: true,
        documents: true,
        address: true,
        systems: true,
        serviceHistory: true,
      },
    });

    res.status(200).json(properties);
  } catch (error) {
    console.error(`Error in GET /api/customers/${customerId}/properties:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /api/customers/[id]/properties
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
      type,
      squareFootage,
      bedrooms,
      bathrooms,
      yearBuilt,
      address,
    } = req.body;

    // Validate required fields
    if (!name || !type || !squareFootage) {
      return res.status(400).json({
        error: 'Missing required fields: name, type, squareFootage',
      });
    }

    // Create new property
    const newProperty = await prisma.property.create({
      data: {
        name,
        type,
        squareFootage,
        bedrooms,
        bathrooms,
        yearBuilt,
        customer: { connect: { id: customerId } },
        address: address ? { create: address } : undefined,
      },
      include: {
        photos: true,
        documents: true,
        address: true,
        systems: true,
        serviceHistory: true,
      },
    });

    res.status(201).json(newProperty);
  } catch (error) {
    console.error(`Error in POST /api/customers/${customerId}/properties:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 