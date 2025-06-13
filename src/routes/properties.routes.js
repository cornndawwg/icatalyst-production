const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');

// GET /api/properties - List all properties with search/filter
// GET /api/properties/:id - Get specific property

router.get('/', async (req, res) => {
  try {
    const { search, type, customerId, page = 1, limit = 50 } = req.query;

    const where = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { type: { contains: search } },
        { customer: {
          firstName: { contains: search },
          lastName: { contains: search },
          company: { contains: search }
        }}
      ];
    }
    
    if (type) where.type = type;
    if (customerId) where.customerId = customerId;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          customer: {
            select: {
              firstName: true,
              lastName: true,
              company: true
            }
          },
          address: true
        },
        skip,
        take: parseInt(limit),
        orderBy: { name: 'asc' }
      }),
      prisma.property.count({ where })
    ]);

    res.json({
      properties,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ 
      error: 'Failed to fetch properties',
      details: error.message 
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            company: true,
            email: true,
            phone: true
          }
        },
        address: true,
        photos: true,
        documents: true,
        systems: true,
        serviceHistory: true,
        projects: true
      }
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.json(property);
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({ 
      error: 'Failed to fetch property',
      details: error.message 
    });
  }
});

// POST /api/properties - Create new property
router.post('/', async (req, res) => {
  try {
    const {
      name,
      type,
      squareFootage,
      bedrooms,
      bathrooms,
      yearBuilt,
      customerId,
      address
    } = req.body;

    // Create address first if provided
    let addressRecord = null;
    if (address) {
      addressRecord = await prisma.address.create({
        data: address
      });
    }

    const property = await prisma.property.create({
      data: {
        name,
        type,
        squareFootage: parseFloat(squareFootage),
        bedrooms: bedrooms ? parseInt(bedrooms) : null,
        bathrooms: bathrooms ? parseInt(bathrooms) : null,
        yearBuilt: yearBuilt ? parseInt(yearBuilt) : null,
        customerId,
        addressId: addressRecord?.id || null
      },
      include: {
        customer: true,
        address: true,
        systems: true,
        serviceHistory: true,
        projects: true,
        proposals: true
      }
    });

    res.status(201).json(property);
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(500).json({ error: 'Failed to create property' });
  }
});

// PUT /api/properties/:id - Update property
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      type,
      squareFootage,
      bedrooms,
      bathrooms,
      yearBuilt,
      address
    } = req.body;

    // Update address if provided
    const property = await prisma.property.findUnique({
      where: { id },
      include: { address: true }
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    let addressId = property.addressId;
    if (address) {
      if (property.address) {
        // Update existing address
        await prisma.address.update({
          where: { id: property.addressId },
          data: address
        });
      } else {
        // Create new address
        const addressRecord = await prisma.address.create({
          data: address
        });
        addressId = addressRecord.id;
      }
    }

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        name,
        type,
        squareFootage: squareFootage ? parseFloat(squareFootage) : undefined,
        bedrooms: bedrooms ? parseInt(bedrooms) : undefined,
        bathrooms: bathrooms ? parseInt(bathrooms) : undefined,
        yearBuilt: yearBuilt ? parseInt(yearBuilt) : undefined,
        addressId
      },
      include: {
        customer: true,
        address: true,
        systems: true,
        serviceHistory: true,
        projects: true,
        proposals: {
          include: {
            items: true
          }
        }
      }
    });

    res.json(updatedProperty);
  } catch (error) {
    console.error('Error updating property:', error);
    res.status(500).json({ error: 'Failed to update property' });
  }
});

// DELETE /api/properties/:id - Delete property
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id }
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Delete property (cascade will handle related records)
    await prisma.property.delete({
      where: { id }
    });

    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({ error: 'Failed to delete property' });
  }
});

module.exports = router; 