'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  FaUpload, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaFileAlt,
  FaIdCard,
  FaCertificate,
  FaImages,
  FaSpinner
} from 'react-icons/fa'

interface Document {
  file: File | null
  preview: string | null
  uploaded: boolean
  required: boolean
}

interface Documents {
  nationalId: Document
  businessLicense: Document
  certificate: Document
  portfolio: Document[]
}

export default function ProviderVerification() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)
  const submissionInProgress = useRef(false)

  const [documents, setDocuments] = useState<Documents>({
    nationalId: { file: null, preview: null, uploaded: false, required: true },
    businessLicense: { file: null, preview: null, uploaded: false, required: true },
    certificate: { file: null, preview: null, uploaded: false, required: false },
    portfolio: []
  })

  const [providerInfo, setProviderInfo] = useState({
    experience: '',
    skills: [] as string[],
    hourlyRate: '',
    bio: '',
    serviceAreas: [] as string[],
    availability: {
      days: [] as string[],
      hours: { start: '09:00', end: '17:00' }
    }
  })

  const [skillInput, setSkillInput] = useState('')
  const [areaInput, setAreaInput] = useState('')

  useEffect(() => {
    // Check if user is logged in and is a provider
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/auth/login')
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.userType !== 'provider') {
      router.push('/dashboard')
      return
    }

    setUser(parsedUser)
  }, [router])

  const handleFileUpload = (docType: keyof Documents, file: File) => {
    if (docType === 'portfolio') {
      // Handle portfolio uploads (multiple files)
      const newPortfolioItem: Document = {
        file,
        preview: URL.createObjectURL(file),
        uploaded: false,
        required: false
      }
      setDocuments(prev => ({
        ...prev,
        portfolio: [...prev.portfolio, newPortfolioItem]
      }))
    } else {
      // Handle single document uploads
      setDocuments(prev => ({
        ...prev,
        [docType]: {
          ...prev[docType as keyof Omit<Documents, 'portfolio'>],
          file,
          preview: URL.createObjectURL(file)
        }
      }))
    }
  }

  const uploadDocument = async (docType: string, file: File) => {
    console.log(`Uploading ${docType}:`, file.name)
    
    const formData = new FormData()
    formData.append('document', file)
    formData.append('documentType', docType)
    formData.append('userId', user._id)

    try {
      const response = await fetch('/api/upload/provider-documents', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      
      if (response.ok) {
        console.log(`Successfully uploaded ${docType}:`, data.url)
        
        // Mark document as uploaded
        if (docType === 'portfolio') {
          setDocuments(prev => ({
            ...prev,
            portfolio: prev.portfolio.map(item => 
              item.file === file ? { ...item, uploaded: true } : item
            )
          }))
        } else {
          setDocuments(prev => ({
            ...prev,
            [docType]: { ...prev[docType as keyof Omit<Documents, 'portfolio'>], uploaded: true }
          }))
        }
        
        return data.url
      } else {
        throw new Error(data.message || 'Upload failed')
      }
    } catch (error) {
      console.error(`Upload error for ${docType}:`, error)
      throw error
    }
  }

  const handleSubmitDocuments = async () => {
    if (isLoading || submissionInProgress.current) {
      console.log('Submission already in progress, skipping...')
      return // Prevent duplicate submissions
    }
    
    submissionInProgress.current = true
    setIsLoading(true)
    setError('')
    
    console.log('Starting document submission...')

    try {
      // Upload required documents
      const uploads = []

      if (documents.nationalId.file && !documents.nationalId.uploaded) {
        uploads.push(uploadDocument('nationalId', documents.nationalId.file))
      }
      if (documents.businessLicense.file && !documents.businessLicense.uploaded) {
        uploads.push(uploadDocument('businessLicense', documents.businessLicense.file))
      }
      if (documents.certificate.file && !documents.certificate.uploaded) {
        uploads.push(uploadDocument('certificate', documents.certificate.file))
      }

      // Upload portfolio items
      for (const portfolioItem of documents.portfolio) {
        if (portfolioItem.file && !portfolioItem.uploaded) {
          uploads.push(uploadDocument('portfolio', portfolioItem.file))
        }
      }

      await Promise.all(uploads)

      // Submit provider profile
      const profileResponse = await fetch('/api/provider/complete-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user._id,
          providerInfo,
          documents: {
            nationalId: !!documents.nationalId.file,
            businessLicense: !!documents.businessLicense.file,
            certificate: !!documents.certificate.file,
            portfolioCount: documents.portfolio.length
          }
        }),
      })

      const profileData = await profileResponse.json()

      if (profileResponse.ok) {
        // Update user data in localStorage with the new provider status
        if (profileData.data && profileData.data.user) {
          localStorage.setItem('user', JSON.stringify(profileData.data.user))
          setUser(profileData.data.user)
        } else {
          // Fallback: update the current user object
          const updatedUser = { ...user, providerStatus: 'under_review' }
          localStorage.setItem('user', JSON.stringify(updatedUser))
          setUser(updatedUser)
        }
        
        setCurrentStep(3) // Move to pending approval step
      } else {
        setError(profileData.message || 'Failed to submit profile')
      }

    } catch (err) {
      console.error('Document submission error:', err)
      setError('Failed to upload documents. Please try again.')
    } finally {
      setIsLoading(false)
      submissionInProgress.current = false
    }
  }

  const addSkill = () => {
    if (skillInput.trim() && !providerInfo.skills.includes(skillInput.trim())) {
      setProviderInfo(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }))
      setSkillInput('')
    }
  }

  const removeSkill = (skill: string) => {
    setProviderInfo(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }))
  }

  const addServiceArea = () => {
    if (areaInput.trim() && !providerInfo.serviceAreas.includes(areaInput.trim())) {
      setProviderInfo(prev => ({
        ...prev,
        serviceAreas: [...prev.serviceAreas, areaInput.trim()]
      }))
      setAreaInput('')
    }
  }

  const removeServiceArea = (area: string) => {
    setProviderInfo(prev => ({
      ...prev,
      serviceAreas: prev.serviceAreas.filter(a => a !== area)
    }))
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-orange-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Provider Verification</h1>
          <p className="text-lg text-gray-600">Complete your profile to start offering services on Solutil</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  currentStep >= step 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                <span className={`ml-2 font-medium ${
                  currentStep >= step ? 'text-orange-600' : 'text-gray-500'
                }`}>
                  {step === 1 && 'Documents'}
                  {step === 2 && 'Profile'}
                  {step === 3 && 'Review'}
                </span>
                {step < 3 && (
                  <div className={`w-16 h-0.5 ml-4 ${
                    currentStep > step ? 'bg-orange-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          {/* Step 1: Document Upload */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Required Documents</h2>
              
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex">
                    <FaExclamationTriangle className="text-red-500 mt-0.5" />
                    <span className="ml-2 text-red-700">{error}</span>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* National ID */}
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-orange-300 transition-colors">
                  <FaIdCard className="mx-auto text-3xl text-gray-400 mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">National ID *</h3>
                  <p className="text-sm text-gray-600 mb-4">Clear photo of both sides</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files && handleFileUpload('nationalId', e.target.files[0])}
                    className="hidden"
                    id="nationalId"
                  />
                  <label htmlFor="nationalId" className="cursor-pointer">
                    <div className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors inline-flex items-center">
                      <FaUpload className="mr-2" />
                      Choose File
                    </div>
                  </label>
                  {documents.nationalId.preview && (
                    <div className="mt-4">
                      <img src={documents.nationalId.preview} alt="National ID" className="max-w-full h-32 object-cover rounded" />
                      <FaCheckCircle className="text-green-500 mx-auto mt-2" />
                    </div>
                  )}
                </div>

                {/* Business License */}
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-orange-300 transition-colors">
                  <FaFileAlt className="mx-auto text-3xl text-gray-400 mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">Business License *</h3>
                  <p className="text-sm text-gray-600 mb-4">Valid business registration</p>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => e.target.files && handleFileUpload('businessLicense', e.target.files[0])}
                    className="hidden"
                    id="businessLicense"
                  />
                  <label htmlFor="businessLicense" className="cursor-pointer">
                    <div className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors inline-flex items-center">
                      <FaUpload className="mr-2" />
                      Choose File
                    </div>
                  </label>
                  {documents.businessLicense.preview && (
                    <div className="mt-4">
                      <FaCheckCircle className="text-green-500 mx-auto" />
                      <p className="text-sm text-green-600 mt-1">File uploaded</p>
                    </div>
                  )}
                </div>

                {/* Certificate */}
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-orange-300 transition-colors">
                  <FaCertificate className="mx-auto text-3xl text-gray-400 mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">Professional Certificate</h3>
                  <p className="text-sm text-gray-600 mb-4">Trade/professional certification (optional)</p>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => e.target.files && handleFileUpload('certificate', e.target.files[0])}
                    className="hidden"
                    id="certificate"
                  />
                  <label htmlFor="certificate" className="cursor-pointer">
                    <div className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors inline-flex items-center">
                      <FaUpload className="mr-2" />
                      Choose File
                    </div>
                  </label>
                  {documents.certificate.preview && (
                    <div className="mt-4">
                      <FaCheckCircle className="text-green-500 mx-auto" />
                      <p className="text-sm text-green-600 mt-1">File uploaded</p>
                    </div>
                  )}
                </div>

                {/* Portfolio */}
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-orange-300 transition-colors">
                  <FaImages className="mx-auto text-3xl text-gray-400 mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">Portfolio Images</h3>
                  <p className="text-sm text-gray-600 mb-4">Examples of your work (optional)</p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) {
                        Array.from(e.target.files).forEach(file => handleFileUpload('portfolio', file))
                      }
                    }}
                    className="hidden"
                    id="portfolio"
                  />
                  <label htmlFor="portfolio" className="cursor-pointer">
                    <div className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors inline-flex items-center">
                      <FaUpload className="mr-2" />
                      Choose Files
                    </div>
                  </label>
                  {documents.portfolio.length > 0 && (
                    <div className="mt-4">
                      <div className="grid grid-cols-3 gap-2">
                        {documents.portfolio.map((item, index) => (
                          <img key={index} src={item.preview!} alt={`Portfolio ${index + 1}`} className="w-full h-16 object-cover rounded" />
                        ))}
                      </div>
                      <p className="text-sm text-green-600 mt-2">{documents.portfolio.length} files uploaded</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={!documents.nationalId.file || !documents.businessLicense.file}
                  className="bg-orange-500 text-white px-8 py-3 rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Continue to Profile
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Provider Profile */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Provider Profile</h2>
              
              <div className="space-y-6">
                {/* Experience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                  <select
                    value={providerInfo.experience}
                    onChange={(e) => setProviderInfo(prev => ({ ...prev, experience: e.target.value }))}
                    className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Select experience level</option>
                    <option value="0-1">0-1 years</option>
                    <option value="2-5">2-5 years</option>
                    <option value="6-10">6-10 years</option>
                    <option value="10+">10+ years</option>
                  </select>
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Skills & Services</label>
                  <div className="flex mb-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                      placeholder="Add a skill (e.g., Plumbing, Electrical)"
                      className="flex-1 py-2 px-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                    <button
                      onClick={addSkill}
                      className="px-4 py-2 bg-orange-500 text-white rounded-r-lg hover:bg-orange-600"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {providerInfo.skills.map((skill, index) => (
                      <span key={index} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                        {skill}
                        <button
                          onClick={() => removeSkill(skill)}
                          className="ml-2 text-orange-600 hover:text-orange-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Hourly Rate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Rate (KES)</label>
                  <input
                    type="number"
                    value={providerInfo.hourlyRate}
                    onChange={(e) => setProviderInfo(prev => ({ ...prev, hourlyRate: e.target.value }))}
                    placeholder="e.g., 1500"
                    className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                {/* Service Areas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Areas</label>
                  <div className="flex mb-2">
                    <input
                      type="text"
                      value={areaInput}
                      onChange={(e) => setAreaInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addServiceArea()}
                      placeholder="Add a service area (e.g., Nairobi, Kiambu)"
                      className="flex-1 py-2 px-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                    <button
                      onClick={addServiceArea}
                      className="px-4 py-2 bg-orange-500 text-white rounded-r-lg hover:bg-orange-600"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {providerInfo.serviceAreas.map((area, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {area}
                        <button
                          onClick={() => removeServiceArea(area)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Professional Bio</label>
                  <textarea
                    value={providerInfo.bio}
                    onChange={(e) => setProviderInfo(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell clients about your experience, approach, and what makes you unique..."
                    rows={4}
                    className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Back to Documents
                </button>
                <button
                  onClick={handleSubmitDocuments}
                  disabled={isLoading || !providerInfo.experience || providerInfo.skills.length === 0}
                  className="bg-orange-500 text-white px-8 py-3 rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    'Submit for Review'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Pending Approval */}
          {currentStep === 3 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaCheckCircle className="text-4xl text-orange-500" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
              <p className="text-lg text-gray-600 mb-6">
                Thank you for completing your provider application. Our team will review your documents and profile within 2-3 business days.
              </p>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-orange-800 mb-2">What happens next?</h3>
                <ul className="text-left text-orange-700 space-y-2">
                  <li>• Document verification (1-2 days)</li>
                  <li>• Background check process</li>
                  <li>• Profile review by Solutil team</li>
                  <li>• Email notification of approval status</li>
                </ul>
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-orange-500 text-white px-8 py-3 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
