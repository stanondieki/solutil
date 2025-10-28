/**
 * Notification utility functions for creating and managing notifications
 */

import { Notification } from '@/contexts/NotificationContext'

export interface CreateNotificationParams {
  title: string
  message: string
  type: 'booking' | 'payment' | 'service' | 'system' | 'promotion'
  actionUrl?: string
  actionText?: string
  metadata?: Record<string, any>
  targetUserId?: string
}

/**
 * Create a new notification
 */
export async function createNotification(
  params: CreateNotificationParams,
  authToken: string
): Promise<Notification | null> {
  try {
    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...params,
        authToken
      })
    })

    if (!response.ok) {
      console.error('Failed to create notification:', await response.text())
      return null
    }

    const data = await response.json()
    return data.notification
  } catch (error) {
    console.error('Error creating notification:', error)
    return null
  }
}

/**
 * Create booking-related notifications
 */
export const BookingNotifications = {
  /**
   * Booking confirmed notification
   */
  confirmed: (bookingId: string, serviceName: string, dateTime: string, authToken: string) =>
    createNotification({
      title: 'Booking Confirmed! 🎉',
      message: `Your ${serviceName} booking has been confirmed for ${dateTime}.`,
      type: 'booking',
      actionUrl: `/dashboard/bookings/${bookingId}`,
      actionText: 'View Booking',
      metadata: { bookingId, serviceName, dateTime }
    }, authToken),

  /**
   * Provider assigned notification
   */
  providerAssigned: (bookingId: string, providerName: string, serviceName: string, authToken: string) =>
    createNotification({
      title: 'Provider Assigned 👨‍🔧',
      message: `${providerName} has been assigned to your ${serviceName} booking. They will contact you soon.`,
      type: 'booking',
      actionUrl: `/dashboard/bookings/${bookingId}`,
      actionText: 'View Details',
      metadata: { bookingId, providerName, serviceName }
    }, authToken),

  /**
   * Service started notification
   */
  serviceStarted: (bookingId: string, serviceName: string, providerName: string, authToken: string) =>
    createNotification({
      title: 'Service Started 🔧',
      message: `${providerName} has started your ${serviceName} service.`,
      type: 'service',
      actionUrl: `/dashboard/bookings/${bookingId}`,
      actionText: 'Track Progress',
      metadata: { bookingId, serviceName, providerName }
    }, authToken),

  /**
   * Service completed notification
   */
  serviceCompleted: (bookingId: string, serviceName: string, providerName: string, authToken: string) =>
    createNotification({
      title: 'Service Completed ✅',
      message: `Your ${serviceName} service has been completed by ${providerName}. Please rate your experience.`,
      type: 'service',
      actionUrl: `/dashboard/bookings/${bookingId}/review`,
      actionText: 'Rate Service',
      metadata: { bookingId, serviceName, providerName }
    }, authToken),

  /**
   * Booking cancelled notification
   */
  cancelled: (bookingId: string, serviceName: string, reason: string, authToken: string) =>
    createNotification({
      title: 'Booking Cancelled ❌',
      message: `Your ${serviceName} booking has been cancelled. Reason: ${reason}`,
      type: 'booking',
      actionUrl: `/dashboard/bookings`,
      actionText: 'Book Again',
      metadata: { bookingId, serviceName, reason }
    }, authToken),

  /**
   * Reminder notification
   */
  reminder: (bookingId: string, serviceName: string, timeUntil: string, authToken: string) =>
    createNotification({
      title: 'Service Reminder ⏰',
      message: `Your ${serviceName} service is scheduled in ${timeUntil}. Please ensure someone is available.`,
      type: 'booking',
      actionUrl: `/dashboard/bookings/${bookingId}`,
      actionText: 'View Details',
      metadata: { bookingId, serviceName, timeUntil }
    }, authToken)
}

/**
 * Create payment-related notifications
 */
export const PaymentNotifications = {
  /**
   * Payment successful notification
   */
  successful: (amount: number, serviceName: string, paymentId: string, authToken: string) =>
    createNotification({
      title: 'Payment Successful 💳',
      message: `Payment of KES ${amount.toLocaleString()} for ${serviceName} has been processed successfully.`,
      type: 'payment',
      actionUrl: `/dashboard/payments/${paymentId}`,
      actionText: 'View Receipt',
      metadata: { amount, serviceName, paymentId }
    }, authToken),

  /**
   * Payment failed notification
   */
  failed: (amount: number, serviceName: string, reason: string, authToken: string) =>
    createNotification({
      title: 'Payment Failed ❌',
      message: `Payment of KES ${amount.toLocaleString()} for ${serviceName} failed. ${reason}`,
      type: 'payment',
      actionUrl: `/dashboard/payments`,
      actionText: 'Retry Payment',
      metadata: { amount, serviceName, reason }
    }, authToken),

  /**
   * Refund processed notification
   */
  refundProcessed: (amount: number, serviceName: string, refundId: string, authToken: string) =>
    createNotification({
      title: 'Refund Processed 💰',
      message: `Refund of KES ${amount.toLocaleString()} for ${serviceName} has been processed. It will reflect in your account within 3-5 business days.`,
      type: 'payment',
      actionUrl: `/dashboard/payments/${refundId}`,
      actionText: 'View Refund',
      metadata: { amount, serviceName, refundId }
    }, authToken)
}

/**
 * Create promotional notifications
 */
export const PromotionNotifications = {
  /**
   * Special offer notification
   */
  specialOffer: (discount: number, serviceName: string, validUntil: string, authToken: string) =>
    createNotification({
      title: `${discount}% OFF ${serviceName}! 🎁`,
      message: `Special offer: Get ${discount}% off your next ${serviceName} service. Valid until ${validUntil}.`,
      type: 'promotion',
      actionUrl: `/services/${serviceName.toLowerCase()}`,
      actionText: 'Book Now',
      metadata: { discount, serviceName, validUntil }
    }, authToken),

  /**
   * New service available notification
   */
  newService: (serviceName: string, description: string, authToken: string) =>
    createNotification({
      title: `New Service Available! 🚀`,
      message: `We now offer ${serviceName}! ${description}`,
      type: 'promotion',
      actionUrl: `/services/${serviceName.toLowerCase()}`,
      actionText: 'Learn More',
      metadata: { serviceName, description }
    }, authToken),

  /**
   * Loyalty reward notification
   */
  loyaltyReward: (rewardType: string, value: number, authToken: string) =>
    createNotification({
      title: 'Loyalty Reward Earned! 🏆',
      message: `Congratulations! You've earned ${rewardType} worth KES ${value} for being a loyal customer.`,
      type: 'promotion',
      actionUrl: '/dashboard/rewards',
      actionText: 'View Rewards',
      metadata: { rewardType, value }
    }, authToken)
}

/**
 * Create system notifications
 */
export const SystemNotifications = {
  /**
   * Welcome notification for new users
   */
  welcome: (userName: string, authToken: string) =>
    createNotification({
      title: `Welcome to Solutil Connect! 👋`,
      message: `Hi ${userName}! Thanks for joining us. Explore our services and book your first service today.`,
      type: 'system',
      actionUrl: '/services',
      actionText: 'Browse Services',
      metadata: { userName, type: 'welcome' }
    }, authToken),

  /**
   * Account verification notification
   */
  accountVerified: (authToken: string) =>
    createNotification({
      title: 'Account Verified ✅',
      message: 'Your account has been successfully verified. You can now access all features.',
      type: 'system',
      actionUrl: '/dashboard',
      actionText: 'Go to Dashboard',
      metadata: { type: 'verification' }
    }, authToken),

  /**
   * Profile completion reminder
   */
  completeProfile: (completionPercentage: number, authToken: string) =>
    createNotification({
      title: 'Complete Your Profile 📝',
      message: `Your profile is ${completionPercentage}% complete. Complete it to get better service recommendations.`,
      type: 'system',
      actionUrl: '/dashboard/profile',
      actionText: 'Complete Profile',
      metadata: { completionPercentage, type: 'profile_completion' }
    }, authToken),

  /**
   * Maintenance notification
   */
  maintenance: (startTime: string, endTime: string, authToken: string) =>
    createNotification({
      title: 'Scheduled Maintenance 🔧',
      message: `System maintenance is scheduled from ${startTime} to ${endTime}. Some features may be temporarily unavailable.`,
      type: 'system',
      actionUrl: '/status',
      actionText: 'Check Status',
      metadata: { startTime, endTime, type: 'maintenance' }
    }, authToken)
}

/**
 * Utility function to send notification to multiple users
 */
export async function sendBulkNotifications(
  userIds: string[],
  notificationParams: Omit<CreateNotificationParams, 'targetUserId'>,
  authToken: string
): Promise<Notification[]> {
  const notifications: Notification[] = []
  
  for (const userId of userIds) {
    const notification = await createNotification({
      ...notificationParams,
      targetUserId: userId
    }, authToken)
    
    if (notification) {
      notifications.push(notification)
    }
  }
  
  return notifications
}