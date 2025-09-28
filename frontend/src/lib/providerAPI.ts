const API_BASE_URL = 'http://localhost:5000/api';

export const providerServicesAPI = {
  getServices: async () => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/provider-services`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  createService: async (serviceData: any) => {
    const token = localStorage.getItem('authToken');
    console.log('Creating service with data:', serviceData);
    console.log('Using token:', token ? 'Token present' : 'No token');
    
    const response = await fetch(`${API_BASE_URL}/provider-services`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(serviceData)
    });
    
    const result = await response.json();
    console.log('API Response:', result);
    
    if (!response.ok) {
      throw new Error(result.message || `HTTP error! status: ${response.status}`);
    }
    
    return result;
  },

  updateService: async (serviceId: string, serviceData: any) => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/provider-services/${serviceId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(serviceData)
    });
    return response.json();
  },

  toggleService: async (serviceId: string) => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/provider-services/${serviceId}/toggle`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  deleteService: async (serviceId: string) => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/provider-services/${serviceId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }
};

export const providerBookingsAPI = {
  getBookings: async (params: any = {}) => {
    const token = localStorage.getItem('authToken');
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/provider-bookings/provider${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  updateBookingStatus: async (bookingId: string, status: string, notes: string = '') => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/provider-bookings/${bookingId}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status, notes })
    });
    return response.json();
  }
};

export const handleAPIError = (error: any): string => {
  console.error('API Error:', error);
  
  if (error.message?.includes('401')) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('sessionExpiry');
    window.location.href = '/auth/login';
    return 'Your session has expired. Please log in again.';
  }
  
  if (error.message?.includes('403')) {
    return 'You do not have permission to perform this action. Make sure your provider account is approved.';
  }
  
  if (error.message?.includes('400')) {
    return 'Invalid data provided. Please check your input and try again.';
  }
  
  return error.message || 'An unexpected error occurred.';
};

export const getSuccessMessage = (action: string, resource: string = 'item'): string => {
  const messages: any = {
    create: `${resource} created successfully!`,
    update: `${resource} updated successfully!`,
    delete: `${resource} deleted successfully!`,
    toggle: `${resource} status updated successfully!`,
    status_update: `Status updated successfully!`,
  };
  
  return messages[action] || 'Operation completed successfully!';
};