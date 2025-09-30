const mongoose = require('mongoose');
const User = require('./models/User');
const { cloudinary } = require('./utils/cloudinary');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Migrate a single document to Cloudinary
const migrateDocumentToCloudinary = async (localPath, documentType, userId) => {
  try {
    const fullPath = path.join(__dirname, localPath);
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${fullPath}`);
      return null;
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(fullPath, {
      folder: `solutil/documents`,
      public_id: `documents_${userId}_${documentType}_${Date.now()}_migrated`,
      resource_type: 'auto', // Automatically detect file type (image/pdf)
      quality: 'auto:best'
    });

    console.log(`✅ Uploaded ${documentType} for user ${userId} to Cloudinary: ${result.secure_url}`);
    
    return {
      url: result.secure_url,
      secure_url: result.secure_url,
      public_id: result.public_id,
      originalName: path.basename(localPath),
      mimetype: result.format === 'pdf' ? 'application/pdf' : `image/${result.format}`,
      size: result.bytes,
      uploaded: new Date(),
      verified: false // Keep existing verification status
    };
  } catch (error) {
    console.error(`❌ Error uploading ${documentType} for user ${userId}:`, error.message);
    return null;
  }
};

// Main migration function
const migrateDocumentsToCloudinary = async () => {
  try {
    await connectDB();
    
    console.log('🚀 Starting document migration to Cloudinary...');
    
    // Find all providers with documents
    const providers = await User.find({
      userType: 'provider',
      'providerDocuments': { $exists: true, $ne: {} }
    });
    
    console.log(`📋 Found ${providers.length} providers with documents`);
    
    let migratedCount = 0;
    let errorCount = 0;
    
    for (const provider of providers) {
      console.log(`\n👤 Processing provider: ${provider.name} (${provider.email})`);
      
      const documents = provider.providerDocuments || {};
      const documentTypes = ['nationalId', 'businessLicense', 'certificate', 'goodConductCertificate'];
      
      for (const docType of documentTypes) {
        const doc = documents[docType];
        
        if (doc && doc.url && !doc.secure_url) {
          // This is a local file that needs migration
          console.log(`📄 Migrating ${docType}: ${doc.url}`);
          
          const cloudinaryData = await migrateDocumentToCloudinary(doc.url, docType, provider._id);
          
          if (cloudinaryData) {
            // Update database with Cloudinary data, preserving verification status
            const updateField = `providerDocuments.${docType}`;
            await User.findByIdAndUpdate(provider._id, {
              $set: {
                [updateField]: {
                  ...cloudinaryData,
                  verified: doc.verified || false // Preserve existing verification
                }
              }
            });
            
            migratedCount++;
            console.log(`✅ Successfully migrated ${docType} for ${provider.name}`);
          } else {
            errorCount++;
            console.log(`❌ Failed to migrate ${docType} for ${provider.name}`);
          }
        } else if (doc && doc.secure_url) {
          console.log(`⏭️  ${docType} already on Cloudinary: ${doc.secure_url}`);
        } else {
          console.log(`⚠️  ${docType} not uploaded or no URL found`);
        }
      }
      
      // Handle portfolio documents
      if (documents.portfolio && Array.isArray(documents.portfolio)) {
        for (let i = 0; i < documents.portfolio.length; i++) {
          const portfolioItem = documents.portfolio[i];
          
          if (portfolioItem && portfolioItem.url && !portfolioItem.secure_url) {
            console.log(`📄 Migrating portfolio item ${i}: ${portfolioItem.url}`);
            
            const cloudinaryData = await migrateDocumentToCloudinary(
              portfolioItem.url, 
              `portfolio_${i}`, 
              provider._id
            );
            
            if (cloudinaryData) {
              // Update portfolio item
              const updateField = `providerDocuments.portfolio.${i}`;
              await User.findByIdAndUpdate(provider._id, {
                $set: {
                  [updateField]: {
                    ...cloudinaryData,
                    verified: portfolioItem.verified || false
                  }
                }
              });
              
              migratedCount++;
              console.log(`✅ Successfully migrated portfolio item ${i} for ${provider.name}`);
            } else {
              errorCount++;
            }
          }
        }
      }
    }
    
    console.log('\n🎉 Migration completed!');
    console.log(`✅ Successfully migrated: ${migratedCount} documents`);
    console.log(`❌ Failed migrations: ${errorCount} documents`);
    
    if (migratedCount > 0) {
      console.log('\n📋 Next steps:');
      console.log('1. Test document viewing in admin panel');
      console.log('2. Verify all documents are accessible');
      console.log('3. Consider cleaning up old local files after verification');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run migration
if (require.main === module) {
  migrateDocumentsToCloudinary();
}

module.exports = { migrateDocumentsToCloudinary };