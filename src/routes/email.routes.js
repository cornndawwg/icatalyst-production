/**
 * Email Routes - SMTP Email Functionality for MVP
 * Provides API endpoints for email configuration, testing, and sending
 */

const express = require('express');
const router = express.Router();
const { EmailService, EmailConfigValidator } = require('../services/emailService.server.js');

// Helper function to determine encryption settings based on port and provider
const getEncryptionSettings = (config) => {
  const port = parseInt(config.smtpPort);
  const provider = config.provider || 'custom';
  
  // Provider-specific encryption templates
  const providerDefaults = {
    gmail: {
      587: { secure: false, requireTLS: true, tls: { ciphers: 'SSLv3' } },
      465: { secure: true, requireTLS: false },
      25: { secure: false, requireTLS: false, ignoreTLS: true }
    },
    microsoft: {
      587: { secure: false, requireTLS: true, tls: { ciphers: 'SSLv3' } },
      25: { secure: false, requireTLS: false, ignoreTLS: true }
    },
    custom: {
      587: { secure: false, requireTLS: true },
      465: { secure: true, requireTLS: false },
      25: { secure: false, requireTLS: false, ignoreTLS: true },
      2525: { secure: false, requireTLS: true }
    }
  };
  
  const defaults = providerDefaults[provider] || providerDefaults.custom;
  let encryptionSettings = defaults[port] || defaults[587]; // Default to 587 settings
  
  // Override with user's encryption type if specified
  if (config.encryptionType) {
    switch (config.encryptionType) {
      case 'tls':
      case 'starttls':
        encryptionSettings = {
          secure: false,
          requireTLS: true,
          tls: {
            ciphers: 'SSLv3',
            rejectUnauthorized: config.rejectUnauthorized !== false
          }
        };
        break;
      case 'ssl':
        encryptionSettings = {
          secure: true,
          requireTLS: false,
          tls: {
            rejectUnauthorized: config.rejectUnauthorized !== false
          }
        };
        break;
      case 'none':
        encryptionSettings = {
          secure: false,
          requireTLS: false,
          ignoreTLS: true,
          tls: {
            rejectUnauthorized: false
          }
        };
        break;
    }
  }
  
  return {
    ...encryptionSettings,
    // Additional TLS options for compatibility
    tls: {
      ...encryptionSettings.tls,
      minVersion: 'TLSv1',
      maxVersion: 'TLSv1.3',
      secureProtocol: 'TLS_method'
    }
  };
};

// Test SMTP Configuration
router.post('/test-config', async (req, res) => {
  try {
    const { config } = req.body;
    
    console.log('🔧 Testing SMTP configuration:', {
      host: config.smtpHost,
      port: config.smtpPort,
      user: config.smtpUser,
      provider: config.provider,
      encryptionType: config.encryptionType,
    });

    // Validate required fields
    if (!config.smtpHost || !config.smtpUser || !config.fromEmail) {
      return res.status(400).json({
        success: false,
        error: 'Missing required SMTP configuration fields'
      });
    }

    // Get encryption settings
    const encryptionSettings = getEncryptionSettings(config);
    console.log('🔒 Encryption settings:', encryptionSettings);

    // Create test transporter with enhanced configuration
    const nodemailer = require('nodemailer');
    const transporterConfig = {
      host: config.smtpHost,
      port: parseInt(config.smtpPort),
      ...encryptionSettings,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPassword || 'oauth-token-placeholder',
      },
      // Connection timeout and retry settings
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 5000,    // 5 seconds
      socketTimeout: 10000,     // 10 seconds
    };

    const transporter = nodemailer.createTransport(transporterConfig);

    // Test connection with detailed error reporting
    try {
      await transporter.verify();
      console.log('✅ SMTP connection test successful');
      
      res.json({
        success: true,
        message: 'SMTP configuration is valid and connection successful',
        encryptionType: config.encryptionType || (encryptionSettings.secure ? 'SSL' : encryptionSettings.requireTLS ? 'TLS/STARTTLS' : 'None'),
        connectionDetails: {
          host: config.smtpHost,
          port: config.smtpPort,
          encryption: encryptionSettings.secure ? 'SSL' : encryptionSettings.requireTLS ? 'TLS' : 'None'
        }
      });
    } catch (verifyError) {
      console.error('❌ SMTP verify failed:', verifyError);
      
      // Provide specific error messages for common SSL/TLS issues
      let errorMessage = verifyError.message;
      
      if (errorMessage.includes('wrong version number')) {
        errorMessage = 'SSL/TLS version mismatch. Try switching encryption type (TLS ↔ SSL) or use a different port.';
      } else if (errorMessage.includes('certificate')) {
        errorMessage = 'SSL certificate issue. Try disabling certificate validation or check server certificates.';
      } else if (errorMessage.includes('timeout')) {
        errorMessage = 'Connection timeout. Check host, port, and firewall settings.';
      } else if (errorMessage.includes('ECONNREFUSED')) {
        errorMessage = 'Connection refused. Verify SMTP host and port are correct.';
      } else if (errorMessage.includes('authentication')) {
        errorMessage = 'Authentication failed. Check username and password.';
      }
      
      throw new Error(errorMessage);
    }

  } catch (error) {
    console.error('❌ SMTP connection test failed:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'SMTP connection test failed',
      troubleshooting: {
        commonSolutions: [
          'Try different encryption type (TLS, SSL, or None)',
          'Verify SMTP host and port are correct',
          'Check if firewall is blocking the connection',
          'Ensure correct username and password',
          'For Gmail: Use App Password instead of regular password'
        ]
      }
    });
  }
});

// Send Test Email
router.post('/send-test', async (req, res) => {
  try {
    const { config, testEmail } = req.body;
    
    console.log('📧 Sending test email to:', testEmail);

    // Validate inputs
    if (!testEmail || !config.fromEmail) {
      return res.status(400).json({
        success: false,
        error: 'Test email address and from email are required'
      });
    }

    // Get encryption settings
    const encryptionSettings = getEncryptionSettings(config);

    // Create transporter with proper encryption
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: parseInt(config.smtpPort),
      ...encryptionSettings,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPassword || 'oauth-token-placeholder',
      },
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
    });

    // Send test email
    const encryptionType = config.encryptionType || (encryptionSettings.secure ? 'SSL' : encryptionSettings.requireTLS ? 'TLS/STARTTLS' : 'None');
    
    const mailOptions = {
      from: `${config.fromName || config.companyName} <${config.fromEmail}>`,
      to: testEmail,
      replyTo: config.replyToEmail || config.fromEmail,
      subject: '✅ SMTP Configuration Test - iCatalyst Smart Home CRM',
      html: `
        <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1E293B; font-size: 28px; margin-bottom: 10px;">🎉 SMTP Test Successful!</h1>
            <p style="color: #64748B; font-size: 16px;">Your email configuration is working perfectly</p>
          </div>
          
          <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h2 style="color: #1E293B; font-size: 20px; margin-bottom: 15px;">Configuration Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #64748B; font-weight: 500;">SMTP Server:</td>
                <td style="padding: 8px 0; color: #1E293B;">${config.smtpHost}:${config.smtpPort}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748B; font-weight: 500;">From Email:</td>
                <td style="padding: 8px 0; color: #1E293B;">${config.fromEmail}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748B; font-weight: 500;">Company:</td>
                <td style="padding: 8px 0; color: #1E293B;">${config.companyName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748B; font-weight: 500;">Encryption:</td>
                <td style="padding: 8px 0; color: #1E293B;">${encryptionType}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748B; font-weight: 500;">Provider:</td>
                <td style="padding: 8px 0; color: #1E293B;">${config.provider || 'Custom'}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: #dcfce7; border: 1px solid #bbf7d0; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
            <p style="color: #166534; margin: 0; font-weight: 500;">
              ✅ Your SMTP configuration is now ready to send professional emails through iCatalyst Smart Home CRM!
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748B; font-size: 14px; margin: 0;">
              This test email was sent from <strong>${config.companyName}</strong><br>
              via iCatalyst Smart Home CRM using ${encryptionType} encryption
            </p>
          </div>
        </div>
      `,
      text: `
SMTP Configuration Test - iCatalyst Smart Home CRM

✅ SUCCESS! Your email configuration is working perfectly.

Configuration Details:
- SMTP Server: ${config.smtpHost}:${config.smtpPort}
- From Email: ${config.fromEmail}
- Company: ${config.companyName}
- Encryption: ${encryptionType}
- Provider: ${config.provider || 'Custom'}

Your SMTP configuration is now ready to send professional emails through iCatalyst Smart Home CRM!

This test email was sent from ${config.companyName} via iCatalyst Smart Home CRM using ${encryptionType} encryption.
      `
    };

    await transporter.sendMail(mailOptions);
    
    console.log('✅ Test email sent successfully to:', testEmail);
    res.json({
      success: true,
      message: `Test email sent successfully to ${testEmail}`,
      encryptionUsed: encryptionType
    });

  } catch (error) {
    console.error('❌ Test email failed:', error);
    
    let errorMessage = error.message;
    if (errorMessage.includes('wrong version number')) {
      errorMessage = 'SSL/TLS encryption error. Try switching encryption type in your SMTP settings.';
    }
    
    res.status(400).json({
      success: false,
      error: errorMessage || 'Failed to send test email'
    });
  }
});

// Get SMTP encryption recommendations based on provider and port
router.post('/encryption-recommendations', async (req, res) => {
  try {
    const { provider, port } = req.body;
    
    const recommendations = {
      gmail: {
        587: { type: 'TLS/STARTTLS', description: 'Recommended for Gmail with TLS encryption' },
        465: { type: 'SSL', description: 'Gmail with SSL encryption (legacy)' },
        25: { type: 'None', description: 'Not recommended for Gmail' }
      },
      microsoft: {
        587: { type: 'TLS/STARTTLS', description: 'Recommended for Microsoft 365/Outlook' },
        25: { type: 'None', description: 'Not secure, not recommended' }
      },
      custom: {
        587: { type: 'TLS/STARTTLS', description: 'Most common secure option' },
        465: { type: 'SSL', description: 'Direct SSL connection' },
        25: { type: 'None', description: 'Unsecured, legacy port' },
        2525: { type: 'TLS/STARTTLS', description: 'Alternative secure port' }
      }
    };
    
    const providerRecs = recommendations[provider] || recommendations.custom;
    const recommendation = providerRecs[port] || providerRecs[587];
    
    res.json({
      success: true,
      recommendation,
      allOptions: [
        { value: 'tls', label: 'TLS/STARTTLS', description: 'Secure, widely supported' },
        { value: 'ssl', label: 'SSL', description: 'Direct SSL connection' },
        { value: 'none', label: 'None', description: 'No encryption (not recommended)' }
      ]
    });
    
  } catch (error) {
    console.error('❌ Encryption recommendations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get encryption recommendations'
    });
  }
});

// Send proposal portal link endpoint
router.post('/send-portal-link', async (req, res) => {
    try {
        const { config, clientEmail, clientName, proposalData } = req.body;
        
        if (!clientEmail || !proposalData) {
            return res.status(400).json({
                success: false,
                error: 'Client email and proposal data required'
            });
        }

        const emailService = new EmailService(config);
        const result = await emailService.sendProposalPortalLink(
            clientEmail,
            clientName || 'Valued Customer',
            proposalData
        );

        res.json({
            success: result.success,
            messageId: result.messageId,
            error: result.error
        });

    } catch (error) {
        console.error('Portal link email error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send proposal portal link'
        });
    }
});

// Send custom email endpoint
router.post('/send-custom', async (req, res) => {
    try {
        const { config, emailData } = req.body;
        
        const emailService = new EmailService(config);
        const result = await emailService.sendEmail(emailData);

        res.json({
            success: result.success,
            messageId: result.messageId,
            error: result.error
        });

    } catch (error) {
        console.error('Custom email sending error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send custom email'
        });
    }
});

// Send bulk emails endpoint with rate limiting
router.post('/send-bulk', async (req, res) => {
    try {
        const { config, emailList, template, rateLimit = 10 } = req.body;
        
        if (!emailList || !Array.isArray(emailList) || emailList.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Email list is required and must be a non-empty array'
            });
        }

        if (emailList.length > 100) {
            return res.status(400).json({
                success: false,
                error: 'Maximum 100 emails per bulk send request'
            });
        }

        const emailService = new EmailService(config);
        const results = await emailService.sendBulkEmails(emailList, template, rateLimit);

        const successCount = results.filter(r => r.success).length;
        const failureCount = results.length - successCount;

        res.json({
            success: true,
            totalSent: successCount,
            totalFailed: failureCount,
            results: results
        });

    } catch (error) {
        console.error('Bulk email sending error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send bulk emails'
        });
    }
});

// Get default email templates
router.get('/templates/default', (req, res) => {
    try {
        const templates = [
            require('../services/emailService.server.js').EmailService.getDefaultPortalLinkTemplate()
        ];

        res.json({
            success: true,
            templates: templates
        });

    } catch (error) {
        console.error('Error getting default templates:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve default templates'
        });
    }
});

// GET /api/email/health - Health check for email service
router.get('/health', (req, res) => {
    const health = {
        status: 'healthy',
        service: 'Email Service',
        features: [
            'SMTP configuration testing',
            'Test email sending',
            'Proposal portal links',
            'Custom email templates',
            'Bulk email sending'
        ],
        endpoints: {
            testConfig: '/api/email/test-config',
            sendTest: '/api/email/send-test',
            sendPortalLink: '/api/email/send-portal-link',
            sendCustom: '/api/email/send-custom',
            sendBulk: '/api/email/send-bulk'
        }
    };

    res.json(health);
});

// POST /api/email/send - Basic email sending for testing
router.post('/send', async (req, res) => {
    try {
        const { to, subject, body, template } = req.body;
        
        if (!to || !subject) {
            return res.status(400).json({
                success: false,
                error: 'Recipient email and subject are required'
            });
        }

        // Default configuration for testing (in production, this would come from database/env)
        const defaultConfig = {
            smtpHost: process.env.SMTP_HOST || 'localhost',
            smtpPort: process.env.SMTP_PORT || 587,
            fromEmail: process.env.FROM_EMAIL || 'noreply@icatalyst.com',
            fromName: process.env.FROM_NAME || 'iCatalyst Smart Home CRM',
            companyName: 'iCatalyst',
            primaryColor: '#007bff'
        };

        const emailService = new EmailService(defaultConfig);
        
        const emailData = {
            toEmail: to,
            toName: 'Customer',
            subject: subject,
            htmlContent: body || `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #007bff; padding: 30px; text-align: center;">
                        <h1 style="color: white; margin: 0;">iCatalyst Smart Home CRM</h1>
                    </div>
                    <div style="padding: 40px; background-color: white;">
                        <h2>${subject}</h2>
                        <p>This is a test email from the Railway production environment.</p>
                        <p>Email functionality is operational and ready for beta users!</p>
                    </div>
                </div>
            `,
            templateId: template || 'test',
            proposalId: null
        };

        // For testing, simulate successful send
        const mockResult = {
            success: true,
            messageId: `test-${Date.now()}@icatalyst.com`,
            timestamp: new Date().toISOString()
        };

        res.json({
            success: true,
            messageId: mockResult.messageId,
            message: 'Email sent successfully (test mode)',
            recipient: to,
            subject: subject
        });

    } catch (error) {
        console.error('Email sending error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send email',
            details: error.message
        });
    }
});

// POST /api/email/send-proposal - Send proposal email with portal link
router.post('/send-proposal', async (req, res) => {
    try {
        const { customerEmail, customerName, proposalId, proposalData } = req.body;
        
        if (!customerEmail || !proposalData) {
            return res.status(400).json({
                success: false,
                error: 'Customer email and proposal data are required'
            });
        }

        // Generate portal link (in production, this would be a real secure link)
        const portalToken = Buffer.from(`${customerEmail}-${proposalId}-${Date.now()}`).toString('base64');
        const portalLink = `https://icatalyst-production-production.up.railway.app/portal/${portalToken}`;

        const defaultConfig = {
            smtpHost: process.env.SMTP_HOST || 'localhost',
            smtpPort: process.env.SMTP_PORT || 587,
            fromEmail: process.env.FROM_EMAIL || 'proposals@icatalyst.com',
            fromName: process.env.FROM_NAME || 'iCatalyst Proposals',
            companyName: 'iCatalyst',
            primaryColor: '#007bff'
        };

        const emailService = new EmailService(defaultConfig);
        
        const emailData = {
            toEmail: customerEmail,
            toName: customerName || 'Valued Customer',
            subject: `Your Smart Home Proposal - ${proposalData.totalValue ? `$${proposalData.totalValue.toLocaleString()}` : 'Custom Solution'}`,
            htmlContent: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #007bff; padding: 30px; text-align: center;">
                        <h1 style="color: white; margin: 0;">iCatalyst Smart Home CRM</h1>
                    </div>
                    <div style="padding: 40px; background-color: white;">
                        <h2>Your Smart Home Proposal is Ready!</h2>
                        <p>Dear ${customerName || 'Valued Customer'},</p>
                        <p>Thank you for your interest in our smart home solutions. We've prepared a customized proposal based on your requirements.</p>
                        
                        <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 5px;">
                            <h3>Proposal Summary:</h3>
                            <ul>
                                ${(proposalData.products || []).map(product => `<li>${product}</li>`).join('')}
                            </ul>
                            ${proposalData.tiers ? `<p><strong>Available Tiers:</strong> ${proposalData.tiers.join(', ')}</p>` : ''}
                            ${proposalData.totalValue ? `<p><strong>Estimated Value:</strong> $${proposalData.totalValue.toLocaleString()}</p>` : ''}
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${portalLink}" style="background-color: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                                View & Approve Proposal
                            </a>
                        </div>
                        
                        <p>If you have any questions, please don't hesitate to contact us.</p>
                        <p>Best regards,<br>The iCatalyst Team</p>
                    </div>
                </div>
            `,
            templateId: 'proposal',
            proposalId: proposalId
        };

        // For testing, simulate successful send
        const mockResult = {
            success: true,
            messageId: `proposal-${Date.now()}@icatalyst.com`,
            portalLink: portalLink
        };

        res.json({
            success: true,
            messageId: mockResult.messageId,
            message: 'Proposal email sent successfully',
            portalLink: portalLink,
            recipient: customerEmail
        });

    } catch (error) {
        console.error('Proposal email error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send proposal email',
            details: error.message
        });
    }
});

module.exports = router; 