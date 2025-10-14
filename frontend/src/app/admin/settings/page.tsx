'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AdminLayout from '../../../components/AdminLayout'

interface SystemSettings {
  platform: {
    name: string
    version: string
    maintenanceMode: boolean
    maxUsersPerProvider: number
    defaultCommissionRate: number
  }
  email: {
    smtpEnabled: boolean
    fromEmail: string
    welcomeEmailEnabled: boolean
    bookingNotificationsEnabled: boolean
    providerNotificationsEnabled: boolean
  }
  payment: {
    mpesaEnabled: boolean
    bankTransferEnabled: boolean
    minimumBookingAmount: number
    maximumBookingAmount: number
    paymentTimeoutMinutes: number
  }
  notifications: {
    smsEnabled: boolean
    pushNotificationsEnabled: boolean
    emailDigestEnabled: boolean
    adminAlerts: boolean
  }
  security: {
    passwordMinLength: number
    requireEmailVerification: boolean
    sessionTimeoutHours: number
    maxLoginAttempts: number
    twoFactorEnabled: boolean
  }
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('platform')
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      
      // For now, we'll use mock data since the settings endpoint may not be fully implemented
      // TODO: Replace with actual API call when backend is ready
      // const token = localStorage.getItem('adminToken')
      // const response = await fetch('/api/admin/settings', {
      //   headers: { 'Authorization': `Bearer ${token}` }
      // })
      
      // Mock settings data
      const mockSettings: SystemSettings = {
        platform: {
          name: 'Solutil Connect',
          version: '1.0.0',
          maintenanceMode: false,
          maxUsersPerProvider: 100,
          defaultCommissionRate: 15
        },
        email: {
          smtpEnabled: true,
          fromEmail: 'noreply@solutilconnect.com',
          welcomeEmailEnabled: true,
          bookingNotificationsEnabled: true,
          providerNotificationsEnabled: true
        },
        payment: {
          mpesaEnabled: true,
          bankTransferEnabled: true,
          minimumBookingAmount: 500,
          maximumBookingAmount: 50000,
          paymentTimeoutMinutes: 15
        },
        notifications: {
          smsEnabled: false,
          pushNotificationsEnabled: true,
          emailDigestEnabled: true,
          adminAlerts: true
        },
        security: {
          passwordMinLength: 8,
          requireEmailVerification: true,
          sessionTimeoutHours: 24,
          maxLoginAttempts: 5,
          twoFactorEnabled: false
        }
      }
      
      setSettings(mockSettings)
    } catch (error) {
      console.error('Error fetching settings:', error)
      setSettings(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSettingChange = (category: keyof SystemSettings, field: string, value: any) => {
    if (!settings) return
    
    setSettings(prevSettings => ({
      ...prevSettings!,
      [category]: {
        ...prevSettings![category],
        [field]: value
      }
    }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!settings) return
    
    try {
      setSaving(true)
      
      // TODO: Replace with actual API call when backend is ready
      // const token = localStorage.getItem('adminToken')
      // const response = await fetch('/api/admin/settings', {
      //   method: 'PUT',
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(settings)
      // })
      
      // Simulate save
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setHasChanges(false)
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'platform', name: 'Platform', icon: '⚙️' },
    { id: 'email', name: 'Email', icon: '📧' },
    { id: 'payment', name: 'Payment', icon: '💳' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' },
    { id: 'security', name: 'Security', icon: '🔒' }
  ]

  const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean, onChange: (value: boolean) => void }) => (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-orange-600' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )

  const InputField = ({ 
    label, 
    value, 
    onChange, 
    type = 'text', 
    min, 
    max, 
    disabled = false 
  }: { 
    label: string
    value: string | number
    onChange: (value: any) => void
    type?: string
    min?: number
    max?: number
    disabled?: boolean
  }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(type === 'number' ? parseInt(e.target.value) : e.target.value)}
        min={min}
        max={max}
        disabled={disabled}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100"
      />
    </div>
  )

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading settings...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!settings) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">⚙️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Settings not available</h3>
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
                <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
                <p className="text-gray-600 mt-1">Configure platform settings and preferences</p>
              </div>
              
              {hasChanges && (
                <div className="mt-4 md:mt-0 flex space-x-4">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    {saving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Navigation */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-lg shadow-sm p-4">
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-orange-100 text-orange-700 border border-orange-200'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-lg">{tab.icon}</span>
                      <span className="font-medium">{tab.name}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </motion.div>

            {/* Settings Content */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-3"
            >
              <div className="bg-white rounded-lg shadow-sm p-6">
                {activeTab === 'platform' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Platform Settings</h3>
                    
                    <InputField
                      label="Platform Name"
                      value={settings.platform.name}
                      onChange={(value) => handleSettingChange('platform', 'name', value)}
                    />
                    
                    <InputField
                      label="Version"
                      value={settings.platform.version}
                      onChange={(value) => handleSettingChange('platform', 'version', value)}
                      disabled
                    />
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Maintenance Mode</label>
                      <div className="flex items-center space-x-3">
                        <ToggleSwitch
                          enabled={settings.platform.maintenanceMode}
                          onChange={(value) => handleSettingChange('platform', 'maintenanceMode', value)}
                        />
                        <span className="text-sm text-gray-600">
                          {settings.platform.maintenanceMode ? 'Platform is in maintenance mode' : 'Platform is active'}
                        </span>
                      </div>
                    </div>
                    
                    <InputField
                      label="Max Users Per Provider"
                      value={settings.platform.maxUsersPerProvider}
                      onChange={(value) => handleSettingChange('platform', 'maxUsersPerProvider', value)}
                      type="number"
                      min={1}
                      max={1000}
                    />
                    
                    <InputField
                      label="Default Commission Rate (%)"
                      value={settings.platform.defaultCommissionRate}
                      onChange={(value) => handleSettingChange('platform', 'defaultCommissionRate', value)}
                      type="number"
                      min={0}
                      max={50}
                    />
                  </div>
                )}

                {activeTab === 'email' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Email Settings</h3>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Enabled</label>
                      <div className="flex items-center space-x-3">
                        <ToggleSwitch
                          enabled={settings.email.smtpEnabled}
                          onChange={(value) => handleSettingChange('email', 'smtpEnabled', value)}
                        />
                        <span className="text-sm text-gray-600">
                          {settings.email.smtpEnabled ? 'SMTP is enabled' : 'SMTP is disabled'}
                        </span>
                      </div>
                    </div>
                    
                    <InputField
                      label="From Email Address"
                      value={settings.email.fromEmail}
                      onChange={(value) => handleSettingChange('email', 'fromEmail', value)}
                      type="email"
                    />
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Welcome Emails</span>
                        <ToggleSwitch
                          enabled={settings.email.welcomeEmailEnabled}
                          onChange={(value) => handleSettingChange('email', 'welcomeEmailEnabled', value)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Booking Notifications</span>
                        <ToggleSwitch
                          enabled={settings.email.bookingNotificationsEnabled}
                          onChange={(value) => handleSettingChange('email', 'bookingNotificationsEnabled', value)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Provider Notifications</span>
                        <ToggleSwitch
                          enabled={settings.email.providerNotificationsEnabled}
                          onChange={(value) => handleSettingChange('email', 'providerNotificationsEnabled', value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'payment' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Payment Settings</h3>
                    
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">M-Pesa Payments</span>
                        <ToggleSwitch
                          enabled={settings.payment.mpesaEnabled}
                          onChange={(value) => handleSettingChange('payment', 'mpesaEnabled', value)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Bank Transfer</span>
                        <ToggleSwitch
                          enabled={settings.payment.bankTransferEnabled}
                          onChange={(value) => handleSettingChange('payment', 'bankTransferEnabled', value)}
                        />
                      </div>
                    </div>
                    
                    <InputField
                      label="Minimum Booking Amount (KES)"
                      value={settings.payment.minimumBookingAmount}
                      onChange={(value) => handleSettingChange('payment', 'minimumBookingAmount', value)}
                      type="number"
                      min={100}
                    />
                    
                    <InputField
                      label="Maximum Booking Amount (KES)"
                      value={settings.payment.maximumBookingAmount}
                      onChange={(value) => handleSettingChange('payment', 'maximumBookingAmount', value)}
                      type="number"
                      min={1000}
                    />
                    
                    <InputField
                      label="Payment Timeout (Minutes)"
                      value={settings.payment.paymentTimeoutMinutes}
                      onChange={(value) => handleSettingChange('payment', 'paymentTimeoutMinutes', value)}
                      type="number"
                      min={5}
                      max={60}
                    />
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Settings</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-gray-700">SMS Notifications</span>
                          <p className="text-xs text-gray-500">Send SMS alerts for critical updates</p>
                        </div>
                        <ToggleSwitch
                          enabled={settings.notifications.smsEnabled}
                          onChange={(value) => handleSettingChange('notifications', 'smsEnabled', value)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Push Notifications</span>
                          <p className="text-xs text-gray-500">Send push notifications to mobile apps</p>
                        </div>
                        <ToggleSwitch
                          enabled={settings.notifications.pushNotificationsEnabled}
                          onChange={(value) => handleSettingChange('notifications', 'pushNotificationsEnabled', value)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Email Digest</span>
                          <p className="text-xs text-gray-500">Send daily/weekly summary emails</p>
                        </div>
                        <ToggleSwitch
                          enabled={settings.notifications.emailDigestEnabled}
                          onChange={(value) => handleSettingChange('notifications', 'emailDigestEnabled', value)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Admin Alerts</span>
                          <p className="text-xs text-gray-500">Receive system alerts and warnings</p>
                        </div>
                        <ToggleSwitch
                          enabled={settings.notifications.adminAlerts}
                          onChange={(value) => handleSettingChange('notifications', 'adminAlerts', value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h3>
                    
                    <InputField
                      label="Password Minimum Length"
                      value={settings.security.passwordMinLength}
                      onChange={(value) => handleSettingChange('security', 'passwordMinLength', value)}
                      type="number"
                      min={6}
                      max={20}
                    />
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Require Email Verification</label>
                      <div className="flex items-center space-x-3">
                        <ToggleSwitch
                          enabled={settings.security.requireEmailVerification}
                          onChange={(value) => handleSettingChange('security', 'requireEmailVerification', value)}
                        />
                        <span className="text-sm text-gray-600">
                          {settings.security.requireEmailVerification ? 'Email verification required' : 'Email verification optional'}
                        </span>
                      </div>
                    </div>
                    
                    <InputField
                      label="Session Timeout (Hours)"
                      value={settings.security.sessionTimeoutHours}
                      onChange={(value) => handleSettingChange('security', 'sessionTimeoutHours', value)}
                      type="number"
                      min={1}
                      max={168}
                    />
                    
                    <InputField
                      label="Max Login Attempts"
                      value={settings.security.maxLoginAttempts}
                      onChange={(value) => handleSettingChange('security', 'maxLoginAttempts', value)}
                      type="number"
                      min={3}
                      max={10}
                    />
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Two-Factor Authentication</label>
                      <div className="flex items-center space-x-3">
                        <ToggleSwitch
                          enabled={settings.security.twoFactorEnabled}
                          onChange={(value) => handleSettingChange('security', 'twoFactorEnabled', value)}
                        />
                        <span className="text-sm text-gray-600">
                          {settings.security.twoFactorEnabled ? '2FA is enabled' : '2FA is disabled'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}