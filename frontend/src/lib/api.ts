const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';// API utility functions for provider services and bookings// API utility functions for provider services and bookings// API utility functions for provider services and bookings



export const providerServicesAPI = {

  getServices: async () => {

    const token = localStorage.getItem('token');const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    const response = await fetch(`${API_BASE_URL}/provider-services`, {

      headers: {

        'Authorization': `Bearer ${token}`,

        'Content-Type': 'application/json'// Provider Services APIconst API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

      }

    });export const providerServicesAPI = {

    return response.json();

  },  getServices: async () => {



  createService: async (serviceData: any) => {    const token = localStorage.getItem('token');

    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}/provider-services`, {    const response = await fetch(`${API_BASE_URL}/provider-services`, {// Types// Types

      method: 'POST',

      headers: {      headers: {

        'Authorization': `Bearer ${token}`,

        'Content-Type': 'application/json'        'Authorization': `Bearer ${token}`,interface APIResponse<T = any> {interface APIResponse<T = any> {

      },

      body: JSON.stringify(serviceData)        'Content-Type': 'application/json'

    });

    return response.json();      }  status: string;  status: string;

  },

    });

  updateService: async (serviceId: string, serviceData: any) => {

    const token = localStorage.getItem('token');    return response.json();  data: T;  data: T;

    const response = await fetch(`${API_BASE_URL}/provider-services/${serviceId}`, {

      method: 'PUT',  },

      headers: {

        'Authorization': `Bearer ${token}`,  message?: string;  message?: string;

        'Content-Type': 'application/json'

      },  createService: async (serviceData: any) => {

      body: JSON.stringify(serviceData)

    });    const token = localStorage.getItem('token');}}

    return response.json();

  },    const response = await fetch(`${API_BASE_URL}/provider-services`, {



  toggleService: async (serviceId: string) => {      method: 'POST',

    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}/provider-services/${serviceId}/toggle`, {      headers: {

      method: 'PATCH',

      headers: {        'Authorization': `Bearer ${token}`,interface RequestOptions {interface APIError extends Error {

        'Authorization': `Bearer ${token}`,

        'Content-Type': 'application/json'        'Content-Type': 'application/json'

      }

    });      },  method?: string;  status?: number;

    return response.json();

  },      body: JSON.stringify(serviceData)



  deleteService: async (serviceId: string) => {    });  headers?: Record<string, string>;}

    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}/provider-services/${serviceId}`, {    return response.json();

      method: 'DELETE',

      headers: {  },  body?: string;

        'Authorization': `Bearer ${token}`,

        'Content-Type': 'application/json'

      }

    });  updateService: async (serviceId: string, serviceData: any) => {}// Generic API request function

    return response.json();

  }    const token = localStorage.getItem('token');

};

    const response = await fetch(`${API_BASE_URL}/provider-services/${serviceId}`, {async function apiRequest(endpoint, options = {}) {

export const providerBookingsAPI = {

  getBookings: async (params: Record<string, string> = {}) => {      method: 'PUT',

    const token = localStorage.getItem('token');

    const queryString = new URLSearchParams(params).toString();      headers: {// Generic API request function  const token = localStorage.getItem('token');

    const endpoint = `/provider-bookings/provider${queryString ? `?${queryString}` : ''}`;

            'Authorization': `Bearer ${token}`,

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {

      headers: {        'Content-Type': 'application/json'async function apiRequest<T = any>(endpoint: string, options: RequestOptions = {}): Promise<APIResponse<T>> {  

        'Authorization': `Bearer ${token}`,

        'Content-Type': 'application/json'      },

      }

    });      body: JSON.stringify(serviceData)  const token = localStorage.getItem('token');  const defaultOptions = {

    return response.json();

  },    });



  updateBookingStatus: async (bookingId: string, status: string, notes: string = '') => {    return response.json();      headers: {

    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}/provider-bookings/${bookingId}/status`, {  },

      method: 'PATCH',

      headers: {  const defaultOptions: RequestOptions = {      'Content-Type': 'application/json',

        'Authorization': `Bearer ${token}`,

        'Content-Type': 'application/json'  toggleService: async (serviceId: string) => {

      },

      body: JSON.stringify({ status, notes })    const token = localStorage.getItem('token');    headers: {      ...(token && { 'Authorization': `Bearer ${token}` }),

    });

    return response.json();    const response = await fetch(`${API_BASE_URL}/provider-services/${serviceId}/toggle`, {

  },

      method: 'PATCH',      'Content-Type': 'application/json',    },

  addBookingNotes: async (bookingId: string, note: string, type: string = 'general') => {

    const token = localStorage.getItem('token');      headers: {

    const response = await fetch(`${API_BASE_URL}/provider-bookings/${bookingId}/notes`, {

      method: 'POST',        'Authorization': `Bearer ${token}`,      ...(token && { 'Authorization': `Bearer ${token}` }),  };

      headers: {

        'Authorization': `Bearer ${token}`,        'Content-Type': 'application/json'

        'Content-Type': 'application/json'

      },      }    },

      body: JSON.stringify({ note, type })

    });    });

    return response.json();

  }    return response.json();  };  const config = {

};

  },

export const handleAPIError = (error: any): string => {

  console.error('API Error:', error);    ...defaultOptions,

  

  if (error.message?.includes('401')) {  deleteService: async (serviceId: string) => {

    localStorage.removeItem('token');

    window.location.href = '/auth/login';    const token = localStorage.getItem('token');  const config: RequestOptions = {    ...options,

    return 'Your session has expired. Please log in again.';

  }    const response = await fetch(`${API_BASE_URL}/provider-services/${serviceId}`, {

  

  if (error.message?.includes('403')) {      method: 'DELETE',    ...defaultOptions,    headers: {

    return 'You do not have permission to perform this action.';

  }      headers: {

  

  if (error.message?.includes('404')) {        'Authorization': `Bearer ${token}`,    ...options,      ...defaultOptions.headers,

    return 'The requested resource was not found.';

  }        'Content-Type': 'application/json'

  

  return error.message || 'An unexpected error occurred.';      }    headers: {      ...options.headers,

};

    });

export const getSuccessMessage = (action: string, resource: string = 'item'): string => {

  const messages: Record<string, string> = {    return response.json();      ...defaultOptions.headers,    },

    create: `${resource} created successfully!`,

    update: `${resource} updated successfully!`,  }

    delete: `${resource} deleted successfully!`,

    toggle: `${resource} status updated successfully!`,};      ...options.headers,  };

    status_update: `Status updated successfully!`,

  };

  

  return messages[action] || 'Operation completed successfully!';// Provider Bookings API    },

};
export const providerBookingsAPI = {

  getBookings: async (params: Record<string, string> = {}) => {  };  try {

    const token = localStorage.getItem('token');

    const queryString = new URLSearchParams(params).toString();    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    const endpoint = `/provider-bookings/provider${queryString ? `?${queryString}` : ''}`;

      try {    

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {

      headers: {    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);    if (!response.ok) {

        'Authorization': `Bearer ${token}`,

        'Content-Type': 'application/json'          const errorData = await response.json().catch(() => ({}));

      }

    });    if (!response.ok) {      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);

    return response.json();

  },      const errorData = await response.json().catch(() => ({}));    }



  updateBookingStatus: async (bookingId: string, status: string, notes: string = '') => {      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);

    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}/provider-bookings/${bookingId}/status`, {    }    return await response.json();

      method: 'PATCH',

      headers: {  } catch (error) {

        'Authorization': `Bearer ${token}`,

        'Content-Type': 'application/json'    return await response.json();    console.error('API request failed:', error);

      },

      body: JSON.stringify({ status, notes })  } catch (error) {    throw error;

    });

    return response.json();    console.error('API request failed:', error);  }

  },

    throw error;}

  addBookingNotes: async (bookingId: string, note: string, type: string = 'general') => {

    const token = localStorage.getItem('token');  }

    const response = await fetch(`${API_BASE_URL}/provider-bookings/${bookingId}/notes`, {

      method: 'POST',}// Provider Services API

      headers: {

        'Authorization': `Bearer ${token}`,export const providerServicesAPI = {

        'Content-Type': 'application/json'

      },// Provider Services API  // Get all services for the provider

      body: JSON.stringify({ note, type })

    });export const providerServicesAPI = {  getServices: async () => {

    return response.json();

  }  // Get all services for the provider    return apiRequest('/provider-services');

};

  getServices: async () => {  },

// Error handling utility

export const handleAPIError = (error: any): string => {    return apiRequest('/provider-services');

  console.error('API Error:', error);

    },  // Get single service

  if (error.message?.includes('401')) {

    localStorage.removeItem('token');  getService: async (serviceId) => {

    window.location.href = '/auth/login';

    return 'Your session has expired. Please log in again.';  // Get single service    return apiRequest(`/provider-services/${serviceId}`);

  }

    getService: async (serviceId: string) => {  },

  if (error.message?.includes('403')) {

    return 'You do not have permission to perform this action.';    return apiRequest(`/provider-services/${serviceId}`);

  }

    },  // Create new service

  if (error.message?.includes('404')) {

    return 'The requested resource was not found.';  createService: async (serviceData) => {

  }

    // Create new service    return apiRequest('/provider-services', {

  return error.message || 'An unexpected error occurred.';

};  createService: async (serviceData: any) => {      method: 'POST',



// Success message utility    return apiRequest('/provider-services', {      body: JSON.stringify(serviceData),

export const getSuccessMessage = (action: string, resource: string = 'item'): string => {

  const messages: Record<string, string> = {      method: 'POST',    });

    create: `${resource} created successfully!`,

    update: `${resource} updated successfully!`,      body: JSON.stringify(serviceData),  },

    delete: `${resource} deleted successfully!`,

    toggle: `${resource} status updated successfully!`,    });

    status_update: `Status updated successfully!`,

  };  },  // Update service

  

  return messages[action] || 'Operation completed successfully!';  updateService: async (serviceId, serviceData) => {

};
  // Update service    return apiRequest(`/provider-services/${serviceId}`, {

  updateService: async (serviceId: string, serviceData: any) => {      method: 'PUT',

    return apiRequest(`/provider-services/${serviceId}`, {      body: JSON.stringify(serviceData),

      method: 'PUT',    });

      body: JSON.stringify(serviceData),  },

    });

  },  // Toggle service status

  toggleService: async (serviceId) => {

  // Toggle service status    return apiRequest(`/provider-services/${serviceId}/toggle`, {

  toggleService: async (serviceId: string) => {      method: 'PATCH',

    return apiRequest(`/provider-services/${serviceId}/toggle`, {    });

      method: 'PATCH',  },

    });

  },  // Delete service

  deleteService: async (serviceId) => {

  // Delete service    return apiRequest(`/provider-services/${serviceId}`, {

  deleteService: async (serviceId: string) => {      method: 'DELETE',

    return apiRequest(`/provider-services/${serviceId}`, {    });

      method: 'DELETE',  },

    });

  },  // Get service analytics

  getServiceAnalytics: async (serviceId) => {

  // Get service analytics    return apiRequest(`/provider-services/${serviceId}/analytics`);

  getServiceAnalytics: async (serviceId: string) => {  },

    return apiRequest(`/provider-services/${serviceId}/analytics`);

  },  // Duplicate service

  duplicateService: async (serviceId) => {

  // Duplicate service    return apiRequest(`/provider-services/${serviceId}/duplicate`, {

  duplicateService: async (serviceId: string) => {      method: 'POST',

    return apiRequest(`/provider-services/${serviceId}/duplicate`, {    });

      method: 'POST',  },

    });};

  },

};// Provider Bookings API

export const providerBookingsAPI = {

// Provider Bookings API  // Get all bookings for the provider

export const providerBookingsAPI = {  getBookings: async (params = {}) => {

  // Get all bookings for the provider    const queryString = new URLSearchParams(params).toString();

  getBookings: async (params: Record<string, string> = {}) => {    const endpoint = `/provider-bookings/provider${queryString ? `?${queryString}` : ''}`;

    const queryString = new URLSearchParams(params).toString();    return apiRequest(endpoint);

    const endpoint = `/provider-bookings/provider${queryString ? `?${queryString}` : ''}`;  },

    return apiRequest(endpoint);

  },  // Get single booking

  getBooking: async (bookingId) => {

  // Get single booking    return apiRequest(`/provider-bookings/${bookingId}`);

  getBooking: async (bookingId: string) => {  },

    return apiRequest(`/provider-bookings/${bookingId}`);

  },  // Update booking status

  updateBookingStatus: async (bookingId, status, notes = '') => {

  // Update booking status    return apiRequest(`/provider-bookings/${bookingId}/status`, {

  updateBookingStatus: async (bookingId: string, status: string, notes: string = '') => {      method: 'PATCH',

    return apiRequest(`/provider-bookings/${bookingId}/status`, {      body: JSON.stringify({ status, notes }),

      method: 'PATCH',    });

      body: JSON.stringify({ status, notes }),  },

    });

  },  // Add notes to booking

  addBookingNotes: async (bookingId, note, type = 'general') => {

  // Add notes to booking    return apiRequest(`/provider-bookings/${bookingId}/notes`, {

  addBookingNotes: async (bookingId: string, note: string, type: string = 'general') => {      method: 'POST',

    return apiRequest(`/provider-bookings/${bookingId}/notes`, {      body: JSON.stringify({ note, type }),

      method: 'POST',    });

      body: JSON.stringify({ note, type }),  },

    });

  },  // Get booking analytics

  getBookingAnalytics: async (period = '30d') => {

  // Get booking analytics    return apiRequest(`/provider-bookings/analytics/provider?period=${period}`);

  getBookingAnalytics: async (period: string = '30d') => {  },

    return apiRequest(`/provider-bookings/analytics/provider?period=${period}`);

  },  // Reschedule booking

  rescheduleBooking: async (bookingId, scheduledDate, scheduledTime, reason = '') => {

  // Reschedule booking    return apiRequest(`/provider-bookings/${bookingId}/reschedule`, {

  rescheduleBooking: async (bookingId: string, scheduledDate: string, scheduledTime: string, reason: string = '') => {      method: 'PATCH',

    return apiRequest(`/provider-bookings/${bookingId}/reschedule`, {      body: JSON.stringify({ scheduledDate, scheduledTime, reason }),

      method: 'PATCH',    });

      body: JSON.stringify({ scheduledDate, scheduledTime, reason }),  },

    });};

  },

};// File upload API

export const uploadAPI = {

// Error handling utility  // Upload service images

export const handleAPIError = (error: any): string => {  uploadServiceImages: async (files) => {

  console.error('API Error:', error);    const formData = new FormData();

      

  if (error.message.includes('401')) {    if (Array.isArray(files)) {

    // Token expired or invalid      files.forEach((file, index) => {

    localStorage.removeItem('token');        formData.append('images', file);

    window.location.href = '/auth/login';      });

    return 'Your session has expired. Please log in again.';    } else {

  }      formData.append('images', files);

      }

  if (error.message.includes('403')) {

    return 'You do not have permission to perform this action.';    const token = localStorage.getItem('token');

  }    

      return fetch(`${API_BASE_URL}/upload/service-images`, {

  if (error.message.includes('404')) {      method: 'POST',

    return 'The requested resource was not found.';      headers: {

  }        ...(token && { 'Authorization': `Bearer ${token}` }),

        },

  if (error.message.includes('429')) {      body: formData,

    return 'Too many requests. Please try again later.';    }).then(response => {

  }      if (!response.ok) {

          throw new Error(`Upload failed with status: ${response.status}`);

  if (error.message.includes('500')) {      }

    return 'Server error. Please try again later.';      return response.json();

  }    });

    },

  return error.message || 'An unexpected error occurred.';

};  // Upload provider documents

  uploadProviderDocuments: async (files) => {

// Success message utility    const formData = new FormData();

export const getSuccessMessage = (action: string, resource: string = 'item'): string => {    

  const messages: Record<string, string> = {    if (Array.isArray(files)) {

    create: `${resource} created successfully!`,      files.forEach((file, index) => {

    update: `${resource} updated successfully!`,        formData.append('documents', file);

    delete: `${resource} deleted successfully!`,      });

    toggle: `${resource} status updated successfully!`,    } else {

    duplicate: `${resource} duplicated successfully!`,      formData.append('documents', files);

    upload: `Files uploaded successfully!`,    }

    status_update: `Status updated successfully!`,

    reschedule: `Booking rescheduled successfully!`,    const token = localStorage.getItem('token');

    note_added: `Note added successfully!`,    

  };    return fetch(`${API_BASE_URL}/upload/provider-documents`, {

        method: 'POST',

  return messages[action] || 'Operation completed successfully!';      headers: {

};        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    }).then(response => {
      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }
      return response.json();
    });
  },
};

// Notification API (for real-time updates)
export const notificationAPI = {
  // Mark notifications as read
  markAsRead: async (notificationIds) => {
    return apiRequest('/notifications/mark-read', {
      method: 'PATCH',
      body: JSON.stringify({ notificationIds }),
    });
  },

  // Get all notifications
  getNotifications: async (limit = 20, page = 1) => {
    return apiRequest(`/notifications?limit=${limit}&page=${page}`);
  },
};

// Analytics API
export const analyticsAPI = {
  // Get provider dashboard analytics
  getProviderAnalytics: async (period = '30d') => {
    return apiRequest(`/analytics/provider?period=${period}`);
  },

  // Get service performance analytics
  getServicePerformance: async (serviceId, period = '30d') => {
    return apiRequest(`/analytics/service/${serviceId}?period=${period}`);
  },

  // Get revenue analytics
  getRevenueAnalytics: async (period = '30d', groupBy = 'day') => {
    return apiRequest(`/analytics/revenue?period=${period}&groupBy=${groupBy}`);
  },
};

// Error handling utility
export const handleAPIError = (error) => {
  console.error('API Error:', error);
  
  if (error.message.includes('401')) {
    // Token expired or invalid
    localStorage.removeItem('token');
    window.location.href = '/auth/login';
    return 'Your session has expired. Please log in again.';
  }
  
  if (error.message.includes('403')) {
    return 'You do not have permission to perform this action.';
  }
  
  if (error.message.includes('404')) {
    return 'The requested resource was not found.';
  }
  
  if (error.message.includes('429')) {
    return 'Too many requests. Please try again later.';
  }
  
  if (error.message.includes('500')) {
    return 'Server error. Please try again later.';
  }
  
  return error.message || 'An unexpected error occurred.';
};

// Success message utility
export const getSuccessMessage = (action, resource = 'item') => {
  const messages = {
    create: `${resource} created successfully!`,
    update: `${resource} updated successfully!`,
    delete: `${resource} deleted successfully!`,
    toggle: `${resource} status updated successfully!`,
    duplicate: `${resource} duplicated successfully!`,
    upload: `Files uploaded successfully!`,
    status_update: `Status updated successfully!`,
    reschedule: `Booking rescheduled successfully!`,
    note_added: `Note added successfully!`,
  };
  
  return messages[action] || 'Operation completed successfully!';
};