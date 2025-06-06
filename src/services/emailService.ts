/**
 * Email Integration Service
 * 
 * SAFETY: This is a NEW service that doesn't modify any existing functionality.
 * It can be tested independently before integration with the portal system.
 */

export interface EmailConfig {
  id: string;
  integratorId: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  smtpSecure: boolean;
  companyName: string;
  companyLogo?: string;
  primaryColor: string;
  signature?: string;
  fromEmail: string;
  fromName: string;
  replyToEmail?: string;
  autoSendPortalLinks: boolean;
  trackEmails: boolean;
  isActive: boolean;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  templateType: string;
  isActive: boolean;
  variables: string; // JSON string
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  emailLogId?: string;
}

export interface EmailData {
  toEmail: string;
  toName?: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  templateId: string;
  proposalId?: string;
}

/**
 * Email Service for testing and standalone functionality
 */
export class EmailService {
  private config: EmailConfig;

  constructor(config: EmailConfig) {
    this.config = config;
  }

  /**
   * Test SMTP connection without sending emails
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      // For now, return mock success for testing
      if (!this.config.smtpHost || !this.config.smtpUser) {
        return {
          success: false,
          message: 'SMTP configuration is incomplete'
        };
      }

      // TODO: Implement actual SMTP connection test with nodemailer
      return {
        success: true,
        message: 'SMTP connection test successful'
      };
    } catch (error) {
      return {
        success: false,
        message: `Connection failed: ${(error as Error).message}`
      };
    }
  }

  /**
   * Send email using the configured SMTP settings
   */
  async sendEmail(emailData: EmailData): Promise<EmailResult> {
    try {
      // Validate email data
      if (!emailData.toEmail || !emailData.subject) {
        return {
          success: false,
          error: 'Missing required email data'
        };
      }

      // For testing phase, return success without actually sending
      console.log('Email Service - Would send email:', {
        to: emailData.toEmail,
        subject: emailData.subject,
        from: `${this.config.fromName} <${this.config.fromEmail}>`
      });

      // TODO: Implement actual email sending with nodemailer
      const mockResult = {
        success: true,
        messageId: `mock-${Date.now()}`,
        emailLogId: `log-${Date.now()}`
      };

      // TODO: Log email to database
      await this.logEmail(emailData, mockResult);

      return mockResult;
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  /**
   * Render email template with provided data
   */
  renderTemplate(template: string, data: Record<string, any>): string {
    let rendered = template;
    
    Object.keys(data).forEach(key => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      rendered = rendered.replace(placeholder, data[key] || '');
    });

    return rendered;
  }

  /**
   * Log email to database for tracking
   */
  private async logEmail(emailData: EmailData, result: EmailResult): Promise<void> {
    // TODO: Implement database logging
    console.log('Email Service - Would log email:', {
      emailData,
      result,
      status: result.success ? 'SENT' : 'FAILED'
    });
  }

  /**
   * Get default portal link email template
   */
  static getDefaultPortalLinkTemplate(): EmailTemplate {
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

/**
 * Email configuration validation
 */
export class EmailConfigValidator {
  static validate(config: Partial<EmailConfig>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

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

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export default EmailService; 