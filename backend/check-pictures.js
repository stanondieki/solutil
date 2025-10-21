require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function checkPictures() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const providersWithPictures = await User.find({ 
      userType: 'provider', 
      providerStatus: 'approved',
      profilePicture: { $exists: true, $ne: null, $ne: '' }
    }).select('name profilePicture');
    
    console.log(`Found ${providersWithPictures.length} providers with pictures:`);
    providersWithPictures.forEach(p => {
      console.log(`  ${p.name}: ${p.profilePicture}`);
    });
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkPictures();