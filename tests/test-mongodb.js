const mongoose = require('mongoose');
require('dotenv').config();

async function testMongoConnection() {
  try {
    console.log('🧪 Testing MongoDB Atlas connection...');
    console.log('URI:', process.env.MONGODB_URI ? 'Set ✅' : 'Missing ❌');
    
    // Connect to MongoDB Atlas
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Successfully connected to MongoDB Atlas!');
    
    // Test database operations
    const stats = await mongoose.connection.db.stats();
    console.log('📊 Database Stats:');
    console.log('- Database:', mongoose.connection.db.databaseName);
    console.log('- Collections:', stats.collections);
    console.log('- Data Size:', Math.round(stats.dataSize / 1024), 'KB');
    console.log('- Storage Size:', Math.round(stats.storageSize / 1024), 'KB');
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 Collections:', collections.map(c => c.name).join(', ') || 'None yet');
    
    console.log('🎉 MongoDB Atlas is working perfectly!');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.log('💡 Fix: Check your username/password in the connection string');
    } else if (error.message.includes('IP')) {
      console.log('💡 Fix: Add your IP address to MongoDB Atlas Network Access');
    }
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

testMongoConnection();