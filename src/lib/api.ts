// API configuration and helper functions for Solutil backend integration

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// API client with error handling
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for authentication
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication endpoints
  async register(userData: {
    name: string;
    email: string;
    password: string;
    userType?: 'client' | 'provider';
    phone?: string;
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: { email: string; password: string }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  async updateProfile(profileData: any) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async forgotPassword(email: string) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, password: string) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  }

  // Services endpoints
  async getServices(params?: {
    page?: number;
    limit?: number;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request(`/services${query}`);
  }

  async getService(id: string) {
    return this.request(`/services/${id}`);
  }

  async searchServices(query: string, params?: { page?: number; limit?: number }) {
    const searchParams = new URLSearchParams({ q: query });
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    return this.request(`/services/search?${searchParams.toString()}`);
  }

  async getPopularServices(limit?: number) {
    const query = limit ? `?limit=${limit}` : '';
    return this.request(`/services/popular${query}`);
  }

  async getServicesByCategory(category: string, params?: { page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request(`/services/category/${category}${query}`);
  }

  // Bookings endpoints
  async getBookings(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request(`/bookings${query}`);
  }

  async getBooking(id: string) {
    return this.request(`/bookings/${id}`);
  }

  async createBooking(bookingData: {
    provider: string;
    service: string;
    scheduledDate: string;
    scheduledTime: { start: string; end: string };
    location: {
      address: string;
      city?: string;
      state?: string;
      zipCode?: string;
      coordinates: { lat: number; lng: number };
      instructions?: string;
    };
    pricing: {
      totalAmount: number;
      currency?: string;
    };
    payment: {
      method: 'card' | 'mpesa' | 'cash' | 'bank-transfer';
    };
    notes?: string;
  }) {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async updateBookingStatus(id: string, status: string, notes?: string) {
    return this.request(`/bookings/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    });
  }

  async cancelBooking(id: string, reason: string) {
    return this.request(`/bookings/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason }),
    });
  }

  async getUserBookings() {
    return this.request('/bookings/my-bookings');
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

// Create and export API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Helper function to handle API errors in components
export const handleApiError = (error: any): string => {
  if (error.message) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred. Please try again.';
};

// Types for TypeScript support
export interface User {
  _id: string;
  name: string;
  email: string;
  userType: 'client' | 'provider' | 'admin';
  phone?: string;
  avatar?: {
    url: string;
    public_id?: string;
  };
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  isVerified: boolean;
  isActive: boolean;
  preferences?: {
    notifications?: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    language?: string;
    currency?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  _id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  basePrice: number;
  priceType: 'fixed' | 'hourly' | 'per-unit';
  currency: string;
  duration: {
    estimated: number;
    unit: 'minutes' | 'hours' | 'days';
  };
  images: Array<{
    public_id?: string;
    url: string;
  }>;
  tags: string[];
  isActive: boolean;
  rating: {
    average: number;
    count: number;
  };
  bookingCount: number;
  isPopular: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  _id: string;
  bookingNumber: string;
  client: User;
  provider: any; // Provider type would be defined separately
  service: Service;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'disputed';
  scheduledDate: string;
  scheduledTime: {
    start: string;
    end: string;
  };
  location: {
    address: string;
    city?: string;
    state?: string;
    zipCode?: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    instructions?: string;
  };
  pricing: {
    basePrice: number;
    additionalCharges?: Array<{
      description: string;
      amount: number;
    }>;
    discount?: {
      amount: number;
      reason: string;
    };
    totalAmount: number;
    currency: string;
  };
  payment: {
    method: 'card' | 'mpesa' | 'cash' | 'bank-transfer';
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
    transactionId?: string;
    paidAt?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  results?: number;
  pagination?: {
    page: number;
    pages: number;
    total: number;
    limit: number;
  };
}

export default apiClient;
