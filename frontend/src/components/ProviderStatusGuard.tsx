'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { FaClock, FaCheckCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa'

interface ProviderStatusGuardProps {
  children: React.ReactNode
  user: any
}

export default function ProviderStatusGuard({ children, user }: ProviderStatusGuardProps) {
  const router = useRouter()

  // Debug: Log the user data to see what status we're getting
  console.log('ProviderStatusGuard - User data:', user)
  console.log('ProviderStatusGuard - Provider status:', user?.providerStatus)

  if (user?.userType !== 'provider') {
    return <>{children}</>
  }

  // Handle case where providerStatus is undefined (for existing users)
  const providerStatus = user.providerStatus || 'pending'
  console.log('ProviderStatusGuard - Resolved status:', providerStatus)

  const getStatusInfo = () => {
    switch (providerStatus) {
      case 'pending':
        return {
          icon: <FaClock className="text-4xl text-yellow-500" />,
          title: 'Complete Your Provider Profile',
          message: 'Please complete your verification process to start offering services.',
          action: (
            <button
              onClick={() => router.push('/auth/provider-verification')}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Complete Verification
            </button>
          ),
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        }
      
      case 'under_review':
        return {
          icon: <FaClock className="text-4xl text-blue-500" />,
          title: 'Application Under Review',
          message: 'Our team is reviewing your application. You will receive an email notification once the review is complete.',
          action: (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Average review time: 2-3 business days
              </p>
              <button
                onClick={() => router.push('/contact')}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Contact Support
              </button>
            </div>
          ),
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        }
      
      case 'rejected':
        return {
          icon: <FaTimes className="text-4xl text-red-500" />,
          title: 'Application Not Approved',
          message: 'Unfortunately, your provider application was not approved. Please contact support for more information or to reapply.',
          action: (
            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/contact')}
                className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
              >
                Contact Support
              </button>
              <button
                onClick={() => router.push('/auth/provider-verification')}
                className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Reapply
              </button>
            </div>
          ),
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        }
      
      case 'suspended':
        return {
          icon: <FaExclamationTriangle className="text-4xl text-orange-500" />,
          title: 'Account Suspended',
          message: 'Your provider account has been temporarily suspended. Please contact support for assistance.',
          action: (
            <button
              onClick={() => router.push('/contact')}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Contact Support
            </button>
          ),
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200'
        }
      
      case 'approved':
        return null // Allow access to dashboard
      
      default:
        // This should rarely happen now since we default to 'pending'
        return {
          icon: <FaClock className="text-4xl text-gray-500" />,
          title: 'Provider Status Unknown',
          message: 'There seems to be an issue with your provider status. Please contact support.',
          action: (
            <button
              onClick={() => router.push('/contact')}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Contact Support
            </button>
          ),
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        }
    }
  }

  const statusInfo = getStatusInfo()

  // If provider is approved, render children (dashboard)
  if (!statusInfo) {
    return <>{children}</>
  }

  // Otherwise, show status page
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-gray-50 flex items-center justify-center p-4">
      <div className={`max-w-2xl w-full ${statusInfo.bgColor} ${statusInfo.borderColor} border rounded-2xl shadow-xl p-8 text-center`}>
        <div className="mb-6">
          {statusInfo.icon}
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {statusInfo.title}
        </h1>
        
        <p className="text-lg text-gray-600 mb-8">
          {statusInfo.message}
        </p>
        
        <div className="mb-8">
          {statusInfo.action}
        </div>

        {/* Provider Status Badge */}
        <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white border">
          <div className={`w-2 h-2 rounded-full mr-2 ${
            user.providerStatus === 'pending' ? 'bg-yellow-500' :
            user.providerStatus === 'under_review' ? 'bg-blue-500' :
            user.providerStatus === 'approved' ? 'bg-green-500' :
            user.providerStatus === 'rejected' ? 'bg-red-500' :
            user.providerStatus === 'suspended' ? 'bg-orange-500' :
            'bg-gray-500'
          }`} />
          Status: {user.providerStatus?.replace('_', ' ').toUpperCase()}
        </div>

        {/* Additional Info */}
        {user.providerStatus === 'under_review' && (
          <div className="mt-6 p-4 bg-white rounded-lg border">
            <h3 className="font-semibold text-gray-900 mb-2">What we're reviewing:</h3>
            <ul className="text-left text-gray-600 space-y-1">
              <li>• Identity verification documents</li>
              <li>• Business license validation</li>
              <li>• Professional background check</li>
              <li>• Service offering assessment</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
