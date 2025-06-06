const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const apiConfig = {
  baseURL: API_BASE_URL,
  endpoints: {
    customers: '/api/customers',
    auth: '/api/auth',
    upload: '/api/upload',
    proposals: '/api/proposals',
    products: '/api/products',
    proposalPersonas: '/api/proposal-personas',
    properties: '/api/properties',
  },
};

export function getApiUrl(endpoint: string): string {
  return `${API_BASE_URL}${endpoint}`;
}

export default apiConfig; 