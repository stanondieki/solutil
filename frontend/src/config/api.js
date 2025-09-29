// API Configuration for Production
const getApiConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';
  
  const config = {
    // Base URLs
    API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
    SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000',
    
    // API Endpoints
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      VERIFY: '/api/auth/verify-email',
      REFRESH: '/api/auth/refresh',
      LOGOUT: '/api/auth/logout',
      FORGOT_PASSWORD: '/api/auth/forgot-password',
      RESET_PASSWORD: '/api/auth/reset-password'
    },
    
    USERS: {
      PROFILE: '/api/users/profile',
      UPDATE: '/api/users/update',
      DELETE: '/api/users/delete'
    },
    
    SERVICES: {
      LIST: '/api/services',
      CREATE: '/api/services',
      UPDATE: '/api/services',
      DELETE: '/api/services',
      SEARCH: '/api/services/search'
    },
    
    BOOKINGS: {
      LIST: '/api/bookings',
      CREATE: '/api/bookings',
      UPDATE: '/api/bookings',
      CANCEL: '/api/bookings/cancel'
    },
    
    PROVIDERS: {
      LIST: '/api/providers',
      REGISTER: '/api/provider/register',
      PROFILE: '/api/provider/profile',
      SERVICES: '/api/provider-services',
      BOOKINGS: '/api/provider-bookings'
    },
    
    ADMIN: {
      DASHBOARD: '/api/admin/dashboard',
      USERS: '/api/admin/users',
      PROVIDERS: '/api/admin/providers',
      SERVICES: '/api/admin/services',
      BOOKINGS: '/api/admin/bookings'
    },
    
    UPLOAD: {
      IMAGE: '/api/upload/image',
      DOCUMENT: '/api/upload/document'
    },
    
    PAYMENTS: {
      STRIPE: '/api/payments/stripe',
      MPESA: '/api/payments/mpesa'
    },
    
    // Request Configuration
    TIMEOUT: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000'),
    RETRY_ATTEMPTS: 3,
    
    // Headers
    DEFAULT_HEADERS: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };
  
  // Environment-specific overrides
  if (isProduction) {
    config.API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://your-backend-app.azurewebsites.net';
    config.SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://your-backend-app.azurewebsites.net';
  }
  
  return config;
};

// Create API URL helper
export const createApiUrl = (endpoint) => {
  const config = getApiConfig();
  return `${config.API_BASE_URL}${endpoint}`;
};

// Create full URL helper
export const createFullUrl = (path) => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return `${siteUrl}${path}`;
};

// Environment checker
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';

export default getApiConfig;