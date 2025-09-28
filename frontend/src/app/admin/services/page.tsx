'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'

interface Service {
  _id: string
  name: string
  description: string
  category: string
  basePrice: number
  currency: string
  isActive: boolean
  bookingCount: number
  rating: {
    average: number
    count: number
  }
  createdAt: string
}

interface Stats {
  totalServices: number
  activeServices: number
  averagePrice: number
  totalBookings: number
}

interface ServiceData {
  services: Service[]
  stats: Stats
  pagination: {
    page: number
    pages: number
    total: number
    limit: number
  }
}

export default function AdminServicesPage() {
  const [data, setData] = useState<ServiceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    basePrice: '',
    currency: 'KES',
    duration: '',
    priceType: 'fixed',
    isActive: true
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  const fetchServices = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const adminToken = localStorage.getItem('adminToken')
      console.log('Admin token found:', !!adminToken)
      console.log('Admin token value:', adminToken ? `${adminToken.substring(0, 20)}...` : 'null')
      
      const response = await fetch('/api/admin/services', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken && { 'Authorization': `Bearer ${adminToken}` })
        }
      })

      console.log('API response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorData}`)
      }

      const result = await response.json()
      console.log('Services data received:', result)
      
      // Transform the API response to match the expected format
      const transformedData = {
        services: result.data?.services || [],
        stats: result.stats || {},
        pagination: result.pagination || {}
      }
      console.log('Transformed data:', transformedData)
      setData(transformedData)
      
    } catch (err) {
      console.error('Failed to fetch services:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch services')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow border">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Services</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={fetchServices}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Services Management</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700" onClick={() => setShowModal(true)}>
            Add Service
          </button>
        </div>

        {/* Modal for Add Service */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative overflow-y-auto max-h-[90vh]">
              <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setShowModal(false)}>&times;</button>
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Add New Service</h2>
              <form onSubmit={async e => {
                e.preventDefault()
                setFormError(null)
                setFormLoading(true)
                try {
                  const adminToken = localStorage.getItem('adminToken')
                  const res = await fetch('/api/admin/services', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      ...(adminToken && { 'Authorization': `Bearer ${adminToken}` })
                    },
                    body: JSON.stringify({
                      name: form.name,
                      description: form.description,
                      category: form.category,
                      basePrice: parseFloat(form.basePrice),
                      currency: form.currency,
                      duration: { estimated: parseInt(form.duration) },
                      priceType: form.priceType,
                      isActive: form.isActive
                    })
                  })
                  if (!res.ok) {
                    const err = await res.text()
                    throw new Error(err)
                  }
                  setShowModal(false)
                  setForm({ name: '', description: '', category: '', basePrice: '', currency: 'KES', duration: '', priceType: 'fixed', isActive: true })
                  fetchServices()
                } catch (err) {
                  setFormError(err instanceof Error ? err.message : 'Failed to create service')
                } finally {
                  setFormLoading(false)
                }
              }}>
                <div className="mb-3">
                  <label className="block text-base font-semibold mb-2 text-gray-800">Name</label>
                  <input type="text" className="w-full border rounded px-3 py-2 text-lg text-gray-900 bg-gray-50" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="mb-3">
                  <label className="block text-base font-semibold mb-2 text-gray-800">Description</label>
                  <textarea className="w-full border rounded px-3 py-2 text-lg text-gray-900 bg-gray-50" required value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="mb-3">
                  <label className="block text-base font-semibold mb-2 text-gray-800">Category</label>
                  <select className="w-full border rounded px-3 py-2 text-lg text-gray-900 bg-gray-50" required value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    <option value="">Select category</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="carpentry">Carpentry</option>
                    <option value="painting">Painting</option>
                    <option value="gardening">Gardening</option>
                    <option value="appliance-repair">Appliance Repair</option>
                    <option value="hvac">HVAC</option>
                    <option value="roofing">Roofing</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="block text-base font-semibold mb-2 text-gray-800">Base Price</label>
                  <input type="number" className="w-full border rounded px-3 py-2 text-lg text-gray-900 bg-gray-50" required min="0" value={form.basePrice} onChange={e => setForm(f => ({ ...f, basePrice: e.target.value }))} />
                </div>
                <div className="mb-3">
                  <label className="block text-base font-semibold mb-2 text-gray-800">Currency</label>
                  <input type="text" className="w-full border rounded px-3 py-2 text-lg text-gray-900 bg-gray-50" required value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} />
                </div>
                <div className="mb-3">
                  <label className="block text-base font-semibold mb-2 text-gray-800">Estimated Duration (minutes)</label>
                  <input type="number" className="w-full border rounded px-3 py-2 text-lg text-gray-900 bg-gray-50" required min="1" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} />
                </div>
                <div className="mb-3">
                  <label className="block text-base font-semibold mb-2 text-gray-800">Price Type</label>
                  <select className="w-full border rounded px-3 py-2 text-lg text-gray-900 bg-gray-50" required value={form.priceType} onChange={e => setForm(f => ({ ...f, priceType: e.target.value }))}>
                    <option value="fixed">Fixed</option>
                    <option value="hourly">Hourly</option>
                    <option value="per-unit">Per Unit</option>
                  </select>
                </div>
                <div className="mb-3 flex items-center">
                  <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
                  <label htmlFor="isActive" className="ml-2 text-base font-semibold text-gray-800">Active</label>
                </div>
                {formError && <div className="text-red-600 mb-2">{formError}</div>}
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" disabled={formLoading}>
                  {formLoading ? 'Creating...' : 'Create Service'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {data?.stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-sm font-medium text-gray-500">Total Services</h3>
              <p className="text-2xl font-bold text-gray-900">{data.stats.totalServices}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-sm font-medium text-gray-500">Active Services</h3>
              <p className="text-2xl font-bold text-green-600">{data.stats.activeServices}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-sm font-medium text-gray-500">Average Price</h3>
              <p className="text-2xl font-bold text-blue-600">KES {data.stats.averagePrice}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-sm font-medium text-gray-500">Total Bookings</h3>
              <p className="text-2xl font-bold text-purple-600">{data.stats.totalBookings}</p>
            </div>
          </div>
        )}

        {/* Services Table */}
        <div className="bg-white rounded-lg shadow border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All Services</h2>
          </div>
          
          {data?.services && data.services.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bookings
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.services.map((service) => (
                    <tr key={service._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{service.name}</div>
                          <div className="text-sm text-gray-500">{service.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full capitalize">
                          {service.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {service.currency} {service.basePrice}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          service.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {service.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {service.bookingCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {service.rating.average > 0 ? (
                          <div>
                            <div className="flex items-center">
                              <span className="text-yellow-400">★</span>
                              <span className="ml-1">{service.rating.average}</span>
                            </div>
                            <div className="text-xs text-gray-500">({service.rating.count} reviews)</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">No ratings</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">Edit</button>
                        <button className="text-red-600 hover:text-red-900">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500">No services found</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
