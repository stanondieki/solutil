'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import ProfileImageUpload from '@/components/ProfileImageUpload'
import { toast } from 'react-hot-toast'
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaEdit, 
  FaSave, 
  FaTimes, 
  FaCheck,
  FaSpinner,
  FaCamera,
  FaShieldAlt,
  FaStar,
  FaCalendarAlt
} from 'react-icons/fa'

// Safe avatar utility functions
const getSafeAvatarUrl = (avatarUrl: string | undefined | null): string | null => {
  if (!avatarUrl || typeof avatarUrl !== 'string' || avatarUrl.trim() === '') {
    return null
  }
  return avatarUrl.trim()
}

const getUserInitials = (name: string | undefined | null): string => {
  if (!name || typeof name !== 'string') {
    return 'U'
  }
  const words = name.trim().split(' ')
  if (words.length >= 2) {
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase()
  }
  return name.charAt(0).toUpperCase() || 'U'
}

// Address utility functions
const formatAddress = (address: User['address']): string => {
  if (!address || typeof address === 'string') {
    return address || ''
  }
  
  const parts = [
    address.street,
    address.city,
    address.state,
    address.zipCode,
    address.country
  ].filter(Boolean)
  
  return parts.join(', ')
}

const parseAddressString = (addressString: string): User['address'] => {
  if (!addressString || addressString.trim() === '') {
    return undefined
  }
  
  // For now, just store as street. In a full implementation, 
  // you might want to parse this more intelligently
  return {
    street: addressString,
    country: 'Kenya' // Default country
  }
}

interface User {
  _id: string
  name: string
  email: string
  phone?: string
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
  userType: 'client' | 'provider' | 'admin'
  isVerified: boolean
  providerStatus?: 'pending' | 'verified' | 'rejected'
  avatar?: string
  profilePicture?: string
  createdAt: string
  lastLogin?: string
  preferences?: {
    notifications: boolean
    marketing: boolean
    theme: 'light' | 'dark'
  }
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    preferences: {
      notifications: true,
      marketing: false,
      theme: 'light' as 'light' | 'dark'
    }
  })
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  useEffect(() => {
    loadUserProfile()

    // Listen for profile updates from image upload
    const handleProfileUpdate = () => {
      loadUserProfile()
    }

    window.addEventListener('profileUpdated', handleProfileUpdate)

    // Cleanup listener
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate)
    }
  }, [])

  const loadUserProfile = async () => {
    try {
      const authToken = localStorage.getItem('authToken')
      if (!authToken) {
        router.push('/auth/login')
        return
      }

      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        const userData = data.data.user
        setUser(userData)
        setFormData({
          name: userData.name || '',
          phone: userData.phone || '',
          address: formatAddress(userData.address),
          preferences: {
            notifications: userData.preferences?.notifications ?? true,
            marketing: userData.preferences?.marketing ?? false,
            theme: userData.preferences?.theme ?? 'light'
          }
        })
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to load profile')
        if (response.status === 401) {
          router.push('/auth/login')
        }
      }
    } catch (error) {
      console.error('Profile load error:', error)
      setError('Network error. Please check your connection.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    
    if (name.startsWith('preferences.')) {
      const prefKey = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [prefKey]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
    
    setError('')
    setSuccess('')
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError('')
    setSuccess('')

    try {
      const authToken = localStorage.getItem('authToken')
      
      // Prepare the data with properly formatted address
      const updateData = {
        ...formData,
        address: parseAddressString(formData.address)
      }
      
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      const data = await response.json()

      if (response.ok) {
        const updatedUser = data.data.user
        setUser(updatedUser)
        setSuccess('Profile updated successfully!')
        setIsEditing(false)
        
        // Update localStorage
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
        localStorage.setItem('user', JSON.stringify({
          ...currentUser,
          ...updatedUser
        }))
      } else {
        setError(data.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Profile update error:', error)
      setError('Network error. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: formatAddress(user.address),
        preferences: {
          notifications: user.preferences?.notifications ?? true,
          marketing: user.preferences?.marketing ?? false,
          theme: user.preferences?.theme ?? 'light'
        }
      })
    }
    setIsEditing(false)
    setError('')
    setSuccess('')
  }

  const handleAvatarUpload = async (urls: string[]) => {
    if (urls.length > 0) {
      setUploadingAvatar(true)
      try {
        const authToken = localStorage.getItem('authToken')
        const response = await fetch('/api/user/profile', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({ profilePicture: urls[0] })
        })

        if (response.ok) {
          // Update user state with new avatar
          setUser(prev => prev ? { ...prev, avatar: urls[0] } : null)
          toast.success('Profile picture updated successfully!')
          
          // Update localStorage
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
          localStorage.setItem('user', JSON.stringify({
            ...currentUser,
            avatar: urls[0]
          }))
        } else {
          throw new Error('Failed to update profile picture')
        }
      } catch (error) {
        console.error('Error updating profile picture:', error)
        toast.error('Failed to update profile picture')
      } finally {
        setUploadingAvatar(false)
      }
    }
  }

  const handleAvatarUploadComplete = (imageUrl: string) => {
    // Update user state with new profile picture
    setUser(prev => prev ? { ...prev, profilePicture: imageUrl } : null)
    
    // Update localStorage if needed
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
    localStorage.setItem('user', JSON.stringify({
      ...currentUser,
      profilePicture: imageUrl
    }))
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'verified': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'rejected': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'verified': return <FaCheck className="mr-1" />
      case 'pending': return <FaSpinner className="mr-1 animate-spin" />
      case 'rejected': return <FaTimes className="mr-1" />
      default: return <FaUser className="mr-1" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-4xl text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaTimes className="text-4xl text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load profile</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
              <p className="text-gray-600">Manage your account information and preferences</p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              
              {/* Profile Header */}
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 px-6 py-8 text-center">
                <div className="relative inline-block mb-4">
                  <ProfileImageUpload
                    currentImage={getSafeAvatarUrl(user.avatar) || user.profilePicture}
                    userName={user.name || 'User'}
                    onUploadComplete={handleAvatarUploadComplete}
                  />
                </div>
                <h3 className="text-xl font-semibold text-white mb-1">{user.name}</h3>
                <p className="text-orange-100 text-sm">{user.email}</p>
              </div>

              {/* Profile Stats */}
              <div className="px-6 py-4">
                <div className="space-y-3">
                  
                  {/* User Type */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Account Type</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full capitalize">
                      {user.userType}
                    </span>
                  </div>

                  {/* Verification Status */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Email Status</span>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full flex items-center ${user.isVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.isVerified ? <FaCheck className="mr-1" /> : <FaTimes className="mr-1" />}
                      {user.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>

                  {/* Provider Status */}
                  {user.userType === 'provider' && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Provider Status</span>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full flex items-center ${getStatusColor(user.providerStatus)}`}>
                        {getStatusIcon(user.providerStatus)}
                        {user.providerStatus || 'Unknown'}
                      </span>
                    </div>
                  )}

                  {/* Member Since */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Member Since</span>
                    <span className="text-sm text-gray-800">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Last Login */}
                  {user.lastLogin && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Last Login</span>
                      <span className="text-sm text-gray-800">
                        {new Date(user.lastLogin).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </motion.div>

          {/* Profile Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
              
              {/* Header with Edit Button */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center px-4 py-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
                  >
                    <FaEdit className="mr-2" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      {isSaving ? <FaSpinner className="mr-2 animate-spin" /> : <FaSave className="mr-2" />}
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <FaTimes className="mr-2" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Messages */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-3"
                >
                  <p className="text-red-600 text-sm">{error}</p>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mx-6 mt-4 bg-green-50 border border-green-200 rounded-lg p-3"
                >
                  <p className="text-green-600 text-sm">{success}</p>
                </motion.div>
              )}

              {/* Form Fields */}
              <div className="p-6 space-y-6">
                
                {/* Personal Information */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                    <FaUser className="mr-2 text-orange-500" />
                    Personal Information
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                          placeholder="Enter your full name"
                        />
                      ) : (
                        <p className="py-2 text-gray-900">{user.name || 'Not provided'}</p>
                      )}
                    </div>

                    {/* Email (read-only) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="flex items-center">
                        <FaEnvelope className="text-gray-400 mr-2" />
                        <p className="py-2 text-gray-900">{user.email}</p>
                        {user.isVerified && (
                          <FaShieldAlt className="text-green-500 ml-2" title="Verified" />
                        )}
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                          placeholder="Enter your phone number"
                        />
                      ) : (
                        <div className="flex items-center">
                          <FaPhone className="text-gray-400 mr-2" />
                          <p className="py-2 text-gray-900">{user.phone || 'Not provided'}</p>
                        </div>
                      )}
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      {isEditing ? (
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors resize-none"
                          placeholder="Enter your address"
                        />
                      ) : (
                        <div className="flex items-start">
                          <FaMapMarkerAlt className="text-gray-400 mr-2 mt-2" />
                          <p className="py-2 text-gray-900">{formatAddress(user.address) || 'Not provided'}</p>
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                {/* Preferences */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                    <FaStar className="mr-2 text-orange-500" />
                    Preferences
                  </h4>
                  
                  <div className="space-y-4">
                    
                    {/* Notifications */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-gray-900">Email Notifications</h5>
                        <p className="text-sm text-gray-600">Receive updates about your bookings and account</p>
                      </div>
                      {isEditing ? (
                        <input
                          type="checkbox"
                          name="preferences.notifications"
                          checked={formData.preferences.notifications}
                          onChange={handleInputChange}
                          className="w-5 h-5 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                        />
                      ) : (
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${user.preferences?.notifications ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {user.preferences?.notifications ? 'Enabled' : 'Disabled'}
                        </span>
                      )}
                    </div>

                    {/* Marketing */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-gray-900">Marketing Emails</h5>
                        <p className="text-sm text-gray-600">Receive promotional content and service updates</p>
                      </div>
                      {isEditing ? (
                        <input
                          type="checkbox"
                          name="preferences.marketing"
                          checked={formData.preferences.marketing}
                          onChange={handleInputChange}
                          className="w-5 h-5 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                        />
                      ) : (
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${user.preferences?.marketing ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {user.preferences?.marketing ? 'Enabled' : 'Disabled'}
                        </span>
                      )}
                    </div>

                  </div>
                </div>

              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  )
}
