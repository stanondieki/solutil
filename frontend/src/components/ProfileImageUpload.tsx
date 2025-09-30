'use client'

import React, { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { 
  FaCamera, 
  FaSpinner, 
  FaTimes, 
  FaUpload,
  FaEdit,
  FaCheck,
  FaExclamationTriangle
} from 'react-icons/fa'

interface ProfileImageUploadProps {
  currentImage?: string | null
  userName: string
  onUploadComplete: (imageUrl: string) => void
  className?: string
}

export default function ProfileImageUpload({ 
  currentImage, 
  userName,
  onUploadComplete,
  className = ""
}: ProfileImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [showUploadArea, setShowUploadArea] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Get user initials for fallback
  const getUserInitials = (name: string): string => {
    const words = name.trim().split(' ')
    if (words.length >= 2) {
      return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase()
    }
    return name.charAt(0).toUpperCase() || 'U'
  }

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB')
      return
    }

    setError(null)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string)
      setShowUploadArea(true)
    }
    reader.readAsDataURL(file)

    // Start upload
    uploadImage(file)
  }, [])

  // Upload image to backend
  const uploadImage = async (file: File) => {
    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('profilePicture', file)

      // Get auth token
      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new Error('No authentication token found')
      }

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev < 90) return prev + 10
          return prev
        })
      }, 200)

      const response = await fetch('/api/upload/profile-picture', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Upload failed')
      }

      const data = await response.json()
      
      if (data.status === 'success') {
        // Wait a moment to show completion
        setTimeout(() => {
          onUploadComplete(data.data.image.url)
          toast.success('Profile picture updated successfully!')
          setShowUploadArea(false)
          setPreviewImage(null)
          setIsUploading(false)
          setUploadProgress(0)
          
          // Refresh profile data without page reload
          if (typeof window !== 'undefined') {
            // Emit custom event to trigger profile reload
            window.dispatchEvent(new CustomEvent('profileUpdated'))
          }
        }, 500)
      } else {
        throw new Error(data.message || 'Upload failed')
      }

    } catch (error: any) {
      console.error('Upload error:', error)
      setError(error.message || 'Failed to upload image')
      toast.error(error.message || 'Failed to upload image')
      setIsUploading(false)
      setUploadProgress(0)
      setPreviewImage(null)
      setShowUploadArea(false)
    }
  }

  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  // Handle drag & drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }, [handleFileSelect])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  // Retry upload
  const retryUpload = () => {
    if (fileInputRef.current?.files?.[0]) {
      handleFileSelect(fileInputRef.current.files[0])
    }
  }

  // Cancel upload
  const cancelUpload = () => {
    setShowUploadArea(false)
    setPreviewImage(null)
    setIsUploading(false)
    setUploadProgress(0)
    setError(null)
  }

  return (
    <div className={`relative ${className}`}>
      {/* Main Profile Image */}
      <motion.div 
        className="relative group cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className={`
          w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-white text-3xl font-bold 
          border-4 border-white/30 transition-all duration-300 overflow-hidden
          ${isDragging ? 'border-orange-400 bg-orange-50 scale-105' : ''}
          ${isUploading ? 'border-orange-400' : 'group-hover:border-orange-400'}
        `}>
          {currentImage ? (
            <Image 
              src={currentImage} 
              alt={userName}
              width={96}
              height={96}
              className="rounded-full object-cover w-full h-full"
            />
          ) : (
            <span className="text-gray-600">
              {getUserInitials(userName)}
            </span>
          )}
          
          {/* Overlay */}
          <div className={`
            absolute inset-0 bg-black/40 rounded-full flex items-center justify-center
            transition-opacity duration-300
            ${isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
          `}>
            {isDragging ? (
              <FaUpload className="text-white text-lg" />
            ) : (
              <FaCamera className="text-white text-lg" />
            )}
          </div>
        </div>
      </motion.div>

      {/* Camera Button */}
      <motion.button 
        className={`
          absolute bottom-0 right-0 w-8 h-8 bg-white text-orange-500 rounded-full 
          flex items-center justify-center shadow-lg transition-all duration-300
          ${isUploading ? 'bg-orange-100' : 'hover:bg-gray-50 hover:scale-110'}
        `}
        onClick={(e) => {
          e.stopPropagation()
          fileInputRef.current?.click()
        }}
        disabled={isUploading}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isUploading ? (
          <FaSpinner className="text-sm animate-spin" />
        ) : (
          <FaCamera className="text-sm" />
        )}
      </motion.button>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Upload Overlay */}
      <AnimatePresence>
        {showUploadArea && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={cancelUpload}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="bg-white rounded-xl p-6 m-4 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Preview Image */}
              {previewImage && (
                <div className="mb-4">
                  <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-gray-200">
                    <img 
                      src={previewImage} 
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Upload Status */}
              <div className="text-center">
                {isUploading ? (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Uploading Image...
                    </h3>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div 
                        className="bg-orange-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <p className="text-sm text-gray-600">{uploadProgress}% complete</p>
                  </div>
                ) : error ? (
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                      <FaExclamationTriangle className="text-red-500 text-xl" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Upload Failed</h3>
                    <p className="text-sm text-gray-600">{error}</p>
                    <div className="flex space-x-3">
                      <button
                        onClick={retryUpload}
                        className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors"
                      >
                        Retry
                      </button>
                      <button
                        onClick={cancelUpload}
                        className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <FaCheck className="text-green-500 text-xl" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Upload Complete!</h3>
                    <p className="text-sm text-gray-600">Your profile picture has been updated.</p>
                  </div>
                )}
              </div>

              {/* Close Button */}
              {!isUploading && (
                <button
                  onClick={cancelUpload}
                  className="absolute top-4 right-4 w-8 h-8 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <FaTimes className="text-sm" />
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}