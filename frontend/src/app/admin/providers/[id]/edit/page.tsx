'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import RoleGuard from '@/components/RoleGuard'
import { motion } from 'framer-motion'
import { 
  FaArrowLeft, 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt,
  FaTools,
  FaDollarSign,
  FaSave,
  FaTimes,
  FaEdit,
  FaCheck,
  FaSpinner,
  FaClock,
  FaCreditCard,
  FaHome,
  FaUserTie,
  FaLanguage,
  FaWrench,
  FaChartLine,
  FaStickyNote,
  FaCamera,
  FaCalendarAlt,
  FaHandHoldingUsd,
  FaShieldAlt
} from 'react-icons/fa'

interface ProviderData {
  _id: string
  name: string
  email: string
  phone?: string
  avatar?: {
    url?: string
    public_id?: string
  }
  address?: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
    coordinates?: {
      lat?: number
      lng?: number
    }
  }
  providerProfile?: {
    businessName?: string
    bio?: string
    experience?: string
    hourlyRate?: number
    skills?: string[]
    rating?: number
    availability?: {
      days?: string[]
      hours?: {
        start?: string
        end?: string
      }
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
    paymentInfo?: {
      preferredMethod?: string
      mpesaNumber?: string
      bankDetails?: {
        bankName?: string
        accountNumber?: string
        accountName?: string
        branchCode?: string
      }
    }
    materialSourcing?: {
      option?: string
      markup?: number
      details?: string
    }
    rateStructure?: {
      baseHourlyRate?: number
      emergencyRate?: number
      weekendRate?: number
      materialHandling?: number
      travelFee?: number
    }
    completedJobs?: number
    reviewCount?: number
  }
  providerStatus: string
  isActive?: boolean
  isVerified?: boolean
  lastLogin?: Date
  approvedAt?: Date
  rejectedAt?: Date
  adminNotes?: Array<{
    note: string
    date: Date
    type: string
  }>
}

const AVAILABLE_SERVICE_AREAS = ['Kileleshwa', 'Westlands', 'Kilimani', 'Parklands', 'Nyayo', 'Lavington']

export default function EditProviderPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const [provider, setProvider] = useState<ProviderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<ProviderData>({
    _id: '',
    name: '',
    email: '',
    phone: '',
    avatar: {
      url: '',
      public_id: ''
    },
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Kenya',
      coordinates: {
        lat: 0,
        lng: 0
      }
    },
    providerProfile: {
      businessName: '',
      bio: '',
      experience: '',
      hourlyRate: 0,
      skills: [],
      rating: 0,
      availability: {
        days: [],
        hours: {
          start: '09:00',
          end: '17:00'
        }
      },
      serviceAreas: [],
      homeAddress: {
        street: '',
        area: '',
        postalCode: ''
      },
      emergencyContact: {
        name: '',
        relationship: '',
        phoneNumber: ''
      },
      languages: [],
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
        option: 'client',
        markup: 0,
        details: ''
      },
      rateStructure: {
        baseHourlyRate: 0,
        emergencyRate: 1.5,
        weekendRate: 1.2,
        materialHandling: 0,
        travelFee: 0
      },
      completedJobs: 0,
      reviewCount: 0
    },
    providerStatus: 'pending',
    isActive: true,
    isVerified: false
  })
  const [adminNote, setAdminNote] = useState('')

  useEffect(() => {
    if (params.id) {
      fetchProviderDetails(params.id as string)
    }
  }, [params.id])

  const fetchProviderDetails = async (providerId: string) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken')
      
      const response = await fetch(`/api/admin/providers/${providerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const providerData = data.data?.provider || data.provider
        
        if (providerData) {
          setProvider(providerData)
          setFormData({
            _id: providerData._id,
            name: providerData.name || '',
            email: providerData.email || '',
            phone: providerData.phone || '',
            avatar: {
              url: providerData.avatar?.url || '',
              public_id: providerData.avatar?.public_id || ''
            },
            address: {
              street: providerData.address?.street || '',
              city: providerData.address?.city || '',
              state: providerData.address?.state || '',
              zipCode: providerData.address?.zipCode || '',
              country: providerData.address?.country || 'Kenya',
              coordinates: {
                lat: providerData.address?.coordinates?.lat || 0,
                lng: providerData.address?.coordinates?.lng || 0
              }
            },
            providerProfile: {
              businessName: providerData.providerProfile?.businessName || '',
              bio: providerData.providerProfile?.bio || '',
              experience: providerData.providerProfile?.experience || '',
              hourlyRate: providerData.providerProfile?.hourlyRate || 0,
              skills: providerData.providerProfile?.skills || [],
              rating: providerData.providerProfile?.rating || 0,
              availability: {
                days: providerData.providerProfile?.availability?.days || [],
                hours: {
                  start: providerData.providerProfile?.availability?.hours?.start || '09:00',
                  end: providerData.providerProfile?.availability?.hours?.end || '17:00'
                }
              },
              serviceAreas: providerData.providerProfile?.serviceAreas || [],
              homeAddress: {
                street: providerData.providerProfile?.homeAddress?.street || '',
                area: providerData.providerProfile?.homeAddress?.area || '',
                postalCode: providerData.providerProfile?.homeAddress?.postalCode || ''
              },
              emergencyContact: {
                name: providerData.providerProfile?.emergencyContact?.name || '',
                relationship: providerData.providerProfile?.emergencyContact?.relationship || '',
                phoneNumber: providerData.providerProfile?.emergencyContact?.phoneNumber || ''
              },
              languages: providerData.providerProfile?.languages || [],
              paymentInfo: {
                preferredMethod: providerData.providerProfile?.paymentInfo?.preferredMethod || 'mpesa',
                mpesaNumber: providerData.providerProfile?.paymentInfo?.mpesaNumber || '',
                bankDetails: {
                  bankName: providerData.providerProfile?.paymentInfo?.bankDetails?.bankName || '',
                  accountNumber: providerData.providerProfile?.paymentInfo?.bankDetails?.accountNumber || '',
                  accountName: providerData.providerProfile?.paymentInfo?.bankDetails?.accountName || '',
                  branchCode: providerData.providerProfile?.paymentInfo?.bankDetails?.branchCode || ''
                }
              },
              materialSourcing: {
                option: providerData.providerProfile?.materialSourcing?.option || 'client',
                markup: providerData.providerProfile?.materialSourcing?.markup || 0,
                details: providerData.providerProfile?.materialSourcing?.details || ''
              },
              rateStructure: {
                baseHourlyRate: providerData.providerProfile?.rateStructure?.baseHourlyRate || 0,
                emergencyRate: providerData.providerProfile?.rateStructure?.emergencyRate || 1.5,
                weekendRate: providerData.providerProfile?.rateStructure?.weekendRate || 1.2,
                materialHandling: providerData.providerProfile?.rateStructure?.materialHandling || 0,
                travelFee: providerData.providerProfile?.rateStructure?.travelFee || 0
              },
              completedJobs: providerData.providerProfile?.completedJobs || 0,
              reviewCount: providerData.providerProfile?.reviewCount || 0
            },
            providerStatus: providerData.providerStatus || 'pending',
            isActive: providerData.isActive !== undefined ? providerData.isActive : true,
            isVerified: providerData.isVerified || false,
            lastLogin: providerData.lastLogin,
            approvedAt: providerData.approvedAt,
            rejectedAt: providerData.rejectedAt,
            adminNotes: providerData.adminNotes || []
          })
        }
      } else {
        throw new Error('Failed to fetch provider details')
      }
    } catch (error) {
      console.error('Error fetching provider details:', error)
      alert('Failed to load provider details. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof ProviderData] as any,
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleSkillsChange = (skills: string) => {
    const skillsArray = skills.split(',').map(skill => skill.trim()).filter(skill => skill)
    handleInputChange('providerProfile.skills', skillsArray)
  }

  const handleArrayChange = (field: string, values: string) => {
    const valuesArray = values.split(',').map(value => value.trim()).filter(value => value)
    handleInputChange(field, valuesArray)
  }

  const handleDaysChange = (day: string, checked: boolean) => {
    const currentDays = formData.providerProfile?.availability?.days || []
    let newDays = [...currentDays]
    
    if (checked) {
      if (!newDays.includes(day)) {
        newDays.push(day)
      }
    } else {
      newDays = newDays.filter(d => d !== day)
    }
    
    handleInputChange('providerProfile.availability.days', newDays)
  }

  const handleServiceAreaChange = (area: string, checked: boolean) => {
    const currentAreas = formData.providerProfile?.serviceAreas || []
    let newAreas = [...currentAreas]
    
    if (checked) {
      if (!newAreas.includes(area)) {
        newAreas.push(area)
      }
    } else {
      newAreas = newAreas.filter(a => a !== area)
    }
    
    handleInputChange('providerProfile.serviceAreas', newAreas)
  }

  const handleSaveChanges = async () => {
    if (!provider) return

    try {
      setSaving(true)
      const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken')

      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        avatar: formData.avatar,
        address: formData.address,
        providerProfile: formData.providerProfile,
        isActive: formData.isActive,
        isVerified: formData.isVerified,
        adminNote: adminNote.trim() ? `Profile updated: ${adminNote.trim()}` : 'Profile updated by admin'
      }

      console.log('🔄 Calling backend directly with data:', updateData);
      
      // Call production backend (where admin authentication was done)
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net';
      
      const response = await fetch(`${backendUrl}/api/admin/providers/${provider._id}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        const result = await response.json()
        alert('Provider profile updated successfully!')
        router.push('/admin/providers')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update provider profile')
      }
    } catch (error) {
      console.error('Error updating provider:', error)
      alert(`Failed to update provider: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <RoleGuard requiredRole="admin">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-blue-600 mb-4 mx-auto" />
            <p className="text-gray-600">Loading provider details...</p>
          </div>
        </div>
      </RoleGuard>
    )
  }

  if (!provider) {
    return (
      <RoleGuard requiredRole="admin">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">Provider not found</p>
            <button
              onClick={() => router.push('/admin/providers')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Providers
            </button>
          </div>
        </div>
      </RoleGuard>
    )
  }

  return (
    <RoleGuard requiredRole="admin">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-8 px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/admin/providers')}
                className="mr-4 p-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <FaArrowLeft className="text-xl" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Provider</h1>
                <p className="text-gray-600">{provider.name}</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => router.push('/admin/providers')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
              >
                <FaTimes className="mr-2" />
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {saving ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaUser className="mr-2 text-blue-600" />
                Basic Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Profile Picture URL
                  </label>
                  <input
                    type="url"
                    value={formData.avatar?.url || ''}
                    onChange={(e) => handleInputChange('avatar.url', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Account Status
                    </label>
                    <select
                      value={formData.isActive ? 'active' : 'inactive'}
                      onChange={(e) => handleInputChange('isActive', e.target.value === 'active')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Email Verified
                    </label>
                    <select
                      value={formData.isVerified ? 'verified' : 'unverified'}
                      onChange={(e) => handleInputChange('isVerified', e.target.value === 'verified')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    >
                      <option value="verified">Verified</option>
                      <option value="unverified">Unverified</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Address Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm border p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaMapMarkerAlt className="mr-2 text-blue-600" />
                Address Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={formData.address?.street || ''}
                    onChange={(e) => handleInputChange('address.street', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.address?.city || ''}
                      onChange={(e) => handleInputChange('address.city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Zip Code
                    </label>
                    <input
                      type="text"
                      value={formData.address?.zipCode || ''}
                      onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    State/County
                  </label>
                  <input
                    type="text"
                    value={formData.address?.state || ''}
                    onChange={(e) => handleInputChange('address.state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Country
                  </label>
                  <select
                    value={formData.address?.country || 'Kenya'}
                    onChange={(e) => handleInputChange('address.country', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  >
                    <option value="Kenya">Kenya</option>
                    <option value="Uganda">Uganda</option>
                    <option value="Tanzania">Tanzania</option>
                    <option value="Rwanda">Rwanda</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.address?.coordinates?.lat || ''}
                      onChange={(e) => handleInputChange('address.coordinates.lat', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.address?.coordinates?.lng || ''}
                      onChange={(e) => handleInputChange('address.coordinates.lng', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Professional Profile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm border p-6 lg:col-span-2"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaTools className="mr-2 text-blue-600" />
                Professional Profile
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={formData.providerProfile?.businessName || ''}
                    onChange={(e) => handleInputChange('providerProfile.businessName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Basic Hourly Rate (KES)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.providerProfile?.hourlyRate || 0}
                    onChange={(e) => handleInputChange('providerProfile.hourlyRate', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Skills/Services (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.providerProfile?.skills?.join(', ') || ''}
                    onChange={(e) => handleSkillsChange(e.target.value)}
                    placeholder="e.g., House Cleaning, Plumbing, Electrical Work"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Experience Level
                  </label>
                  <select
                    value={formData.providerProfile?.experience || ''}
                    onChange={(e) => handleInputChange('providerProfile.experience', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  >
                    <option value="">Select Experience Level</option>
                    <option value="Beginner">Beginner (0-2 years)</option>
                    <option value="Intermediate">Intermediate (2-5 years)</option>
                    <option value="Experienced">Experienced (5-10 years)</option>
                    <option value="Expert">Expert (10+ years)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Languages (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.providerProfile?.languages?.join(', ') || ''}
                    onChange={(e) => handleArrayChange('providerProfile.languages', e.target.value)}
                    placeholder="e.g., English, Swahili, French"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Service Areas (Select up to 6 areas)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-lg border">
                    {AVAILABLE_SERVICE_AREAS.map(area => (
                      <label key={area} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.providerProfile?.serviceAreas?.includes(area) || false}
                          onChange={(e) => handleServiceAreaChange(area, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 font-medium">{area}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Selected: {formData.providerProfile?.serviceAreas?.length || 0} of 6 areas
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Completed Jobs
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.providerProfile?.completedJobs || 0}
                      onChange={(e) => handleInputChange('providerProfile.completedJobs', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Rating (0-5)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={formData.providerProfile?.rating || 0}
                      onChange={(e) => handleInputChange('providerProfile.rating', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Bio/Description
                  </label>
                  <textarea
                    rows={4}
                    value={formData.providerProfile?.bio || ''}
                    onChange={(e) => handleInputChange('providerProfile.bio', e.target.value)}
                    placeholder="Tell us about your professional background and expertise..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  />
                </div>
              </div>
            </motion.div>

            {/* Availability & Schedule */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm border p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaClock className="mr-2 text-blue-600" />
                Availability & Schedule
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Available Days
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                      <label key={day} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.providerProfile?.availability?.days?.includes(day.toLowerCase()) || false}
                          onChange={(e) => handleDaysChange(day.toLowerCase(), e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={formData.providerProfile?.availability?.hours?.start || '09:00'}
                      onChange={(e) => handleInputChange('providerProfile.availability.hours.start', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={formData.providerProfile?.availability?.hours?.end || '17:00'}
                      onChange={(e) => handleInputChange('providerProfile.availability.hours.end', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Home Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg shadow-sm border p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaHome className="mr-2 text-blue-600" />
                Home Address
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Home Street Address
                  </label>
                  <input
                    type="text"
                    value={formData.providerProfile?.homeAddress?.street || ''}
                    onChange={(e) => handleInputChange('providerProfile.homeAddress.street', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Area/Neighborhood
                  </label>
                  <input
                    type="text"
                    value={formData.providerProfile?.homeAddress?.area || ''}
                    onChange={(e) => handleInputChange('providerProfile.homeAddress.area', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={formData.providerProfile?.homeAddress?.postalCode || ''}
                    onChange={(e) => handleInputChange('providerProfile.homeAddress.postalCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  />
                </div>
              </div>
            </motion.div>

            {/* Emergency Contact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-lg shadow-sm border p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaUserTie className="mr-2 text-blue-600" />
                Emergency Contact
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={formData.providerProfile?.emergencyContact?.name || ''}
                    onChange={(e) => handleInputChange('providerProfile.emergencyContact.name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Relationship
                  </label>
                  <input
                    type="text"
                    value={formData.providerProfile?.emergencyContact?.relationship || ''}
                    onChange={(e) => handleInputChange('providerProfile.emergencyContact.relationship', e.target.value)}
                    placeholder="e.g., Spouse, Parent, Sibling"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.providerProfile?.emergencyContact?.phoneNumber || ''}
                    onChange={(e) => handleInputChange('providerProfile.emergencyContact.phoneNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  />
                </div>
              </div>
            </motion.div>

            {/* Payment Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-lg shadow-sm border p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaCreditCard className="mr-2 text-blue-600" />
                Payment Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Preferred Payment Method
                  </label>
                  <select
                    value={formData.providerProfile?.paymentInfo?.preferredMethod || 'mpesa'}
                    onChange={(e) => handleInputChange('providerProfile.paymentInfo.preferredMethod', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  >
                    <option value="mpesa">M-Pesa Only</option>
                    <option value="bank">Bank Transfer Only</option>
                    <option value="both">Both M-Pesa & Bank</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    M-Pesa Number
                  </label>
                  <input
                    type="tel"
                    value={formData.providerProfile?.paymentInfo?.mpesaNumber || ''}
                    onChange={(e) => handleInputChange('providerProfile.paymentInfo.mpesaNumber', e.target.value)}
                    placeholder="e.g., 254701234567"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  />
                </div>
                <div className="border-t pt-4">
                  <h3 className="text-md font-medium text-gray-900 mb-3">Bank Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        value={formData.providerProfile?.paymentInfo?.bankDetails?.bankName || ''}
                        onChange={(e) => handleInputChange('providerProfile.paymentInfo.bankDetails.bankName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Branch Code
                      </label>
                      <input
                        type="text"
                        value={formData.providerProfile?.paymentInfo?.bankDetails?.branchCode || ''}
                        onChange={(e) => handleInputChange('providerProfile.paymentInfo.bankDetails.branchCode', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Account Number
                      </label>
                      <input
                        type="text"
                        value={formData.providerProfile?.paymentInfo?.bankDetails?.accountNumber || ''}
                        onChange={(e) => handleInputChange('providerProfile.paymentInfo.bankDetails.accountNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Account Name
                      </label>
                      <input
                        type="text"
                        value={formData.providerProfile?.paymentInfo?.bankDetails?.accountName || ''}
                        onChange={(e) => handleInputChange('providerProfile.paymentInfo.bankDetails.accountName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Material Sourcing */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-lg shadow-sm border p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaWrench className="mr-2 text-blue-600" />
                Material Sourcing
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Material Sourcing Option
                  </label>
                  <select
                    value={formData.providerProfile?.materialSourcing?.option || 'client'}
                    onChange={(e) => handleInputChange('providerProfile.materialSourcing.option', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  >
                    <option value="client">Client Provides Materials</option>
                    <option value="provider">I Provide Materials</option>
                    <option value="both">Both Options Available</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Material Markup (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.providerProfile?.materialSourcing?.markup || 0}
                    onChange={(e) => handleInputChange('providerProfile.materialSourcing.markup', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Material Details
                  </label>
                  <textarea
                    rows={3}
                    value={formData.providerProfile?.materialSourcing?.details || ''}
                    onChange={(e) => handleInputChange('providerProfile.materialSourcing.details', e.target.value)}
                    placeholder="Additional details about material sourcing..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  />
                </div>
              </div>
            </motion.div>

            {/* Rate Structure */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white rounded-lg shadow-sm border p-6 lg:col-span-2"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaHandHoldingUsd className="mr-2 text-blue-600" />
                Rate Structure
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Base Hourly Rate (KES)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.providerProfile?.rateStructure?.baseHourlyRate || 0}
                    onChange={(e) => handleInputChange('providerProfile.rateStructure.baseHourlyRate', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Emergency Rate Multiplier
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.1"
                    value={formData.providerProfile?.rateStructure?.emergencyRate || 1.5}
                    onChange={(e) => handleInputChange('providerProfile.rateStructure.emergencyRate', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Weekend Rate Multiplier
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.1"
                    value={formData.providerProfile?.rateStructure?.weekendRate || 1.2}
                    onChange={(e) => handleInputChange('providerProfile.rateStructure.weekendRate', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Material Handling Fee (KES)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.providerProfile?.rateStructure?.materialHandling || 0}
                    onChange={(e) => handleInputChange('providerProfile.rateStructure.materialHandling', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Travel Fee (KES)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.providerProfile?.rateStructure?.travelFee || 0}
                    onChange={(e) => handleInputChange('providerProfile.rateStructure.travelFee', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  />
                </div>
              </div>
            </motion.div>

            {/* Provider Status & Admin Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-6 lg:col-span-2"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaShieldAlt className="mr-2 text-blue-600" />
                Provider Status & Admin Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Provider Status
                  </label>
                  <select
                    value={formData.providerStatus}
                    onChange={(e) => handleInputChange('providerStatus', e.target.value)}
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="under_review">Under Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Review Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.providerProfile?.reviewCount || 0}
                    onChange={(e) => handleInputChange('providerProfile.reviewCount', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  />
                </div>
              </div>
              
              {/* Status Timestamps */}
              {(formData.approvedAt || formData.rejectedAt) && (
                <div className="border-t border-blue-200 pt-4 mb-4">
                  <h3 className="text-md font-medium text-gray-900 mb-2">Status History</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    {formData.approvedAt && (
                      <p>✅ Approved: {new Date(formData.approvedAt).toLocaleString()}</p>
                    )}
                    {formData.rejectedAt && (
                      <p>❌ Rejected: {new Date(formData.rejectedAt).toLocaleString()}</p>
                    )}
                    {formData.lastLogin && (
                      <p>🔄 Last Login: {new Date(formData.lastLogin).toLocaleString()}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Existing Admin Notes */}
              {formData.adminNotes && formData.adminNotes.length > 0 && (
                <div className="border-t border-blue-200 pt-4 mb-4">
                  <h3 className="text-md font-medium text-gray-900 mb-2">Previous Admin Notes</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {formData.adminNotes.map((note, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded border">
                        <p className="text-sm text-gray-700">{note.note}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(note.date).toLocaleString()} - {note.type}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Admin Notes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 lg:col-span-2"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaStickyNote className="mr-2 text-yellow-600" />
                Add Admin Note (Optional)
              </h2>
              <textarea
                rows={3}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Add a note about this profile update for admin records..."
                className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-gray-900"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </RoleGuard>
  )
}