// Debug script to check what the provider-services API returns
const fetch = require('node-fetch'); // You might need: npm install node-fetch

const testProviderServicesAPI = async () => {
  try {
    const BACKEND_URL = 'https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net';
    const response = await fetch(`${BACKEND_URL}/api/provider-services/public?limit=3`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('=== FULL API RESPONSE ===');
      console.log(JSON.stringify(data, null, 2));
      
      console.log('\n=== SERVICES ARRAY ===');
      const services = data.data?.services || [];
      console.log(`Found ${services.length} services`);
      
      if (services.length > 0) {
        console.log('\n=== FIRST SERVICE EXAMPLE ===');
        console.log(JSON.stringify(services[0], null, 2));
        
        console.log('\n=== PROVIDER ID STRUCTURE ===');
        console.log(JSON.stringify(services[0].providerId, null, 2));
        
        console.log('\n=== EXTRACTED PROVIDERS ===');
        const uniqueProviders = services.reduce((acc, service) => {
          if (service.providerId && !acc.find(p => p._id === service.providerId._id)) {
            acc.push(service.providerId);
          }
          return acc;
        }, []);
        
        console.log(`Extracted ${uniqueProviders.length} unique providers`);
        uniqueProviders.forEach((provider, index) => {
          console.log(`\nProvider ${index + 1}:`);
          console.log(`  ID: ${provider._id}`);
          console.log(`  Name: ${provider.name}`);
          console.log(`  Email: ${provider.email}`);
          console.log(`  Has providerProfile: ${!!provider.providerProfile}`);
          if (provider.providerProfile) {
            console.log(`  Business Name: ${provider.providerProfile.businessName}`);
            console.log(`  Rating: ${provider.providerProfile.rating}`);
            console.log(`  Hourly Rate: ${provider.providerProfile.hourlyRate}`);
          }
        });
      }
    } else {
      console.error('API Error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error response:', errorText);
    }
  } catch (error) {
    console.error('Network Error:', error.message);
  }
};

testProviderServicesAPI();