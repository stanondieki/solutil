'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AdminLayout from '../../../components/AdminLayout'

interface ReportData {
  totalUsers: number
  totalProviders: number
  totalBookings: number
  totalRevenue: number
  monthlyGrowth: number
  topServices: Array<{
    name: string
    bookings: number
    revenue: number
  }>
  revenueByMonth: Array<{
    month: string
    revenue: number
    bookings: number
  }>
  providerPerformance: Array<{
    name: string
    rating: number
    completedJobs: number
    revenue: number
  }>
}

export default function AdminReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState('overview')
  const [dateRange, setDateRange] = useState('last-30-days')

  useEffect(() => {
    fetchReportData()
  }, [selectedReport, dateRange])

  const fetchReportData = async () => {
    try {
      setLoading(true)
      
      // For now, we'll use mock data since the reports endpoint may not be fully implemented
      // TODO: Replace with actual API call when backend is ready
      // const token = localStorage.getItem('adminToken')
      // const response = await fetch(`/api/admin/reports/${selectedReport}?range=${dateRange}`, {
      //   headers: { 'Authorization': `Bearer ${token}` }
      // })
      
      // Mock report data
      const mockData: ReportData = {
        totalUsers: 1245,
        totalProviders: 89,
        totalBookings: 567,
        totalRevenue: 1234567,
        monthlyGrowth: 15.8,
        topServices: [
          { name: 'Plumbing', bookings: 145, revenue: 217500 },
          { name: 'Electrical', bookings: 123, revenue: 184500 },
          { name: 'Cleaning', bookings: 98, revenue: 147000 },
          { name: 'Painting', bookings: 76, revenue: 114000 },
          { name: 'Carpentry', bookings: 65, revenue: 97500 }
        ],
        revenueByMonth: [
          { month: 'Jul 2024', revenue: 85000, bookings: 45 },
          { month: 'Aug 2024', revenue: 92000, bookings: 52 },
          { month: 'Sep 2024', revenue: 105000, bookings: 58 },
          { month: 'Oct 2024', revenue: 118000, bookings: 65 },
          { month: 'Nov 2024', revenue: 134000, bookings: 73 },
          { month: 'Dec 2024', revenue: 145000, bookings: 82 }
        ],
        providerPerformance: [
          { name: 'John Smith', rating: 4.9, completedJobs: 45, revenue: 67500 },
          { name: 'Sarah Johnson', rating: 4.8, completedJobs: 38, revenue: 57000 },
          { name: 'Mike Davis', rating: 4.7, completedJobs: 42, revenue: 63000 },
          { name: 'Emily Brown', rating: 4.9, completedJobs: 35, revenue: 52500 },
          { name: 'David Wilson', rating: 4.6, completedJobs: 40, revenue: 60000 }
        ]
      }
      
      setReportData(mockData)
    } catch (error) {
      console.error('Error fetching report data:', error)
      setReportData(null)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount)
  }

  const StatCard = ({ title, value, change, icon }: { title: string, value: string, change?: string, icon: string }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className="text-sm text-green-600 font-medium">
              ↗ {change} from last month
            </p>
          )}
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </motion.div>
  )

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading reports...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!reportData) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No report data available</h3>
            <p className="text-gray-500">Please try again later or contact support.</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm p-6 mb-6"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
                <p className="text-gray-600 mt-1">Business insights and performance metrics</p>
              </div>
              
              <div className="mt-4 md:mt-0 flex space-x-4">
                <select
                  value={selectedReport}
                  onChange={(e) => setSelectedReport(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="overview">Overview</option>
                  <option value="revenue">Revenue Analysis</option>
                  <option value="providers">Provider Performance</option>
                  <option value="services">Service Analytics</option>
                </select>
                
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="last-7-days">Last 7 Days</option>
                  <option value="last-30-days">Last 30 Days</option>
                  <option value="last-90-days">Last 90 Days</option>
                  <option value="last-year">Last Year</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard
              title="Total Revenue"
              value={formatCurrency(reportData.totalRevenue)}
              change="+15.8%"
              icon="💰"
            />
            <StatCard
              title="Total Bookings"
              value={reportData.totalBookings.toLocaleString()}
              change="+12.3%"
              icon="📅"
            />
            <StatCard
              title="Active Providers"
              value={reportData.totalProviders.toLocaleString()}
              change="+8.5%"
              icon="🔧"
            />
            <StatCard
              title="Total Users"
              value={reportData.totalUsers.toLocaleString()}
              change="+22.1%"
              icon="👥"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Top Services */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Services</h3>
              <div className="space-y-4">
                {reportData.topServices.map((service, index) => (
                  <div key={service.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-orange-600">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{service.name}</p>
                        <p className="text-xs text-gray-500">{service.bookings} bookings</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{formatCurrency(service.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Revenue Chart */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
              <div className="space-y-3">
                {reportData.revenueByMonth.map((month, index) => {
                  const maxRevenue = Math.max(...reportData.revenueByMonth.map(m => m.revenue))
                  const percentage = (month.revenue / maxRevenue) * 100
                  
                  return (
                    <div key={month.month}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{month.month}</span>
                        <span className="font-medium text-gray-900">{formatCurrency(month.revenue)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ delay: 0.3 + (index * 0.1), duration: 0.6 }}
                          className="bg-orange-500 h-2 rounded-full"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{month.bookings} bookings</p>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </div>

          {/* Provider Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Providers</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Provider</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Rating</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Completed Jobs</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.providerPerformance.map((provider) => (
                    <tr key={provider.name} className="border-b border-gray-100">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{provider.name}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <span className="text-yellow-400 mr-1">⭐</span>
                          <span className="font-medium">{provider.rating}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-900">{provider.completedJobs}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-900">{formatCurrency(provider.revenue)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Export and Download Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-sm p-6 mt-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Reports</h3>
            <div className="flex flex-wrap gap-4">
              <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                📊 Export to Excel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                📄 Export to PDF
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                📈 Export Charts
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  )
}