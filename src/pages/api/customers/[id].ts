import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import type { Prisma } from '@prisma/client';

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
    case 'PUT':
      return handlePut(req, res, id);
    case 'DELETE':
      return handleDelete(req, res, id);
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// GET /api/customers/[id]
async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string
) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        tags: true,
        properties: {
          include: {
            photos: true,
            documents: true,
            address: true,
            systems: true,
            serviceHistory: true,
          },
        },
        projects: {
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
          },
        },
        interactions: true,
        metrics: true,
        billingAddress: true,
      },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Transform the customer to match expected format
    const transformedCustomer = {
      ...customer,
      tags: customer.tags.map((tag: { name: string }) => tag.name),
    };

    res.status(200).json(transformedCustomer);
  } catch (error) {
    console.error(`Error in GET /api/customers/${id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// PUT /api/customers/[id]
async function handlePut(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string
) {
  try {
    const {
      type,
      status,
      firstName,
      lastName,
      email,
      phone,
      company,
      preferredCommunication,
      billingAddress,
      tags,
      notes,
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return res.status(400).json({
        error: 'Missing required fields: firstName, lastName, email',
      });
    }

    // Check if customer exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { id },
      include: { tags: true, billingAddress: true },
    });

    if (!existingCustomer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Update customer with related data
    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: {
        type,
        status,
        firstName,
        lastName,
        email,
        phone,
        company,
        preferredCommunication,
        notes,
        billingAddress: billingAddress
          ? existingCustomer.billingAddress
            ? { update: billingAddress }
            : { create: billingAddress }
          : undefined,
        tags: {
          deleteMany: {}, // Remove all existing tags
          create: (tags as string[])?.map((tag: string) => ({
            name: tag,
          })) || [],
        },
      },
      include: {
        tags: true,
        billingAddress: true,
        metrics: true,
      },
    });

    // Transform the response to match expected format
    const transformedCustomer = {
      ...updatedCustomer,
      tags: updatedCustomer.tags.map((tag: { name: string }) => tag.name),
    };

    res.status(200).json(transformedCustomer);
  } catch (error) {
    console.error(`Error in PUT /api/customers/${id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// DELETE /api/customers/[id]
async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string
) {
  try {
    // Check if customer exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!existingCustomer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Delete customer (cascade will handle related records)
    await prisma.customer.delete({
      where: { id },
    });

    res.status(204).end();
  } catch (error) {
    console.error(`Error in DELETE /api/customers/${id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 