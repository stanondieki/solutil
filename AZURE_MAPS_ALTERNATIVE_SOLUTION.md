# Azure Maps Alternative Solution

Since Azure Maps is not available in your allowed regions, here are alternative solutions:

## Option 1: OpenStreetMap with Leaflet (FREE)

This is a completely free alternative that works great:

### 1. Install Leaflet
```bash
cd frontend
npm install leaflet @types/leaflet
```

### 2. Create OpenStreetMap Component
```typescript
// src/components/OpenStreetMap.tsx
'use client'

import React, { useEffect, useRef, useState } from 'react'
import { FaMapMarkerAlt, FaSpinner, FaSearch, FaCrosshairs } from 'react-icons/fa'

// Load Leaflet dynamically to avoid SSR issues
let L: any = null

interface MapLocation {
  latitude: number
  longitude: number
  address?: string
  formattedAddress?: string
}

interface OpenStreetMapProps {
  onLocationSelect: (location: MapLocation) => void
  initialLocation?: MapLocation
  className?: string
  height?: string
  showSearch?: boolean
  showCurrentLocation?: boolean
}

export default function OpenStreetMap({
  onLocationSelect,
  initialLocation,
  className = '',
  height = '400px',
  showSearch = true,
  showCurrentLocation = true
}: OpenStreetMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [currentMarker, setCurrentMarker] = useState<any>(null)
  const [error, setError] = useState<string>('')

  // Load Leaflet and initialize map
  useEffect(() => {
    const initializeMap = async () => {
      try {
        setIsLoading(true)
        setError('')

        // Load Leaflet CSS
        if (!document.querySelector('link[href*="leaflet"]')) {
          const link = document.createElement('link')
          link.rel = 'stylesheet'
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
          document.head.appendChild(link)
        }

        // Load Leaflet JS
        if (!L) {
          L = await import('leaflet')
          
          // Fix default marker icons
          delete (L.Icon.Default.prototype as any)._getIconUrl
          L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
          })
        }

        if (!mapRef.current) return

        // Initialize map centered on Nairobi
        const mapInstance = L.map(mapRef.current).setView([
          initialLocation?.latitude || -1.2921,
          initialLocation?.longitude || 36.8219
        ], initialLocation ? 15 : 10)

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(mapInstance)

        // Add initial marker if location provided
        if (initialLocation) {
          const marker = L.marker([initialLocation.latitude, initialLocation.longitude])
            .addTo(mapInstance)
          setCurrentMarker(marker)
        }

        // Add click event
        mapInstance.on('click', (e: any) => {
          handleMapClick(e.latlng.lat, e.latlng.lng, mapInstance)
        })

        setMap(mapInstance)
        setIsLoading(false)

      } catch (err) {
        console.error('Failed to initialize map:', err)
        setError('Failed to load map')
        setIsLoading(false)
      }
    }

    initializeMap()

    // Cleanup
    return () => {
      if (map) {
        map.remove()
      }
    }
  }, [])

  // Handle map click
  const handleMapClick = async (lat: number, lng: number, mapInstance: any) => {
    try {
      // Remove existing marker
      if (currentMarker) {
        mapInstance.removeLayer(currentMarker)
      }

      // Add new marker
      const marker = L.marker([lat, lng]).addTo(mapInstance)
      setCurrentMarker(marker)

      // Reverse geocode using OpenStreetMap Nominatim
      const address = await reverseGeocode(lat, lng)
      
      const location: MapLocation = {
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

  // Reverse geocode using Nominatim (free)
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      )
      
      if (!response.ok) throw new Error('Reverse geocoding failed')
      
      const data = await response.json()
      
      if (data.display_name) {
        return {
          address: data.display_name,
          formattedAddress: data.display_name
        }
      }
      
      return null
    } catch (err) {
      console.error('Reverse geocoding error:', err)
      return null
    }
  }

  // Search for places using Nominatim
  const searchPlaces = async (query: string) => {
    if (!query.trim() || !map) return

    try {
      setIsSearching(true)
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=ke&limit=5&addressdetails=1`
      )
      
      if (!response.ok) throw new Error('Search failed')
      
      const data = await response.json()
      
      if (data && data.length > 0) {
        const firstResult = data[0]
        const lat = parseFloat(firstResult.lat)
        const lng = parseFloat(firstResult.lon)
        
        // Center map on search result
        map.setView([lat, lng], 15)
        
        // Remove existing marker
        if (currentMarker) {
          map.removeLayer(currentMarker)
        }

        // Add new marker
        const marker = L.marker([lat, lng]).addTo(map)
        setCurrentMarker(marker)
        
        // Notify parent component
        const location: MapLocation = {
          latitude: lat,
          longitude: lng,
          address: firstResult.display_name,
          formattedAddress: firstResult.display_name
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
          map.setView([lat, lng], 15)
          
          // Remove existing marker
          if (currentMarker) {
            map.removeLayer(currentMarker)
          }

          // Add new marker
          const marker = L.marker([lat, lng]).addTo(map)
          setCurrentMarker(marker)
          
          // Reverse geocode current location
          reverseGeocode(lat, lng).then(address => {
            const location: MapLocation = {
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
        <div className="absolute top-4 left-4 right-4 z-[1000]">
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
          className="absolute top-4 right-4 z-[1000] bg-white p-2 rounded-lg shadow-md hover:shadow-lg transition-shadow"
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
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg z-[1000]">
          <div className="flex items-center gap-2 text-gray-600">
            <FaSpinner className="animate-spin" />
            <span>Loading map...</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute bottom-4 left-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded z-[1000]">
          {error}
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
```

### 3. Update your book-service page to use OpenStreetMap instead

Replace the import:
```typescript
// Change this line in book-service/page.tsx
import OpenStreetMap from '@/components/OpenStreetMap'
// Instead of: import AzureMap from '@/components/AzureMap'
```

And replace the component usage:
```typescript
<OpenStreetMap
  onLocationSelect={handleAzureMapLocationSelect}
  initialLocation={azureMapLocation || undefined}
  height="400px"
  showSearch={true}
  showCurrentLocation={true}
  className="w-full"
/>
```

## Benefits of This Solution:

✅ **Completely FREE** - No API keys needed
✅ **No regional restrictions** - Works everywhere
✅ **Same functionality** - Click to select, search, GPS
✅ **Kenya-focused** - Searches limited to Kenya
✅ **Reliable** - Uses OpenStreetMap (powers many major apps)
✅ **No subscription required**

This will give you the exact same user experience as Azure Maps, but without any cost or regional restrictions!

Would you like me to help you implement this OpenStreetMap solution?