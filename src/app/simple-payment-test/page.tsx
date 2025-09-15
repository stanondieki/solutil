'use client'

import React, { useState } from 'react'
import { FaPlay, FaCheck, FaCreditCard } from 'react-icons/fa'
import EscrowPayment from '../../components/booking/EscrowPayment'

// Simple payment test component
export default function SimplePaymentTest() {
  const [showPayment, setShowPayment] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  const handlePaymentSuccess = (transactionId: string) => {
    setPaymentSuccess(true)
    console.log('Payment successful:', transactionId)
    alert(`Payment successful! Transaction ID: ${transactionId}`)
  }

  const handlePaymentFailed = (error: string) => {
    console.error('Payment failed:', error)
    alert(`Payment failed: ${error}`)
  }

  const resetTest = () => {
    setShowPayment(false)
    setPaymentSuccess(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">
            🧪 Simple Payment Test
          </h1>
          
          {!showPayment && !paymentSuccess && (
            <div className="text-center space-y-6">
              <p className="text-gray-600 text-lg">
                Test the M-Pesa STK Push payment component
              </p>
              <button
                onClick={() => setShowPayment(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-lg text-lg font-semibold flex items-center space-x-2 mx-auto"
              >
                <FaPlay />
                <span>Start Payment Test</span>
              </button>
            </div>
          )}

          {showPayment && !paymentSuccess && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-center">
                💳 Testing M-Pesa Payment
              </h2>
              <EscrowPayment
                amount={2500}
                phoneNumber="0712345678"
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentFailed={handlePaymentFailed}
                providerName="John Kamau"
                serviceName="Plumbing Service"
              />
              <div className="mt-6 text-center">
                <button
                  onClick={resetTest}
                  className="text-gray-600 hover:text-gray-800 underline"
                >
                  Reset Test
                </button>
              </div>
            </div>
          )}

          {paymentSuccess && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <FaCheck className="text-green-600 text-3xl" />
              </div>
              <h2 className="text-2xl font-bold text-green-600">
                Payment Test Successful! 🎉
              </h2>
              <p className="text-gray-600">
                The M-Pesa STK Push component is working correctly.
              </p>
              <button
                onClick={resetTest}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
              >
                Test Again
              </button>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">
              📝 Test Instructions:
            </h3>
            <ul className="text-yellow-700 text-sm space-y-1">
              <li>• Use test phone number: 0712345678</li>
              <li>• The payment will simulate M-Pesa STK Push</li>
              <li>• Mock APIs will respond with test data</li>
              <li>• Check browser console for logs</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
