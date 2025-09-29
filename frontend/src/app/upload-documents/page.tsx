'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import RoleGuard from '@/components/RoleGuard'
import { 
  FaArrowLeft, 
  FaIdCard, 
  FaFileAlt, 
  FaCertificate, 
  FaCloudUploadAlt, 
  FaCheck, 
  FaExclamationTriangle 
} from 'react-icons/fa'

interface DocumentState {
  nationalId: { file: File | null; uploaded: boolean; url?: string }
  businessLicense: { file: File | null; uploaded: boolean; url?: string }
  certificate: { file: File | null; uploaded: boolean; url?: string }
}

export default function UploadDocumentsPage() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [documents, setDocuments] = useState<DocumentState>({
    nationalId: { file: null, uploaded: false },
    businessLicense: { file: null, uploaded: false },
    certificate: { file: null, uploaded: false }
  })
  
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    // Redirect providers to the new onboarding flow
    if (user && user.userType === 'provider') {
      router.push('/provider/onboarding')
    }
  }, [user, router])

  const handleFileSelect = (docType: keyof DocumentState, file: File) => {
    setDocuments(prev => ({
      ...prev,
      [docType]: { ...prev[docType], file }
    }))
  }

  const handleUpload = async (docType: keyof DocumentState) => {
    const document = documents[docType]
    if (!document.file) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('document', document.file)
      formData.append('documentType', docType)

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch('/api/upload/documents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (response.ok) {
        const result = await response.json()
        setDocuments(prev => ({
          ...prev,
          [docType]: { 
            ...prev[docType], 
            uploaded: true, 
            url: result.url 
          }
        }))
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const getDocumentIcon = (docType: keyof DocumentState) => {
    switch (docType) {
      case 'nationalId': return FaIdCard
      case 'businessLicense': return FaFileAlt
      case 'certificate': return FaCertificate
      default: return FaFileAlt
    }
  }

  const getDocumentTitle = (docType: keyof DocumentState) => {
    switch (docType) {
      case 'nationalId': return 'National ID'
      case 'businessLicense': return 'Business License'
      case 'certificate': return 'Professional Certificate'
      default: return 'Document'
    }
  }

  const getDocumentDescription = (docType: keyof DocumentState) => {
    switch (docType) {
      case 'nationalId': return 'Upload a clear photo of your National ID (front and back)'
      case 'businessLicense': return 'Upload your valid business registration certificate'
      case 'certificate': return 'Upload relevant professional certificates or qualifications'
      default: return 'Upload required document'
    }
  }

  const allDocumentsUploaded = Object.values(documents).every(doc => doc.uploaded)

  return (
    <RoleGuard requiredRole="provider">
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
                  <h1 className="text-2xl font-bold text-gray-900">Document Verification</h1>
                  <p className="text-gray-600">Upload required documents to verify your provider account</p>
                </div>
              </div>
              
              {/* Status Badge */}
              {user?.providerStatus && (
                <span className="px-3 py-1 text-sm font-medium rounded-full border border-yellow-300 bg-yellow-100 text-yellow-800">
                  Pending Verification
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <FaExclamationTriangle className="text-blue-600 h-6 w-6 mr-3 mt-1" />
              <div>
                <h3 className="font-medium text-blue-800 mb-2">Verification Requirements</h3>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• All documents must be clear and readable</li>
                  <li>• Accepted formats: JPG, PNG, PDF (max 5MB each)</li>
                  <li>• Documents will be reviewed within 24-48 hours</li>
                  <li>• You'll receive an email notification once verification is complete</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Document Upload Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {(Object.keys(documents) as Array<keyof DocumentState>).map((docType) => {
              const document = documents[docType]
              const Icon = getDocumentIcon(docType)
              
              return (
                <div key={docType} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-blue-100 rounded-lg mr-3">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{getDocumentTitle(docType)}</h3>
                      <p className="text-sm text-gray-600">Required</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    {getDocumentDescription(docType)}
                  </p>

                  {/* File Input */}
                  <div className="mb-4">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileSelect(docType, file)
                      }}
                      className="hidden"
                      id={`file-${docType}`}
                    />
                    <label
                      htmlFor={`file-${docType}`}
                      className="block w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                    >
                      <FaCloudUploadAlt className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <span className="text-sm text-gray-600">
                        {document.file ? document.file.name : 'Click to select file'}
                      </span>
                    </label>
                  </div>

                  {/* Upload Button */}
                  {document.file && !document.uploaded && (
                    <button
                      onClick={() => handleUpload(docType)}
                      disabled={isUploading}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploading ? 'Uploading...' : 'Upload Document'}
                    </button>
                  )}

                  {/* Upload Progress */}
                  {isUploading && uploadProgress > 0 && (
                    <div className="mt-2">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{uploadProgress}% uploaded</p>
                    </div>
                  )}

                  {/* Status */}
                  {document.uploaded && (
                    <div className="flex items-center mt-2">
                      <FaCheck className="text-green-600 h-4 w-4 mr-2" />
                      <span className="text-sm text-green-600 font-medium">Uploaded</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Submit Button */}
          {allDocumentsUploaded && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <FaCheck className="text-green-600 h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-green-800 mb-2">All Documents Uploaded!</h3>
              <p className="text-green-700 mb-4">
                Your documents have been submitted for review. We'll notify you via email once verification is complete.
              </p>
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
              >
                Go to Dashboard
              </button>
            </div>
          )}

          {/* Help Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Need Help?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Document Requirements</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Documents must be recent and valid</li>
                  <li>• Images should be clear and well-lit</li>
                  <li>• All text must be clearly readable</li>
                  <li>• No screenshots or photocopies</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Verification Timeline</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Review typically takes 24-48 hours</li>
                  <li>• You'll receive email notifications</li>
                  <li>• Approved providers can start receiving bookings</li>
                  <li>• Contact support if you have questions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  )
}
