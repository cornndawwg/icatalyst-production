const express = require('express');

/**
 * 🚀 QuickBooks Integration Service for iCatalyst Smart Home CRM
 * 
 * Features:
 * - Invoice generation from approved proposals
 * - Expense tracking and categorization
 * - Financial reporting integration
 * - Project cost tracking
 * - Automated accounting workflows
 */

class QuickBooksService {
  constructor() {
    this.isConfigured = false;
    this.sandbox = process.env.NODE_ENV !== 'production';
    this.clientId = process.env.QUICKBOOKS_CLIENT_ID;
    this.clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET;
    this.redirectUri = process.env.QUICKBOOKS_REDIRECT_URI;
    this.scope = 'com.intuit.quickbooks.accounting';
    
    // OAuth 2.0 Discovery Document
    this.discoveryDocument = {
      issuer: this.sandbox 
        ? 'https://oauth.platform.intuit.com/op/v1'
        : 'https://oauth.platform.intuit.com/op/v1',
      base_url: this.sandbox 
        ? 'https://sandbox-quickbooks.api.intuit.com'
        : 'https://quickbooks.api.intuit.com'
    };

    console.log('🔧 QuickBooks Service initialized:', {
      sandbox: this.sandbox,
      configured: !!this.clientId && !!this.clientSecret
    });
  }

  /**
   * 🔐 Generate OAuth authorization URL
   */
  getAuthorizationUrl(state = null) {
    if (!this.clientId) {
      throw new Error('QuickBooks Client ID not configured');
    }

    const params = new URLSearchParams({
      client_id: this.clientId,
      scope: this.scope,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      access_type: 'offline',
      state: state || 'state' + Math.random().toString(36).substring(2)
    });

    const authUrl = `${this.discoveryDocument.issuer}/oauth_authorize?${params.toString()}`;
    
    console.log('🔗 Generated QuickBooks authorization URL');
    return {
      authUrl,
      state: params.get('state')
    };
  }

  /**
   * 🎟️ Exchange authorization code for access token
   */
  async exchangeCodeForToken(code, realmId) {
    try {
      console.log('🔄 Exchanging code for QuickBooks access token');

      const response = await fetch(`${this.discoveryDocument.issuer}/oauth_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: this.redirectUri,
          client_id: this.clientId,
          client_secret: this.clientSecret
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Token exchange failed: ${error}`);
      }

      const tokenData = await response.json();
      
      // Store token securely (in production, use encrypted storage)
      const credentials = {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        realmId: realmId,
        expiresAt: new Date(Date.now() + (tokenData.expires_in * 1000)),
        refreshExpiresAt: new Date(Date.now() + (tokenData.x_refresh_token_expires_in * 1000))
      };

      console.log('✅ QuickBooks token exchange successful');
      return credentials;

    } catch (error) {
      console.error('❌ QuickBooks token exchange failed:', error);
      throw error;
    }
  }

  /**
   * 📄 Create invoice from approved proposal
   */
  async createInvoiceFromProposal(proposalData, credentials) {
    try {
      console.log('📄 Creating QuickBooks invoice from proposal:', proposalData.id);

      if (!credentials.accessToken) {
        throw new Error('QuickBooks not authenticated');
      }

      // Prepare customer data
      const customerRef = await this.getOrCreateCustomer(
        proposalData.customer || {
          name: proposalData.prospectName,
          email: proposalData.prospectEmail,
          company: proposalData.prospectCompany
        },
        credentials
      );

      // Prepare invoice line items
      const lineItems = proposalData.items.map((item, index) => ({
        Id: (index + 1).toString(),
        LineNum: index + 1,
        Amount: item.totalPrice,
        DetailType: 'SalesItemLineDetail',
        SalesItemLineDetail: {
          ItemRef: {
            value: item.productId || '1', // Default service item
            name: item.name
          },
          Qty: item.quantity,
          UnitPrice: item.unitPrice,
          TaxCodeRef: {
            value: 'NON' // Non-taxable by default
          }
        }
      }));

      // Create invoice object
      const invoice = {
        Line: lineItems,
        CustomerRef: {
          value: customerRef.Id
        },
        TotalAmt: proposalData.totalAmount,
        Balance: proposalData.totalAmount,
        DueDate: this.calculateDueDate(30), // 30 days payment terms
        TxnDate: new Date().toISOString().split('T')[0],
        DocNumber: `INV-${proposalData.id.substring(0, 8).toUpperCase()}`,
        PrivateNote: `Generated from proposal: ${proposalData.name}`,
        CustomerMemo: {
          value: `Invoice for ${proposalData.name}`
        }
      };

      // Send to QuickBooks
      const response = await fetch(
        `${this.discoveryDocument.base_url}/v3/company/${credentials.realmId}/invoice`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${credentials.accessToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(invoice)
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Invoice creation failed: ${error}`);
      }

      const result = await response.json();
      
      console.log('✅ QuickBooks invoice created successfully:', result.QueryResponse?.Invoice?.[0]?.Id);
      
      return {
        success: true,
        invoiceId: result.QueryResponse?.Invoice?.[0]?.Id,
        invoiceNumber: result.QueryResponse?.Invoice?.[0]?.DocNumber,
        totalAmount: result.QueryResponse?.Invoice?.[0]?.TotalAmt,
        dueDate: result.QueryResponse?.Invoice?.[0]?.DueDate
      };

    } catch (error) {
      console.error('❌ QuickBooks invoice creation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 👤 Get or create customer in QuickBooks
   */
  async getOrCreateCustomer(customerData, credentials) {
    try {
      // Search for existing customer
      const searchQuery = `SELECT * FROM Customer WHERE Name = '${customerData.name || customerData.firstName + ' ' + customerData.lastName}'`;
      const searchResponse = await fetch(
        `${this.discoveryDocument.base_url}/v3/company/${credentials.realmId}/query?query=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            'Authorization': `Bearer ${credentials.accessToken}`,
            'Accept': 'application/json'
          }
        }
      );

      const searchResult = await searchResponse.json();
      
      if (searchResult.QueryResponse?.Customer?.length > 0) {
        console.log('👤 Found existing QuickBooks customer');
        return searchResult.QueryResponse.Customer[0];
      }

      // Create new customer
      const customer = {
        Name: customerData.name || `${customerData.firstName} ${customerData.lastName}`,
        CompanyName: customerData.company || null,
        PrimaryEmailAddr: customerData.email ? {
          Address: customerData.email
        } : null,
        PrimaryPhone: customerData.phone ? {
          FreeFormNumber: customerData.phone
        } : null
      };

      const createResponse = await fetch(
        `${this.discoveryDocument.base_url}/v3/company/${credentials.realmId}/customer`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${credentials.accessToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(customer)
        }
      );

      const createResult = await createResponse.json();
      
      console.log('✅ Created new QuickBooks customer');
      return createResult.QueryResponse?.Customer?.[0];

    } catch (error) {
      console.error('❌ Customer creation/retrieval failed:', error);
      throw error;
    }
  }

  /**
   * 💰 Track project expenses
   */
  async createExpense(expenseData, credentials) {
    try {
      console.log('💰 Creating QuickBooks expense:', expenseData.description);

      const expense = {
        PaymentType: 'Cash',
        Account: {
          value: '1' // Default expense account
        },
        TotalAmt: expenseData.amount,
        Line: [{
          Amount: expenseData.amount,
          DetailType: 'AccountBasedExpenseLineDetail',
          AccountBasedExpenseLineDetail: {
            AccountRef: {
              value: this.getExpenseAccount(expenseData.category)
            }
          }
        }],
        TxnDate: expenseData.date || new Date().toISOString().split('T')[0],
        PrivateNote: expenseData.description,
        DocNumber: expenseData.referenceNumber || null
      };

      const response = await fetch(
        `${this.discoveryDocument.base_url}/v3/company/${credentials.realmId}/purchase`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${credentials.accessToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(expense)
        }
      );

      const result = await response.json();
      
      console.log('✅ QuickBooks expense created successfully');
      return {
        success: true,
        expenseId: result.QueryResponse?.Purchase?.[0]?.Id
      };

    } catch (error) {
      console.error('❌ QuickBooks expense creation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 📊 Generate financial reports
   */
  async generateProjectProfitabilityReport(projectId, credentials) {
    try {
      console.log('📊 Generating project profitability report:', projectId);

      // Get project invoices
      const invoiceQuery = `SELECT * FROM Invoice WHERE PrivateNote LIKE '%${projectId}%'`;
      const invoiceResponse = await fetch(
        `${this.discoveryDocument.base_url}/v3/company/${credentials.realmId}/query?query=${encodeURIComponent(invoiceQuery)}`,
        {
          headers: {
            'Authorization': `Bearer ${credentials.accessToken}`,
            'Accept': 'application/json'
          }
        }
      );

      const invoiceResult = await invoiceResponse.json();
      const invoices = invoiceResult.QueryResponse?.Invoice || [];

      // Get project expenses
      const expenseQuery = `SELECT * FROM Purchase WHERE PrivateNote LIKE '%${projectId}%'`;
      const expenseResponse = await fetch(
        `${this.discoveryDocument.base_url}/v3/company/${credentials.realmId}/query?query=${encodeURIComponent(expenseQuery)}`,
        {
          headers: {
            'Authorization': `Bearer ${credentials.accessToken}`,
            'Accept': 'application/json'
          }
        }
      );

      const expenseResult = await expenseResponse.json();
      const expenses = expenseResult.QueryResponse?.Purchase || [];

      // Calculate totals
      const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.TotalAmt || 0), 0);
      const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.TotalAmt || 0), 0);
      const profit = totalRevenue - totalExpenses;
      const profitMargin = totalRevenue > 0 ? (profit / totalRevenue * 100).toFixed(2) : 0;

      const report = {
        projectId,
        totalRevenue,
        totalExpenses,
        profit,
        profitMargin: parseFloat(profitMargin),
        invoiceCount: invoices.length,
        expenseCount: expenses.length,
        generatedAt: new Date().toISOString()
      };

      console.log('✅ Project profitability report generated');
      return report;

    } catch (error) {
      console.error('❌ Report generation failed:', error);
      throw error;
    }
  }

  /**
   * 🗂️ Helper: Get expense account by category
   */
  getExpenseAccount(category) {
    const accountMap = {
      'materials': '60000', // Cost of Goods Sold
      'labor': '62000',     // Labor Expenses
      'travel': '64000',    // Travel Expenses
      'equipment': '65000', // Equipment Expenses
      'supplies': '66000',  // Office Supplies
      'default': '67000'    // General Expenses
    };

    return accountMap[category] || accountMap.default;
  }

  /**
   * 📅 Helper: Calculate due date
   */
  calculateDueDate(daysFromNow) {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString().split('T')[0];
  }

  /**
   * ✅ Test connection to QuickBooks
   */
  async testConnection(credentials) {
    try {
      const response = await fetch(
        `${this.discoveryDocument.base_url}/v3/company/${credentials.realmId}/companyinfo/${credentials.realmId}`,
        {
          headers: {
            'Authorization': `Bearer ${credentials.accessToken}`,
            'Accept': 'application/json'
          }
        }
      );

      if (response.ok) {
        console.log('✅ QuickBooks connection test successful');
        return { connected: true };
      } else {
        throw new Error('Connection test failed');
      }

    } catch (error) {
      console.error('❌ QuickBooks connection test failed:', error);
      return { 
        connected: false, 
        error: error.message 
      };
    }
  }
}

module.exports = QuickBooksService; 