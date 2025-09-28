'use client'

import React from 'react'
import Link from 'next/link'
import { 
  FaArrowLeft, 
  FaShieldAlt, 
  FaUserShield, 
  FaLock, 
  FaHome, 
  FaHandsHelping, 
  FaCreditCard, 
  FaComments, 
  FaExclamationTriangle,
  FaFileContract,
  FaPrint,
  FaDownload
} from 'react-icons/fa'

export default function TermsPage() {
  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // Create a simple text version for download
    const content = document.getElementById('terms-content')?.innerText || ''
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'solutil-terms-conditions.txt'
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
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
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
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-12 text-white">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <FaFileContract className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Terms & Conditions</h1>
                <p className="text-blue-100 text-lg mt-2">Solutil Client Protection Agreement</p>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 mt-6">
              <p className="text-sm text-blue-100">
                <strong>Last Updated:</strong> September 23, 2025
              </p>
              <p className="text-sm text-blue-100 mt-1">
                <strong>Effective Date:</strong> September 23, 2025
              </p>
            </div>
          </div>

          {/* Table of Contents */}
          <div className="px-8 py-6 bg-gray-50 border-b">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Table of Contents</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { id: 'service-guarantee', title: '1. Service Guarantee', icon: FaShieldAlt },
                { id: 'privacy-confidentiality', title: '2. Privacy & Confidentiality', icon: FaLock },
                { id: 'property-protection', title: '3. Property Protection', icon: FaHome },
                { id: 'safety-assurance', title: '4. Safety Assurance', icon: FaUserShield },
                { id: 'payments-transactions', title: '5. Payments & Transactions', icon: FaCreditCard },
                { id: 'complaints-resolution', title: '6. Complaints & Resolution', icon: FaComments },
                { id: 'limitation-liability', title: '7. Limitation of Liability', icon: FaExclamationTriangle },
                { id: 'agreement-acknowledgment', title: '8. Agreement & Acknowledgment', icon: FaHandsHelping }
              ].map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="flex items-center space-x-3 p-3 text-sm text-gray-700 hover:text-blue-600 hover:bg-white rounded-lg transition-all"
                >
                  <item.icon className="h-4 w-4 text-blue-500" />
                  <span>{item.title}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Terms Content */}
          <div id="terms-content" className="px-8 py-8 space-y-12">
            
            {/* Introduction */}
            <div className="prose max-w-none">
              <p className="text-lg text-gray-700 leading-relaxed">
                This Agreement sets out the terms of protection offered to clients ("Client") who engage services through the Solutil platform ("Company").
              </p>
            </div>

            {/* Section 1: Service Guarantee */}
            <section id="service-guarantee" className="scroll-mt-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <FaShieldAlt className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">1. Service Guarantee</h2>
              </div>
              <div className="space-y-4 ml-12">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-gray-700"><strong>1.1</strong> Solutil ensures that all workers have undergone background checks and verification before being assigned to clients.</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-gray-700"><strong>1.2</strong> Workers are trained to uphold professional standards, respect, and confidentiality.</p>
                </div>
              </div>
            </section>

            {/* Section 2: Privacy & Confidentiality */}
            <section id="privacy-confidentiality" className="scroll-mt-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-green-100 rounded-xl">
                  <FaLock className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">2. Privacy & Confidentiality</h2>
              </div>
              <div className="space-y-4 ml-12">
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-gray-700"><strong>2.1</strong> All personal and household information shared with Solutil or its workers will remain confidential.</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-gray-700"><strong>2.2</strong> Workers are strictly prohibited from using, sharing, or disclosing any client information for personal gain.</p>
                </div>
              </div>
            </section>

            {/* Section 3: Property Protection */}
            <section id="property-protection" className="scroll-mt-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <FaHome className="h-6 w-6 text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">3. Property Protection</h2>
              </div>
              <div className="space-y-4 ml-12">
                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-gray-700"><strong>3.1</strong> Clients' homes, belongings, and valuables are to be respected and protected at all times.</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-gray-700"><strong>3.2</strong> In the event of theft, damage, or misconduct by a worker, Solutil will investigate promptly.</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-gray-700"><strong>3.3</strong> Solutil will cooperate with law enforcement authorities where necessary.</p>
                </div>
              </div>
            </section>

            {/* Section 4: Safety Assurance */}
            <section id="safety-assurance" className="scroll-mt-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <FaUserShield className="h-6 w-6 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">4. Safety Assurance</h2>
              </div>
              <div className="space-y-4 ml-12">
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-gray-700"><strong>4.1</strong> Solutil screens all workers through reference checks and identification verification.</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-gray-700"><strong>4.2</strong> Workers must remain professional and avoid any form of harassment, misconduct, or abuse.</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-gray-700"><strong>4.3</strong> Clients have the right to request replacement of a worker at any time if they feel unsafe.</p>
                </div>
              </div>
            </section>

            {/* Section 5: Payments & Transactions */}
            <section id="payments-transactions" className="scroll-mt-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-indigo-100 rounded-xl">
                  <FaCreditCard className="h-6 w-6 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">5. Payments & Transactions</h2>
              </div>
              <div className="space-y-4 ml-12">
                <div className="bg-indigo-50 rounded-lg p-4">
                  <p className="text-gray-700"><strong>5.1</strong> All payments must be made through the official Solutil platform or authorized channels only.</p>
                </div>
                <div className="bg-indigo-50 rounded-lg p-4">
                  <p className="text-gray-700"><strong>5.2</strong> Clients are advised not to pay workers directly in cash unless authorized by Solutil.</p>
                </div>
                <div className="bg-indigo-50 rounded-lg p-4">
                  <p className="text-gray-700"><strong>5.3</strong> This protects clients from fraud and ensures service accountability.</p>
                </div>
              </div>
            </section>

            {/* Section 6: Complaints & Resolution */}
            <section id="complaints-resolution" className="scroll-mt-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-teal-100 rounded-xl">
                  <FaComments className="h-6 w-6 text-teal-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">6. Complaints & Resolution</h2>
              </div>
              <div className="space-y-4 ml-12">
                <div className="bg-teal-50 rounded-lg p-4">
                  <p className="text-gray-700"><strong>6.1</strong> Any complaints regarding service delivery, safety, or misconduct must be reported to Solutil immediately.</p>
                </div>
                <div className="bg-teal-50 rounded-lg p-4">
                  <p className="text-gray-700"><strong>6.2</strong> Solutil will resolve client complaints promptly, fairly, and transparently.</p>
                </div>
                <div className="bg-teal-50 rounded-lg p-4">
                  <p className="text-gray-700"><strong>6.3</strong> If necessary, compensation or service replacement may be considered after investigation.</p>
                </div>
              </div>
            </section>

            {/* Section 7: Limitation of Liability */}
            <section id="limitation-liability" className="scroll-mt-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-red-100 rounded-xl">
                  <FaExclamationTriangle className="h-6 w-6 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">7. Limitation of Liability</h2>
              </div>
              <div className="space-y-4 ml-12">
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-gray-700"><strong>7.1</strong> Solutil will take all reasonable steps to protect clients but cannot be held liable for:</p>
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li>Pre-existing damage or issues not caused by Solutil workers.</li>
                    <li>Losses where the client failed to follow safety or payment guidelines.</li>
                  </ul>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-gray-700"><strong>7.2</strong> Solutil's liability is limited to the extent permitted by Kenyan law.</p>
                </div>
              </div>
            </section>

            {/* Section 8: Agreement & Acknowledgment */}
            <section id="agreement-acknowledgment" className="scroll-mt-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <FaHandsHelping className="h-6 w-6 text-yellow-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">8. Agreement & Acknowledgment</h2>
              </div>
              <div className="space-y-4 ml-12">
                <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-400">
                  <p className="text-gray-700 font-medium">
                    By booking services through Solutil, Clients acknowledge that they have read, understood, and agree to this Client Protection Agreement.
                  </p>
                </div>
              </div>
            </section>

          </div>

          {/* Footer Section */}
          <div className="bg-gray-50 px-8 py-6 border-t">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                If you have any questions about these Terms & Conditions, please contact us at:
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-700">
                <span>📧 legal@solutil.com</span>
                <span>📞 +254 700 000 000</span>
                <span>🏢 Nairobi, Kenya</span>
              </div>
              <div className="mt-6">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  I Accept - Continue to Register
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}