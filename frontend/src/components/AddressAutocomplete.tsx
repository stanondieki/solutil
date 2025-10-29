'use client'

import React, { useState, useRef, useEffect } from 'react'
import { FaMapMarkerAlt, FaSpinner, FaSearch, FaTimes } from 'react-icons/fa'

interface AddressSuggestion {
  display_name: string
  lat: number | string
  lon: number | string
  place_id: number
  class?: string
  type?: string
  address: {
    house_number?: string
    road?: string
    suburb?: string
    city?: string
    county?: string
    country?: string
    building?: string
    amenity?: string
    shop?: string
  }
}

interface AddressAutocompleteProps {
  onAddressSelect: (address: {
    latitude: number
    longitude: number
    formattedAddress: string
    components: any
  }) => void
  placeholder?: string
  className?: string
  countryCode?: string
  initialValue?: string
}

export default function AddressAutocomplete({
  onAddressSelect,
  placeholder = "Start typing a building, apartment, house number, or area in Kenya...",
  className = "",
  countryCode = "ke",
  initialValue = ""
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState(initialValue)
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [error, setError] = useState('')
  
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Debounced search function
  const searchAddresses = async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    try {
      setIsLoading(true)
      setError('')

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=${countryCode}&limit=8&addressdetails=1&dedupe=1&extratags=1&namedetails=1&featuretype=settlement,tourism,amenity,shop,office,building`
      )

      if (!response.ok) throw new Error('Search failed')

      const data: AddressSuggestion[] = await response.json()
      setSuggestions(data)
      setShowSuggestions(data.length > 0)
      setSelectedIndex(-1)

    } catch (err) {
      console.error('Address search error:', err)
      setError('Search failed. Please try again.')
      setSuggestions([])
      setShowSuggestions(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)

    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Set new timeout for debouncing
    debounceRef.current = setTimeout(() => {
      searchAddresses(value)
    }, 300) // 300ms delay
  }

  // Handle suggestion selection
  const selectSuggestion = (suggestion: AddressSuggestion) => {
    setQuery(suggestion.display_name)
    setShowSuggestions(false)
    setSuggestions([])
    setSelectedIndex(-1)

    // Call the callback with selected address
    onAddressSelect({
      latitude: typeof suggestion.lat === 'string' ? parseFloat(suggestion.lat) : suggestion.lat,
      longitude: typeof suggestion.lon === 'string' ? parseFloat(suggestion.lon) : suggestion.lon,
      formattedAddress: suggestion.display_name,
      components: suggestion.address
    })
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
        break
      
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
        break
      
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          selectSuggestion(suggestions[selectedIndex])
        }
        break
      
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  // Handle clicking outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Clear search
  const clearSearch = () => {
    setQuery('')
    setSuggestions([])
    setShowSuggestions(false)
    setSelectedIndex(-1)
    setError('')
    inputRef.current?.focus()
  }

  // Format address for display (optimized for buildings and home services)
  const formatAddress = (address: AddressSuggestion) => {
    const parts = []
    
    // Prioritize specific building/house information
    if (address.address.house_number && address.address.road) {
      parts.push(`${address.address.house_number} ${address.address.road}`)
    } else if (address.address.road) {
      parts.push(address.address.road)
    }
    
    // Add building name or apartment complex if available
    if (address.display_name.includes('Apartment') || address.display_name.includes('Building') || address.display_name.includes('Estate')) {
      const buildingMatch = address.display_name.match(/(.*?(?:Apartment|Building|Estate).*?),/)
      if (buildingMatch) {
        parts.unshift(buildingMatch[1])
      }
    }
    
    // Add suburb/area for better location context
    if (address.address.suburb) {
      parts.push(address.address.suburb)
    }
    
    // Add city for final context
    if (address.address.city) {
      parts.push(address.address.city)
    }
    
    return parts.length > 0 ? parts.join(', ') : address.display_name
  }

  // Get building type for better categorization
  const getBuildingType = (suggestion: AddressSuggestion) => {
    const displayName = suggestion.display_name.toLowerCase()
    const className = suggestion.class?.toLowerCase()
    const type = suggestion.type?.toLowerCase()
    
    if (className === 'shop' || type === 'mall' || type === 'supermarket') {
      return '🏪'
    } else if (className === 'building' || displayName.includes('apartment') || displayName.includes('building')) {
      return '🏢'
    } else if (type === 'house' || displayName.includes('house')) {
      return '🏠'
    } else if (className === 'amenity' || type === 'hospital' || type === 'school') {
      return '🏛️'
    } else if (displayName.includes('estate') || displayName.includes('residential')) {
      return '🏘️'
    }
    return '📍'
  }

  return (
    <div className={`relative ${className}`}>
      {/* Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true)
            }
          }}
          placeholder={placeholder}
          className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base transition-colors"
        />
        
        {/* Loading/Clear Button */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
          {isLoading && (
            <FaSpinner className="h-4 w-4 text-blue-500 animate-spin" />
          )}
          {query && !isLoading && (
            <button
              onClick={clearSearch}
              className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors"
              type="button"
            >
              <FaTimes />
            </button>
          )}
          <FaSearch className="h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-1 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.place_id}
              onClick={() => selectSuggestion(suggestion)}
              className={`px-4 py-3 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 ${
                index === selectedIndex
                  ? 'bg-blue-50 border-blue-200'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start space-x-3">
                <span className="text-lg mt-0.5 flex-shrink-0">{getBuildingType(suggestion)}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm leading-5">
                    {formatAddress(suggestion)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 truncate">
                    {suggestion.display_name}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {showSuggestions && !isLoading && query.length >= 3 && suggestions.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 px-4 py-3 text-gray-500 text-sm">
          No addresses found. Try a different search term.
        </div>
      )}

      {/* Instructions */}
      <div className="mt-2 text-xs text-gray-600">
        💡 Search for buildings, apartments, estates, shops, or specific addresses - perfect for home services!
      </div>
    </div>
  )
}