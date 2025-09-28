'use client'

import { useAuth } from '@/contexts/AuthContext';
import { RoleManager, UserRole, Permission } from '@/lib/roles';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface RoleGuardProps {
  children: ReactNode;
  requiredPermission?: keyof Permission;
  requiredRole?: UserRole;
  fallbackRoute?: string;
  showAccessDenied?: boolean;
}

export default function RoleGuard({
  children,
  requiredPermission,
  requiredRole,
  fallbackRoute = '/dashboard',
  showAccessDenied = false
}: RoleGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      router.push('/auth/login');
      return;
    }

    // Check role-based access
    if (requiredRole && user.userType !== requiredRole) {
      router.push(fallbackRoute);
      return;
    }

    // Check permission-based access
    if (requiredPermission && !RoleManager.hasPermission(user.userType, requiredPermission)) {
      router.push(fallbackRoute);
      return;
    }
  }, [user, isAuthenticated, isLoading, requiredRole, requiredPermission, router, fallbackRoute]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show access denied if configured
  if (showAccessDenied && (!isAuthenticated || !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Check if user has required permissions
  if (isAuthenticated && user) {
    const hasRoleAccess = !requiredRole || user.userType === requiredRole;
    const hasPermissionAccess = !requiredPermission || RoleManager.hasPermission(user.userType, requiredPermission);

    if (hasRoleAccess && hasPermissionAccess) {
      return <>{children}</>;
    }
  }

  return null;
}

// Specific role guards for convenience
export function AdminGuard({ children, fallbackRoute = '/dashboard' }: { children: ReactNode; fallbackRoute?: string }) {
  return (
    <RoleGuard requiredRole="admin" fallbackRoute={fallbackRoute}>
      {children}
    </RoleGuard>
  );
}

export function ProviderGuard({ children, fallbackRoute = '/dashboard' }: { children: ReactNode; fallbackRoute?: string }) {
  return (
    <RoleGuard requiredRole="provider" fallbackRoute={fallbackRoute}>
      {children}
    </RoleGuard>
  );
}

export function ClientGuard({ children, fallbackRoute = '/dashboard' }: { children: ReactNode; fallbackRoute?: string }) {
  return (
    <RoleGuard requiredRole="client" fallbackRoute={fallbackRoute}>
      {children}
    </RoleGuard>
  );
}
