'use client'

import React, { useEffect, useRef, useState } from 'react'
import { FaMapMarkerAlt, FaSpinner, FaSearch, FaCrosshairs } from 'react-icons/fa'

// Azure Maps types - simplified interface
interface AzureMapLocation {
  latitude: number
  longitude: number
  address?: string
  formattedAddress?: string
}

interface AzureMapProps {
  onLocationSelect: (location: AzureMapLocation) => void
  initialLocation?: AzureMapLocation
  className?: string
  height?: string
  showSearch?: boolean
  showCurrentLocation?: boolean
}

// Declare global variables for Azure Maps
declare global {
  interface Window {
    atlas: any
  }
}

export default function AzureMap({
  onLocationSelect,
  initialLocation,
  className = '',
  height = '400px',
  showSearch = true,
  showCurrentLocation = true
}: AzureMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [currentMarker, setCurrentMarker] = useState<any>(null)
  const [error, setError] = useState<string>('')
  const [atlasLoaded, setAtlasLoaded] = useState(false)

  // Load Azure Maps SDK via CDN
  useEffect(() => {
    const loadAzureMaps = async () => {
      try {
        setIsLoading(true)
        setError('')

        const subscriptionKey = process.env.NEXT_PUBLIC_AZURE_MAPS_SUBSCRIPTION_KEY
        if (!subscriptionKey) {
          throw new Error('🗺️ Azure Maps Setup Required!\n\nPlease add your Azure Maps subscription key to .env.local:\nNEXT_PUBLIC_AZURE_MAPS_SUBSCRIPTION_KEY=your_key_here\n\nSee AZURE_MAPS_QUICK_SETUP.md for detailed instructions.')
        }

        // Check if Azure Maps is already loaded
        if (window.atlas) {
          setAtlasLoaded(true)
          initializeMap()
          return
        }

        // Load Azure Maps CSS
        const cssLink = document.createElement('link')
        cssLink.rel = 'stylesheet'
        cssLink.href = 'https://atlas.microsoft.com/sdk/javascript/mapcontrol/2/atlas.min.css'
        document.head.appendChild(cssLink)

        // Load Azure Maps JavaScript
        const script = document.createElement('script')
        script.src = 'https://atlas.microsoft.com/sdk/javascript/mapcontrol/2/atlas.min.js'
        script.onload = () => {
          setAtlasLoaded(true)
          initializeMap()
        }
        script.onerror = () => {
          setError('Failed to load Azure Maps SDK')
          setIsLoading(false)
        }
        document.head.appendChild(script)

      } catch (err) {
        console.error('Failed to load Azure Maps:', err)
        setError(err instanceof Error ? err.message : 'Failed to load map')
        setIsLoading(false)
      }
    }

    loadAzureMaps()
  }, [])

  // Initialize the map once Atlas is loaded
  const initializeMap = () => {
    if (!mapRef.current || !window.atlas) return

    try {
      const subscriptionKey = process.env.NEXT_PUBLIC_AZURE_MAPS_SUBSCRIPTION_KEY

      // Initialize the map
      const mapInstance = new window.atlas.Map(mapRef.current, {
        center: initialLocation 
          ? [initialLocation.longitude, initialLocation.latitude]
          : [36.8219, -1.2921], // Default to Nairobi
        zoom: initialLocation ? 15 : 10,
        view: 'Auto',
        authOptions: {
          authType: window.atlas.AuthenticationType.subscriptionKey,
          subscriptionKey: subscriptionKey
        },
        style: 'grayscale_light',
        showLogo: false,
        showFeedbackLink: false
      })

      // Wait for map to be ready
      mapInstance.events.add('ready', () => {
        console.log('Azure Map loaded successfully')
        
        // Add data source for markers
        const dataSource = new window.atlas.source.DataSource()
        mapInstance.sources.add(dataSource)

        // Add symbol layer for markers
        const symbolLayer = new window.atlas.layer.SymbolLayer(dataSource, undefined, {
          iconOptions: {
            image: 'pin-red',
            anchor: 'center',
            allowOverlap: true
          }
        })
        mapInstance.layers.add(symbolLayer)

        // Add initial marker if location provided
        if (initialLocation) {
          addMarker(initialLocation.longitude, initialLocation.latitude, dataSource)
        }

        // Add click event
        mapInstance.events.add('click', (e: any) => {
          const position = e.position
          handleMapClick(position[1], position[0], dataSource) // lat, lng
        })

        setMap(mapInstance)
        setIsLoading(false)
      })

      mapInstance.events.add('error', (e: any) => {
        console.error('Azure Map error:', e)
        setError('Failed to load map')
        setIsLoading(false)
      })

    } catch (err) {
      console.error('Failed to initialize Azure Maps:', err)
      setError(err instanceof Error ? err.message : 'Failed to initialize map')
      setIsLoading(false)
    }
  }

  // Add marker to map
  const addMarker = (lng: number, lat: number, dataSource: any) => {
    if (!window.atlas || !dataSource) return
    
    try {
      // Clear existing markers
      dataSource.clear()
      
      // Add new marker
      const point = new window.atlas.data.Point([lng, lat])
      const marker = new window.atlas.data.Feature(point)
      dataSource.add(marker)
      
      setCurrentMarker({ lng, lat })
    } catch (err) {
      console.error('Error adding marker:', err)
    }
  }

  // Handle map click
  const handleMapClick = async (lat: number, lng: number, dataSource: any) => {
    try {
      addMarker(lng, lat, dataSource)
      
      // Reverse geocode to get address
      const address = await reverseGeocode(lat, lng)
      
      const location: AzureMapLocation = {
        latitude: lat,
        longitude: lng,
        address: address?.address,
        formattedAddress: address?.formattedAddress
      }
      
      onLocationSelect(location)
    } catch (err) {
      console.error('Error handling map click:', err)
    }
  }

  // Reverse geocode coordinates to address
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const subscriptionKey = process.env.NEXT_PUBLIC_AZURE_MAPS_SUBSCRIPTION_KEY
      const response = await fetch(
        `https://atlas.microsoft.com/search/address/reverse/json?api-version=1.0&subscription-key=${subscriptionKey}&query=${lat},${lng}`
      )
      
      if (!response.ok) throw new Error('Reverse geocoding failed')
      
      const data = await response.json()
      const result = data.addresses?.[0]
      
      if (result) {
        return {
          address: result.address.freeformAddress,
          formattedAddress: result.address.freeformAddress
        }
      }
      
      return null
    } catch (err) {
      console.error('Reverse geocoding error:', err)
      return null
    }
  }

  // Search for places
  const searchPlaces = async (query: string) => {
    if (!query.trim() || !map) return

    try {
      setIsSearching(true)
      const subscriptionKey = process.env.NEXT_PUBLIC_AZURE_MAPS_SUBSCRIPTION_KEY
      
      const response = await fetch(
        `https://atlas.microsoft.com/search/fuzzy/json?api-version=1.0&subscription-key=${subscriptionKey}&query=${encodeURIComponent(query)}&countrySet=KE&limit=5`
      )
      
      if (!response.ok) throw new Error('Search failed')
      
      const data = await response.json()
      const results = data.results
      
      if (results && results.length > 0) {
        const firstResult = results[0]
        const lat = firstResult.position.lat
        const lng = firstResult.position.lon
        
        // Center map on search result
        map.setCamera({
          center: [lng, lat],
          zoom: 15
        })
        
        // Add marker
        const dataSources = map.sources.sources
        const dataSource = dataSources.length > 0 ? dataSources[0] : null
        if (dataSource) {
          addMarker(lng, lat, dataSource)
        }
        
        // Notify parent component
        const location: AzureMapLocation = {
          latitude: lat,
          longitude: lng,
          address: firstResult.address.freeformAddress,
          formattedAddress: firstResult.address.freeformAddress
        }
        
        onLocationSelect(location)
      }
    } catch (err) {
      console.error('Search error:', err)
      setError('Search failed')
    } finally {
      setIsSearching(false)
    }
  }

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported')
      return
    }

    setIsLoading(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        
        if (map) {
          map.setCamera({
            center: [lng, lat],
            zoom: 15
          })
          
          const dataSources = map.sources.sources
          const dataSource = dataSources.length > 0 ? dataSources[0] : null
          if (dataSource) {
            addMarker(lng, lat, dataSource)
          }
          
          // Reverse geocode current location
          reverseGeocode(lat, lng).then(address => {
            const location: AzureMapLocation = {
              latitude: lat,
              longitude: lng,
              address: address?.address,
              formattedAddress: address?.formattedAddress
            }
            onLocationSelect(location)
          })
        }
        setIsLoading(false)
      },
      (error) => {
        console.error('Geolocation error:', error)
        setError('Failed to get current location')
        setIsLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    )
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    searchPlaces(searchQuery)
  }

  return (
    <div className={`relative ${className}`}>
      {/* Search Bar */}
      {showSearch && (
        <div className="absolute top-4 left-4 right-4 z-10">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for places in Kenya..."
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-500"
              >
                {isSearching ? <FaSpinner className="animate-spin" /> : <FaSearch />}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Current Location Button */}
      {showCurrentLocation && (
        <button
          onClick={getCurrentLocation}
          disabled={isLoading}
          className="absolute top-4 right-4 z-10 bg-white p-2 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          title="Get current location"
        >
          <FaCrosshairs className="text-blue-500" />
        </button>
      )}

      {/* Map Container */}
      <div 
        ref={mapRef} 
        style={{ height }}
        className="w-full rounded-lg border border-gray-300"
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="flex items-center gap-2 text-gray-600">
            <FaSpinner className="animate-spin" />
            <span>Loading Azure Maps...</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute bottom-4 left-4 right-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded z-10">
          <div className="flex items-start space-x-2">
            <FaMapMarkerAlt className="text-red-500 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Azure Maps Setup Required</p>
              <p className="text-xs mt-1">{error}</p>
              <div className="mt-2 text-xs">
                <p>📋 Quick Setup:</p>
                <p>1. Get free key from Azure Portal</p>
                <p>2. Add to .env.local file</p>
                <p>3. Restart dev server</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-2 text-sm text-gray-600">
        <FaMapMarkerAlt className="inline mr-1" />
        Click on the map to select a location, or search for places
      </div>
    </div>
  )
}