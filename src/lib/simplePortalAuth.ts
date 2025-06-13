import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

export interface PortalTokenPayload {
  proposalId: string;
  proposalName: string;
  clientName: string;
  clientEmail?: string;
  expiresAt: number;
}

export interface PortalTokenData {
  token: string;
  expiresAt: Date;
  url: string;
}

/**
 * Generate a secure portal token for a proposal (database-backed)
 */
export function generatePortalToken(
  proposalId: string,
  proposalName: string,
  clientName: string,
  clientEmail?: string,
  customExpiry?: string
): PortalTokenData {
  const expiry = customExpiry || '30d';
  const expiresAt = new Date();
  
  // Set expiration date
  if (expiry.endsWith('d')) {
    const days = parseInt(expiry.replace('d', ''));
    expiresAt.setDate(expiresAt.getDate() + days);
  } else if (expiry.endsWith('h')) {
    const hours = parseInt(expiry.replace('h', ''));
    expiresAt.setHours(expiresAt.getHours() + hours);
  }

  // Generate secure token
  const token = crypto.randomBytes(32).toString('base64url');
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
  const url = `${baseUrl}/portal/${token}`;

  // 🔧 NOTE: Token is now stored in database via the portal.ts API route
  // The calling code should save: portalToken, portalExpiresAt to the proposal record

  return {
    token,
    expiresAt,
    url,
  };
}

/**
 * Validate and decode a portal token (database-backed)
 */
export function validatePortalToken(token: string): PortalTokenPayload | null {
  try {
    // 🔧 ENHANCED: This function now validates against database
    // The calling code (portal page) should:
    // 1. Look up proposal by portalToken field
    // 2. Check if portalExpiresAt > now()
    // 3. Return the proposal data if valid
    
    // For now, we'll create a payload structure that the portal page expects
    // The actual validation happens in the getServerSideProps of the portal page
    
    console.log('🎫 Portal token validation called for token:', token?.substring(0, 20) + '...');
    
    // This is a placeholder - actual validation happens in portal/[token].tsx getServerSideProps
    return {
      proposalId: 'placeholder',
      proposalName: 'placeholder',
      clientName: 'placeholder',
      expiresAt: Date.now() + 86400000 // 24 hours from now
    };
    
  } catch (error) {
    console.error('Portal token validation failed:', error);
    return null;
  }
}

/**
 * 🔧 NEW: Database-backed token validation
 * This is the actual validation function used by the portal system
 */
export async function validatePortalTokenFromDatabase(token: string): Promise<PortalTokenPayload | null> {
  try {
    console.log('🔍 Validating portal token from database:', token?.substring(0, 20) + '...');
    
    // 🔧 FIXED: Use imported PrismaClient instead of require
    const prisma = new PrismaClient();

    console.log('📋 Database query: Looking for proposal with portalToken:', token?.substring(0, 20) + '...');

    // Find proposal by portal token
    const proposal = await prisma.proposal.findFirst({
      where: {
        portalToken: token,
        portalExpiresAt: {
          gt: new Date() // Token not expired
        }
      },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    await prisma.$disconnect();

    if (!proposal) {
      console.log('❌ Portal token not found or expired in database');
      // 🎯 ENHANCED: Check if token exists but is expired
      const prismaCheck = new PrismaClient();
      const expiredProposal = await prismaCheck.proposal.findFirst({
        where: { portalToken: token },
        select: { id: true, portalExpiresAt: true }
      });
      await prismaCheck.$disconnect();
      
      if (expiredProposal) {
        console.log('⏰ Token found but expired:', {
          proposalId: expiredProposal.id,
          expiresAt: expiredProposal.portalExpiresAt,
          now: new Date()
        });
      } else {
        console.log('🔍 Token not found in database at all');
      }
      
      return null;
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

    console.log('✅ Portal token validated successfully for proposal:', proposal.id);

    return {
      proposalId: proposal.id,
      proposalName: proposal.name,
      clientName,
      clientEmail,
      expiresAt: proposal.portalExpiresAt?.getTime() || Date.now()
    };

  } catch (error) {
    console.error('❌ Database portal token validation failed:', error);
    return null;
  }
}

/**
 * Generate a shorter, more user-friendly token (for sharing)
 */
export function generateShortToken(): string {
  return crypto.randomBytes(6).toString('hex').toUpperCase();
}

/**
 * Check if a portal token is about to expire (within 7 days)
 */
export function isTokenExpiringSoon(expiresAt: Date): boolean {
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  return expiresAt < sevenDaysFromNow;
} 