// ULTRA-MINIMAL EXPRESS SERVER - EMERGENCY ISOLATION
// Finding malformed route in main server setup

const express = require('express');

console.log('🚨 EMERGENCY ISOLATION: Ultra-minimal Express server');
console.log('📋 Goal: Find malformed route in main server setup');

// Create Express app
const app = express();

// ONLY essential middleware
app.use(express.json());

console.log('✅ Basic Express app created');

// SINGLE ROUTE ONLY - /health
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Ultra-minimal server working' });
});

console.log('✅ Health route added');

// NO OTHER ROUTES
// NO 404 handler 
// NO static serving
// NO complex middleware
// NO catch-all routes

// Start server
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🎯 ULTRA-MINIMAL SERVER: Running on port ${PORT}`);
  console.log(`📍 ONLY endpoint: /health`);
  console.log(`🔍 If this fails, issue is in Express basics`);
  console.log(`✅ If this works, issue was in our routes/middleware`);
}); 