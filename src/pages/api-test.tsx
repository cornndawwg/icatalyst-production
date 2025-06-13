import React, { useState } from 'react';
import { Container, Typography, Button, Paper, Box, Alert } from '@mui/material';
import { getApiUrl } from '../lib/api';

export default function ApiTestPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testCustomersApi = async () => {
    setLoading(true);
    setResult('Testing...');
    
    try {
      const url = getApiUrl('/api/customers?summary=true');
      console.log('Testing URL:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      setResult(`Success! Status: ${response.status}\nData: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testPropertiesApi = async () => {
    setLoading(true);
    setResult('Testing...');
    
    try {
      const url = getApiUrl('/api/properties');
      console.log('Testing URL:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      setResult(`Success! Status: ${response.status}\nData: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testProductsApi = async () => {
    setLoading(true);
    setResult('Testing...');
    
    try {
      const url = getApiUrl('/api/products');
      console.log('Testing URL:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      setResult(`Success! Status: ${response.status}\nData: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testDatabaseConnection = async () => {
    setLoading(true);
    setResult('Testing database connection...');
    
    try {
      const url = getApiUrl('/api/test-db');
      console.log('Testing URL:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      setResult(`Database Test! Status: ${response.status}\nData: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`Database Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testServerStatus = async () => {
    setLoading(true);
    setResult('Testing server status...');
    
    try {
      const url = getApiUrl('/');
      console.log('Testing URL:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      setResult(`Server Status! Status: ${response.status}\nData: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`Server Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        API Test Page
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="h6">Standard Port Configuration:</Typography>
        <Typography variant="body2">• API Server (Express): Port 3001</Typography>
        <Typography variant="body2">• Frontend (Next.js): Port 3002</Typography>
        <Typography variant="body2">• Current API Base URL: {getApiUrl('')}</Typography>
      </Alert>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Button 
          variant="contained" 
          color="primary"
          onClick={testServerStatus} 
          disabled={loading}
        >
          Test Server Status
        </Button>
        <Button 
          variant="contained" 
          color="primary"
          onClick={testDatabaseConnection} 
          disabled={loading}
        >
          Test Database Connection
        </Button>
        <Button 
          variant="contained" 
          onClick={testCustomersApi} 
          disabled={loading}
        >
          Test Customers API (Dashboard)
        </Button>
        <Button 
          variant="contained" 
          onClick={testPropertiesApi} 
          disabled={loading}
        >
          Test Properties API
        </Button>
        <Button 
          variant="contained" 
          onClick={testProductsApi} 
          disabled={loading}
        >
          Test Products API
        </Button>
      </Box>

      {result && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Result:
          </Typography>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
            {result}
          </pre>
        </Paper>
      )}
    </Container>
  );
} 