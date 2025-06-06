// API configuration for iCatalyst Smart Home CRM
// Handles both development (separate ports) and production (unified Railway deployment)

const isDevelopment = process.env.NODE_ENV === 'development';
const isClient = typeof window !== 'undefined';

// API Base URL Configuration
export const API_BASE_URL = (() => {
  // In production, API is served from same domain with /api prefix
  if (!isDevelopment) {
    return isClient ? '/api' : process.env.NEXT_PUBLIC_API_URL || '/api';
  }
  
  // In development, use separate API server
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
})();

console.log('API Configuration:', {
  NODE_ENV: process.env.NODE_ENV,
  isDevelopment,
  isClient,
  API_BASE_URL,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL
});

// API Helper Functions
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Include cookies for authentication
  };

  const requestOptions = { ...defaultOptions, ...options };

  try {
    console.log(`API Request: ${requestOptions.method || 'GET'} ${url}`);
    const response = await fetch(url, requestOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Specific API endpoints
export const api = {
  // Customer endpoints
  customers: {
    list: () => apiCall('/customers'),
    get: (id: string) => apiCall(`/customers/${id}`),
    create: (data: any) => apiCall('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => apiCall(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => apiCall(`/customers/${id}`, {
      method: 'DELETE',
    }),
  },
  
  // Proposal endpoints
  proposals: {
    list: () => apiCall('/proposals'),
    get: (id: string) => apiCall(`/proposals/${id}`),
    create: (data: any) => apiCall('/proposals', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => apiCall(`/proposals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    generatePortal: (id: string) => apiCall(`/proposals/${id}/portal`, {
      method: 'POST',
    }),
  },
  
  // Product endpoints
  products: {
    list: () => apiCall('/products'),
    get: (id: string) => apiCall(`/products/${id}`),
  },
  
  // Property endpoints
  properties: {
    list: () => apiCall('/properties'),
    get: (id: string) => apiCall(`/properties/${id}`),
    create: (data: any) => apiCall('/properties', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  },
  
  // Proposal personas
  proposalPersonas: {
    list: () => apiCall('/proposal-personas'),
  },
  
  // Health check
  health: () => apiCall('/health'),
  
  // Debug
  debug: () => apiCall('/debug/env'),
  
  // Database test
  testDb: () => apiCall('/test-db'),
};

export default api; 