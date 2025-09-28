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
  FaTimes
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
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  useEffect(() => {
    if (user) {
      // For now, we'll use the user data directly
      // In production, you'd fetch extended profile data from API
      setProfile({
        _id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        profilePicture: user.profilePicture || '',
        bio: 'Professional service provider committed to quality work.',
        location: 'Nairobi, Kenya',
        experience: '5+ years',
        hourlyRate: 1500,
        rating: 4.8,
        totalBookings: 247,
        completedBookings: 234,
        totalEarnings: 450000
      })
      setLoading(false)
    }
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
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                <p className="text-gray-600">Manage your profile and account settings</p>
              </div>
              <Link
                href="/provider/services"
                className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors inline-flex items-center space-x-2"
              >
                <FaServicestack className="h-5 w-5" />
                <span>Manage Services</span>
              </Link>
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
                className="bg-white rounded-xl shadow-sm border p-6"
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-xl shadow-sm border p-6"
                >
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <FaBookOpen className="h-6 w-6 text-blue-600" />
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
                  className="bg-white rounded-xl shadow-sm border p-6"
                >
                  <div className="flex items-center">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <FaCheck className="h-6 w-6 text-green-600" />
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
                  className="bg-white rounded-xl shadow-sm border p-6"
                >
                  <div className="flex items-center">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <FaDollarSign className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-gray-900">
                        KSh {profile.totalEarnings?.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">Total Earnings</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Profile Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
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
                className="bg-white rounded-xl shadow-sm border p-6"
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
      </div>
    </RoleGuard>
  )
}