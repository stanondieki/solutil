const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkFullProviderData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get the Orangi provider with ALL fields
    const provider = await User.findOne({ 
      email: '39839125o@gmail.com'
    });
    
    if (provider) {
      console.log('🔍 Full provider data for Orangi:\n');
      console.log(JSON.stringify(provider, null, 2));
    } else {
      console.log('❌ Provider not found');
    }
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkFullProviderData();