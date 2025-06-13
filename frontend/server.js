import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Backend API URL - use your existing Railway environment variable
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 
  process.env.BACKEND_URL || 
  'http://localhost:3001';

// Parse JSON bodies
app.use(express.json());

// Proxy API requests to backend
app.use('/api', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    
    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Forward authorization header if present
    if (req.headers.authorization) {
      headers.Authorization = req.headers.authorization;
    }
    
    const options = {
      method: req.method,
      headers,
    };
    
    // Add body for non-GET requests
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      options.body = JSON.stringify(req.body);
    }
    
    const response = await fetch(`${BACKEND_URL}${req.originalUrl}`, options);
    
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      res.status(response.status).json(data);
    } else {
      const data = await response.text();
      res.status(response.status).send(data);
    }
  } catch (error) {
    console.error('API Proxy Error:', error);
    res.status(500).json({ error: 'Backend connection failed', details: error.message });
  }
});

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle React routing, return index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Listen on all interfaces (0.0.0.0)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
  console.log(`Proxying API requests to: ${BACKEND_URL}`);
});