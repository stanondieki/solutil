require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function directUpdate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Find the first provider and update directly
    const provider = await User.findOne({ 
      userType: 'provider', 
      providerStatus: 'approved'
    });
    
    if (provider) {
      console.log(`Found provider: ${provider.name}`);
      
      // Direct update
      const result = await User.updateOne(
        { _id: provider._id },
        { 
          $set: { 
            profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
          }
        }
      );
      
      console.log('Update result:', result);
      
      // Check the update
      const updated = await User.findById(provider._id).select('name profilePicture');
      console.log('After update:', updated);
    }
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

directUpdate();