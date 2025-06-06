import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '../../../../generated/prisma';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { search, category, page = '1', limit = '50' } = req.query;

      const where: any = {};
      
      if (search && typeof search === 'string') {
        where.OR = [
          { name: { contains: search } },
          { description: { contains: search } },
          { brand: { contains: search } },
          { model: { contains: search } },
          { sku: { contains: search } }
        ];
      }
      
      if (category && typeof category === 'string') where.category = category;

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
      
      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where: {
            ...where,
            isActive: true
          },
          skip,
          take: parseInt(limit as string),
          orderBy: { name: 'asc' }
        }),
        prisma.product.count({ 
          where: {
            ...where,
            isActive: true
          }
        })
      ]);

      res.status(200).json({
        products,
        pagination: {
          total,
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          pages: Math.ceil(total / parseInt(limit as string))
        }
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ 
        error: 'Failed to fetch products',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else if (req.method === 'POST') {
    try {
      const {
        name,
        description,
        category,
        brand,
        model,
        sku,
        basePrice,
        goodTierPrice,
        betterTierPrice,
        bestTierPrice,
        specifications,
        compatibility,
        installation
      } = req.body;

      const product = await prisma.product.create({
        data: {
          name,
          description,
          category,
          brand,
          model,
          sku,
          basePrice: parseFloat(basePrice),
          goodTierPrice: goodTierPrice ? parseFloat(goodTierPrice) : null,
          betterTierPrice: betterTierPrice ? parseFloat(betterTierPrice) : null,
          bestTierPrice: bestTierPrice ? parseFloat(bestTierPrice) : null,
          specifications,
          compatibility,
          installation,
          isActive: true
        }
      });

      res.status(201).json(product);
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ 
        error: 'Failed to create product',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 