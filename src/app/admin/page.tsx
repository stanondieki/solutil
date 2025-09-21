'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import RoleGuard from '@/components/RoleGuard'
import { 
  FaUsers, 
  FaUserTie, 
  FaClipboardList, 
  FaDollarSign, 
  FaChartLine,
  FaEye,
  FaCheck,
  FaTimes,
  FaClock,
  FaSearch,
  FaFilter
} from 'react-icons/fa'

interface DashboardStats {
  totalUsers: number
  totalProviders: number
  pendingVerifications: number
  totalBookings: number
  totalRevenue: number
  monthlyGrowth: number
}

interface ProviderData {
  _id: string
  firstName: string
  lastName: string
  email: string
  userType: string
  providerStatus: string
  services: string[]
  createdAt: string
  providerDocuments?: {
    nationalId?: { uploaded: boolean; verified: boolean }
    businessLicense?: { uploaded: boolean; verified: boolean }
    certificate?: { uploaded: boolean; verified: boolean }
  }
}

export default function AdminPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProviders: 0,
    pendingVerifications: 0,
    totalBookings: 0,
    totalRevenue: 0,
    monthlyGrowth: 0
  })
  const [providers, setProviders] = useState<ProviderData[]>([])
  const [filteredProviders, setFilteredProviders] = useState<ProviderData[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    filterProviders()
  }, [providers, searchTerm, statusFilter])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch real dashboard statistics
      const statsResponse = await fetch('/api/admin/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })

      // Fetch real providers data  
      const providersResponse = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })

      if (statsResponse.ok && providersResponse.ok) {
        const statsData = await statsResponse.json()
        const providersData = await providersResponse.json()

        // Update stats with real data
        setStats({
          totalUsers: statsData.data.totalUsers,
          totalProviders: statsData.data.totalProviders,
          pendingVerifications: statsData.data.pendingVerifications,
          totalBookings: statsData.data.totalBookings,
          totalRevenue: statsData.data.totalRevenue,
          monthlyGrowth: statsData.data.monthlyGrowth
        })

        // Transform real provider data to match component interface
        const transformedProviders = providersData.data.providers.map((provider: any) => ({
          _id: provider._id,
          firstName: provider.name.split(' ')[0] || provider.name,
          lastName: provider.name.split(' ').slice(1).join(' ') || '',
          email: provider.email,
          userType: provider.userType,
          providerStatus: provider.providerStatus || 'pending',
          services: provider.services || [],
          createdAt: provider.createdAt,
          providerDocuments: provider.providerDocuments || {}
        }))

        setProviders(transformedProviders)
      } else {
        throw new Error('Failed to fetch data from server')
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Show error message but don't break the UI
      alert('Failed to load live data. Please check if the backend server is running.')
      
      // Set empty/default values instead of mock data
      setStats({
        totalUsers: 0,
        totalProviders: 0,
        pendingVerifications: 0,
        totalBookings: 0,
        totalRevenue: 0,
        monthlyGrowth: 0
      })
      setProviders([])
    } finally {
      setLoading(false)
    }
  }

  const filterProviders = () => {
    let filtered = providers

    if (searchTerm) {
      filtered = filtered.filter(provider =>
        provider.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(provider => provider.providerStatus === statusFilter)
    }

    setFilteredProviders(filtered)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full border border-green-200">
          <FaCheck className="inline mr-1" /> Verified
        </span>
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full border border-yellow-200">
          <FaClock className="inline mr-1" /> Pending
        </span>
      case 'under_review':
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full border border-blue-200">
          <FaEye className="inline mr-1" /> Under Review
        </span>
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full border border-red-200">
          <FaTimes className="inline mr-1" /> Rejected
        </span>
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full border border-gray-200">
          Unknown
        </span>
    }
  }

  const handleProviderAction = async (providerId: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch(`/api/admin/users/${providerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          action,
          notes: `Provider ${action === 'approve' ? 'approved' : 'rejected'} by admin on ${new Date().toLocaleDateString()}`
        })
      })

      if (response.ok) {
        const result = await response.json()
        
        // Update local state
        setProviders(prev => prev.map(provider =>
          provider._id === providerId
            ? { ...provider, providerStatus: action === 'approve' ? 'verified' : 'rejected' }
            : provider
        ))
        
        // Update stats to reflect the change
        setStats(prev => ({
          ...prev,
          pendingVerifications: Math.max(0, prev.pendingVerifications - 1)
        }))
        
        // Show success message
        alert(result.message || `Provider ${action === 'approve' ? 'approved' : 'rejected'} successfully!`)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update provider status')
      }
    } catch (error) {
      console.error(`Error ${action}ing provider:`, error)
      alert(`Failed to ${action} provider: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  if (loading) {
    return (
      <RoleGuard requiredRole="admin">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </RoleGuard>
    )
  }

  return (
    <RoleGuard requiredRole="admin">
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user?.name}</p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="px-3 py-1 text-sm font-medium bg-purple-100 text-purple-800 rounded-full border border-purple-200">
                  Admin
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FaUsers className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <FaUserTie className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Providers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProviders}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <FaClock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingVerifications}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FaClipboardList className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <FaDollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">KSh {stats.totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FaChartLine className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Growth</p>
                  <p className="text-2xl font-bold text-gray-900">+{stats.monthlyGrowth}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Provider Management */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Provider Management</h2>
                <div className="flex items-center space-x-4">
                  {/* Search */}
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search providers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  {/* Filter */}
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="under_review">Under Review</option>
                      <option value="verified">Verified</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Provider
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Services
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Documents
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registration Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProviders.map((provider) => (
                    <tr key={provider._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {provider.firstName} {provider.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{provider.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {provider.services.map((service, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                            >
                              {service}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(provider.providerStatus)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-1">
                          {provider.providerDocuments?.nationalId?.uploaded && (
                            <span className={`w-2 h-2 rounded-full ${
                              provider.providerDocuments.nationalId.verified ? 'bg-green-500' : 'bg-yellow-500'
                            }`} title="National ID" />
                          )}
                          {provider.providerDocuments?.businessLicense?.uploaded && (
                            <span className={`w-2 h-2 rounded-full ${
                              provider.providerDocuments.businessLicense.verified ? 'bg-green-500' : 'bg-yellow-500'
                            }`} title="Business License" />
                          )}
                          {provider.providerDocuments?.certificate?.uploaded && (
                            <span className={`w-2 h-2 rounded-full ${
                              provider.providerDocuments.certificate.verified ? 'bg-green-500' : 'bg-yellow-500'
                            }`} title="Certificate" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(provider.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => router.push(`/admin/providers/${provider._id}`)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <FaEye className="h-4 w-4" />
                          </button>
                          {provider.providerStatus === 'under_review' && (
                            <>
                              <button
                                onClick={() => handleProviderAction(provider._id, 'approve')}
                                className="text-green-600 hover:text-green-900"
                              >
                                <FaCheck className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleProviderAction(provider._id, 'reject')}
                                className="text-red-600 hover:text-red-900"
                              >
                                <FaTimes className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  )
}
