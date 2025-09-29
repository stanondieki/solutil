'use client'

import React from 'react'
import Link from 'next/link'
import { 
  FaArrowLeft, 
  FaShieldAlt, 
  FaUserSecret, 
  FaDatabase, 
  FaCookieBite, 
  FaEnvelope, 
  FaFileContract,
  FaPrint,
  FaDownload,
  FaGlobe
} from 'react-icons/fa'

export default function PrivacyPage() {
  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    const content = document.getElementById('privacy-content')?.innerText || ''
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'solutil-privacy-policy.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <FaArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handlePrint}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FaPrint className="h-4 w-4" />
                <span>Print</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-green-600 rounded-lg hover:bg-green-700 transition-colors"
              >
                <FaDownload className="h-4 w-4" />
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 px-8 py-12 text-white">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <FaUserSecret className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Privacy Policy</h1>
                <p className="text-green-100 text-lg mt-2">How we protect and handle your data</p>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 mt-6">
              <p className="text-sm text-green-100">
                <strong>Last Updated:</strong> September 23, 2025
              </p>
              <p className="text-sm text-green-100 mt-1">
                <strong>Effective Date:</strong> September 23, 2025
              </p>
            </div>
          </div>

          {/* Table of Contents */}
          <div className="px-8 py-6 bg-gray-50 border-b">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Table of Contents</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { id: 'information-collection', title: '1. Information We Collect', icon: FaDatabase },
                { id: 'information-use', title: '2. How We Use Your Information', icon: FaGlobe },
                { id: 'information-sharing', title: '3. Information Sharing', icon: FaUserSecret },
                { id: 'data-security', title: '4. Data Security', icon: FaShieldAlt },
                { id: 'cookies', title: '5. Cookies & Tracking', icon: FaCookieBite },
                { id: 'your-rights', title: '6. Your Rights', icon: FaFileContract },
                { id: 'contact-us', title: '7. Contact Us', icon: FaEnvelope }
              ].map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="flex items-center space-x-3 p-3 text-sm text-gray-700 hover:text-green-600 hover:bg-white rounded-lg transition-all"
                >
                  <item.icon className="h-4 w-4 text-green-500" />
                  <span>{item.title}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Privacy Content */}
          <div id="privacy-content" className="px-8 py-8 space-y-12">
            
            {/* Introduction */}
            <div className="prose max-w-none">
              <p className="text-lg text-gray-700 leading-relaxed">
                At Solutil, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our platform.
              </p>
            </div>

            {/* Section 1: Information We Collect */}
            <section id="information-collection" className="scroll-mt-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <FaDatabase className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">1. Information We Collect</h2>
              </div>
              <div className="space-y-4 ml-12">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Personal Information</h3>
                  <ul className="list-disc ml-4 space-y-1 text-gray-700">
                    <li>Name, email address, and phone number</li>
                    <li>Profile information and preferences</li>
                    <li>Payment information (processed securely)</li>
                    <li>Identity verification documents for service providers</li>
                  </ul>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Service Information</h3>
                  <ul className="list-disc ml-4 space-y-1 text-gray-700">
                    <li>Service bookings and history</li>
                    <li>Location data for service delivery</li>
                    <li>Reviews and ratings</li>
                    <li>Communication between clients and providers</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 2: How We Use Your Information */}
            <section id="information-use" className="scroll-mt-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-green-100 rounded-xl">
                  <FaGlobe className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">2. How We Use Your Information</h2>
              </div>
              <div className="space-y-4 ml-12">
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-gray-700">
                    <strong>Service Delivery:</strong> To facilitate bookings, connect clients with service providers, and process payments.
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-gray-700">
                    <strong>Communication:</strong> To send important updates, confirmations, and support messages.
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-gray-700">
                    <strong>Safety & Security:</strong> To verify identities, prevent fraud, and ensure platform safety.
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-gray-700">
                    <strong>Improvement:</strong> To analyze usage patterns and improve our services.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3: Information Sharing */}
            <section id="information-sharing" className="scroll-mt-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <FaUserSecret className="h-6 w-6 text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">3. Information Sharing</h2>
              </div>
              <div className="space-y-4 ml-12">
                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-gray-700">
                    <strong>With Service Providers:</strong> We share necessary contact and location information to facilitate service delivery.
                  </p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-gray-700">
                    <strong>Payment Processing:</strong> Financial information is shared with secure payment processors.
                  </p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-gray-700">
                    <strong>Legal Requirements:</strong> We may disclose information when required by law or to protect safety.
                  </p>
                </div>
                <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-400">
                  <p className="text-gray-700">
                    <strong>We Never:</strong> Sell your personal information to third parties for marketing purposes.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4: Data Security */}
            <section id="data-security" className="scroll-mt-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <FaShieldAlt className="h-6 w-6 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">4. Data Security</h2>
              </div>
              <div className="space-y-4 ml-12">
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-gray-700">
                    We implement industry-standard security measures including encryption, secure servers, and regular security audits to protect your information.
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-gray-700">
                    All payment information is processed through PCI-compliant payment processors and is never stored on our servers.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 5: Cookies & Tracking */}
            <section id="cookies" className="scroll-mt-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-indigo-100 rounded-xl">
                  <FaCookieBite className="h-6 w-6 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">5. Cookies & Tracking</h2>
              </div>
              <div className="space-y-4 ml-12">
                <div className="bg-indigo-50 rounded-lg p-4">
                  <p className="text-gray-700">
                    We use cookies to remember your preferences, keep you logged in, and analyze website traffic to improve user experience.
                  </p>
                </div>
                <div className="bg-indigo-50 rounded-lg p-4">
                  <p className="text-gray-700">
                    You can control cookie settings through your browser, but some features may not work properly if cookies are disabled.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 6: Your Rights */}
            <section id="your-rights" className="scroll-mt-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-teal-100 rounded-xl">
                  <FaFileContract className="h-6 w-6 text-teal-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">6. Your Rights</h2>
              </div>
              <div className="space-y-4 ml-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-teal-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Access & Download</h3>
                    <p className="text-sm text-gray-700">Request a copy of your personal data</p>
                  </div>
                  <div className="bg-teal-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Correction</h3>
                    <p className="text-sm text-gray-700">Update or correct your information</p>
                  </div>
                  <div className="bg-teal-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Deletion</h3>
                    <p className="text-sm text-gray-700">Request deletion of your account</p>
                  </div>
                  <div className="bg-teal-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Portability</h3>
                    <p className="text-sm text-gray-700">Transfer your data to another service</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 7: Contact Us */}
            <section id="contact-us" className="scroll-mt-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <FaEnvelope className="h-6 w-6 text-yellow-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">7. Contact Us</h2>
              </div>
              <div className="space-y-4 ml-12">
                <div className="bg-yellow-50 rounded-lg p-4">
                  <p className="text-gray-700 mb-4">
                    If you have any questions about this Privacy Policy or want to exercise your rights, please contact us:
                  </p>
                  <div className="space-y-2 text-sm">
                    <p><strong>Email:</strong> privacy@solutil.com</p>
                    <p><strong>Phone:</strong> +254 700 000 000</p>
                    <p><strong>Address:</strong> Nairobi, Kenya</p>
                  </div>
                </div>
              </div>
            </section>

          </div>

          {/* Footer Section */}
          <div className="bg-gray-50 px-8 py-6 border-t">
            <div className="text-center">
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  href="/terms"
                  className="inline-flex items-center px-4 py-2 bg-white text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors border border-gray-300"
                >
                  View Terms & Conditions
                </Link>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                >
                  I Understand - Continue to Register
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}