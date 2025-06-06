import React, { useState } from 'react';
import { Container, Typography, Button, Box, Paper, Alert, Grid } from '@mui/material';
import { getApiUrl } from '../lib/api';

export default function DebugPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test: string, result: any) => {
    setResults(prev => [...prev, { test, result, timestamp: new Date().toISOString() }]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const testBasicFetch = async () => {
    setLoading(true);
    try {
      const url = getApiUrl('/api/customers?summary=true');
      addResult('API URL Generation', url);
      
      const response = await fetch(url);
      addResult('Fetch Response Status', response.status);
      addResult('Fetch Response Headers', Object.fromEntries(response.headers.entries()));
      
      const data = await response.json();
      addResult('Fetch Response Data', data);
    } catch (error) {
      addResult('Fetch Error', error);
    } finally {
      setLoading(false);
    }
  };

  const testWithCORS = async () => {
    setLoading(true);
    try {
      const url = getApiUrl('/api/customers?summary=true');
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Send credentials
      });
      
      addResult('CORS Test Status', response.status);
      addResult('CORS Test Headers', Object.fromEntries(response.headers.entries()));
      
      const data = await response.json();
      addResult('CORS Test Data', data);
    } catch (error) {
      addResult('CORS Test Error', error);
    } finally {
      setLoading(false);
    }
  };

  const testNetworkInfo = () => {
    const info = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      onLine: navigator.onLine,
      cookieEnabled: navigator.cookieEnabled,
      hostname: window.location.hostname,
      port: window.location.port,
      protocol: window.location.protocol,
      origin: window.location.origin,
    };
    addResult('Browser/Network Info', info);
  };

  const testEnvironment = () => {
    const env = {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      generatedApiUrl: getApiUrl('/test'),
    };
    addResult('Environment Variables', env);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        🔍 Frontend API Debug Console
      </Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Run Tests
        </Typography>
        <Grid container spacing={2}>
          <Grid item>
            <Button variant="contained" onClick={testBasicFetch} disabled={loading}>
              Test Basic Fetch
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" onClick={testWithCORS} disabled={loading}>
              Test with CORS
            </Button>
          </Grid>
          <Grid item>
            <Button variant="outlined" onClick={testNetworkInfo}>
              Get Network Info
            </Button>
          </Grid>
          <Grid item>
            <Button variant="outlined" onClick={testEnvironment}>
              Get Environment
            </Button>
          </Grid>
          <Grid item>
            <Button variant="outlined" color="secondary" onClick={clearResults}>
              Clear Results
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {loading && (
        <Alert severity="info" sx={{ mb: 4 }}>
          Running test...
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Test Results ({results.length})
        </Typography>
        {results.length === 0 ? (
          <Typography color="text.secondary">
            No tests run yet. Click a test button above.
          </Typography>
        ) : (
          <Box>
            {results.map((result, index) => (
              <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                  {result.test}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  {result.timestamp}
                </Typography>
                <pre style={{ 
                  backgroundColor: '#f5f5f5', 
                  padding: '12px', 
                  borderRadius: '4px',
                  fontSize: '12px',
                  overflow: 'auto',
                  maxHeight: '200px'
                }}>
                  {JSON.stringify(result.result, null, 2)}
                </pre>
              </Box>
            ))}
          </Box>
        )}
      </Paper>
    </Container>
  );
} 