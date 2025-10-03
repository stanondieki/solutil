const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const ProviderService = require('./models/ProviderService');
const User = require('./models/User');

const checkProvidersAndServices = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://stano:stano123@cluster0.euu4w.mongodb.net/solutil?retryWrites=true&w=majority';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    console.log('\n🔍 CHECKING PROVIDERS AND SERVICES');
    console.log('=' .repeat(60));

    // 1. Check total providers
    const totalProviders = await User.countDocuments({ userType: 'provider' });
    console.log(`\n📊 Total Providers: ${totalProviders}`);

    // 2. Check approved providers
    const approvedProviders = await User.countDocuments({ 
      userType: 'provider', 
      providerStatus: 'approved' 
    });
    console.log(`✅ Approved Providers: ${approvedProviders}`);

    // 3. Check active providers (with active services)
    const activeServices = await ProviderService.countDocuments({ isActive: true });
    console.log(`🔧 Active Services: ${activeServices}`);

    // 4. Get sample approved providers
    console.log('\n👥 SAMPLE APPROVED PROVIDERS:');
    console.log('-' .repeat(40));
    const sampleProviders = await User.find({ 
      userType: 'provider', 
      providerStatus: 'approved' 
    }).limit(3).select('name email providerProfile.businessName providerProfile.rating');

    sampleProviders.forEach((provider, index) => {
      console.log(`${index + 1}. ${provider.name}`);
      console.log(`   Email: ${provider.email}`);
      console.log(`   Business: ${provider.providerProfile?.businessName || 'N/A'}`);
      console.log(`   Rating: ${provider.providerProfile?.rating || 'N/A'}`);
      console.log('');
    });

    // 5. Get sample active services with provider info
    console.log('\n🔧 ACTIVE SERVICES WITH PROVIDERS:');
    console.log('-' .repeat(40));
    const sampleServices = await ProviderService.find({ isActive: true })
      .populate('providerId', 'name email providerProfile.businessName providerProfile.rating')
      .limit(3)
      .select('title category price providerId');

    sampleServices.forEach((service, index) => {
      console.log(`${index + 1}. ${service.title} (${service.category})`);
      console.log(`   Price: KES ${service.price}`);
      console.log(`   Provider: ${service.providerId?.name || 'Unknown'}`);
      console.log(`   Business: ${service.providerId?.providerProfile?.businessName || 'N/A'}`);
      console.log(`   Provider ID: ${service.providerId?._id || 'N/A'}`);
      console.log('');
    });

    // 6. Test the actual API call structure
    console.log('\n🧪 TESTING API STRUCTURE:');
    console.log('-' .repeat(40));
    const apiTestServices = await ProviderService.find({ isActive: true })
      .populate('providerId', 'name email phone providerProfile')
      .limit(3);

    console.log(`API would return ${apiTestServices.length} services`);
    
    if (apiTestServices.length > 0) {
      console.log('\nFirst service API structure:');
      const firstService = apiTestServices[0];
      console.log(JSON.stringify({
        _id: firstService._id,
        title: firstService.title,
        category: firstService.category,
        price: firstService.price,
        providerId: firstService.providerId
      }, null, 2));
    }

    // 7. Check for providers without active services
    const providersWithServices = await ProviderService.distinct('providerId', { isActive: true });
    const providersWithoutServices = await User.find({
      userType: 'provider',
      providerStatus: 'approved',
      _id: { $nin: providersWithServices }
    }).select('name email');

    console.log(`\n⚠️  Approved providers without active services: ${providersWithoutServices.length}`);
    providersWithoutServices.forEach((provider, index) => {
      console.log(`${index + 1}. ${provider.name} (${provider.email})`);
    });

    console.log('\n🎯 RECOMMENDATIONS:');
    console.log('=' .repeat(60));
    if (activeServices === 0) {
      console.log('❌ No active services found - this is why dashboard shows no providers');
      console.log('💡 Solution: Make sure providers have created and activated services');
    } else if (approvedProviders === 0) {
      console.log('❌ No approved providers - approve some providers first');
    } else {
      console.log('✅ Data looks good - check API endpoint and data mapping logic');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.connection.close();
  }
};

checkProvidersAndServices();