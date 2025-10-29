#!/usr/bin/env node

/**
 * Azure Maps Integration Verification Script
 * Run this to verify your Azure Maps setup is working correctly
 */

const https = require('https')

// Configuration
const AZURE_MAPS_KEY = process.env.NEXT_PUBLIC_AZURE_MAPS_SUBSCRIPTION_KEY || 'your_key_here'
const TEST_COORDINATES = {
  lat: -1.2921,  // Nairobi
  lng: 36.8219
}

console.log('🗺️  Azure Maps Integration Verification')
console.log('=====================================')

// Test 1: Validate API Key Format
function validateKeyFormat() {
  console.log('\n1. Testing API Key Format...')
  
  if (!AZURE_MAPS_KEY || AZURE_MAPS_KEY === 'your_key_here') {
    console.log('❌ Azure Maps key not configured')
    console.log('   Set NEXT_PUBLIC_AZURE_MAPS_SUBSCRIPTION_KEY in your environment')
    return false
  }
  
  if (AZURE_MAPS_KEY.length < 20) {
    console.log('❌ Azure Maps key appears to be invalid (too short)')
    return false
  }
  
  console.log('✅ Azure Maps key is configured')
  console.log(`   Key length: ${AZURE_MAPS_KEY.length} characters`)
  return true
}

// Test 2: Test Reverse Geocoding API
function testReverseGeocoding() {
  return new Promise((resolve) => {
    console.log('\n2. Testing Reverse Geocoding API...')
    console.log(`   Testing coordinates: ${TEST_COORDINATES.lat}, ${TEST_COORDINATES.lng}`)
    
    const url = `https://atlas.microsoft.com/search/address/reverse/json?api-version=1.0&subscription-key=${AZURE_MAPS_KEY}&query=${TEST_COORDINATES.lat},${TEST_COORDINATES.lng}`
    
    https.get(url, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data)
          
          if (res.statusCode === 200 && result.addresses && result.addresses.length > 0) {
            console.log('✅ Reverse geocoding working correctly')
            console.log(`   Address found: ${result.addresses[0].address.freeformAddress}`)
            resolve(true)
          } else if (res.statusCode === 401) {
            console.log('❌ Authentication failed - check your subscription key')
            console.log(`   Status: ${res.statusCode}`)
            resolve(false)
          } else {
            console.log('⚠️  API call succeeded but no results found')
            console.log(`   Status: ${res.statusCode}`)
            console.log(`   Response: ${JSON.stringify(result, null, 2)}`)
            resolve(false)
          }
        } catch (err) {
          console.log('❌ Failed to parse API response')
          console.log(`   Error: ${err.message}`)
          resolve(false)
        }
      })
    }).on('error', (err) => {
      console.log('❌ Network error')
      console.log(`   Error: ${err.message}`)
      resolve(false)
    })
  })
}

// Test 3: Test Search API
function testSearchAPI() {
  return new Promise((resolve) => {
    console.log('\n3. Testing Search API...')
    console.log('   Searching for: "Nairobi Kenya"')
    
    const searchQuery = encodeURIComponent('Nairobi Kenya')
    const url = `https://atlas.microsoft.com/search/fuzzy/json?api-version=1.0&subscription-key=${AZURE_MAPS_KEY}&query=${searchQuery}&countrySet=KE&limit=5`
    
    https.get(url, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data)
          
          if (res.statusCode === 200 && result.results && result.results.length > 0) {
            console.log('✅ Search API working correctly')
            console.log(`   Found ${result.results.length} results`)
            console.log(`   First result: ${result.results[0].address.freeformAddress}`)
            resolve(true)
          } else if (res.statusCode === 401) {
            console.log('❌ Authentication failed - check your subscription key')
            resolve(false)
          } else {
            console.log('⚠️  Search API call succeeded but no results found')
            resolve(false)
          }
        } catch (err) {
          console.log('❌ Failed to parse search API response')
          console.log(`   Error: ${err.message}`)
          resolve(false)
        }
      })
    }).on('error', (err) => {
      console.log('❌ Network error during search')
      console.log(`   Error: ${err.message}`)
      resolve(false)
    })
  })
}

// Test 4: Check Environment Configuration
function checkEnvironmentConfig() {
  console.log('\n4. Checking Environment Configuration...')
  
  const requiredVars = [
    'NEXT_PUBLIC_AZURE_MAPS_SUBSCRIPTION_KEY',
    'NEXT_PUBLIC_API_URL'
  ]
  
  let allConfigured = true
  
  requiredVars.forEach(varName => {
    const value = process.env[varName]
    if (value && value !== 'your_key_here') {
      console.log(`✅ ${varName}: Configured`)
    } else {
      console.log(`❌ ${varName}: Not configured`)
      allConfigured = false
    }
  })
  
  return allConfigured
}

// Main execution
async function runTests() {
  console.log('Starting Azure Maps verification tests...\n')
  
  const keyValid = validateKeyFormat()
  if (!keyValid) {
    console.log('\n🚨 Cannot proceed without valid Azure Maps key')
    process.exit(1)
  }
  
  const reverseGeoTest = await testReverseGeocoding()
  const searchTest = await testSearchAPI()
  const envTest = checkEnvironmentConfig()
  
  console.log('\n📋 Test Summary')
  console.log('===============')
  console.log(`API Key Format: ${keyValid ? '✅' : '❌'}`)
  console.log(`Reverse Geocoding: ${reverseGeoTest ? '✅' : '❌'}`)
  console.log(`Search API: ${searchTest ? '✅' : '❌'}`)
  console.log(`Environment Config: ${envTest ? '✅' : '❌'}`)
  
  const allPassed = keyValid && reverseGeoTest && searchTest && envTest
  
  console.log('\n🎯 Overall Status')
  console.log('=================')
  if (allPassed) {
    console.log('🎉 All tests passed! Azure Maps is ready for production.')
    console.log('\n📝 Next Steps:')
    console.log('   1. Deploy your frontend with the Azure Maps key')
    console.log('   2. Test the live map on your book-service page')
    console.log('   3. Monitor usage in Azure Portal')
  } else {
    console.log('❌ Some tests failed. Please fix the issues above.')
    console.log('\n🔧 Troubleshooting:')
    console.log('   1. Verify your Azure Maps subscription key')
    console.log('   2. Check that your Azure Maps resource is active')
    console.log('   3. Ensure you have sufficient transaction quota')
  }
  
  process.exit(allPassed ? 0 : 1)
}

// Run the tests
runTests().catch(err => {
  console.error('❌ Unexpected error:', err.message)
  process.exit(1)
})