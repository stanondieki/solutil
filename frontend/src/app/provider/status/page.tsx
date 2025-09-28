'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { RoleManager } from '@/lib/roles'
import RoleGuard from '@/components/RoleGuard'
import { 
  FaClock, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaExclamationCircle,
  FaArrowLeft,
  FaEye,
  FaUpload
} from 'react-icons/fa'

export default function ProviderStatusPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [profileData, setProfileData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProviderProfile()
  }, [])

  const fetchProviderProfile = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch('/api/provider/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setProfileData(data.data)
      }
    } catch (error) {
      console.error('Error fetching provider profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusConfig = () => {
    if (!user?.providerStatus) return null
    return RoleManager.getProviderStatusConfig(user.providerStatus)
  }

  const statusConfig = getStatusConfig()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading your application status...</p>
        </div>
      </div>
    )
  }

  return (
    <RoleGuard requiredRole="provider">
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              <FaArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </button>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Provider Application Status</h1>
            <p className="text-gray-600">Track the progress of your provider application</p>
          </div>

          {/* Status Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${
                statusConfig?.color?.includes('green') ? 'bg-green-100' :
                statusConfig?.color?.includes('yellow') ? 'bg-yellow-100' :
                statusConfig?.color?.includes('red') ? 'bg-red-100' :
                'bg-blue-100'
              }`}>
                {user?.providerStatus === 'approved' && <FaCheckCircle className="w-10 h-10 text-green-600" />}
                {user?.providerStatus === 'under_review' && <FaClock className="w-10 h-10 text-blue-600" />}
                {user?.providerStatus === 'pending' && <FaExclamationCircle className="w-10 h-10 text-yellow-600" />}
                {user?.providerStatus === 'rejected' && <FaTimesCircle className="w-10 h-10 text-red-600" />}
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {statusConfig?.label || 'Unknown Status'}
              </h2>

              {user?.providerStatus === 'approved' && (
                <p className="text-gray-600 mb-6">
                  Congratulations! Your provider application has been approved. You can now start receiving bookings from customers.
                </p>
              )}

              {user?.providerStatus === 'under_review' && (
                <div className="text-gray-600 mb-6">
                  <p className="mb-2">
                    Your application is currently being reviewed by our team. This process typically takes 2-3 business days.
                  </p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                    <p className="text-yellow-800 text-sm">
                      <strong>Note:</strong> You cannot make changes or resubmit your application while it's under review. 
                      Please wait for our decision before taking any action.
                    </p>
                  </div>
                </div>
              )}

              {user?.providerStatus === 'pending' && (
                <div className="text-gray-600 mb-6">
                  <p className="mb-2">
                    Please complete your provider onboarding process to submit your application for review.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <p className="text-blue-800 text-sm">
                      Complete all required steps in the onboarding process to submit your application.
                    </p>
                  </div>
                </div>
              )}

              {user?.providerStatus === 'rejected' && (
                <div className="text-gray-600 mb-6">
                  <p className="mb-2">
                    Your application requires additional information. Please review the feedback below and update your application.
                  </p>
                  {profileData?.rejectionReason && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4 mb-4">
                      <h4 className="text-red-800 font-medium mb-2">Admin Feedback:</h4>
                      <p className="text-red-700 text-sm">{profileData.rejectionReason}</p>
                    </div>
                  )}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                    <p className="text-green-800 text-sm">
                      <strong>Good news:</strong> You can update your documents and profile, then resubmit your application for another review.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Progress Indicator */}
            {profileData && (
              <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Completion Progress</h3>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Overall Progress</span>
                    <span>{profileData.completionPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-500" 
                      style={{ width: `${profileData.completionPercentage}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Documents Uploaded</p>
                    <p className="font-semibold text-gray-900">
                      {profileData.documentsUploaded} / {profileData.totalDocuments}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Profile Completed</p>
                    <p className="font-semibold text-gray-900">
                      {profileData.profileCompleted} / {profileData.totalProfileFields}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Document Status */}
          {profileData?.documents && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Document Verification Status</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(profileData.documents).map(([docType, docInfo]) => (
                  <div key={docType} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-gray-900 capitalize">
                        {docType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        docInfo.verified 
                          ? 'bg-green-100 text-green-800' 
                          : docInfo.uploaded 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        {docInfo.verified ? 'Verified' : docInfo.uploaded ? 'Under Review' : 'Not Uploaded'}
                      </span>
                    </div>
                    
                    {docInfo.uploaded && (
                      <p className="text-gray-600 text-sm">
                        Uploaded: {new Date(docInfo.uploaded).toLocaleDateString()}
                      </p>
                    )}
                    
                    {!docInfo.uploaded && (
                      <p className="text-gray-500 text-sm">Document required for verification</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Actions</h3>
            
            <div className="flex flex-wrap gap-4">
              {user?.providerStatus === 'approved' && (
                <button
                  onClick={() => router.push('/dashboard')}
                  className="inline-flex items-center px-6 py-3 bg-green-600 border border-transparent rounded-lg font-medium text-white hover:bg-green-700"
                >
                  <FaCheckCircle className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </button>
              )}

              {(user?.providerStatus === 'pending' || user?.providerStatus === 'rejected') && (
                <button
                  onClick={() => router.push('/provider/onboarding')}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 border border-transparent rounded-lg font-medium text-white hover:bg-blue-700"
                >
                  <FaUpload className="w-4 h-4 mr-2" />
                  {user?.providerStatus === 'rejected' ? 'Update Application' : 'Complete Setup'}
                </button>
              )}

              {user?.providerStatus === 'under_review' && (
                <div className="text-center p-6 bg-blue-50 rounded-lg">
                  <FaClock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <p className="text-blue-800 font-medium mb-2">Your application is being reviewed</p>
                  <p className="text-blue-600 text-sm mb-3">We'll send you an email with the decision within 2-3 business days</p>
                  <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 mt-3">
                    <p className="text-blue-800 text-xs">
                      <strong>Important:</strong> Resubmission is disabled while your application is under review. 
                      Please wait for our decision.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Timeline Section */}
          {profileData && (profileData.submittedAt || profileData.approvedAt || profileData.rejectedAt) && (
            <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Timeline</h3>
              <div className="space-y-4">
                {profileData.submittedAt && (
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-gray-900">Application Submitted</p>
                      <p className="text-sm text-gray-500">
                        {new Date(profileData.submittedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                )}
                {profileData.approvedAt && (
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-gray-900">Application Approved</p>
                      <p className="text-sm text-gray-500">
                        {new Date(profileData.approvedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                )}
                {profileData.rejectedAt && (
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-gray-900">Application Rejected</p>
                      <p className="text-sm text-gray-500">
                        {new Date(profileData.rejectedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Help Section */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Need Help?</h3>
            <p className="text-blue-800 mb-4">
              If you have questions about your application status or need assistance with the onboarding process, 
              we're here to help.
            </p>
            <a 
              href="mailto:support@solutil.com" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Contact Support →
            </a>
          </div>
        </div>
      </div>
    </RoleGuard>
  )
}