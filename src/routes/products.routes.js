const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');

// GET /api/products?search=term&category=audio&pricingTier=better - Search products
// GET /api/products/:id - Get specific product

router.get('/', async (req, res) => {
  try {
    const { search, category, pricingTier = 'better', page = 1, limit = 50 } = req.query;

    const where = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { brand: { contains: search } },
        { model: { contains: search } },
        { category: { contains: search } }
      ];
    }
    
    if (category) {
      where.category = category;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: [
          { category: 'asc' },
          { name: 'asc' }
        ]
      }),
      prisma.product.count({ where })
    ]);

    // Calculate price based on selected tier and add to each product
    const productsWithTierPricing = products.map(product => {
      let price = product.basePrice;
      
      switch (pricingTier) {
        case 'good':
          price = product.goodTierPrice || product.basePrice;
          break;
        case 'better':
          price = product.betterTierPrice || product.basePrice * 1.15;
          break;
        case 'best':
          price = product.bestTierPrice || product.basePrice * 1.35;
          break;
        default:
          price = product.basePrice;
      }
      
      return {
        ...product,
        price: Math.round(price * 100) / 100 // Round to 2 decimal places
      };
    });

    res.json({
      products: productsWithTierPricing,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      error: 'Failed to fetch products',
      details: error.message 
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { pricingTier = 'better' } = req.query;
    
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Calculate price based on selected tier
    let price = product.basePrice;
    
    switch (pricingTier) {
      case 'good':
        price = product.goodTierPrice || product.basePrice;
        break;
      case 'better':
        price = product.betterTierPrice || product.basePrice * 1.15;
        break;
      case 'best':
        price = product.bestTierPrice || product.basePrice * 1.35;
        break;
      default:
        price = product.basePrice;
    }

    res.json({
      ...product,
      price: Math.round(price * 100) / 100
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ 
      error: 'Failed to fetch product',
      details: error.message 
    });
  }
});

// GET /api/products/categories - Get all product categories
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await prisma.product.findMany({
      distinct: ['category'],
      select: {
        category: true
      }
    });

    const categoryList = categories.map(c => c.category).sort();

    res.json({ categories: categoryList });
  } catch (error) {
    console.error('Error fetching product categories:', error);
    res.status(500).json({ 
      error: 'Failed to fetch product categories',
      details: error.message 
    });
  }
});

// GET /api/products/brands - Get all product brands
router.get('/meta/brands', async (req, res) => {
  try {
    const brands = await prisma.product.findMany({
      distinct: ['brand'],
      select: {
        brand: true
      }
    });

    const brandList = brands.map(b => b.brand).sort();

    res.json({ brands: brandList });
  } catch (error) {
    console.error('Error fetching product brands:', error);
    res.status(500).json({ 
      error: 'Failed to fetch product brands',
      details: error.message 
    });
  }
});

module.exports = router; 