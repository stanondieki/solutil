'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './AuthContext'

// TypeScript interfaces
export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'booking' | 'payment' | 'service' | 'system' | 'promotion'
  read: boolean
  actionUrl?: string
  actionText?: string
  metadata?: {
    bookingId?: string
    serviceId?: string
    providerId?: string
    amount?: number
    [key: string]: any
  }
  createdAt: string
  readAt?: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: string | null
  // Actions
  fetchNotifications: () => Promise<void>
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (notificationId: string) => Promise<void>
  clearAllNotifications: () => Promise<void>
  // Real-time updates
  addNotification: (notification: Omit<Notification, 'id' | 'userId' | 'createdAt'>) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

interface NotificationProviderProps {
  children: ReactNode
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user, token } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length

  // Fetch notifications from API
  const fetchNotifications = async () => {
    if (!user || !token) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/notifications?authToken=${token}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        // Gracefully handle 404 - backend notifications not yet implemented
        if (response.status === 404) {
          console.log('Notifications endpoint not available - using empty notifications for now')
          setNotifications([])
          setIsLoading(false)
          return
        }
        throw new Error('Failed to fetch notifications')
      }

      const data = await response.json()
      setNotifications(data.notifications || [])
    } catch (err) {
      console.error('Error fetching notifications:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications')
    } finally {
      setIsLoading(false)
    }
  }

  // Mark single notification as read
  const markAsRead = async (notificationId: string) => {
    if (!token) return

    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ authToken: token })
      })

      if (!response.ok) {
        throw new Error('Failed to mark notification as read')
      }

      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, read: true, readAt: new Date().toISOString() }
            : n
        )
      )
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!token) return

    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ authToken: token })
      })

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read')
      }

      // Update local state
      const now = new Date().toISOString()
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true, readAt: now }))
      )
    } catch (err) {
      console.error('Error marking all notifications as read:', err)
    }
  }

  // Delete single notification
  const deleteNotification = async (notificationId: string) => {
    if (!token) return

    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete notification')
      }

      // Update local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
    } catch (err) {
      console.error('Error deleting notification:', err)
    }
  }

  // Clear all notifications
  const clearAllNotifications = async () => {
    if (!token) return

    try {
      const response = await fetch('/api/notifications/clear-all', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to clear all notifications')
      }

      // Update local state
      setNotifications([])
    } catch (err) {
      console.error('Error clearing all notifications:', err)
    }
  }

  // Add notification (for real-time updates)
  const addNotification = (notificationData: Omit<Notification, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return

    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      userId: user._id,
      createdAt: new Date().toISOString(),
    }

    setNotifications(prev => [newNotification, ...prev])
  }

  // Auto-fetch notifications when user changes
  useEffect(() => {
    if (user && token) {
      fetchNotifications()
    } else {
      setNotifications([])
    }
  }, [user, token])

  // Set up periodic polling for live updates (every 30 seconds)
  useEffect(() => {
    if (!user || !token) return

    const interval = setInterval(() => {
      fetchNotifications()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [user, token])

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    addNotification,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}