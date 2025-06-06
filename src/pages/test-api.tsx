import React, { useState } from 'react';
import { Container, Typography, Button, Box, Paper, Alert } from '@mui/material';
import { getApiUrl } from '../lib/api';

export default function TestApiPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testDirectFetch = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const url = getApiUrl('/api/customers?summary=true');
      console.log('🧪 Testing direct fetch to:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('🧪 Response status:', response.status);
      console.log('🧪 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('🧪 Response data:', data);
      setResult(data);
    } catch (err) {
      console.error('🧪 Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testApiUrl = () => {
    const url = getApiUrl('/api/customers?summary=true');
    console.log('🧪 Generated API URL:', url);
    alert(`API URL: ${url}`);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        API Connection Test
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <Button variant="contained" onClick={testDirectFetch} disabled={loading}>
          {loading ? 'Testing...' : 'Test Direct Fetch'}
        </Button>
        <Button variant="outlined" onClick={testApiUrl}>
          Show API URL
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error: {error}
        </Alert>
      )}

      {result && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            API Response:
          </Typography>
          <pre style={{ backgroundColor: '#f5f5f5', padding: '16px', borderRadius: '4px' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </Paper>
      )}
    </Container>
  );
} 