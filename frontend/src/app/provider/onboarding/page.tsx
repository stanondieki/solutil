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
  FaPlus,
  FaCamera
} from 'react-icons/fa'

interface DocumentUpload {
  file: File | null
  uploaded: boolean
  uploading?: boolean
  verified: boolean
  url?: string
  error?: string
}

interface ProviderProfile {
  experience: string
  availability: {
    days: string[]
    hours: { start: string; end: string }
    timeSlots: {
      day: string
      slots: { start: string; end: string; available: boolean }[]
    }[]
    advanceBooking: number // days in advance
    minimumNotice: number // hours minimum notice
  }
  serviceAreas: string[]
  bio: string
  profilePhoto: {
    file: File | null
    preview: string
    uploaded: boolean
    url?: string
  }
  serviceCategories: {
    [category: string]: {
      subServices: string[]
      experience: string
      description: string
    }
  }
  portfolio: {
    id: string
    title: string
    description: string
    category: string
    beforeImage: {
      file: File | null
      preview: string
      uploaded: boolean
      url?: string
    }
    afterImage: {
      file: File | null
      preview: string
      uploaded: boolean
      url?: string
    }
    completionDate: string
    clientFeedback: string
  }[]
  homeAddress: {
    street: string
    area: string
    postalCode: string
  }
  phoneNumber: string
  emergencyContact: {
    name: string
    relationship: string
    phoneNumber: string
  }
  languages: string[]
  professionalMemberships: {
    organization: string
    membershipId: string
    certificateUrl?: string
  }[]
  paymentInfo: {
    preferredMethod: 'mpesa' | 'bank' | 'both'
    mpesaNumber: string
    bankDetails: {
      bankName: string
      accountNumber: string
      accountName: string
      branchCode: string
    }
  }
  materialSourcing: {
    hasOwnMaterials: boolean
    materialsList: string
  }

}

const ONBOARDING_STEPS = [
  { id: 1, title: 'Welcome', icon: FaUser },
  { id: 2, title: 'Profile Setup', icon: FaCertificate },
  { id: 3, title: 'Documents', icon: FaUpload },
  { id: 4, title: 'Review', icon: FaCheckCircle }
]

// Standardized Platform Pricing (KES fixed rates)
const STANDARD_PRICING = {
  'Cleaning': 1800,
  'Plumbing': 2000,
  'Electrical': 2000,
  'Carpentry': 2500,
  'Moving Services': 3000, // Base rate, varies by house size
  'Painting': 1800,
  'Gardening': 1500,
  'HVAC': 2200,
  'Roofing': 2800,
  'Flooring': 2300,
  'Kitchen Renovation': 3000,
  'Bathroom Renovation': 2800,
  'General Maintenance': 1800,
  'Appliance Repair': 2200,
  'Locksmith Services': 2500,
  'Security Systems': 2400,
  'Solar Installation': 3500,
  'Pest Control': 1600,
  'Interior Design': 2500
}

// Special pricing rules for Moving Services based on house size
const MOVING_PRICING = {
  'Studio/1BR': 3000,
  '2BR': 4500,
  '3BR': 6000,
  '4BR+': 8000
}

// Service Categories with Sub-Services
const SERVICE_CATEGORIES = {
  'Cleaning': [
    'House Cleaning',
    'Office Cleaning', 
    'Carpet Cleaning',
    'Window Cleaning',
    'Deep Cleaning',
    'Move-in/Move-out Cleaning',
    'Post-Construction Cleaning',
    'Upholstery Cleaning'
  ],
  'Plumbing': [
    'Pipe Repairs',
    'Toilet Installation/Repair',
    'Sink Installation/Repair',
    'Shower/Bath Installation',
    'Water Heater Installation',
    'Drain Cleaning',
    'Leak Detection',
    'Emergency Plumbing'
  ],
  'Electrical': [
    'Wiring Installation',
    'Light Fixture Installation',
    'Outlet/Switch Installation',
    'Electrical Panel Upgrades',
    'Fan Installation',
    'Smart Home Setup',
    'Electrical Troubleshooting',
    'Emergency Electrical'
  ],
  'Carpentry': [
    'Furniture Assembly',
    'Custom Cabinets',
    'Shelving Installation',
    'Door Installation',
    'Window Installation',
    'Deck Building',
    'Trim Work',
    'Furniture Repair'
  ],
  'Painting': [
    'Interior Painting',
    'Exterior Painting',
    'Cabinet Painting',
    'Fence Painting',
    'Wall Preparation',
    'Decorative Painting',
    'Touch-up Work',
    'Pressure Washing'
  ],
  'Gardening': [
    'Lawn Mowing',
    'Garden Design',
    'Tree Trimming',
    'Landscaping',
    'Irrigation Installation',
    'Pest Control (Garden)',
    'Seasonal Cleanup',
    'Plant Installation'
  ],
  'Moving Services': [
    'Local Moving',
    'Long Distance Moving',
    'Packing Services',
    'Furniture Moving',
    'Office Moving',
    'Loading/Unloading',
    'Storage Services',
    'Specialty Item Moving'
  ],
  'General Maintenance': [
    'Home Inspections',
    'Appliance Maintenance',
    'HVAC Maintenance',
    'Gutter Cleaning',
    'Pressure Washing',
    'Handyman Services',
    'Safety Checks',
    'Preventive Maintenance'
  ]
}

const KENYAN_CITIES = [
  'Kileleshwa', 'Kilimani', 'Westlands', 'Parklands', 'Nyayo'
]

const AVAILABLE_LANGUAGES = [
  'English', 'Swahili', 'Kikuyu', 'Luo', 'Luhya', 'Kamba', 'Kalenjin', 
  'Kisii', 'Meru', 'Mijikenda', 'Turkana', 'Maasai'
]

const PROFESSIONAL_ORGANIZATIONS = [
  'Kenya Association of Manufacturers (KAM)',
  'Institution of Engineers of Kenya (IEK)', 
  'Architectural Association of Kenya (AAK)',
  'Kenya Institute of Plumbers (KIP)',
  'Electrical Contractors Association of Kenya (ECAK)',
  'Kenya Master Painters Association (KMPA)',
  'Kenya Building and Construction Industry Federation (KBCIF)',
  'National Industrial Training Authority (NITA)',
  'Kenya Bureau of Standards (KEBS)',
  'Other Professional Body'
]

const KENYAN_BANKS = [
  'Kenya Commercial Bank (KCB)',
  'Equity Bank',
  'Cooperative Bank',
  'Absa Bank Kenya',
  'Standard Chartered Bank',
  'NCBA Bank',
  'Stanbic Bank',
  'Diamond Trust Bank (DTB)',
  'I&M Bank',
  'Family Bank',
  'Sidian Bank',
  'Gulf African Bank',
  'Prime Bank',
  'Other Bank'
]

const PORTFOLIO_CATEGORIES = [
  'Plumbing Repairs',
  'Electrical Work', 
  'Carpentry',
  'Painting & Decoration',
  'Home Cleaning',
  'Garden & Landscaping',
  'Appliance Repair',
  'Construction',
  'Interior Design',
  'Maintenance',
  'Installation',
  'Other'
]

const TUTORIAL_STEPS = [
  {
    target: '.progress-steps',
    title: '👋 Welcome to Provider Onboarding!',
    content: 'Complete these 4 simple steps to become a verified service provider. Your progress is automatically saved!',
    position: 'bottom'
  },
  {
    target: '.auto-save-indicator',
    title: '💾 Auto-Save Feature',
    content: 'Don\'t worry about losing your progress! We automatically save your information every 30 seconds.',
    position: 'bottom'
  },
  {
    target: '.profile-section',
    title: '📋 Complete Profile Setup',
    content: 'Fill out your professional details, emergency contacts, and payment information. This builds trust with clients!',
    position: 'top'
  },
  {
    target: '.camera-upload',
    title: '📸 Enhanced Photo Upload',
    content: 'Use your camera to take photos directly or choose from your gallery. Perfect for documents and portfolio!',
    position: 'top'
  },
  {
    target: '.portfolio-gallery',
    title: '🎨 Portfolio Gallery',
    content: 'Showcase your best work with before & after photos. Providers with portfolios get 3x more bookings!',
    position: 'top'
  }
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
    availability: {
      days: [],
      hours: { start: '09:00', end: '17:00' },
      timeSlots: [],
      advanceBooking: 30,
      minimumNotice: 24
    },
    serviceAreas: [],
    bio: '',
    profilePhoto: {
      file: null,
      preview: '',
      uploaded: false
    },
    serviceCategories: {},
    portfolio: [],
    homeAddress: {
      street: '',
      area: '',
      postalCode: ''
    },
    phoneNumber: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phoneNumber: ''
    },
    languages: [],
    professionalMemberships: [],
    paymentInfo: {
      preferredMethod: 'mpesa',
      mpesaNumber: '',
      bankDetails: {
        bankName: '',
        accountNumber: '',
        accountName: '',
        branchCode: ''
      }
    },
    materialSourcing: {
      hasOwnMaterials: false,
      materialsList: ''
    }
  })
  const [documentPreviews, setDocumentPreviews] = useState<{[key: string]: string}>({})
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [showTutorial, setShowTutorial] = useState(true)
  const [tutorialStep, setTutorialStep] = useState(0)

  // Auto-save functionality
  useEffect(() => {
    const saveProgress = async () => {
      if (!user) return
      
      try {
        setIsSaving(true)
        setSaveError(null)
        
        const progressData = {
          currentStep,
          profile,
          documents: Object.keys(documents).reduce((acc, key) => {
            acc[key] = {
              uploaded: documents[key as keyof typeof documents].uploaded,
              verified: documents[key as keyof typeof documents].verified,
              url: documents[key as keyof typeof documents].url
            }
            return acc
          }, {} as any)
        }
        
        localStorage.setItem(`onboarding_progress_${user._id}`, JSON.stringify(progressData))
        setLastSaved(new Date())
      } catch (error) {
        console.error('Auto-save failed:', error)
        setSaveError('Failed to save progress')
      } finally {
        setIsSaving(false)
      }
    }

    // Auto-save every 30 seconds
    const interval = setInterval(saveProgress, 30000)
    
    // Save on major changes
    const timeoutId = setTimeout(saveProgress, 2000)
    
    return () => {
      clearInterval(interval)
      clearTimeout(timeoutId)
    }
  }, [currentStep, profile, documents, user])

  // Load saved progress on mount
  useEffect(() => {
    if (!user) return
    
    try {
      const savedProgress = localStorage.getItem(`onboarding_progress_${user._id}`)
      if (savedProgress) {
        const progressData = JSON.parse(savedProgress)
        
        if (progressData.currentStep) {
          setCurrentStep(progressData.currentStep)
        }
        
        if (progressData.profile) {
          setProfile(prev => ({ ...prev, ...progressData.profile }))
        }
        
        if (progressData.documents) {
          setDocuments(prev => {
            const updated = { ...prev }
            Object.keys(progressData.documents).forEach(key => {
              if (updated[key as keyof typeof documents]) {
                updated[key as keyof typeof documents] = {
                  ...updated[key as keyof typeof documents],
                  ...progressData.documents[key]
                }
              }
            })
            return updated
          })
        }
      }
    } catch (error) {
      console.error('Failed to load saved progress:', error)
    }
  }, [user])

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

  const handlePortfolioImageSelect = (portfolioId: string, type: 'before' | 'after', file: File) => {
    const preview = URL.createObjectURL(file)
    setProfile(prev => ({
      ...prev,
      portfolio: prev.portfolio.map(item => 
        item.id === portfolioId 
          ? {
              ...item,
              [type === 'before' ? 'beforeImage' : 'afterImage']: {
                file,
                preview,
                uploaded: false
              }
            }
          : item
      )
    }))
  }

  const addPortfolioItem = () => {
    const newItem = {
      id: Date.now().toString(),
      title: '',
      description: '',
      category: '',
      beforeImage: { file: null, preview: '', uploaded: false },
      afterImage: { file: null, preview: '', uploaded: false },
      completionDate: '',
      clientFeedback: ''
    }
    setProfile(prev => ({
      ...prev,
      portfolio: [...prev.portfolio, newItem]
    }))
  }

  const updatePortfolioItem = (id: string, field: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      portfolio: prev.portfolio.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }))
  }

  const nextTutorialStep = () => {
    if (tutorialStep < TUTORIAL_STEPS.length - 1) {
      setTutorialStep(tutorialStep + 1)
    } else {
      setShowTutorial(false)
      localStorage.setItem('onboarding_tutorial_completed', 'true')
    }
  }

  const skipTutorial = () => {
    setShowTutorial(false)
    localStorage.setItem('onboarding_tutorial_completed', 'true')
  }

  const restartTutorial = () => {
    setShowTutorial(true)
    setTutorialStep(0)
    localStorage.removeItem('onboarding_tutorial_completed')
  }

  // Check if tutorial was completed
  useEffect(() => {
    const completed = localStorage.getItem('onboarding_tutorial_completed')
    if (completed) {
      setShowTutorial(false)
    }
  }, [])

  const removePortfolioItem = (id: string) => {
    setProfile(prev => ({
      ...prev,
      portfolio: prev.portfolio.filter(item => item.id !== id)
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

  // Functions for managing service categories
  const addServiceCategory = (category: string) => {
    if (!profile.serviceCategories[category]) {
      setProfile(prev => ({
        ...prev,
        serviceCategories: {
          ...prev.serviceCategories,
          [category]: {
            subServices: [],
            experience: '',
            description: ''
          }
        }
      }))
    }
  }

  const removeServiceCategory = (category: string) => {
    setProfile(prev => {
      const newCategories = { ...prev.serviceCategories }
      delete newCategories[category]
      return {
        ...prev,
        serviceCategories: newCategories
      }
    })
  }

  const updateServiceCategory = (category: string, field: string, value: string | string[]) => {
    setProfile(prev => ({
      ...prev,
      serviceCategories: {
        ...prev.serviceCategories,
        [category]: {
          ...prev.serviceCategories[category],
          [field]: value
        }
      }
    }))
  }

  const toggleSubService = (category: string, subService: string) => {
    setProfile(prev => {
      const currentSubServices = prev.serviceCategories[category]?.subServices || []
      const isSelected = currentSubServices.includes(subService)
      
      return {
        ...prev,
        serviceCategories: {
          ...prev.serviceCategories,
          [category]: {
            ...prev.serviceCategories[category],
            subServices: isSelected 
              ? currentSubServices.filter(s => s !== subService)
              : [...currentSubServices, subService]
          }
        }
      }
    })
  }

  const uploadDocument = async (docType: keyof typeof documents, retryCount = 0) => {
    const document = documents[docType]
    if (!document.file) return

    setIsLoading(true)
    
    // Set uploading state for this specific document
    setDocuments(prev => ({
      ...prev,
      [docType]: { 
        ...prev[docType], 
        uploading: true,
        error: '' 
      }
    }))

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
          uploading: false,
          url: data.data?.document?.url || data.url,
          error: '' 
        }
      }))

      // Show success message
      alert(`${docType} uploaded successfully!`)
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      
      // Retry logic for network errors
      if (retryCount < 2 && (errorMessage.includes('fetch') || errorMessage.includes('network'))) {
        console.log(`Retrying upload for ${docType}, attempt ${retryCount + 1}`)
        setTimeout(() => {
          uploadDocument(docType, retryCount + 1)
        }, 1000 * (retryCount + 1)) // Exponential backoff
        return
      }

      setDocuments(prev => ({
        ...prev,
        [docType]: { 
          ...prev[docType], 
          uploading: false,
          error: `${errorMessage}${retryCount > 0 ? ` (after ${retryCount + 1} attempts)` : ''}`
        }
      }))
    } finally {
      setIsLoading(false)
    }
  }

  const saveProfile = async () => {
    setIsLoading(true)
    try {
      let profilePhotoUrl = ''
      
      // Upload profile photo first if selected
      if (profile.profilePhoto.file) {
        const photoFormData = new FormData()
        photoFormData.append('profilePicture', profile.profilePhoto.file)
        
        const photoResponse = await fetch('/api/upload/profile-picture', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: photoFormData
        })

        if (photoResponse.ok) {
          const photoData = await photoResponse.json()
          profilePhotoUrl = photoData.data?.url || ''
          
          // Update profile state with uploaded photo URL
          setProfile(prev => ({
            ...prev,
            profilePhoto: {
              ...prev.profilePhoto,
              uploaded: true,
              url: profilePhotoUrl
            }
          }))
        }
      }

      // Transform serviceCategories to skills and services for backend compatibility
      const skills = Object.keys(profile.serviceCategories)
      const services = Object.entries(profile.serviceCategories).map(([category, details]) => ({
        category,
        subServices: details.subServices,
        experience: details.experience,
        description: details.description,
        pricing: {
          hourlyRate: STANDARD_PRICING[category as keyof typeof STANDARD_PRICING] || 1000,
          fixedRate: STANDARD_PRICING[category as keyof typeof STANDARD_PRICING] || 1000,
          currency: 'KES'
        }
      }))

      // Calculate average hourly rate from selected categories
      const hourlyRate = skills.length > 0 
        ? skills.reduce((sum, skill) => sum + (STANDARD_PRICING[skill as keyof typeof STANDARD_PRICING] || 1000), 0) / skills.length
        : 1000

      // Transform materialSourcing to match backend schema
      const materialSourcing = {
        option: profile.materialSourcing.hasOwnMaterials ? 'provider' : 'client',
        markup: 0,
        details: profile.materialSourcing.materialsList || ''
      }

      // Transform availability to include missing fields
      const availability = {
        ...profile.availability,
        timeSlots: profile.availability.timeSlots || [],
        advanceBooking: profile.availability.advanceBooking || 30,
        minimumNotice: profile.availability.minimumNotice || 24
      }

      // Prepare profile data including services and photo
      const profileData = {
        ...profile,
        skills, // Transform serviceCategories to skills array
        services, // Transform serviceCategories to services array with details
        hourlyRate, // Calculate average hourly rate
        materialSourcing, // Transform to backend schema
        availability, // Include all availability fields
        profilePhoto: profilePhotoUrl ? { url: profilePhotoUrl } : undefined
      }

      const response = await fetch('/api/provider/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(profileData)
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
           profile.serviceAreas.length > 0 && 
           profile.bio &&
           profile.availability.days.length > 0 &&
           profile.profilePhoto.file !== null &&
           Object.keys(profile.serviceCategories).length > 0 &&
           Object.values(profile.serviceCategories).every(category => 
             category.subServices.length > 0 && 
             category.description.trim()
           ) &&
           profile.homeAddress.street.trim() &&
           profile.homeAddress.area.trim() &&
           profile.phoneNumber.trim() &&
           profile.emergencyContact.name.trim() &&
           profile.emergencyContact.relationship.trim() &&
           profile.emergencyContact.phoneNumber.trim() &&
           profile.languages.length > 0 &&
           profile.materialSourcing.hasOwnMaterials !== null &&
           (!profile.materialSourcing.hasOwnMaterials || profile.materialSourcing.materialsList?.trim()) &&
           (
             (profile.paymentInfo.preferredMethod === 'mpesa' && profile.paymentInfo.mpesaNumber.trim()) ||
             (profile.paymentInfo.preferredMethod === 'bank' && 
              profile.paymentInfo.bankDetails.bankName && 
              profile.paymentInfo.bankDetails.accountName.trim() && 
              profile.paymentInfo.bankDetails.accountNumber.trim()) ||
             (profile.paymentInfo.preferredMethod === 'both' && 
              profile.paymentInfo.mpesaNumber.trim() &&
              profile.paymentInfo.bankDetails.bankName && 
              profile.paymentInfo.bankDetails.accountName.trim() && 
              profile.paymentInfo.bankDetails.accountNumber.trim())
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
                  capture="environment"
                  onChange={(e) => e.target.files && handleFileSelect(docType, e.target.files[0])}
                  className="hidden"
                  id={`camera-${docType}`}
                />
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => e.target.files && handleFileSelect(docType, e.target.files[0])}
                  className="hidden"
                  id={`file-${docType}`}
                />
                <div className="flex space-x-3">
                  <label
                    htmlFor={`camera-${docType}`}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 cursor-pointer transition-colors"
                  >
                    <FaCamera className="w-4 h-4 mr-2" />
                    Take Photo
                  </label>
                  <label
                    htmlFor={`file-${docType}`}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <FaUpload className="w-4 h-4 mr-2" />
                    Choose File
                  </label>
                </div>
                
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
                <FaCertificate className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Complete Profile</h3>
                <p className="text-gray-600">Set up your professional profile</p>
              </div>
              <div className="text-center p-6">
                <FaUpload className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Documents</h3>
                <p className="text-gray-600">Verify your identity and qualifications</p>
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
                      capture="user"
                      onChange={(e) => e.target.files && handleProfilePhotoSelect(e.target.files[0])}
                      className="hidden"
                      id="profile-photo-upload"
                    />
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg"
                      onChange={(e) => e.target.files && handleProfilePhotoSelect(e.target.files[0])}
                      className="hidden"
                      id="profile-photo-gallery"
                    />
                    <div className="flex flex-col space-y-2 camera-upload">
                      <label
                        htmlFor="profile-photo-upload"
                        className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                      >
                        <FaCamera className="w-4 h-4 mr-2" />
                        Take Photo
                      </label>
                      <label
                        htmlFor="profile-photo-gallery"
                        className="inline-flex items-center justify-center px-4 py-2 bg-gray-600 text-white text-sm font-bold rounded-lg hover:bg-gray-700 cursor-pointer transition-colors"
                      >
                        <FaUpload className="w-4 h-4 mr-2" />
                        Choose from Gallery
                      </label>
                    </div>
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
                <label className="block text-lg font-black text-gray-900 mb-3">
                  Years of Experience *
                </label>
                <select
                  value={profile.experience}
                  onChange={(e) => setProfile(prev => ({ ...prev, experience: e.target.value }))}
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-bold text-gray-900 bg-white text-base"
                >
                  <option value="" className="text-gray-500 font-semibold">Select experience level</option>
                  <option value="0-1" className="text-gray-900 font-bold">Less than 1 year</option>
                  <option value="1-3" className="text-gray-900 font-bold">1-3 years</option>
                  <option value="3-5" className="text-gray-900 font-bold">3-5 years</option>
                  <option value="5-10" className="text-gray-900 font-bold">5-10 years</option>
                  <option value="10+" className="text-gray-900 font-bold">10+ years</option>
                </select>
              </div>

              {/* Bio */}
              <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
                <label className="block text-lg font-black text-gray-900 mb-3">
                  Professional Bio *
                </label>
                <p className="text-sm text-gray-800 font-bold mb-4">
                  Describe your experience, specialties, and what makes you the right choice for clients
                </p>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  rows={6}
                  placeholder="Tell customers about your experience, specialties, and what makes you unique..."
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-bold text-gray-900 placeholder-gray-500 resize-none bg-white"
                  maxLength={500}
                />
                <div className="flex justify-between items-center mt-3">
                  <p className="text-xs text-gray-700 font-semibold">
                    💡 Tip: Mention your certifications, years of experience, and specialties
                  </p>
                  <p className="text-sm font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                    {profile.bio.length}/500 characters
                  </p>
                </div>
              </div>

              {/* Service Categories & Sub-Services */}
              <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
                <label className="block text-lg font-black text-gray-900 mb-3">
                  Service Categories & Specializations *
                </label>
                <p className="text-sm text-gray-800 font-bold mb-4">
                  Select service categories and specify what you can offer under each category
                </p>

                {/* Available Service Categories */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Select Service Categories *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.keys(SERVICE_CATEGORIES).map((category) => (
                      <label key={category} className="cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!profile.serviceCategories[category]}
                          onChange={(e) => {
                            if (e.target.checked) {
                              addServiceCategory(category)
                            } else {
                              removeServiceCategory(category)
                            }
                          }}
                          className="hidden"
                        />
                        <div className={`p-3 rounded-lg border-2 transition-all text-center ${
                          profile.serviceCategories[category]
                            ? 'border-purple-500 bg-purple-100'
                            : 'border-gray-200 bg-white hover:border-purple-300'
                        }`}>
                          <div className="font-bold text-gray-900 text-sm">{category}</div>
                          <div className="text-xs text-gray-600 mt-1">
                            KES {STANDARD_PRICING[category as keyof typeof STANDARD_PRICING] || 'N/A'} fixed
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Selected Categories with Sub-Services */}
                {Object.keys(profile.serviceCategories).map((category) => (
                  <div key={category} className="bg-white p-4 rounded-lg border-2 border-purple-200 mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">{category}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-green-700 bg-green-100 px-3 py-1 rounded">
                          KES {STANDARD_PRICING[category as keyof typeof STANDARD_PRICING]} fixed
                        </span>
                        <button
                          onClick={() => removeServiceCategory(category)}
                          className="text-red-600 hover:text-red-700 font-bold text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Sub-Services Selection */}
                    <div className="mb-4">
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        What specific services can you provide under {category}? *
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto bg-gray-50 p-3 rounded-lg border">
                        {SERVICE_CATEGORIES[category as keyof typeof SERVICE_CATEGORIES]?.map((subService) => (
                          <label key={subService} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={profile.serviceCategories[category]?.subServices.includes(subService) || false}
                              onChange={() => toggleSubService(category, subService)}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-4 h-4"
                            />
                            <span className="text-sm font-medium text-gray-900">{subService}</span>
                          </label>
                        ))}
                      </div>
                      {profile.serviceCategories[category]?.subServices.length > 0 && (
                        <p className="text-sm text-purple-600 font-medium mt-2">
                          ✓ {profile.serviceCategories[category].subServices.length} service{profile.serviceCategories[category].subServices.length === 1 ? '' : 's'} selected
                        </p>
                      )}
                    </div>

                    {/* Category Experience */}
                    <div className="mb-4">
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        Your Experience in {category}
                      </label>
                      <select
                        value={profile.serviceCategories[category]?.experience || ''}
                        onChange={(e) => updateServiceCategory(category, 'experience', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-medium text-black bg-white"
                      >
                        <option value="" className="text-gray-500">Select experience level</option>
                        <option value="Beginner (0-1 years)" className="text-black">Beginner (0-1 years)</option>
                        <option value="Intermediate (1-3 years)" className="text-black">Intermediate (1-3 years)</option>
                        <option value="Experienced (3-5 years)" className="text-black">Experienced (3-5 years)</option>
                        <option value="Expert (5+ years)" className="text-black">Expert (5+ years)</option>
                      </select>
                    </div>

                    {/* Category Description */}
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        Describe your {category} approach & specializations *
                      </label>
                      <textarea
                        value={profile.serviceCategories[category]?.description || ''}
                        onChange={(e) => updateServiceCategory(category, 'description', e.target.value)}
                        rows={3}
                        placeholder={`Describe your approach to ${category.toLowerCase()}, any specializations, quality standards, or what makes you unique in this category...`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-medium resize-none text-black bg-white placeholder-gray-500"
                        maxLength={300}
                      />
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-gray-600">
                          Help clients understand your expertise in this category
                        </p>
                        <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">
                          {(profile.serviceCategories[category]?.description || '').length}/300
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Instructions */}
                {Object.keys(profile.serviceCategories).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">📋</div>
                    <p className="font-medium">Select service categories above to get started</p>
                    <p className="text-sm">You can choose multiple categories that match your skills</p>
                  </div>
                )}

                {/* Pricing Notice */}
                <div className="mt-4 bg-blue-100 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-bold text-blue-900 mb-2">📊 How This Works</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Each category has a <strong>fixed platform rate</strong> - no haggling or confusion</li>
                    <li>• Select <strong>specific sub-services</strong> you can provide under each category</li>
                    <li>• Clients will see your expertise and selected specializations</li>
                    <li>• The more categories you offer, the more job opportunities you get</li>
                  </ul>
                </div>
              </div>

              {/* Home Address */}
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                <label className="block text-lg font-black text-gray-900 mb-3">
                  Home Address *
                </label>
                <p className="text-sm text-gray-800 font-bold mb-4">
                  Provide your home address details for location-based services
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      value={profile.homeAddress.street}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        homeAddress: { ...prev.homeAddress, street: e.target.value }
                      }))}
                      placeholder="Enter your street address"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-medium text-gray-900 placeholder-gray-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Area/Estate *
                    </label>
                    <input
                      type="text"
                      value={profile.homeAddress.area}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        homeAddress: { ...prev.homeAddress, area: e.target.value }
                      }))}
                      placeholder="e.g., Karen, Kilimani, Westlands"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-medium text-gray-900 placeholder-gray-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      value={profile.homeAddress.postalCode}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        homeAddress: { ...prev.homeAddress, postalCode: e.target.value }
                      }))}
                      placeholder="e.g., 00100"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-medium text-gray-900 placeholder-gray-500"
                    />
                  </div>
                </div>
              </div>

              {/* Phone Number */}
              <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
                <label className="block text-lg font-black text-gray-900 mb-3">
                  Phone Number *
                </label>
                <p className="text-sm text-gray-800 font-bold mb-4">
                  Your contact number for communication with clients
                </p>
                <input
                  type="tel"
                  value={profile.phoneNumber}
                  onChange={(e) => setProfile(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  placeholder="e.g., +254 700 123 456"
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-bold text-gray-900 placeholder-gray-500"
                />
                <p className="text-xs text-gray-700 font-semibold mt-2">
                  💡 Include country code (+254 for Kenya)
                </p>
              </div>

              {/* Service Areas */}
              <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-6">
                <label className="block text-lg font-black text-gray-900 mb-3">
                  Service Areas in Nairobi *
                </label>
                <p className="text-sm text-gray-800 font-bold mb-4">
                  Select the areas in Nairobi where you can provide services
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {KENYAN_CITIES.map((city) => (
                    <label key={city} className="flex items-center space-x-3 cursor-pointer bg-white p-3 rounded-lg border hover:border-indigo-300 transition-colors">
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
                              serviceAreas: prev.serviceAreas.filter(area => area !== city)
                            }))
                          }
                        }}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                      />
                      <span className="text-sm font-medium text-gray-900">{city}</span>
                    </label>
                  ))}
                </div>
                {profile.serviceAreas.length > 0 && (
                  <p className="text-sm text-indigo-600 font-medium mt-3">
                    ✓ {profile.serviceAreas.length} area{profile.serviceAreas.length === 1 ? '' : 's'} selected
                  </p>
                )}
              </div>

              {/* Enhanced Availability Calendar */}
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
                <label className="block text-lg font-black text-gray-900 mb-3">
                  Availability & Schedule Configuration *
                </label>
                <p className="text-sm text-gray-800 font-bold mb-4">
                  Set up your working schedule and booking preferences
                </p>
                
                {/* Available Days */}
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-gray-900 mb-2">Working Days *</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {DAYS_OF_WEEK.map((day) => (
                      <label key={day} className="flex items-center space-x-3 cursor-pointer bg-white p-3 rounded-lg border hover:border-yellow-300 transition-colors">
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
                          className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500 w-4 h-4"
                        />
                        <span className="text-sm font-medium text-gray-900">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Working Hours */}
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-gray-900 mb-2">Default Working Hours *</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-lg border">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                      <select
                        value={profile.availability.hours.start}
                        onChange={(e) => setProfile(prev => ({
                          ...prev,
                          availability: {
                            ...prev.availability,
                            hours: { ...prev.availability.hours, start: e.target.value }
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 text-sm text-black bg-white"
                      >
                        {Array.from({ length: 24 }, (_, i) => {
                          const hour = i.toString().padStart(2, '0') + ':00'
                          return <option key={hour} value={hour} className="text-black">{hour}</option>
                        })}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                      <select
                        value={profile.availability.hours.end}
                        onChange={(e) => setProfile(prev => ({
                          ...prev,
                          availability: {
                            ...prev.availability,
                            hours: { ...prev.availability.hours, end: e.target.value }
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 text-sm text-black bg-white"
                      >
                        {Array.from({ length: 24 }, (_, i) => {
                          const hour = i.toString().padStart(2, '0') + ':00'
                          return <option key={hour} value={hour} className="text-black">{hour}</option>
                        })}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Booking Preferences */}
                <div className="mb-4">
                  <h4 className="text-sm font-bold text-gray-900 mb-2">Booking Preferences</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-lg border">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Minimum Notice Required
                      </label>
                      <select
                        value={profile.availability.minimumNotice}
                        onChange={(e) => setProfile(prev => ({
                          ...prev,
                          availability: {
                            ...prev.availability,
                            minimumNotice: parseInt(e.target.value)
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 text-sm text-black bg-white"
                      >
                        <option value={2} className="text-black">2 hours</option>
                        <option value={4} className="text-black">4 hours</option>
                        <option value={8} className="text-black">8 hours</option>
                        <option value={12} className="text-black">12 hours</option>
                        <option value={24} className="text-black">24 hours</option>
                        <option value={48} className="text-black">48 hours</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Maximum Advance Booking
                      </label>
                      <select
                        value={profile.availability.advanceBooking}
                        onChange={(e) => setProfile(prev => ({
                          ...prev,
                          availability: {
                            ...prev.availability,
                            advanceBooking: parseInt(e.target.value)
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 text-sm text-black bg-white"
                      >
                        <option value={7} className="text-black">1 week</option>
                        <option value={14} className="text-black">2 weeks</option>
                        <option value={30} className="text-black">1 month</option>
                        <option value={60} className="text-black">2 months</option>
                        <option value={90} className="text-black">3 months</option>
                      </select>
                    </div>
                  </div>
                </div>

                {profile.availability.days.length > 0 && (
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <p className="text-sm text-yellow-800 font-medium">
                      ✓ Available {profile.availability.days.length} day{profile.availability.days.length === 1 ? '' : 's'} per week
                      • {profile.availability.hours.start} - {profile.availability.hours.end}
                      • {profile.availability.minimumNotice}h minimum notice
                    </p>
                  </div>
                )}
              </div>

              {/* Emergency Contact */}
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                <label className="block text-lg font-black text-gray-900 mb-3">
                  Emergency Contact *
                </label>
                <p className="text-sm text-gray-800 font-bold mb-4">
                  Provide emergency contact information for safety purposes
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={profile.emergencyContact.name}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        emergencyContact: { ...prev.emergencyContact, name: e.target.value }
                      }))}
                      placeholder="Enter emergency contact's full name"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 font-medium text-gray-900 placeholder-gray-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Relationship *
                    </label>
                    <select
                      value={profile.emergencyContact.relationship}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        emergencyContact: { ...prev.emergencyContact, relationship: e.target.value }
                      }))}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 font-medium text-gray-900"
                    >
                      <option value="">Select relationship</option>
                      <option value="spouse">Spouse</option>
                      <option value="parent">Parent</option>
                      <option value="sibling">Sibling</option>
                      <option value="child">Child</option>
                      <option value="friend">Friend</option>
                      <option value="colleague">Colleague</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={profile.emergencyContact.phoneNumber}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        emergencyContact: { ...prev.emergencyContact, phoneNumber: e.target.value }
                      }))}
                      placeholder="e.g., +254 700 123 456"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 font-medium text-gray-900 placeholder-gray-500"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-700 font-semibold mt-3">
                  🛡️ This information is confidential and only used for emergency situations
                </p>
              </div>

              {/* Language Capabilities */}
              <div className="bg-cyan-50 border-2 border-cyan-200 rounded-xl p-6">
                <label className="block text-lg font-black text-gray-900 mb-3">
                  Language Capabilities *
                </label>
                <p className="text-sm text-gray-800 font-bold mb-4">
                  Select all languages you can communicate in with clients
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {AVAILABLE_LANGUAGES.map((language) => (
                    <label key={language} className="flex items-center space-x-3 cursor-pointer bg-white p-3 rounded-lg border hover:border-cyan-300 transition-colors">
                      <input
                        type="checkbox"
                        checked={profile.languages.includes(language)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setProfile(prev => ({
                              ...prev,
                              languages: [...prev.languages, language]
                            }))
                          } else {
                            setProfile(prev => ({
                              ...prev,
                              languages: prev.languages.filter(lang => lang !== language)
                            }))
                          }
                        }}
                        className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500 w-4 h-4"
                      />
                      <span className="text-sm font-medium text-gray-900">{language}</span>
                    </label>
                  ))}
                </div>
                {profile.languages.length > 0 && (
                  <p className="text-sm text-cyan-600 font-medium mt-3">
                    ✓ {profile.languages.length} language{profile.languages.length === 1 ? '' : 's'} selected
                  </p>
                )}
                <p className="text-xs text-gray-700 font-semibold mt-2">
                  🗣️ Multiple languages help you serve more clients effectively
                </p>
              </div>

              {/* Professional Memberships */}
              <div className="bg-teal-50 border-2 border-teal-200 rounded-xl p-6">
                <label className="block text-lg font-black text-gray-900 mb-3">
                  Professional Memberships & Certifications
                </label>
                <p className="text-sm text-gray-800 font-bold mb-4">
                  Add your professional organization memberships to build credibility (Optional)
                </p>
                
                <div className="space-y-4">
                  {profile.professionalMemberships.map((membership, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border border-teal-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-900 mb-2">
                            Organization
                          </label>
                          <select
                            value={membership.organization}
                            onChange={(e) => {
                              const updated = [...profile.professionalMemberships]
                              updated[index].organization = e.target.value
                              setProfile(prev => ({ ...prev, professionalMemberships: updated }))
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm text-black bg-white"
                          >
                            <option value="" className="text-gray-500">Select organization</option>
                            {PROFESSIONAL_ORGANIZATIONS.map(org => (
                              <option key={org} value={org} className="text-black">{org}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-bold text-gray-900 mb-2">
                            Membership ID
                          </label>
                          <input
                            type="text"
                            value={membership.membershipId}
                            onChange={(e) => {
                              const updated = [...profile.professionalMemberships]
                              updated[index].membershipId = e.target.value
                              setProfile(prev => ({ ...prev, professionalMemberships: updated }))
                            }}
                            placeholder="Enter membership number"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm text-black bg-white placeholder-gray-500"
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end mt-3">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = profile.professionalMemberships.filter((_, i) => i !== index)
                            setProfile(prev => ({ ...prev, professionalMemberships: updated }))
                          }}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={() => {
                      setProfile(prev => ({
                        ...prev,
                        professionalMemberships: [
                          ...prev.professionalMemberships,
                          { organization: '', membershipId: '', certificateUrl: '' }
                        ]
                      }))
                    }}
                    className="inline-flex items-center px-4 py-2 bg-teal-600 text-white text-sm font-bold rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    <FaPlus className="w-4 h-4 mr-2" />
                    Add Professional Membership
                  </button>
                  
                  {profile.professionalMemberships.length > 0 && (
                    <p className="text-sm text-teal-600 font-medium">
                      ✓ {profile.professionalMemberships.length} membership{profile.professionalMemberships.length === 1 ? '' : 's'} added
                    </p>
                  )}
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-6">
                <label className="block text-lg font-black text-gray-900 mb-3">
                  Payment Information *
                </label>
                <p className="text-sm text-gray-800 font-bold mb-4">
                  Setup your payout method to receive payments from clients
                </p>

                {/* Payment Method Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Preferred Payment Method *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { value: 'mpesa', label: 'M-Pesa Only', icon: '📱' },
                      { value: 'bank', label: 'Bank Account Only', icon: '🏦' },
                      { value: 'both', label: 'Both M-Pesa & Bank', icon: '💳' }
                    ].map((option) => (
                      <label key={option.value} className="flex items-center space-x-3 cursor-pointer bg-white p-3 rounded-lg border hover:border-emerald-300 transition-colors">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={option.value}
                          checked={profile.paymentInfo.preferredMethod === option.value}
                          onChange={(e) => setProfile(prev => ({
                            ...prev,
                            paymentInfo: { ...prev.paymentInfo, preferredMethod: e.target.value as any }
                          }))}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-lg">{option.icon}</span>
                        <span className="text-sm font-medium text-gray-900">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* M-Pesa Details */}
                {(profile.paymentInfo.preferredMethod === 'mpesa' || profile.paymentInfo.preferredMethod === 'both') && (
                  <div className="bg-green-100 p-4 rounded-lg mb-4">
                    <h4 className="text-sm font-bold text-gray-900 mb-3">📱 M-Pesa Information</h4>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        M-Pesa Number *
                      </label>
                      <input
                        type="tel"
                        value={profile.paymentInfo.mpesaNumber}
                        onChange={(e) => setProfile(prev => ({
                          ...prev,
                          paymentInfo: { ...prev.paymentInfo, mpesaNumber: e.target.value }
                        }))}
                        placeholder="e.g., 254700123456"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm text-black bg-white placeholder-gray-500"
                      />
                      <p className="text-xs text-gray-600 mt-1">Enter number without + or spaces</p>
                    </div>
                  </div>
                )}

                {/* Bank Details */}
                {(profile.paymentInfo.preferredMethod === 'bank' || profile.paymentInfo.preferredMethod === 'both') && (
                  <div className="bg-blue-100 p-4 rounded-lg">
                    <h4 className="text-sm font-bold text-gray-900 mb-3">🏦 Bank Account Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">
                          Bank Name *
                        </label>
                        <select
                          value={profile.paymentInfo.bankDetails.bankName}
                          onChange={(e) => setProfile(prev => ({
                            ...prev,
                            paymentInfo: {
                              ...prev.paymentInfo,
                              bankDetails: { ...prev.paymentInfo.bankDetails, bankName: e.target.value }
                            }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm text-black bg-white"
                        >
                          <option value="" className="text-gray-500">Select your bank</option>
                          {KENYAN_BANKS.map(bank => (
                            <option key={bank} value={bank} className="text-black">{bank}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">
                          Account Name *
                        </label>
                        <input
                          type="text"
                          value={profile.paymentInfo.bankDetails.accountName}
                          onChange={(e) => setProfile(prev => ({
                            ...prev,
                            paymentInfo: {
                              ...prev.paymentInfo,
                              bankDetails: { ...prev.paymentInfo.bankDetails, accountName: e.target.value }
                            }
                          }))}
                          placeholder="Account holder name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm text-black bg-white placeholder-gray-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">
                          Account Number *
                        </label>
                        <input
                          type="text"
                          value={profile.paymentInfo.bankDetails.accountNumber}
                          onChange={(e) => setProfile(prev => ({
                            ...prev,
                            paymentInfo: {
                              ...prev.paymentInfo,
                              bankDetails: { ...prev.paymentInfo.bankDetails, accountNumber: e.target.value }
                            }
                          }))}
                          placeholder="Bank account number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm text-black bg-white placeholder-gray-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">
                          Branch Code
                        </label>
                        <input
                          type="text"
                          value={profile.paymentInfo.bankDetails.branchCode}
                          onChange={(e) => setProfile(prev => ({
                            ...prev,
                            paymentInfo: {
                              ...prev.paymentInfo,
                              bankDetails: { ...prev.paymentInfo.bankDetails, branchCode: e.target.value }
                            }
                          }))}
                          placeholder="Branch code (optional)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm text-black bg-white placeholder-gray-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                <p className="text-xs text-gray-700 font-semibold mt-3">
                  💰 Payments are processed within 24-48 hours after job completion
                </p>
              </div>

              {/* Material Availability */}
              <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
                <label className="block text-lg font-black text-gray-900 mb-3">
                  Material Availability *
                </label>
                <p className="text-sm text-gray-800 font-bold mb-4">
                  Do you have your own materials and tools? This gives you priority for matching jobs.
                </p>

                {/* Material Availability Question */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-900 mb-3">
                    Do you have your own materials and tools? *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        name="hasOwnMaterials"
                        value="true"
                        checked={profile.materialSourcing.hasOwnMaterials === true}
                        onChange={() => setProfile(prev => ({
                          ...prev,
                          materialSourcing: { ...prev.materialSourcing, hasOwnMaterials: true }
                        }))}
                        className="hidden"
                      />
                      <div className={`p-4 rounded-lg border-2 transition-all ${
                        profile.materialSourcing.hasOwnMaterials === true
                          ? 'border-green-500 bg-green-100'
                          : 'border-gray-200 bg-white hover:border-green-300'
                      }`}>
                        <div className="text-center">
                          <div className="text-3xl mb-2">✅</div>
                          <h4 className="font-bold text-gray-900 mb-1">Yes, I have materials</h4>
                          <p className="text-xs text-gray-600">I come with my own tools and materials</p>
                        </div>
                      </div>
                    </label>

                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        name="hasOwnMaterials"
                        value="false"
                        checked={profile.materialSourcing.hasOwnMaterials === false}
                        onChange={() => setProfile(prev => ({
                          ...prev,
                          materialSourcing: { ...prev.materialSourcing, hasOwnMaterials: false }
                        }))}
                        className="hidden"
                      />
                      <div className={`p-4 rounded-lg border-2 transition-all ${
                        profile.materialSourcing.hasOwnMaterials === false
                          ? 'border-orange-500 bg-orange-100'
                          : 'border-gray-200 bg-white hover:border-orange-300'
                      }`}>
                        <div className="text-center">
                          <div className="text-3xl mb-2">🛠️</div>
                          <h4 className="font-bold text-gray-900 mb-1">No, client provides</h4>
                          <p className="text-xs text-gray-600">Client will provide materials needed</p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Materials List (if they have materials) */}
                {profile.materialSourcing.hasOwnMaterials && (
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      What materials and tools do you have? *
                    </label>
                    <textarea
                      value={profile.materialSourcing.materialsList || ''}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        materialSourcing: { ...prev.materialSourcing, materialsList: e.target.value }
                      }))}
                      rows={4}
                      placeholder="List the materials, tools, and equipment you have available. For example: 'Professional cleaning supplies, vacuum cleaner, mop, all-purpose cleaners, disinfectants, microfiber cloths...'"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm resize-none text-black bg-white placeholder-gray-500"
                      maxLength={500}
                    />
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-green-700 font-bold">
                        🎯 Priority Boost: Providers with materials get priority for matching jobs!
                      </p>
                      <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                        {(profile.materialSourcing.materialsList || '').length}/500
                      </span>
                    </div>
                  </div>
                )}

                {/* Priority Explanation */}
                <div className="mt-4 bg-blue-100 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-bold text-blue-900 mb-2">💡 How This Helps You</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Providers with materials get <strong>first priority</strong> for job matching</li>
                    <li>• Clients prefer providers who can start work immediately</li>
                    <li>• No delays waiting for material purchases or delivery</li>
                    <li>• Higher client satisfaction and better reviews</li>
                  </ul>
                </div>
              </div>




            </div>
          </div>
        )

      case 3:
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
              
              {/* Portfolio Gallery Section */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6 mt-8 portfolio-gallery">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-black text-gray-900 mb-2">📸 Portfolio Gallery</h3>
                  <p className="text-gray-800 font-bold">
                    Showcase your best work to attract more clients
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Upload before & after photos of your completed projects (Optional but highly recommended)
                  </p>
                </div>

                {/* Portfolio Items */}
                <div className="space-y-6">
                  {profile.portfolio.map((item, index) => (
                    <div key={item.id} className="bg-white rounded-lg border-2 border-purple-200 p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-lg font-bold text-gray-900">
                          Project {index + 1}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removePortfolioItem(item.id)}
                          className="text-red-600 hover:text-red-700 font-medium text-sm"
                        >
                          Remove Project
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Project Details */}
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-bold text-gray-900 mb-1">
                              Project Title *
                            </label>
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => updatePortfolioItem(item.id, 'title', e.target.value)}
                              placeholder="e.g., Kitchen Plumbing Repair"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm text-black bg-white placeholder-gray-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-bold text-gray-900 mb-1">
                              Category *
                            </label>
                            <select
                              value={item.category}
                              onChange={(e) => updatePortfolioItem(item.id, 'category', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm text-black bg-white"
                            >
                              <option value="" className="text-gray-500">Select category</option>
                              {PORTFOLIO_CATEGORIES.map(cat => (
                                <option key={cat} value={cat} className="text-black">{cat}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-bold text-gray-900 mb-1">
                              Completion Date
                            </label>
                            <input
                              type="date"
                              value={item.completionDate}
                              onChange={(e) => updatePortfolioItem(item.id, 'completionDate', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm text-black bg-white"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-bold text-gray-900 mb-1">
                              Project Description
                            </label>
                            <textarea
                              value={item.description}
                              onChange={(e) => updatePortfolioItem(item.id, 'description', e.target.value)}
                              rows={3}
                              placeholder="Describe the work completed, challenges solved, materials used..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm resize-none text-black bg-white placeholder-gray-500"
                              maxLength={200}
                            />
                            <p className="text-xs text-gray-600 mt-1">
                              {item.description.length}/200 characters
                            </p>
                          </div>
                        </div>
                        
                        {/* Before Photo */}
                        <div>
                          <label className="block text-sm font-bold text-gray-900 mb-2">
                            Before Photo *
                          </label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                            {item.beforeImage.preview ? (
                              <div className="relative">
                                <img 
                                  src={item.beforeImage.preview}
                                  alt="Before"
                                  className="w-full h-32 object-cover rounded-lg mb-2"
                                />
                                <p className="text-xs text-green-600 font-medium">✓ Before photo selected</p>
                              </div>
                            ) : (
                              <div className="py-8">
                                <FaCamera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600 font-medium">Before Photo</p>
                              </div>
                            )}
                            
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              onChange={(e) => e.target.files && handlePortfolioImageSelect(item.id, 'before', e.target.files[0])}
                              className="hidden"
                              id={`before-${item.id}`}
                            />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => e.target.files && handlePortfolioImageSelect(item.id, 'before', e.target.files[0])}
                              className="hidden"
                              id={`before-gallery-${item.id}`}
                            />
                            
                            <div className="flex space-x-2 mt-3">
                              <label
                                htmlFor={`before-${item.id}`}
                                className="flex-1 inline-flex items-center justify-center px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded cursor-pointer hover:bg-purple-700"
                              >
                                <FaCamera className="w-3 h-3 mr-1" />
                                Camera
                              </label>
                              <label
                                htmlFor={`before-gallery-${item.id}`}
                                className="flex-1 inline-flex items-center justify-center px-3 py-1 bg-gray-600 text-white text-xs font-bold rounded cursor-pointer hover:bg-gray-700"
                              >
                                <FaUpload className="w-3 h-3 mr-1" />
                                Gallery
                              </label>
                            </div>
                          </div>
                        </div>
                        
                        {/* After Photo */}
                        <div>
                          <label className="block text-sm font-bold text-gray-900 mb-2">
                            After Photo *
                          </label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                            {item.afterImage.preview ? (
                              <div className="relative">
                                <img 
                                  src={item.afterImage.preview}
                                  alt="After"
                                  className="w-full h-32 object-cover rounded-lg mb-2"
                                />
                                <p className="text-xs text-green-600 font-medium">✓ After photo selected</p>
                              </div>
                            ) : (
                              <div className="py-8">
                                <FaCamera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600 font-medium">After Photo</p>
                              </div>
                            )}
                            
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              onChange={(e) => e.target.files && handlePortfolioImageSelect(item.id, 'after', e.target.files[0])}
                              className="hidden"
                              id={`after-${item.id}`}
                            />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => e.target.files && handlePortfolioImageSelect(item.id, 'after', e.target.files[0])}
                              className="hidden"
                              id={`after-gallery-${item.id}`}
                            />
                            
                            <div className="flex space-x-2 mt-3">
                              <label
                                htmlFor={`after-${item.id}`}
                                className="flex-1 inline-flex items-center justify-center px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded cursor-pointer hover:bg-purple-700"
                              >
                                <FaCamera className="w-3 h-3 mr-1" />
                                Camera
                              </label>
                              <label
                                htmlFor={`after-gallery-${item.id}`}
                                className="flex-1 inline-flex items-center justify-center px-3 py-1 bg-gray-600 text-white text-xs font-bold rounded cursor-pointer hover:bg-gray-700"
                              >
                                <FaUpload className="w-3 h-3 mr-1" />
                                Gallery
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Add Portfolio Button */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={addPortfolioItem}
                      className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <FaPlus className="w-4 h-4 mr-2" />
                      Add Portfolio Project
                    </button>
                  </div>
                  
                  {profile.portfolio.length === 0 && (
                    <div className="text-center py-8 bg-purple-100 rounded-lg">
                      <FaCamera className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                      <h4 className="text-lg font-bold text-gray-900 mb-2">No Portfolio Items Yet</h4>
                      <p className="text-gray-600 mb-4">
                        Add before & after photos of your best work to attract more clients
                      </p>
                      <p className="text-sm text-purple-600 font-medium">
                        💡 Providers with portfolios get 3x more bookings!
                      </p>
                    </div>
                  )}
                  
                  {profile.portfolio.length > 0 && (
                    <div className="bg-purple-100 p-4 rounded-lg text-center">
                      <p className="text-sm text-purple-800 font-medium">
                        ✨ Portfolio Summary: {profile.portfolio.length} project{profile.portfolio.length === 1 ? '' : 's'} added
                        • Showcases your expertise and builds client trust
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-gray-900 mb-3">Review Your Application</h2>
              <p className="text-gray-800 font-bold text-lg">Please review your information before submitting</p>
            </div>

            <div className="grid gap-6">
              {/* Documents Review */}
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center">
                  <FaCheckCircle className="w-6 h-6 text-green-600 mr-3" />
                  Documents Uploaded
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(documents).map(([key, doc]) => (
                    <div key={key} className="flex items-center space-x-4 bg-white p-4 rounded-lg border border-green-200">
                      <FaCheckCircle className="w-6 h-6 text-green-600" />
                      <span className="text-gray-900 font-bold capitalize">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Profile Review */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center">
                  <FaUser className="w-6 h-6 text-blue-600 mr-3" />
                  Profile Information
                </h3>
                
                {/* Profile Photo */}
                {profile.profilePhoto.preview && (
                  <div className="flex items-center space-x-6 mb-6 bg-white p-6 rounded-lg border-2 border-blue-200">
                    <img 
                      src={profile.profilePhoto.preview} 
                      alt="Profile Photo" 
                      className="w-20 h-20 rounded-full object-cover border-4 border-blue-300 shadow-lg"
                    />
                    <div>
                      <p className="font-bold text-gray-900 text-lg">Profile Photo</p>
                      <p className="text-sm text-green-700 font-bold bg-green-100 px-3 py-1 rounded-full mt-1">✓ Photo ready for upload</p>
                    </div>
                  </div>
                )}
                
                <div className="grid gap-6">
                  <div className="bg-white p-4 rounded-lg border border-blue-200">
                    <span className="font-black text-gray-900 text-base">Experience:</span> 
                    <span className="font-bold text-blue-700 ml-2">{profile.experience}</span>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-blue-200">
                    <span className="font-black text-gray-900 text-base">Service Areas:</span> 
                    <div className="mt-2 flex flex-wrap gap-2">
                      {profile.serviceAreas.map((area, index) => (
                        <span key={index} className="bg-purple-100 text-purple-800 font-bold px-3 py-1 rounded-full text-sm">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-blue-200">
                    <span className="font-black text-gray-900 text-base">Availability:</span> 
                    <div className="mt-2">
                      <span className="font-bold text-purple-700">{profile.availability.days.join(', ')}</span>
                      <span className="font-bold text-gray-700 ml-2">({profile.availability.hours.start} - {profile.availability.hours.end})</span>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-blue-200">
                    <span className="font-black text-gray-900 text-base mb-3 block">Professional Bio:</span>
                    <p className="text-gray-800 font-medium text-sm bg-orange-50 p-4 rounded-lg border border-orange-200 leading-relaxed">{profile.bio}</p>
                  </div>
                </div>
              </div>

              {/* Service Categories Review */}
              {Object.keys(profile.serviceCategories).length > 0 && (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                  <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center">
                    <FaCertificate className="w-6 h-6 text-green-600 mr-3" />
                    Your Service Categories ({Object.keys(profile.serviceCategories).length})
                  </h3>
                  <div className="grid gap-6">
                    {Object.entries(profile.serviceCategories).map(([category, categoryData]) => (
                      <div key={category} className="bg-white p-6 rounded-lg border-2 border-green-200 shadow-sm">
                        <div className="flex items-start justify-between mb-4">
                          <h4 className="font-bold text-gray-900 text-lg">{category}</h4>
                          <span className="text-sm font-bold text-green-700 bg-green-200 px-4 py-2 rounded-full">
                            {categoryData.subServices.length} services
                          </span>
                        </div>
                        
                        {/* Sub-services */}
                        <div className="mb-4">
                          <h5 className="font-semibold text-gray-800 mb-2">Services Offered:</h5>
                          <div className="flex flex-wrap gap-2">
                            {categoryData.subServices.map((subService, index) => (
                              <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                {subService}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Experience */}
                        {categoryData.experience && (
                          <div className="mb-4">
                            <h5 className="font-semibold text-gray-800 mb-1">Experience:</h5>
                            <p className="text-sm font-medium text-gray-700 bg-gray-50 p-3 rounded border">
                              {categoryData.experience}
                            </p>
                          </div>
                        )}

                        {/* Description */}
                        {categoryData.description && (
                          <div className="mb-4">
                            <h5 className="font-semibold text-gray-800 mb-1">Description:</h5>
                            <p className="text-sm font-medium text-gray-700 bg-gray-50 p-3 rounded border">
                              {categoryData.description}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-8">
              <div className="flex items-start space-x-4">
                <FaExclamationTriangle className="w-8 h-8 text-yellow-600 mt-1" />
                <div>
                  <h4 className="font-black text-yellow-900 mb-4 text-xl">What happens next?</h4>
                  <p className="text-yellow-900 font-bold text-base leading-relaxed">
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
      <div className="min-h-screen bg-gray-50 py-8 relative">
        <div className="max-w-4xl mx-auto px-4">
          {/* Tutorial Overlay */}
          {showTutorial && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
              <div className="bg-white rounded-xl shadow-2xl p-6 m-4 max-w-md">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {TUTORIAL_STEPS[tutorialStep].title}
                  </h3>
                  <p className="text-gray-700 mb-6">
                    {TUTORIAL_STEPS[tutorialStep].content}
                  </p>
                  
                  <div className="flex items-center justify-center mb-4">
                    <div className="flex space-x-2">
                      {TUTORIAL_STEPS.map((_, index) => (
                        <div
                          key={index}
                          className={`w-3 h-3 rounded-full ${
                            index === tutorialStep ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={skipTutorial}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                    >
                      Skip Tutorial
                    </button>
                    <button
                      onClick={nextTutorialStep}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
                    >
                      {tutorialStep < TUTORIAL_STEPS.length - 1 ? 'Next' : 'Start Onboarding'}
                    </button>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-3">
                    Step {tutorialStep + 1} of {TUTORIAL_STEPS.length}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tutorial Help Button */}
          <div className="fixed bottom-4 right-4 z-40">
            <button
              onClick={restartTutorial}
              className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
              title="Restart Tutorial"
            >
              <FaEye className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="mb-8 progress-steps">
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

          {/* Auto-Save Status Indicator */}
          <div className="flex items-center justify-center mb-4 auto-save-indicator">
            <div className="flex items-center space-x-2 text-sm">
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-blue-600 font-medium">Saving progress...</span>
                </>
              ) : lastSaved ? (
                <>
                  <FaCheck className="w-4 h-4 text-green-600" />
                  <span className="text-green-600 font-medium">
                    Auto-saved at {lastSaved.toLocaleTimeString()}
                  </span>
                </>
              ) : null}
              {saveError && (
                <>
                  <FaExclamationTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-red-600 font-medium">{saveError}</span>
                </>
              )}
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8 profile-section">
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
                  (currentStep === 2 && !canProceedFromProfile()) ||
                  (currentStep === 3 && !canProceedFromDocuments()) ||
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