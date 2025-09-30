'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AdminLayout from '../../../components/AdminLayout'
import DocumentViewer from '../../../components/admin/DocumentViewer'
import type { ServiceProvider, RawProvider, ProviderVerification } from '../../../types/admin'

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<ServiceProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterService, setFilterService] = useState<string>('all')
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showDocumentViewer, setShowDocumentViewer] = useState(false)
  const [documentViewerProviderId, setDocumentViewerProviderId] = useState<string | null>(null)

  useEffect(() => {
    fetchProviders()
  }, [])

  const fetchProviders = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      // Use frontend API route which forwards to backend
      const response = await fetch('/api/admin/providers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        // Map backend provider data to frontend format
        const providers = data.users || data.data?.users || []
        const mappedProviders = providers.filter((p: RawProvider) => p.userType === 'provider').map((p: RawProvider): ServiceProvider => ({
          id: p._id,
          name: p.name,
          email: p.email,
          phone: p.phone,
          services: p.providerProfile?.skills || [],
          rating: p.providerProfile?.rating || 0,
          totalJobs: p.providerProfile?.completedJobs || 0,
          status: (p.providerStatus as ServiceProvider['status']) || 'pending',
          joinDate: p.createdAt || new Date().toISOString(),
          location: p.address?.city ? `${p.address.city}, ${p.address.country || 'Kenya'}` : '',
          experience: p.providerProfile?.experience || '',
          hourlyRate: p.providerProfile?.hourlyRate || 0,
          bio: p.providerProfile?.bio || '',
          availability: p.providerProfile?.availability || { days: [], hours: { start: '', end: '' } },
          serviceAreas: p.providerProfile?.serviceAreas || [],
          documents: {
            nationalId: p.providerDocuments?.nationalId || { uploaded: null, verified: false },
            businessLicense: p.providerDocuments?.businessLicense || { uploaded: null, verified: false },
            certificate: p.providerDocuments?.certificate || { uploaded: null, verified: false },
            goodConductCertificate: p.providerDocuments?.goodConductCertificate || { uploaded: null, verified: false }
          },
          verification: {
            idVerified: p.providerDocuments?.nationalId?.verified || false,
            businessVerified: p.providerDocuments?.businessLicense?.verified || false,
            certificateVerified: p.providerDocuments?.certificate?.verified || false,
            goodConductVerified: p.providerDocuments?.goodConductCertificate?.verified || false,
            phoneVerified: !!p.phone,
            emailVerified: p.isVerified || false
          }
        }))
        setProviders(mappedProviders)
      } else {
        const errorData = await response.json()
        console.error('Failed to fetch providers:', errorData.message || response.statusText)
        setProviders([])
      }
    } catch (error) {
      console.error('Error fetching providers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (providerId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('adminToken')
      console.log(`Updating provider ${providerId} status to ${newStatus}`)
      
      const response = await fetch(`/api/admin/providers/${providerId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('Provider status update result:', result)
        
        // Update local state
        setProviders(providers.map(provider => 
          provider.id === providerId ? { ...provider, status: newStatus as ServiceProvider['status'] } : provider
        ))
        
        // Optionally refresh the data
        await fetchProviders()
      } else {
        throw new Error(`Failed to update provider status: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Error updating provider status:', error)
      alert('Failed to update provider status. Please try again.')
    }
  }

  const handleDocumentVerification = async (providerId: string, documentType: string, isVerified: boolean) => {
    try {
      const token = localStorage.getItem('adminToken')
      
      const response = await fetch(`/api/admin/providers/${providerId}/documents/${documentType}/verify`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ verified: isVerified })
      })
      
      if (response.ok) {
        // Refresh the data to get updated verification status
        await fetchProviders()
      } else {
        throw new Error(`Failed to verify document: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Error verifying document:', error)
      alert('Failed to verify document. Please try again.')
    }
  }

  const openProviderDetails = (provider: ServiceProvider) => {
    setSelectedProvider(provider)
    setShowDetailsModal(true)
  }

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.services.some(service => 
                           service.toLowerCase().includes(searchTerm.toLowerCase())
                         )
    const matchesStatus = filterStatus === 'all' || provider.status === filterStatus
    const matchesService = filterService === 'all' || 
                          provider.services.some(service => service === filterService)
    
    return matchesSearch && matchesStatus && matchesService
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getVerificationScore = (verification: ProviderVerification) => {
    // Focus on document verification (4 documents) + email verification
    const documentVerifications = [
      verification.idVerified,
      verification.businessVerified,
      verification.certificateVerified,
      verification.goodConductVerified,
      verification.emailVerified
    ]
    const verified = documentVerifications.filter(Boolean).length
    return Math.round((verified / documentVerifications.length) * 100)
  }

  const allServices = [...new Set(providers.flatMap(p => p.services))]

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Service Provider Management</h1>
            <p className="text-gray-400 mt-1">Approve and manage service providers</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{providers.length}</p>
            <p className="text-gray-400 text-sm">Total Providers</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { title: 'Pending Approval', count: providers.filter(p => p.status === 'pending').length, color: 'bg-yellow-500' },
            { title: 'Approved', count: providers.filter(p => p.status === 'approved').length, color: 'bg-green-500' },
            { title: 'Suspended', count: providers.filter(p => p.status === 'suspended').length, color: 'bg-red-500' },
            { title: 'Total Jobs', count: providers.reduce((sum, p) => sum + p.totalJobs, 0), color: 'bg-blue-500' }
          ].map((stat, index) => (
            <div key={stat.title} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold text-white">{stat.count}</p>
                </div>
                <div className={`p-2 rounded-full ${stat.color}`}>
                  <div className="w-4 h-4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Search Providers</label>
              <input
                type="text"
                placeholder="Search by name, email, or service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Filter by Service</label>
              <select
                value={filterService}
                onChange={(e) => setFilterService(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Services</option>
                {allServices.map(service => (
                  <option key={service} value={service}>{service}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Providers Table */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Provider</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Services</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Verification</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Jobs</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredProviders.map((provider, index) => (
                  <motion.tr
                    key={provider.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {provider.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{provider.name}</div>
                          <div className="text-sm text-gray-400">{provider.location}</div>
                          <div className="text-xs text-gray-500">{provider.experience} experience</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {provider.services.map(service => (
                          <span key={service} className="inline-flex px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                            {service}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {provider.rating > 0 ? (
                        <div className="flex items-center">
                          <span className="text-white">{provider.rating}</span>
                          <svg className="w-4 h-4 text-yellow-400 ml-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                      ) : (
                        <span className="text-gray-400">No reviews</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(provider.status)}`}>
                        {provider.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-white text-sm">{getVerificationScore(provider.verification)}%</span>
                        <div className="ml-2 w-16 bg-gray-600 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${getVerificationScore(provider.verification)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {provider.totalJobs}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {provider.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(provider.id, 'approved')}
                              className="text-green-400 hover:text-green-300 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusChange(provider.id, 'suspended')}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {provider.status === 'approved' && (
                          <button
                            onClick={() => handleStatusChange(provider.id, 'suspended')}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            Suspend
                          </button>
                        )}
                        {provider.status === 'suspended' && (
                          <button
                            onClick={() => handleStatusChange(provider.id, 'approved')}
                            className="text-green-400 hover:text-green-300 transition-colors"
                          >
                            Reactivate
                          </button>
                        )}
                        <button 
                          onClick={() => openProviderDetails(provider)}
                          className="text-blue-400 hover:text-blue-300 transition-colors mr-3"
                        >
                          Review Details
                        </button>
                        <button 
                          onClick={() => {
                            setDocumentViewerProviderId(provider.id)
                            setShowDocumentViewer(true)
                          }}
                          className="text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          View Documents
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredProviders.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">No providers found matching your criteria</div>
          </div>
        )}

        {/* Provider Details Modal */}
        {showDetailsModal && selectedProvider && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-700">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">Provider Review</h2>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Provider Basic Info */}
                <div className="bg-gray-900 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Provider Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">Name</p>
                      <p className="text-white font-medium">{selectedProvider.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Email</p>
                      <p className="text-white font-medium">{selectedProvider.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Phone</p>
                      <p className="text-white font-medium">{selectedProvider.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Experience</p>
                      <p className="text-white font-medium">{selectedProvider.experience || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Hourly Rate</p>
                      <p className="text-white font-medium">KES {selectedProvider.hourlyRate || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Status</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedProvider.status)}`}>
                        {selectedProvider.status}
                      </span>
                    </div>
                  </div>
                  
                  {selectedProvider.bio && (
                    <div className="mt-4">
                      <p className="text-gray-400 text-sm">Bio</p>
                      <p className="text-white">{selectedProvider.bio}</p>
                    </div>
                  )}
                  
                  <div className="mt-4">
                    <p className="text-gray-400 text-sm">Skills</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedProvider.services.map((service, index) => (
                        <span key={index} className="bg-blue-600 text-white px-2 py-1 rounded text-sm">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-gray-400 text-sm">Service Areas</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedProvider.serviceAreas.map((area, index) => (
                        <span key={index} className="bg-green-600 text-white px-2 py-1 rounded text-sm">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Document Verification */}
                <div className="bg-gray-900 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Document Verification</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(selectedProvider.documents).map(([docType, docInfo]) => (
                      <div key={docType} className="border border-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-white font-medium capitalize">
                            {docType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </h4>
                          <span className={`px-2 py-1 rounded text-xs ${
                            docInfo.verified 
                              ? 'bg-green-100 text-green-800' 
                              : docInfo.uploaded 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-red-100 text-red-800'
                          }`}>
                            {docInfo.verified ? 'Verified' : docInfo.uploaded ? 'Pending Review' : 'Not Uploaded'}
                          </span>
                        </div>
                        
                        {docInfo.uploaded && (
                          <div className="space-y-2">
                            <p className="text-gray-400 text-xs">
                              Uploaded: {new Date(docInfo.uploaded).toLocaleDateString()}
                            </p>
                            
                            <div className="flex space-x-2">
                              {docInfo.url && (
                                <a
                                  href={docInfo.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:text-blue-300 text-sm underline"
                                >
                                  View Document
                                </a>
                              )}
                              
                              {!docInfo.verified && docInfo.uploaded && (
                                <button
                                  onClick={() => handleDocumentVerification(selectedProvider.id, docType, true)}
                                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
                                >
                                  Verify
                                </button>
                              )}
                              
                              {docInfo.verified && (
                                <button
                                  onClick={() => handleDocumentVerification(selectedProvider.id, docType, false)}
                                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
                                >
                                  Unverify
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {!docInfo.uploaded && (
                          <p className="text-gray-500 text-sm">Document not yet uploaded</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Availability */}
                {selectedProvider.availability?.days?.length > 0 && (
                  <div className="bg-gray-900 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Availability</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400 text-sm">Working Days</p>
                        <p className="text-white">{selectedProvider.availability.days.join(', ')}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Working Hours</p>
                        <p className="text-white">
                          {selectedProvider.availability.hours.start} - {selectedProvider.availability.hours.end}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="bg-gray-900 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Provider Actions</h3>
                  <div className="flex space-x-3">
                    {selectedProvider.status === 'pending' || selectedProvider.status === 'under_review' ? (
                      <>
                        <button
                          onClick={() => {
                            handleStatusChange(selectedProvider.id, 'approved')
                            setShowDetailsModal(false)
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                        >
                          Approve Provider
                        </button>
                        <button
                          onClick={() => {
                            handleStatusChange(selectedProvider.id, 'rejected')
                            setShowDetailsModal(false)
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                        >
                          Reject Application
                        </button>
                      </>
                    ) : selectedProvider.status === 'approved' ? (
                      <button
                        onClick={() => {
                          handleStatusChange(selectedProvider.id, 'suspended')
                          setShowDetailsModal(false)
                        }}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg"
                      >
                        Suspend Provider
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          handleStatusChange(selectedProvider.id, 'approved')
                          setShowDetailsModal(false)
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                      >
                        Reactivate Provider
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Document Viewer Modal */}
        {showDocumentViewer && documentViewerProviderId && (
          <DocumentViewer
            providerId={documentViewerProviderId}
            onClose={() => {
              setShowDocumentViewer(false)
              setDocumentViewerProviderId(null)
            }}
          />
        )}
      </div>
    </AdminLayout>
  )
}
