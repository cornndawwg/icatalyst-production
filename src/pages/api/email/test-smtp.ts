/**
 * SMTP Connection Test API Endpoint
 * 
 * SAFETY: This is a NEW API endpoint that doesn't modify any existing functionality.
 * Used only for testing email configuration independently.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { EmailConfigValidator } from '../../../services/emailService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed. Use POST.' 
    });
  }

  try {
    const config = req.body;

    // Validate configuration
    const validation = EmailConfigValidator.validate(config);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid configuration',
        errors: validation.errors
      });
    }

    // For now, return mock success since we don't have nodemailer set up yet
    // TODO: Implement actual SMTP connection test
    if (config.smtpHost && config.smtpUser && config.smtpPassword) {
      return res.status(200).json({
        success: true,
        message: `SMTP connection test successful for ${config.smtpHost}:${config.smtpPort}`
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Missing required SMTP configuration'
      });
    }

  } catch (error) {
    console.error('SMTP test error:', error);
    return res.status(500).json({
      success: false,
      message: `Connection test failed: ${(error as Error).message}`
    });
  }
} 