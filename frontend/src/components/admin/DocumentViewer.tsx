'use client'

import React, { useState, useEffect } from 'react'
import { 
  FaEye, 
  FaDownload, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaSpinner,
  FaFileAlt,
  FaIdCard,
  FaCertificate,
  FaShieldAlt,
  FaImages
} from 'react-icons/fa'

interface Document {
  uploaded: boolean
  verified: boolean
  uploadedAt?: string
}

interface PortfolioItem {
  index: number
  uploaded: boolean
  verified: boolean
  uploadedAt?: string
}

interface DocumentSummary {
  nationalId: Document
  businessLicense: Document
  certificate: Document
  goodConductCertificate: Document
  portfolio: {
    count: number
    items: PortfolioItem[]
  }
}

interface Provider {
  id: string
  name: string
  email: string
  providerStatus: string
}

interface DocumentViewerProps {
  providerId: string
  onClose: () => void
}

interface DocumentViewerModalProps {
  isOpen: boolean
  onClose: () => void
  documentUrl: string
  documentType: string
  filename?: string
}

const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  isOpen,
  onClose,
  documentUrl,
  documentType,
  filename
}) => {
  if (!isOpen) return null

  const isImage = filename?.match(/\.(jpg|jpeg|png|gif)$/i)
  const isPdf = filename?.match(/\.pdf$/i)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">
            {documentType.charAt(0).toUpperCase() + documentType.slice(1)} Document
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            ×
          </button>
        </div>

        {/* Document Content */}
        <div className="flex-1 p-4 overflow-auto">
          {isImage ? (
            <img
              src={documentUrl}
              alt={`${documentType} document`}
              className="max-w-full h-auto mx-auto"
            />
          ) : isPdf ? (
            <iframe
              src={documentUrl}
              className="w-full h-96 border"
              title={`${documentType} document`}
            />
          ) : (
            <div className="text-center py-8">
              <FaFileAlt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Preview not available for this file type</p>
              <a
                href={documentUrl}
                download
                className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <FaDownload className="w-4 h-4 mr-2" />
                Download File
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-between">
          <a
            href={documentUrl}
            download
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <FaDownload className="w-4 h-4 mr-2" />
            Download
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ providerId, onClose }) => {
  const [documents, setDocuments] = useState<DocumentSummary | null>(null)
  const [provider, setProvider] = useState<Provider | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedDocument, setSelectedDocument] = useState<{
    type: string
    url: string
    filename?: string
  } | null>(null)

  useEffect(() => {
    fetchDocuments()
  }, [providerId])

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`/api/admin/providers/${providerId}/documents`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch documents')
      }

      const data = await response.json()
      setDocuments(data.data.documents)
      setProvider(data.data.provider)
    } catch (err) {
      setError('Failed to load documents')
      console.error('Error fetching documents:', err)
    } finally {
      setLoading(false)
    }
  }

  const viewDocument = async (documentType: string, portfolioIndex?: number) => {
    try {
      const token = localStorage.getItem('authToken')
      const url = `/api/admin/providers/${providerId}/documents/${documentType}/view`
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to get document info')
      }

      const data = await response.json()
      
      // Create stream URL for actual file viewing
      let streamUrl = `/api/admin/documents/stream/${providerId}/${documentType}`
      if (portfolioIndex !== undefined) {
        streamUrl += `?index=${portfolioIndex}`
      }

      setSelectedDocument({
        type: documentType,
        url: streamUrl,
        filename: data.data.document?.filename || `${documentType}_document`
      })
    } catch (err) {
      console.error('Error viewing document:', err)
      alert('Failed to view document')
    }
  }

  const getDocumentIcon = (docType: string) => {
    switch (docType) {
      case 'nationalId': return FaIdCard
      case 'businessLicense': return FaFileAlt
      case 'certificate': return FaCertificate
      case 'goodConductCertificate': return FaShieldAlt
      case 'portfolio': return FaImages
      default: return FaFileAlt
    }
  }

  const getDocumentTitle = (docType: string) => {
    switch (docType) {
      case 'nationalId': return 'National ID'
      case 'businessLicense': return 'Business License'
      case 'certificate': return 'Professional Certificate'
      case 'goodConductCertificate': return 'Good Conduct Certificate'
      case 'portfolio': return 'Portfolio'
      default: return docType
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
        <div className="bg-white p-8 rounded-lg">
          <FaSpinner className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading documents...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
        <div className="bg-white p-8 rounded-lg max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
        <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full overflow-auto">
          {/* Header */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Provider Documents</h2>
                <p className="text-gray-600">{provider?.name} ({provider?.email})</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                ×
              </button>
            </div>
          </div>

          {/* Documents Grid */}
          <div className="p-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {documents && Object.entries(documents).map(([docType, doc]) => {
                if (docType === 'portfolio') {
                  const portfolioDoc = doc as DocumentSummary['portfolio']
                  return (
                    <div key={docType} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <FaImages className="w-5 h-5 text-purple-600 mr-2" />
                        <h3 className="font-medium text-gray-900">Portfolio ({portfolioDoc.count} items)</h3>
                      </div>
                      
                      {portfolioDoc.items.length > 0 ? (
                        <div className="space-y-2">
                          {portfolioDoc.items.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                              <span className="text-sm">Item {index + 1}</span>
                              <div className="flex items-center space-x-2">
                                {item.verified ? (
                                  <FaCheckCircle className="w-4 h-4 text-green-600" />
                                ) : (
                                  <FaTimesCircle className="w-4 h-4 text-red-600" />
                                )}
                                <button
                                  onClick={() => viewDocument(docType, index)}
                                  className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                  title="View document"
                                >
                                  <FaEye className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No portfolio items uploaded</p>
                      )}
                    </div>
                  )
                }

                const document = doc as Document
                const Icon = getDocumentIcon(docType)
                
                return (
                  <div key={docType} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <Icon className="w-5 h-5 text-blue-600 mr-2" />
                      <h3 className="font-medium text-gray-900">{getDocumentTitle(docType)}</h3>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {document.verified ? (
                          <span className="flex items-center text-sm text-green-600">
                            <FaCheckCircle className="w-4 h-4 mr-1" />
                            Verified
                          </span>
                        ) : document.uploaded ? (
                          <span className="flex items-center text-sm text-yellow-600">
                            <FaTimesCircle className="w-4 h-4 mr-1" />
                            Pending
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">Not uploaded</span>
                        )}
                      </div>
                      
                      {document.uploaded && (
                        <button
                          onClick={() => viewDocument(docType)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                          title="View document"
                        >
                          <FaEye className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    {document.uploadedAt && (
                      <p className="text-xs text-gray-500 mt-2">
                        Uploaded: {new Date(document.uploadedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <DocumentViewerModal
          isOpen={true}
          onClose={() => setSelectedDocument(null)}
          documentUrl={selectedDocument.url}
          documentType={selectedDocument.type}
          filename={selectedDocument.filename}
        />
      )}
    </>
  )
}

export default DocumentViewer