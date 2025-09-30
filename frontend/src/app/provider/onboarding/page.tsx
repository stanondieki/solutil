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
  FaExclamationTriangle,
  FaEye,
  FaPlus
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
  profilePhoto: {
    file: File | null
    preview: string
    uploaded: boolean
    url?: string
  }
  services: {
    title: string
    description: string
    category: string
    price: string
    priceType: 'fixed' | 'hourly' | 'quote'
  }[]
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
  const [documents, setDocuments] = useState<{
    nationalId: DocumentUpload
    businessLicense: DocumentUpload
    certificate: DocumentUpload
    goodConductCertificate: DocumentUpload
  }>({
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
    bio: '',
    profilePhoto: {
      file: null,
      preview: '',
      uploaded: false
    },
    services: []
  })
  const [documentPreviews, setDocumentPreviews] = useState<{[key: string]: string}>({})

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

    // Create preview for documents
    const reader = new FileReader()
    reader.onload = (e) => {
      setDocumentPreviews(prev => ({
        ...prev,
        [docType]: e.target?.result as string
      }))
    }
    reader.readAsDataURL(file)

    setDocuments(prev => ({
      ...prev,
      [docType]: { ...prev[docType], file, error: '' }
    }))
  }

  const handleProfilePhotoSelect = (file: File) => {
    if (!file) return
    
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg']
    const maxSize = 3 * 1024 * 1024 // 3MB for profile photos
    
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image (JPG, PNG) for your profile photo')
      return
    }
    
    if (file.size > maxSize) {
      alert('Profile photo must be less than 3MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setProfile(prev => ({
        ...prev,
        profilePhoto: {
          file,
          preview: e.target?.result as string,
          uploaded: false
        }
      }))
    }
    reader.readAsDataURL(file)
  }

  const addService = () => {
    setProfile(prev => ({
      ...prev,
      services: [...prev.services, {
        title: '',
        description: '',
        category: '',
        price: '',
        priceType: 'hourly' as const
      }]
    }))
  }

  const updateService = (index: number, field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      services: prev.services.map((service, i) => 
        i === index ? { ...service, [field]: value } : service
      )
    }))
  }

  const removeService = (index: number) => {
    setProfile(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
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
    // Business license is now optional, check only required documents
    const requiredDocs = ['nationalId', 'certificate', 'goodConductCertificate']
    return requiredDocs.every(docType => documents[docType as keyof typeof documents].uploaded)
  }

  const canProceedFromProfile = () => {
    return profile.experience && 
           profile.skills.length > 0 && 
           profile.hourlyRate && 
           profile.serviceAreas.length > 0 && 
           profile.bio &&
           profile.availability.days.length > 0 &&
           profile.profilePhoto.file !== null &&
           profile.services.length > 0 &&
           profile.services.every(service => 
             service.title.trim() && 
             service.category && 
             service.price && 
             service.description.trim()
           )
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
              <div className="space-y-4">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => e.target.files && handleFileSelect(docType, e.target.files[0])}
                  className="hidden"
                  id={`file-${docType}`}
                />
                <label
                  htmlFor={`file-${docType}`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <FaUpload className="w-4 h-4 mr-2" />
                  Choose File
                </label>
                
                {doc.file && (
                  <>
                    {/* Document Preview */}
                    {documentPreviews[docType] && doc.file && (
                      <div className="mt-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4">
                        <h4 className="text-sm font-bold text-gray-900 mb-3">Document Preview</h4>
                        <div className="flex items-start space-x-4">
                          <div className="w-32 h-40 bg-white border border-gray-300 rounded-lg overflow-hidden flex-shrink-0">
                            {doc.file.type === 'application/pdf' ? (
                              <div className="w-full h-full flex items-center justify-center text-gray-500">
                                <div className="text-center">
                                  <FaUpload className="w-8 h-8 mx-auto mb-2" />
                                  <p className="text-xs">PDF Document</p>
                                </div>
                              </div>
                            ) : (
                              <img 
                                src={documentPreviews[docType]} 
                                alt="Document Preview" 
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 mb-1">File: {doc.file.name}</p>
                            <p className="text-sm text-gray-600 mb-1">Size: {(doc.file.size / 1024 / 1024).toFixed(2)} MB</p>
                            <p className="text-sm text-gray-600 mb-3">Type: {doc.file.type}</p>
                            <p className="text-xs text-gray-500 bg-blue-50 p-2 rounded border">
                              ✓ Preview looks good? Click "Upload Document" below to proceed.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Upload Control */}
                    <div className="flex items-center justify-between bg-blue-50 px-4 py-3 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-3">
                        <FaEye className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-900">{doc.file?.name || 'Document'}</span>
                      </div>
                      <button
                        onClick={() => uploadDocument(docType)}
                        disabled={isLoading}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <FaUpload className="w-4 h-4 mr-2" />
                            Upload Document
                          </>
                        )}
                      </button>
                    </div>
                  </>
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
                title="Business License (Optional)"
                description="Upload your valid business license or permit if you have one"
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
              <p className="text-gray-600 font-medium">Tell us about your experience and services. This information will be visible to potential clients.</p>
            </div>

            <div className="grid gap-8">
              {/* Profile Photo Upload */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Profile Photo *
                </label>
                <p className="text-sm text-gray-700 font-medium mb-4">
                  Upload a professional photo that clients will see on your profile
                </p>
                
                <div className="flex items-center space-x-6">
                  {/* Photo Preview */}
                  <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50 overflow-hidden">
                    {profile.profilePhoto.preview ? (
                      <img 
                        src={profile.profilePhoto.preview} 
                        alt="Profile Preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <FaUser className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-xs text-gray-500 font-medium">No photo selected</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Upload Controls */}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg"
                      onChange={(e) => e.target.files && handleProfilePhotoSelect(e.target.files[0])}
                      className="hidden"
                      id="profile-photo-upload"
                    />
                    <label
                      htmlFor="profile-photo-upload"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 cursor-pointer"
                    >
                      <FaUpload className="w-4 h-4 mr-2" />
                      Choose Photo
                    </label>
                    <p className="text-xs text-gray-600 font-medium mt-2">
                      Recommended: Square photo, max 3MB, JPG/PNG format
                    </p>
                    {profile.profilePhoto.file && (
                      <p className="text-sm text-green-600 font-medium mt-1">
                        ✓ Photo selected: {profile.profilePhoto.file.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Experience */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Years of Experience *
                </label>
                <select
                  value={profile.experience}
                  onChange={(e) => setProfile(prev => ({ ...prev, experience: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-gray-900"
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
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Core Skills & Expertise *
                </label>
                <p className="text-sm text-gray-700 font-medium mb-4">
                  Select all skills you can provide to clients
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto bg-gray-50 p-4 rounded-lg border">
                  {AVAILABLE_SKILLS.map((skill) => (
                    <label key={skill} className="flex items-center space-x-3 cursor-pointer bg-white p-3 rounded-lg border hover:border-blue-300 transition-colors">
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
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span className="text-sm font-medium text-gray-900">{skill}</span>
                    </label>
                  ))}
                </div>
                {profile.skills.length > 0 && (
                  <p className="text-sm text-blue-600 font-medium mt-2">
                    ✓ {profile.skills.length} skill{profile.skills.length === 1 ? '' : 's'} selected
                  </p>
                )}
              </div>

              {/* Services Section */}
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1">
                      Your Services *
                    </label>
                    <p className="text-sm text-gray-700 font-medium">
                      Create the specific services you'll offer to clients (minimum 1 required)
                    </p>
                  </div>
                  <button
                    onClick={addService}
                    type="button"
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <FaPlus className="w-4 h-4 mr-2" />
                    Add Service
                  </button>
                </div>

                {profile.services.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-green-300 rounded-lg">
                    <p className="text-gray-600 font-medium mb-3">No services added yet</p>
                    <p className="text-sm text-gray-500">Click "Add Service" to create your first service offering</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {profile.services.map((service, index) => (
                      <div key={index} className="bg-white border border-green-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="text-sm font-bold text-gray-900">Service #{index + 1}</h4>
                          <button
                            onClick={() => removeService(index)}
                            type="button"
                            className="text-red-500 hover:text-red-700"
                          >
                            <FaTimes className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Service Title *</label>
                            <input
                              type="text"
                              value={service.title}
                              onChange={(e) => updateService(index, 'title', e.target.value)}
                              placeholder="e.g., Kitchen Plumbing Repair"
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-medium focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Category *</label>
                            <select
                              value={service.category}
                              onChange={(e) => updateService(index, 'category', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-medium focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            >
                              <option value="">Select category</option>
                              {AVAILABLE_SKILLS.map((skill) => (
                                <option key={skill} value={skill}>{skill}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Price (KES) *</label>
                            <div className="flex">
                              <input
                                type="number"
                                value={service.price}
                                onChange={(e) => updateService(index, 'price', e.target.value)}
                                placeholder="1500"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-l text-sm font-medium focus:ring-2 focus:ring-green-500 focus:border-green-500"
                              />
                              <select
                                value={service.priceType}
                                onChange={(e) => updateService(index, 'priceType', e.target.value)}
                                className="px-3 py-2 border-l-0 border border-gray-300 rounded-r text-sm font-medium focus:ring-2 focus:ring-green-500 focus:border-green-500"
                              >
                                <option value="hourly">per hour</option>
                                <option value="fixed">fixed price</option>
                                <option value="quote">custom quote</option>
                              </select>
                            </div>
                          </div>
                          
                          <div className="md:col-span-1">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Description *</label>
                            <textarea
                              value={service.description}
                              onChange={(e) => updateService(index, 'description', e.target.value)}
                              placeholder="Brief description of what this service includes..."
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-medium focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Hourly Rate */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Base Hourly Rate (KES) *
                </label>
                <p className="text-sm text-gray-700 font-medium mb-3">
                  Your standard hourly rate (you can set specific prices for individual services above)
                </p>
                <div className="relative">
                  <FaDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    value={profile.hourlyRate}
                    onChange={(e) => setProfile(prev => ({ ...prev, hourlyRate: e.target.value }))}
                    placeholder="e.g., 1500"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-gray-900"
                  />
                </div>
              </div>

              {/* Service Areas */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Service Areas *
                </label>
                <p className="text-sm text-gray-700 font-medium mb-4">
                  Select all locations where you can provide services
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-48 overflow-y-auto bg-gray-50 p-4 rounded-lg border">
                  {KENYAN_CITIES.map((city) => (
                    <label key={city} className="flex items-center space-x-3 cursor-pointer bg-white p-3 rounded-lg border hover:border-blue-300 transition-colors">
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
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span className="text-sm font-medium text-gray-900">{city}</span>
                    </label>
                  ))}
                </div>
                {profile.serviceAreas.length > 0 && (
                  <p className="text-sm text-blue-600 font-medium mt-2">
                    ✓ {profile.serviceAreas.length} location{profile.serviceAreas.length === 1 ? '' : 's'} selected
                  </p>
                )}
              </div>

              {/* Availability */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-4">
                  Availability *
                </label>
                <p className="text-sm text-gray-700 font-medium mb-4">
                  Set your working schedule for client bookings
                </p>
                <div className="space-y-6 bg-gray-50 p-4 rounded-lg border">
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-3">Working Days</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {DAYS_OF_WEEK.map((day) => (
                        <label key={day} className="flex items-center space-x-3 cursor-pointer bg-white p-3 rounded-lg border hover:border-blue-300 transition-colors">
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
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                          />
                          <span className="text-sm font-medium text-gray-900">{day}</span>
                        </label>
                      ))}
                    </div>
                    {profile.availability.days.length > 0 && (
                      <p className="text-sm text-blue-600 font-medium mt-2">
                        ✓ Available {profile.availability.days.length} day{profile.availability.days.length === 1 ? '' : 's'} per week
                      </p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-2">Start Time</label>
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-2">End Time</label>
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-gray-900"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Professional Bio *
                </label>
                <p className="text-sm text-gray-700 font-medium mb-3">
                  Describe your experience, specialties, and what makes you the right choice for clients
                </p>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  rows={5}
                  placeholder="Tell customers about your experience, specialties, and what makes you unique..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-gray-900 resize-none"
                  maxLength={500}
                />
                <p className="text-sm text-gray-600 font-medium mt-2">
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
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h3>
                
                {/* Profile Photo */}
                {profile.profilePhoto.preview && (
                  <div className="flex items-center space-x-4 mb-6 bg-white p-4 rounded-lg border">
                    <img 
                      src={profile.profilePhoto.preview} 
                      alt="Profile Photo" 
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Profile Photo</p>
                      <p className="text-sm text-gray-600">✓ Photo ready for upload</p>
                    </div>
                  </div>
                )}
                
                <div className="grid gap-4">
                  <div>
                    <span className="font-medium text-gray-700">Experience:</span> {profile.experience}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Skills:</span> {profile.skills.join(', ')}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Base Hourly Rate:</span> KES {profile.hourlyRate}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Service Areas:</span> {profile.serviceAreas.join(', ')}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Availability:</span> {profile.availability.days.join(', ')} ({profile.availability.hours.start} - {profile.availability.hours.end})
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Professional Bio:</span>
                    <p className="text-gray-600 mt-1 text-sm bg-white p-3 rounded border">{profile.bio}</p>
                  </div>
                </div>
              </div>

              {/* Services Review */}
              {profile.services.length > 0 && (
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Services ({profile.services.length})</h3>
                  <div className="grid gap-4">
                    {profile.services.map((service, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg border border-green-200">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{service.title}</h4>
                          <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                            {service.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                        <div className="text-sm text-gray-700">
                          <strong>Price:</strong> KES {service.price} {service.priceType === 'hourly' ? 'per hour' : service.priceType === 'fixed' ? 'fixed' : 'custom quote'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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