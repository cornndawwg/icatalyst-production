/**
 * Email Integration Service - CommonJS for Node.js Backend
 * 
 * COMPLETE SMTP IMPLEMENTATION with nodemailer for immediate MVP readiness
 */

const nodemailer = require('nodemailer');

/**
 * Complete Email Service with SMTP functionality for MVP readiness
 */
class EmailService {
  constructor(config) {
    this.config = config;
    this.transporter = null;
    this.initializeTransporter();
  }

  /**
   * Get enhanced encryption settings based on configuration
   */
  getEncryptionSettings() {
    const port = parseInt(this.config.smtpPort);
    const encryptionType = this.config.encryptionType || 'tls';
    
    // Default settings based on encryption type
    let settings = {};
    
    switch (encryptionType) {
      case 'ssl':
        settings = {
          secure: true,
          requireTLS: false,
          tls: {
            rejectUnauthorized: false,
            minVersion: 'TLSv1',
            maxVersion: 'TLSv1.3'
          }
        };
        break;
      case 'tls':
      case 'starttls':
        settings = {
          secure: false,
          requireTLS: true,
          tls: {
            ciphers: 'SSLv3',
            rejectUnauthorized: false,
            minVersion: 'TLSv1',
            maxVersion: 'TLSv1.3',
            secureProtocol: 'TLS_method'
          }
        };
        break;
      case 'none':
        settings = {
          secure: false,
          requireTLS: false,
          ignoreTLS: true,
          tls: {
            rejectUnauthorized: false
          }
        };
        break;
      default:
        // Auto-detect based on port if no encryption type specified
        if (port === 465) {
          settings = {
            secure: true,
            requireTLS: false,
            tls: { rejectUnauthorized: false }
          };
        } else if (port === 587 || port === 2525) {
          settings = {
            secure: false,
            requireTLS: true,
            tls: { 
              ciphers: 'SSLv3',
              rejectUnauthorized: false 
            }
          };
        } else {
          settings = {
            secure: false,
            requireTLS: false,
            ignoreTLS: true,
            tls: { rejectUnauthorized: false }
          };
        }
    }

    return settings;
  }

  /**
   * Initialize SMTP transporter with enhanced encryption configuration
   */
  initializeTransporter() {
    try {
      const encryptionSettings = this.getEncryptionSettings();
      
      const transporterConfig = {
        host: this.config.smtpHost,
        port: parseInt(this.config.smtpPort),
        ...encryptionSettings,
        auth: {
          user: this.config.smtpUser,
          pass: this.config.smtpPassword,
        },
        // Enhanced connection settings
        connectionTimeout: 10000, // 10 seconds
        greetingTimeout: 5000,    // 5 seconds
        socketTimeout: 10000,     // 10 seconds
      };

      this.transporter = nodemailer.createTransport(transporterConfig);

      console.log(`✅ Email transporter initialized for ${this.config.fromEmail} with ${this.config.encryptionType || 'auto'} encryption`);
    } catch (error) {
      console.error('❌ Failed to initialize email transporter:', error);
      this.transporter = null;
    }
  }

  /**
   * Test SMTP connection with actual connection attempt
   */
  async testConnection() {
    try {
      if (!this.transporter) {
        return {
          success: false,
          message: 'Email transporter not initialized'
        };
      }

      if (!this.config.smtpHost || !this.config.smtpUser) {
        return {
          success: false,
          message: 'SMTP configuration is incomplete'
        };
      }

      // Test actual SMTP connection
      await this.transporter.verify();
      
      return {
        success: true,
        message: 'SMTP connection verified successfully',
        encryptionType: this.config.encryptionType || 'auto-detected'
      };
    } catch (error) {
      let errorMessage = error.message;
      
      // Provide specific error messages for SSL/TLS issues
      if (errorMessage.includes('wrong version number')) {
        errorMessage = 'SSL/TLS version mismatch. Try switching encryption type (TLS ↔ SSL).';
      } else if (errorMessage.includes('certificate')) {
        errorMessage = 'SSL certificate issue. Certificate validation failed.';
      } else if (errorMessage.includes('timeout')) {
        errorMessage = 'Connection timeout. Check host, port, and firewall settings.';
      } else if (errorMessage.includes('ECONNREFUSED')) {
        errorMessage = 'Connection refused. Verify SMTP host and port are correct.';
      }
      
      return {
        success: false,
        message: `SMTP connection failed: ${errorMessage}`,
        troubleshooting: [
          'Try different encryption type (TLS, SSL, or None)',
          'Verify SMTP host and port are correct',
          'Check firewall and network connectivity',
          'Ensure username and password are correct'
        ]
      };
    }
  }

  /**
   * Send email using configured SMTP settings with full implementation
   */
  async sendEmail(emailData) {
    try {
      // Validate email data
      if (!emailData.toEmail || !emailData.subject) {
        return {
          success: false,
          error: 'Missing required email data (toEmail or subject)'
        };
      }

      if (!this.transporter) {
        return {
          success: false,
          error: 'Email transporter not available'
        };
      }

      // Prepare email options
      const mailOptions = {
        from: `${this.config.fromName} <${this.config.fromEmail}>`,
        to: emailData.toName ? `${emailData.toName} <${emailData.toEmail}>` : emailData.toEmail,
        replyTo: this.config.replyToEmail || this.config.fromEmail,
        subject: emailData.subject,
        html: emailData.htmlContent,
        text: emailData.textContent || this.htmlToText(emailData.htmlContent)
      };

      console.log(`📧 Sending email to ${emailData.toEmail}: "${emailData.subject}"`);

      // Send email
      const info = await this.transporter.sendMail(mailOptions);

      const result = {
        success: true,
        messageId: info.messageId,
        emailLogId: `log-${Date.now()}`
      };

      // Log email to database
      await this.logEmail(emailData, result);

      console.log(`✅ Email sent successfully: ${info.messageId}`);
      return result;

    } catch (error) {
      const errorMessage = error.message;
      console.error('❌ Email sending failed:', errorMessage);
      
      const result = {
        success: false,
        error: errorMessage
      };

      // Log failed email attempt
      await this.logEmail(emailData, result);
      
      return result;
    }
  }

  /**
   * Send proposal portal link email with branded template
   */
  async sendProposalPortalLink(clientEmail, clientName, proposalData) {
    const template = EmailService.getDefaultPortalLinkTemplate();
    
    const templateData = {
      clientName,
      proposalName: proposalData.name,
      portalUrl: proposalData.portalUrl,
      expirationDate: proposalData.expirationDate,
      companyName: this.config.companyName,
      contactEmail: this.config.fromEmail,
      primaryColor: this.config.primaryColor
    };

    const htmlContent = this.renderTemplate(template.htmlContent, templateData);
    const textContent = this.renderTemplate(template.textContent || '', templateData);
    const subject = this.renderTemplate(template.subject, templateData);

    return this.sendEmail({
      toEmail: clientEmail,
      toName: clientName,
      subject,
      htmlContent,
      textContent,
      templateId: template.id,
      proposalId: proposalData.id
    });
  }

  /**
   * Send bulk emails with rate limiting for client communication campaigns
   */
  async sendBulkEmails(emailList, template, rateLimit = 10) {
    const results = [];
    const delay = (60 / rateLimit) * 1000; // ms between emails

    console.log(`📨 Sending bulk emails to ${emailList.length} recipients (rate: ${rateLimit}/min)`);

    for (const recipient of emailList) {
      try {
        const htmlContent = this.renderTemplate(template.htmlContent, recipient.templateData);
        const textContent = this.renderTemplate(template.textContent || '', recipient.templateData);
        const subject = this.renderTemplate(template.subject, recipient.templateData);

        const result = await this.sendEmail({
          toEmail: recipient.email,
          toName: recipient.name,
          subject,
          htmlContent,
          textContent,
          templateId: template.id
        });

        results.push({ ...result, email: recipient.email });

        // Rate limiting delay
        if (delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }

      } catch (error) {
        results.push({
          success: false,
          error: error.message,
          email: recipient.email
        });
      }
    }

    console.log(`✅ Bulk email campaign completed: ${results.filter(r => r.success).length}/${results.length} sent`);
    return results;
  }

  /**
   * Render email template with provided data
   */
  renderTemplate(template, data) {
    let rendered = template;
    
    Object.keys(data).forEach(key => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      rendered = rendered.replace(placeholder, data[key] || '');
    });

    return rendered;
  }

  /**
   * Convert HTML content to plain text for email clients that don't support HTML
   */
  htmlToText(html) {
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace HTML entities
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Log email to database for tracking and analytics
   */
  async logEmail(emailData, result) {
    try {
      // TODO: Implement database logging with Prisma
      const logData = {
        toEmail: emailData.toEmail,
        subject: emailData.subject,
        templateId: emailData.templateId,
        proposalId: emailData.proposalId,
        status: result.success ? 'SENT' : 'FAILED',
        messageId: result.messageId,
        error: result.error,
        sentAt: new Date(),
        integratorId: this.config.integratorId
      };

      console.log('📊 Email log entry:', logData);
      
      // When database schema is ready, implement:
      // await prisma.emailLog.create({ data: logData });
      
    } catch (error) {
      console.error('⚠️ Failed to log email:', error);
    }
  }

  /**
   * Get default portal link email template
   */
  static getDefaultPortalLinkTemplate() {
    return {
      id: 'default-portal-link',
      name: 'Default Portal Link',
      subject: 'Your Smart Home Proposal - {{proposalName}}',
      templateType: 'portal_link',
      isActive: true,
      variables: JSON.stringify([
        'clientName',
        'proposalName', 
        'portalUrl',
        'expirationDate',
        'companyName',
        'contactEmail',
        'primaryColor'
      ]),
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: {{primaryColor}}; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">{{companyName}}</h1>
          </div>
          <div style="padding: 40px; background-color: white;">
            <h2>Your Smart Home Proposal is Ready</h2>
            <p>Hello {{clientName}},</p>
            <p>We're excited to share your personalized smart home proposal: <strong>{{proposalName}}</strong></p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{portalUrl}}" style="background-color: {{primaryColor}}; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                View Your Proposal
              </a>
            </div>
            <p><small>This secure link expires on {{expirationDate}}.</small></p>
            <p>Questions? Contact us at {{contactEmail}}</p>
          </div>
        </div>
      `,
      textContent: `
Hello {{clientName}},

Your smart home proposal "{{proposalName}}" is ready for review.

View your proposal: {{portalUrl}}

This secure link expires on {{expirationDate}}.

Questions? Contact us at {{contactEmail}}

Best regards,
{{companyName}}
      `
    };
  }
}

class EmailConfigValidator {
  static validate(config) {
    const errors = [];

    if (!config.smtpHost) errors.push('SMTP Host is required');
    if (!config.smtpPort || config.smtpPort < 1 || config.smtpPort > 65535) {
      errors.push('Valid SMTP Port is required (1-65535)');
    }
    if (!config.smtpUser) errors.push('SMTP Username is required');
    if (!config.smtpPassword) errors.push('SMTP Password is required');
    if (!config.fromEmail || !this.isValidEmail(config.fromEmail)) {
      errors.push('Valid From Email is required');
    }
    if (!config.fromName) errors.push('From Name is required');
    if (!config.companyName) errors.push('Company Name is required');

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
}

module.exports = {
  EmailService,
  EmailConfigValidator
}; 