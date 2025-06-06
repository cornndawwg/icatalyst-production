import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '../../../../generated/prisma';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { search, type, customerId, page = '1', limit = '50' } = req.query;

      const where: any = {};
      
      if (search && typeof search === 'string') {
        where.OR = [
          { name: { contains: search } },
          { type: { contains: search } },
          { customer: {
            firstName: { contains: search },
            lastName: { contains: search },
            company: { contains: search }
          }}
        ];
      }
      
      if (type && typeof type === 'string') where.type = type;
      if (customerId && typeof customerId === 'string') where.customerId = customerId;

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
      
      const [properties, total] = await Promise.all([
        prisma.property.findMany({
          where,
          include: {
            customer: {
              select: {
                firstName: true,
                lastName: true,
                company: true
              }
            },
            address: true
          },
          skip,
          take: parseInt(limit as string),
          orderBy: { name: 'asc' }
        }),
        prisma.property.count({ where })
      ]);

      res.status(200).json({
        properties,
        pagination: {
          total,
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          pages: Math.ceil(total / parseInt(limit as string))
        }
      });
    } catch (error) {
      console.error('Error fetching properties:', error);
      res.status(500).json({ 
        error: 'Failed to fetch properties',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else if (req.method === 'POST') {
    try {
      const {
        name,
        type,
        squareFootage,
        bedrooms,
        bathrooms,
        yearBuilt,
        customerId,
        address
      } = req.body;

      // Create address first if provided
      let addressRecord = null;
      if (address) {
        addressRecord = await prisma.address.create({
          data: address
        });
      }

      const property = await prisma.property.create({
        data: {
          name,
          type,
          squareFootage: parseFloat(squareFootage),
          bedrooms: bedrooms ? parseInt(bedrooms) : null,
          bathrooms: bathrooms ? parseInt(bathrooms) : null,
          yearBuilt: yearBuilt ? parseInt(yearBuilt) : null,
          customerId,
          addressId: addressRecord?.id || null
        },
        include: {
          customer: true,
          address: true,
          systems: true,
          serviceHistory: true,
          projects: true,
          proposals: true
        }
      });

      res.status(201).json(property);
    } catch (error) {
      console.error('Error creating property:', error);
      res.status(500).json({ 
        error: 'Failed to create property',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 