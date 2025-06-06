import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { generatePortalToken } from '../../../../lib/simplePortalAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'POST') {
    try {
      if (typeof id !== 'string') {
        return res.status(400).json({ error: 'Proposal ID must be a string' });
      }

      // 🔧 ENHANCED: Fetch real proposal data from database
      try {
        const prisma = new PrismaClient();

        const proposal = await prisma.proposal.findUnique({
          where: { id },
          include: {
            customer: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                company: true
              }
            }
          }
        });

        if (!proposal) {
          return res.status(404).json({ error: 'Proposal not found' });
        }

        // Determine client name and email
        let clientName = '';
        let clientEmail = '';

        if (proposal.isExistingCustomer && proposal.customer) {
          clientName = `${proposal.customer.firstName} ${proposal.customer.lastName}`;
          clientEmail = proposal.customer.email;
        } else {
          clientName = proposal.prospectName || 'Valued Client';
          clientEmail = proposal.prospectEmail || '';
        }

        // Generate portal token
        const { customExpiry } = req.body;
        const portalData = generatePortalToken(
          proposal.id,
          proposal.name,
          clientName,
          clientEmail,
          customExpiry
        );

        // 🎯 ENHANCED: Update proposal with portal token info
        const updatedProposal = await prisma.proposal.update({
          where: { id: proposal.id },
          data: {
            portalToken: portalData.token,
            portalExpiresAt: portalData.expiresAt,
            portalViewCount: 0,
            portalLastViewed: null,
            updatedAt: new Date()
          }
        });

        await prisma.$disconnect();

        console.log('✅ Portal generated for proposal:', {
          proposalId: proposal.id,
          proposalName: proposal.name,
          clientName,
          clientEmail,
          expiresAt: portalData.expiresAt.toISOString()
        });

        res.status(200).json({
          portalUrl: portalData.url,
          token: portalData.token,
          expiresAt: portalData.expiresAt,
          proposal: {
            id: proposal.id,
            name: proposal.name,
            clientName,
            clientEmail,
            totalAmount: proposal.totalAmount,
            status: proposal.status,
            clientStatus: proposal.clientStatus
          }
        });

      } catch (dbError) {
        console.error('❌ Database error fetching proposal:', dbError);
        
        // 🔧 FALLBACK: Use mock data if database fails
        const mockProposal = {
          id,
          name: 'Smart Home Automation System',
          customer: {
            firstName: 'John',
            lastName: 'Smith',
            email: 'john.smith@example.com'
          },
          prospectName: null,
          prospectEmail: null,
          isExistingCustomer: true
        };

        // Determine client name and email
        let clientName = '';
        let clientEmail = '';

        if (mockProposal.isExistingCustomer && mockProposal.customer) {
          clientName = `${mockProposal.customer.firstName} ${mockProposal.customer.lastName}`;
          clientEmail = mockProposal.customer.email;
        } else {
          clientName = mockProposal.prospectName || 'Valued Client';
          clientEmail = mockProposal.prospectEmail || '';
        }

        // Generate portal token
        const { customExpiry } = req.body;
        const portalData = generatePortalToken(
          mockProposal.id,
          mockProposal.name,
          clientName,
          clientEmail,
          customExpiry
        );

        res.status(200).json({
          portalUrl: portalData.url,
          token: portalData.token,
          expiresAt: portalData.expiresAt,
          proposal: {
            id: mockProposal.id,
            name: mockProposal.name,
            clientName,
            clientEmail
          },
          note: 'Using fallback data due to database connectivity issues'
        });
      }

    } catch (error) {
      console.error('💥 Error generating portal token:', error);
      res.status(500).json({ 
        error: 'Failed to generate portal token',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 