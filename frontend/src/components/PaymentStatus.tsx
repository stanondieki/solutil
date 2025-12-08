'use client'

import React, { useState } from 'react';
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
  FaMoneyBill
} from 'react-icons/fa';

interface PaymentDetails {
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
}

interface PaymentStatusProps {
  payment: PaymentDetails;
  totalAmount: number;
  bookingNumber: string;
  className?: string;
}

const PaymentStatus: React.FC<PaymentStatusProps> = ({ 
  payment, 
  totalAmount, 
  bookingNumber, 
  className = '' 
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const getStatusIcon = () => {
    switch (payment.status) {
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

  const getStatusColor = () => {
    switch (payment.status) {
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

  const getStatusText = () => {
    switch (payment.status) {
      case 'completed':
        return 'Payment Successful';
      case 'failed':
        return 'Payment Failed';
      case 'processing':
        return 'Processing Payment';
      case 'initiated':
        return 'Payment Initiated';
      case 'pending':
        return payment.timing === 'pay-after' ? 'Pay After Service' : 'Payment Pending';
      default:
        return 'Unknown Status';
    }
  };

  const getPaymentMethodIcon = () => {
    switch (payment.method) {
      case 'mpesa':
      case 'mobile-money':
        return <FaMobile className="text-green-600" />;
      case 'card':
        return <FaCreditCard className="text-blue-600" />;
      case 'cash':
        return <FaMoneyBill className="text-green-600" />;
      default:
        return <FaCreditCard className="text-gray-600" />;
    }
  };

  const formatAmount = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
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

  return (
    <div className={`bg-white rounded-lg border p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          {getPaymentMethodIcon()}
          <div>
            <div className="font-medium text-gray-900 capitalize">
              {payment.method.replace('-', ' ')} Payment
            </div>
            <div className="text-sm text-gray-500">
              {payment.timing === 'pay-after' ? 'Pay After Service' : 'Pay Now'}
            </div>
          </div>
        </div>
        
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusColor()}`}>
          {getStatusIcon()}
          <span className="text-sm font-medium">{getStatusText()}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <div className="text-sm text-gray-500">Amount</div>
          <div className="font-bold text-gray-900">
            {formatAmount(payment.amount || totalAmount)}
          </div>
        </div>
        
        {payment.paidAt && (
          <div>
            <div className="text-sm text-gray-500">Paid On</div>
            <div className="font-medium text-gray-900">
              {formatDate(payment.paidAt)}
            </div>
          </div>
        )}
      </div>

      {(payment.reference || payment.transactionId) && (
        <div className="border-t pt-3">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800"
          >
            {showDetails ? <FaEyeSlash /> : <FaEye />}
            <span>{showDetails ? 'Hide' : 'Show'} Payment Details</span>
          </button>
          
          {showDetails && (
            <div className="mt-3 space-y-2 text-sm">
              {payment.reference && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Reference:</span>
                  <span className="font-mono text-gray-800">{payment.reference}</span>
                </div>
              )}
              
              {payment.transactionId && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Transaction ID:</span>
                  <span className="font-mono text-gray-800">{payment.transactionId}</span>
                </div>
              )}
              
              {payment.gateway && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Gateway:</span>
                  <span className="capitalize text-gray-800">{payment.gateway}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-500">Booking:</span>
                <span className="font-mono text-gray-800">{bookingNumber}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action buttons based on payment status */}
      {payment.status === 'pending' && payment.timing === 'pay-now' && (
        <div className="border-t pt-3 mt-3">
          <button className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors">
            Pay Now
          </button>
        </div>
      )}

      {payment.status === 'failed' && (
        <div className="border-t pt-3 mt-3">
          <button className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">
            Retry Payment
          </button>
        </div>
      )}

      {payment.status === 'completed' && (
        <div className="border-t pt-3 mt-3">
          <div className="flex items-center space-x-2 text-green-600">
            <FaCheckCircle />
            <span className="text-sm font-medium">Payment confirmed and provider notified</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentStatus;