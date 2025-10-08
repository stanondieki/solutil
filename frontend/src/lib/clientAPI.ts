// Client API utilities for service discovery and booking
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net';

export interface BookingData {
  providerId: string;
  serviceId: string;
  scheduledDate: string;
  scheduledTime: {
    start: string;
    end: string;
  };
  location: {
    address: string;
    city?: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    instructions?: string;
  };
  pricing: {
    basePrice: number;
    totalAmount: number;
    currency?: string;
  };
  payment: {
    method: 'card' | 'mpesa' | 'cash' | 'bank-transfer';
  };
  notes?: string;
}

export const clientAPI = {
  // Get all available services for booking
  getAvailableServices: async (filters?: { 
    category?: string; 
    location?: string; 
    priceMin?: number; 
    priceMax?: number; 
    page?: number; 
    limit?: number; 
  }) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters?.category) queryParams.append('category', filters.category);
      if (filters?.location) queryParams.append('location', filters.location);
      if (filters?.priceMin) queryParams.append('priceMin', filters.priceMin.toString());
      if (filters?.priceMax) queryParams.append('priceMax', filters.priceMax.toString());
      if (filters?.page) queryParams.append('page', filters.page.toString());
      if (filters?.limit) queryParams.append('limit', filters.limit.toString());
      
      const queryString = queryParams.toString();
      // 🆕 UPDATED: Use enhanced services API
      const url = `${API_BASE}/api/v2/services${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      return response.json();
    } catch (error) {
      console.error('Error fetching available services:', error);
      return { success: false, services: [] };
    }
  },

  // Get services by category
  getServicesByCategory: async (category: string, page = 1, limit = 20) => {
    try {
      // 🆕 UPDATED: Try enhanced API first, fallback to legacy
      let response = await fetch(`${API_BASE}/api/v2/services?category=${category}&page=${page}&limit=${limit}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        // Fallback to legacy API
        response = await fetch(`${API_BASE}/api/provider-services/category/${category}?page=${page}&limit=${limit}`, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching services by category:', error);
      return { success: false, services: [] };
    }
  },

  // Get single provider service details
  getServiceDetails: async (serviceId: string) => {
    try {
      // 🆕 UPDATED: Try enhanced API first, fallback to legacy
      let response = await fetch(`${API_BASE}/api/v2/services/${serviceId}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        // Fallback to legacy API
        response = await fetch(`${API_BASE}/api/provider-services/public/service/${serviceId}`, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
      
      const data = await response.json();
      
      // Normalize the response format - convert status to success
      if (data.status === 'success') {
        return {
          success: true,
          data: data.data
        };
      } else {
        return {
          success: false,
          service: null
        };
      }
    } catch (error) {
      console.error('Error fetching service details:', error);
      return { success: false, service: null };
    }
  },

  // 🆕 Get providers with their services for a specific category
  getProvidersWithServices: async (category: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/v2/services/providers/with-services?category=${category}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      return response.json();
    } catch (error) {
      console.error('Error fetching providers with services:', error);
      return { success: false, providers: [] };
    }
  },

  // Create a new booking
  createBooking: async (bookingData: {
    providerId: string;
    serviceId: string;
    scheduledDate: string;
    scheduledTime: { start: string; end: string };
    location: {
      address: string;
      city?: string;
      coordinates: { lat: number; lng: number };
      instructions?: string;
    };
    pricing: {
      basePrice: number;
      totalAmount: number;
    };
    payment: {
      method: string;
    };
    notes?: string;
  }) => {
    try {
      const token = localStorage.getItem('authToken');
      console.log('Auth token for booking:', token ? 'Present' : 'Missing');
      
      const response = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookingNumber: `BK${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
          provider: bookingData.providerId,
          service: bookingData.serviceId,
          scheduledDate: bookingData.scheduledDate,
          scheduledTime: bookingData.scheduledTime,
          location: bookingData.location,
          pricing: {
            basePrice: bookingData.pricing.totalAmount,
            totalAmount: bookingData.pricing.totalAmount
          },
          payment: bookingData.payment,
          notes: bookingData.notes
        })
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Booking API Error:', response.status, errorData);
        return { 
          success: false, 
          error: `HTTP ${response.status}: ${errorData}`,
          message: 'Failed to create booking'
        };
      }
      
      return response.json();
    } catch (error) {
      console.error('Error creating booking:', error);
      return { success: false, message: 'Failed to create booking' };
    }
  },

  // Get client bookings
  getMyBookings: async (status?: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const queryString = status ? `?status=${status}` : '';
      const response = await fetch(`${API_BASE}/api/bookings/my-bookings${queryString}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.json();
    } catch (error) {
      console.error('Error fetching client bookings:', error);
      return { success: false, bookings: [] };
    }
  },

  // Get booking details
  getBookingDetails: async (bookingId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/api/bookings/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.json();
    } catch (error) {
      console.error('Error fetching booking details:', error);
      return { success: false, booking: null };
    }
  },

  // Cancel booking
  cancelBooking: async (bookingId: string, reason?: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/api/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });
      
      return response.json();
    } catch (error) {
      console.error('Error canceling booking:', error);
      return { success: false, message: 'Failed to cancel booking' };
    }
  }
};

// Helper functions
export const handleAPIError = (error: any) => {
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message;
  }
  return error.message || 'An unexpected error occurred';
};

export const getSuccessMessage = (action: string) => {
  const messages: { [key: string]: string } = {
    'booking_created': 'Booking created successfully! The provider will review and respond to your request.',
    'booking_cancelled': 'Booking cancelled successfully.',
    'service_booked': 'Service booked successfully! Check your bookings for updates.'
  };
  
  return messages[action] || 'Operation completed successfully';
};