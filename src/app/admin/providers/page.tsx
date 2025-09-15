'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AdminLayout from '../../../components/AdminLayout'

interface ServiceProvider {
  id: string
  name: string
  email: string
  phone: string
  services: string[]
  rating: number
  totalJobs: number
  status: 'pending' | 'approved' | 'suspended'
  joinDate: string
  location: string
  experience: string
  verification: {
    idVerified: boolean
    phoneVerified: boolean
    emailVerified: boolean
  }
}

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<ServiceProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterService, setFilterService] = useState<string>('all')

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
        setProviders(data.providers)
      } else {
        // Mock data for demo
        setProviders([
          {
            id: '1',
            name: 'John Smith',
            email: 'john.smith@example.com',
            phone: '+254712345678',
            services: ['Plumbing', 'Electrical'],
            rating: 4.8,
            totalJobs: 45,
            status: 'approved',
            joinDate: '2024-01-15',
            location: 'Nairobi, Kenya',
            experience: '5 years',
            verification: {
              idVerified: true,
              phoneVerified: true,
              emailVerified: true
            }
          },
          {
            id: '2',
            name: 'Sarah Wilson',
            email: 'sarah.wilson@example.com',
            phone: '+254723456789',
            services: ['Cleaning', 'Laundry'],
            rating: 4.9,
            totalJobs: 67,
            status: 'approved',
            joinDate: '2024-02-10',
            location: 'Mombasa, Kenya',
            experience: '3 years',
            verification: {
              idVerified: true,
              phoneVerified: true,
              emailVerified: true
            }
          },
          {
            id: '3',
            name: 'Mike Johnson',
            email: 'mike.johnson@example.com',
            phone: '+254734567890',
            services: ['Carpentry'],
            rating: 0,
            totalJobs: 0,
            status: 'pending',
            joinDate: '2024-03-05',
            location: 'Kisumu, Kenya',
            experience: '2 years',
            verification: {
              idVerified: false,
              phoneVerified: true,
              emailVerified: true
            }
          },
          {
            id: '4',
            name: 'Emma Davis',
            email: 'emma.davis@example.com',
            phone: '+254745678901',
            services: ['Painting', 'Decoration'],
            rating: 4.2,
            totalJobs: 23,
            status: 'suspended',
            joinDate: '2024-01-20',
            location: 'Nakuru, Kenya',
            experience: '4 years',
            verification: {
              idVerified: true,
              phoneVerified: true,
              emailVerified: false
            }
          }
        ])
      }
    } catch (error) {
      console.error('Error fetching providers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (providerId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/providers/${providerId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (response.ok) {
        setProviders(providers.map(provider => 
          provider.id === providerId ? { ...provider, status: newStatus as any } : provider
        ))
      }
    } catch (error) {
      console.error('Error updating provider status:', error)
      // For demo, update locally
      setProviders(providers.map(provider => 
        provider.id === providerId ? { ...provider, status: newStatus as any } : provider
      ))
    }
  }

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.services.some(service => 
                           service.toLowerCase().includes(searchTerm.toLowerCase())
                         )
    const matchesStatus = filterStatus === 'all' || provider.status === filterStatus
    const matchesService = filterService === 'all' || 
                          provider.services.some(service => service === filterService)
    
    return matchesSearch && matchesStatus && matchesService
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getVerificationScore = (verification: any) => {
    const total = Object.keys(verification).length
    const verified = Object.values(verification).filter(Boolean).length
    return Math.round((verified / total) * 100)
  }

  const allServices = [...new Set(providers.flatMap(p => p.services))]

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
            <h1 className="text-3xl font-bold text-white">Service Provider Management</h1>
            <p className="text-gray-400 mt-1">Approve and manage service providers</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{providers.length}</p>
            <p className="text-gray-400 text-sm">Total Providers</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { title: 'Pending Approval', count: providers.filter(p => p.status === 'pending').length, color: 'bg-yellow-500' },
            { title: 'Approved', count: providers.filter(p => p.status === 'approved').length, color: 'bg-green-500' },
            { title: 'Suspended', count: providers.filter(p => p.status === 'suspended').length, color: 'bg-red-500' },
            { title: 'Total Jobs', count: providers.reduce((sum, p) => sum + p.totalJobs, 0), color: 'bg-blue-500' }
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
              <label className="block text-sm font-medium text-gray-300 mb-2">Search Providers</label>
              <input
                type="text"
                placeholder="Search by name, email, or service..."
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
                <option value="approved">Approved</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Filter by Service</label>
              <select
                value={filterService}
                onChange={(e) => setFilterService(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Services</option>
                {allServices.map(service => (
                  <option key={service} value={service}>{service}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Providers Table */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Provider</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Services</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Verification</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Jobs</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredProviders.map((provider, index) => (
                  <motion.tr
                    key={provider.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {provider.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{provider.name}</div>
                          <div className="text-sm text-gray-400">{provider.location}</div>
                          <div className="text-xs text-gray-500">{provider.experience} experience</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {provider.services.map(service => (
                          <span key={service} className="inline-flex px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                            {service}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {provider.rating > 0 ? (
                        <div className="flex items-center">
                          <span className="text-white">{provider.rating}</span>
                          <svg className="w-4 h-4 text-yellow-400 ml-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                      ) : (
                        <span className="text-gray-400">No reviews</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(provider.status)}`}>
                        {provider.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-white text-sm">{getVerificationScore(provider.verification)}%</span>
                        <div className="ml-2 w-16 bg-gray-600 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${getVerificationScore(provider.verification)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {provider.totalJobs}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {provider.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(provider.id, 'approved')}
                              className="text-green-400 hover:text-green-300 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusChange(provider.id, 'suspended')}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {provider.status === 'approved' && (
                          <button
                            onClick={() => handleStatusChange(provider.id, 'suspended')}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            Suspend
                          </button>
                        )}
                        {provider.status === 'suspended' && (
                          <button
                            onClick={() => handleStatusChange(provider.id, 'approved')}
                            className="text-green-400 hover:text-green-300 transition-colors"
                          >
                            Reactivate
                          </button>
                        )}
                        <button className="text-blue-400 hover:text-blue-300 transition-colors">
                          View Details
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredProviders.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">No providers found matching your criteria</div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
