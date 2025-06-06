import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: '/api', // This will be automatically proxied by Vite
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Add request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const auth = {
  register: (data: RegisterData) => 
    api.post('/auth/register', data),
  
  login: (data: LoginData) => 
    api.post('/auth/login', data),
};

// Types
interface RegisterData {
  fullName: string;
  email: string;
  role: string;
  phone?: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

export default api; 