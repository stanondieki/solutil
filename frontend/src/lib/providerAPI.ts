// Provider API utilities
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net';

export const providerAPI = {
  // 🆕 UPDATED: Get provider services from enhanced API
  getServices: async () => {
    try {
      // Try multiple token storage locations
      const token = localStorage.getItem('token') || 
                   localStorage.getItem('authToken') || 
                   sessionStorage.getItem('token') ||
                   sessionStorage.getItem('authToken');
      
      if (!token) {
        console.error('No authentication token found');
        return { status: 'error', message: 'No authentication token', services: [] };
      }

      console.log('Fetching provider services with token:', token ? 'Found' : 'Not found');
      
      // Try enhanced API first
      let response = await fetch(`${API_BASE}/api/v2/services/my-services`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Enhanced API response status:', response.status);
      
      if (!response.ok) {
        // Fallback to legacy API
        console.warn('Enhanced services API failed, falling back to legacy API');
        response = await fetch(`${API_BASE}/api/provider-services`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('Legacy API response status:', response.status);
      }
      
      const data = await response.json();
      console.log('API Response data:', data);
      
      return data;
    } catch (error) {
      console.error('Error fetching services:', error);
      return { status: 'error', message: error instanceof Error ? error.message : 'Unknown error', services: [] };
    }
  },

  // Create a new service
  createService: async (serviceData: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/provider-services`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(serviceData)
      });
      return response.json();
    } catch (error) {
      console.error('Error creating service:', error);
      return { success: false };
    }
  },

  // Get provider bookings
  getBookings: async (filters?: { status?: string; date?: string; limit?: number }) => {
    try {
      // Try multiple token storage locations
      const token = localStorage.getItem('token') || 
                   localStorage.getItem('authToken') || 
                   sessionStorage.getItem('token') ||
                   sessionStorage.getItem('authToken');
      
      if (!token) {
        console.error('🔐 No authentication token found for provider bookings');
        return { success: false, error: 'No authentication token found', bookings: [] };
      }
      
      // Build query parameters from filters
      const queryParams = new URLSearchParams();
      if (filters?.status) queryParams.append('status', filters.status);
      if (filters?.date) queryParams.append('date', filters.date);
      if (filters?.limit) queryParams.append('limit', filters.limit.toString());
      
      const queryString = queryParams.toString();
      const url = `${API_BASE}/api/provider-bookings${queryString ? `?${queryString}` : ''}`;
      
      console.log('📋 Fetching provider bookings from:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log('📋 Provider bookings response:', data);
      
      // Normalize the response format
      if (response.ok && data.status === 'success') {
        return {
          success: true,
          data: data.data,
          bookings: data.data?.bookings || []
        };
      } else {
        return {
          success: false,
          error: data.message || 'Failed to fetch provider bookings',
          bookings: []
        };
      }
    } catch (error) {
      console.error('❌ Error fetching provider bookings:', error);
      return { success: false, error: 'Network error', bookings: [] };
    }
  },

  // Update booking status
  updateBookingStatus: async (bookingId: string, status: string, notes?: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/provider-bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, notes })
      });
      return response.json();
    } catch (error) {
      console.error('Error updating booking status:', error);
      return { success: false, message: 'Failed to update booking status' };
    }
  },

  // 🆕 UPDATED: Toggle service active status (deactivate via enhanced API)
  toggleService: async (serviceId: string) => {
    try {
      const token = localStorage.getItem('token');
      
      // Use enhanced API for deactivation
      let response = await fetch(`${API_BASE}/api/v2/services/${serviceId}`, {
        method: 'DELETE', // Enhanced API uses DELETE for deactivation
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        // Fallback to legacy API
        console.warn('Enhanced toggle API failed, falling back to legacy');
        response = await fetch(`${API_BASE}/api/provider-services/${serviceId}/toggle`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
      
      return response.json();
    } catch (error) {
      console.error('Error toggling service:', error);
      return { success: false, message: 'Failed to toggle service' };
    }
  },

  // Delete service
  deleteService: async (serviceId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/provider-services/${serviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.json();
    } catch (error) {
      console.error('Error deleting service:', error);
      return { success: false, message: 'Failed to delete service' };
    }
  },

  // Update service
  updateService: async (serviceId: string, serviceData: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/provider-services/${serviceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(serviceData)
      });
      return response.json();
    } catch (error) {
      console.error('Error updating service:', error);
      return { success: false, message: 'Failed to update service' };
    }
  }
};

// Individual exports for component compatibility
export const providerServicesAPI = providerAPI;
export const providerBookingsAPI = providerAPI;

export const getSuccessMessage = (action: string) => {
  return `${action} completed successfully!`;
};

export const handleAPIError = (error: any) => {
  console.error('API Error:', error);
  return error?.message || 'An error occurred';
};

export default providerAPI;