const mongoose = require('mongoose');
require('dotenv').config();

// User model (simplified for testing)
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  userType: String,
  providerStatus: String,
  providerProfile: mongoose.Schema.Types.Mixed
});
const User = mongoose.model('User', userSchema);

async function debugProvider() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check a specific provider
    const providerId = '68e4fcf48e248b993e547633';
    const provider = await User.findById(providerId);
    
    console.log('Provider data:');
    console.log('ID:', provider._id);
    console.log('Name:', provider.name);
    console.log('UserType:', provider.userType);
    console.log('ProviderStatus:', provider.providerStatus);
    console.log('Has providerProfile:', !!provider.providerProfile);
    
    // Check conditions
    console.log('\nCondition checks:');
    console.log('Provider exists:', !!provider);
    console.log('Is provider type:', provider.userType === 'provider');
    console.log('Is approved:', provider.providerStatus === 'approved');
    console.log('Should pass all checks:', 
      !!provider && 
      provider.userType === 'provider' && 
      provider.providerStatus === 'approved'
    );

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

debugProvider();