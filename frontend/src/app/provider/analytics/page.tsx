'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { 
  FaChartLine, 
  FaDollarSign, 
  FaUsers, 
  FaStar,
  FaCalendarAlt,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa'

interface AnalyticsStat {
  title: string
  value: string | number
  change: string
  trend: 'up' | 'down'
  icon: React.ComponentType<any>
  color: string
}

const mockAnalytics: AnalyticsStat[] = [
  {
    title: 'Total Earnings',
    value: 'KES 45,600',
    change: '+12.5%',
    trend: 'up',
    icon: FaDollarSign,
    color: 'text-green-600'
  },
  {
    title: 'Completed Jobs',
    value: 24,
    change: '+8.3%',
    trend: 'up', 
    icon: FaUsers,
    color: 'text-blue-600'
  },
  {
    title: 'Average Rating',
    value: '4.8',
    change: '+0.2',
    trend: 'up',
    icon: FaStar,
    color: 'text-yellow-600'
  },
  {
    title: 'This Month',
    value: 'KES 12,400',
    change: '-5.2%',
    trend: 'down',
    icon: FaCalendarAlt,
    color: 'text-orange-600'
  }
]

export default function ProviderAnalyticsPage() {
  const { user } = useAuth()
  const [timeRange, setTimeRange] = useState('30d')

  if (!user || user.userType !== 'provider') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Provider access required</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Provider Analytics
          </h1>
          <p className="text-gray-600">
            Track your performance and earnings
          </p>
        </motion.div>

        {/* Time Range Selector */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex space-x-4">
            {['7d', '30d', '90d', '1y'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  timeRange === range
                    ? 'bg-orange-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {range === '7d' ? 'Last 7 days' : 
                 range === '30d' ? 'Last 30 days' :
                 range === '90d' ? 'Last 90 days' : 
                 'Last Year'}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Analytics Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {mockAnalytics.map((stat, index) => (
            <motion.div
              key={stat.title}
              className="bg-white p-6 rounded-xl shadow-sm border"
              whileHover={{ scale: 1.02 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg bg-gray-50`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className={`flex items-center space-x-1 text-sm ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.trend === 'up' ? (
                    <FaArrowUp className="w-4 h-4" />
                  ) : (
                    <FaArrowDown className="w-4 h-4" />
                  )}
                  <span>{stat.change}</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </h3>
                <p className="text-gray-600 text-sm">
                  {stat.title}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts Placeholder */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          
          {/* Earnings Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaChartLine className="w-5 h-5 text-orange-600 mr-2" />
              Earnings Trend
            </h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Chart will be implemented with real data</p>
            </div>
          </div>

          {/* Performance Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaStar className="w-5 h-5 text-yellow-600 mr-2" />
              Rating Trend
            </h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Rating analytics coming soon</p>
            </div>
          </div>

        </motion.div>

        {/* Recent Activity */}
        <motion.div 
          className="mt-8 bg-white p-6 rounded-xl shadow-sm border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Performance
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium text-gray-900">Plumbing Service</p>
                <p className="text-sm text-gray-600">Completed on Sep 28, 2024</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600">+KES 2,500</p>
                <p className="text-sm text-gray-600">5.0 ⭐</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium text-gray-900">Electrical Repair</p>
                <p className="text-sm text-gray-600">Completed on Sep 27, 2024</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600">+KES 3,200</p>
                <p className="text-sm text-gray-600">4.8 ⭐</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">Home Cleaning</p>
                <p className="text-sm text-gray-600">Completed on Sep 26, 2024</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600">+KES 1,800</p>
                <p className="text-sm text-gray-600">4.9 ⭐</p>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  )
}