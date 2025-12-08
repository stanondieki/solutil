'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AdminLayout from '../../../components/AdminLayout'
import { useToast } from '@/components/ui/Toast'

interface Payout {
  _id: string
  provider: {
    name: string
    email: string
    businessName?: string
    payoutDetails?: {
      mpesaNumber?: string
      preferredMethod?: string
    }
  }
  client?: {
    name: string
    email: string
  }
  booking?: {
    bookingId: string
    service?: {
      title: string
    }
  }
  amounts: {
    totalAmount: number
    payoutAmount: number
    commissionAmount: number
    currency: string
  }
  status: string
  createdAt: string
  timeline: {
    payoutScheduled?: string
  }
  metadata: {
    bookingReference: string
    providerName: string
    adminReason?: string
  }
}

interface PayoutStats {
  overall: {
    totalPayouts: number
    totalPayoutAmount: number
    totalCommissionEarned: number
    avgPayoutAmount: number
  }
  byStatus: Array<{
    _id: string
    count: number
    totalAmount: number
  }>
}

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [stats, setStats] = useState<PayoutStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [processingPayout, setProcessingPayout] = useState<string | null>(null)
  const { showSuccess, showError, showWarning } = useToast()

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalPayouts, setTotalPayouts] = useState(0)

  useEffect(() => {
    fetchPayouts()
    fetchStats()
  }, [currentPage, filterStatus])

  const fetchPayouts = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(filterStatus !== 'all' && { status: filterStatus })
      })
      
      const response = await fetch(`/api/admin/payouts?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setPayouts(data.data.payouts || [])
        setTotalPages(data.data.pagination?.totalPages || 1)
        setTotalPayouts(data.data.pagination?.totalPayouts || 0)
      } else {
        console.error('Failed to fetch payouts')
      }
    } catch (error) {
      console.error('Error fetching payouts:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/payout-stats?period=30d', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setStats(data.data)
      }
    } catch (error) {
      console.error('Error fetching payout stats:', error)
    }
  }

  const processPayout = async (payoutId: string, reason: string) => {
    try {
      setProcessingPayout(payoutId)
      const token = localStorage.getItem('adminToken')
      
      const response = await fetch(`/api/admin/payouts/${payoutId}/process`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      })
      
      if (response.ok) {
        showSuccess('Success', 'Payout processed successfully!')
        fetchPayouts() // Refresh the list
      } else {
        const error = await response.json()
        showError('Error', `Failed to process payout: ${error.message}`)
      }
    } catch (error) {
      console.error('Error processing payout:', error)
      showError('Error', 'Failed to process payout')
    } finally {
      setProcessingPayout(null)
    }
  }

  const cancelPayout = async (payoutId: string, reason: string) => {
    try {
      const token = localStorage.getItem('adminToken')
      
      const response = await fetch(`/api/admin/payouts/${payoutId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      })
      
      if (response.ok) {
        showSuccess('Success', 'Payout cancelled successfully!')
        fetchPayouts()
      } else {
        const error = await response.json()
        showError('Error', `Failed to cancel payout: ${error.message}`)
      }
    } catch (error) {
      console.error('Error cancelling payout:', error)
      showError('Error', 'Failed to cancel payout')
    }
  }

  const retryPayout = async (payoutId: string, reason: string) => {
    try {
      const token = localStorage.getItem('adminToken')
      
      const response = await fetch(`/api/admin/payouts/${payoutId}/retry`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      })
      
      if (response.ok) {
        showSuccess('Success', 'Payout queued for retry!')
        fetchPayouts()
      } else {
        const error = await response.json()
        showError('Error', `Failed to retry payout: ${error.message}`)
      }
    } catch (error) {
      console.error('Error retrying payout:', error)
      showError('Error', 'Failed to retry payout')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      case 'awaiting_payment': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredPayouts = payouts.filter(payout => {
    const matchesSearch = 
      payout.provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payout.provider.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payout.metadata.bookingReference.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payout Management</h1>
            <p className="text-gray-600 mt-2">Monitor and manage provider payouts</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Manual Payout
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Payouts</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.overall.totalPayouts || 0}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Paid</p>
                  <p className="text-2xl font-semibold text-gray-900">KES {(stats.overall.totalPayoutAmount || 0).toLocaleString()}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Commission Earned</p>
                  <p className="text-2xl font-semibold text-gray-900">KES {(stats.overall.totalCommissionEarned || 0).toLocaleString()}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Payout</p>
                  <p className="text-2xl font-semibold text-gray-900">KES {(stats.overall.avgPayoutAmount || 0).toLocaleString()}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search by provider name, email, or booking reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="awaiting_payment">Awaiting Payment</option>
                <option value="pending">Pending</option>
                <option value="ready">Ready</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payouts Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Payouts ({totalPayouts})</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading payouts...</p>
            </div>
          ) : filteredPayouts.length === 0 ? (
            <div className="p-8 text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-gray-500">No payouts found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking Ref</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPayouts.map((payout) => (
                    <tr key={payout._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{payout.provider.name}</div>
                          <div className="text-sm text-gray-500">{payout.provider.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payout.metadata.bookingReference}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">KES {payout.amounts.payoutAmount.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">Commission: KES {payout.amounts.commissionAmount.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payout.provider.payoutDetails?.mpesaNumber ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            M-Pesa
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Bank
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payout.status)}`}>
                          {payout.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(payout.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {(payout.status === 'pending' || payout.status === 'ready') && (
                            <button
                              onClick={() => {
                                const reason = prompt('Enter reason for manual processing:')
                                if (reason) processPayout(payout._id, reason)
                              }}
                              disabled={processingPayout === payout._id}
                              className="text-orange-600 hover:text-orange-700 disabled:opacity-50"
                            >
                              {processingPayout === payout._id ? 'Processing...' : 'Process'}
                            </button>
                          )}
                          {payout.status === 'failed' && (
                            <button
                              onClick={() => {
                                const reason = prompt('Enter reason for retry:')
                                if (reason) retryPayout(payout._id, reason)
                              }}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              Retry
                            </button>
                          )}
                          {payout.status !== 'completed' && payout.status !== 'cancelled' && (
                            <button
                              onClick={() => {
                                const reason = prompt('Enter reason for cancellation:')
                                if (reason && confirm('Are you sure you want to cancel this payout?')) {
                                  cancelPayout(payout._id, reason)
                                }
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Showing page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Payout Modal */}
      {showCreateModal && (
        <CreatePayoutModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            fetchPayouts()
          }}
        />
      )}
    </AdminLayout>
  )
}

// Create Payout Modal Component
function CreatePayoutModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    providerId: '',
    amount: '',
    reason: '',
    payoutMethod: 'mpesa',
    mpesaNumber: '',
    bankDetails: {
      accountNumber: '',
      bankCode: '001',
      accountName: ''
    },
    processImmediately: true,
    commissionRate: 0.3
  })
  const [loading, setLoading] = useState(false)
  const [providers, setProviders] = useState<any[]>([])
  const { showSuccess, showError, showWarning } = useToast()

  useEffect(() => {
    fetchProviders()
  }, [])

  const fetchProviders = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/providers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setProviders(data.providers || [])
      }
    } catch (error) {
      console.error('Error fetching providers:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.providerId || !formData.amount || !formData.reason) {
      showWarning('Validation Error', 'Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/payouts/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        showSuccess('Success', 'Manual payout created successfully!')
        onSuccess()
      } else {
        const error = await response.json()
        showError('Error', `Failed to create payout: ${error.message}`)
      }
    } catch (error) {
      console.error('Error creating payout:', error)
      showError('Error', 'Failed to create payout')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Create Manual Payout</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Provider Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Provider *</label>
              <select
                value={formData.providerId}
                onChange={(e) => setFormData({...formData, providerId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                required
              >
                <option value="">Select a provider</option>
                {providers.map((provider) => (
                  <option key={provider._id} value={provider._id}>
                    {provider.name} ({provider.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (KES) *</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                placeholder="Enter payout amount"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                placeholder="Enter reason for this manual payout"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>

            {/* Payout Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payout Method</label>
              <select
                value={formData.payoutMethod}
                onChange={(e) => setFormData({...formData, payoutMethod: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="mpesa">M-Pesa</option>
                <option value="bank">Bank Transfer</option>
              </select>
            </div>

            {/* M-Pesa Number */}
            {formData.payoutMethod === 'mpesa' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">M-Pesa Number</label>
                <input
                  type="text"
                  value={formData.mpesaNumber}
                  onChange={(e) => setFormData({...formData, mpesaNumber: e.target.value})}
                  placeholder="254712345678"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                />
                <p className="text-xs text-gray-500 mt-1">Format: 254XXXXXXXXX (no + sign)</p>
              </div>
            )}

            {/* Bank Details */}
            {formData.payoutMethod === 'bank' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                  <input
                    type="text"
                    value={formData.bankDetails.accountNumber}
                    onChange={(e) => setFormData({...formData, bankDetails: {...formData.bankDetails, accountNumber: e.target.value}})}
                    placeholder="Account number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                  <input
                    type="text"
                    value={formData.bankDetails.accountName}
                    onChange={(e) => setFormData({...formData, bankDetails: {...formData.bankDetails, accountName: e.target.value}})}
                    placeholder="Account holder name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Code</label>
                  <input
                    type="text"
                    value={formData.bankDetails.bankCode}
                    onChange={(e) => setFormData({...formData, bankDetails: {...formData.bankDetails, bankCode: e.target.value}})}
                    placeholder="001 (test bank code)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Use "001" for test mode</p>
                </div>
              </div>
            )}

            {/* Commission Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Commission Rate</label>
              <select
                value={formData.commissionRate}
                onChange={(e) => setFormData({...formData, commissionRate: parseFloat(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              >
                <option value={0.3}>30% (Standard)</option>
                <option value={0.2}>20% (Reduced)</option>
                <option value={0.1}>10% (Low)</option>
                <option value={0}>0% (No Commission)</option>
              </select>
            </div>

            {/* Process Immediately */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="processImmediately"
                checked={formData.processImmediately}
                onChange={(e) => setFormData({...formData, processImmediately: e.target.checked})}
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <label htmlFor="processImmediately" className="ml-2 text-sm text-gray-700">
                Process immediately (don't wait for 1-hour delay)
              </label>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Payout'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}