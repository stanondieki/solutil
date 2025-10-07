const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb+srv://solutil:VqFRkqF6S6Q6sI54@solutil.xlxek.mongodb.net/?retryWrites=true&w=majority&appName=solutil');

// Import models
const User = require('./backend/models/User');
const Provider = require('./backend/models/Provider');

async function checkKemmyProvider() {
  try {
    // Find kemmy user
    const kemmyUser = await User.findById('68e4fcf48e248b993e547633');
    console.log('Kemmy user:', kemmyUser ? kemmyUser.name : 'Not found');
    
    // Find kemmy's provider record
    const kemmyProvider = await Provider.findOne({ user: '68e4fcf48e248b993e547633' });
    console.log('Kemmy provider record:', kemmyProvider ? kemmyProvider._id : 'Not found');
    
    if (!kemmyProvider && kemmyUser) {
      console.log('Need to create Provider record for kemmy');
    }
    
    process.exit();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkKemmyProvider();