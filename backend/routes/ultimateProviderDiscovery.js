const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const User = require('../models/User');
const ProviderService = require('../models/ProviderService');
const logger = require('../utils/logger');

/**
 * ULTIMATE PROVIDER DISCOVERY SYSTEM
 * Multi-level, intelligent provider matching with comprehensive fallbacks
 */

/**
 * @route   POST /api/booking/ultimate-provider-discovery
 * @desc    Ultimate provider discovery with multiple search strategies
 * @access  Private (Client only)
 */
router.post('/ultimate-provider-discovery', protect, roleGuard(['client']), async (req, res) => {
  try {
    const { 
      category,
      location,
      urgency = 'normal',
      budget,
      providersNeeded = 1
    } = req.body;

    console.log('🚀 ULTIMATE PROVIDER DISCOVERY INITIATED');
    console.log(`   Category: ${category?.name || category}`);
    console.log(`   Location: ${location?.area || 'Not specified'}`);
    console.log(`   Providers Needed: ${providersNeeded}`);

    // Validate inputs
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Service category is required'
      });
    }

    const searchCategory = (category.id || category.name || category).toLowerCase();
    
    // Step 1: EXACT SERVICE MATCH (Primary)
    console.log('\n🎯 STEP 1: Exact Service Match...');
    const exactMatches = await findExactServiceMatches(searchCategory, location);
    console.log(`   Found ${exactMatches.length} exact service matches`);

    // Step 2: SKILL-BASED DISCOVERY (Secondary)
    console.log('\n🎯 STEP 2: Skill-Based Discovery...');
    const skillMatches = await findSkillBasedProviders(searchCategory, location);
    console.log(`   Found ${skillMatches.length} skill-based matches`);

    // Step 3: FUZZY CATEGORY MATCHING (Tertiary)
    console.log('\n🎯 STEP 3: Fuzzy Category Matching...');
    const fuzzyMatches = await findFuzzyCategoryMatches(searchCategory, location);
    console.log(`   Found ${fuzzyMatches.length} fuzzy matches`);

    // Step 4: LOCATION EXPANSION (Quaternary)
    console.log('\n🎯 STEP 4: Location Expansion...');
    const expandedMatches = await findWithExpandedLocation(searchCategory);
    console.log(`   Found ${expandedMatches.length} location-expanded matches`);

    // Step 5: DYNAMIC SERVICE CREATION (Ultimate Fallback)
    console.log('\n🎯 STEP 5: Dynamic Service Creation...');
    const dynamicMatches = await createDynamicServices(searchCategory, location);
    console.log(`   Created ${dynamicMatches.length} dynamic services`);

    // Combine and deduplicate results
    console.log('\n🔄 COMBINING AND RANKING RESULTS...');
    const allProviders = combineAndRankProviders([
      { providers: exactMatches, priority: 100, type: 'exact-service' },
      { providers: skillMatches, priority: 80, type: 'skill-based' },
      { providers: fuzzyMatches, priority: 60, type: 'fuzzy-match' },
      { providers: expandedMatches, priority: 40, type: 'location-expanded' },
      { providers: dynamicMatches, priority: 20, type: 'dynamic-service' }
    ]);

    console.log(`\n✅ FINAL RESULTS: ${allProviders.length} providers found`);
    
    // Enhance provider data with additional info
    const enhancedProviders = enhanceProviderData(allProviders, searchCategory);

    return res.status(200).json({
      success: true,
      message: `Found ${enhancedProviders.length} ${category.name || category} providers`,
      data: {
        providers: enhancedProviders.slice(0, Math.max(providersNeeded * 3, 10)),
        totalFound: enhancedProviders.length,
        searchStrategies: {
          exactServices: exactMatches.length,
          skillBased: skillMatches.length,
          fuzzyMatch: fuzzyMatches.length,
          locationExpanded: expandedMatches.length,
          dynamicServices: dynamicMatches.length
        },
        category: searchCategory,
        location: location?.area || 'Any area'
      }
    });

  } catch (error) {
    console.error('❌ Ultimate provider discovery failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Provider discovery failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * STEP 1: Find providers with exact matching services
 */
async function findExactServiceMatches(category, location) {
  try {
    const services = await ProviderService.find({
      $or: [
        { category: new RegExp(`^${category}$`, 'i') },
        { category: new RegExp(category, 'i') },
        { title: new RegExp(category, 'i') }
      ],
      isActive: true
    })
    .populate({
      path: 'providerId',
      match: { 
        userType: 'provider',
        providerStatus: 'approved'
      },
      select: 'name email phone profilePicture providerProfile providerStatus'
    });

    return services
      .filter(service => service.providerId)
      .map(service => ({
        provider: service.providerId,
        service: service,
        matchType: 'exact-service',
        score: calculateProviderScore(service.providerId, service, 100)
      }));
  } catch (error) {
    console.error('Exact service match error:', error);
    return [];
  }
}

/**
 * STEP 2: Find providers based on skills
 */
async function findSkillBasedProviders(category, location) {
  try {
    const categoryKeywords = getCategoryKeywords(category);
    
    const providers = await User.find({
      userType: 'provider',
      providerStatus: 'approved',
      'providerProfile.skills': {
        $in: categoryKeywords.map(keyword => new RegExp(keyword, 'i'))
      }
    }).select('name email phone profilePicture providerProfile providerStatus');

    return providers.map(provider => ({
      provider: provider,
      service: null,
      matchType: 'skill-based',
      score: calculateProviderScore(provider, null, 80),
      needsDynamicService: true,
      suggestedServiceTitle: `${category.charAt(0).toUpperCase() + category.slice(1)} Services`
    }));
  } catch (error) {
    console.error('Skill-based discovery error:', error);
    return [];
  }
}

/**
 * STEP 3: Fuzzy category matching
 */
async function findFuzzyCategoryMatches(category, location) {
  try {
    const fuzzyCategories = getFuzzyCategories(category);
    
    const services = await ProviderService.find({
      category: {
        $in: fuzzyCategories.map(cat => new RegExp(cat, 'i'))
      },
      isActive: true
    })
    .populate({
      path: 'providerId',
      match: { 
        userType: 'provider',
        providerStatus: 'approved'
      },
      select: 'name email phone profilePicture providerProfile providerStatus'
    });

    return services
      .filter(service => service.providerId)
      .map(service => ({
        provider: service.providerId,
        service: service,
        matchType: 'fuzzy-match',
        score: calculateProviderScore(service.providerId, service, 60)
      }));
  } catch (error) {
    console.error('Fuzzy category match error:', error);
    return [];
  }
}

/**
 * STEP 4: Location expansion search
 */
async function findWithExpandedLocation(category) {
  try {
    const categoryKeywords = getCategoryKeywords(category);
    
    const providers = await User.find({
      userType: 'provider',
      providerStatus: 'approved',
      $or: [
        { 'providerProfile.skills': { $in: categoryKeywords.map(k => new RegExp(k, 'i')) } },
        { 'providerProfile.serviceAreas': 'Nairobi' },
        { 'providerProfile.serviceAreas': { $size: 0 } }
      ]
    }).select('name email phone profilePicture providerProfile providerStatus');

    return providers.map(provider => ({
      provider: provider,
      service: null,
      matchType: 'location-expanded',
      score: calculateProviderScore(provider, null, 40),
      needsDynamicService: true,
      suggestedServiceTitle: `${category.charAt(0).toUpperCase() + category.slice(1)} Services`
    }));
  } catch (error) {
    console.error('Location expansion error:', error);
    return [];
  }
}

/**
 * STEP 5: Create dynamic services for providers with relevant skills
 */
async function createDynamicServices(category, location) {
  try {
    const categoryKeywords = getCategoryKeywords(category);
    
    // Find providers with skills but no services in this category
    const skillProviders = await User.find({
      userType: 'provider',
      providerStatus: 'approved',
      'providerProfile.skills': {
        $in: categoryKeywords.map(keyword => new RegExp(keyword, 'i'))
      }
    }).select('name email phone profilePicture providerProfile providerStatus');

    const dynamicMatches = [];

    for (const provider of skillProviders) {
      // Check if provider already has a service in this category
      const existingService = await ProviderService.findOne({
        providerId: provider._id,
        category: new RegExp(category, 'i')
      });

      if (!existingService) {
        // Create dynamic service
        try {
          const dynamicService = await ProviderService.create({
            providerId: provider._id,
            title: `${category.charAt(0).toUpperCase() + category.slice(1)} Services by ${provider.name}`,
            description: `Professional ${category} services provided by ${provider.name}`,
            category: category,
            price: getDefaultPrice(category),
            priceType: 'fixed',
            duration: getDefaultDuration(category),
            location: location?.area || 'Nairobi',
            isActive: true,
            createdFromDiscovery: true,
            autoGenerated: true
          });

          dynamicMatches.push({
            provider: provider,
            service: dynamicService,
            matchType: 'dynamic-service',
            score: calculateProviderScore(provider, dynamicService, 20),
            isNewService: true
          });

          console.log(`   ✅ Created dynamic service: ${dynamicService.title}`);
        } catch (serviceError) {
          console.log(`   ⚠️ Failed to create service for ${provider.name}:`, serviceError.message);
        }
      }
    }

    return dynamicMatches;
  } catch (error) {
    console.error('Dynamic service creation error:', error);
    return [];
  }
}

/**
 * Combine and rank providers from different search strategies
 */
function combineAndRankProviders(providerGroups) {
  const providerMap = new Map();

  providerGroups.forEach(group => {
    group.providers.forEach(match => {
      const providerId = match.provider._id.toString();
      
      if (!providerMap.has(providerId)) {
        providerMap.set(providerId, {
          ...match,
          finalScore: match.score + group.priority,
          searchTypes: [group.type]
        });
      } else {
        // Update with higher priority match
        const existing = providerMap.get(providerId);
        if (group.priority > existing.finalScore - existing.score) {
          existing.service = match.service || existing.service;
          existing.matchType = group.type;
          existing.finalScore = Math.max(existing.finalScore, match.score + group.priority);
        }
        existing.searchTypes.push(group.type);
      }
    });
  });

  return Array.from(providerMap.values())
    .sort((a, b) => b.finalScore - a.finalScore);
}

/**
 * Enhance provider data with additional information and proper image handling
 */
function enhanceProviderData(providers, category) {
  return providers.map(match => {
    const provider = match.provider;
    const service = match.service;
    const profile = provider.providerProfile || {};

    // Enhanced profile picture handling with fallbacks
    const profilePicture = getEnhancedProfilePicture(provider, category);

    return {
      _id: provider._id,
      id: provider._id,
      name: provider.name,
      email: provider.email,
      phone: provider.phone,
      profilePicture: profilePicture.url,
      profilePictureType: profilePicture.type,
      serviceId: service?._id || provider._id,
      serviceName: service?.title || match.suggestedServiceTitle || `${category} Services`,
      servicePrice: service?.price || getDefaultPrice(category),
      category: category,
      matchType: match.matchType,
      searchTypes: match.searchTypes || [match.matchType],
      score: match.finalScore,
      isNewService: match.isNewService || false,
      profile: {
        businessName: profile.businessName || provider.name,
        rating: profile.rating || 4.0,
        reviewCount: profile.reviewCount || 0,
        totalJobs: profile.totalJobs || 0,
        experience: profile.experience || 'Professional service provider',
        skills: profile.skills || [],
        serviceAreas: profile.serviceAreas || ['Nairobi'],
        responseTime: profile.responseTime || 'Within 2 hours',
        description: profile.description || `Professional ${category} services`,
        avatar: profilePicture.url,
        avatarType: profilePicture.type
      }
    };
  });
}

/**
 * Get enhanced profile picture with comprehensive fallbacks
 */
function getEnhancedProfilePicture(provider, category) {
  const BACKEND_URL = process.env.BACKEND_URL || 'https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net';
  
  // Priority 1: User's uploaded profile picture
  if (provider.profilePicture && provider.profilePicture.trim()) {
    const profilePictureUrl = provider.profilePicture.startsWith('http') 
      ? provider.profilePicture 
      : `${BACKEND_URL}${provider.profilePicture.startsWith('/') ? '' : '/'}${provider.profilePicture}`;
    
    console.log(`✅ Using actual profile picture for ${provider.name}: ${profilePictureUrl}`);
    return {
      url: profilePictureUrl,
      type: 'user-uploaded'
    };
  }

  // Priority 2: Provider profile picture from providerProfile
  if (provider.providerProfile?.profilePicture) {
    const profilePictureUrl = provider.providerProfile.profilePicture.startsWith('http') 
      ? provider.providerProfile.profilePicture 
      : `${BACKEND_URL}${provider.providerProfile.profilePicture.startsWith('/') ? '' : '/'}${provider.providerProfile.profilePicture}`;
    
    console.log(`✅ Using provider profile picture for ${provider.name}: ${profilePictureUrl}`);
    return {
      url: profilePictureUrl,
      type: 'provider-profile'
    };
  }

  // Priority 3: Avatar from providerProfile
  if (provider.providerProfile?.avatar) {
    const avatarUrl = provider.providerProfile.avatar.startsWith('http') 
      ? provider.providerProfile.avatar 
      : `${BACKEND_URL}${provider.providerProfile.avatar.startsWith('/') ? '' : '/'}${provider.providerProfile.avatar}`;
    
    console.log(`✅ Using provider avatar for ${provider.name}: ${avatarUrl}`);
    return {
      url: avatarUrl,
      type: 'provider-avatar'
    };
  }

  // Priority 4: Business logo if available
  if (provider.providerProfile?.businessLogo) {
    const logoUrl = provider.providerProfile.businessLogo.startsWith('http') 
      ? provider.providerProfile.businessLogo 
      : `${BACKEND_URL}${provider.providerProfile.businessLogo.startsWith('/') ? '' : '/'}${provider.providerProfile.businessLogo}`;
    
    console.log(`✅ Using business logo for ${provider.name}: ${logoUrl}`);
    return {
      url: logoUrl,
      type: 'business-logo'
    };
  }
  
  // Fallback: Generate category-specific avatar using UI Avatars service
  const name = encodeURIComponent(provider.name || 'Provider');
  const categoryColor = getCategoryColor(category);
  
  // Use UI Avatars service for professional-looking avatars
  const avatarUrl = `https://ui-avatars.com/api/?name=${name}&size=200&background=${categoryColor}&color=ffffff&bold=true&format=png`;
  
  console.log(`⚠️ Using generated avatar for ${provider.name}: ${avatarUrl}`);
  return {
    url: avatarUrl,
    type: 'generated'
  };
}

/**
 * Get category-specific colors for avatars
 */
function getCategoryColor(category) {
  const colorMap = {
    'electrical': 'f59e0b', // Yellow/amber for electrical
    'plumbing': '3b82f6',   // Blue for plumbing
    'cleaning': '10b981',   // Green for cleaning
    'carpentry': '8b5cf6',  // Purple for carpentry
    'painting': 'ef4444',   // Red for painting
    'gardening': '22c55e',  // Bright green for gardening
    'moving': '6366f1'      // Indigo for moving
  };
  
  return colorMap[category?.toLowerCase()] || '6b7280'; // Default gray
}

/**
 * Utility functions
 */
function getCategoryKeywords(category) {
  const keywordMap = {
    'electrical': ['electrical', 'electrician', 'wiring', 'lighting', 'electrical repair'],
    'plumbing': ['plumbing', 'plumber', 'pipe repair', 'water systems', 'plumbing services'],
    'cleaning': ['cleaning', 'cleaner', 'house cleaning', 'deep cleaning', 'office cleaning'],
    'carpentry': ['carpentry', 'carpenter', 'furniture', 'woodwork', 'cabinet making'],
    'painting': ['painting', 'painter', 'interior painting', 'exterior painting'],
    'gardening': ['gardening', 'gardener', 'landscaping', 'lawn care', 'garden maintenance'],
    'moving': ['moving', 'mover', 'relocation', 'packing', 'furniture moving'],
    'movers': ['moving', 'mover', 'relocation', 'packing', 'furniture moving']
  };
  
  return keywordMap[category] || [category];
}

function getFuzzyCategories(category) {
  const fuzzyMap = {
    'electrical': ['maintenance', 'repair', 'installation'],
    'plumbing': ['maintenance', 'repair', 'installation', 'water'],
    'cleaning': ['maintenance', 'housekeeping', 'janitorial'],
    'carpentry': ['woodwork', 'furniture', 'construction'],
    'painting': ['decoration', 'renovation', 'maintenance'],
    'gardening': ['landscaping', 'outdoor', 'maintenance'],
    'moving': ['transport', 'logistics', 'relocation']
  };
  
  return fuzzyMap[category] || ['other'];
}

function getDefaultPrice(category) {
  const priceMap = {
    'electrical': 3500,
    'plumbing': 3000,
    'cleaning': 2500,
    'carpentry': 4000,
    'painting': 3000,
    'gardening': 2000,
    'moving': 5000
  };
  
  return priceMap[category] || 3000;
}

function getDefaultDuration(category) {
  const durationMap = {
    'electrical': 180, // 3 hours
    'plumbing': 120,   // 2 hours
    'cleaning': 240,   // 4 hours
    'carpentry': 360,  // 6 hours
    'painting': 480,   // 8 hours
    'gardening': 180,  // 3 hours
    'moving': 480      // 8 hours
  };
  
  return durationMap[category] || 120;
}

function calculateProviderScore(provider, service, baseScore) {
  const profile = provider.providerProfile || {};
  let score = baseScore;
  
  // Rating bonus
  score += (profile.rating || 4.0) * 5;
  
  // Experience bonus
  score += Math.min((profile.totalJobs || 0), 20);
  
  // Review count bonus
  score += Math.min((profile.reviewCount || 0) / 5, 10);
  
  // Service-specific bonus
  if (service) {
    score += 10;
  }
  
  return Math.round(score);
}

module.exports = router;