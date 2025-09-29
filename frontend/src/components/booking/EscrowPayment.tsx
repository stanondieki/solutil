'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaMobile, FaShieldAlt, FaSpinner, FaCheck, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa'

interface EscrowPaymentProps {
  amount: number
  phoneNumber: string
  onPaymentSuccess: (transactionId: string) => void
  onPaymentFailed: (error: string) => void
  providerName: string
  serviceName: string
}

type PaymentStatus = 'idle' | 'initiating' | 'pending' | 'success' | 'failed'

export default function EscrowPayment({ 
  amount, 
  phoneNumber, 
  onPaymentSuccess, 
  onPaymentFailed,
  providerName,
  serviceName 
}: EscrowPaymentProps) {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle')
  const [transactionId, setTransactionId] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [countdown, setCountdown] = useState<number>(120) // 2 minutes timeout
  const [phoneInput, setPhoneInput] = useState<string>(phoneNumber)

  // Company commission (example: 10%)
  const commissionRate = 0.10
  const commissionAmount = amount * commissionRate
  const providerAmount = amount - commissionAmount

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (paymentStatus === 'pending' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1)
      }, 1000)
    } else if (countdown === 0 && paymentStatus === 'pending') {
      setPaymentStatus('failed')
      setErrorMessage('Payment request timed out. Please try again.')
      onPaymentFailed('Payment request timed out')
    }

    return () => clearInterval(timer)
  }, [paymentStatus, countdown, onPaymentFailed])

  const formatPhone = (phone: string): string => {
    // Convert to Kenya format (+254...)
    let formatted = phone.replace(/\D/g, '')
    if (formatted.startsWith('0')) {
      formatted = '254' + formatted.slice(1)
    }
    if (!formatted.startsWith('254')) {
      formatted = '254' + formatted
    }
    return formatted
  }

  const initiatePayment = async () => {
    setPaymentStatus('initiating')
    setErrorMessage('')

    try {
      const formattedPhone = formatPhone(phoneInput)
      
      // Call backend API to initiate M-Pesa STK Push
      const response = await fetch('/api/payments/mpesa/stk-push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: formattedPhone,
          amount: amount,
          accountReference: `SOLUTIL-${Date.now()}`,
          transactionDesc: `Payment for ${serviceName} service`,
          metadata: {
            providerName,
            serviceName,
            commissionAmount,
            providerAmount
          }
        }),
      })

      const data = await response.json()

      if (data.success) {
        setTransactionId(data.checkoutRequestID)
        setPaymentStatus('pending')
        setCountdown(120)
        
        // Start polling for payment status
        pollPaymentStatus(data.checkoutRequestID)
      } else {
        throw new Error(data.message || 'Failed to initiate payment')
      }
    } catch (error: any) {
      setPaymentStatus('failed')
      setErrorMessage(error.message)
      onPaymentFailed(error.message)
    }
  }

  const pollPaymentStatus = async (checkoutRequestID: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/payments/mpesa/status/${checkoutRequestID}`)
        const data = await response.json()

        if (data.status === 'completed') {
          clearInterval(pollInterval)
          setPaymentStatus('success')
          onPaymentSuccess(data.transactionId)
        } else if (data.status === 'failed' || data.status === 'cancelled') {
          clearInterval(pollInterval)
          setPaymentStatus('failed')
          setErrorMessage(data.message || 'Payment failed')
          onPaymentFailed(data.message || 'Payment failed')
        }
      } catch (error) {
        console.error('Error polling payment status:', error)
      }
    }, 3000) // Poll every 3 seconds

    // Clear interval after 2 minutes
    setTimeout(() => {
      clearInterval(pollInterval)
    }, 120000)
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaShieldAlt className="text-orange-600 text-2xl" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Secure Escrow Payment
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          Your payment is held securely until service completion
        </p>
      </div>

      {/* Payment Details */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">Service:</span>
            <span className="font-medium text-gray-900 dark:text-white">{serviceName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">Provider:</span>
            <span className="font-medium text-gray-900 dark:text-white">{providerName}</span>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Service Amount:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                KSh {providerAmount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Platform Fee:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                KSh {commissionAmount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t border-gray-200 dark:border-gray-600 pt-2">
              <span className="text-gray-900 dark:text-white">Total:</span>
              <span className="text-orange-600">KSh {amount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Phone Number Input */}
      {paymentStatus === 'idle' && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            M-Pesa Phone Number
          </label>
          <div className="relative">
            <FaMobile className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="tel"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="0712345678"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Enter the phone number registered with M-Pesa
          </p>
        </div>
      )}

      {/* Payment Status */}
      {paymentStatus === 'initiating' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mb-6"
        >
          <FaSpinner className="animate-spin text-orange-600 text-3xl mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">
            Initiating payment request...
          </p>
        </motion.div>
      )}

      {paymentStatus === 'pending' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mb-6"
        >
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaMobile className="text-green-600 text-2xl animate-pulse" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Check Your Phone
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            An M-Pesa payment request has been sent to {phoneInput}
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2 text-blue-800 dark:text-blue-300">
              <FaInfoCircle />
              <span className="text-sm">Enter your M-Pesa PIN to complete payment</span>
            </div>
          </div>
          <p className="text-orange-600 font-medium">
            Time remaining: {formatTime(countdown)}
          </p>
        </motion.div>
      )}

      {paymentStatus === 'success' && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-6"
        >
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCheck className="text-green-600 text-2xl" />
          </div>
          <h3 className="text-lg font-semibold text-green-600 mb-2">
            Payment Successful!
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
            Transaction ID: {transactionId}
          </p>
          <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3">
            <p className="text-green-800 dark:text-green-300 text-sm">
              Your payment is now held in escrow and will be released to the provider upon service completion.
            </p>
          </div>
        </motion.div>
      )}

      {paymentStatus === 'failed' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mb-6"
        >
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaExclamationTriangle className="text-red-600 text-2xl" />
          </div>
          <h3 className="text-lg font-semibold text-red-600 mb-2">
            Payment Failed
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
            {errorMessage}
          </p>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {paymentStatus === 'idle' && (
          <button
            onClick={initiatePayment}
            disabled={!phoneInput.trim()}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white py-4 rounded-xl font-semibold transition-colors duration-200"
          >
            Pay with M-Pesa
          </button>
        )}

        {paymentStatus === 'failed' && (
          <button
            onClick={() => {
              setPaymentStatus('idle')
              setErrorMessage('')
              setCountdown(120)
            }}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-xl font-semibold transition-colors duration-200"
          >
            Try Again
          </button>
        )}
      </div>

      {/* Security Notice */}
      <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex items-start space-x-2">
          <FaShieldAlt className="text-green-600 text-sm mt-1" />
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              <strong>Secure Escrow Protection:</strong> Your payment is held safely until you confirm the service is completed to your satisfaction.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
