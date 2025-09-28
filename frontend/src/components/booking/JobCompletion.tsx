'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FaCheck, 
  FaTimes, 
  FaStar, 
  FaCommentDots, 
  FaExclamationTriangle, 
  FaShieldAlt,
  FaMoneyBillWave,
  FaSpinner,
  FaCalendarCheck,
  FaUserCheck
} from 'react-icons/fa'

interface JobCompletionProps {
  bookingId: string
  providerName: string
  serviceName: string
  amount: number
  commissionAmount: number
  providerAmount: number
  onCompletion: (data: CompletionData) => void
  onDispute: (reason: string) => void
}

interface CompletionData {
  rating: number
  review: string
  completed: boolean
  releasePayment: boolean
}

type CompletionStatus = 'pending' | 'confirming' | 'completed' | 'disputed'

export default function JobCompletion({
  bookingId,
  providerName,
  serviceName,
  amount,
  commissionAmount,
  providerAmount,
  onCompletion,
  onDispute
}: JobCompletionProps) {
  const [status, setStatus] = useState<CompletionStatus>('pending')
  const [rating, setRating] = useState<number>(0)
  const [review, setReview] = useState<string>('')
  const [disputeReason, setDisputeReason] = useState<string>('')
  const [showDispute, setShowDispute] = useState<boolean>(false)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)

  const handleConfirmCompletion = async () => {
    if (rating === 0) {
      alert('Please provide a rating before confirming completion')
      return
    }

    setIsProcessing(true)
    setStatus('confirming')

    try {
      // Call API to confirm completion and release payment
      const response = await fetch(`/api/bookings/${bookingId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating,
          review,
          releasePayment: true
        }),
      })

      const data = await response.json()

      if (data.success) {
        setStatus('completed')
        onCompletion({
          rating,
          review,
          completed: true,
          releasePayment: true
        })
      } else {
        throw new Error(data.message || 'Failed to complete booking')
      }
    } catch (error: any) {
      console.error('Error completing booking:', error)
      alert(error.message || 'Failed to complete booking')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDispute = async () => {
    if (!disputeReason.trim()) {
      alert('Please provide a reason for the dispute')
      return
    }

    setIsProcessing(true)
    setStatus('disputed')

    try {
      // Call API to initiate dispute
      const response = await fetch(`/api/bookings/${bookingId}/dispute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: disputeReason
        }),
      })

      const data = await response.json()

      if (data.success) {
        onDispute(disputeReason)
      } else {
        throw new Error(data.message || 'Failed to initiate dispute')
      }
    } catch (error: any) {
      console.error('Error initiating dispute:', error)
      alert(error.message || 'Failed to initiate dispute')
    } finally {
      setIsProcessing(false)
    }
  }

  const StarRating = () => (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => setRating(star)}
          className={`text-2xl transition-colors duration-200 ${
            star <= rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'
          }`}
        >
          <FaStar />
        </button>
      ))}
    </div>
  )

  if (status === 'completed') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl text-center"
      >
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaCheck className="text-green-600 text-3xl" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Service Completed!
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Thank you for confirming the completion. Payment has been released to {providerName}.
        </p>
        <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4">
          <div className="flex items-center justify-center space-x-2 text-green-800 dark:text-green-300 mb-2">
            <FaMoneyBillWave />
            <span className="font-semibold">Payment Released</span>
          </div>
          <p className="text-sm text-green-700 dark:text-green-400">
            KSh {providerAmount.toLocaleString()} has been transferred to the provider
          </p>
        </div>
      </motion.div>
    )
  }

  if (status === 'disputed') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl text-center"
      >
        <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaExclamationTriangle className="text-yellow-600 text-3xl" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Dispute Initiated
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Your dispute has been submitted. Our support team will review the case and contact you within 24 hours.
        </p>
        <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-lg p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-300">
            Your payment is safely held in escrow until the dispute is resolved.
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaCalendarCheck className="text-blue-600 text-2xl" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Service Completion
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          Please confirm if the service was completed satisfactorily
        </p>
      </div>

      {/* Service Details */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">Service:</span>
            <span className="font-medium text-gray-900 dark:text-white">{serviceName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">Provider:</span>
            <span className="font-medium text-gray-900 dark:text-white">{providerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">Amount:</span>
            <span className="font-medium text-orange-600">KSh {amount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {!showDispute ? (
        <>
          {/* Rating */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              How would you rate this service?
            </label>
            <div className="flex items-center justify-center space-x-1 mb-2">
              <StarRating />
            </div>
            <p className="text-center text-sm text-gray-500">
              {rating === 0 && 'Select a rating'}
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </p>
          </div>

          {/* Review */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Leave a Review (Optional)
            </label>
            <div className="relative">
              <FaCommentDots className="absolute left-3 top-3 text-gray-400" />
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows={3}
                placeholder="Share your experience with this service..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleConfirmCompletion}
              disabled={rating === 0 || isProcessing}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-4 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <FaUserCheck />
                  <span>Confirm & Release Payment</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowDispute(true)}
              disabled={isProcessing}
              className="w-full border-2 border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 py-3 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <FaExclamationTriangle />
              <span>Report Issue</span>
            </button>
          </div>

          {/* Payment Info */}
          <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <div className="flex items-start space-x-2">
              <FaShieldAlt className="text-blue-600 text-sm mt-1" />
              <div>
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  <strong>Escrow Protection:</strong> Confirming completion will release KSh {providerAmount.toLocaleString()} to the provider. This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Dispute Form */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              What went wrong?
            </label>
            <textarea
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              rows={4}
              placeholder="Please describe the issue with the service..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              required
            />
          </div>

          <div className="space-y-3">
            <button
              onClick={handleDispute}
              disabled={!disputeReason.trim() || isProcessing}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-4 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <FaExclamationTriangle />
                  <span>Submit Dispute</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowDispute(false)}
              disabled={isProcessing}
              className="w-full border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 py-3 rounded-xl font-semibold transition-colors duration-200"
            >
              Cancel
            </button>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
            <p className="text-xs text-yellow-800 dark:text-yellow-300">
              <strong>Note:</strong> Submitting a dispute will hold your payment in escrow until our support team resolves the issue.
            </p>
          </div>
        </>
      )}
    </div>
  )
}
