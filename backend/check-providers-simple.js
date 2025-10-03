const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkProviders() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get all providers
    const allProviders = await User.find({ userType: 'provider' })
      .select('name email providerStatus createdAt')
      .sort({ createdAt: -1 });
    
    console.log(`📊 Total providers: ${allProviders.length}`);
    
    // Group by status
    const byStatus = {};
    allProviders.forEach(p => {
      const status = p.providerStatus || 'undefined';
      byStatus[status] = (byStatus[status] || 0) + 1;
    });
    
    console.log('\n📈 By Status:');
    Object.entries(byStatus).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });
    
    // Show approved providers
    const approved = allProviders.filter(p => p.providerStatus === 'approved');
    console.log(`\n✅ Approved providers (${approved.length}):`);
    approved.forEach((p, i) => {
      console.log(`  ${i+1}. ${p.name} (${p.email})`);
    });
    
    // Show all providers with status
    console.log(`\n📋 All providers:`);
    allProviders.forEach((p, i) => {
      console.log(`  ${i+1}. ${p.name} - Status: ${p.providerStatus || 'undefined'}`);
    });
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkProviders();