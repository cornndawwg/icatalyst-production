const path = require('path');
const dotenv = require('dotenv');

// Resolve the absolute path to .env file
const envPath = path.resolve(__dirname, '..', '.env');
console.log('Looking for .env file at:', envPath);

// Load environment variables
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.warn('Warning: .env file not found, using environment variables');
}

// Railway environment variable fallbacks
if (!process.env.DATABASE_URL) {
  console.warn('⚠️ DATABASE_URL missing - Railway variable configuration issue detected');
  process.env.DATABASE_URL = process.env.PGURL || 
    `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`;
}

if (!process.env.JWT_SECRET) {
  console.warn('⚠️ JWT_SECRET missing - using fallback');
  process.env.JWT_SECRET = 'iCatalyst2024SecureKey!';
}

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

const express = require('express');
const cors = require('cors');

const PORT = process.env.PORT || 3001;

// Debug logging - Railway specific
console.log('=== RAILWAY API-ONLY DEPLOYMENT DEBUG ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', PORT);
console.log('DATABASE_URL present:', !!process.env.DATABASE_URL);
console.log('DATABASE_URL length:', process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0);
console.log('JWT_SECRET present:', !!process.env.JWT_SECRET);
console.log('JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);

// Railway PostgreSQL debug info
console.log('Railway PG Variables:');
console.log('PGHOST:', process.env.PGHOST);
console.log('PGPORT:', process.env.PGPORT);
console.log('PGDATABASE:', process.env.PGDATABASE);
console.log('PGUSER:', process.env.PGUSER);
console.log('PGPASSWORD present:', !!process.env.PGPASSWORD);
console.log('PGURL present:', !!process.env.PGURL);

console.log('Current working directory:', process.cwd());
console.log('__dirname:', __dirname);
console.log('Deployment Mode: API-ONLY (Next.js integration removed)');
console.log('================================');

// Import modules with error handling
let logger, errorHandler;
try {
  logger = require('./utils/logger').logger;
  console.log('✅ Logger loaded successfully');
} catch (err) {
  console.error('❌ Logger loading failed:', err.message);
  // Fallback console logger
  logger = {
    info: console.log,
    error: console.error,
    warn: console.warn
  };
}

try {
  errorHandler = require('./middleware/errorHandler').errorHandler;
  console.log('✅ Error handler loaded successfully');
} catch (err) {
  console.error('❌ Error handler loading failed:', err.message);
  // Fallback error handler
  errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  };
}

// Load routes with error handling - STABLE CORE ONLY
const routes = {};
try {
  // DEPLOY STABLE BACKEND: Known working routes only
  routes.customers = require('./routes/customers.routes');
  routes.upload = require('./routes/upload.routes');
  routes.products = require('./routes/products.routes');
  routes.proposalPersonas = require('./routes/proposal-personas.routes');
  routes.properties = require('./routes/properties.routes');
  routes.testDb = require('./routes/test-db.routes');
  routes.portal = require('./routes/portal.routes');
  console.log('✅ Stable core routes loaded successfully');
} catch (err) {
  console.error('❌ Route loading failed:', err.message);
}

// Initialize Express app
const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002',
    /\.railway\.app$/, /\.vercel\.app$/, /\.netlify\.app$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', mode: 'STABLE_CORE_API', timestamp: new Date().toISOString() });
});

// Mount working routes
if (routes.customers) app.use('/api/customers', routes.customers);
if (routes.upload) app.use('/api/upload', routes.upload);
if (routes.products) app.use('/api/products', routes.products);
if (routes.proposalPersonas) app.use('/api/proposal-personas', routes.proposalPersonas);
if (routes.properties) app.use('/api/properties', routes.properties);
if (routes.testDb) app.use('/api/test-db', routes.testDb);
if (routes.portal) app.use('/api/portal', routes.portal);

// API info
app.get('/api', (req, res) => {
  res.json({ 
    message: 'iCatalyst Smart Home CRM - Stable Core API',
    status: 'operational',
    available_endpoints: ['customers', 'upload', 'products', 'proposal-personas', 'properties', 'test-db', 'portal'],
    note: 'Auth and Proposals routes temporarily disabled - debugging path-to-regexp issue'
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'iCatalyst Smart Home CRM - Stable Core Backend', api_root: '/api' });
});

// 404 handler
app.all('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found', api_info: '/api' });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 iCatalyst CRM Stable Core API Server Started!');
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/health`);
  console.log(`🔌 API: http://localhost:${PORT}/api`);
  console.log('✅ Available: customers, upload, products, properties, portal');
  console.log('⚠️ Temporarily disabled: auth, proposals (debugging path-to-regexp)');
}).on('error', (err) => {
  console.error('❌ Server error:', err);
  process.exit(1);
}); 