import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id, propertyId } = req.query;

  if (!id || typeof id !== 'string' || !propertyId || typeof propertyId !== 'string') {
    return res.status(400).json({ error: 'Invalid customer or property ID' });
  }

  switch (req.method) {
    case 'GET':
      return handleGet(req, res, id, propertyId);
    case 'PUT':
      return handlePut(req, res, id, propertyId);
    case 'DELETE':
      return handleDelete(req, res, id, propertyId);
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// GET /api/customers/[id]/properties/[propertyId]
async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse,
  customerId: string,
  propertyId: string
) {
  try {
    // Check if customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Get the specific property
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        customerId: customerId,
      },
      include: {
        photos: true,
        documents: true,
        address: true,
        systems: true,
        serviceHistory: true,
      },
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.status(200).json(property);
  } catch (error) {
    console.error(`Error in GET /api/customers/${customerId}/properties/${propertyId}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// PUT /api/customers/[id]/properties/[propertyId]
async function handlePut(
  req: NextApiRequest,
  res: NextApiResponse,
  customerId: string,
  propertyId: string
) {
  try {
    // Check if customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Check if property exists and belongs to customer
    const existingProperty = await prisma.property.findFirst({
      where: {
        id: propertyId,
        customerId: customerId,
      },
      include: { address: true },
    });

    if (!existingProperty) {
      return res.status(404).json({ error: 'Property not found' });
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

    // Update property
    const updatedProperty = await prisma.property.update({
      where: { id: propertyId },
      data: {
        name,
        type,
        squareFootage,
        bedrooms,
        bathrooms,
        yearBuilt,
        address: address
          ? existingProperty.address
            ? { update: address }
            : { create: address }
          : undefined,
      },
      include: {
        photos: true,
        documents: true,
        address: true,
        systems: true,
        serviceHistory: true,
      },
    });

    res.status(200).json(updatedProperty);
  } catch (error) {
    console.error(`Error in PUT /api/customers/${customerId}/properties/${propertyId}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// DELETE /api/customers/[id]/properties/[propertyId]
async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse,
  customerId: string,
  propertyId: string
) {
  try {
    // Check if customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Check if property exists and belongs to customer
    const existingProperty = await prisma.property.findFirst({
      where: {
        id: propertyId,
        customerId: customerId,
      },
    });

    if (!existingProperty) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Delete property (cascade will handle related records)
    await prisma.property.delete({
      where: { id: propertyId },
    });

    res.status(204).end();
  } catch (error) {
    console.error(`Error in DELETE /api/customers/${customerId}/properties/${propertyId}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 