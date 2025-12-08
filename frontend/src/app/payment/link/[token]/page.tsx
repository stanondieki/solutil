'use client'

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

// Environment-based Paystack key selection
const getPaystackPublicKey = () => {
  // Check if we're using production backend
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || ''
  const isProductionBackend = backendUrl.includes('azurewebsites.net') || backendUrl.includes('solutilconnect.com')
  
  // For production backend, prioritize LIVE keys
  const key = isProductionBackend 
    ? (process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY_TEST)
    : (process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY_TEST || process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY)
    
  const isTestKey = key?.startsWith('pk_test_')
  
  console.log(`🔑 Using Paystack ${isTestKey ? 'TEST' : 'LIVE'} key:`, key?.substring(0, 12) + '...')
  console.log(`🌐 Backend Environment: ${isProductionBackend ? 'PRODUCTION' : 'DEVELOPMENT'}`)
  return key
}
import { 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaCreditCard, 
  FaMobile, 
  FaSpinner,
  FaLock,
  FaShieldAlt,
  FaMapMarkerAlt,
  FaUser,
  FaCalendarAlt,
  FaArrowLeft
} from 'react-icons/fa';

interface PaymentLinkData {
  booking: {
    id: string;
    bookingNumber: string;
    client: {
      name: string;
      email: string;
      phone: string;
    };
    provider: {
      name: string;
      email: string;
      phone: string;
    };
    serviceCategory: string;
    scheduledDate: string;
    scheduledTime: { start: string; end: string };
    location: {
      address: string;
    };
    pricing: {
      totalAmount: number;
      currency: string;
    };
    payment: {
      method: string;
      status: string;
      timing: string;
    };
  };
  paymentDetails: {
    amount: number;
    currency: string;
    dueAmount: number;
  };
}

// Simple Paystack interface
interface PaystackConfig {
  key: string;
  email: string;
  amount: number;
  currency: string;
  reference: string;
  callback: (response: any) => void;
  onClose: () => void;
  channels?: string[];
}

// Declare Paystack global (matching the original interface)
declare global {
  interface Window {
    PaystackPop: {
      setup: (options: any) => {
        openIframe: () => void;
      };
    };
  }
}

export default function PaymentLinkPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  
  const [paymentData, setPaymentData] = useState<PaymentLinkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobile-money'>('card');
  const [processing, setProcessing] = useState(false);
  const [paystackLoaded, setPaystackLoaded] = useState(false);

  useEffect(() => {
    if (token) {
      validatePaymentLink();
      loadPaystackScript();
    }
  }, [token]);

  const loadPaystackScript = () => {
    // Check if Paystack is already loaded
    if (window.PaystackPop) {
      setPaystackLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => {
      setPaystackLoaded(true);
      console.log('✅ Paystack script loaded successfully');
    };
    script.onerror = () => {
      console.error('❌ Failed to load Paystack script');
      setError('Failed to load payment system. Please refresh the page.');
    };
    document.head.appendChild(script);
  };

  const validatePaymentLink = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Validating payment link for token:', token);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payment-links/validate/${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 Validation response status:', response.status);
      const result = await response.json();
      console.log('📋 Validation result:', result);

      if (result.status === 'success') {
        setPaymentData(result.data);
        console.log('✅ Payment link validated successfully');
      } else {
        const errorMsg = result.message || 'Invalid or expired payment link';
        console.error('❌ Payment link validation failed:', errorMsg);
        setError(errorMsg);
      }
    } catch (error) {
      console.error('❌ Error validating payment link:', error);
      setError('Failed to validate payment link. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const initializePaystack = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (window.PaystackPop) {
        resolve(window.PaystackPop);
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.onload = () => {
        if (window.PaystackPop) {
          resolve(window.PaystackPop);
        } else {
          reject(new Error('Paystack failed to load'));
        }
      };
      script.onerror = () => reject(new Error('Failed to load Paystack script'));
      document.head.appendChild(script);
    });
  };

  const processPayment = async () => {
    if (!paymentData || !paystackLoaded) {
      console.error('❌ Payment data or Paystack not ready');
      alert('Payment system not ready. Please wait a moment and try again.');
      return;
    }

    try {
      setProcessing(true);
      console.log('🔄 Starting payment process...');

      // Get Paystack public key
      const paystackKey = getPaystackPublicKey();
      if (!paystackKey) {
        throw new Error('Payment system not configured properly. Please contact support.');
      }

      console.log('🔑 Using Paystack key:', paystackKey.substring(0, 12) + '...');

      // Process the link payment to get Paystack details
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payment-links/process/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ paymentMethod })
      });

      console.log('📡 Process payment response status:', response.status);
      const result = await response.json();
      console.log('📋 Process payment result:', result);

      if (result.status === 'success') {
        console.log('✅ Payment processing initialized');

        // Configure Paystack
        const paymentConfig: PaystackConfig = {
          key: paystackKey,
          email: paymentData.booking.client.email,
          amount: result.data.amount,
          currency: 'KES',
          reference: result.data.reference,
          callback: (response: any) => {
            console.log('✅ Payment successful:', response);
            handlePaymentSuccess(response);
          },
          onClose: () => {
            console.log('⚠️ Payment cancelled by user');
            setProcessing(false);
          }
        };

        // Configure for mobile money if selected
        if (paymentMethod === 'mobile-money') {
          paymentConfig.channels = ['mobile_money'];
          console.log('📱 Configured for mobile money payment');
        }

        console.log('💳 Payment configuration:', {
          ...paymentConfig,
          key: paymentConfig.key.substring(0, 12) + '...'
        });

        // Open Paystack popup
        const handler = window.PaystackPop.setup(paymentConfig);
        handler.openIframe();
        console.log('🚀 Payment popup opened');

      } else {
        throw new Error(result.message || 'Failed to initialize payment');
      }
    } catch (error) {
      console.error('❌ Error processing payment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      alert(`Payment Error: ${errorMessage}\n\nPlease try again or contact support if the issue persists.`);
      setProcessing(false);
    }
  };

  const handlePaymentSuccess = async (response: any) => {
    try {
      // Verify payment
      const verifyResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/verify/${response.reference}`, {
        method: 'GET'
      });
          
      const verifyResult = await verifyResponse.json();

      if (verifyResult.status === 'success') {
        // Show success message
        alert(`🎉 Payment Successful!

Transaction Reference: ${response.reference}
Amount: KES ${paymentData?.paymentDetails.amount.toLocaleString() || 'N/A'}

Your booking is now confirmed and the provider has been notified.`);

        // Redirect to a success page or booking details
        router.push('/payment/success');
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      alert('Payment was submitted but verification failed. Please contact support if the amount was deducted.');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-orange-600 text-4xl mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Validating Payment Link</h2>
          <p className="text-gray-600">Please wait while we verify your payment link...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Link Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button 
              onClick={validatePaymentLink}
              className="w-full bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Try Again
            </button>
            <button 
              onClick={() => router.push('/')}
              className="w-full bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <FaArrowLeft className="inline mr-2" />
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!paymentData) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center space-x-2 mb-4">
            <FaShieldAlt className="text-green-500 text-2xl" />
            <h1 className="text-3xl font-bold text-gray-900">Secure Payment</h1>
          </div>
          <p className="text-gray-600">Complete your payment for booking {paymentData.booking.bookingNumber}</p>
        </motion.div>

        {/* Booking Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border p-6 mb-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h3>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <FaUser className="text-gray-400" />
              <div>
                <div className="font-medium text-gray-900">Service Provider</div>
                <div className="text-gray-600">{paymentData.booking.provider.name}</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <FaCalendarAlt className="text-gray-400" />
              <div>
                <div className="font-medium text-gray-900">Service Date & Time</div>
                <div className="text-gray-600">
                  {formatDate(paymentData.booking.scheduledDate)} at {paymentData.booking.scheduledTime.start}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <FaMapMarkerAlt className="text-gray-400" />
              <div>
                <div className="font-medium text-gray-900">Location</div>
                <div className="text-gray-600">{paymentData.booking.location.address}</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <FaCreditCard className="text-gray-400" />
              <div>
                <div className="font-medium text-gray-900">Service</div>
                <div className="text-gray-600">{paymentData.booking.serviceCategory}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Payment Amount */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 mb-6 border border-orange-200"
        >
          <div className="text-center">
            <div className="text-sm text-orange-600 mb-2">Total Amount Due</div>
            <div className="text-4xl font-bold text-orange-800">
              KES {paymentData.paymentDetails.dueAmount.toLocaleString()}
            </div>
          </div>
        </motion.div>

        {/* Payment Method Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border p-6 mb-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Payment Method</h3>
          
          <div className="space-y-3">
            <button
              onClick={() => setPaymentMethod('card')}
              className={`w-full p-4 rounded-lg border-2 transition-all flex items-center justify-between ${
                paymentMethod === 'card'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <FaCreditCard className="text-blue-600 text-xl" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">Card Payment</div>
                  <div className="text-sm text-gray-600">Visa, Mastercard, Verve</div>
                </div>
              </div>
              {paymentMethod === 'card' && (
                <FaCheckCircle className="text-blue-500" />
              )}
            </button>

            <button
              onClick={() => setPaymentMethod('mobile-money')}
              className={`w-full p-4 rounded-lg border-2 transition-all flex items-center justify-between ${
                paymentMethod === 'mobile-money'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <FaMobile className="text-green-600 text-xl" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">Mobile Money</div>
                  <div className="text-sm text-gray-600">M-Pesa STK Push</div>
                </div>
              </div>
              {paymentMethod === 'mobile-money' && (
                <FaCheckCircle className="text-green-500" />
              )}
            </button>
          </div>
        </motion.div>

        {/* Security Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-50 rounded-xl p-4 mb-6"
        >
          <div className="flex items-center space-x-2 mb-3">
            <FaLock className="text-green-600" />
            <h4 className="font-medium text-gray-900">Your Payment is Secure</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
            <div>• 256-bit SSL Encryption</div>
            <div>• Paystack Secure Gateway</div>
            <div>• PCI DSS Compliant</div>
          </div>
        </motion.div>

        {/* Payment Status */}
        {!paystackLoaded && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <FaSpinner className="animate-spin text-yellow-600" />
              <span className="text-yellow-800">Loading payment system...</span>
            </div>
          </div>
        )}

        {/* Pay Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <button
            onClick={processPayment}
            disabled={processing || !paystackLoaded}
            className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-orange-700 hover:to-orange-800 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {processing ? (
              <>
                <FaSpinner className="animate-spin inline mr-2" />
                Processing Payment...
              </>
            ) : !paystackLoaded ? (
              <>
                <FaSpinner className="animate-spin inline mr-2" />
                Loading Payment System...
              </>
            ) : (
              <>
                <FaLock className="inline mr-2" />
                Pay KES {paymentData.paymentDetails.dueAmount.toLocaleString()} Now
              </>
            )}
          </button>
          
          <p className="text-xs text-gray-500 mt-3">
            By clicking "Pay Now", you agree to complete the payment for this service booking.
          </p>
        </motion.div>
      </div>
    </div>
  );
}