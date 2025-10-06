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
  FaSpinner
} from 'react-icons/fa'

interface ProviderData {
  _id: string
  name: string
  email: string
  phone?: string
  address?: {
    street?: string
    city?: string
    state?: string
    country?: string
  }
  providerProfile?: {
    businessName?: string
    bio?: string
    experience?: string
    hourlyRate?: number
    skills?: string[]
    rating?: number
  }
  providerStatus: string
}

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
    address: {
      street: '',
      city: '',
      state: '',
      country: 'Kenya'
    },
    providerProfile: {
      businessName: '',
      bio: '',
      experience: '',
      hourlyRate: 0,
      skills: [],
      rating: 0
    },
    providerStatus: 'pending'
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
            address: {
              street: providerData.address?.street || '',
              city: providerData.address?.city || '',
              state: providerData.address?.state || '',
              country: providerData.address?.country || 'Kenya'
            },
            providerProfile: {
              businessName: providerData.providerProfile?.businessName || '',
              bio: providerData.providerProfile?.bio || '',
              experience: providerData.providerProfile?.experience || '',
              hourlyRate: providerData.providerProfile?.hourlyRate || 0,
              skills: providerData.providerProfile?.skills || [],
              rating: providerData.providerProfile?.rating || 0
            },
            providerStatus: providerData.providerStatus || 'pending'
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

  const handleSaveChanges = async () => {
    if (!provider) return

    try {
      setSaving(true)
      const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken')

      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        providerProfile: formData.providerProfile
        // Temporarily remove adminNote until backend deployment completes
        // adminNote: adminNote.trim() ? `Profile updated: ${adminNote.trim()}` : 'Profile updated by admin'
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
                    Hourly Rate (KES)
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
                <div className="md:col-span-2">
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

            {/* Admin Notes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 lg:col-span-2"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Admin Note (Optional)
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