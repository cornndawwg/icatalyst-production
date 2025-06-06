import * as jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
const PORTAL_TOKEN_EXPIRY = '30d'; // 30 days

// Ensure JWT_SECRET is always a string
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

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
 * Generate a secure portal token for a proposal
 */
export function generatePortalToken(
  proposalId: string,
  proposalName: string,
  clientName: string,
  clientEmail?: string,
  customExpiry?: string
): PortalTokenData {
  const expiry = customExpiry || PORTAL_TOKEN_EXPIRY;
  const expiresAt = new Date();
  
  // Set expiration date
  if (expiry.endsWith('d')) {
    const days = parseInt(expiry.replace('d', ''));
    expiresAt.setDate(expiresAt.getDate() + days);
  } else if (expiry.endsWith('h')) {
    const hours = parseInt(expiry.replace('h', ''));
    expiresAt.setHours(expiresAt.getHours() + hours);
  }

  const payload: PortalTokenPayload = {
    proposalId,
    proposalName,
    clientName,
    clientEmail,
    expiresAt: expiresAt.getTime(),
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: expiry } as jwt.SignOptions);
  
  // Generate clean URL-safe token
  const urlSafeToken = Buffer.from(token).toString('base64url');
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
  const url = `${baseUrl}/portal/${urlSafeToken}`;

  return {
    token: urlSafeToken,
    expiresAt,
    url,
  };
}

/**
 * Validate and decode a portal token
 */
export function validatePortalToken(token: string): PortalTokenPayload | null {
  try {
    // Decode from URL-safe base64
    const jwtToken = Buffer.from(token, 'base64url').toString();
    
    const decoded = jwt.verify(jwtToken, JWT_SECRET) as PortalTokenPayload;
    
    // Check if token has expired
    if (decoded.expiresAt < Date.now()) {
      return null;
    }
    
    return decoded;
  } catch (error) {
    console.error('Portal token validation failed:', error);
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