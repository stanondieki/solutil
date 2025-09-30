const express = require('express');
const { protect, restrictTo } = require('../../middleware/auth');
const User = require('../../models/User');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// @desc    Get all documents for a provider (listing)
// @route   GET /api/admin/providers/:providerId/documents
// @access  Private (Admin only)
router.get('/providers/:providerId/documents', 
  protect, 
  restrictTo('admin'), 
  catchAsync(async (req, res, next) => {
    const { providerId } = req.params;
    
    // Find the provider
    const provider = await User.findById(providerId);
    if (!provider || provider.userType !== 'provider') {
      return next(new AppError('Provider not found', 404));
    }

    // Get provider documents
    const documents = provider.providerDocuments || {};
    
    // Helper function to get document URL (prioritize Cloudinary URLs)
    const getDocumentUrl = (doc) => {
      if (!doc) return '';
      // Prioritize secure_url (Cloudinary) over local url
      return doc.secure_url || doc.url || '';
    };
    
    // Format response to match frontend expectations
    const documentSummary = {
      nationalId: {
        uploaded: !!documents.nationalId,
        filename: documents.nationalId?.originalName || documents.nationalId?.public_id || '',
        uploadDate: documents.nationalId?.uploaded,
        url: getDocumentUrl(documents.nationalId),
        verified: documents.nationalId?.verified || false
      },
      businessLicense: {
        uploaded: !!documents.businessLicense,
        filename: documents.businessLicense?.originalName || documents.businessLicense?.public_id || '',
        uploadDate: documents.businessLicense?.uploaded,
        url: getDocumentUrl(documents.businessLicense),
        verified: documents.businessLicense?.verified || false
      },
      certificate: {
        uploaded: !!documents.certificate,
        filename: documents.certificate?.originalName || documents.certificate?.public_id || '',
        uploadDate: documents.certificate?.uploaded,
        url: getDocumentUrl(documents.certificate),
        verified: documents.certificate?.verified || false
      },
      goodConductCertificate: {
        uploaded: !!documents.goodConductCertificate,
        filename: documents.goodConductCertificate?.originalName || documents.goodConductCertificate?.public_id || '',
        uploadDate: documents.goodConductCertificate?.uploaded,
        url: getDocumentUrl(documents.goodConductCertificate),
        verified: documents.goodConductCertificate?.verified || false
      },
      portfolio: {
        count: documents.portfolio ? documents.portfolio.length : 0,
        items: documents.portfolio ? documents.portfolio.map(item => ({
          ...item,
          url: getDocumentUrl(item),
          verified: item.verified || false
        })) : []
      }
    };

    res.status(200).json({
      status: 'success',
      data: {
        providerId: provider._id,
        providerName: provider.fullName || provider.name,
        documents: documentSummary
      }
    });
  })
);

// @desc    Get provider document for viewing by admin
// @route   GET /api/admin/providers/:providerId/documents/:documentType/view
// @access  Private (Admin only)
router.get('/providers/:providerId/documents/:documentType/view', 
  protect, 
  restrictTo('admin'), 
  catchAsync(async (req, res, next) => {
    const { providerId, documentType } = req.params;
    
    // Validate document type
    const allowedDocTypes = ['nationalId', 'businessLicense', 'certificate', 'goodConductCertificate', 'portfolio'];
    if (!allowedDocTypes.includes(documentType)) {
      return next(new AppError('Invalid document type', 400));
    }

    // Find the provider
    const provider = await User.findById(providerId);
    if (!provider) {
      return next(new AppError('Provider not found', 404));
    }

    if (provider.userType !== 'provider') {
      return next(new AppError('User is not a provider', 400));
    }

    // Get document info
    const document = provider.providerDocuments?.[documentType];
    if (!document) {
      return next(new AppError('Document not found', 404));
    }

    // Helper function to get document URL (prioritize Cloudinary URLs)
    const getDocumentUrl = (doc) => {
      if (!doc) return '';
      // Prioritize secure_url (Cloudinary) over local url
      return doc.secure_url || doc.url || '';
    };

    const documentUrl = getDocumentUrl(document);
    if (!documentUrl) {
      return next(new AppError('Document URL not available', 404));
    }

    // For portfolio items, handle array
    if (documentType === 'portfolio' && Array.isArray(document)) {
      return res.status(200).json({
        status: 'success',
        data: {
          documents: document.map(item => ({
            url: getDocumentUrl(item),
            uploaded: item.uploaded,
            verified: item.verified || false,
            filename: item.originalName || item.public_id,
            public_id: item.public_id
          }))
        }
      });
    }

    // Return document info for direct viewing
    res.status(200).json({
      status: 'success',
      data: {
        document: {
          url: documentUrl,
          uploaded: document.uploaded,
          verified: document.verified || false,
          filename: document.originalName || document.public_id,
          public_id: document.public_id,
          provider: {
            id: provider._id,
            name: provider.name,
            email: provider.email
          }
        }
      }
    });
  })
);

// @desc    Stream document file securely
// @route   GET /api/admin/documents/stream/:providerId/:documentType
// @access  Private (Admin only)
router.get('/documents/stream/:providerId/:documentType',
  protect,
  restrictTo('admin'),
  catchAsync(async (req, res, next) => {
    const { providerId, documentType } = req.params;
    const { index } = req.query; // For portfolio items

    // Find provider and document
    const provider = await User.findById(providerId);
    if (!provider || provider.userType !== 'provider') {
      return next(new AppError('Provider not found', 404));
    }

    let document;
    if (documentType === 'portfolio' && index !== undefined) {
      const portfolioItems = provider.providerDocuments?.portfolio;
      if (!portfolioItems || !portfolioItems[index]) {
        return next(new AppError('Portfolio item not found', 404));
      }
      document = portfolioItems[index];
    } else {
      document = provider.providerDocuments?.[documentType];
    }

    if (!document || !document.url) {
      return next(new AppError('Document not found', 404));
    }

    // Check if file exists
    const filename = document.public_id || document.url.split('/').pop();
    const filePath = path.join(__dirname, '../uploads/documents', filename);

    if (!fs.existsSync(filePath)) {
      return next(new AppError('Document file not found on server', 404));
    }

    // Get file stats for proper headers
    const stats = fs.statSync(filePath);
    const ext = path.extname(filename).toLowerCase();

    // Set proper content type
    let contentType = 'application/octet-stream';
    if (['.jpg', '.jpeg'].includes(ext)) contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.pdf') contentType = 'application/pdf';

    // Set headers for secure viewing
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on('error', (error) => {
      console.error('File stream error:', error);
      if (!res.headersSent) {
        return next(new AppError('Error reading document file', 500));
      }
    });
  })
);

// @desc    Get all provider documents summary
// @route   GET /api/admin/providers/:providerId/documents
// @access  Private (Admin only)
router.get('/providers/:providerId/documents',
  protect,
  restrictTo('admin'),
  catchAsync(async (req, res, next) => {
    const { providerId } = req.params;

    const provider = await User.findById(providerId);
    if (!provider || provider.userType !== 'provider') {
      return next(new AppError('Provider not found', 404));
    }

    const documents = provider.providerDocuments || {};
    const documentSummary = {
      nationalId: {
        uploaded: !!documents.nationalId?.url,
        verified: documents.nationalId?.verified || false,
        uploadedAt: documents.nationalId?.uploaded
      },
      businessLicense: {
        uploaded: !!documents.businessLicense?.url,
        verified: documents.businessLicense?.verified || false,
        uploadedAt: documents.businessLicense?.uploaded
      },
      certificate: {
        uploaded: !!documents.certificate?.url,
        verified: documents.certificate?.verified || false,
        uploadedAt: documents.certificate?.uploaded
      },
      goodConductCertificate: {
        uploaded: !!documents.goodConductCertificate?.url,
        verified: documents.goodConductCertificate?.verified || false,
        uploadedAt: documents.goodConductCertificate?.uploaded
      },
      portfolio: {
        count: Array.isArray(documents.portfolio) ? documents.portfolio.length : 0,
        items: Array.isArray(documents.portfolio) ? documents.portfolio.map((item, index) => ({
          index,
          uploaded: !!item.url,
          verified: item.verified || false,
          uploadedAt: item.uploaded
        })) : []
      }
    };

    res.status(200).json({
      status: 'success',
      data: {
        provider: {
          id: provider._id,
          name: provider.name,
          email: provider.email,
          providerStatus: provider.providerStatus
        },
        documents: documentSummary
      }
    });
  })
);

module.exports = router;