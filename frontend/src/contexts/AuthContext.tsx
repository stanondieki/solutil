'use client'

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { ProviderStatus } from '@/lib/roles'

interface User {
  _id: string
  name: string
  email: string
  userType: 'client' | 'provider' | 'admin'
  isVerified: boolean
  providerStatus?: ProviderStatus
  avatar?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  sessionExpiry: number | null
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'TOKEN_REFRESH'; payload: { token: string } }
  | { type: 'UPDATE_USER'; payload: { user: User } }
  | { type: 'SET_SESSION_EXPIRY'; payload: { expiry: number } }

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  sessionExpiry: null
}

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true
      }
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        sessionExpiry: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      }
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        sessionExpiry: null
      }
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false
      }
    case 'TOKEN_REFRESH':
      return {
        ...state,
        token: action.payload.token,
        sessionExpiry: Date.now() + (24 * 60 * 60 * 1000) // Reset expiry
      }
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload.user
      }
    case 'SET_SESSION_EXPIRY':
      return {
        ...state,
        sessionExpiry: action.payload.expiry
      }
    default:
      return state
  }
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; needsVerification?: boolean; email?: string }>
  logout: () => Promise<void>
  refreshToken: () => Promise<boolean>
  updateUser: (user: User) => void
  refreshUserData: () => Promise<boolean>
  checkSession: () => boolean
  isSessionExpired: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)
  const router = useRouter()

  // Session check interval (every 5 minutes)
  const SESSION_CHECK_INTERVAL = 5 * 60 * 1000
  // Token refresh threshold (refresh if token expires in less than 1 hour)
  const REFRESH_THRESHOLD = 60 * 60 * 1000

  useEffect(() => {
    initializeAuth()
    
    // Set up session monitoring
    const sessionInterval = setInterval(() => {
      checkAndRefreshToken()
    }, SESSION_CHECK_INTERVAL)

    return () => clearInterval(sessionInterval)
  }, [])

  const initializeAuth = async () => {
    try {
      const storedUser = localStorage.getItem('user')
      const storedToken = localStorage.getItem('authToken')
      const adminToken = localStorage.getItem('adminToken')
      const storedExpiry = localStorage.getItem('sessionExpiry')

      console.log('🔐 Auth initialization check:', {
        hasUser: !!storedUser,
        hasAuthToken: !!storedToken,
        hasAdminToken: !!adminToken,
        hasExpiry: !!storedExpiry,
        expiry: storedExpiry ? new Date(parseInt(storedExpiry)) : null
      })

      // Check for either regular user or admin token
      const token = storedToken || adminToken
      
      if (storedUser && token) {
        const user = JSON.parse(storedUser)
        const expiry = storedExpiry ? parseInt(storedExpiry) : Date.now() + (24 * 60 * 60 * 1000)

        if (Date.now() < expiry) {
          dispatch({ 
            type: 'LOGIN_SUCCESS', 
            payload: { user, token } 
          })
          dispatch({ 
            type: 'SET_SESSION_EXPIRY', 
            payload: { expiry } 
          })

          // Check if token needs refresh (only for regular auth, not admin)
          if (storedToken && expiry - Date.now() < REFRESH_THRESHOLD) {
            await refreshToken()
          }
        } else {
          // Session expired
          await logout()
        }
      } else if (adminToken) {
        // Admin token exists but no stored user - try to get admin user info
        try {
          const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net';
          const response = await fetch(`${backendUrl}/api/auth/me`, {
            headers: {
              Authorization: `Bearer ${adminToken}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            const user = data.user;
            localStorage.setItem('user', JSON.stringify(user));
            dispatch({ 
              type: 'LOGIN_SUCCESS', 
              payload: { user, token: adminToken } 
            });
            dispatch({ 
              type: 'SET_SESSION_EXPIRY', 
              payload: { expiry: Date.now() + (24 * 60 * 60 * 1000) } 
            });
          } else {
            // Invalid admin token
            localStorage.removeItem('adminToken');
            dispatch({ type: 'LOGIN_FAILURE' });
          }
        } catch (error) {
          console.error('Admin auth verification error:', error);
          localStorage.removeItem('adminToken');
          dispatch({ type: 'LOGIN_FAILURE' });
        }
      } else {
        dispatch({ type: 'LOGIN_FAILURE' })
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
      dispatch({ type: 'LOGIN_FAILURE' })
    }
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; needsVerification?: boolean; email?: string }> => {
    dispatch({ type: 'LOGIN_START' })

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok && data.status === 'success') {
        const user = data.data.user
        const token = data.token || data.data?.token || data.accessToken || data.data?.accessToken

        if (token) {
          // Store in localStorage
          localStorage.setItem('user', JSON.stringify(user))
          localStorage.setItem('authToken', token)
          localStorage.setItem('sessionExpiry', (Date.now() + (24 * 60 * 60 * 1000)).toString())

          dispatch({ 
            type: 'LOGIN_SUCCESS', 
            payload: { user, token } 
          })
          return { success: true }
        }
      }

      // Check for specific error types
      if (data.error === 'EMAIL_NOT_VERIFIED') {
        dispatch({ type: 'LOGIN_FAILURE' })
        return { 
          success: false, 
          error: data.message || 'Please verify your email address before logging in.',
          needsVerification: true,
          email: data.data?.email || email
        }
      }

      dispatch({ type: 'LOGIN_FAILURE' })
      return { 
        success: false, 
        error: data.message || 'Invalid email or password' 
      }
    } catch (error) {
      console.error('Login error:', error)
      dispatch({ type: 'LOGIN_FAILURE' })
      return { 
        success: false, 
        error: 'Login failed. Please check your connection and try again.' 
      }
    }
  }

  const logout = async (): Promise<void> => {
    console.log('🚪 Initiating forceful logout...')
    
    try {
      // Attempt to call backend logout endpoint (don't wait too long)
      if (state.token) {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 2000) // 2 second timeout
        
        try {
          await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${state.token}`,
              'Content-Type': 'application/json'
            },
            signal: controller.signal
          })
          clearTimeout(timeoutId)
          console.log('✅ Backend logout successful')
        } catch (fetchError) {
          clearTimeout(timeoutId)
          console.warn('⚠️ Backend logout failed, proceeding with local logout:', (fetchError as any)?.message || 'Unknown error')
        }
      }
    } catch (error) {
      console.warn('⚠️ Logout process error, forcing local cleanup:', error)
    }
    
    // FORCE CLEAR EVERYTHING - no matter what happened above
    console.log('🧹 Clearing all local data...')
    
    // Clear all possible localStorage keys
    localStorage.removeItem('user')
    localStorage.removeItem('authToken')
    localStorage.removeItem('adminToken')
    localStorage.removeItem('sessionExpiry')
    localStorage.removeItem('token')
    localStorage.removeItem('accessToken')
    
    // Clear sessionStorage too
    sessionStorage.clear()
    
    // Clear state
    dispatch({ type: 'LOGOUT' })
    
    console.log('🚀 Forcing redirect to login...')
    
    // FORCE redirect - no delays, no router.push()
    window.location.replace('/auth/login')
  }

  const refreshToken = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Include cookies for refresh token
      })

      if (response.ok) {
        const data = await response.json()
        const newToken = data.token || data.data?.token

        if (newToken) {
          localStorage.setItem('authToken', newToken)
          localStorage.setItem('sessionExpiry', (Date.now() + (24 * 60 * 60 * 1000)).toString())
          
          dispatch({ 
            type: 'TOKEN_REFRESH', 
            payload: { token: newToken } 
          })
          return true
        }
      }

      // If refresh fails, logout user
      await logout()
      return false
    } catch (error) {
      console.error('Token refresh error:', error)
      await logout()
      return false
    }
  }

  const checkAndRefreshToken = async () => {
    if (!state.isAuthenticated || !state.sessionExpiry) return

    const timeUntilExpiry = state.sessionExpiry - Date.now()
    
    if (timeUntilExpiry <= 0) {
      // Session expired
      await logout()
    } else if (timeUntilExpiry <= REFRESH_THRESHOLD) {
      // Token needs refresh
      await refreshToken()
    }
  }

  const updateUser = (user: User) => {
    localStorage.setItem('user', JSON.stringify(user))
    dispatch({ type: 'UPDATE_USER', payload: { user } })
  }

  const refreshUserData = async (): Promise<boolean> => {
    try {
      if (!state.token) {
        console.warn('🔐 No auth token available for refreshing user data')
        return false
      }

      console.log('🔄 Attempting to refresh user data with token:', state.token?.substring(0, 20) + '...')

      const response = await fetch('/api/users/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${state.token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('🔄 User profile API response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })

      if (response.ok) {
        const data = await response.json()
        console.log('🔄 User profile response data:', data)
        
        if (data.status === 'success' && data.data?.user) {
          const freshUser = data.data.user
          localStorage.setItem('user', JSON.stringify(freshUser))
          dispatch({ type: 'UPDATE_USER', payload: { user: freshUser } })
          console.log('✅ User data refreshed successfully')
          return true
        }
      }

      if (response.status === 401) {
        console.warn('🔐 Token is invalid or expired, logging out...')
        await logout()
        return false
      }

      console.warn('❌ Failed to refresh user data:', response.status)
      return false
    } catch (error) {
      console.error('❌ Error refreshing user data:', error)
      return false
    }
  }

  const checkSession = (): boolean => {
    if (!state.isAuthenticated || !state.sessionExpiry) return false
    return Date.now() < state.sessionExpiry
  }

  const isSessionExpired = (): boolean => {
    if (!state.sessionExpiry) return true
    return Date.now() >= state.sessionExpiry
  }

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    refreshToken,
    updateUser,
    refreshUserData,
    checkSession,
    isSessionExpired
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}
