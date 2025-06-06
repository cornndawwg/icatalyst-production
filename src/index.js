// MINIMAL EXPRESS SERVER - ZERO ROUTES
// Testing for path-to-regexp error isolation

const express = require('express');
const cors = require('cors');
const path = require('path');

// Environment and debug logging
const envPath = path.join(__dirname, '..', '.env');
console.log(`Looking for .env file at: ${envPath}`);

// Check environment variables
const DATABASE_URL = process.env.DATABASE_URL;
const JWT_SECRET = process.env.JWT_SECRET;

if (!DATABASE_URL) {
  console.log('⚠️ DATABASE_URL missing - Railway variable configuration issue detected');
}

if (!JWT_SECRET) {
  console.log('⚠️ JWT_SECRET missing - using fallback');
}

console.log('=== RAILWAY MINIMAL DEPLOYMENT TEST ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('DATABASE_URL present:', !!DATABASE_URL);
console.log('DATABASE_URL length:', DATABASE_URL ? DATABASE_URL.length : 'N/A');
console.log('JWT_SECRET present:', !!JWT_SECRET);
console.log('JWT_SECRET length:', JWT_SECRET ? JWT_SECRET.length : 'N/A');

console.log('Railway PG Variables:');
console.log('PGHOST:', process.env.PGHOST);
console.log('PGPORT:', process.env.PGPORT);
console.log('PGDATABASE:', process.env.PGDATABASE);
console.log('PGUSER:', process.env.PGUSER);
console.log('PGPASSWORD present:', !!process.env.PGPASSWORD);
console.log('PGURL present:', !!process.env.PGURL);

console.log('Current working directory:', process.cwd());
console.log('__dirname:', __dirname);
console.log('Deployment Mode: MINIMAL SERVER (NO ROUTES)');
console.log('================================');

// Create Express app
const app = express();

// Basic middleware ONLY
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

console.log('✅ Basic middleware loaded');

// SINGLE HEALTH CHECK ROUTE ONLY
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    mode: 'minimal-test',
    message: 'Minimal Express server running - testing path-to-regexp isolation'
  });
});

console.log('✅ Health route added');

// NO OTHER ROUTES - COMPLETE ISOLATION TEST

// Start server
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 MINIMAL SERVER STARTED on port ${PORT}`);
  console.log(`🔍 Testing path-to-regexp error isolation`);
  console.log(`📋 Available endpoints: /health only`);
  console.log(`🎯 If this works, issue is in route files`);
  console.log(`🚨 If this fails, issue is in Express configuration`);
}); 