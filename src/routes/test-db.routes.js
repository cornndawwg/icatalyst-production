const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');

// GET /api/test-db - Test database connectivity
router.get('/', async (req, res) => {
  try {
    // Test database connection
    await prisma.$connect();
    
    // Test simple queries
    const customerCount = await prisma.customer.count();
    const projectCount = await prisma.project.count();
    const propertyCount = await prisma.property.count();
    
    await prisma.$disconnect();
    
    res.json({
      status: 'success',
      message: 'Database connection successful',
      counts: {
        customers: customerCount,
        projects: projectCount,
        properties: propertyCount
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Database test error:', error);
    
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error('Error disconnecting from database:', disconnectError);
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router; 