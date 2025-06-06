const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');

// GET /api/proposals?summary=true - Dashboard statistics
// GET /api/proposals - List all proposals with search/filter
// GET /api/proposals/:id - Get specific proposal
// POST /api/proposals - Create new proposal
// PUT /api/proposals/:id - Update proposal
// DELETE /api/proposals/:id - Delete proposal

router.get('/', async (req, res) => {
  try {
    console.log('🔍 Starting proposals fetch with query:', req.query);
    
    const { page = 1, limit = 20, search, status, persona } = req.query;
    const where = {};

    // Basic filters
    if (status) where.status = status;
    if (persona) where.customerPersona = persona;

    // Add filter for prospects vs customers
    if (req.query.prospectOnly === 'true') {
      console.log('📋 Filtering for prospects only');
      where.isExistingCustomer = false;
    } else if (req.query.customerOnly === 'true') {
      console.log('👥 Filtering for customers only');
      where.isExistingCustomer = true;
    }

    // Search functionality
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { prospectName: { contains: search } },
        { prospectCompany: { contains: search } }
      ];
    }

    console.log('🔍 Query WHERE clause:', JSON.stringify(where, null, 2));

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    console.log('📊 Starting database query...');
    
    // Simplified query to avoid hanging
    const proposals = await prisma.proposal.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { updatedAt: 'desc' }
    });
    
    console.log(`✅ Found ${proposals.length} proposals`);
    
    const total = await prisma.proposal.count({ where });
    console.log(`✅ Total count: ${total}`);

    res.json({
      proposals,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
    
    console.log('✅ Response sent successfully');
  } catch (error) {
    console.error('❌ Error fetching proposals:', error);
    res.status(500).json({ 
      error: 'Failed to fetch proposals',
      details: error.message 
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const proposal = await prisma.proposal.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            company: true,
            email: true,
            phone: true,
            type: true
          }
        },
        property: {
          select: {
            id: true,
            name: true,
            type: true,
            squareFootage: true,
            address: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                description: true,
                category: true,
                brand: true,
                model: true,
                sku: true,
                basePrice: true,
                goodTierPrice: true,
                betterTierPrice: true,
                bestTierPrice: true,
                specifications: true,
                compatibility: true,
                installation: true
              }
            }
          },
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    res.json(proposal);
  } catch (error) {
    console.error('Error fetching proposal:', error);
    res.status(500).json({ 
      error: 'Failed to fetch proposal',
      details: error.message 
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const proposalData = req.body;
    
    console.log('🚀 Creating proposal with data:', {
      name: proposalData.name,
      isExistingCustomer: proposalData.isExistingCustomer,
      customerId: proposalData.customerId,
      prospectName: proposalData.prospectName,
      prospectEmail: proposalData.prospectEmail,
      propertyId: proposalData.propertyId,
      customerPersona: proposalData.customerPersona,
      itemsCount: proposalData.items?.length || 0
    });
    
    // Validate based on customer type
    if (proposalData.isExistingCustomer && !proposalData.customerId) {
      return res.status(400).json({ error: 'Customer ID is required for existing customers' });
    }
    
    if (!proposalData.isExistingCustomer && (!proposalData.prospectName || !proposalData.prospectEmail)) {
      return res.status(400).json({ error: 'Prospect name and email are required for new prospects' });
    }

    // 🔧 ENHANCED: Validate foreign key references before creation
    if (proposalData.isExistingCustomer && proposalData.customerId) {
      const customerExists = await prisma.customer.findUnique({
        where: { id: proposalData.customerId }
      });
      if (!customerExists) {
        return res.status(400).json({ 
          error: 'Invalid customer ID - customer does not exist',
          customerId: proposalData.customerId
        });
      }
    }

    // Validate property reference if provided
    if (proposalData.propertyId) {
      const propertyExists = await prisma.property.findUnique({
        where: { id: proposalData.propertyId }
      });
      if (!propertyExists) {
        console.warn(`⚠️ Property ID ${proposalData.propertyId} not found, removing from proposal`);
        proposalData.propertyId = null; // Remove invalid property reference
      }
    }

    // 🔧 ENHANCED: Validate product references in items
    const validatedItems = [];
    for (const item of proposalData.items || []) {
      const validatedItem = { ...item };
      
      // If productId is provided, validate it exists
      if (item.productId) {
        const productExists = await prisma.product.findUnique({
          where: { id: item.productId }
        });
        if (!productExists) {
          console.warn(`⚠️ Product ID ${item.productId} not found for item ${item.name}, removing reference`);
          validatedItem.productId = null; // Remove invalid product reference
        }
      }
      
      validatedItems.push(validatedItem);
    }
    
    // Calculate total amount from items
    const subtotal = validatedItems.reduce((sum, item) => 
      sum + (item.quantity * item.unitPrice), 0
    );
    const tax = subtotal * 0.08; // 8% tax
    const totalAmount = subtotal + tax;

    console.log('💰 Calculated totals:', { subtotal, tax, totalAmount });
    
    const proposal = await prisma.proposal.create({
      data: {
        name: proposalData.name,
        description: proposalData.description,
        isExistingCustomer: proposalData.isExistingCustomer,
        customerId: proposalData.isExistingCustomer ? proposalData.customerId : null,
        prospectName: !proposalData.isExistingCustomer ? proposalData.prospectName : null,
        prospectCompany: !proposalData.isExistingCustomer ? proposalData.prospectCompany : null,
        prospectEmail: !proposalData.isExistingCustomer ? proposalData.prospectEmail : null,
        prospectPhone: !proposalData.isExistingCustomer ? proposalData.prospectPhone : null,
        prospectStatus: !proposalData.isExistingCustomer ? 'prospect' : null,
        propertyId: proposalData.propertyId || null,
        customerPersona: proposalData.customerPersona,
        status: 'draft',
        totalAmount: totalAmount,
        validUntil: proposalData.validUntil ? new Date(proposalData.validUntil) : null,
        voiceTranscript: proposalData.voiceTranscript || null,
        // 🎯 ENHANCED: Include AI-generated summary data
        aiSummary: proposalData.aiSummary ? JSON.stringify(proposalData.aiSummary) : null,
        createdBy: proposalData.createdBy || 'system',
        items: {
          create: validatedItems.map((item, index) => ({
            name: item.name,
            description: item.description || '',
            category: item.category,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
            productId: item.productId || null,
            sortOrder: index
          }))
        }
      },
      include: {
        customer: proposalData.isExistingCustomer ? {
          select: {
            firstName: true,
            lastName: true,
            company: true,
            email: true
          }
        } : false,
        property: proposalData.propertyId ? {
          select: {
            name: true,
            type: true
          }
        } : false,
        items: {
          include: {
            product: {
              select: {
                name: true,
                category: true,
                brand: true
              }
            }
          },
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    console.log('✅ Proposal created successfully:', proposal.id);

    // Add calculated fields to response
    const response = {
      ...proposal,
      subtotal,
      tax
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('💥 Error creating proposal:', error);
    
    // Enhanced error reporting
    let errorMessage = 'Failed to create proposal';
    let statusCode = 500;
    
    if (error.code === 'P2003') {
      errorMessage = 'Database constraint violation - invalid reference to related data';
      statusCode = 400;
    } else if (error.code === 'P2002') {
      errorMessage = 'Duplicate data conflict';
      statusCode = 409;
    }
    
    res.status(statusCode).json({ 
      error: errorMessage,
      details: error.message,
      code: error.code || 'UNKNOWN'
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const proposalData = req.body;
    
    // Calculate total amount from items if provided
    let updateData = { ...proposalData };
    let subtotal = 0;
    let tax = 0;
    
    if (proposalData.items) {
      subtotal = proposalData.items.reduce((sum, item) => 
        sum + (item.quantity * item.unitPrice), 0
      );
      tax = subtotal * 0.08;
      updateData.totalAmount = subtotal + tax;
    }
    
    // Handle items update separately
    const { items, ...proposalUpdateData } = updateData;
    
    const proposal = await prisma.proposal.update({
      where: { id },
      data: {
        ...proposalUpdateData,
        validUntil: proposalUpdateData.validUntil ? new Date(proposalUpdateData.validUntil) : undefined,
        updatedAt: new Date()
      },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            company: true,
            email: true
          }
        },
        property: {
          select: {
            name: true,
            type: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                category: true,
                brand: true
              }
            }
          },
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    // Calculate current subtotal and tax if not provided
    if (!proposalData.items) {
      subtotal = proposal.items.reduce((sum, item) => sum + item.totalPrice, 0);
      tax = subtotal * 0.08;
    }

    // Add calculated fields to response
    const response = {
      ...proposal,
      subtotal,
      tax
    };

    res.json(response);
  } catch (error) {
    console.error('Error updating proposal:', error);
    res.status(500).json({ 
      error: 'Failed to update proposal',
      details: error.message 
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete proposal items first (due to foreign key constraints)
    await prisma.proposalItem.deleteMany({
      where: { proposalId: id }
    });
    
    // Delete the proposal
    await prisma.proposal.delete({
      where: { id }
    });

    res.json({ message: 'Proposal deleted successfully' });
  } catch (error) {
    console.error('Error deleting proposal:', error);
    res.status(500).json({ 
      error: 'Failed to delete proposal',
      details: error.message 
    });
  }
});

// Update proposal status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status',
        validStatuses 
      });
    }
    
    const proposal = await prisma.proposal.update({
      where: { id },
      data: { 
        status,
        updatedAt: new Date()
      },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            company: true
          }
        }
      }
    });

    res.json(proposal);
  } catch (error) {
    console.error('Error updating proposal status:', error);
    res.status(500).json({ 
      error: 'Failed to update proposal status',
      details: error.message 
    });
  }
});

module.exports = router; 