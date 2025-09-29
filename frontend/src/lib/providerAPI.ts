// Provider API utilities
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const providerAPI = {
  // Get provider services
  getServices: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/provider-services`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.json();
    } catch (error) {
      console.error('Error fetching services:', error);
      return { success: false, services: [] };
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
      const token = localStorage.getItem('token');
      
      // Build query parameters from filters
      const queryParams = new URLSearchParams();
      if (filters?.status) queryParams.append('status', filters.status);
      if (filters?.date) queryParams.append('date', filters.date);
      if (filters?.limit) queryParams.append('limit', filters.limit.toString());
      
      const queryString = queryParams.toString();
      const url = `${API_BASE}/api/provider-bookings${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.json();
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return { success: false, bookings: [] };
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

  // Toggle service active status
  toggleService: async (serviceId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/provider-services/${serviceId}/toggle`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
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