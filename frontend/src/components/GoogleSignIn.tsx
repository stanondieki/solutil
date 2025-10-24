'use client'

import { useEffect, useState, useRef } from 'react'
import { FaSpinner } from 'react-icons/fa'

interface GoogleSignInProps {
  onSuccess: (response: any) => void
  onError: (error: string) => void
  disabled?: boolean
  text?: string
}

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void
          renderButton: (element: HTMLElement, config: any) => void
          prompt: () => void
        }
      }
    }
  }
}

export default function GoogleSignIn({ onSuccess, onError, disabled = false, text = "Continue with Google" }: GoogleSignInProps) {
  const [loading, setLoading] = useState(false)
  const [googleLoaded, setGoogleLoaded] = useState(false)
  const googleButtonRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load Google Identity Services script
    const loadGoogleScript = () => {
      if (window.google) {
        setGoogleLoaded(true)
        return
      }

      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = () => {
        if (window.google) {
          setGoogleLoaded(true)
        }
      }
      document.head.appendChild(script)
    }

    loadGoogleScript()
  }, [])

  useEffect(() => {
    if (googleLoaded && window.google && googleButtonRef.current) {
      try {
        console.log('🔧 Initializing Google Sign-In with client ID:', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID)
        
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: true
        })

        // Render the actual Google button (hidden)
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          shape: 'rectangular',
          text: 'signin_with',
          logo_alignment: 'left'
        })

        console.log('✅ Google Sign-In initialized successfully')
      } catch (error) {
        console.error('❌ Failed to initialize Google Sign-In:', error)
        onError('Failed to initialize Google Sign-In')
      }
    }
  }, [googleLoaded])

  const handleGoogleResponse = async (response: any) => {
    console.log('🔐 Google response received:', response)
    
    if (!response.credential) {
      onError('No credential received from Google')
      return
    }

    setLoading(true)
    try {
      console.log('📤 Sending credential to API...')
      
      // Send the credential to our API
      const result = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: response.credential
        })
      })

      const data = await result.json()
      console.log('📥 API response:', data)

      if (result.ok && data.success) {
        onSuccess(data)
      } else {
        onError(data.message || 'Authentication failed')
      }
    } catch (error) {
      console.error('❌ Google sign-in error:', error)
      onError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleButtonClick = () => {
    if (!googleLoaded || !window.google || loading || disabled) {
      console.log('⚠️ Google Sign-In not ready:', { googleLoaded, hasGoogle: !!window.google, loading, disabled })
      return
    }

    console.log('🚀 Triggering Google Sign-In...')
    
    try {
      // Click the hidden Google button
      const googleButton = googleButtonRef.current?.querySelector('div[role="button"]') as HTMLElement
      if (googleButton) {
        console.log('🖱️ Clicking Google button...')
        googleButton.click()
      } else {
        console.log('📱 Falling back to prompt...')
        window.google.accounts.id.prompt()
      }
    } catch (error) {
      console.error('❌ Failed to trigger Google Sign-In:', error)
      onError('Failed to open Google Sign-In')
    }
  }

  return (
    <div className="relative">
      {/* Hidden Google button */}
      <div 
        ref={googleButtonRef} 
        style={{ position: 'absolute', left: '-9999px', visibility: 'hidden' }}
      />
      
      {/* Our custom button */}
      <button
        type="button"
        onClick={handleButtonClick}
        disabled={disabled || loading || !googleLoaded}
        className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <FaSpinner className="animate-spin mr-2" />
        ) : (
          <svg className="mr-2 w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )}
        {loading ? 'Signing in...' : text}
      </button>
    </div>
  )
}