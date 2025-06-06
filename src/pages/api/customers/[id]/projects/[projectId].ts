import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id, projectId } = req.query;

  if (!id || typeof id !== 'string' || !projectId || typeof projectId !== 'string') {
    return res.status(400).json({ error: 'Invalid customer or project ID' });
  }

  switch (req.method) {
    case 'GET':
      return handleGet(req, res, id, projectId);
    case 'PUT':
      return handlePut(req, res, id, projectId);
    case 'DELETE':
      return handleDelete(req, res, id, projectId);
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// GET /api/customers/[id]/projects/[projectId]
async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse,
  customerId: string,
  projectId: string
) {
  try {
    // Check if customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Get the specific project
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        customerId: customerId,
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

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.status(200).json(project);
  } catch (error) {
    console.error(`Error in GET /api/customers/${customerId}/projects/${projectId}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// PUT /api/customers/[id]/projects/[projectId]
async function handlePut(
  req: NextApiRequest,
  res: NextApiResponse,
  customerId: string,
  projectId: string
) {
  try {
    // Check if customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Check if project exists and belongs to customer
    const existingProject = await prisma.project.findFirst({
      where: {
        id: projectId,
        customerId: customerId,
      },
    });

    if (!existingProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const {
      name,
      description,
      status,
      startDate,
      endDate,
      propertyId,
    } = req.body;

    // Validate required fields
    if (!name || !description || !startDate) {
      return res.status(400).json({
        error: 'Missing required fields: name, description, startDate',
      });
    }

    // If propertyId is being changed, validate it belongs to customer
    if (propertyId && propertyId !== existingProject.propertyId) {
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
    }

    // Update project
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        name,
        description,
        status,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        ...(propertyId && { property: { connect: { id: propertyId } } }),
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

    res.status(200).json(updatedProject);
  } catch (error) {
    console.error(`Error in PUT /api/customers/${customerId}/projects/${projectId}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// DELETE /api/customers/[id]/projects/[projectId]
async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse,
  customerId: string,
  projectId: string
) {
  try {
    // Check if customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Check if project exists and belongs to customer
    const existingProject = await prisma.project.findFirst({
      where: {
        id: projectId,
        customerId: customerId,
      },
    });

    if (!existingProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Delete project (cascade will handle related records)
    await prisma.project.delete({
      where: { id: projectId },
    });

    res.status(204).end();
  } catch (error) {
    console.error(`Error in DELETE /api/customers/${customerId}/projects/${projectId}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 