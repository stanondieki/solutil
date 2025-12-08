'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import RoleGuard from '@/components/RoleGuard'
import CloudinaryUpload from '@/components/CloudinaryUpload'
import { toast } from 'react-hot-toast'
import {
  FaUser,
  FaEdit,
  FaCamera,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaDollarSign,
  FaStar,
  FaChartLine,
  FaServicestack,
  FaBookOpen,
  FaCheck,
  FaTimes,
  FaSignOutAlt,
  FaRocket,
  FaShieldAlt,
  FaFire
} from 'react-icons/fa'

interface UserProfile {
  _id: string
  name: string
  email: string
  phone?: string
  profilePicture?: string
  bio?: string
  location?: string
  experience?: string
  hourlyRate?: number
  rating?: number
  totalBookings?: number
  completedBookings?: number
  totalEarnings?: number
}

export default function ProviderProfile() {
  const { user, logout } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [showLogoutDropdown, setShowLogoutDropdown] = useState(false)

  useEffect(() => {
    const fetchProviderProfile = async () => {
      if (!user) return

      try {
        const token = localStorage.getItem('authToken')
        const response = await fetch('/api/provider/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const apiData = await response.json()
          const data = apiData.data || apiData // Handle nested response
          setProfile({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: (user as any).phone || '',
            profilePicture: (user as any).profilePicture || '',
            bio: data.profile?.bio || 'Professional service provider committed to quality work.',
            location: data.profile?.serviceAreas?.join(', ') || 'Nairobi, Kenya',
            experience: data.profile?.experience || '5+ years',
            hourlyRate: data.profile?.hourlyRate || 1500,
            rating: 4.8, // TODO: Calculate from reviews
            totalBookings: 0, // TODO: Get from bookings API
            completedBookings: 0, // TODO: Get from bookings API 
            totalEarnings: 0 // TODO: Calculate from completed bookings
          })
        } else {
          // Fallback to user data if API fails
          console.log('Using fallback data, API response:', response.status)
          setProfile({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: (user as any).phone || '',
            profilePicture: (user as any).profilePicture || '',
            bio: 'Professional service provider committed to quality work.',
            location: 'Nairobi, Kenya',
            experience: '5+ years',
            hourlyRate: 1500,
            rating: 4.8,
            totalBookings: 0,
            completedBookings: 0,
            totalEarnings: 0
          })
        }
      } catch (error) {
        console.error('Error fetching provider profile:', error)
        // Fallback to user data on error
        setProfile({
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: (user as any).phone || '',
          profilePicture: (user as any).profilePicture || '',
          bio: 'Professional service provider committed to quality work.',
          location: 'Nairobi, Kenya',
          experience: '5+ years',
          hourlyRate: 1500,
          rating: 4.8,
          totalBookings: 0,
          completedBookings: 0,
          totalEarnings: 0
        })
        toast.error('Failed to load profile data')
      } finally {
        setLoading(false)
      }
    }

    fetchProviderProfile()
  }, [user])

  const handleProfilePictureUpload = async (urls: string[]) => {
    if (urls.length > 0) {
      setUploadingPhoto(true)
      try {
        // Update profile picture in database
        const token = localStorage.getItem('authToken')
        const response = await fetch('/api/user/profile', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ profilePicture: urls[0] })
        })

        if (response.ok) {
          setProfile(prev => prev ? { ...prev, profilePicture: urls[0] } : null)
          toast.success('Profile picture updated successfully!')
        } else {
          throw new Error('Failed to update profile picture')
        }
      } catch (error) {
        console.error('Error updating profile picture:', error)
        toast.error('Failed to update profile picture')
      } finally {
        setUploadingPhoto(false)
      }
    }
  }

  // Modern logout functions
  const handleQuickLogout = async () => {
    console.log('🚀 Quick logout initiated from provider page')
    setShowLogoutDropdown(false)
    try {
      await logout()
    } catch (error) {
      console.error('❌ Quick logout error:', error)
      window.location.replace('/auth/login')
    }
  }

  const handleSecureLogout = async () => {
    console.log('🛡️ Secure logout initiated from provider page')
    setShowLogoutDropdown(false)
    try {
      localStorage.clear()
      sessionStorage.clear()
      await logout()
    } catch (error) {
      console.error('❌ Secure logout error:', error)
      window.location.replace('/auth/login')
    }
  }

  const handleEmergencyLogout = () => {
    console.log('🚨 Emergency logout initiated from provider page')
    setShowLogoutDropdown(false)
    localStorage.clear()
    sessionStorage.clear()
    document.cookie.split(';').forEach(cookie => {
      const eqPos = cookie.indexOf('=')
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
    })
    window.location.replace('/auth/login')
  }

  if (loading) {
    return (
      <RoleGuard requiredRole="provider">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </RoleGuard>
    )
  }

  if (!profile) {
    return (
      <RoleGuard requiredRole="provider">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-gray-600">Profile not found</p>
        </div>
      </RoleGuard>
    )
  }

  return (
    <RoleGuard requiredRole="provider">
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-8">
              <div>
                <h1 className="text-3xl font-bold text-white">Provider Dashboard</h1>
                <p className="text-orange-100">Manage your profile and grow your business</p>
              </div>
              <div className="flex items-center space-x-4">
                <Link
                  href="/provider/reviews"
                  className="bg-white text-orange-600 px-4 py-2 rounded-lg hover:bg-orange-50 transition-all duration-300 inline-flex items-center space-x-2 shadow-sm border border-orange-200 font-medium"
                >
                  <FaStar className="h-4 w-4" />
                  <span>Reviews</span>
                </Link>
                <Link
                  href="/provider/services"
                  className="bg-white text-orange-600 px-6 py-3 rounded-lg hover:bg-orange-50 transition-all duration-300 inline-flex items-center space-x-2 shadow-sm border border-orange-200 font-medium"
                >
                  <FaServicestack className="h-5 w-5" />
                  <span>Manage Services</span>
                </Link>
                <button
                  onClick={() => setShowLogoutDropdown(true)}
                  className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-all duration-300 inline-flex items-center space-x-2 border border-white/30 font-medium"
                >
                  <FaSignOutAlt className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="bg-white shadow-sm border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{profile?.rating}/5</div>
                <div className="text-sm text-gray-600">Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{profile?.totalBookings}</div>
                <div className="text-sm text-gray-600">Total Jobs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{profile?.completedBookings}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">KSh {profile?.totalEarnings?.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Earnings</div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-gray-100"
              >
                <div className="text-center">
                  {/* Profile Picture */}
                  <div className="relative inline-block mb-4">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 mx-auto">
                      {profile.profilePicture ? (
                        <Image
                          src={profile.profilePicture}
                          alt={profile.name}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-orange-100">
                          <FaUser className="h-8 w-8 text-orange-600" />
                        </div>
                      )}
                    </div>
                    
                    {/* Upload Button */}
                    <div className="absolute bottom-0 right-0">
                      <CloudinaryUpload
                        onUploadComplete={handleProfilePictureUpload}
                        maxFiles={1}
                        folder="profiles"
                        className="w-8 h-8"
                      >
                        <button
                          disabled={uploadingPhoto}
                          className="w-8 h-8 bg-orange-600 hover:bg-orange-700 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
                        >
                          <FaCamera className="h-3 w-3" />
                        </button>
                      </CloudinaryUpload>
                    </div>
                  </div>

                  <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
                  <p className="text-gray-600 mb-4">{profile.email}</p>
                  
                  {/* Rating */}
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(profile.rating || 0)
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {profile.rating} ({profile.totalBookings} reviews)
                    </span>
                  </div>

                  {/* Bio */}
                  <p className="text-sm text-gray-600 mb-6">{profile.bio}</p>

                  {/* Contact Info */}
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center text-gray-600">
                      <FaEnvelope className="h-4 w-4 mr-3" />
                      <span>{profile.email}</span>
                    </div>
                    {profile.phone && (
                      <div className="flex items-center text-gray-600">
                        <FaPhone className="h-4 w-4 mr-3" />
                        <span>{profile.phone}</span>
                      </div>
                    )}
                    {profile.location && (
                      <div className="flex items-center text-gray-600">
                        <FaMapMarkerAlt className="h-4 w-4 mr-3" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Stats & Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-gray-100"
                >
                  <div className="flex items-center">
                    <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl text-white">
                      <FaBookOpen className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-gray-900">
                        {profile.totalBookings}
                      </p>
                      <p className="text-sm text-gray-600">Total Bookings</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-gray-100"
                >
                  <div className="flex items-center">
                    <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl text-white">
                      <FaCheck className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-gray-900">
                        {profile.completedBookings}
                      </p>
                      <p className="text-sm text-gray-600">Completed</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-gray-100"
                >
                  <div className="flex items-center">
                    <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl text-white">
                      <FaDollarSign className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-gray-900">
                        KSh {profile.totalEarnings?.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">Total Earnings</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-gray-100"
                >
                  <div className="flex items-center">
                    <div className="p-3 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl text-white">
                      <FaStar className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-gray-900">
                        {profile.rating ? profile.rating.toFixed(1) : '0.0'}
                      </p>
                      <p className="text-sm text-gray-600">Average Rating</p>
                    </div>
                  </div>
                  <Link 
                    href="/provider/reviews"
                    className="mt-3 text-xs text-yellow-600 hover:text-yellow-700 font-medium inline-flex items-center"
                  >
                    View All Reviews →
                  </Link>
                </motion.div>
              </div>

              {/* Reviews Overview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl shadow-sm border"
              >
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Reviews & Ratings
                    </h3>
                    <Link
                      href="/provider/reviews"
                      className="text-orange-600 hover:text-orange-700 transition-colors inline-flex items-center space-x-2"
                    >
                      <span>View All</span>
                      <FaChartLine className="h-4 w-4" />
                    </Link>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {profile.rating ? profile.rating.toFixed(1) : '0.0'}
                      </div>
                      <div className="flex justify-center mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FaStar
                            key={star}
                            className={`h-4 w-4 ${
                              star <= (profile.rating || 0)
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-gray-500">Overall Rating</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1">0</div>
                      <div className="text-sm text-gray-500">Total Reviews</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1">0</div>
                      <div className="text-sm text-gray-500">This Month</div>
                    </div>
                  </div>
                  
                  <div className="text-center py-8 text-gray-500">
                    <FaStar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">No reviews yet</p>
                    <p className="text-sm mb-4">
                      Complete more services to start receiving client reviews and ratings.
                    </p>
                    <Link
                      href="/provider/bookings"
                      className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      <FaBookOpen className="h-4 w-4 mr-2" />
                      View Bookings
                    </Link>
                  </div>
                </div>
              </motion.div>

              {/* Profile Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-xl shadow-sm border"
              >
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Professional Details
                    </h3>
                    <button
                      onClick={() => setEditing(!editing)}
                      className="text-orange-600 hover:text-orange-700 transition-colors inline-flex items-center space-x-2"
                    >
                      <FaEdit className="h-4 w-4" />
                      <span>{editing ? 'Cancel' : 'Edit'}</span>
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Experience Level
                      </label>
                      <p className="text-gray-900">{profile.experience}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hourly Rate
                      </label>
                      <p className="text-gray-900">KSh {profile.hourlyRate}/hour</p>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                      </label>
                      <p className="text-gray-900">{profile.bio}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-gray-100"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link
                    href="/provider/services"
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
                  >
                    <FaServicestack className="h-5 w-5 text-orange-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Manage Services</p>
                      <p className="text-sm text-gray-600">Add or edit your services</p>
                    </div>
                  </Link>

                  <Link
                    href="/provider/bookings"
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
                  >
                    <FaCalendarAlt className="h-5 w-5 text-orange-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">View Bookings</p>
                      <p className="text-sm text-gray-600">Check your appointments</p>
                    </div>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Logout Options Dropdown */}
        {showLogoutDropdown && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
              <div className="flex items-center mb-4">
                <FaSignOutAlt className="h-6 w-6 text-red-500 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Logout Options</h3>
              </div>
              
              <p className="text-gray-600 mb-6">Choose your preferred logout method:</p>
              
              <div className="space-y-3">
                {/* Quick Logout */}
                <button
                  onClick={handleQuickLogout}
                  className="w-full flex items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors"
                >
                  <FaRocket className="h-5 w-5 text-orange-600 mr-3" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Quick Logout</div>
                    <div className="text-sm text-gray-600">Fast logout (recommended)</div>
                  </div>
                </button>

                {/* Secure Logout */}
                <button
                  onClick={handleSecureLogout}
                  className="w-full flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                >
                  <FaShieldAlt className="h-5 w-5 text-blue-600 mr-3" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Secure Logout</div>
                    <div className="text-sm text-gray-600">Complete session cleanup</div>
                  </div>
                </button>

                {/* Emergency Logout */}
                <button
                  onClick={handleEmergencyLogout}
                  className="w-full flex items-center p-4 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors"
                >
                  <FaFire className="h-5 w-5 text-red-600 mr-3" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Emergency Logout</div>
                    <div className="text-sm text-gray-600">Force logout & clear all data</div>
                  </div>
                </button>
              </div>

              <button
                onClick={() => setShowLogoutDropdown(false)}
                className="w-full mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  )
}