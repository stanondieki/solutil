'use client'

import React, { useState, useEffect } from 'react'
import { FaMapMarkerAlt, FaSpinner, FaCheck, FaExclamationTriangle, FaSync } from 'react-icons/fa'

interface LocationSharingProps {
  onLocationUpdate: (location: {
    latitude: number
    longitude: number
    accuracy: number
    address?: string
    timestamp: number
  }) => void
  onLocationError: (error: string) => void
  isActive: boolean
  className?: string
}

interface LocationData {
  latitude: number
  longitude: number
  accuracy: number
  address?: string
  timestamp: number
}

export default function LocationSharing({ 
  onLocationUpdate, 
  onLocationError, 
  isActive,
  className = ''
}: LocationSharingProps) {
  const [locationStatus, setLocationStatus] = useState<'idle' | 'requesting' | 'active' | 'error'>('idle')
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [watchId, setWatchId] = useState<number | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [watchId])

  // Auto-start location sharing when component becomes active
  useEffect(() => {
    if (isActive && locationStatus === 'idle') {
      startLocationSharing()
    } else if (!isActive && watchId !== null) {
      stopLocationSharing()
    }
  }, [isActive])

  const startLocationSharing = async () => {
    if (!navigator.geolocation) {
      const error = 'Geolocation is not supported by this browser'
      setErrorMessage(error)
      setLocationStatus('error')
      onLocationError(error)
      return
    }

    setLocationStatus('requesting')
    setErrorMessage('')

    // Request permission and get initial location
    try {
      const position = await getCurrentPosition()
      const locationData = await processLocationData(position)
      
      setCurrentLocation(locationData)
      setLocationStatus('active')
      setLastUpdate(new Date())
      onLocationUpdate(locationData)

      // Start watching for location changes
      const id = navigator.geolocation.watchPosition(
        async (position) => {
          const updatedLocationData = await processLocationData(position)
          setCurrentLocation(updatedLocationData)
          setLastUpdate(new Date())
          onLocationUpdate(updatedLocationData)
        },
        (error) => {
          console.error('Location watch error:', error)
          handleLocationError(error)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000 // Accept cached position up to 30 seconds old
        }
      )

      setWatchId(id)
    } catch (error) {
      handleLocationError(error)
    }
  }

  const stopLocationSharing = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      setWatchId(null)
    }
    setLocationStatus('idle')
    setCurrentLocation(null)
    setLastUpdate(null)
  }

  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000
        }
      )
    })
  }

  const processLocationData = async (position: GeolocationPosition): Promise<LocationData> => {
    const { latitude, longitude, accuracy } = position.coords
    
    const locationData: LocationData = {
      latitude,
      longitude,
      accuracy,
      timestamp: Date.now()
    }

    // Try to get address from coordinates (reverse geocoding)
    try {
      const address = await reverseGeocode(latitude, longitude)
      locationData.address = address
    } catch (error) {
      console.warn('Failed to get address for location:', error)
    }

    return locationData
  }

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    // Using a simple reverse geocoding service (in production, use a proper service like Google Maps API)
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      )
      
      if (response.ok) {
        const data = await response.json()
        return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      }
    } catch (error) {
      console.warn('Reverse geocoding failed:', error)
    }
    
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
  }

  const handleLocationError = (error: any) => {
    let errorMsg = 'Failed to get location'
    
    if (error.code) {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMsg = 'Location access denied by user'
          break
        case error.POSITION_UNAVAILABLE:
          errorMsg = 'Location information unavailable'
          break
        case error.TIMEOUT:
          errorMsg = 'Location request timed out'
          break
        default:
          errorMsg = 'Unknown location error'
      }
    } else if (error.message) {
      errorMsg = error.message
    }

    setErrorMessage(errorMsg)
    setLocationStatus('error')
    onLocationError(errorMsg)
  }

  const refreshLocation = () => {
    if (locationStatus === 'active') {
      setLocationStatus('requesting')
      getCurrentPosition()
        .then(processLocationData)
        .then((locationData) => {
          setCurrentLocation(locationData)
          setLocationStatus('active')
          setLastUpdate(new Date())
          onLocationUpdate(locationData)
        })
        .catch(handleLocationError)
    } else {
      startLocationSharing()
    }
  }

  const formatAccuracy = (accuracy: number): string => {
    if (accuracy < 10) return 'Very accurate'
    if (accuracy < 50) return 'Good accuracy'
    if (accuracy < 100) return 'Fair accuracy'
    return 'Low accuracy'
  }

  const formatLastUpdate = (): string => {
    if (!lastUpdate) return ''
    const now = new Date()
    const diff = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000)
    
    if (diff < 60) return `Updated ${diff}s ago`
    if (diff < 3600) return `Updated ${Math.floor(diff / 60)}m ago`
    return `Updated ${Math.floor(diff / 3600)}h ago`
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FaMapMarkerAlt className={`h-5 w-5 ${
            locationStatus === 'active' ? 'text-green-600' :
            locationStatus === 'error' ? 'text-red-600' :
            'text-gray-600'
          }`} />
          <h3 className="font-semibold text-gray-900">Live Location Sharing</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          {locationStatus === 'requesting' && (
            <FaSpinner className="h-4 w-4 text-blue-600 animate-spin" />
          )}
          {locationStatus === 'active' && (
            <FaCheck className="h-4 w-4 text-green-600" />
          )}
          {locationStatus === 'error' && (
            <FaExclamationTriangle className="h-4 w-4 text-red-600" />
          )}
          
          <button
            onClick={refreshLocation}
            disabled={locationStatus === 'requesting'}
            className="p-1 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
            title="Refresh location"
          >
            <FaSync className={`h-4 w-4 ${locationStatus === 'requesting' ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Status Display */}
      <div className="space-y-3">
        {locationStatus === 'idle' && (
          <div className="text-gray-600">
            <p className="text-sm">Location sharing is not active.</p>
            <button
              onClick={startLocationSharing}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              Share My Location
            </button>
          </div>
        )}

        {locationStatus === 'requesting' && (
          <div className="text-blue-600">
            <p className="text-sm">Requesting location access...</p>
            <p className="text-xs text-gray-500 mt-1">
              Please allow location access when prompted by your browser.
            </p>
          </div>
        )}

        {locationStatus === 'active' && currentLocation && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-600">Location Active</span>
              <span className="text-xs text-gray-500">{formatLastUpdate()}</span>
            </div>
            
            {currentLocation.address && (
              <p className="text-sm text-gray-700">{currentLocation.address}</p>
            )}
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>Accuracy: {formatAccuracy(currentLocation.accuracy)}</span>
              <span>±{Math.round(currentLocation.accuracy)}m</span>
            </div>
            
            <button
              onClick={stopLocationSharing}
              className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors"
            >
              Stop Sharing Location
            </button>
          </div>
        )}

        {locationStatus === 'error' && (
          <div className="text-red-600">
            <p className="text-sm">{errorMessage}</p>
            <button
              onClick={startLocationSharing}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Your location will be shared with selected providers only</p>
          <p>• Location updates automatically every 30 seconds</p>
          <p>• You can stop sharing at any time</p>
        </div>
      </div>
    </div>
  )
}