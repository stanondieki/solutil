const mongoose = require('mongoose');
const Service = require('./models/Service');

mongoose.connect('mongodb+srv://stanondieki:vKWmR5PGTkXCDqhe@cluster0.w1ryhxw.mongodb.net/solutil-dev?retryWrites=true&w=majority');

async function listServices() {
  try {
    const services = await Service.find({}).select('_id name category description basePrice');
    console.log('📋 Available Services:');
    console.log('===================');
    services.forEach(service => {
      console.log('ID:', service._id);
      console.log('Name:', service.name);
      console.log('Category:', service.category);
      console.log('Price:', service.basePrice || 'N/A');
      console.log('---');
    });
    console.log('Total services found:', services.length);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

listServices();
