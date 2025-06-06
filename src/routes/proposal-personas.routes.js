const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');

// GET /api/proposal-personas - List all proposal personas
// GET /api/proposal-personas/:id - Get specific proposal persona

router.get('/', async (req, res) => {
  try {
    const { type, page = 1, limit = 50 } = req.query;

    const where = {};
    
    if (type) {
      where.type = type;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [personas, total] = await Promise.all([
      prisma.proposalPersona.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: [
          { type: 'asc' },
          { displayName: 'asc' }
        ]
      }),
      prisma.proposalPersona.count({ where })
    ]);

    res.json({
      personas,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching proposal personas:', error);
    res.status(500).json({ 
      error: 'Failed to fetch proposal personas',
      details: error.message 
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const persona = await prisma.proposalPersona.findUnique({
      where: { id }
    });

    if (!persona) {
      return res.status(404).json({ error: 'Proposal persona not found' });
    }

    res.json(persona);
  } catch (error) {
    console.error('Error fetching proposal persona:', error);
    res.status(500).json({ 
      error: 'Failed to fetch proposal persona',
      details: error.message 
    });
  }
});

// GET /api/proposal-personas/types - Get all persona types
router.get('/meta/types', async (req, res) => {
  try {
    const types = await prisma.proposalPersona.findMany({
      distinct: ['type'],
      select: {
        type: true
      }
    });

    const typeList = types.map(t => t.type).sort();

    res.json({ types: typeList });
  } catch (error) {
    console.error('Error fetching persona types:', error);
    res.status(500).json({ 
      error: 'Failed to fetch persona types',
      details: error.message 
    });
  }
});

module.exports = router; 