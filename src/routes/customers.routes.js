const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');

// GET /api/customers?summary=true - Dashboard statistics
// GET /api/customers - List all customers with search/filter
// GET /api/customers/:id - Get specific customer
// POST /api/customers - Create new customer
// PUT /api/customers/:id - Update customer
// DELETE /api/customers/:id - Delete customer

router.get('/', async (req, res) => {
  try {
    const { summary, search, type, status, page = 1, limit = 20 } = req.query;

    // Handle dashboard summary request
    if (summary === 'true') {
      try {
        // Add connection test first
        await prisma.$connect();
        
        const [
          totalCustomers,
          activeCustomers,
          recentProjects,
          completedProjects,
          recentCustomers,
        ] = await Promise.all([
          // Total customers - with fallback
          prisma.customer.count().catch(() => 0),
          
          // Active customers (customers with active status) - with fallback
          prisma.customer.count({ where: { status: 'active' } }).catch(() => 0),
          
          // Recent projects (projects started in last 30 days) - with fallback
          prisma.project.count({
            where: {
              startDate: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
              },
            },
          }).catch(() => 0),
          
          // Completed projects - with fallback
          prisma.project.count({
            where: {
              status: 'completed',
            },
          }).catch(() => 0),
          
          // Recent customers - with fallback
          prisma.customer.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              company: true,
              status: true,
              createdAt: true,
            },
          }).catch(() => []),
        ]);

        console.log('Dashboard stats retrieved successfully:', {
          totalCustomers,
          activeCustomers,
          recentProjects,
          completedProjects,
          recentCustomersCount: recentCustomers.length
        });

        return res.json({
          totalCustomers,
          activeCustomers,
          recentProjects,
          completedProjects,
          recentCustomers: recentCustomers.map((customer) => ({
            ...customer,
            createdAt: customer.createdAt.toISOString(),
          })),
        });
      } catch (summaryError) {
        console.error('Error in dashboard summary:', summaryError);
        
        // Return safe fallback data if database queries fail
        return res.json({
          totalCustomers: 0,
          activeCustomers: 0,
          recentProjects: 0,
          completedProjects: 0,
          recentCustomers: [],
        });
      } finally {
        await prisma.$disconnect();
      }
    }

    // Handle regular customer list request
    const where = {};
    
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
        { company: { contains: search } }
      ];
    }
    
    if (type) where.type = type;
    if (status) where.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          properties: true,
          projects: true,
          billingAddress: true,
          tags: true,
          metrics: true
        },
        skip,
        take: parseInt(limit),
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.customer.count({ where })
    ]);

    res.json({
      customers,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ 
      error: 'Failed to fetch customers',
      details: error.message 
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        properties: {
          include: {
            address: true,
            photos: true,
            documents: true,
            systems: true,
            serviceHistory: true,
            projects: true
          }
        },
        projects: {
          include: {
            milestones: true,
            budget: {
              include: {
                lineItems: true
              }
            },
            teamMembers: {
              include: {
                teamMember: true
              }
            },
            documents: true
          }
        },
        interactions: true,
        billingAddress: true,
        tags: true,
        metrics: true
      }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ 
      error: 'Failed to fetch customer',
      details: error.message 
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const customerData = req.body;
    
    const customer = await prisma.customer.create({
      data: {
        ...customerData,
        // Required fields with defaults for beta testing
        type: customerData.type || 'residential',
        status: customerData.status || 'prospect',
        firstName: customerData.firstName || customerData.name?.split(' ')[0] || 'Unknown',
        lastName: customerData.lastName || customerData.name?.split(' ').slice(1).join(' ') || '',
        preferredCommunication: customerData.preferredCommunication || 'email',
        billingAddress: customerData.billingAddress ? {
          create: customerData.billingAddress
        } : undefined,
        tags: customerData.tags ? {
          create: customerData.tags.map(tag => ({ name: tag }))
        } : undefined
      },
      include: {
        billingAddress: true,
        tags: true,
        properties: true,
        projects: true
      }
    });

    res.status(201).json(customer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ 
      error: 'Failed to create customer',
      details: error.message 
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const customerData = req.body;
    
    const customer = await prisma.customer.update({
      where: { id },
      data: {
        ...customerData,
        billingAddress: customerData.billingAddress ? {
          upsert: {
            create: customerData.billingAddress,
            update: customerData.billingAddress
          }
        } : undefined
      },
      include: {
        billingAddress: true,
        tags: true,
        properties: true,
        projects: true
      }
    });

    res.json(customer);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ 
      error: 'Failed to update customer',
      details: error.message 
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.customer.delete({
      where: { id }
    });

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ 
      error: 'Failed to delete customer',
      details: error.message 
    });
  }
});

module.exports = router; 