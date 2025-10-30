'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AdminLayout from '../../../components/AdminLayout'

interface Booking {
  id: string
  customer: {
    name: string
    email: string
    phone: string
  }
  provider: {
    name: string
    email: string
    phone: string
  }
  service: string
  description: string
  scheduledDate: string
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled'
  amount: number
  location: string
  createdAt: string
  paymentStatus: 'pending' | 'paid' | 'refunded'
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPayment, setFilterPayment] = useState<string>('all')

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      console.log('🔑 Admin token:', token ? 'Present' : 'Missing')
      
      // Use frontend API route which forwards to backend
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
        
        // Map backend booking data to frontend format
        const mappedBookings = (data.data?.bookings || []).map((b: any) => ({
          id: b._id,
          customer: {
            name: b.client?.name || 'Unknown Client',
            email: b.client?.email || '',
            phone: b.client?.phone || ''
          },
          provider: {
            name: b.provider?.name || 'Unknown Provider',
            email: b.provider?.email || '',
            phone: b.provider?.phone || ''
          },
          service: b.service?.name || b.service?.title || 'Unknown Service',
          description: b.service?.description || '',
          scheduledDate: b.scheduledDate,
          status: b.status,
          amount: b.pricing?.totalAmount || 0,
          location: b.location?.address || '',
          createdAt: b.createdAt,
          paymentStatus: b.payment?.status || 'pending'
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
      // For demo, update locally
      setBookings(bookings.map(booking => 
        booking.id === bookingId ? { ...booking, status: newStatus as any } : booking
      ))
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

  const totalRevenue = bookings
    .filter(b => b.paymentStatus === 'paid')
    .reduce((sum, b) => sum + b.amount, 0)

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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { title: 'Pending', count: bookings.filter(b => b.status === 'pending').length, color: 'bg-yellow-500' },
            { title: 'Confirmed', count: bookings.filter(b => b.status === 'confirmed').length, color: 'bg-blue-500' },
            { title: 'In Progress', count: bookings.filter(b => b.status === 'in-progress').length, color: 'bg-purple-500' },
            { title: 'Completed', count: bookings.filter(b => b.status === 'completed').length, color: 'bg-green-500' },
            { title: 'Revenue (KES)', count: `${(totalRevenue / 1000).toFixed(0)}K`, color: 'bg-orange-500' }
          ].map((stat, index) => (
            <div key={stat.title} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Payment</th>
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
                    className="hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">#{booking.id}</div>
                      <div className="text-xs text-gray-400">{booking.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{booking.customer.name}</div>
                      <div className="text-xs text-gray-400">{booking.customer.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{booking.provider.name}</div>
                      <div className="text-xs text-gray-400">{booking.provider.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-white">{booking.service}</div>
                      <div className="text-xs text-gray-400">{booking.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">
                        {new Date(booking.scheduledDate).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(booking.scheduledDate).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        KES {booking.amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentColor(booking.paymentStatus)}`}>
                        {booking.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-400 hover:text-blue-300 transition-colors">
                          View
                        </button>
                        {booking.status === 'pending' && (
                          <button
                            onClick={() => handleStatusChange(booking.id, 'confirmed')}
                            className="text-green-400 hover:text-green-300 transition-colors"
                          >
                            Confirm
                          </button>
                        )}
                        {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                          <button
                            onClick={() => handleStatusChange(booking.id, 'cancelled')}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            Cancel
                          </button>
                        )}
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
    </AdminLayout>
  )
}
