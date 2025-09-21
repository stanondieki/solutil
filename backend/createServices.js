const mongoose = require('mongoose');
const Service = require('./models/Service');

mongoose.connect('mongodb+srv://stanondieki:vKWmR5PGTkXCDqhe@cluster0.w1ryhxw.mongodb.net/solutil-dev?retryWrites=true&w=majority');

async function createServices() {
  try {
    // Check if services already exist
    const existingServices = await Service.find({});
    console.log('Existing services count:', existingServices.length);

    if (existingServices.length > 0) {
      console.log('Services already exist:');
      existingServices.forEach(service => {
        console.log(`- ${service.name} (ID: ${service._id})`);
      });
      return;
    }

    // Create basic services
    const services = [
      {
        name: 'Plumbing Services',
        category: 'plumbing',
        description: 'Professional plumbing services for your home',
        basePrice: 2500,
        priceType: 'fixed',
        isActive: true
      },
      {
        name: 'Electrical Services', 
        category: 'electrical',
        description: 'Licensed electrical work and repairs',
        basePrice: 3000,
        priceType: 'fixed',
        isActive: true
      },
      {
        name: 'Cleaning Services',
        category: 'cleaning', 
        description: 'Professional cleaning for homes and offices',
        basePrice: 2000,
        priceType: 'fixed',
        isActive: true
      },
      {
        name: 'Carpentry Services',
        category: 'carpentry',
        description: 'Custom woodwork and furniture repairs',
        basePrice: 3500,
        priceType: 'fixed',
        isActive: true
      },
      {
        name: 'Painting Services',
        category: 'painting',
        description: 'Interior and exterior painting services',
        basePrice: 2800,
        priceType: 'fixed',
        isActive: true
      }
    ];

    const createdServices = await Service.insertMany(services);
    console.log('Services created successfully:');
    createdServices.forEach(service => {
      console.log(`- ${service.name} (ID: ${service._id})`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

createServices();
