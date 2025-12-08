'use client'

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  FaCheckCircle, 
  FaHome, 
  FaReceipt, 
  FaCalendarAlt,
  FaShare,
  FaWhatsapp,
  FaEnvelope,
  FaCopy
} from 'react-icons/fa';

export default function PaymentSuccessPage() {
  const handleShare = (platform: 'whatsapp' | 'email' | 'copy') => {
    const message = "✅ Payment successful! My service booking has been confirmed. Looking forward to great service! 🏠✨";
    
    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:?subject=Service Booking Confirmed&body=${encodeURIComponent(message)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(message);
        alert('Message copied to clipboard!');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 200, 
            damping: 20,
            delay: 0.2 
          }}
          className="text-center mb-8"
        >
          <div className="relative inline-block">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute inset-0 bg-green-400 rounded-full opacity-20 animate-pulse"
            ></motion.div>
            <FaCheckCircle className="text-green-500 text-8xl relative z-10" />
          </div>
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Payment Successful! 🎉
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Your payment has been processed successfully and your booking is now confirmed.
          </p>
          
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
            <div className="space-y-3 text-left">
              <div className="flex items-center space-x-3">
                <FaCheckCircle className="text-green-500 flex-shrink-0" />
                <span className="text-gray-700">Payment confirmed and processed</span>
              </div>
              <div className="flex items-center space-x-3">
                <FaCheckCircle className="text-green-500 flex-shrink-0" />
                <span className="text-gray-700">Service provider has been notified</span>
              </div>
              <div className="flex items-center space-x-3">
                <FaCheckCircle className="text-green-500 flex-shrink-0" />
                <span className="text-gray-700">Booking confirmation email sent</span>
              </div>
              <div className="flex items-center space-x-3">
                <FaCheckCircle className="text-green-500 flex-shrink-0" />
                <span className="text-gray-700">Provider will contact you shortly</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-xl shadow-sm border p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">What happens next?</h3>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 text-blue-600 rounded-full p-2 flex-shrink-0">
                <span className="text-sm font-bold">1</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">Provider Contact</div>
                <div className="text-gray-600">Your service provider will contact you within the next hour to confirm service details and coordinate timing.</div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 text-blue-600 rounded-full p-2 flex-shrink-0">
                <span className="text-sm font-bold">2</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">Service Preparation</div>
                <div className="text-gray-600">The provider will prepare for your service and arrive at the scheduled time with all necessary tools and materials.</div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 text-blue-600 rounded-full p-2 flex-shrink-0">
                <span className="text-sm font-bold">3</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">Service Completion</div>
                <div className="text-gray-600">After service completion, you'll be able to rate and review your experience to help other customers.</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Share Success */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6 mb-8 border border-orange-200"
        >
          <div className="text-center mb-4">
            <FaShare className="text-orange-600 text-2xl mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-900">Share Your Success!</h3>
            <p className="text-gray-600">Let others know about your great booking experience</p>
          </div>
          
          <div className="flex justify-center space-x-3">
            <button
              onClick={() => handleShare('whatsapp')}
              className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition-colors"
              title="Share on WhatsApp"
            >
              <FaWhatsapp />
            </button>
            
            <button
              onClick={() => handleShare('email')}
              className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors"
              title="Share via Email"
            >
              <FaEnvelope />
            </button>
            
            <button
              onClick={() => handleShare('copy')}
              className="bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600 transition-colors"
              title="Copy Message"
            >
              <FaCopy />
            </button>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Link
            href="/bookings"
            className="bg-orange-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-700 transition-colors text-center"
          >
            <FaCalendarAlt className="inline mr-2" />
            View My Bookings
          </Link>
          
          <Link
            href="/dashboard"
            className="bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
          >
            <FaReceipt className="inline mr-2" />
            Go to Dashboard
          </Link>
          
          <Link
            href="/"
            className="bg-gray-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-700 transition-colors text-center"
          >
            <FaHome className="inline mr-2" />
            Back to Home
          </Link>
        </motion.div>

        {/* Footer Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="text-center mt-8 text-gray-500"
        >
          <p className="text-sm">
            Thank you for choosing Solutil Connect! 
            <br />
            For any questions or support, contact us at support@solutilconnect.com
          </p>
        </motion.div>
      </div>
    </div>
  );
}