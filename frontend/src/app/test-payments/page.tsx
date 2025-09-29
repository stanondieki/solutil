'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaCode, FaPlay, FaRedo, FaCheck } from 'react-icons/fa'
import ProviderList from '../../components/booking/ProviderList'
import ProviderCard, { Provider } from '../../components/booking/ProviderCard'
import EscrowPayment from '../../components/booking/EscrowPayment'
import JobCompletion from '../../components/booking/JobCompletion'

// Import mock API for testing
import '../../lib/mockAPI'

// Test data
const mockProvider: Provider = {
  id: '1',
  name: 'John Kamau',
  rating: 4.9,
  reviews: 127,
  price: 2500,
  image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  distance: '2.3 km away',
  experience: '8 years',
  specialties: ['Pipe Repair', 'Installation', 'Emergency Service'],
  availability: ['Today', 'Tomorrow', 'This Week'],
  verified: true,
  responseTime: 'Responds in 15 min'
}

type TestStage = 'provider-selection' | 'payment' | 'completion' | 'summary'

export default function PaymentTestPage() {
  const [currentStage, setCurrentStage] = useState<TestStage>('provider-selection')
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
  const [paymentCompleted, setPaymentCompleted] = useState(false)
  const [jobCompleted, setJobCompleted] = useState(false)
  const [testResults, setTestResults] = useState({
    providerSelection: false,
    payment: false,
    completion: false
  })

  const handleProviderSelect = (provider: Provider) => {
    setSelectedProvider(provider)
    setTestResults(prev => ({ ...prev, providerSelection: true }))
    console.log('✅ Provider selected:', provider.name)
  }

  const handlePaymentSuccess = (transactionId: string) => {
    setPaymentCompleted(true)
    setTestResults(prev => ({ ...prev, payment: true }))
    setCurrentStage('completion')
    console.log('✅ Payment successful:', transactionId)
  }

  const handlePaymentFailed = (error: string) => {
    console.error('❌ Payment failed:', error)
    alert(`Payment failed: ${error}`)
  }

  const handleJobCompletion = (data: any) => {
    setJobCompleted(true)
    setTestResults(prev => ({ ...prev, completion: true }))
    setCurrentStage('summary')
    console.log('✅ Job completed:', data)
  }

  const handleJobDispute = (reason: string) => {
    console.log('⚠️ Job disputed:', reason)
    alert(`Dispute initiated: ${reason}`)
  }

  const resetTest = () => {
    setCurrentStage('provider-selection')
    setSelectedProvider(null)
    setPaymentCompleted(false)
    setJobCompleted(false)
    setTestResults({ providerSelection: false, payment: false, completion: false })
  }

  const proceedToPayment = () => {
    if (selectedProvider) {
      setCurrentStage('payment')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <FaCode className="text-orange-600 text-2xl" />
            <h1 className="text-3xl font-bold text-gray-900">Payment Interface Testing</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Test all payment components and escrow functionality
          </p>
        </div>

        {/* Test Progress */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Progress</h2>
          <div className="flex items-center space-x-8">
            <div className={`flex items-center space-x-2 ${testResults.providerSelection ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${testResults.providerSelection ? 'bg-green-100' : 'bg-gray-100'}`}>
                {testResults.providerSelection ? <FaCheck /> : '1'}
              </div>
              <span>Provider Selection</span>
            </div>
            <div className={`flex items-center space-x-2 ${testResults.payment ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${testResults.payment ? 'bg-green-100' : 'bg-gray-100'}`}>
                {testResults.payment ? <FaCheck /> : '2'}
              </div>
              <span>Escrow Payment</span>
            </div>
            <div className={`flex items-center space-x-2 ${testResults.completion ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${testResults.completion ? 'bg-green-100' : 'bg-gray-100'}`}>
                {testResults.completion ? <FaCheck /> : '3'}
              </div>
              <span>Job Completion</span>
            </div>
          </div>
        </div>

        {/* Test Controls */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Current Stage: {currentStage.replace('-', ' ').toUpperCase()}</h3>
              <p className="text-gray-600">Testing component functionality</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={resetTest}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FaRedo />
                <span>Reset Test</span>
              </button>
              {currentStage === 'provider-selection' && selectedProvider && (
                <button
                  onClick={proceedToPayment}
                  className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <FaPlay />
                  <span>Test Payment</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Test Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Component Test Area */}
          <div className="space-y-6">
            {/* Provider Selection Test */}
            {currentStage === 'provider-selection' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 shadow-lg"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  🔧 Provider Selection Test
                </h3>
                <p className="text-gray-600 mb-6">
                  Test the provider selection components. Try searching, filtering, and selecting a provider.
                </p>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Individual Provider Card:</h4>
                    <ProviderCard
                      provider={mockProvider}
                      selected={selectedProvider?.id === mockProvider.id}
                      onClick={() => handleProviderSelect(mockProvider)}
                    />
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Provider List with Search & Filter:</h4>
                    <ProviderList
                      serviceId="plumbing"
                      onProviderSelect={handleProviderSelect}
                      selectedProviderId={selectedProvider?.id}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Payment Test */}
            {currentStage === 'payment' && selectedProvider && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 shadow-lg"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  💳 Escrow Payment Test
                </h3>
                <p className="text-gray-600 mb-6">
                  Test the M-Pesa STK Push payment flow. Use test phone number: 0712345678
                </p>
                
                <EscrowPayment
                  amount={selectedProvider.price}
                  phoneNumber="0712345678"
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentFailed={handlePaymentFailed}
                  providerName={selectedProvider.name}
                  serviceName="Plumbing Service"
                />
              </motion.div>
            )}

            {/* Job Completion Test */}
            {currentStage === 'completion' && selectedProvider && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 shadow-lg"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  ✅ Job Completion Test
                </h3>
                <p className="text-gray-600 mb-6">
                  Test service completion and payment release. Try both completion and dispute flows.
                </p>
                
                <JobCompletion
                  bookingId="test-booking-123"
                  providerName={selectedProvider.name}
                  serviceName="Plumbing Service"
                  amount={selectedProvider.price}
                  commissionAmount={selectedProvider.price * 0.1}
                  providerAmount={selectedProvider.price * 0.9}
                  onCompletion={handleJobCompletion}
                  onDispute={handleJobDispute}
                />
              </motion.div>
            )}

            {/* Test Summary */}
            {currentStage === 'summary' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 shadow-lg"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  🎉 Test Summary
                </h3>
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">All Tests Completed Successfully!</h4>
                    <ul className="text-green-700 space-y-1">
                      <li>✅ Provider selection functionality working</li>
                      <li>✅ Payment escrow system operational</li>
                      <li>✅ Job completion and payment release working</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Test Results:</h4>
                    <ul className="text-blue-700 space-y-1">
                      <li>• Selected Provider: {selectedProvider?.name}</li>
                      <li>• Payment Amount: KSh {selectedProvider?.price.toLocaleString()}</li>
                      <li>• Commission (10%): KSh {((selectedProvider?.price || 0) * 0.1).toLocaleString()}</li>
                      <li>• Provider Amount: KSh {((selectedProvider?.price || 0) * 0.9).toLocaleString()}</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Debug Console */}
          <div className="bg-gray-900 rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-white mb-4">
              🖥️ Debug Console
            </h3>
            <div className="bg-black rounded-lg p-4 min-h-[400px] font-mono text-sm">
              <div className="text-green-400">
                $ npm run test:payments
              </div>
              <div className="text-gray-300 mt-2">
                Testing payment interface components...
              </div>
              <div className="text-yellow-400 mt-2">
                [LOG] Current stage: {currentStage}
              </div>
              <div className="text-blue-400 mt-1">
                [LOG] Selected provider: {selectedProvider?.name || 'None'}
              </div>
              <div className="text-green-400 mt-1">
                [LOG] Payment completed: {paymentCompleted ? 'Yes' : 'No'}
              </div>
              <div className="text-purple-400 mt-1">
                [LOG] Job completed: {jobCompleted ? 'Yes' : 'No'}
              </div>
              
              <div className="text-gray-400 mt-4">
                Console output will appear here...
              </div>
              
              <div className="text-gray-500 mt-2 text-xs">
                • Open browser dev tools for detailed logs
                • Check network tab for API calls
                • Monitor component state changes
              </div>
            </div>
          </div>
        </div>

        {/* Test Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mt-8">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">
            📝 Testing Instructions
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-yellow-700">
            <div>
              <h4 className="font-medium mb-2">1. Provider Selection</h4>
              <ul className="text-sm space-y-1">
                <li>• Try searching for providers</li>
                <li>• Use filter and sort options</li>
                <li>• Select a provider card</li>
                <li>• Check selection state</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">2. Payment Testing</h4>
              <ul className="text-sm space-y-1">
                <li>• Use test phone: 0712345678</li>
                <li>• Check payment status updates</li>
                <li>• Test timeout scenarios</li>
                <li>• Verify escrow calculations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">3. Completion Flow</h4>
              <ul className="text-sm space-y-1">
                <li>• Test rating system</li>
                <li>• Try completion flow</li>
                <li>• Test dispute system</li>
                <li>• Check payment release</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
