const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

// Ensure uploads directory exists
const ensureUploadsDir = async () => {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  const documentsDir = path.join(uploadsDir, 'documents');
  const profilesDir = path.join(uploadsDir, 'profiles');
  
  try {
    await fs.access(uploadsDir);
  } catch {
    await fs.mkdir(uploadsDir, { recursive: true });
  }
  
  try {
    await fs.access(documentsDir);
  } catch {
    await fs.mkdir(documentsDir, { recursive: true });
  }
  
  try {
    await fs.access(profilesDir);
  } catch {
    await fs.mkdir(profilesDir, { recursive: true });
  }
};

// Initialize upload directories
ensureUploadsDir().catch(console.error);

// Storage configuration for local uploads
const createLocalStorage = (folder) => {
  return multer.diskStorage({
    destination: async (req, file, cb) => {
      const uploadPath = path.join(__dirname, '..', 'uploads', folder);
      try {
        await fs.access(uploadPath);
      } catch {
        await fs.mkdir(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      // Generate unique filename
      const timestamp = Date.now();
      const randomString = crypto.randomBytes(6).toString('hex');
      const docType = req.body?.documentType || (folder === 'profiles' ? 'profile' : 'upload');
      const userId = req.user?._id || 'unknown';
      const extension = path.extname(file.originalname);
      
      const filename = `${folder}_${userId}_${docType}_${timestamp}_${randomString}${extension}`;
      cb(null, filename);
    }
  });
};

// File filter function
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, WEBP images and PDF files are allowed.'), false);
  }
};

// Create upload middleware for different types
const createUploadMiddleware = (folder, limits = {}) => {
  return multer({
    storage: createLocalStorage(folder),
    fileFilter,
    limits: {
      fileSize: limits.maxFileSize || 5 * 1024 * 1024, // 5MB default
      ...limits
    }
  });
};

// Upload middleware configurations
const uploadMiddleware = {
  // Provider documents
  providerDocuments: createUploadMiddleware('documents').single('document'),
  
  // Profile pictures
  profilePicture: createUploadMiddleware('profiles', { 
    maxFileSize: 3 * 1024 * 1024 // 3MB for profile pictures
  }).single('profilePicture'),
  
  // Service images (multiple)
  serviceImages: createUploadMiddleware('services', {
    maxFileSize: 2 * 1024 * 1024 // 2MB per service image
  }).array('serviceImages', 5),
  
  // Portfolio images
  portfolioImages: createUploadMiddleware('portfolio', {
    maxFileSize: 2 * 1024 * 1024
  }).array('portfolioImages', 10)
};

// Helper function to get file URL for local uploads
const getFileUrl = (req, filename) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/uploads/${filename}`;
};

// Helper function to transform req.file to match Cloudinary format
const transformFileData = (req, file) => {
  if (!file) return null;
  
  const fileUrl = getFileUrl(req, file.filename);
  
  return {
    ...file,
    path: fileUrl, // URL to access the file
    filename: file.filename, // Public ID equivalent
    secure_url: fileUrl,
    public_id: file.filename,
    url: fileUrl
  };
};

module.exports = {
  uploadMiddleware,
  getFileUrl,
  transformFileData,
  ensureUploadsDir
};