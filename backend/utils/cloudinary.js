const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create storage configurations for different types of uploads
const createCloudinaryStorage = (folder, transformation = {}, allowedFormats = ['jpg', 'jpeg', 'png', 'webp', 'gif']) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: `solutil/${folder}`,
      allowed_formats: allowedFormats,
      transformation: [
        {
          quality: 'auto:good',
          fetch_format: 'auto',
          ...transformation
        }
      ],
      public_id: (req, file) => {
        // Generate unique filename with document type for documents
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const docType = req.body?.documentType || 'document';
        const userId = req.user?._id || 'unknown';
        return `${folder}_${userId}_${docType}_${timestamp}_${randomString}`;
      }
    },
  });
};

// Storage configurations for different image types
const storageConfigs = {
  // Provider profile pictures
  profilePictures: createCloudinaryStorage('profiles', {
    width: 400,
    height: 400,
    crop: 'fill',
    gravity: 'face'
  }),

  // Service images
  serviceImages: createCloudinaryStorage('services', {
    width: 800,
    height: 600,
    crop: 'fill'
  }),

  // Document uploads (certificates, licenses) - supports PDFs and images
  documents: createCloudinaryStorage('documents', {
    width: 1200,
    quality: 'auto:best'
  }, ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf']),

  // General uploads
  general: createCloudinaryStorage('uploads')
};

// Create multer instances for different upload types
const createUploadMiddleware = (storageType, fieldName = 'image', maxCount = 1, allowPDF = false) => {
  const storage = storageConfigs[storageType];
  
  const fileFilter = (req, file, cb) => {
    // Check file type based on storage type
    if (storageType === 'documents') {
      // Allow images and PDFs for documents
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only image files (JPG, PNG, WEBP) and PDF files are allowed for documents!'), false);
      }
    } else if (allowPDF) {
      // Allow both images and PDFs
      if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Only image and PDF files are allowed!'), false);
      }
    } else {
      // Only images
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'), false);
      }
    }
  };
  
  if (maxCount === 1) {
    return multer({ 
      storage,
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
      fileFilter
    }).single(fieldName);
  } else {
    return multer({ 
      storage,
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB per file
      },
      fileFilter
    }).array(fieldName, maxCount);
  }
};

// Upload middlewares
const uploadMiddleware = {
  profilePicture: createUploadMiddleware('profilePictures', 'profilePicture'),
  serviceImages: createUploadMiddleware('serviceImages', 'images', 5),
  singleServiceImage: createUploadMiddleware('serviceImages', 'image'),
  documents: createUploadMiddleware('documents', 'document'), // Supports PDFs and images
  providerDocuments: createUploadMiddleware('documents', 'document'), // For provider document uploads
  general: createUploadMiddleware('general', 'file')
};

// Helper functions
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

const getOptimizedImageUrl = (publicId, transformation = {}) => {
  return cloudinary.url(publicId, {
    quality: 'auto',
    fetch_format: 'auto',
    ...transformation
  });
};

// Transform image URLs for different sizes
const getImageVariants = (publicId) => {
  return {
    original: cloudinary.url(publicId, { quality: 'auto', fetch_format: 'auto' }),
    thumbnail: cloudinary.url(publicId, { 
      width: 150, 
      height: 150, 
      crop: 'fill', 
      quality: 'auto', 
      fetch_format: 'auto' 
    }),
    medium: cloudinary.url(publicId, { 
      width: 400, 
      height: 300, 
      crop: 'fill', 
      quality: 'auto', 
      fetch_format: 'auto' 
    }),
    large: cloudinary.url(publicId, { 
      width: 800, 
      height: 600, 
      crop: 'fill', 
      quality: 'auto', 
      fetch_format: 'auto' 
    })
  };
};

module.exports = {
  cloudinary,
  uploadMiddleware,
  deleteFromCloudinary,
  getOptimizedImageUrl,
  getImageVariants,
  storageConfigs
};