const path = require('path');
const dotenv = require('dotenv');

// Resolve the absolute path to .env file
const envPath = path.resolve(__dirname, '..', '.env');
console.log('Looking for .env file at:', envPath);

// Load environment variables
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.warn('Warning: .env file not found, using default values');
  // Don't exit, just use defaults
}

const express = require('express');
const cors = require('cors');
const { logger } = require('./utils/logger');
const { errorHandler } = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth.routes');
const customerRoutes = require('./routes/customers.routes');
const uploadRoutes = require('./routes/upload.routes');
const proposalRoutes = require('./routes/proposals.routes');
const productRoutes = require('./routes/products.routes');
const proposalPersonaRoutes = require('./routes/proposal-personas.routes');
const propertyRoutes = require('./routes/properties.routes');
const testDbRoutes = require('./routes/test-db.routes');
const portalRoutes = require('./routes/portal.routes');

const app = express();

// Debug logging
console.log('Environment variables after loading:');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Current working directory:', process.cwd());
console.log('__dirname:', __dirname);

const PORT = process.env.PORT || 3001;

// Enhanced CORS configuration for frontend connections
const corsOptions = {
  origin: [
    'http://localhost:3000', // Vite React app
    'http://localhost:3001', // API server itself
    'http://localhost:3002', // Next.js app
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001', 
    'http://127.0.0.1:3002'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Smart Home CRM API Server',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      customers: '/api/customers',
      upload: '/api/upload',
      proposals: '/api/proposals',
      products: '/api/products',
      proposalPersonas: '/api/proposal-personas',
      properties: '/api/properties',
      testDb: '/api/test-db',
      portal: '/api/portal'
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/products', productRoutes);
app.use('/api/proposal-personas', proposalPersonaRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/test-db', testDbRoutes);
app.use('/api/portal', portalRoutes);

// Error handling
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} is already in use. Please choose a different port or kill the process using this port.`);
    process.exit(1);
  } else {
    logger.error('Server error:', err);
    process.exit(1);
  }
}); 