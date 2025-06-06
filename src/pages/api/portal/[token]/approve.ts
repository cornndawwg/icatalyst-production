import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '../../../../../generated/prisma';
import { validatePortalTokenFromDatabase } from '../../../../lib/simplePortalAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { token } = req.query;

  if (req.method === 'POST') {
    try {
      if (typeof token !== 'string') {
        return res.status(400).json({ error: 'Token must be a string' });
      }

      console.log('🤝 Portal approval request received for token:', token?.substring(0, 20) + '...');

      // 🔧 ENHANCED: Use database-backed token validation
      const tokenData = await validatePortalTokenFromDatabase(token);
      if (!tokenData) {
        console.log('❌ Invalid or expired portal token');
        return res.status(401).json({ error: 'Invalid or expired token' });
      }

      console.log('✅ Portal token validated for approval process');
      console.log('📋 Token data:', {
        proposalId: tokenData.proposalId,
        clientName: tokenData.clientName,
        expires: tokenData.expiresAt
      });

      const { decision, comment, clientName, timestamp } = req.body;

      // Validate decision
      if (!['approved', 'changes-requested', 'rejected'].includes(decision)) {
        return res.status(400).json({ error: 'Invalid decision' });
      }

      console.log('📋 Portal approval received:', {
        proposalId: tokenData.proposalId,
        decision,
        comment: comment || 'No comment provided',
        clientName: clientName || tokenData.clientName,
        timestamp: timestamp || new Date().toISOString()
      });

      // 🔧 FIXED: Use correct Prisma import and initialization
      const prisma = new PrismaClient();
      
      try {
        console.log('🔌 Prisma client initialized successfully');

        // First verify the proposal exists
        console.log('🔍 Verifying proposal exists before update...');
        const existingProposal = await prisma.proposal.findUnique({
          where: { id: tokenData.proposalId },
          select: {
            id: true,
            name: true,
            status: true,
            clientStatus: true,
            updatedAt: true
          }
        });

        if (!existingProposal) {
          console.log('❌ CRITICAL: Proposal not found in database!');
          console.log('💔 Proposal ID:', tokenData.proposalId);
          await prisma.$disconnect();
          return res.status(404).json({ 
            error: 'Proposal not found',
            proposalId: tokenData.proposalId
          });
        }

        console.log('✅ Proposal found:', existingProposal);

        console.log('💾 Starting database update process...');
        const updateData = {
          clientStatus: decision,
          clientFeedback: comment || null,
          approvedAt: decision === 'approved' ? new Date() : null,
          approvedBy: decision === 'approved' ? (clientName || tokenData.clientName) : null,
          updatedAt: new Date()
        };
        
        console.log('📋 Update data:', updateData);

        console.log('🔧 Executing Prisma update query...');
        const updatedProposal = await prisma.proposal.update({
          where: { id: tokenData.proposalId },
          data: updateData
        });

        console.log('✅ Prisma update query completed successfully!');
        console.log('📊 Updated proposal data:', {
          proposalId: updatedProposal.id,
          name: updatedProposal.name,
          clientStatus: updatedProposal.clientStatus,
          clientFeedback: updatedProposal.clientFeedback,
          approvedAt: updatedProposal.approvedAt,
          approvedBy: updatedProposal.approvedBy,
          updatedAt: updatedProposal.updatedAt
        });

        // 🎯 ENHANCED: Immediate verification with separate connection
        console.log('🔍 Performing immediate verification...');
        await prisma.$disconnect();
        
        const verificationPrisma = new PrismaClient();
        const verifiedProposal = await verificationPrisma.proposal.findUnique({
          where: { id: tokenData.proposalId },
          select: {
            id: true,
            name: true,
            clientStatus: true,
            clientFeedback: true,
            approvedAt: true,
            approvedBy: true,
            updatedAt: true
          }
        });
        await verificationPrisma.$disconnect();

        if (!verifiedProposal) {
          console.log('❌ VERIFICATION FAILED: Proposal not found during verification!');
          return res.status(500).json({ 
            error: 'Database verification failed - proposal not found',
            proposalId: tokenData.proposalId
          });
        }

        if (verifiedProposal.clientStatus !== decision) {
          console.log('❌ VERIFICATION FAILED: clientStatus mismatch!');
          console.log('💔 Expected clientStatus:', decision);
          console.log('💔 Actual clientStatus:', verifiedProposal.clientStatus);
          console.log('💔 Full verified data:', verifiedProposal);
          
          return res.status(500).json({ 
            error: 'Database update verification failed',
            expected: decision,
            actual: verifiedProposal.clientStatus,
            proposalId: tokenData.proposalId
          });
        }

        console.log('✅ Database update verification SUCCESSFUL');
        console.log('📋 Verified data:', verifiedProposal);

        // 🎯 ENHANCED: Return detailed success response
        let responseMessage = '';
        let nextSteps = '';

        switch (decision) {
          case 'approved':
            responseMessage = 'Proposal approved successfully! Thank you for choosing us.';
            nextSteps = 'Our project manager will contact you within 24 hours to schedule your consultation.';
            break;
          case 'changes-requested':
            responseMessage = 'Change request submitted successfully.';
            nextSteps = 'We\'ll review your feedback and provide an updated proposal within 2-3 business days.';
            break;
          case 'rejected':
            responseMessage = 'Proposal declined. Thank you for your time.';
            nextSteps = 'Feel free to contact us if you have any questions or if your needs change in the future.';
            break;
        }

        return res.status(200).json({
          success: true,
          message: responseMessage,
          nextSteps,
          proposalId: tokenData.proposalId,
          decision,
          timestamp: new Date().toISOString(),
          clientFeedback: comment || null,
          verified: true,
          verificationData: verifiedProposal
        });

      } catch (dbError: any) {
        console.error('❌ CRITICAL DATABASE ERROR:', dbError);
        console.error('💔 Error type:', dbError?.constructor?.name);
        console.error('💔 Error message:', dbError?.message);
        console.error('💔 Error code:', dbError?.code);
        console.error('💔 Error stack:', dbError?.stack);
        
        // Detailed Prisma error analysis
        if (dbError?.code) {
          console.error('📊 Prisma error code:', dbError.code);
        }
        if (dbError?.meta) {
          console.error('📊 Prisma error meta:', dbError.meta);
        }
        
        // Ensure Prisma connection is closed
        try {
          await prisma.$disconnect();
          console.log('🔌 Prisma connection closed after error');
        } catch (disconnectError) {
          console.error('❌ Error disconnecting Prisma:', disconnectError);
        }
        
        // DO NOT return success for database errors - return proper error
        return res.status(500).json({
          error: 'Database update failed',
          message: dbError?.message || 'Unknown database error',
          code: dbError?.code || 'UNKNOWN',
          proposalId: tokenData.proposalId,
          decision,
          success: false
        });
      }

    } catch (error: any) {
      console.error('💥 Error processing approval:', error);
      console.error('💔 Error stack:', error?.stack);
      
      return res.status(500).json({ 
        error: 'Failed to process approval',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 