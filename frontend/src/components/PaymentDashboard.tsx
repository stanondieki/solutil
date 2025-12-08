'use client'

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  FaCreditCard, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaClock, 
  FaTimes,
  FaSpinner,
  FaEye,
  FaEyeSlash,
  FaMobile,
  FaMoneyBill,
  FaLink,
  FaCopy,
  FaShare,
  FaArrowRight,
  FaHistory,
  FaReceipt
} from 'react-icons/fa';

interface Payment {
  method: string;
  timing: 'pay-now' | 'pay-after';
  status: 'pending' | 'initiated' | 'processing' | 'completed' | 'failed' | 'refunded';
  reference?: string;
  transactionId?: string;
  amount?: number;
  currency?: string;
  paidAt?: string;
  gateway?: string;
  gatewayResponse?: any;
  paymentLink?: string;
  paymentLinkExpiry?: string;
}

interface Booking {
  _id: string;
  bookingNumber: string;
  serviceCategory: string;
  scheduledDate: string;
  scheduledTime: { start: string; end: string };
  status: string;
  pricing: {
    totalAmount: number;
    currency: string;
  };
  payment: Payment;
  client?: {
    name: string;
    email: string;
  };
  provider?: {
    name: string;
    email: string;
  };
}

interface PaymentDashboardProps {
  bookings: Booking[];
  onPaymentUpdate: () => void;
  userType: 'client' | 'provider';
}

const PaymentDashboard: React.FC<PaymentDashboardProps> = ({ 
  bookings, 
  onPaymentUpdate, 
  userType 
}) => {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetails, setShowDetails] = useState<{[key: string]: boolean}>({});
  const [generatingLink, setGeneratingLink] = useState<{[key: string]: boolean}>({});

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'processing':
      case 'initiated':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'pending':
      default:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="text-green-500" />;
      case 'failed':
        return <FaTimes className="text-red-500" />;
      case 'processing':
      case 'initiated':
        return <FaSpinner className="text-blue-500 animate-spin" />;
      case 'pending':
      default:
        return <FaClock className="text-yellow-500" />;
    }
  };

  const formatAmount = (amount: number, currency: string = 'KES') => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const generatePaymentLink = async (bookingId: string) => {
    try {
      setGeneratingLink(prev => ({ ...prev, [bookingId]: true }));
      
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payment-links/generate/${bookingId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      
      if (result.status === 'success') {
        // Copy link to clipboard
        navigator.clipboard.writeText(result.data.paymentLink);
        alert(`Payment link generated and copied to clipboard!\n\nLink expires: ${formatDate(result.data.expiresAt)}`);
        onPaymentUpdate(); // Refresh the bookings
      } else {
        throw new Error(result.message || 'Failed to generate payment link');
      }
    } catch (error) {
      console.error('Error generating payment link:', error);
      alert('Failed to generate payment link. Please try again.');
    } finally {
      setGeneratingLink(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  const retryPayment = async (booking: Booking) => {
    try {
      // Initialize payment for the booking
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/initialize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookingId: booking._id,
          amount: booking.pricing.totalAmount,
          email: booking.client?.email
        })
      });

      const result = await response.json();
      
      if (result.status === 'success') {
        // Open Paystack popup
        const PaystackPop = (window as any).PaystackPop;
        if (PaystackPop) {
          const handler = PaystackPop.setup({
            key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
            email: booking.client?.email,
            amount: result.data.amount,
            currency: 'KES',
            reference: result.data.reference,
            callback: (response: any) => {
              alert('Payment successful! Verifying...');
              onPaymentUpdate();
            },
            onClose: () => {
              console.log('Payment cancelled');
            }
          });
          handler.openIframe();
        }
      }
    } catch (error) {
      console.error('Error retrying payment:', error);
      alert('Failed to retry payment. Please try again.');
    }
  };

  const toggleDetails = (bookingId: string) => {
    setShowDetails(prev => ({
      ...prev,
      [bookingId]: !prev[bookingId]
    }));
  };

  const pendingPayments = bookings.filter(b => 
    b.payment.status === 'pending' || b.payment.status === 'failed'
  );
  
  const completedPayments = bookings.filter(b => 
    b.payment.status === 'completed'
  );
  
  const processingPayments = bookings.filter(b => 
    b.payment.status === 'processing' || b.payment.status === 'initiated'
  );

  return (
    <div className="space-y-6">
      {/* Payment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg"
        >
          <div className="flex items-center space-x-3">
            <FaClock className="text-yellow-500 text-xl" />
            <div>
              <div className="text-2xl font-bold text-yellow-700">{pendingPayments.length}</div>
              <div className="text-sm text-yellow-600">Pending Payments</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-blue-50 border border-blue-200 p-4 rounded-lg"
        >
          <div className="flex items-center space-x-3">
            <FaSpinner className="text-blue-500 text-xl" />
            <div>
              <div className="text-2xl font-bold text-blue-700">{processingPayments.length}</div>
              <div className="text-sm text-blue-600">Processing</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-green-50 border border-green-200 p-4 rounded-lg"
        >
          <div className="flex items-center space-x-3">
            <FaCheckCircle className="text-green-500 text-xl" />
            <div>
              <div className="text-2xl font-bold text-green-700">{completedPayments.length}</div>
              <div className="text-sm text-green-600">Completed</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Pending/Failed Payments - Priority Section */}
      {pendingPayments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border border-orange-200 p-6"
        >
          <div className="flex items-center space-x-2 mb-4">
            <FaExclamationTriangle className="text-orange-500" />
            <h3 className="text-lg font-semibold text-gray-900">Action Required</h3>
          </div>
          
          <div className="space-y-4">
            {pendingPayments.map((booking, index) => (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-medium text-gray-900">
                      {booking.bookingNumber} - {booking.serviceCategory}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(booking.scheduledDate)} • {formatAmount(booking.pricing.totalAmount)}
                    </div>
                  </div>
                  
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusColor(booking.payment.status)}`}>
                    {getStatusIcon(booking.payment.status)}
                    <span className="text-sm font-medium capitalize">{booking.payment.status}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  {booking.payment.status === 'failed' && userType === 'client' && (
                    <button
                      onClick={() => retryPayment(booking)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      Retry Payment
                    </button>
                  )}
                  
                  {booking.payment.status === 'pending' && (
                    <button
                      onClick={() => generatePaymentLink(booking._id)}
                      disabled={generatingLink[booking._id]}
                      className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm disabled:opacity-50"
                    >
                      {generatingLink[booking._id] ? (
                        <>
                          <FaSpinner className="animate-spin inline mr-2" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <FaLink className="inline mr-2" />
                          Generate Payment Link
                        </>
                      )}
                    </button>
                  )}
                  
                  <Link
                    href={`/bookings/${booking._id}`}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    View Details
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* All Payments History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg border p-6"
      >
        <div className="flex items-center space-x-2 mb-6">
          <FaHistory className="text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
        </div>
        
        <div className="space-y-4">
          {bookings.map((booking, index) => (
            <motion.div
              key={booking._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="font-medium text-gray-900">
                      {booking.bookingNumber}
                    </div>
                    <div className={`flex items-center space-x-2 px-2 py-1 rounded-full border text-xs ${getStatusColor(booking.payment.status)}`}>
                      {getStatusIcon(booking.payment.status)}
                      <span className="font-medium capitalize">{booking.payment.status}</span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>{booking.serviceCategory}</div>
                    <div>{formatDate(booking.scheduledDate)}</div>
                    <div className="flex items-center space-x-4">
                      <span>Method: {booking.payment.method?.replace('-', ' ') || 'Not specified'}</span>
                      <span>Timing: {booking.payment.timing === 'pay-after' ? 'Pay After Service' : 'Pay Now'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-bold text-gray-900">
                    {formatAmount(booking.payment.amount || booking.pricing.totalAmount)}
                  </div>
                  {booking.payment.paidAt && (
                    <div className="text-xs text-gray-500">
                      Paid: {formatDate(booking.payment.paidAt)}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <button
                  onClick={() => toggleDetails(booking._id)}
                  className="text-sm text-gray-600 hover:text-gray-800 flex items-center space-x-1"
                >
                  {showDetails[booking._id] ? <FaEyeSlash /> : <FaEye />}
                  <span>{showDetails[booking._id] ? 'Hide' : 'Show'} Details</span>
                </button>
                
                <div className="flex space-x-2">
                  <Link
                    href={`/bookings/${booking._id}`}
                    className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 transition-colors"
                  >
                    View Booking
                  </Link>
                  
                  {booking.payment.status === 'completed' && (
                    <button className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 transition-colors">
                      <FaReceipt className="inline mr-1" />
                      Receipt
                    </button>
                  )}
                </div>
              </div>

              {showDetails[booking._id] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-gray-200"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {booking.payment.reference && (
                      <div>
                        <span className="text-gray-500">Reference:</span>
                        <span className="font-mono text-gray-800 ml-2">{booking.payment.reference}</span>
                      </div>
                    )}
                    
                    {booking.payment.transactionId && (
                      <div>
                        <span className="text-gray-500">Transaction ID:</span>
                        <span className="font-mono text-gray-800 ml-2">{booking.payment.transactionId}</span>
                      </div>
                    )}
                    
                    {booking.payment.gateway && (
                      <div>
                        <span className="text-gray-500">Gateway:</span>
                        <span className="capitalize text-gray-800 ml-2">{booking.payment.gateway}</span>
                      </div>
                    )}
                    
                    {booking.payment.paymentLinkExpiry && (
                      <div>
                        <span className="text-gray-500">Link Expires:</span>
                        <span className="text-gray-800 ml-2">{formatDate(booking.payment.paymentLinkExpiry)}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
        
        {bookings.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FaReceipt className="text-4xl mx-auto mb-4 opacity-50" />
            <p>No payment history available</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentDashboard;