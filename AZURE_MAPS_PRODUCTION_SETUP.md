# Azure Maps Production Setup Guide for SolUtil

## 🎯 Overview

Since your backend is already hosted on Azure (`solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net`), setting up Azure Maps will be seamless and cost-effective.

## 📋 Prerequisites

- ✅ Azure account (you already have this)
- ✅ Azure subscription (you already have this)
- ✅ Backend hosted on Azure (✅ Done)
- ✅ Frontend deployed (assuming Vercel/Netlify)

## 🚀 Step-by-Step Setup

### Step 1: Create Azure Maps Account

1. **Go to Azure Portal**: https://portal.azure.com
2. **Navigate to your existing resource group** (likely `solutil-rg` or similar)
3. **Create Azure Maps Resource**:
   ```
   Click "Create a resource" → Search "Azure Maps" → Create
   ```

4. **Fill in the details**:
   ```
   Resource group: [Your existing RG - probably solutil-rg]
   Name: solutil-maps
   Region: South Africa North (same as your backend)
   Pricing tier: S0 (Free tier - 1,000 transactions/month)
   ```

5. **Click "Review + Create"** → **Create**

### Step 2: Get Your Subscription Key

1. **Navigate to your new Azure Maps resource**
2. **Go to "Authentication" in the left sidebar**
3. **Copy the "Primary Key"**
   
   Example: `pk.abc123def456...` (yours will be different)

### Step 3: Configure Environment Variables

#### For Your Frontend (Vercel/Netlify)

**If using Vercel:**
1. Go to your Vercel dashboard
2. Select your SolUtil project
3. Go to Settings → Environment Variables
4. Add:
   ```
   Name: NEXT_PUBLIC_AZURE_MAPS_SUBSCRIPTION_KEY
   Value: [Your Azure Maps Primary Key]
   Environment: Production, Preview, Development
   ```

**If using Netlify:**
1. Go to your Netlify dashboard
2. Select your SolUtil project
3. Go to Site Settings → Environment Variables
4. Add:
   ```
   Key: NEXT_PUBLIC_AZURE_MAPS_SUBSCRIPTION_KEY
   Value: [Your Azure Maps Primary Key]
   ```

#### For Local Development

Update your `frontend/.env.local`:
```bash
# Azure Maps Configuration
NEXT_PUBLIC_AZURE_MAPS_SUBSCRIPTION_KEY=your_actual_azure_maps_key_here

# Your existing variables...
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

#### For Production Environment

Update your `frontend/.env.production`:
```bash
# Azure Maps Configuration
NEXT_PUBLIC_AZURE_MAPS_SUBSCRIPTION_KEY=your_actual_azure_maps_key_here

# Your existing production variables...
NEXT_PUBLIC_API_URL=https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net
NEXT_PUBLIC_SOCKET_URL=https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net
```

### Step 4: Update Your Deployment Configuration

#### Vercel Configuration (`vercel.json`)

Update your existing `vercel.json`:
```json
{
  "functions": {
    "app/api/**/*": {
      "maxDuration": 30
    }
  },
  "env": {
    "NEXT_PUBLIC_API_URL": "https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net",
    "NEXT_PUBLIC_BACKEND_URL": "https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net",
    "NEXT_PUBLIC_SOCKET_URL": "https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net",
    "NEXT_PUBLIC_AZURE_MAPS_SUBSCRIPTION_KEY": "your_azure_maps_key_here"
  }
}
```

### Step 5: Azure Maps Configuration for Kenya

Since you're operating in Kenya, optimize your Azure Maps settings:

#### 1. **Regional Settings**
Your Azure Maps is already in the right region (South Africa North), which provides optimal performance for Kenya.

#### 2. **Search Configuration**
The implementation already includes Kenya-specific settings:
```javascript
// In your AzureMap component
countrySet=KE  // Limits searches to Kenya
```

#### 3. **Default Map Center**
Set to Nairobi coordinates:
```javascript
center: [36.8219, -1.2921] // Nairobi coordinates [lng, lat]
zoom: 10 // Good zoom level for city view
```

### Step 6: Deploy and Test

#### 1. **Deploy Your Changes**

**For Vercel:**
```bash
cd frontend
npm run build
git add .
git commit -m "Add Azure Maps integration"
git push origin main
```

**For Netlify:**
```bash
cd frontend
npm run build
# Deploy via Netlify dashboard or CLI
```

#### 2. **Test the Integration**

1. Visit your live site: `https://yoursite.vercel.app/book-service`
2. Navigate to the location step
3. Click "🗺️ Use Live Map"
4. You should see an interactive Azure Maps interface

### Step 7: Monitor Usage and Costs

#### Azure Maps Pricing (S0 Tier - Free)
- **Monthly Quota**: 1,000 transactions
- **Transactions Include**:
  - Map tile requests
  - Geocoding requests
  - Search requests
  - Route calculations

#### Monitor Usage
1. Go to Azure Portal → Your Azure Maps resource
2. Navigate to "Metrics" 
3. Monitor "Total Transactions"

#### Cost Optimization Tips
- **Cache Results**: Store frequently used geocoding results
- **Batch Requests**: Combine multiple operations when possible
- **Optimize Zoom Levels**: Higher zoom = more tile requests

### Step 8: Advanced Configuration (Optional)

#### Custom Domain Support
If you have a custom domain, update CORS settings:

1. In Azure Maps resource → Settings → CORS
2. Add your domains:
   ```
   https://yoursite.com
   https://www.yoursite.com
   https://yoursite.vercel.app
   ```

#### Enhanced Security
1. **Use Azure Active Directory** (for enterprise customers)
2. **Implement usage limits** in your application
3. **Monitor suspicious activity**

## 🛠️ Troubleshooting Production Issues

### Common Issues and Solutions

#### 1. **Maps Not Loading**
```bash
# Check environment variables
console.log(process.env.NEXT_PUBLIC_AZURE_MAPS_SUBSCRIPTION_KEY)

# Verify key is not undefined or empty
if (!subscriptionKey) {
  console.error('Azure Maps key not configured')
}
```

#### 2. **Search Not Working**
- Verify you're within transaction limits
- Check if geocoding is enabled in Azure Maps
- Ensure Kenya country code (KE) is supported

#### 3. **CORS Errors**
- Add your domain to Azure Maps CORS settings
- Verify HTTPS is used (required for geolocation)

#### 4. **Performance Issues**
- Use map caching
- Optimize image loading
- Implement lazy loading for map component

### Error Monitoring

Add error tracking to your Azure Maps component:

```javascript
// Add to your AzureMap component
const trackError = (error) => {
  console.error('Azure Maps Error:', error)
  // Send to your analytics service
  analytics.track('azure_maps_error', {
    error: error.message,
    component: 'AzureMap'
  })
}
```

## 📊 Expected Performance

### Kenya/Nairobi Performance
- **Map Load Time**: < 2 seconds
- **Search Response**: < 1 second
- **Geocoding**: < 500ms
- **Tile Loading**: < 1 second

### Usage Estimates (1,000 free transactions/month)
- **Small Business**: ~50-100 bookings/month = 200-400 transactions
- **Medium Business**: ~200-500 bookings/month = 800-1,500 transactions
- **Large Business**: May need S1 tier ($0.50/1K transactions)

## 🎯 Success Checklist

- [ ] Azure Maps resource created in same region as backend
- [ ] Subscription key copied and stored securely
- [ ] Environment variables configured in deployment platform
- [ ] Frontend redeployed with new environment variables
- [ ] Maps loading correctly on live site
- [ ] Search functionality working for Kenya locations
- [ ] GPS location detection working
- [ ] Address geocoding returning readable addresses
- [ ] Usage monitoring set up in Azure Portal

## 🚀 Next Steps

### Immediate
1. **Test on mobile devices** - ensure responsive design works
2. **Monitor first week usage** - check transaction consumption
3. **Set up alerts** - get notified when approaching limits

### Future Enhancements
1. **Provider Location Tracking** - show service provider locations
2. **Route Optimization** - calculate optimal routes for providers
3. **Traffic Integration** - show real-time traffic data
4. **Geofencing** - alert when providers enter service areas

## 💰 Cost Optimization

### Stay Within Free Tier (1,000 transactions/month)
1. **Cache geocoding results** for frequently searched locations
2. **Limit map reloads** - don't recreate map unnecessarily
3. **Use appropriate zoom levels** - higher zoom = more tile requests
4. **Implement search debouncing** - wait for user to stop typing

### If You Need More Transactions
- **S1 Tier**: $0.50 per 1,000 additional transactions
- **Break-even**: ~2,000 bookings/month to justify S1 tier

## 🎉 Congratulations!

Your Azure Maps integration is now production-ready! Your users in Kenya will have:
- ✅ Interactive map for precise location selection
- ✅ Kenya-focused search with local places
- ✅ GPS integration for current location
- ✅ Accurate address conversion
- ✅ Fast performance with Azure's Africa presence

Your SolUtil platform now provides a world-class location selection experience powered by Microsoft's enterprise-grade mapping service! 🗺️🚀