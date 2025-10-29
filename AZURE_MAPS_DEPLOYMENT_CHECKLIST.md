# SolUtil Azure Maps Production Deployment Checklist

## 🎯 Pre-Deployment Setup

### ✅ Azure Resources
- [ ] Azure Maps resource created in same region as backend (South Africa North)
- [ ] Azure Maps subscription key obtained
- [ ] Free tier (S0) selected (1,000 transactions/month)
- [ ] Resource group: Same as your backend (visible in your screenshot)

### ✅ Environment Configuration

#### Local Development (`.env.local`)
```bash
# Azure Maps
NEXT_PUBLIC_AZURE_MAPS_SUBSCRIPTION_KEY=your_actual_key_here

# Backend URLs (for local development)
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

#### Production (`.env.production` or deployment platform)
```bash
# Azure Maps
NEXT_PUBLIC_AZURE_MAPS_SUBSCRIPTION_KEY=your_actual_key_here

# Backend URLs (production)
NEXT_PUBLIC_API_URL=https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net
NEXT_PUBLIC_BACKEND_URL=https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net
NEXT_PUBLIC_SOCKET_URL=https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net
```

## 🚀 Deployment Steps

### Step 1: Verify Local Integration
```bash
# Test locally first
cd frontend
npm run dev

# Navigate to http://localhost:3000/book-service
# Go to location step and test "🗺️ Use Live Map"
```

### Step 2: Run Verification Script
```bash
# Set your Azure Maps key first
export NEXT_PUBLIC_AZURE_MAPS_SUBSCRIPTION_KEY=your_actual_key_here

# Run verification
node verify-azure-maps.js
```

### Step 3: Configure Deployment Platform

#### If using Vercel:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   ```
   NEXT_PUBLIC_AZURE_MAPS_SUBSCRIPTION_KEY = your_actual_key_here
   ```
3. Select: Production, Preview, Development

#### If using Netlify:
1. Go to Netlify Dashboard → Your Site → Site Settings → Environment Variables
2. Add:
   ```
   Key: NEXT_PUBLIC_AZURE_MAPS_SUBSCRIPTION_KEY
   Value: your_actual_key_here
   ```

#### If using Azure Static Web Apps:
1. Go to Azure Portal → Your Static Web App → Configuration
2. Add application setting:
   ```
   Name: NEXT_PUBLIC_AZURE_MAPS_SUBSCRIPTION_KEY
   Value: your_actual_key_here
   ```

### Step 4: Deploy
```bash
# Commit your changes
git add .
git commit -m "Add Azure Maps integration for production"
git push origin main

# Your deployment platform will automatically rebuild
```

### Step 5: Test Production
1. Visit your live site: `https://yoursite.com/book-service`
2. Navigate to location step
3. Click "🗺️ Use Live Map"
4. Verify:
   - [ ] Map loads without errors
   - [ ] Search works for Kenya locations
   - [ ] GPS location detection works
   - [ ] Clicking on map sets location
   - [ ] Address is displayed correctly

## 🔧 Troubleshooting Guide

### Issue: Map doesn't load
**Check:**
```javascript
// In browser console
console.log(process.env.NEXT_PUBLIC_AZURE_MAPS_SUBSCRIPTION_KEY)
// Should not be undefined or empty
```

**Solutions:**
- Verify environment variable is set correctly
- Check for typos in variable name
- Ensure key hasn't expired
- Verify deployment picked up new environment variables

### Issue: "401 Unauthorized" errors
**Causes:**
- Invalid subscription key
- Key for wrong Azure subscription
- Key not activated yet

**Solutions:**
- Copy key again from Azure Portal → Azure Maps → Authentication
- Wait 5-10 minutes for key activation
- Verify you're using Primary Key, not Secondary

### Issue: Search doesn't work
**Check:**
- Transaction limits (Azure Portal → Azure Maps → Metrics)
- Network connectivity
- CORS settings if using custom domain

### Issue: GPS not working
**Requirements:**
- HTTPS connection (required for geolocation API)
- User permission granted
- Location services enabled on device

## 📊 Monitoring & Maintenance

### Usage Monitoring
1. Go to Azure Portal → Azure Maps → Metrics
2. Monitor "Total Transactions"
3. Set up alerts at 80% of free tier limit (800 transactions)

### Expected Usage (Kenya Market)
- **Small Business**: 50-100 bookings/month = ~200 map transactions
- **Medium Business**: 200-500 bookings/month = ~800 map transactions  
- **Growing Business**: 500+ bookings/month = may need S1 tier

### Performance Optimization
```javascript
// In your component, implement caching
const [geocodeCache, setGeocodeCache] = useState(new Map())

const reverseGeocode = async (lat, lng) => {
  const key = `${lat},${lng}`
  if (geocodeCache.has(key)) {
    return geocodeCache.get(key)
  }
  
  const result = await fetchFromAzureMaps(lat, lng)
  geocodeCache.set(key, result)
  return result
}
```

## 🎯 Success Metrics

### Technical Metrics
- [ ] Map load time < 3 seconds
- [ ] Search response time < 1 second
- [ ] 99%+ uptime
- [ ] Zero JavaScript errors related to maps

### Business Metrics
- [ ] Increased booking completion rate
- [ ] Reduced location-related support tickets
- [ ] Improved user experience ratings
- [ ] More accurate service provider matching

## 🚨 Backup Plan

### If Azure Maps fails:
1. **Graceful degradation**: Manual address entry still works
2. **GPS fallback**: Browser geolocation still available
3. **Simple coordinates**: Show lat/lng if address lookup fails

### Code example:
```javascript
const handleMapError = (error) => {
  console.error('Azure Maps error:', error)
  setShowAzureMap(false) // Fall back to manual entry
  setError('Map temporarily unavailable. Please enter address manually.')
}
```

## 🎉 Go-Live Checklist

- [ ] Azure Maps resource created and configured
- [ ] Subscription key obtained and stored securely
- [ ] Environment variables configured in deployment platform
- [ ] Local testing completed successfully
- [ ] Production deployment completed
- [ ] Live testing on actual domain completed
- [ ] Mobile testing completed
- [ ] Error monitoring configured
- [ ] Usage alerts set up in Azure Portal
- [ ] Team trained on monitoring Azure Maps usage
- [ ] Documentation updated for support team

## 📞 Support Contacts

### Azure Maps Support
- **Documentation**: https://docs.microsoft.com/en-us/azure/azure-maps/
- **Support**: Azure Portal → Help + Support
- **Community**: Stack Overflow with `azure-maps` tag

### Implementation Support
- **Code Issues**: Check GitHub Issues
- **Integration Questions**: Review implementation documentation
- **Performance Issues**: Monitor Azure Portal metrics

---

**🎯 Target Go-Live Date**: _______________

**✅ Signed off by**: _______________

**📅 Review Date**: _______________