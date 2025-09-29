'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  FaCookieBite, 
  FaShieldAlt, 
  FaCheck, 
  FaTimes, 
  FaInfoCircle,
  FaLock,
  FaFileContract,
  FaCogs
} from 'react-icons/fa'

interface LegalNoticePopupProps {
  isOpen: boolean
  onAccept: () => void
  onDecline: () => void
}

export default function LegalNoticePopup({ isOpen, onAccept, onDecline }: LegalNoticePopupProps) {
  const [cookieSettings, setCookieSettings] = useState({
    essential: true, // Always required
    analytics: false,
    marketing: false,
    preferences: false
  })

  const [showAdvanced, setShowAdvanced] = useState(false)

  if (!isOpen) return null

  const handleAcceptAll = () => {
    setCookieSettings({
      essential: true,
      analytics: true,
      marketing: true,
      preferences: true
    })
    // Store cookie preferences
    localStorage.setItem('solutil_cookie_consent', JSON.stringify({
      accepted: true,
      settings: { ...cookieSettings, analytics: true, marketing: true, preferences: true },
      timestamp: new Date().toISOString()
    }))
    onAccept()
  }

  const handleAcceptSelected = () => {
    // Store cookie preferences
    localStorage.setItem('solutil_cookie_consent', JSON.stringify({
      accepted: true,
      settings: cookieSettings,
      timestamp: new Date().toISOString()
    }))
    onAccept()
  }

  const handleDecline = () => {
    // Store minimal consent (essential only)
    localStorage.setItem('solutil_cookie_consent', JSON.stringify({
      accepted: false,
      settings: { essential: true, analytics: false, marketing: false, preferences: false },
      timestamp: new Date().toISOString()
    }))
    onDecline()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity"></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full transform transition-all">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <FaShieldAlt className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Welcome to Solutil!</h2>
                <p className="text-blue-100">Your privacy and data protection matter to us</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            
            {/* Main Message */}
            <div className="text-gray-700">
              <p className="text-lg mb-4">
                Before you continue, please review and accept our data practices to ensure the best experience.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-3">
                  <FaInfoCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 mb-1">
                      By using Solutil, you agree to our data practices including:
                    </p>
                    <ul className="list-disc ml-4 space-y-1 text-blue-800">
                      <li>Essential cookies for platform functionality</li>
                      <li>Processing of service booking information</li>
                      <li>Communication for service delivery</li>
                      <li>Security measures to protect your data</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Legal Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/terms"
                target="_blank"
                className="flex items-center space-x-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border"
              >
                <FaFileContract className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Terms & Conditions</p>
                  <p className="text-sm text-gray-600">Service agreements & policies</p>
                </div>
              </Link>
              
              <Link
                href="/privacy"
                target="_blank"
                className="flex items-center space-x-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border"
              >
                <FaLock className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Privacy Policy</p>
                  <p className="text-sm text-gray-600">How we protect your data</p>
                </div>
              </Link>
            </div>

            {/* Cookie Settings */}
            <div className="border-t pt-6">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900 mb-4"
              >
                <FaCogs className="h-4 w-4" />
                <span>Cookie Preferences</span>
                <span className={`transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>

              {showAdvanced && (
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                  {[
                    {
                      key: 'essential',
                      title: 'Essential Cookies',
                      description: 'Required for basic site functionality',
                      required: true
                    },
                    {
                      key: 'analytics',
                      title: 'Analytics Cookies',
                      description: 'Help us understand how you use our site',
                      required: false
                    },
                    {
                      key: 'marketing',
                      title: 'Marketing Cookies',
                      description: 'Used to show relevant advertisements',
                      required: false
                    },
                    {
                      key: 'preferences',
                      title: 'Preference Cookies',
                      description: 'Remember your settings and preferences',
                      required: false
                    }
                  ].map((cookie) => (
                    <div key={cookie.key} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{cookie.title}</p>
                        <p className="text-sm text-gray-600">{cookie.description}</p>
                      </div>
                      <div className="ml-4">
                        {cookie.required ? (
                          <div className="bg-gray-300 rounded-full px-3 py-1 text-xs font-medium text-gray-700">
                            Required
                          </div>
                        ) : (
                          <button
                            onClick={() => setCookieSettings(prev => ({
                              ...prev,
                              [cookie.key]: !prev[cookie.key as keyof typeof prev]
                            }))}
                            className={`w-12 h-6 rounded-full transition-colors ${
                              cookieSettings[cookie.key as keyof typeof cookieSettings]
                                ? 'bg-blue-600'
                                : 'bg-gray-300'
                            }`}
                          >
                            <div
                              className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                                cookieSettings[cookie.key as keyof typeof cookieSettings]
                                  ? 'translate-x-6'
                                  : 'translate-x-0.5'
                              }`}
                            />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-gray-50 px-6 py-4 rounded-b-2xl">
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={handleDecline}
                className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <FaTimes className="inline mr-2 h-4 w-4" />
                Decline Optional Cookies
              </button>
              
              {showAdvanced && (
                <button
                  onClick={handleAcceptSelected}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <FaCheck className="inline mr-2 h-4 w-4" />
                  Accept Selected
                </button>
              )}
              
              <button
                onClick={handleAcceptAll}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all font-medium shadow-lg"
              >
                <FaCheck className="inline mr-2 h-4 w-4" />
                Accept All & Continue
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-3 text-center">
              You can change your preferences anytime in your account settings
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}