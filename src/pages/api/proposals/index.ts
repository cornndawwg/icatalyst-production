import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '../../../../generated/prisma';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { search, status, customerId, prospectOnly, page = '1', limit = '50' } = req.query;

      const where: any = {};
      
      if (search && typeof search === 'string') {
        where.OR = [
          { name: { contains: search } },
          { description: { contains: search } },
          { prospectName: { contains: search } },
          { prospectCompany: { contains: search } }
        ];
      }
      
      if (status && typeof status === 'string') where.status = status;
      if (customerId && typeof customerId === 'string') where.customerId = customerId;
      
      // Filter for prospects only
      if (prospectOnly === 'true') {
        where.isExistingCustomer = false;
      }

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
      
      const [proposals, total] = await Promise.all([
        prisma.proposal.findMany({
          where,
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            clientStatus: true,
            totalAmount: true,
            validUntil: true,
            createdAt: true,
            updatedAt: true,
            isExistingCustomer: true,
            prospectName: true,
            prospectCompany: true,
            prospectEmail: true,
            prospectPhone: true,
            customerPersona: true,
            customer: {
              select: {
                firstName: true,
                lastName: true,
                company: true,
                email: true,
                phone: true
              }
            },
            property: {
              select: {
                name: true,
                address: true
              }
            },
            items: {
              include: {
                product: true
              }
            }
          },
          skip,
          take: parseInt(limit as string),
          orderBy: { createdAt: 'desc' }
        }),
        prisma.proposal.count({ where })
      ]);

      // 🎯 ENHANCED: Log API response for debugging
      console.log('📊 CRM Proposals API Response Debug:');
      console.log(`   📋 Total proposals: ${proposals.length}`);
      
      if (proposals.length > 0) {
        console.log('   📈 Status fields in response:');
        proposals.slice(0, 3).forEach((proposal, index) => {
          console.log(`   ${index + 1}. ${proposal.name}:`);
          console.log(`      status: ${proposal.status || 'null'}`);
          console.log(`      clientStatus: ${proposal.clientStatus !== undefined ? proposal.clientStatus : 'UNDEFINED'}`);
        });
        
        const withClientStatus = proposals.filter(p => p.clientStatus);
        console.log(`   🤝 Proposals with clientStatus: ${withClientStatus.length}`);
        
        if (withClientStatus.length > 0) {
          console.log('   ✅ Client decisions found:', withClientStatus.map(p => `${p.name}: ${p.clientStatus}`));
        }
      }

      res.status(200).json({
        proposals,
        pagination: {
          total,
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          pages: Math.ceil(total / parseInt(limit as string))
        }
      });
    } catch (error) {
      console.error('Error fetching proposals:', error);
      res.status(500).json({ 
        error: 'Failed to fetch proposals',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else if (req.method === 'POST') {
    try {
      const proposalData = req.body;

      const proposal = await prisma.proposal.create({
        data: proposalData,
        include: {
          customer: true,
          property: true,
          items: {
            include: {
              product: true
            }
          }
        }
      });

      res.status(201).json(proposal);
    } catch (error) {
      console.error('Error creating proposal:', error);
      res.status(500).json({ 
        error: 'Failed to create proposal',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 