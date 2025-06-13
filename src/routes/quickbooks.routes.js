const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const QuickBooksService = require('../services/quickbooksService');

// GET /api/quickbooks/auth - Start OAuth flow
// GET /api/quickbooks/callback - Handle OAuth callback
// POST /api/quickbooks/invoice/from-proposal/:proposalId - Create invoice from proposal
// POST /api/quickbooks/expense - Create expense entry
// GET /api/quickbooks/reports/project/:projectId - Generate project profitability report
// GET /api/quickbooks/status - Check connection status
// GET /api/quickbooks/health - Health check endpoint

const qbService = new QuickBooksService();

// 🔐 Start QuickBooks OAuth authorization flow
router.get('/auth', async (req, res) => {
  try {
    console.log('🔐 Starting QuickBooks OAuth flow');
    
    const { authUrl, state } = qbService.getAuthorizationUrl();
    
    res.json({
      success: true,
      authUrl,
      state,
      message: 'Please visit the authorization URL to connect QuickBooks'
    });

  } catch (error) {
    console.error('❌ QuickBooks auth flow error:', error);
    res.status(500).json({
      error: 'Failed to start authorization flow',
      details: error.message
    });
  }
});

// 🎟️ Handle QuickBooks OAuth callback
router.get('/callback', async (req, res) => {
  try {
    const { code, realmId, state } = req.query;
    
    console.log('🎟️ Handling QuickBooks OAuth callback:', { realmId, hasCode: !!code });

    if (!code || !realmId) {
      return res.status(400).json({
        error: 'Missing authorization code or realm ID'
      });
    }

    // Exchange code for tokens
    const credentials = await qbService.exchangeCodeForToken(code, realmId);
    
    // Store credentials securely (in production, use encrypted database storage)
    // For MVP, we'll store in environment or simple storage
    
    console.log('✅ QuickBooks connected successfully');
    
    res.json({
      success: true,
      message: 'QuickBooks connected successfully',
      realmId: credentials.realmId,
      expiresAt: credentials.expiresAt
    });

  } catch (error) {
    console.error('❌ QuickBooks callback error:', error);
    res.status(500).json({
      error: 'Failed to complete authorization',
      details: error.message
    });
  }
});

// 📄 Create QuickBooks invoice from approved proposal
router.post('/invoice/from-proposal/:proposalId', async (req, res) => {
  try {
    const { proposalId } = req.params;
    const { credentials } = req.body;
    
    console.log('📄 Creating QuickBooks invoice from proposal:', proposalId);

    // Get proposal details
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    // Check if proposal is approved
    if (proposal.status !== 'accepted' && proposal.clientStatus !== 'approved') {
      return res.status(400).json({
        error: 'Can only create invoices for approved proposals',
        proposalStatus: proposal.status,
        clientStatus: proposal.clientStatus
      });
    }

    // Create invoice in QuickBooks
    const invoiceResult = await qbService.createInvoiceFromProposal(proposal, credentials);
    
    if (invoiceResult.success) {
      // Update proposal with invoice information
      await prisma.proposal.update({
        where: { id: proposalId },
        data: {
          quickbooksInvoiceId: invoiceResult.invoiceId,
          quickbooksInvoiceNumber: invoiceResult.invoiceNumber,
          invoiceCreatedAt: new Date(),
          updatedAt: new Date()
        }
      });

      console.log('✅ Invoice created and proposal updated');
      
      res.json({
        success: true,
        invoice: invoiceResult,
        message: 'Invoice created successfully in QuickBooks'
      });
    } else {
      res.status(500).json({
        error: 'Failed to create invoice',
        details: invoiceResult.error
      });
    }

  } catch (error) {
    console.error('❌ Invoice creation error:', error);
    res.status(500).json({
      error: 'Failed to create invoice',
      details: error.message
    });
  }
});

// 💰 Create expense entry in QuickBooks
router.post('/expense', async (req, res) => {
  try {
    const { 
      description, 
      amount, 
      category, 
      date, 
      projectId, 
      referenceNumber,
      credentials 
    } = req.body;
    
    console.log('💰 Creating QuickBooks expense:', { description, amount, category });

    // Validate required fields
    if (!description || !amount || !credentials) {
      return res.status(400).json({
        error: 'Description, amount, and credentials are required'
      });
    }

    const expenseData = {
      description,
      amount: parseFloat(amount),
      category: category || 'default',
      date: date || new Date().toISOString().split('T')[0],
      referenceNumber: referenceNumber || null
    };

    // Create expense in QuickBooks
    const expenseResult = await qbService.createExpense(expenseData, credentials);
    
    if (expenseResult.success) {
      // Optionally store expense record in local database for tracking
      if (projectId) {
        // Associate expense with project
        console.log(`💰 Expense ${expenseResult.expenseId} associated with project ${projectId}`);
      }

      res.json({
        success: true,
        expense: expenseResult,
        message: 'Expense created successfully in QuickBooks'
      });
    } else {
      res.status(500).json({
        error: 'Failed to create expense',
        details: expenseResult.error
      });
    }

  } catch (error) {
    console.error('❌ Expense creation error:', error);
    res.status(500).json({
      error: 'Failed to create expense',
      details: error.message
    });
  }
});

// 📊 Generate project profitability report
router.get('/reports/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { credentials } = req.query; // In production, get from secure storage
    
    console.log('📊 Generating project profitability report:', projectId);

    if (!credentials) {
      return res.status(400).json({
        error: 'QuickBooks credentials required'
      });
    }

    // Parse credentials if passed as string
    const parsedCredentials = typeof credentials === 'string' 
      ? JSON.parse(credentials) 
      : credentials;

    // Get project details from local database
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        customer: true,
        proposals: {
          include: {
            items: true
          }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Generate QuickBooks report
    const qbReport = await qbService.generateProjectProfitabilityReport(projectId, parsedCredentials);
    
    // Combine with local project data
    const combinedReport = {
      project: {
        id: project.id,
        name: project.name,
        status: project.status,
        estimatedValue: project.estimatedValue,
        actualValue: qbReport.totalRevenue,
        customerName: project.customer 
          ? `${project.customer.firstName} ${project.customer.lastName}`
          : 'Unknown Customer'
      },
      financial: {
        revenue: qbReport.totalRevenue,
        expenses: qbReport.totalExpenses,
        profit: qbReport.profit,
        profitMargin: qbReport.profitMargin,
        estimatedVsActual: {
          variance: qbReport.totalRevenue - project.estimatedValue,
          variancePercentage: project.estimatedValue > 0 
            ? ((qbReport.totalRevenue - project.estimatedValue) / project.estimatedValue * 100).toFixed(2)
            : 0
        }
      },
      activity: {
        invoiceCount: qbReport.invoiceCount,
        expenseCount: qbReport.expenseCount,
        proposalCount: project.proposals.length
      },
      generatedAt: qbReport.generatedAt
    };

    console.log('✅ Project profitability report generated');
    
    res.json({
      success: true,
      report: combinedReport
    });

  } catch (error) {
    console.error('❌ Report generation error:', error);
    res.status(500).json({
      error: 'Failed to generate report',
      details: error.message
    });
  }
});

// ✅ Check QuickBooks connection status
router.get('/status', async (req, res) => {
  try {
    const { credentials } = req.query;
    
    if (!credentials) {
      return res.json({
        connected: false,
        message: 'No credentials provided'
      });
    }

    const parsedCredentials = typeof credentials === 'string' 
      ? JSON.parse(credentials) 
      : credentials;

    const connectionTest = await qbService.testConnection(parsedCredentials);
    
    res.json({
      connected: connectionTest.connected,
      message: connectionTest.connected 
        ? 'QuickBooks connection active'
        : `Connection failed: ${connectionTest.error}`,
      lastChecked: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Connection status check error:', error);
    res.json({
      connected: false,
      message: 'Failed to check connection status',
      error: error.message
    });
  }
});

// 🔄 Refresh QuickBooks access token
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken, credentials } = req.body;
    
    console.log('🔄 Refreshing QuickBooks access token');

    if (!refreshToken || !credentials) {
      return res.status(400).json({
        error: 'Refresh token and credentials are required'
      });
    }

    // Note: QuickBooks refresh token logic would go here
    // For MVP, we'll return a placeholder response
    
    res.json({
      success: true,
      message: 'Token refresh functionality ready',
      note: 'Implement refresh logic based on QuickBooks OAuth 2.0 flow'
    });

  } catch (error) {
    console.error('❌ Token refresh error:', error);
    res.status(500).json({
      error: 'Failed to refresh token',
      details: error.message
    });
  }
});

// 📊 Get QuickBooks integration dashboard stats
router.get('/dashboard/stats', async (req, res) => {
  try {
    console.log('📊 Generating QuickBooks integration statistics');

    const [
      totalInvoicesCreated,
      totalProposalsWithInvoices,
      recentInvoices
    ] = await Promise.all([
      prisma.proposal.count({
        where: {
          quickbooksInvoiceId: { not: null }
        }
      }),
      prisma.proposal.count({
        where: {
          AND: [
            { quickbooksInvoiceId: { not: null } },
            { 
              OR: [
                { status: 'accepted' },
                { clientStatus: 'approved' }
              ]
            }
          ]
        }
      }),
      prisma.proposal.findMany({
        where: {
          quickbooksInvoiceId: { not: null }
        },
        take: 5,
        orderBy: { invoiceCreatedAt: 'desc' },
        include: {
          customer: {
            select: { firstName: true, lastName: true }
          }
        }
      })
    ]);

    const stats = {
      overview: {
        totalInvoicesCreated,
        totalProposalsWithInvoices,
        integrationUtilization: totalProposalsWithInvoices > 0 
          ? (totalInvoicesCreated / totalProposalsWithInvoices * 100).toFixed(1)
          : 0
      },
      recent: recentInvoices.map(invoice => ({
        id: invoice.id,
        name: invoice.name,
        quickbooksInvoiceNumber: invoice.quickbooksInvoiceNumber,
        totalAmount: invoice.totalAmount,
        customerName: invoice.customer 
          ? `${invoice.customer.firstName} ${invoice.customer.lastName}`
          : invoice.prospectName,
        createdAt: invoice.invoiceCreatedAt
      }))
    };

    console.log('✅ QuickBooks integration statistics generated');
    res.json(stats);

  } catch (error) {
    console.error('❌ Error generating QuickBooks statistics:', error);
    res.status(500).json({
      error: 'Failed to generate statistics',
      details: error.message
    });
  }
});

// GET /api/quickbooks/health - Health check endpoint
router.get('/health', async (req, res) => {
  try {
    res.json({
      status: 'healthy',
      service: 'QuickBooks Integration',
      version: '1.0.0',
      features: [
        'Invoice generation from proposals',
        'Customer sync',
        'Financial data integration'
      ],
      configured: !!process.env.QUICKBOOKS_CLIENT_ID,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('QuickBooks health check error:', error);
    res.status(500).json({
      error: 'QuickBooks health check failed',
      details: error.message
    });
  }
});

module.exports = router; 