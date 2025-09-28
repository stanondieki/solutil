'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import RoleGuard from '@/components/RoleGuard'
import { 
  FaUser, 
  FaUpload, 
  FaCheckCircle, 
  FaArrowRight, 
  FaArrowLeft, 
  FaIdCard, 
  FaCertificate, 
  FaShieldAlt,
  FaBuilding,
  FaClock,
  FaMapMarkerAlt,
  FaDollarSign,
  FaTimes,
  FaCheck,
  FaExclamationTriangle
} from 'react-icons/fa'

interface DocumentUpload {
  file: File | null
  uploaded: boolean
  verified: boolean
  url?: string
  error?: string
}

interface ProviderProfile {
  experience: string
  skills: string[]
  hourlyRate: string
  availability: {
    days: string[]
    hours: { start: string; end: string }
  }
  serviceAreas: string[]
  bio: string
}

const ONBOARDING_STEPS = [
  { id: 1, title: 'Welcome', icon: FaUser },
  { id: 2, title: 'Documents', icon: FaUpload },
  { id: 3, title: 'Profile Setup', icon: FaCertificate },
  { id: 4, title: 'Review', icon: FaCheckCircle }
]

const AVAILABLE_SKILLS = [
  'Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Cleaning', 'Gardening',
  'HVAC', 'Roofing', 'Flooring', 'Kitchen Renovation', 'Bathroom Renovation',
  'General Maintenance', 'Appliance Repair', 'Locksmith Services', 'Security Systems',
  'Solar Installation', 'Pest Control', 'Moving Services', 'Interior Design'
]

const KENYAN_CITIES = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi', 
  'Kitale', 'Garissa', 'Kakamega', 'Machakos', 'Meru', 'Nyeri', 'Kericho',
  'Kisii', 'Kilifi', 'Lamu', 'Naivasha', 'Nanyuki', 'Voi'
]

const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
]

export default function ProviderOnboardingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [shouldBlock, setShouldBlock] = useState(false)
  const [documents, setDocuments] = useState({
    nationalId: { file: null, uploaded: false, verified: false, error: '' },
    businessLicense: { file: null, uploaded: false, verified: false, error: '' },
    certificate: { file: null, uploaded: false, verified: false, error: '' },
    goodConductCertificate: { file: null, uploaded: false, verified: false, error: '' }
  })
  const [profile, setProfile] = useState<ProviderProfile>({
    experience: '',
    skills: [],
    hourlyRate: '',
    availability: {
      days: [],
      hours: { start: '09:00', end: '17:00' }
    },
    serviceAreas: [],
    bio: ''
  })

  // Check provider status and redirect accordingly
  useEffect(() => {
    if (user && user.userType === 'provider') {
      if (user.providerStatus === 'approved') {
        router.push('/dashboard')
      } else if (user.providerStatus === 'under_review') {
        setShouldBlock(true)
        setTimeout(() => router.push('/provider/status'), 3000)
      }
    }
  }, [user, router])

  const handleFileSelect = (docType: keyof typeof documents, file: File) => {
    // Validate file
    if (!file) return
    
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    const maxSize = 5 * 1024 * 1024 // 5MB
    
    if (!validTypes.includes(file.type)) {
      setDocuments(prev => ({
        ...prev,
        [docType]: { ...prev[docType], error: 'Please upload a valid image (JPG, PNG) or PDF file' }
      }))
      return
    }
    
    if (file.size > maxSize) {
      setDocuments(prev => ({
        ...prev,
        [docType]: { ...prev[docType], error: 'File size must be less than 5MB' }
      }))
      return
    }

    setDocuments(prev => ({
      ...prev,
      [docType]: { ...prev[docType], file, error: '' }
    }))
  }

  const uploadDocument = async (docType: keyof typeof documents) => {
    const document = documents[docType]
    if (!document.file) return

    setIsLoading(true)
    const formData = new FormData()
    formData.append('document', document.file)
    formData.append('documentType', docType)

    try {
      const response = await fetch('/api/provider/upload-document', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed')
      }

      setDocuments(prev => ({
        ...prev,
        [docType]: { 
          ...prev[docType], 
          uploaded: true, 
          url: data.url,
          error: '' 
        }
      }))
    } catch (error) {
      setDocuments(prev => ({
        ...prev,
        [docType]: { 
          ...prev[docType], 
          error: error instanceof Error ? error.message : 'Upload failed' 
        }
      }))
    } finally {
      setIsLoading(false)
    }
  }

  const saveProfile = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/provider/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(profile)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to save profile')
      }

      return true
    } catch (error) {
      console.error('Error saving profile:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const completeOnboarding = async () => {
    const success = await saveProfile()
    if (success) {
      // Update provider status to under_review
      try {
        await fetch('/api/provider/submit-application', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        })
        router.push('/dashboard?onboarding=complete')
      } catch (error) {
        console.error('Error submitting application:', error)
      }
    }
  }

  const nextStep = () => {
    if (currentStep < ONBOARDING_STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceedFromDocuments = () => {
    return Object.values(documents).every(doc => doc.uploaded)
  }

  const canProceedFromProfile = () => {
    return profile.experience && 
           profile.skills.length > 0 && 
           profile.hourlyRate && 
           profile.serviceAreas.length > 0 && 
           profile.bio &&
           profile.availability.days.length > 0
  }

  const DocumentUploadCard = ({ 
    docType, 
    title, 
    description, 
    icon: Icon, 
    required = true 
  }: {
    docType: keyof typeof documents
    title: string
    description: string
    icon: any
    required?: boolean
  }) => {
    const doc = documents[docType]
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start space-x-4">
          <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
            doc.uploaded ? 'bg-green-100' : 'bg-blue-100'
          }`}>
            {doc.uploaded ? (
              <FaCheck className="w-6 h-6 text-green-600" />
            ) : (
              <Icon className="w-6 h-6 text-blue-600" />
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {title} {required && <span className="text-red-500">*</span>}
            </h3>
            <p className="text-gray-600 text-sm mb-4">{description}</p>
            
            {doc.error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <FaExclamationTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-red-700 text-sm">{doc.error}</span>
                </div>
              </div>
            )}
            
            {doc.uploaded ? (
              <div className="flex items-center space-x-2 text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                <FaCheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Document uploaded successfully</span>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => e.target.files && handleFileSelect(docType, e.target.files[0])}
                  className="hidden"
                  id={`file-${docType}`}
                />
                <label
                  htmlFor={`file-${docType}`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                >
                  <FaUpload className="w-4 h-4 mr-2" />
                  Choose File
                </label>
                
                {doc.file && (
                  <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                    <span className="text-sm text-gray-700">{(doc.file as File).name}</span>
                    <button
                      onClick={() => uploadDocument(docType)}
                      disabled={isLoading}
                      className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isLoading ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto">
              <FaUser className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Welcome to Solutil!</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're excited to have you join our platform as a service provider. This quick onboarding process will help you get verified and start receiving bookings from customers.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="text-center p-6">
                <FaUpload className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Documents</h3>
                <p className="text-gray-600">Verify your identity and qualifications</p>
              </div>
              <div className="text-center p-6">
                <FaCertificate className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Complete Profile</h3>
                <p className="text-gray-600">Set up your professional profile</p>
              </div>
              <div className="text-center p-6">
                <FaCheckCircle className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Get Approved</h3>
                <p className="text-gray-600">Start receiving customer bookings</p>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Required Documents</h2>
              <p className="text-gray-600">Please upload the following documents for verification</p>
            </div>
            
            <div className="grid gap-6">
              <DocumentUploadCard
                docType="nationalId"
                title="National ID"
                description="Upload a clear photo of your national identification card"
                icon={FaIdCard}
              />
              
              <DocumentUploadCard
                docType="businessLicense"
                title="Business License"
                description="Upload your valid business license or permit"
                icon={FaBuilding}
              />
              
              <DocumentUploadCard
                docType="certificate"
                title="Professional Certificate"
                description="Upload relevant professional certification or qualification"
                icon={FaCertificate}
              />
              
              <DocumentUploadCard
                docType="goodConductCertificate"
                title="Good Conduct Certificate"
                description="Upload a valid certificate of good conduct from DCI"
                icon={FaShieldAlt}
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Profile</h2>
              <p className="text-gray-600">Tell us about your experience and services</p>
            </div>

            <div className="grid gap-8">
              {/* Experience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience *
                </label>
                <select
                  value={profile.experience}
                  onChange={(e) => setProfile(prev => ({ ...prev, experience: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select experience level</option>
                  <option value="0-1">Less than 1 year</option>
                  <option value="1-3">1-3 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="5-10">5-10 years</option>
                  <option value="10+">10+ years</option>
                </select>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills & Services *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {AVAILABLE_SKILLS.map((skill) => (
                    <label key={skill} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profile.skills.includes(skill)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setProfile(prev => ({
                              ...prev,
                              skills: [...prev.skills, skill]
                            }))
                          } else {
                            setProfile(prev => ({
                              ...prev,
                              skills: prev.skills.filter(s => s !== skill)
                            }))
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{skill}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Hourly Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hourly Rate (KES) *
                </label>
                <div className="relative">
                  <FaDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    value={profile.hourlyRate}
                    onChange={(e) => setProfile(prev => ({ ...prev, hourlyRate: e.target.value }))}
                    placeholder="e.g., 1500"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Service Areas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Areas *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-48 overflow-y-auto">
                  {KENYAN_CITIES.map((city) => (
                    <label key={city} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profile.serviceAreas.includes(city)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setProfile(prev => ({
                              ...prev,
                              serviceAreas: [...prev.serviceAreas, city]
                            }))
                          } else {
                            setProfile(prev => ({
                              ...prev,
                              serviceAreas: prev.serviceAreas.filter(s => s !== city)
                            }))
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{city}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Availability *
                </label>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Working Days</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {DAYS_OF_WEEK.map((day) => (
                        <label key={day} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={profile.availability.days.includes(day)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setProfile(prev => ({
                                  ...prev,
                                  availability: {
                                    ...prev.availability,
                                    days: [...prev.availability.days, day]
                                  }
                                }))
                              } else {
                                setProfile(prev => ({
                                  ...prev,
                                  availability: {
                                    ...prev.availability,
                                    days: prev.availability.days.filter(d => d !== day)
                                  }
                                }))
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{day}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Start Time</label>
                      <input
                        type="time"
                        value={profile.availability.hours.start}
                        onChange={(e) => setProfile(prev => ({
                          ...prev,
                          availability: {
                            ...prev.availability,
                            hours: { ...prev.availability.hours, start: e.target.value }
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">End Time</label>
                      <input
                        type="time"
                        value={profile.availability.hours.end}
                        onChange={(e) => setProfile(prev => ({
                          ...prev,
                          availability: {
                            ...prev.availability,
                            hours: { ...prev.availability.hours, end: e.target.value }
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Professional Bio *
                </label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  placeholder="Tell customers about your experience, specialties, and what makes you unique..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {profile.bio.length}/500 characters
                </p>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Application</h2>
              <p className="text-gray-600">Please review your information before submitting</p>
            </div>

            <div className="grid gap-6">
              {/* Documents Review */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(documents).map(([key, doc]) => (
                    <div key={key} className="flex items-center space-x-3">
                      <FaCheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Profile Review */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
                <div className="grid gap-4">
                  <div>
                    <span className="font-medium text-gray-700">Experience:</span> {profile.experience} years
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Skills:</span> {profile.skills.join(', ')}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Hourly Rate:</span> KES {profile.hourlyRate}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Service Areas:</span> {profile.serviceAreas.join(', ')}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Availability:</span> {profile.availability.days.join(', ')} ({profile.availability.hours.start} - {profile.availability.hours.end})
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <FaExclamationTriangle className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">What happens next?</h4>
                  <p className="text-blue-800 text-sm">
                    After submitting your application, our team will review your documents and profile. 
                    This usually takes 2-3 business days. You'll receive an email notification once your account is approved.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // Show blocking message for users who shouldn't be here
  if (shouldBlock) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-white p-8 rounded-xl shadow-sm">
          <FaExclamationTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Under Review</h2>
          <p className="text-gray-600 mb-6">
            Your provider application is currently being reviewed by our admin team. 
            You cannot make changes or resubmit while the review is in progress.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Redirecting to status page in 3 seconds...
          </p>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <RoleGuard requiredRole="provider">
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {ONBOARDING_STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full ${
                    step.id <= currentStep 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step.id < currentStep ? (
                      <FaCheck className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={`ml-3 text-sm font-medium ${
                    step.id <= currentStep ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                  {index < ONBOARDING_STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      step.id < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            {renderStep()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </button>

            {currentStep < ONBOARDING_STEPS.length ? (
              <button
                onClick={nextStep}
                disabled={
                  (currentStep === 2 && !canProceedFromDocuments()) ||
                  (currentStep === 3 && !canProceedFromProfile()) ||
                  isLoading
                }
                className="inline-flex items-center px-6 py-3 bg-blue-600 border border-transparent rounded-lg font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <FaArrowRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                onClick={completeOnboarding}
                disabled={isLoading}
                className="inline-flex items-center px-8 py-3 bg-green-600 border border-transparent rounded-lg font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Submitting...' : 'Submit Application'}
                <FaCheckCircle className="w-4 h-4 ml-2" />
              </button>
            )}
          </div>
        </div>
      </div>
    </RoleGuard>
  )
}