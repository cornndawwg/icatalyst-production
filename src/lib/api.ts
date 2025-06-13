/**
 * API Configuration for iCatalyst Smart Home CRM
 * Handles connection between Next.js frontend and Express backend
 */

// Use relative URLs that will be proxied to backend
const BACKEND_URL = process.env.NODE_ENV === 'production' 
  ? '' // Use relative URLs in production (proxied by frontend server)
  : 'http://localhost:3001'; // Direct connection in development

/**
 * Get the complete API URL for a given endpoint
 */
export function getApiUrl(endpoint: string): string {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  // Ensure API prefix
  const apiEndpoint = cleanEndpoint.startsWith('api/') ? cleanEndpoint : `api/${cleanEndpoint}`;
  
  return `${BACKEND_URL}/${apiEndpoint}`;
}

/**
 * Enhanced fetch wrapper with error handling and Railway-specific configuration
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = getApiUrl(endpoint);
  
  // Get auth token from localStorage if available
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  };
  
  // Add auth token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const defaultOptions: RequestInit = {
    headers,
    credentials: 'include', // Include cookies for Railway authentication
    ...options,
  };

  try {
    console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
    
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error(`❌ API Error: ${response.status} ${response.statusText}`, errorData);
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ API Success: ${url}`, data);
    
    return data;
  } catch (error) {
    console.error(`💥 API Request Failed: ${url}`, error);
    throw error;
  }
}

/**
 * Health check for backend connection
 */
export async function checkBackendHealth(): Promise<{
  status: string;
  backend_url: string;
  timestamp: string;
}> {
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }
    const data = await response.json();
    return {
      ...data,
      backend_url: BACKEND_URL,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Backend health check failed:', error);
    throw error;
  }
}

/**
 * Export backend URL for debugging
 */
export const CURRENT_BACKEND_URL = BACKEND_URL;

// Common API endpoints
export const API_ENDPOINTS = {
  // Customer Management
  customers: 'customers',
  customerById: (id: string) => `customers/${id}`,
  
  // Property Management
  properties: 'properties',
  propertyById: (id: string) => `properties/${id}`,
  
  // Smart Proposals
  proposals: 'proposals',
  proposalById: (id: string) => `proposals/${id}`,
  createProposal: 'proposals',
  
  // Lead Generation
  leads: 'leads',
  generateLead: 'leads/generate',
  
  // AI Services
  personaDetection: 'persona-detection',
  productRecommendations: 'product-recommendations',
  voiceAI: 'voice-ai',
  
  // Analytics & Dashboard
  analytics: 'analytics',
  executiveSummary: 'analytics/executive-summary',
  kpiAlerts: 'analytics/kpi-alerts',
  
  // Health & System
  health: '../health', // Special case - not under /api
  auth: 'auth',
} as const;

// API Helper Functions
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${BACKEND_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  // Get auth token from localStorage if available
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Add auth token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const defaultOptions: RequestInit = {
    headers,
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