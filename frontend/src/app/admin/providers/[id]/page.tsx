'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import RoleGuard from '@/components/RoleGuard'
import { 
  FaArrowLeft, 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt,
  FaFileAlt,
  FaCheck,
  FaTimes,
  FaEye,
  FaCalendarAlt,
  FaStar,
  FaTools,
  FaEdit
} from 'react-icons/fa'

interface ProviderDetail {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  userType: string
  providerStatus: string
  services: string[]
  createdAt: string
  address?: {
    street?: string
    city?: string
    state?: string
    country?: string
  }
  providerDocuments?: {
    nationalId?: { uploaded: boolean; verified: boolean; url?: string }
    businessLicense?: { uploaded: boolean; verified: boolean; url?: string }
    certificate?: { uploaded: boolean; verified: boolean; url?: string }
  }
  stats?: {
    totalJobs: number
    completedJobs: number
    rating: number
    earnings: number
  }
}

export default function ProviderDetailPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const [provider, setProvider] = useState<ProviderDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchProviderDetails(params.id as string)
    }
  }, [params.id])

  const fetchProviderDetails = async (providerId: string) => {
    try {
      setLoading(true)
      // Use production backend endpoint for provider details
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net';
      const response = await fetch(`${backendUrl}/api/provider/${providerId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        const foundProvider = data.data.provider
        if (foundProvider) {
          // Transform the real data to match our interface
          const transformedProvider: ProviderDetail = {
            _id: foundProvider._id,
            firstName: foundProvider.name?.split(' ')[0] || foundProvider.name,
            lastName: foundProvider.name?.split(' ').slice(1).join(' ') || '',
            email: foundProvider.email,
            phone: foundProvider.phone,
            userType: foundProvider.userType,
            providerStatus: foundProvider.providerStatus || 'pending',
            services: foundProvider.providerProfile?.skills || [],
            createdAt: foundProvider.createdAt,
            address: foundProvider.address || {},
            providerDocuments: foundProvider.providerDocuments || {},
            stats: {
              totalJobs: foundProvider.providerProfile?.completedJobs || 0,
              completedJobs: foundProvider.providerProfile?.completedJobs || 0,
              rating: foundProvider.providerProfile?.rating || 0,
              earnings: 0 // Add real earnings if available
            }
          }
          setProvider(transformedProvider)
        } else {
          setProvider(null)
        }
      } else {
        throw new Error('Failed to fetch provider data')
      }
    } catch (error) {
      console.error('Error fetching provider details:', error)
      alert('Failed to load provider details. Please check if the backend server is running.')
      setProvider(null)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (newStatus: string) => {
    if (!provider) return

    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${provider._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          action: 'updateStatus',
          providerStatus: newStatus,
          notes: `Status updated to ${newStatus} by admin on ${new Date().toLocaleDateString()}`
        })
      })

      if (response.ok) {
        const result = await response.json()
        setProvider(prev => prev ? { ...prev, providerStatus: newStatus } : null)
        alert(result.message || `Provider status updated to ${newStatus}`)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update status')
      }
    } catch (error) {
      console.error('Error updating provider status:', error)
      alert(`Failed to update provider status: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleDocumentVerification = async (documentType: string, verified: boolean) => {
    if (!provider) return

    try {
      const response = await fetch(`http://localhost:5000/api/admin/providers/${provider._id}/documents`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          documentType,
          action: verified ? 'verify' : 'reject',
          notes: `Document ${verified ? 'verified' : 'rejected'} by admin on ${new Date().toLocaleDateString()}`
        })
      })

      if (response.ok) {
        const result = await response.json()
        
        setProvider(prev => {
          if (!prev) return null
          return {
            ...prev,
            providerDocuments: {
              ...prev.providerDocuments,
              [documentType]: {
                ...prev.providerDocuments?.[documentType as keyof typeof prev.providerDocuments],
                verified
              }
            }
          }
        })
        
        alert(result.message || `Document ${verified ? 'verified' : 'rejected'} successfully`)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update document')
      }
    } catch (error) {
      console.error('Error updating document status:', error)
      alert(`Failed to update document: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleViewDocument = async (documentType: string) => {
    if (!provider) return

    try {
      const response = await fetch(`/api/admin/providers/${provider._id}/documents/${documentType}/view`)
      
      if (response.ok) {
        const contentType = response.headers.get('content-type')
        
        if (contentType && contentType.includes('application/json')) {
          // JSON response with URL
          const data = await response.json()
          if (data.url) {
            window.open(data.url, '_blank')
          } else {
            alert('Document URL not available')
          }
        } else {
          // Direct file response - create blob URL and open
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          window.open(url, '_blank')
          
          // Clean up the blob URL after a delay
          setTimeout(() => window.URL.revokeObjectURL(url), 1000)
        }
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to load document')
      }
    } catch (error) {
      console.error('Error viewing document:', error)
      alert(`Failed to view document: ${error instanceof Error ? error.message : 'Unknown error'}`)
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

  if (!provider) {
    return (
      <RoleGuard requiredRole="admin">
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Provider Not Found</h1>
            <button
              onClick={() => router.back()}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
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
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.back()}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                  <FaArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Provider Details</h1>
                  <p className="text-gray-600">{provider.firstName} {provider.lastName}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Edit Button */}
                <button
                  onClick={() => router.push(`/admin/providers/${provider._id}/edit`)}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
                >
                  <FaEdit className="h-4 w-4" />
                  <span>Edit Provider</span>
                </button>
                
                {/* Status Badge */}
                <span className={`px-4 py-2 text-sm font-medium rounded-full border ${
                  provider.providerStatus === 'verified' ? 'bg-green-100 text-green-800 border-green-200' :
                  provider.providerStatus === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                  provider.providerStatus === 'under_review' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                  'bg-red-100 text-red-800 border-red-200'
                }`}>
                  {provider.providerStatus.charAt(0).toUpperCase() + provider.providerStatus.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Provider Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <FaUser className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium">{provider.firstName} {provider.lastName}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FaEnvelope className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{provider.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FaPhone className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{provider.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FaCalendarAlt className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Registered</p>
                      <p className="font-medium">{new Date(provider.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Services */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Services Offered</h2>
                <div className="flex flex-wrap gap-2">
                  {provider.services.map((service, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {service}
                    </span>
                  ))}
                </div>
              </div>

              {/* Documents */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Verification Documents</h2>
                <div className="space-y-4">
                  {provider.providerDocuments && Object.entries(provider.providerDocuments).map(([type, doc]) => (
                    <div key={type} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FaFileAlt className="text-gray-400" />
                          <div>
                            <p className="font-medium capitalize">{type.replace(/([A-Z])/g, ' $1')}</p>
                            <p className="text-sm text-gray-600">
                              {doc.uploaded ? 'Uploaded' : 'Not uploaded'} • 
                              {doc.verified ? ' Verified' : ' Pending verification'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {doc.uploaded && (
                            <button
                              onClick={() => handleViewDocument(type)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                              title="View Document"
                            >
                              <FaEye className="h-4 w-4" />
                            </button>
                          )}
                          {doc.uploaded && !doc.verified && (
                            <>
                              <button
                                onClick={() => handleDocumentVerification(type, true)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-md"
                                title="Verify Document"
                              >
                                <FaCheck className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDocumentVerification(type, false)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                                title="Reject Document"
                              >
                                <FaTimes className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Stats */}
              {provider.stats && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Statistics</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Jobs</span>
                      <span className="font-medium">{provider.stats.totalJobs}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Completed</span>
                      <span className="font-medium">{provider.stats.completedJobs}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Rating</span>
                      <div className="flex items-center space-x-1">
                        <FaStar className="text-yellow-400 h-4 w-4" />
                        <span className="font-medium">{provider.stats.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Earnings</span>
                      <span className="font-medium">KSh {provider.stats.earnings.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Actions</h2>
                <div className="space-y-3">
                  {provider.providerStatus === 'under_review' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate('verified')}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 flex items-center justify-center space-x-2"
                      >
                        <FaCheck className="h-4 w-4" />
                        <span>Approve Provider</span>
                      </button>
                      <button
                        onClick={() => handleStatusUpdate('rejected')}
                        className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 flex items-center justify-center space-x-2"
                      >
                        <FaTimes className="h-4 w-4" />
                        <span>Reject Provider</span>
                      </button>
                    </>
                  )}
                  {provider.providerStatus === 'verified' && (
                    <button
                      onClick={() => handleStatusUpdate('suspended')}
                      className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700"
                    >
                      Suspend Provider
                    </button>
                  )}
                  {provider.providerStatus === 'suspended' && (
                    <button
                      onClick={() => handleStatusUpdate('verified')}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                    >
                      Reactivate Provider
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  )
}
