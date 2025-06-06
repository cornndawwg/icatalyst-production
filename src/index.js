// ULTRA-MINIMAL EXPRESS SERVER - EMERGENCY ISOLATION
// Finding malformed route in main server setup

const express = require('express');
const cors = require('cors');

console.log('🚨 EMERGENCY ISOLATION: Ultra-minimal Express server');
console.log('📋 Goal: Find malformed route in main server setup');

// Create Express app
const app = express();

// PHASE 1: Basic middleware addition
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

console.log('✅ Basic Express app created');
console.log('✅ CORS middleware added');
console.log('✅ Enhanced JSON parsing added');

// SINGLE ROUTE ONLY - /health
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Phase 1: Basic middleware working perfectly',
    features: ['CORS', 'JSON parsing', 'URL encoding'],
    timestamp: new Date().toISOString()
  });
});

console.log('✅ Health route added with Phase 1 status');

// NO OTHER ROUTES
// NO 404 handler 
// NO static serving
// NO complex middleware
// NO catch-all routes

// Start server
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 PHASE 1 SERVER: Running on port ${PORT}`);
  console.log(`📍 Endpoints: /health`);
  console.log(`✅ Features: CORS + JSON parsing`);
  console.log(`🎯 Testing basic middleware safety`);
  console.log(`📋 Next: Environment variables + debug logging`);
}); 