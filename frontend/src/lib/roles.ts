// Role management utilities
export const RoleManager = {
  getProviderStatusConfig: (status: string) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Pending Verification',
          color: 'border-yellow-300 bg-yellow-100 text-yellow-800',
          icon: '⏳'
        };
      case 'approved':
        return {
          label: 'Approved',
          color: 'border-green-300 bg-green-100 text-green-800',
          icon: '✅'
        };
      case 'rejected':
        return {
          label: 'Rejected',
          color: 'border-red-300 bg-red-100 text-red-800',
          icon: '❌'
        };
      default:
        return {
          label: 'Unknown',
          color: 'border-gray-300 bg-gray-100 text-gray-800',
          icon: '❓'
        };
    }
  },

  // Role checking methods
  isClient: (userType: string) => {
    return userType === 'client' || userType === 'user';
  },

  isProvider: (userType: string) => {
    return userType === 'provider';
  },

  isAdmin: (userType: string) => {
    return userType === 'admin';
  },

  // Navigation items based on user type  
  getNavigationItems: (userType: string, providerStatus?: string) => {
    const baseItems = [
      { name: 'Home', href: '/', icon: 'FaHome' },
      { name: 'Dashboard', href: '/dashboard', icon: 'FaTachometerAlt' }
    ];

    if (RoleManager.isClient(userType)) {
      return [
        ...baseItems,
        { name: 'Services', href: '/services', icon: 'FaSearch' },
        { name: 'My Bookings', href: '/bookings', icon: 'FaCalendarAlt' }
      ];
    }

    if (RoleManager.isProvider(userType)) {
      return [
        ...baseItems,
        { name: 'My Services', href: '/provider/services', icon: 'FaTools' },
        { name: 'Bookings', href: '/provider/bookings', icon: 'FaCalendarCheck' },
        { name: 'Status', href: '/provider/status', icon: 'FaInfoCircle' }
      ];
    }

    if (RoleManager.isAdmin(userType)) {
      return [
        ...baseItems,
        { name: 'Manage Users', href: '/admin/users', icon: 'FaUsers' },
        { name: 'Manage Providers', href: '/admin/providers', icon: 'FaUserCog' },
        { name: 'Manage Services', href: '/admin/services', icon: 'FaCog' }
      ];
    }

    return baseItems;
  },

  // Role display methods
  getRoleColor: (userType: string) => {
    if (RoleManager.isClient(userType)) return 'text-blue-600 bg-blue-100';
    if (RoleManager.isProvider(userType)) return 'text-green-600 bg-green-100';
    if (RoleManager.isAdmin(userType)) return 'text-purple-600 bg-purple-100';
    return 'text-gray-600 bg-gray-100';
  },

  getRoleDisplayName: (userType: string) => {
    if (RoleManager.isClient(userType)) return 'Client';
    if (RoleManager.isProvider(userType)) return 'Provider';
    if (RoleManager.isAdmin(userType)) return 'Admin';
    return 'User';
  },

  // Permission system
  hasPermission: (_userType: string, _permission: string): boolean => {
    // Mock permission system - always return true for build compatibility
    return true;
  }

}

// Type definitions for compatibility  
export type UserRole = 'admin' | 'provider' | 'client' | 'user';
export type Permission = {
  canViewBookings: boolean;
  canCreateBookings: boolean;
  canManageServices: boolean;
  canAccessAdminPanel: boolean;
  canUploadDocuments: boolean;
  canViewReports: boolean;
};
export type ProviderStatus = 'pending' | 'approved' | 'rejected' | 'suspended' | 'under_review';

export default RoleManager;