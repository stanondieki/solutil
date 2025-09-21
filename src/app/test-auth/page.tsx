'use client'

import { useAuth } from '@/contexts/AuthContext';
import { RoleManager } from '@/lib/roles';
import RoleGuard from '@/components/RoleGuard';

export default function AuthenticationTest() {
  const { user, isAuthenticated, login, logout, refreshToken } = useAuth();

  const testUser = {
    email: 'test@example.com',
    password: 'password123'
  };

  const handleTestLogin = async () => {
    try {
      await login(testUser.email, testUser.password);
    } catch (error) {
      console.error('Test login failed:', error);
    }
  };

  const handleTestLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Test logout failed:', error);
    }
  };

  const handleTestRefresh = async () => {
    try {
      await refreshToken();
    } catch (error) {
      console.error('Test token refresh failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Authentication System Test</h1>
          
          {/* Authentication Status */}
          <div className="mb-8 p-4 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Status:</span>{' '}
                <span className={`px-2 py-1 rounded-full text-sm ${
                  isAuthenticated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                </span>
              </div>
              {user && (
                <>
                  <div>
                    <span className="font-medium">User:</span> {user.name} ({user.email})
                  </div>
                  <div>
                    <span className="font-medium">Role:</span>{' '}
                    <span className={`px-2 py-1 rounded-full text-sm ${RoleManager.getRoleColor(user.userType)}`}>
                      {RoleManager.getRoleDisplayName(user.userType)}
                    </span>
                  </div>
                  {user.userType === 'provider' && user.providerStatus && (
                    <div>
                      <span className="font-medium">Provider Status:</span>{' '}
                      <span className={`px-2 py-1 rounded-full text-sm border ${
                        RoleManager.getProviderStatusConfig(user.providerStatus).color
                      }`}>
                        {RoleManager.getProviderStatusConfig(user.providerStatus).icon} {RoleManager.getProviderStatusConfig(user.providerStatus).label}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Test Controls */}
          <div className="mb-8 p-4 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
            <div className="flex flex-wrap gap-4">
              {!isAuthenticated ? (
                <button
                  onClick={handleTestLogin}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Test Login
                </button>
              ) : (
                <>
                  <button
                    onClick={handleTestLogout}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                  >
                    Test Logout
                  </button>
                  <button
                    onClick={handleTestRefresh}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  >
                    Test Token Refresh
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Role-based Navigation */}
          {user && (
            <div className="mb-8 p-4 border rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Role-based Navigation</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {RoleManager.getNavigationItems(user.userType, user.providerStatus).map((item) => (
                  <div key={item.href} className="p-3 bg-gray-50 rounded-md">
                    <span className="font-medium">{item.label}</span>
                    <div className="text-sm text-gray-600">{item.href}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Permissions Test */}
          {user && (
            <div className="mb-8 p-4 border rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Permissions Test</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries({
                  'View Bookings': RoleManager.hasPermission(user.userType, 'canViewBookings'),
                  'Create Bookings': RoleManager.hasPermission(user.userType, 'canCreateBookings'),
                  'Manage Services': RoleManager.hasPermission(user.userType, 'canManageServices'),
                  'Access Admin Panel': RoleManager.hasPermission(user.userType, 'canAccessAdminPanel'),
                  'Upload Documents': RoleManager.hasPermission(user.userType, 'canUploadDocuments'),
                  'View Reports': RoleManager.hasPermission(user.userType, 'canViewReports'),
                }).map(([permission, hasAccess]) => (
                  <div key={permission} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">{permission}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      hasAccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {hasAccess ? '✓' : '✗'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Role Guards Demo */}
          <div className="mb-8 p-4 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Role Guards Demo</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium mb-2">Admin Only Content</h3>
                <RoleGuard requiredRole="admin" showAccessDenied={true}>
                  <div className="text-green-600">✓ This content is only visible to admins</div>
                </RoleGuard>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium mb-2">Provider Only Content</h3>
                <RoleGuard requiredRole="provider" showAccessDenied={true}>
                  <div className="text-green-600">✓ This content is only visible to providers</div>
                </RoleGuard>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <h3 className="font-medium mb-2">Client Only Content</h3>
                <RoleGuard requiredRole="client" showAccessDenied={true}>
                  <div className="text-green-600">✓ This content is only visible to clients</div>
                </RoleGuard>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-medium mb-2">Service Management Permission</h3>
                <RoleGuard requiredPermission="canManageServices" showAccessDenied={true}>
                  <div className="text-green-600">✓ This content requires service management permission</div>
                </RoleGuard>
              </div>
            </div>
          </div>

          {/* Test Instructions */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Test Instructions</h2>
            <div className="text-sm text-gray-600 space-y-2">
              <p>1. Try logging in with different user types to see how the interface changes</p>
              <p>2. Check the role-based navigation items</p>
              <p>3. Verify that role guards show/hide content appropriately</p>
              <p>4. Test the token refresh functionality</p>
              <p>5. Check provider status display for provider accounts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
