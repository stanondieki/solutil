'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaCheck, FaSpinner, FaExclamationTriangle, FaStar } from 'react-icons/fa';

interface BookingDetails {
  _id: string;
  service: {
    title: string;
    category: string;
  };
  provider: {
    name: string;
    email: string;
  };
  pricing: {
    totalAmount: number;
    currency: string;
  };
  scheduledDate: string;
  payment: {
    status: string;
    completed_at?: string;
  };
}

const PaymentCallbackContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | 'pending'>('pending');
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const verifyPayment = async () => {
      const reference = searchParams.get('reference');
      
      if (!reference) {
        setError('Invalid payment reference');
        setPaymentStatus('failed');
        setIsVerifying(false);
        return;
      }

      try {
        // Verify payment with backend
        const response = await fetch('/api/payment-requests/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ reference })
        });

        const result = await response.json();

        if (response.ok && result.status === 'success') {
          setPaymentStatus('success');
          
          // Fetch booking details
          const token = localStorage.getItem('authToken');
          if (token) {
            const bookingResponse = await fetch(`/api/bookings/${result.data.booking_id}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (bookingResponse.ok) {
              const bookingData = await bookingResponse.json();
              setBookingDetails(bookingData.data);
            }
          }
        } else {
          setPaymentStatus('failed');
          setError(result.message || 'Payment verification failed');
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        setPaymentStatus('failed');
        setError('Failed to verify payment');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  const handleRateService = () => {
    if (bookingDetails) {
      router.push(`/bookings/${bookingDetails._id}?tab=review`);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Verifying Payment...
            </h2>
            <p className="text-gray-600">
              Please wait while we confirm your payment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Payment Failed
            </h2>
            <p className="text-gray-600 mb-6">
              {error || 'We could not verify your payment. Please try again.'}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGoToDashboard}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
            >
              Back to Dashboard
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <FaCheck className="text-2xl text-green-600" />
          </motion.div>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Payment Successful! 🎉
          </h2>
          
          <p className="text-gray-600 mb-6">
            Your payment has been processed successfully. The service provider will receive their payout shortly.
          </p>

          {bookingDetails && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-2">Service Details:</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p><strong>Service:</strong> {bookingDetails.service.title}</p>
                <p><strong>Provider:</strong> {bookingDetails.provider.name}</p>
                <p><strong>Amount:</strong> {bookingDetails.pricing.currency} {bookingDetails.pricing.totalAmount.toLocaleString()}</p>
                <p><strong>Date:</strong> {new Date(bookingDetails.scheduledDate).toLocaleDateString()}</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRateService}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center space-x-2"
            >
              <FaStar />
              <span>Rate This Service</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGoToDashboard}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium"
            >
              Back to Dashboard
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PaymentCallbackPage: React.FC = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin mx-auto text-4xl text-orange-500 mb-4" />
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  );
};

export default PaymentCallbackPage;