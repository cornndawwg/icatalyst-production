import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '../../../../generated/prisma';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      if (typeof id !== 'string') {
        return res.status(400).json({ error: 'Property ID must be a string' });
      }

      const property = await prisma.property.findUnique({
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
          address: true,
          photos: true,
          documents: true,
          systems: true,
          serviceHistory: true,
          projects: true,
          proposals: {
            include: {
              items: true
            }
          }
        }
      });

      if (!property) {
        return res.status(404).json({ error: 'Property not found' });
      }

      res.status(200).json(property);
    } catch (error) {
      console.error('Error fetching property:', error);
      res.status(500).json({ 
        error: 'Failed to fetch property',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else if (req.method === 'PUT') {
    try {
      if (typeof id !== 'string') {
        return res.status(400).json({ error: 'Property ID must be a string' });
      }

      const {
        name,
        type,
        squareFootage,
        bedrooms,
        bathrooms,
        yearBuilt,
        address
      } = req.body;

      // Update address if provided
      const property = await prisma.property.findUnique({
        where: { id },
        include: { address: true }
      });

      if (!property) {
        return res.status(404).json({ error: 'Property not found' });
      }

      let addressId = property.addressId;
      if (address) {
        if (property.address) {
          // Update existing address
          await prisma.address.update({
            where: { id: property.addressId! },
            data: address
          });
        } else {
          // Create new address
          const addressRecord = await prisma.address.create({
            data: address
          });
          addressId = addressRecord.id;
        }
      }

      const updatedProperty = await prisma.property.update({
        where: { id },
        data: {
          name,
          type,
          squareFootage: squareFootage ? parseFloat(squareFootage) : undefined,
          bedrooms: bedrooms ? parseInt(bedrooms) : undefined,
          bathrooms: bathrooms ? parseInt(bathrooms) : undefined,
          yearBuilt: yearBuilt ? parseInt(yearBuilt) : undefined,
          addressId
        },
        include: {
          customer: true,
          address: true,
          systems: true,
          serviceHistory: true,
          projects: true,
          proposals: {
            include: {
              items: true
            }
          }
        }
      });

      res.status(200).json(updatedProperty);
    } catch (error) {
      console.error('Error updating property:', error);
      res.status(500).json({ 
        error: 'Failed to update property',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else if (req.method === 'DELETE') {
    try {
      if (typeof id !== 'string') {
        return res.status(400).json({ error: 'Property ID must be a string' });
      }

      // Check if property exists
      const property = await prisma.property.findUnique({
        where: { id }
      });

      if (!property) {
        return res.status(404).json({ error: 'Property not found' });
      }

      // Delete property (cascade will handle related records)
      await prisma.property.delete({
        where: { id }
      });

      res.status(200).json({ message: 'Property deleted successfully' });
    } catch (error) {
      console.error('Error deleting property:', error);
      res.status(500).json({ 
        error: 'Failed to delete property',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 