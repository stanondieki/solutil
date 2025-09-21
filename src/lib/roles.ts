/**
 * Role-based access control system
 * Defines permissions and access levels for different user types
 */

export type UserRole = 'client' | 'provider' | 'admin';
export type ProviderStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'suspended';

// Define permissions for each role
export interface Permission {
  canViewBookings: boolean;
  canCreateBookings: boolean;
  canManageBookings: boolean;
  canViewServices: boolean;
  canCreateServices: boolean;
  canManageServices: boolean;
  canViewUsers: boolean;
  canManageUsers: boolean;
  canViewProviders: boolean;
  canManageProviders: boolean;
  canViewReports: boolean;
  canManageReports: boolean;
  canViewPayments: boolean;
  canManagePayments: boolean;
  canAccessAdminPanel: boolean;
  canUploadDocuments: boolean;
  canViewProfile: boolean;
  canEditProfile: boolean;
}

// Role permissions configuration
export const rolePermissions: Record<UserRole, Permission> = {
  client: {
    canViewBookings: true,
    canCreateBookings: true,
    canManageBookings: true, // Only their own bookings
    canViewServices: true,
    canCreateServices: false,
    canManageServices: false,
    canViewUsers: false,
    canManageUsers: false,
    canViewProviders: true, // Can view provider profiles
    canManageProviders: false,
    canViewReports: false,
    canManageReports: false,
    canViewPayments: true, // Only their own payments
    canManagePayments: false,
    canAccessAdminPanel: false,
    canUploadDocuments: false,
    canViewProfile: true,
    canEditProfile: true,
  },
  provider: {
    canViewBookings: true, // Only bookings for their services
    canCreateBookings: false,
    canManageBookings: true, // Only bookings for their services
    canViewServices: true,
    canCreateServices: true,
    canManageServices: true, // Only their own services
    canViewUsers: false,
    canManageUsers: false,
    canViewProviders: false,
    canManageProviders: false,
    canViewReports: true, // Only their own reports/analytics
    canManageReports: false,
    canViewPayments: true, // Only their own payments
    canManagePayments: false,
    canAccessAdminPanel: false,
    canUploadDocuments: true,
    canViewProfile: true,
    canEditProfile: true,
  },
  admin: {
    canViewBookings: true,
    canCreateBookings: true,
    canManageBookings: true,
    canViewServices: true,
    canCreateServices: true,
    canManageServices: true,
    canViewUsers: true,
    canManageUsers: true,
    canViewProviders: true,
    canManageProviders: true,
    canViewReports: true,
    canManageReports: true,
    canViewPayments: true,
    canManagePayments: true,
    canAccessAdminPanel: true,
    canUploadDocuments: true,
    canViewProfile: true,
    canEditProfile: true,
  },
};

// Helper functions for role checking
export class RoleManager {
  static hasPermission(role: UserRole, permission: keyof Permission): boolean {
    return rolePermissions[role][permission];
  }

  static canAccessBookings(role: UserRole): boolean {
    return this.hasPermission(role, 'canViewBookings');
  }

  static canCreateBookings(role: UserRole): boolean {
    return this.hasPermission(role, 'canCreateBookings');
  }

  static canManageServices(role: UserRole): boolean {
    return this.hasPermission(role, 'canManageServices');
  }

  static canAccessAdminPanel(role: UserRole): boolean {
    return this.hasPermission(role, 'canAccessAdminPanel');
  }

  static canUploadDocuments(role: UserRole): boolean {
    return this.hasPermission(role, 'canUploadDocuments');
  }

  static isProvider(role: UserRole): boolean {
    return role === 'provider';
  }

  static isClient(role: UserRole): boolean {
    return role === 'client';
  }

  static isAdmin(role: UserRole): boolean {
    return role === 'admin';
  }

  // Provider status checks
  static isProviderApproved(status?: ProviderStatus): boolean {
    return status === 'approved';
  }

  static isProviderPending(status?: ProviderStatus): boolean {
    return status === 'pending' || status === 'under_review';
  }

  static isProviderRejected(status?: ProviderStatus): boolean {
    return status === 'rejected' || status === 'suspended';
  }

  static canProviderReceiveBookings(status?: ProviderStatus): boolean {
    return this.isProviderApproved(status);
  }

  // Route access control
  static getAccessibleRoutes(role: UserRole): string[] {
    const baseRoutes = ['/profile', '/dashboard'];
    
    switch (role) {
      case 'client':
        return [...baseRoutes, '/services', '/booking', '/bookings'];
      case 'provider':
        return [...baseRoutes, '/services', '/bookings', '/upload-documents'];
      case 'admin':
        return [...baseRoutes, '/admin', '/services', '/bookings', '/users', '/providers'];
      default:
        return baseRoutes;
    }
  }

  // Navigation menu items based on role
  static getNavigationItems(role: UserRole, providerStatus?: ProviderStatus) {
    const items = [
      { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
      { label: 'Profile', href: '/profile', icon: 'user' },
    ];

    switch (role) {
      case 'client':
        items.push(
          { label: 'Services', href: '/services', icon: 'services' },
          { label: 'My Bookings', href: '/bookings', icon: 'bookings' }
        );
        break;
        
      case 'provider':
        items.push(
          { label: 'My Services', href: '/services', icon: 'services' },
          { label: 'Bookings', href: '/bookings', icon: 'bookings' }
        );
        
        if (!this.isProviderApproved(providerStatus)) {
          items.push(
            { label: 'Upload Documents', href: '/upload-documents', icon: 'upload' }
          );
        }
        break;
        
      case 'admin':
        items.push(
          { label: 'Admin Panel', href: '/admin', icon: 'admin' },
          { label: 'Users', href: '/admin/users', icon: 'users' },
          { label: 'Providers', href: '/admin/providers', icon: 'providers' },
          { label: 'Services', href: '/admin/services', icon: 'services' },
          { label: 'Bookings', href: '/admin/bookings', icon: 'bookings' },
          { label: 'Reports', href: '/admin/reports', icon: 'reports' }
        );
        break;
    }

    return items;
  }

  // Status badges and colors
  static getProviderStatusConfig(status?: ProviderStatus) {
    switch (status) {
      case 'approved':
        return {
          label: 'Verified',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: '✓'
        };
      case 'pending':
        return {
          label: 'Pending Review',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: '⏳'
        };
      case 'under_review':
        return {
          label: 'Under Review',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: '👁️'
        };
      case 'rejected':
        return {
          label: 'Rejected',
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: '✗'
        };
      case 'suspended':
        return {
          label: 'Suspended',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: '⏸️'
        };
      default:
        return {
          label: 'Unknown',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: '?'
        };
    }
  }

  // Role display helpers
  static getRoleDisplayName(role: UserRole): string {
    switch (role) {
      case 'client':
        return 'Client';
      case 'provider':
        return 'Service Provider';
      case 'admin':
        return 'Administrator';
      default:
        return 'User';
    }
  }

  static getRoleColor(role: UserRole): string {
    switch (role) {
      case 'client':
        return 'bg-blue-100 text-blue-800';
      case 'provider':
        return 'bg-green-100 text-green-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}

// Hook for role-based conditional rendering
export const useRoleAccess = (role: UserRole, permission: keyof Permission) => {
  return RoleManager.hasPermission(role, permission);
};

export default RoleManager;
