const nodemailer = require('nodemailer');
const { logger } = require('./logger');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

exports.sendWelcomeEmail = async (email, name) => {
  try {
    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: email,
      subject: 'Welcome to Smart Home CRM',
      html: `
        <h1>Welcome to Smart Home CRM</h1>
        <p>Dear ${name},</p>
        <p>Welcome to Smart Home CRM! Your account has been successfully created.</p>
        <p>You can now log in to access your account and start using our system.</p>
        <p>If you have any questions, please don't hesitate to contact our support team.</p>
        <br>
        <p>Best regards,</p>
        <p>The Smart Home CRM Team</p>
      `
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Welcome email sent to ${email}`);
  } catch (error) {
    logger.error('Error sending welcome email:', error);
    throw error;
  }
}; 