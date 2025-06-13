/**
 * OAuth Routes - Google and Microsoft OAuth Integration
 * Provides OAuth flows for Gmail and Microsoft 365 SMTP configuration
 */

const express = require('express');
const router = express.Router();
const { google } = require('googleapis');

// OAuth Configuration
const GOOGLE_OAUTH_CONFIG = {
  clientId: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
  redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/oauth/google/callback',
  scopes: [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ]
};

const MICROSOFT_OAUTH_CONFIG = {
  clientId: process.env.MICROSOFT_CLIENT_ID || 'your-microsoft-client-id',
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET || 'your-microsoft-client-secret',
  redirectUri: process.env.MICROSOFT_REDIRECT_URI || 'http://localhost:3000/api/oauth/microsoft/callback',
  scopes: [
    'https://graph.microsoft.com/Mail.Send',
    'https://graph.microsoft.com/User.Read'
  ]
};

// Google OAuth Routes
router.get('/google/auth', (req, res) => {
  try {
    console.log('🔐 Initiating Google OAuth flow...');
    
    const oauth2Client = new google.auth.OAuth2(
      GOOGLE_OAUTH_CONFIG.clientId,
      GOOGLE_OAUTH_CONFIG.clientSecret,
      GOOGLE_OAUTH_CONFIG.redirectUri
    );

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: GOOGLE_OAUTH_CONFIG.scopes,
      prompt: 'consent'
    });

    console.log('📍 Google OAuth URL generated:', authUrl);
    res.json({
      success: true,
      authUrl: authUrl,
      provider: 'google'
    });

  } catch (error) {
    console.error('❌ Google OAuth initiation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initiate Google OAuth'
    });
  }
});

router.get('/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Authorization code not provided'
      });
    }

    console.log('🔑 Processing Google OAuth callback...');

    const oauth2Client = new google.auth.OAuth2(
      GOOGLE_OAUTH_CONFIG.clientId,
      GOOGLE_OAUTH_CONFIG.clientSecret,
      GOOGLE_OAUTH_CONFIG.redirectUri
    );

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    const smtpConfig = {
      provider: 'gmail',
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpSecure: true,
      encryptionType: 'tls',
      smtpUser: userInfo.data.email,
      smtpPassword: tokens.access_token, // OAuth token
      fromEmail: userInfo.data.email,
      fromName: userInfo.data.name,
      replyToEmail: userInfo.data.email,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenExpiry: tokens.expiry_date
    };

    console.log('✅ Google OAuth successful for:', userInfo.data.email);

    // Return success page with config data
    res.send(`
      <html>
        <head>
          <title>Google OAuth Success</title>
          <style>
            body { font-family: Inter, Arial, sans-serif; text-align: center; padding: 50px; background: #f8fafc; }
            .success { background: white; border-radius: 8px; padding: 40px; max-width: 500px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .success h1 { color: #16a34a; margin-bottom: 20px; }
            .success p { color: #64748b; margin-bottom: 30px; }
            .button { background: #1976d2; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; text-decoration: none; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="success">
            <h1>✅ Google OAuth Successful!</h1>
            <p>Your Gmail account has been connected successfully.</p>
            <p><strong>Email:</strong> ${userInfo.data.email}</p>
            <p><strong>Name:</strong> ${userInfo.data.name}</p>
            <button class="button" onclick="window.close()">Close Window</button>
          </div>
          <script>
            // Send config back to parent window
            if (window.opener) {
              window.opener.postMessage({
                type: 'OAUTH_SUCCESS',
                provider: 'google',
                config: ${JSON.stringify(smtpConfig)}
              }, '*');
              setTimeout(() => window.close(), 2000);
            }
          </script>
        </body>
      </html>
    `);

  } catch (error) {
    console.error('❌ Google OAuth callback failed:', error);
    res.status(500).send(`
      <html>
        <head><title>OAuth Error</title></head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1 style="color: #dc2626;">❌ OAuth Failed</h1>
          <p>There was an error connecting your Google account.</p>
          <p style="color: #64748b;">${error.message}</p>
          <button onclick="window.close()">Close Window</button>
        </body>
      </html>
    `);
  }
});

// Microsoft OAuth Routes
router.get('/microsoft/auth', (req, res) => {
  try {
    console.log('🔐 Initiating Microsoft OAuth flow...');
    
    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
      `client_id=${MICROSOFT_OAUTH_CONFIG.clientId}&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(MICROSOFT_OAUTH_CONFIG.redirectUri)}&` +
      `scope=${encodeURIComponent(MICROSOFT_OAUTH_CONFIG.scopes.join(' '))}&` +
      `response_mode=query&` +
      `prompt=consent`;

    console.log('📍 Microsoft OAuth URL generated:', authUrl);
    res.json({
      success: true,
      authUrl: authUrl,
      provider: 'microsoft'
    });

  } catch (error) {
    console.error('❌ Microsoft OAuth initiation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initiate Microsoft OAuth'
    });
  }
});

router.get('/microsoft/callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Authorization code not provided'
      });
    }

    console.log('🔑 Processing Microsoft OAuth callback...');

    // Exchange code for tokens
    const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: MICROSOFT_OAUTH_CONFIG.clientId,
        client_secret: MICROSOFT_OAUTH_CONFIG.clientSecret,
        code: code,
        redirect_uri: MICROSOFT_OAUTH_CONFIG.redirectUri,
        grant_type: 'authorization_code',
        scope: MICROSOFT_OAUTH_CONFIG.scopes.join(' ')
      })
    });

    const tokens = await tokenResponse.json();

    if (!tokens.access_token) {
      throw new Error('Failed to obtain access token');
    }

    // Get user info from Microsoft Graph
    const userResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`
      }
    });

    const userInfo = await userResponse.json();

    const smtpConfig = {
      provider: 'microsoft',
      smtpHost: 'smtp-mail.outlook.com',
      smtpPort: 587,
      smtpSecure: true,
      encryptionType: 'tls',
      smtpUser: userInfo.mail || userInfo.userPrincipalName,
      smtpPassword: tokens.access_token, // OAuth token
      fromEmail: userInfo.mail || userInfo.userPrincipalName,
      fromName: userInfo.displayName,
      replyToEmail: userInfo.mail || userInfo.userPrincipalName,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenExpiry: Date.now() + (tokens.expires_in * 1000)
    };

    console.log('✅ Microsoft OAuth successful for:', userInfo.mail || userInfo.userPrincipalName);

    // Return success page with config data
    res.send(`
      <html>
        <head>
          <title>Microsoft OAuth Success</title>
          <style>
            body { font-family: Inter, Arial, sans-serif; text-align: center; padding: 50px; background: #f8fafc; }
            .success { background: white; border-radius: 8px; padding: 40px; max-width: 500px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .success h1 { color: #16a34a; margin-bottom: 20px; }
            .success p { color: #64748b; margin-bottom: 30px; }
            .button { background: #0078d4; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; text-decoration: none; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="success">
            <h1>✅ Microsoft OAuth Successful!</h1>
            <p>Your Microsoft 365 account has been connected successfully.</p>
            <p><strong>Email:</strong> ${userInfo.mail || userInfo.userPrincipalName}</p>
            <p><strong>Name:</strong> ${userInfo.displayName}</p>
            <button class="button" onclick="window.close()">Close Window</button>
          </div>
          <script>
            // Send config back to parent window
            if (window.opener) {
              window.opener.postMessage({
                type: 'OAUTH_SUCCESS',
                provider: 'microsoft',
                config: ${JSON.stringify(smtpConfig)}
              }, '*');
              setTimeout(() => window.close(), 2000);
            }
          </script>
        </body>
      </html>
    `);

  } catch (error) {
    console.error('❌ Microsoft OAuth callback failed:', error);
    res.status(500).send(`
      <html>
        <head><title>OAuth Error</title></head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1 style="color: #dc2626;">❌ OAuth Failed</h1>
          <p>There was an error connecting your Microsoft account.</p>
          <p style="color: #64748b;">${error.message}</p>
          <button onclick="window.close()">Close Window</button>
        </body>
      </html>
    `);
  }
});

module.exports = router; 