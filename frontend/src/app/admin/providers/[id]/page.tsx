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
  FaEdit,
  FaGlobe,
  FaCreditCard,
  FaImages,
  FaImage,
  FaCertificate,
  FaHome,
  FaClock,
  FaLanguage,
  FaMoneyBillWave
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
    nationalId?: { uploaded?: Date | string; verified: boolean; url?: string; public_id?: string }
    businessLicense?: { uploaded?: Date | string; verified: boolean; url?: string; public_id?: string }
    certificate?: { uploaded?: Date | string; verified: boolean; url?: string; public_id?: string }
    goodConductCertificate?: { uploaded?: Date | string; verified: boolean; url?: string; public_id?: string }
  }
  stats?: {
    totalJobs: number
    completedJobs: number
    rating: number
    earnings: number
  }
  // Enhanced provider profile data for comprehensive review
  providerProfile?: {
    experience?: string
    bio?: string
    skills?: string[]
    hourlyRate?: number
    availability?: {
      days?: string[]
      hours?: {
        start: string
        end: string
      }
      minimumNotice?: number
      advanceBooking?: number
    }
    serviceAreas?: string[]
    homeAddress?: {
      street?: string
      area?: string
      postalCode?: string
    }
    emergencyContact?: {
      name?: string
      relationship?: string
      phoneNumber?: string
    }
    languages?: string[]
    professionalMemberships?: Array<{
      organization?: string
      membershipId?: string
      certificateUrl?: string
    }>
    paymentInfo?: {
      preferredMethod?: string
      mpesaNumber?: string
      bankDetails?: {
        bankName?: string
        accountName?: string
        accountNumber?: string
        branchCode?: string
      }
    }
    materialSourcing?: {
      option?: string
      details?: string
    }
    portfolio?: Array<{
      title?: string
      description?: string
      category?: string
      beforeImageUrl?: string
      afterImageUrl?: string
      completionDate?: string
    }>
    services?: Array<{
      category?: string
      subServices?: string[]
      experience?: string
      description?: string
    }>
  }
  profilePicture?: string
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
          // Transform the real data to match our interface with comprehensive profile data
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
            },
            // Include comprehensive provider profile data
            providerProfile: foundProvider.providerProfile || {},
            profilePicture: foundProvider.profilePicture || ''
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net'}/api/admin/users/${provider._id}`, {
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net'}/api/admin/providers/${provider._id}/documents`, {
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
              {/* Profile Photo and Basic Info */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start space-x-6 mb-6">
                  {/* Profile Photo */}
                  <div className="flex-shrink-0">
                    {provider.profilePicture ? (
                      <img 
                        src={provider.profilePicture} 
                        alt="Profile" 
                        className="w-24 h-24 rounded-full object-cover border-4 border-blue-200 shadow-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                        <FaUser className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Basic Details */}
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {provider.firstName} {provider.lastName}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          <p className="font-medium">{provider.phone || provider.providerProfile?.emergencyContact?.phoneNumber || 'Not provided'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <FaCalendarAlt className="text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Registered</p>
                          <p className="font-medium">{new Date(provider.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <FaTools className="text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Experience</p>
                          <p className="font-medium">{provider.providerProfile?.experience || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Professional Bio */}
                {provider.providerProfile?.bio && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Professional Bio</h3>
                    <p className="text-gray-700 leading-relaxed">{provider.providerProfile.bio}</p>
                  </div>
                )}
              </div>

              {/* Service Categories & Specializations */}
              {provider.providerProfile?.services && provider.providerProfile.services.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <FaCertificate className="w-5 h-5 text-blue-600 mr-2" />
                    Service Categories & Specializations
                  </h2>
                  <div className="space-y-4">
                    {provider.providerProfile.services.map((service, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-gray-900">{service.category}</h3>
                          {service.experience && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                              {service.experience}
                            </span>
                          )}
                        </div>
                        
                        {service.subServices && service.subServices.length > 0 && (
                          <div className="mb-3">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Sub-services:</h4>
                            <div className="flex flex-wrap gap-2">
                              {service.subServices.map((subService, subIndex) => (
                                <span key={subIndex} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                  {subService}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {service.description && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Description:</h4>
                            <p className="text-sm text-gray-600">{service.description}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact & Address Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FaHome className="w-5 h-5 text-green-600 mr-2" />
                  Contact & Address Information
                </h2>
                
                {/* Debug Section */}
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
                  <h3 className="font-semibold text-yellow-900 mb-2">🔍 DEBUG: Address Data</h3>
                  <div className="text-sm text-yellow-800">
                    <p>Provider Profile exists: {provider.providerProfile ? 'Yes' : 'No'}</p>
                    <p>Home Address exists: {provider.providerProfile?.homeAddress ? 'Yes' : 'No'}</p>
                    {provider.providerProfile?.homeAddress && (
                      <>
                        <p>Street: {provider.providerProfile.homeAddress.street || 'Not set'}</p>
                        <p>Area: {provider.providerProfile.homeAddress.area || 'Not set'}</p>
                        <p>Postal Code: {provider.providerProfile.homeAddress.postalCode || 'Not set'}</p>
                      </>
                    )}
                    <p>Emergency Contact exists: {provider.providerProfile?.emergencyContact ? 'Yes' : 'No'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Home Address */}
                  {provider.providerProfile?.homeAddress && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">Home Address</h3>
                      <div className="space-y-1 text-gray-700">
                        {provider.providerProfile.homeAddress.street && (
                          <p>{provider.providerProfile.homeAddress.street}</p>
                        )}
                        {provider.providerProfile.homeAddress.area && (
                          <p>{provider.providerProfile.homeAddress.area}</p>
                        )}
                        {provider.providerProfile.homeAddress.postalCode && (
                          <p>Postal Code: {provider.providerProfile.homeAddress.postalCode}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Emergency Contact */}
                  {provider.providerProfile?.emergencyContact && (
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">Emergency Contact</h3>
                      <div className="space-y-1 text-gray-700">
                        {provider.providerProfile.emergencyContact.name && (
                          <p><strong>Name:</strong> {provider.providerProfile.emergencyContact.name}</p>
                        )}
                        {provider.providerProfile.emergencyContact.relationship && (
                          <p><strong>Relationship:</strong> {provider.providerProfile.emergencyContact.relationship}</p>
                        )}
                        {provider.providerProfile.emergencyContact.phoneNumber && (
                          <p><strong>Phone:</strong> {provider.providerProfile.emergencyContact.phoneNumber}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Service Areas */}
                {provider.providerProfile?.serviceAreas && provider.providerProfile.serviceAreas.length > 0 && (
                  <div className="mt-4 bg-indigo-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Service Areas</h3>
                    <div className="flex flex-wrap gap-2">
                      {provider.providerProfile.serviceAreas.map((area, index) => (
                        <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Languages & Professional Details */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FaGlobe className="w-5 h-5 text-cyan-600 mr-2" />
                  Languages & Professional Details
                </h2>
                
                {/* Languages */}
                {provider.providerProfile?.languages && provider.providerProfile.languages.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Languages</h3>
                    <div className="flex flex-wrap gap-2">
                      {provider.providerProfile.languages.map((language, index) => (
                        <span key={index} className="px-3 py-1 bg-cyan-100 text-cyan-800 text-sm rounded-full">
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Professional Memberships */}
                {provider.providerProfile?.professionalMemberships && provider.providerProfile.professionalMemberships.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Professional Memberships</h3>
                    <div className="space-y-2">
                      {provider.providerProfile.professionalMemberships.map((membership, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded border">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900">{membership.organization}</p>
                              <p className="text-sm text-gray-600">ID: {membership.membershipId}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Availability & Schedule */}
              {provider.providerProfile?.availability && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <FaClock className="w-5 h-5 text-yellow-600 mr-2" />
                    Availability & Schedule
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {provider.providerProfile.availability.days && provider.providerProfile.availability.days.length > 0 && (
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">Working Days</h3>
                        <p className="text-gray-700">{provider.providerProfile.availability.days.join(', ')}</p>
                      </div>
                    )}
                    
                    {provider.providerProfile.availability.hours && (
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">Working Hours</h3>
                        <p className="text-gray-700">
                          {provider.providerProfile.availability.hours.start} - {provider.providerProfile.availability.hours.end}
                        </p>
                      </div>
                    )}
                    
                    {provider.providerProfile.availability.minimumNotice && (
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">Minimum Notice</h3>
                        <p className="text-gray-700">{provider.providerProfile.availability.minimumNotice} hours</p>
                      </div>
                    )}
                    
                    {provider.providerProfile.availability.advanceBooking && (
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">Advance Booking</h3>
                        <p className="text-gray-700">Up to {provider.providerProfile.availability.advanceBooking} days</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Information */}
              {provider.providerProfile?.paymentInfo && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <FaCreditCard className="w-5 h-5 text-emerald-600 mr-2" />
                    Payment Information
                  </h2>
                  <div className="space-y-4">
                    {provider.providerProfile.paymentInfo.preferredMethod && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Preferred Method</h3>
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-sm rounded-full capitalize">
                          {provider.providerProfile.paymentInfo.preferredMethod.replace('_', ' ')}
                        </span>
                      </div>
                    )}

                    {/* M-Pesa Details */}
                    {provider.providerProfile.paymentInfo.mpesaNumber && (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">📱 M-Pesa Information</h3>
                        <p className="text-gray-700">Number: {provider.providerProfile.paymentInfo.mpesaNumber}</p>
                      </div>
                    )}

                    {/* Bank Details */}
                    {provider.providerProfile.paymentInfo.bankDetails && Object.values(provider.providerProfile.paymentInfo.bankDetails).some(val => val) && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">🏦 Bank Account Details</h3>
                        <div className="space-y-1 text-gray-700 text-sm">
                          {provider.providerProfile.paymentInfo.bankDetails.bankName && (
                            <p><strong>Bank:</strong> {provider.providerProfile.paymentInfo.bankDetails.bankName}</p>
                          )}
                          {provider.providerProfile.paymentInfo.bankDetails.accountName && (
                            <p><strong>Account Name:</strong> {provider.providerProfile.paymentInfo.bankDetails.accountName}</p>
                          )}
                          {provider.providerProfile.paymentInfo.bankDetails.accountNumber && (
                            <p><strong>Account Number:</strong> {provider.providerProfile.paymentInfo.bankDetails.accountNumber}</p>
                          )}
                          {provider.providerProfile.paymentInfo.bankDetails.branchCode && (
                            <p><strong>Branch Code:</strong> {provider.providerProfile.paymentInfo.bankDetails.branchCode}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Material Sourcing */}
              {provider.providerProfile?.materialSourcing && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <FaTools className="w-5 h-5 text-orange-600 mr-2" />
                    Material Sourcing & Tools
                  </h2>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl">
                        {provider.providerProfile.materialSourcing.option === 'provider' ? '✅' : '🛠️'}
                      </span>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {provider.providerProfile.materialSourcing.option === 'provider' 
                            ? 'Provides own materials' 
                            : 'Client provides materials'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {provider.providerProfile.materialSourcing.option === 'provider'
                            ? 'This provider brings their own tools and materials'
                            : 'This provider expects client to provide materials'}
                        </p>
                      </div>
                    </div>
                    {provider.providerProfile.materialSourcing.details && (
                      <div className="mt-3 pt-3 border-t border-orange-200">
                        <p className="text-sm font-medium text-gray-900 mb-1">Details:</p>
                        <p className="text-sm text-gray-700 bg-white p-2 rounded border">
                          {provider.providerProfile.materialSourcing.details}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Portfolio Projects */}
              {provider.providerProfile?.portfolio && provider.providerProfile.portfolio.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <FaImages className="w-5 h-5 text-purple-600 mr-2" />
                    Portfolio Projects ({provider.providerProfile.portfolio.length})
                  </h2>
                  <div className="space-y-4">
                    {provider.providerProfile.portfolio.map((project, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          Project {index + 1}: {project.title || 'Untitled'}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                          {project.category && (
                            <div>
                              <p className="text-sm font-medium text-gray-700">Category:</p>
                              <p className="text-sm text-gray-600">{project.category}</p>
                            </div>
                          )}
                          {project.completionDate && (
                            <div>
                              <p className="text-sm font-medium text-gray-700">Completed:</p>
                              <p className="text-sm text-gray-600">
                                {new Date(project.completionDate).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-700">Photos:</p>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              {project.beforeImageUrl && (
                                <span className="flex items-center space-x-1">
                                  <FaImage className="w-3 h-3" />
                                  <span>Before</span>
                                </span>
                              )}
                              {project.afterImageUrl && (
                                <span className="flex items-center space-x-1">
                                  <FaImage className="w-3 h-3" />
                                  <span>After</span>
                                </span>
                              )}
                              {!project.beforeImageUrl && !project.afterImageUrl && (
                                <span>No photos</span>
                              )}
                            </div>
                          </div>
                        </div>
                        {project.description && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">Description:</p>
                            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                              {project.description}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Verification Documents */}
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
                              {doc.uploaded ? `Uploaded on ${new Date(doc.uploaded).toLocaleDateString()}` : 'Not uploaded'} • 
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
