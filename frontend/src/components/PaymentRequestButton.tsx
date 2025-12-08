'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCreditCard, FaSpinner, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { useToast } from '@/components/ui/Toast';

interface PaymentRequestButtonProps {
  booking: {
    _id: string;
    status: string;
    payment: {
      status: string;
      timing: string;
      payment_url?: string;
      requested_at?: string;
    };
    pricing: {
      totalAmount: number;
      currency: string;
    };
    client: {
      name: string;
      email: string;
    };
    service: {
      title?: string;
      name?: string;
    } | null;
  };
  onPaymentRequested?: () => void;
}

const PaymentRequestButton: React.FC<PaymentRequestButtonProps> = ({ 
  booking, 
  onPaymentRequested 
}) => {
  const [isRequestingPayment, setIsRequestingPayment] = useState(false);
  const [paymentRequested, setPaymentRequested] = useState(
    booking.payment.status === 'payment_requested'
  );
  const [paymentUrl, setPaymentUrl] = useState(booking.payment.payment_url || '');
  const { showSuccess, showError } = useToast();

  const canRequestPayment = 
    booking.status === 'completed' && 
    booking.payment.timing === 'pay-after' && 
    booking.payment.status !== 'completed' &&
    booking.payment.status !== 'payment_requested';

  const handleRequestPayment = async () => {
    if (!canRequestPayment) return;

    setIsRequestingPayment(true);
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/payment-requests/${booking._id}/request-payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (response.ok) {
        setPaymentRequested(true);
        setPaymentUrl(result.data.payment_url);
        
        // Show success message
        showSuccess(
          'Payment request sent successfully!',
          `${booking.client.name} will receive a payment link to complete the transaction.`
        );
        
        // Call callback if provided
        if (onPaymentRequested) {
          onPaymentRequested();
        }
      } else {
        throw new Error(result.message || 'Failed to send payment request');
      }
    } catch (error) {
      console.error('Error requesting payment:', error);
      showError(
        'Payment Request Failed',
        `Failed to send payment request: ${(error as any)?.message || 'Unknown error'}`
      );
    } finally {
      setIsRequestingPayment(false);
    }
  };

  const copyPaymentLink = () => {
    if (paymentUrl) {
      navigator.clipboard.writeText(paymentUrl);
      showSuccess(
        'Link Copied',
        'Payment link copied to clipboard!'
      );
    }
  };

  // Show different states based on payment status
  if (booking.payment.status === 'completed') {
    return (
      <div className="flex items-center space-x-2 text-green-600">
        <FaCheck className="text-sm" />
        <span className="text-sm font-medium">Payment Completed</span>
      </div>
    );
  }

  if (paymentRequested || booking.payment.status === 'payment_requested') {
    return (
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-blue-600">
          <FaCreditCard className="text-sm" />
          <span className="text-sm font-medium">Payment Request Sent</span>
        </div>
        <div className="text-xs text-gray-500">
          Sent to {booking.client.name} on {new Date(booking.payment.requested_at || Date.now()).toLocaleDateString()}
        </div>
        {paymentUrl && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={copyPaymentLink}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Copy Payment Link
          </motion.button>
        )}
      </div>
    );
  }

  if (!canRequestPayment) {
    let reason = '';
    if (booking.status !== 'completed') {
      reason = 'Complete the service first';
    } else if (booking.payment.timing !== 'pay-after') {
      reason = 'Payment was processed during booking';
    } else {
      reason = 'Payment not available';
    }

    return (
      <div className="flex items-center space-x-2 text-gray-400">
        <FaExclamationTriangle className="text-sm" />
        <span className="text-sm">{reason}</span>
      </div>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleRequestPayment}
      disabled={isRequestingPayment}
      className="inline-flex items-center space-x-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
    >
      {isRequestingPayment ? (
        <>
          <FaSpinner className="animate-spin text-sm" />
          <span>Sending Request...</span>
        </>
      ) : (
        <>
          <FaCreditCard className="text-sm" />
          <span>Request Payment</span>
        </>
      )}
    </motion.button>
  );
};

export default PaymentRequestButton;