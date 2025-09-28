'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import RoleGuard from '@/components/RoleGuard'
import { providerServicesAPI, handleAPIError, getSuccessMessage } from '@/lib/providerAPI'
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaToggleOn,
  FaToggleOff,
  FaStar,
  FaCalendarAlt,
  FaDollarSign,
  FaMapMarkerAlt,
  FaClock,
  FaImage,
  FaSearch,
  FaFilter,
  FaSort,
  FaChartLine,
  FaUsers,
  FaTools,
  FaBolt,
  FaHome,
  FaCar,
  FaPaintBrush,
  FaWrench,
  FaHammer,
  FaBroom,
  FaLightbulb,
  FaShieldAlt,
  FaArrowLeft,
  FaCheck,
  FaTimes
} from 'react-icons/fa'
import CloudinaryUpload from '@/components/CloudinaryUpload'

// TypeScript interfaces
interface Service {
  _id: string
  title: string
  description: string
  category: string
  price: number
  priceType: 'fixed' | 'hourly' | 'quote'
  duration: number
  images: string[]
  isActive: boolean
  serviceArea: string[]
  rating: number
  totalBookings: number
  totalRevenue: number
  availableHours: {
    start: string
    end: string
  }
  tags: string[]
  createdAt: string
  updatedAt: string
}

interface ServiceStats {
  totalServices: number
  activeServices: number
  totalBookings: number
  totalRevenue: number
  averageRating: number
}

const serviceCategories = [
  { id: 'plumbing', name: 'Plumbing', icon: FaWrench, color: 'bg-blue-500' },
  { id: 'electrical', name: 'Electrical', icon: FaBolt, color: 'bg-yellow-500' },
  { id: 'cleaning', name: 'Cleaning', icon: FaBroom, color: 'bg-green-500' },
  { id: 'handyman', name: 'Handyman', icon: FaHammer, color: 'bg-orange-500' },
  { id: 'painting', name: 'Painting', icon: FaPaintBrush, color: 'bg-purple-500' },
  { id: 'gardening', name: 'Gardening', icon: FaHome, color: 'bg-emerald-500' },
  { id: 'automotive', name: 'Automotive', icon: FaCar, color: 'bg-red-500' },
  { id: 'security', name: 'Security', icon: FaShieldAlt, color: 'bg-gray-600' },
]

const MyServicesPage: React.FC = () => {
  const { user } = useAuth()
  const [services, setServices] = useState<Service[]>([])
  const [stats, setStats] = useState<ServiceStats>({
    totalServices: 0,
    activeServices: 0,
    totalBookings: 0,
    totalRevenue: 0,
    averageRating: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [sortBy, setSortBy] = useState('createdAt')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Mock data for development - replace with API calls
  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    setLoading(true)
    try {
      const response = await providerServicesAPI.getServices()
      
      if (response.status === 'success') {
        setServices(response.data.services)
        setStats(response.data.stats)
      } else {
        throw new Error('Failed to load services')
      }
      
    } catch (error) {
      console.error('Error loading services:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && service.isActive) ||
                         (statusFilter === 'inactive' && !service.isActive)
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const sortedServices = [...filteredServices].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title)
      case 'rating':
        return b.rating - a.rating
      case 'bookings':
        return b.totalBookings - a.totalBookings
      case 'revenue':
        return b.totalRevenue - a.totalRevenue
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  const toggleServiceStatus = async (serviceId: string) => {
    try {
      const response = await providerServicesAPI.toggleService(serviceId)
      
      if (response.status === 'success') {
        setServices(prev => prev.map(service => 
          service._id === serviceId 
            ? response.data.service
            : service
        ))
        alert(getSuccessMessage('toggle', 'Service'))
      } else {
        throw new Error('Failed to toggle service status')
      }
    } catch (error) {
      console.error('Error toggling service status:', error)
      alert(handleAPIError(error))
    }
  }

  const deleteService = async (serviceId: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        const response = await providerServicesAPI.deleteService(serviceId)
        
        if (response.status === 'success') {
          setServices(prev => prev.filter(service => service._id !== serviceId))
          alert(getSuccessMessage('delete', 'Service'))
          // Reload to refresh stats
          loadServices()
        } else {
          throw new Error('Failed to delete service')
        }
      } catch (error) {
        console.error('Error deleting service:', error)
        alert(handleAPIError(error))
      }
    }
  }

  const getCategoryInfo = (categoryId: string) => {
    return serviceCategories.find(cat => cat.id === categoryId) || serviceCategories[0]
  }

  const formatPrice = (service: Service) => {
    switch (service.priceType) {
      case 'fixed':
        return `KSh ${service.price.toLocaleString()}`
      case 'hourly':
        return `KSh ${service.price}/hr`
      case 'quote':
        return 'Custom Quote'
      default:
        return 'Price on Request'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your services...</p>
        </div>
      </div>
    )
  }

  return (
    <RoleGuard requiredRole='provider'>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <Link 
                  href="/dashboard"
                  className="p-2 text-gray-500 hover:text-orange-600 transition-colors"
                >
                  <FaArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">My Services</h1>
                  <p className="text-gray-600 mt-1">Manage your service offerings</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-orange-600 text-white px-6 py-3 rounded-xl hover:bg-orange-700 font-medium transition-colors flex items-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <FaPlus className="h-5 w-5" />
                <span>Add Service</span>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <FaTools className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Services</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalServices}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <FaCheck className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeServices}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FaCalendarAlt className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center">
                <div className="p-3 bg-emerald-100 rounded-lg">
                  <FaDollarSign className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">KSh {stats.totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <FaStar className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="all">All Categories</option>
                  {serviceCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex items-center space-x-4">
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="createdAt">Newest First</option>
                  <option value="title">Name A-Z</option>
                  <option value="rating">Highest Rated</option>
                  <option value="bookings">Most Booked</option>
                  <option value="revenue">Highest Revenue</option>
                </select>

                {/* View Mode */}
                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-4 py-3 ${viewMode === 'grid' ? 'bg-orange-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-3 ${viewMode === 'list' ? 'bg-orange-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}
                  >
                    List
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Services Grid/List */}
          {sortedServices.length === 0 ? (
            <div className="text-center py-12">
              <FaTools className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No services found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || selectedCategory !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Get started by adding your first service'
                }
              </p>
              {!searchQuery && selectedCategory === 'all' && statusFilter === 'all' && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-orange-600 text-white px-6 py-3 rounded-xl hover:bg-orange-700 font-medium transition-colors"
                >
                  Add Your First Service
                </button>
              )}
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
            }>
              {sortedServices.map((service, index) => (
                <ServiceCard
                  key={service._id}
                  service={service}
                  viewMode={viewMode}
                  index={index}
                  onToggleStatus={() => toggleServiceStatus(service._id)}
                  onEdit={() => setEditingService(service)}
                  onDelete={() => deleteService(service._id)}
                  getCategoryInfo={getCategoryInfo}
                  formatPrice={formatPrice}
                />
              ))}
            </div>
          )}
        </div>

        {/* Add/Edit Service Modal */}
        <AnimatePresence>
          {(showAddModal || editingService) && (
            <ServiceModal
              service={editingService}
              isOpen={showAddModal || !!editingService}
              onClose={() => {
                setShowAddModal(false)
                setEditingService(null)
              }}
              onSave={(service) => {
                if (editingService) {
                  setServices(prev => prev.map(s => s._id === service._id ? service : s))
                } else {
                  setServices(prev => [...prev, { ...service, _id: Date.now().toString() }])
                }
                setShowAddModal(false)
                setEditingService(null)
                loadServices() // Refresh stats
              }}
              serviceCategories={serviceCategories}
            />
          )}
        </AnimatePresence>
      </div>
    </RoleGuard>
  )
}

// Service Card Component
interface ServiceCardProps {
  service: Service
  viewMode: 'grid' | 'list'
  index: number
  onToggleStatus: () => void
  onEdit: () => void
  onDelete: () => void
  getCategoryInfo: (categoryId: string) => any
  formatPrice: (service: Service) => string
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  viewMode,
  index,
  onToggleStatus,
  onEdit,
  onDelete,
  getCategoryInfo,
  formatPrice
}) => {
  const categoryInfo = getCategoryInfo(service.category)
  const CategoryIcon = categoryInfo.icon

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            {/* Service Image */}
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
              {service.images.length > 0 ? (
                <Image
                  src={service.images[0]}
                  alt={service.title}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <CategoryIcon className="h-8 w-8 text-gray-400" />
              )}
            </div>

            {/* Service Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-lg text-gray-900">{service.title}</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryInfo.color} text-white`}>
                  {categoryInfo.name}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-2 line-clamp-2">{service.description}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center space-x-1">
                  <FaStar className="h-4 w-4 text-yellow-500" />
                  <span>{service.rating}</span>
                </span>
                <span>{service.totalBookings} bookings</span>
                <span className="font-semibold text-green-600">{formatPrice(service)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={onToggleStatus}
              className={`p-2 rounded-lg transition-colors ${
                service.isActive 
                  ? 'text-green-600 hover:bg-green-50' 
                  : 'text-gray-400 hover:bg-gray-50'
              }`}
              title={service.isActive ? 'Deactivate service' : 'Activate service'}
            >
              {service.isActive ? <FaToggleOn className="h-5 w-5" /> : <FaToggleOff className="h-5 w-5" />}
            </button>
            <button
              onClick={onEdit}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit service"
            >
              <FaEdit className="h-5 w-5" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete service"
            >
              <FaTrash className="h-5 w-5" />
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
    >
      {/* Service Image */}
      <div className="h-48 bg-gray-100 relative">
        {service.images.length > 0 ? (
          <Image
            src={service.images[0]}
            alt={service.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <CategoryIcon className="h-16 w-16 text-gray-300" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            service.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {service.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryInfo.color} text-white`}>
            {categoryInfo.name}
          </span>
        </div>

        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
          <button
            onClick={onEdit}
            className="p-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            title="Edit service"
          >
            <FaEdit className="h-5 w-5" />
          </button>
          <button
            onClick={onToggleStatus}
            className={`p-2 bg-white rounded-lg transition-colors ${
              service.isActive 
                ? 'text-red-600 hover:bg-red-50' 
                : 'text-green-600 hover:bg-green-50'
            }`}
            title={service.isActive ? 'Deactivate' : 'Activate'}
          >
            {service.isActive ? <FaTimes className="h-5 w-5" /> : <FaCheck className="h-5 w-5" />}
          </button>
          <button
            onClick={onDelete}
            className="p-2 bg-white text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            title="Delete service"
          >
            <FaTrash className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Service Content */}
      <div className="p-6">
        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">{service.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{service.description}</p>
        
        {/* Service Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Price:</span>
            <span className="font-semibold text-green-600">{formatPrice(service)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Duration:</span>
            <span className="text-gray-900">{Math.floor(service.duration / 60)}h {service.duration % 60}m</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Rating:</span>
            <div className="flex items-center space-x-1">
              <FaStar className="h-4 w-4 text-yellow-500" />
              <span className="text-gray-900">{service.rating}</span>
              <span className="text-gray-500">({service.totalBookings})</span>
            </div>
          </div>
        </div>

        {/* Service Areas */}
        {service.serviceArea.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-1">Service Areas:</p>
            <div className="flex flex-wrap gap-1">
              {service.serviceArea.slice(0, 2).map((area, idx) => (
                <span key={idx} className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                  <FaMapMarkerAlt className="h-3 w-3 mr-1" />
                  {area}
                </span>
              ))}
              {service.serviceArea.length > 2 && (
                <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                  +{service.serviceArea.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Revenue */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Total Revenue:</span>
            <span className="font-semibold text-orange-600">KSh {service.totalRevenue.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Service Modal Component (Add/Edit)
interface ServiceModalProps {
  service: Service | null
  isOpen: boolean
  onClose: () => void
  onSave: (service: Service) => void
  serviceCategories: any[]
}

const ServiceModal: React.FC<ServiceModalProps> = ({
  service,
  isOpen,
  onClose,
  onSave,
  serviceCategories
}) => {
  const [formData, setFormData] = useState<Partial<Service>>({
    title: '',
    description: '',
    category: 'plumbing',
    price: 0,
    priceType: 'fixed',
    duration: 60,
    images: [],
    isActive: true,
    serviceArea: [],
    availableHours: { start: '08:00', end: '18:00' },
    tags: []
  })
  const [loading, setSaving] = useState(false)
  const [newArea, setNewArea] = useState('')
  const [newTag, setNewTag] = useState('')

  useEffect(() => {
    if (service) {
      setFormData(service)
    } else {
      setFormData({
        title: '',
        description: '',
        category: 'plumbing',
        price: 0,
        priceType: 'fixed',
        duration: 60,
        images: [],
        isActive: true,
        serviceArea: [],
        availableHours: { start: '08:00', end: '18:00' },
        tags: []
      })
    }
  }, [service])

  const handleSave = async () => {
    if (!formData.title || !formData.description) {
      alert('Please fill in all required fields')
      return
    }

    setSaving(true)
    try {
      let response
      if (service?._id) {
        // Update existing service
        response = await providerServicesAPI.updateService(service._id, formData)
      } else {
        // Create new service
        response = await providerServicesAPI.createService(formData)
      }

      if (response.status === 'success') {
        onSave(response.data.service)
        alert(getSuccessMessage(service?._id ? 'update' : 'create', 'Service'))
      } else {
        throw new Error('Failed to save service')
      }
    } catch (error) {
      console.error('Error saving service:', error)
      alert(handleAPIError(error))
    } finally {
      setSaving(false)
    }
  }

  const addServiceArea = () => {
    if (newArea.trim() && !formData.serviceArea?.includes(newArea.trim())) {
      setFormData(prev => ({
        ...prev,
        serviceArea: [...(prev.serviceArea || []), newArea.trim()]
      }))
      setNewArea('')
    }
  }

  const removeServiceArea = (area: string) => {
    setFormData(prev => ({
      ...prev,
      serviceArea: prev.serviceArea?.filter(a => a !== area) || []
    }))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || []
    }))
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {service ? 'Edit Service' : 'Add New Service'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="e.g., Emergency Plumbing Repair"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                {serviceCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Describe your service in detail..."
            />
          </div>

          {/* Service Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Images
            </label>
            <CloudinaryUpload
              onUploadComplete={(urls) => {
                setFormData(prev => ({
                  ...prev,
                  images: [...(prev.images || []), ...urls]
                }))
              }}
              maxFiles={5}
              allowedTypes={['image']}
              folder="services"
            />
            
            {/* Display uploaded images */}
            {formData.images && formData.images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.images.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <Image
                      src={imageUrl}
                      alt={`Service image ${index + 1}`}
                      width={150}
                      height={150}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          images: prev.images?.filter((_, i) => i !== index) || []
                        }))
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FaTimes className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Type
              </label>
              <select
                value={formData.priceType}
                onChange={(e) => setFormData(prev => ({ ...prev, priceType: e.target.value as any }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="fixed">Fixed Price</option>
                <option value="hourly">Hourly Rate</option>
                <option value="quote">Custom Quote</option>
              </select>
            </div>

            {formData.priceType !== 'quote' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (KSh) {formData.priceType === 'hourly' && '/ hour'}
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="0"
                  min="0"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Duration (minutes)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: Number(e.target.value) }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="60"
                min="15"
                step="15"
              />
            </div>
          </div>

          {/* Availability */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available From
              </label>
              <input
                type="time"
                value={formData.availableHours?.start}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  availableHours: { ...prev.availableHours!, start: e.target.value }
                }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Until
              </label>
              <input
                type="time"
                value={formData.availableHours?.end}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  availableHours: { ...prev.availableHours!, end: e.target.value }
                }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Service Areas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Areas
            </label>
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={newArea}
                onChange={(e) => setNewArea(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addServiceArea()}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="e.g., Nairobi CBD, Westlands..."
              />
              <button
                type="button"
                onClick={addServiceArea}
                className="px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.serviceArea?.map((area, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full"
                >
                  {area}
                  <button
                    type="button"
                    onClick={() => removeServiceArea(area)}
                    className="ml-2 text-orange-600 hover:text-orange-800"
                  >
                    <FaTimes className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (for better searchability)
            </label>
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="e.g., emergency, 24/7, eco-friendly..."
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags?.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <FaTimes className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Make this service active immediately
            </label>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
            <span>{service ? 'Update Service' : 'Create Service'}</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default MyServicesPage