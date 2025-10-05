import { getApiConfig, createApiUrl } from './api.js';

class APIClient {
  constructor() {
    this.config = getApiConfig();
    this.baseURL = this.config.API_BASE_URL;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = createApiUrl(endpoint);
    
    const defaultOptions = {
      headers: {
        ...this.config.DEFAULT_HEADERS,
        ...(options.headers || {})
      }
    };

    // Add auth token if available
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      defaultOptions.headers.Authorization = `Bearer ${token}`;
    }

    const requestOptions = {
      ...defaultOptions,
      ...options
    };

    try {
      const response = await fetch(url, requestOptions);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Enhanced Services API (Primary - uses ProviderService collection)
  async getServices(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/api/v2/services?${queryString}` : '/api/v2/services';
    return this.request(endpoint);
  }

  async getServiceById(serviceId) {
    return this.request(`/api/v2/services/${serviceId}`);
  }

  async searchServices(searchQuery, filters = {}) {
    const params = { q: searchQuery, ...filters };
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/v2/services/search?${queryString}`);
  }

  // Provider Services
  async getMyServices() {
    return this.request('/api/v2/services/my-services');
  }

  async updateService(serviceId, data) {
    return this.request(`/api/v2/services/${serviceId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deactivateService(serviceId) {
    return this.request(`/api/v2/services/${serviceId}`, {
      method: 'DELETE'
    });
  }

  // Legacy Services API (Fallback)
  async getLegacyServices(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/api/services?${queryString}` : '/api/services';
    return this.request(endpoint);
  }

  // Combined Services Method (tries enhanced first, falls back to legacy)
  async getAllServices(params = {}) {
    try {
      // Try enhanced API first
      const result = await this.getServices(params);
      if (result.data?.services?.length > 0) {
        return result;
      }
    } catch (error) {
      console.warn('Enhanced services API failed, falling back to legacy API', error);
    }

    // Fallback to legacy API
    return this.getLegacyServices(params);
  }

  // Booking API
  async createBooking(bookingData) {
    return this.request('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    });
  }

  async getBookings(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/api/bookings?${queryString}` : '/api/bookings';
    return this.request(endpoint);
  }

  async getBookingById(bookingId) {
    return this.request(`/api/bookings/${bookingId}`);
  }

  async updateBookingStatus(bookingId, status) {
    return this.request(`/api/bookings/${bookingId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  // Auth API
  async login(credentials) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  async register(userData) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async logout() {
    return this.request('/api/auth/logout', {
      method: 'POST'
    });
  }

  // Provider API
  async getProviders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/api/providers?${queryString}` : '/api/providers';
    return this.request(endpoint);
  }

  // Admin API
  async updateProviderStatus(providerId, status) {
    return this.request(`/api/admin/providers/${providerId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }
}

// Export singleton instance
export const apiClient = new APIClient();

// Export individual methods for convenience
export const {
  getServices,
  getServiceById,
  searchServices,
  getAllServices,
  createBooking,
  getBookings,
  login,
  register,
  getProviders
} = apiClient;

export default apiClient;