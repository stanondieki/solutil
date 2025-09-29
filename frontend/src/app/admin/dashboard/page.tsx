'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AdminLayout from '@/components/AdminLayout'

interface DashboardStats {
  totalUsers: number
  totalProviders: number
  totalBookings: number
  totalRevenue: number
  pendingApprovals: number
  activeServices: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProviders: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
    activeServices: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')
      
      if (!token) {
        console.warn('No admin token found')
        setStats({
          totalUsers: 0,
          totalProviders: 0,
          totalBookings: 0,
          totalRevenue: 0,
          pendingApprovals: 0,
          activeServices: 0
        })
        return
      }

      const response = await fetch('/api/admin/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('Dashboard stats received:', result)
        
        // Map the backend response to our interface
        const mappedStats = {
          totalUsers: result.data?.totalUsers || result.totalUsers || 0,
          totalProviders: result.data?.totalProviders || result.totalProviders || 0,
          totalBookings: result.data?.totalBookings || result.totalBookings || 0,
          totalRevenue: result.data?.totalRevenue || result.totalRevenue || 0,
          pendingApprovals: result.data?.pendingVerifications || result.data?.pendingApprovals || result.pendingApprovals || 0,
          activeServices: result.data?.activeServices || result.activeServices || 0
        }
        
        setStats(mappedStats)
      } else {
        console.error('Failed to fetch stats:', response.statusText)
        // Set empty stats instead of mock data
        setStats({
          totalUsers: 0,
          totalProviders: 0,
          totalBookings: 0,
          totalRevenue: 0,
          pendingApprovals: 0,
          activeServices: 0
        })
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      // Set empty stats instead of mock data
      setStats({
        totalUsers: 0,
        totalProviders: 0,
        totalBookings: 0,
        totalRevenue: 0,
        pendingApprovals: 0,
        activeServices: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Users',
      value: (stats.totalUsers || 0).toLocaleString(),
      icon: '👥',
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Service Providers',
      value: (stats.totalProviders || 0).toLocaleString(),
      icon: '🔧',
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      title: 'Total Bookings',
      value: (stats.totalBookings || 0).toLocaleString(),
      icon: '📅',
      color: 'bg-purple-500',
      change: '+15%'
    },
    {
      title: 'Revenue (KES)',
      value: `${((stats.totalRevenue || 0) / 1000).toFixed(0)}K`,
      icon: '💰',
      color: 'bg-orange-500',
      change: '+23%'
    },
    {
      title: 'Pending Approvals',
      value: (stats.pendingApprovals || 0).toString(),
      icon: '⏳',
      color: 'bg-yellow-500',
      change: '+3'
    },
    {
      title: 'Active Services',
      value: stats.activeServices.toString(),
      icon: '⚡',
      color: 'bg-indigo-500',
      change: '+1'
    }
  ]

  const recentActivities = [
    { action: 'New provider registered', user: 'John Doe (Plumber)', time: '2 hours ago' },
    { action: 'Booking completed', user: 'Sarah Kim → Mike Johnson', time: '3 hours ago' },
    { action: 'User reported issue', user: 'Alex Chen', time: '5 hours ago' },
    { action: 'Provider approved', user: 'Emma Wilson (Electrician)', time: '1 day ago' },
    { action: 'Payment processed', user: 'David Brown', time: '1 day ago' }
  ]

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
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400 mt-1">Overview of your Solutil platform</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Last updated</p>
            <p className="text-white">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                  <p className="text-green-400 text-sm mt-2">{stat.change} from last month</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <span className="text-2xl">{stat.icon}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700"
          >
            <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-lg transition-colors text-center">
                <div className="text-2xl mb-2">👤</div>
                <div className="text-sm">Manage Users</div>
              </button>
              <button className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg transition-colors text-center">
                <div className="text-2xl mb-2">🔧</div>
                <div className="text-sm">Approve Providers</div>
              </button>
              <button className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-lg transition-colors text-center">
                <div className="text-2xl mb-2">📊</div>
                <div className="text-sm">View Reports</div>
              </button>
              <button className="bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-lg transition-colors text-center">
                <div className="text-2xl mb-2">⚙️</div>
                <div className="text-sm">Settings</div>
              </button>
            </div>
          </motion.div>

          {/* Recent Activities */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700"
          >
            <h3 className="text-xl font-bold text-white mb-4">Recent Activities</h3>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-white text-sm">{activity.action}</p>
                    <p className="text-gray-400 text-xs">{activity.user}</p>
                  </div>
                  <span className="text-gray-400 text-xs">{activity.time}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Charts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <h3 className="text-xl font-bold text-white mb-4">Platform Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl text-orange-500 mb-2">📈</div>
              <h4 className="text-white font-semibold">Growth Rate</h4>
              <p className="text-gray-400 text-sm">+15% this month</p>
            </div>
            <div className="text-center">
              <div className="text-3xl text-green-500 mb-2">💯</div>
              <h4 className="text-white font-semibold">Success Rate</h4>
              <p className="text-gray-400 text-sm">94% completion</p>
            </div>
            <div className="text-center">
              <div className="text-3xl text-blue-500 mb-2">⭐</div>
              <h4 className="text-white font-semibold">Avg. Rating</h4>
              <p className="text-gray-400 text-sm">4.8 / 5.0</p>
            </div>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  )
}
