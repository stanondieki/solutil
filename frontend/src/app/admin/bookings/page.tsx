'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AdminLayout from '../../../components/AdminLayout'

interface AssignedProvider {
  id: string
  name: string
  email: string
  phone?: string
  assignedAt?: string
  status?: string
}

interface Booking {
  id: string
  customer: {
    name: string
    email: string
    phone: string
  }
  provider: {
    id?: string
    name: string
    email: string
    phone: string
  }
  // Multiple providers support
  providers?: AssignedProvider[]
  providersNeeded?: number
  providersAssigned?: number
  isFullyAssigned?: boolean
  service: string
  description: string
  scheduledDate: string
  scheduledTime?: string
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled'
  amount: number
  location: string
  createdAt: string
  paymentStatus: 'pending' | 'paid' | 'refunded'
  urgency?: string
  serviceCategory?: string
}

interface AvailableProvider {
  id: string
  name: string
  email: string
  phone: string
  rating: number
  totalJobs: number
  serviceId: string | null
  serviceTitle: string
  servicePrice: number | null
  available: boolean
  alreadyAssigned?: boolean
  conflictReason: string | null
  isOtherCategory?: boolean
}

interface BookingDetailForModal {
  id: string
  bookingNumber?: string
  providersNeeded: number
  providersAssigned: number
  isFullyAssigned: boolean
  slotsRemaining: number
  assignedProviders: AssignedProvider[]
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPayment, setFilterPayment] = useState<string>('all')
  
  // Provider assignment modal state
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [bookingDetail, setBookingDetail] = useState<BookingDetailForModal | null>(null)
  const [availableProviders, setAvailableProviders] = useState<AvailableProvider[]>([])
  const [otherProviders, setOtherProviders] = useState<AvailableProvider[]>([])
  const [loadingProviders, setLoadingProviders] = useState(false)
  const [assigningProvider, setAssigningProvider] = useState(false)
  const [assignmentNotes, setAssignmentNotes] = useState('')

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      console.log('🔑 Admin token:', token ? 'Present' : 'Missing')
      
      const response = await fetch('/api/admin/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      console.log('📥 Admin bookings response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('📋 Admin bookings data:', data)
        
        const mappedBookings = (data.data?.bookings || []).map((b: any) => ({
          id: b._id,
          customer: {
            name: b.client?.name || 'Unknown Client',
            email: b.client?.email || '',
            phone: b.client?.phone || ''
          },
          provider: {
            id: b.provider?._id || null,
            name: b.provider?.name || 'Not Assigned',
            email: b.provider?.email || '',
            phone: b.provider?.phone || ''
          },
          service: b.service?.name || b.service?.title || b.serviceCategory || 'Unknown Service',
          description: b.service?.description || b.notes?.client || '',
          scheduledDate: b.scheduledDate,
          scheduledTime: b.scheduledTime?.start || '',
          status: b.status,
          amount: b.pricing?.totalAmount || 0,
          location: b.location?.address || '',
          createdAt: b.createdAt,
          paymentStatus: b.payment?.status || 'pending',
          urgency: b.urgency || 'normal',
          serviceCategory: b.serviceCategory
        }))
        
        console.log('📊 Mapped bookings:', mappedBookings)
        setBookings(mappedBookings)
      } else {
        const errorData = await response.text()
        console.error('❌ Failed to fetch bookings:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        })
        setBookings([])
      }
    } catch (error) {
      console.error('💥 Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (response.ok) {
        setBookings(bookings.map(booking => 
          booking.id === bookingId ? { ...booking, status: newStatus as any } : booking
        ))
      }
    } catch (error) {
      console.error('Error updating booking status:', error)
      setBookings(bookings.map(booking => 
        booking.id === bookingId ? { ...booking, status: newStatus as any } : booking
      ))
    }
  }

  // Open provider assignment modal
  const openAssignProviderModal = async (booking: Booking) => {
    setSelectedBooking(booking)
    setShowAssignModal(true)
    setLoadingProviders(true)
    setAssignmentNotes('')
    setBookingDetail(null)
    
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/bookings/${booking.id}/available-providers`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Available providers:', data)
        setAvailableProviders(data.data?.matchingProviders || [])
        setOtherProviders(data.data?.otherProviders || [])
        
        // Set booking detail for multi-provider support
        setBookingDetail({
          id: data.data?.booking?.id || booking.id,
          bookingNumber: data.data?.booking?.bookingNumber,
          providersNeeded: data.data?.booking?.providersNeeded || 1,
          providersAssigned: data.data?.booking?.providersAssigned || 0,
          isFullyAssigned: data.data?.booking?.isFullyAssigned || false,
          slotsRemaining: data.data?.booking?.slotsRemaining || 1,
          assignedProviders: data.data?.booking?.assignedProviders || []
        })
      } else {
        console.error('Failed to fetch available providers')
        setAvailableProviders([])
        setOtherProviders([])
      }
    } catch (error) {
      console.error('Error fetching available providers:', error)
      setAvailableProviders([])
      setOtherProviders([])
    } finally {
      setLoadingProviders(false)
    }
  }

  // Assign provider to booking
  const assignProvider = async (providerId: string, serviceId: string | null) => {
    if (!selectedBooking) return
    
    setAssigningProvider(true)
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/bookings/${selectedBooking.id}/assign-provider`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          providerId, 
          serviceId,
          notes: assignmentNotes 
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        const bookingData = data.data?.booking
        
        // Update the booking detail in modal
        setBookingDetail({
          id: bookingData.id,
          bookingNumber: bookingData.bookingNumber,
          providersNeeded: bookingData.providersNeeded || 1,
          providersAssigned: bookingData.providersAssigned || 1,
          isFullyAssigned: bookingData.isFullyAssigned || false,
          slotsRemaining: Math.max(0, (bookingData.providersNeeded || 1) - (bookingData.providersAssigned || 1)),
          assignedProviders: bookingData.providers || []
        })
        
        // Update providers list - mark this one as assigned
        setAvailableProviders(prev => prev.map(p => 
          p.id === providerId 
            ? { ...p, alreadyAssigned: true, available: false, conflictReason: 'Already assigned to this booking' }
            : p
        ))
        setOtherProviders(prev => prev.map(p => 
          p.id === providerId 
            ? { ...p, alreadyAssigned: true, available: false, conflictReason: 'Already assigned to this booking' }
            : p
        ))
        
        // Update the booking in main state
        const providerInfo = bookingData.providers?.find((p: any) => p.id === providerId)
        setBookings(bookings.map(booking => 
          booking.id === selectedBooking.id 
            ? { 
                ...booking, 
                provider: {
                  id: bookingData.providers?.[0]?.id || providerId,
                  name: bookingData.providers?.[0]?.name || providerInfo?.name || 'Assigned',
                  email: bookingData.providers?.[0]?.email || '',
                  phone: bookingData.providers?.[0]?.phone || ''
                },
                providers: bookingData.providers,
                providersNeeded: bookingData.providersNeeded,
                providersAssigned: bookingData.providersAssigned,
                isFullyAssigned: bookingData.isFullyAssigned,
                status: bookingData.status
              } 
            : booking
        ))
        
        // Show success message
        const remaining = (bookingData.providersNeeded || 1) - (bookingData.providersAssigned || 1)
        if (remaining > 0) {
          alert(`✅ Provider assigned! ${remaining} more provider(s) needed for this booking.`)
        } else {
          alert(`✅ All providers assigned! Booking is now fully staffed.`)
          setShowAssignModal(false)
        }
      } else {
        alert(`❌ Failed to assign provider: ${data.message}`)
      }
    } catch (error) {
      console.error('Error assigning provider:', error)
      alert('Failed to assign provider. Please try again.')
    } finally {
      setAssigningProvider(false)
    }
  }

  // Unassign provider from booking
  const unassignProvider = async (bookingId: string, providerId?: string) => {
    const message = providerId 
      ? 'Are you sure you want to remove this provider from the booking?'
      : 'Are you sure you want to remove all providers from this booking?'
    
    if (!confirm(message)) return
    
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/bookings/${bookingId}/unassign-provider`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          providerId,
          reason: 'Unassigned by admin' 
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        const bookingData = data.data?.booking
        
        // Update booking detail in modal if open
        if (selectedBooking?.id === bookingId) {
          setBookingDetail({
            id: bookingData.id,
            bookingNumber: bookingData.bookingNumber,
            providersNeeded: bookingData.providersNeeded || 1,
            providersAssigned: bookingData.providersAssigned || 0,
            isFullyAssigned: bookingData.isFullyAssigned || false,
            slotsRemaining: Math.max(0, (bookingData.providersNeeded || 1) - (bookingData.providersAssigned || 0)),
            assignedProviders: bookingData.providers || []
          })
          
          // Mark provider as available again
          if (providerId) {
            setAvailableProviders(prev => prev.map(p => 
              p.id === providerId 
                ? { ...p, alreadyAssigned: false, available: true, conflictReason: null }
                : p
            ))
            setOtherProviders(prev => prev.map(p => 
              p.id === providerId 
                ? { ...p, alreadyAssigned: false, available: true, conflictReason: null }
                : p
            ))
          }
        }
        
        // Update main bookings state
        setBookings(bookings.map(booking => 
          booking.id === bookingId 
            ? { 
                ...booking, 
                provider: bookingData.providers?.[0] || { name: 'Not Assigned', email: '', phone: '' },
                providers: bookingData.providers,
                providersAssigned: bookingData.providersAssigned,
                isFullyAssigned: bookingData.isFullyAssigned,
                status: bookingData.status
              } 
            : booking
        ))
        alert('Provider removed successfully')
      }
    } catch (error) {
      console.error('Error unassigning provider:', error)
      alert('Failed to unassign provider')
    }
  }

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus
    const matchesPayment = filterPayment === 'all' || booking.paymentStatus === filterPayment
    
    return matchesSearch && matchesStatus && matchesPayment
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'in-progress': return 'bg-purple-100 text-purple-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'refunded': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">🚨 Emergency</span>
      case 'urgent': return <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">⚡ Urgent</span>
      default: return null
    }
  }

  const totalRevenue = bookings
    .filter(b => b.paymentStatus === 'paid')
    .reduce((sum, b) => sum + b.amount, 0)

  const pendingAssignments = bookings.filter(b => 
    b.status === 'pending' && (!b.provider.id || b.provider.name === 'Not Assigned')
  ).length

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Booking Management</h1>
            <p className="text-gray-400 mt-1">Monitor and manage all service bookings</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{bookings.length}</p>
            <p className="text-gray-400 text-sm">Total Bookings</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {[
            { title: 'Pending', count: bookings.filter(b => b.status === 'pending').length, color: 'bg-yellow-500' },
            { title: 'Need Assignment', count: pendingAssignments, color: 'bg-red-500', highlight: pendingAssignments > 0 },
            { title: 'Confirmed', count: bookings.filter(b => b.status === 'confirmed').length, color: 'bg-blue-500' },
            { title: 'In Progress', count: bookings.filter(b => b.status === 'in-progress').length, color: 'bg-purple-500' },
            { title: 'Completed', count: bookings.filter(b => b.status === 'completed').length, color: 'bg-green-500' },
            { title: 'Revenue (KES)', count: `${(totalRevenue / 1000).toFixed(0)}K`, color: 'bg-orange-500' }
          ].map((stat) => (
            <div 
              key={stat.title} 
              className={`rounded-lg p-4 border ${
                stat.highlight 
                  ? 'bg-red-900/50 border-red-500 animate-pulse' 
                  : 'bg-gray-800 border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold text-white">{stat.count}</p>
                </div>
                <div className={`p-2 rounded-full ${stat.color}`}>
                  <div className="w-4 h-4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Alert for pending assignments */}
        {pendingAssignments > 0 && (
          <div className="bg-orange-900/50 border border-orange-500 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="text-orange-300 font-semibold">
                  {pendingAssignments} booking{pendingAssignments > 1 ? 's' : ''} need provider assignment
                </h3>
                <p className="text-orange-200 text-sm">
                  Click &quot;Assign Provider&quot; on pending bookings to assign a service provider.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Search Bookings</label>
              <input
                type="text"
                placeholder="Search by ID, customer, provider, or service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Filter by Payment</label>
              <select
                value={filterPayment}
                onChange={(e) => setFilterPayment(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Payments</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Booking ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Provider</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredBookings.map((booking, index) => (
                  <motion.tr
                    key={booking.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`hover:bg-gray-700 transition-colors ${
                      booking.status === 'pending' && (!booking.provider.id || booking.provider.name === 'Not Assigned')
                        ? 'bg-orange-900/20'
                        : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">#{booking.id.slice(-8)}</div>
                      <div className="text-xs text-gray-400">{booking.location}</div>
                      {booking.urgency && getUrgencyBadge(booking.urgency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{booking.customer.name}</div>
                      <div className="text-xs text-gray-400">{booking.customer.phone || booking.customer.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {booking.providersNeeded && booking.providersNeeded > 1 ? (
                        // Multi-provider booking
                        <>
                          <div className={`text-sm font-medium ${
                            booking.isFullyAssigned ? 'text-green-400' : 
                            (booking.providersAssigned || 0) > 0 ? 'text-yellow-400' : 'text-orange-400'
                          }`}>
                            {booking.isFullyAssigned 
                              ? `✅ ${booking.providersAssigned}/${booking.providersNeeded} Assigned`
                              : (booking.providersAssigned || 0) > 0
                                ? `⚡ ${booking.providersAssigned}/${booking.providersNeeded} Assigned`
                                : `⚠️ 0/${booking.providersNeeded} Assigned`
                            }
                          </div>
                          {booking.providers && booking.providers.length > 0 && (
                            <div className="text-xs text-gray-400">
                              {booking.providers.slice(0, 2).map(p => p.name).join(', ')}
                              {booking.providers.length > 2 && ` +${booking.providers.length - 2} more`}
                            </div>
                          )}
                        </>
                      ) : booking.provider.id && booking.provider.name !== 'Not Assigned' ? (
                        // Single provider booking - assigned
                        <>
                          <div className="text-sm font-medium text-green-400">{booking.provider.name}</div>
                          <div className="text-xs text-gray-400">{booking.provider.phone || booking.provider.email}</div>
                        </>
                      ) : (
                        // Single provider booking - not assigned
                        <div className="text-sm font-medium text-orange-400">
                          ⚠️ Not Assigned
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-white">{booking.service}</div>
                      <div className="text-xs text-gray-400 truncate max-w-[150px]">{booking.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">
                        {new Date(booking.scheduledDate).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        {booking.scheduledTime || 'Time TBD'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        KES {booking.amount.toLocaleString()}
                      </div>
                      <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getPaymentColor(booking.paymentStatus)}`}>
                        {booking.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-col space-y-1">
                        {/* Assign Provider Button - Primary action for pending bookings */}
                        {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                          <button
                            onClick={() => openAssignProviderModal(booking)}
                            className={`text-xs px-3 py-1 rounded transition-colors ${
                              !booking.provider.id || booking.provider.name === 'Not Assigned'
                                ? 'bg-orange-600 text-white hover:bg-orange-700'
                                : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                            }`}
                          >
                            {!booking.provider.id || booking.provider.name === 'Not Assigned' 
                              ? '👷 Assign Provider' 
                              : '🔄 Change Provider'}
                          </button>
                        )}
                        
                        {/* Other actions */}
                        <div className="flex space-x-2">
                          {booking.status === 'pending' && (
                            <button
                              onClick={() => handleStatusChange(booking.id, 'confirmed')}
                              className="text-green-400 hover:text-green-300 text-xs"
                            >
                              Confirm
                            </button>
                          )}
                          {booking.status === 'confirmed' && (
                            <button
                              onClick={() => handleStatusChange(booking.id, 'in-progress')}
                              className="text-purple-400 hover:text-purple-300 text-xs"
                            >
                              Start
                            </button>
                          )}
                          {booking.status === 'in-progress' && (
                            <button
                              onClick={() => handleStatusChange(booking.id, 'completed')}
                              className="text-green-400 hover:text-green-300 text-xs"
                            >
                              Complete
                            </button>
                          )}
                          {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                            <button
                              onClick={() => handleStatusChange(booking.id, 'cancelled')}
                              className="text-red-400 hover:text-red-300 text-xs"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">No bookings found matching your criteria</div>
          </div>
        )}
      </div>

      {/* Provider Assignment Modal */}
      <AnimatePresence>
        {showAssignModal && selectedBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAssignModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gray-900 px-6 py-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">
                    👷 Assign Provider{(bookingDetail?.providersNeeded || 1) > 1 ? 's' : ''} to Booking
                  </h2>
                  {bookingDetail && (
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      bookingDetail.isFullyAssigned 
                        ? 'bg-green-600 text-white' 
                        : 'bg-orange-600 text-white'
                    }`}>
                      {bookingDetail.providersAssigned}/{bookingDetail.providersNeeded} Assigned
                    </div>
                  )}
                </div>
                <p className="text-gray-400 text-sm mt-1">
                  Booking #{selectedBooking.id.slice(-8)} • {selectedBooking.service}
                </p>
                <div className="flex items-center space-x-4 mt-2 text-sm">
                  <span className="text-gray-400">
                    📅 {new Date(selectedBooking.scheduledDate).toLocaleDateString()}
                  </span>
                  <span className="text-gray-400">
                    🕐 {selectedBooking.scheduledTime || 'Time TBD'}
                  </span>
                  <span className="text-gray-400">
                    📍 {selectedBooking.location || 'Location TBD'}
                  </span>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {loadingProviders ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                    <span className="ml-3 text-gray-400">Loading available providers...</span>
                  </div>
                ) : (
                  <>
                    {/* Already Assigned Providers */}
                    {bookingDetail && bookingDetail.assignedProviders.length > 0 && (
                      <div className="mb-6 p-4 bg-green-900/30 border border-green-700 rounded-lg">
                        <h3 className="text-lg font-semibold text-green-400 mb-3 flex items-center">
                          <span className="mr-2">✅</span>
                          Assigned Providers ({bookingDetail.assignedProviders.length}/{bookingDetail.providersNeeded})
                        </h3>
                        <div className="space-y-2">
                          {bookingDetail.assignedProviders.map((provider) => (
                            <div
                              key={provider.id}
                              className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                            >
                              <div>
                                <h4 className="text-white font-medium">{provider.name}</h4>
                                <p className="text-gray-400 text-sm">{provider.email}</p>
                                <p className="text-gray-500 text-xs">
                                  Assigned: {provider.assignedAt ? new Date(provider.assignedAt).toLocaleString() : 'Unknown'}
                                </p>
                              </div>
                              <button
                                onClick={() => unassignProvider(selectedBooking.id, provider.id)}
                                className="px-3 py-1 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded text-sm"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                        {bookingDetail.slotsRemaining > 0 && (
                          <p className="text-orange-400 text-sm mt-3">
                            ⚠️ {bookingDetail.slotsRemaining} more provider{bookingDetail.slotsRemaining > 1 ? 's' : ''} needed
                          </p>
                        )}
                      </div>
                    )}

                    {/* Notes input - only show if slots remaining */}
                    {(!bookingDetail || bookingDetail.slotsRemaining > 0) && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Assignment Notes (optional)
                        </label>
                        <input
                          type="text"
                          value={assignmentNotes}
                          onChange={(e) => setAssignmentNotes(e.target.value)}
                          placeholder="Add any notes for this assignment..."
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400"
                        />
                      </div>
                    )}

                    {/* Fully Assigned Message */}
                    {bookingDetail?.isFullyAssigned && (
                      <div className="mb-6 p-4 bg-green-900/20 border border-green-700 rounded-lg text-center">
                        <p className="text-green-400 font-medium">
                          ✅ This booking is fully staffed!
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                          All {bookingDetail.providersNeeded} required provider{bookingDetail.providersNeeded > 1 ? 's have' : ' has'} been assigned.
                        </p>
                      </div>
                    )}

                    {/* Matching Providers - only show if slots remaining */}
                    {(!bookingDetail || bookingDetail.slotsRemaining > 0) && availableProviders.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                          <span className="text-green-400 mr-2">✓</span>
                          Matching Providers ({availableProviders.filter(p => p.available).length} available)
                        </h3>
                        <div className="space-y-3">
                          {availableProviders.map((provider) => (
                            <div
                              key={provider.id}
                              className={`p-4 rounded-lg border ${
                                provider.alreadyAssigned
                                  ? 'border-green-700 bg-green-900/20 opacity-70'
                                  : provider.available
                                    ? 'border-gray-600 bg-gray-700/50 hover:border-orange-500'
                                    : 'border-red-800 bg-red-900/20 opacity-60'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <h4 className="text-white font-medium">{provider.name}</h4>
                                    {provider.alreadyAssigned && (
                                      <span className="text-green-400 text-xs bg-green-900/50 px-2 py-0.5 rounded">
                                        Assigned
                                      </span>
                                    )}
                                    <span className="text-yellow-400 text-sm">⭐ {provider.rating.toFixed(1)}</span>
                                    <span className="text-gray-400 text-sm">({provider.totalJobs} jobs)</span>
                                  </div>
                                  <p className="text-gray-400 text-sm">{provider.email}</p>
                                  <p className="text-gray-500 text-xs mt-1">
                                    Service: {provider.serviceTitle}
                                    {provider.servicePrice && ` • KES ${provider.servicePrice}`}
                                  </p>
                                  {!provider.available && !provider.alreadyAssigned && (
                                    <p className="text-red-400 text-xs mt-1">
                                      ⚠️ {provider.conflictReason}
                                    </p>
                                  )}
                                </div>
                                {provider.alreadyAssigned ? (
                                  <button
                                    onClick={() => unassignProvider(selectedBooking.id, provider.id)}
                                    className="px-4 py-2 rounded-lg font-medium text-red-400 hover:bg-red-900/30"
                                  >
                                    Remove
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => assignProvider(provider.id, provider.serviceId)}
                                    disabled={!provider.available || assigningProvider}
                                    className={`px-4 py-2 rounded-lg font-medium ${
                                      provider.available
                                        ? 'bg-orange-600 text-white hover:bg-orange-700'
                                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                    }`}
                                  >
                                    {assigningProvider ? 'Assigning...' : 'Assign'}
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Other Available Providers - only show if slots remaining */}
                    {(!bookingDetail || bookingDetail.slotsRemaining > 0) && otherProviders.filter(p => p.available).length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                          <span className="text-gray-400 mr-2">○</span>
                          Other Providers ({otherProviders.filter(p => p.available).length} available)
                        </h3>
                        <p className="text-gray-500 text-sm mb-3">
                          These providers don&apos;t have a matching service category but are available.
                        </p>
                        <div className="space-y-3">
                          {otherProviders.filter(p => p.available).map((provider) => (
                            <div
                              key={provider.id}
                              className="p-4 rounded-lg border border-gray-600 bg-gray-700/30 hover:border-gray-500"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <h4 className="text-white font-medium">{provider.name}</h4>
                                    <span className="text-yellow-400 text-sm">⭐ {provider.rating.toFixed(1)}</span>
                                  </div>
                                  <p className="text-gray-400 text-sm">{provider.email}</p>
                                </div>
                                <button
                                  onClick={() => assignProvider(provider.id, null)}
                                  disabled={assigningProvider}
                                  className="px-4 py-2 rounded-lg font-medium bg-gray-600 text-white hover:bg-gray-500"
                                >
                                  {assigningProvider ? 'Assigning...' : 'Assign'}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* No providers message */}
                    {availableProviders.length === 0 && otherProviders.length === 0 && !bookingDetail?.isFullyAssigned && (
                      <div className="text-center py-8">
                        <p className="text-gray-400">No providers available at this time.</p>
                        <p className="text-gray-500 text-sm mt-2">
                          Try approving pending provider applications or wait for availability.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-900 px-6 py-4 border-t border-gray-700 flex justify-between items-center">
                {bookingDetail && bookingDetail.assignedProviders.length > 0 && (
                  <button
                    onClick={() => {
                      unassignProvider(selectedBooking.id)
                      setShowAssignModal(false)
                    }}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Remove All Providers
                  </button>
                )}
                <div className="flex-1"></div>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  )
}
