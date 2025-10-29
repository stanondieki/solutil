# 🗺️ Azure Maps Setup - Quick Start Guide

## Step 1: Get Your FREE Azure Maps Key (Takes 5 minutes)

### Option A: Free Azure Account (Recommended)
1. **Go to**: https://portal.azure.com
2. **Sign up** for free (includes $200 credit + free services)
3. **Create Azure Maps Account**:
   - Click "Create a resource"
   - Search "Azure Maps"
   - Select "Azure Maps Account"
   - Fill out:
     - **Subscription**: Free Trial or Pay-as-you-go
     - **Resource Group**: Create new (e.g., "solutil-maps")
     - **Account Name**: "solutil-maps-account"
     - **Pricing Tier**: **S0** (FREE - 1,000 requests/month)
     - **Location**: Any region
   - Click "Review + Create" → "Create"

4. **Get Your Key**:
   - Go to your Azure Maps account
   - Click "Authentication" in left menu
   - Copy the **Primary Key**

### Option B: Test with Demo Key (For Development Only)
For immediate testing, you can use this demo key (limited functionality):
```
demo_azure_maps_key_for_testing_only
```

## Step 2: Add Key to Your Environment

### For Development (.env.local):
```bash
NEXT_PUBLIC_AZURE_MAPS_SUBSCRIPTION_KEY=your_actual_key_here
```

### For Production (.env.production):
```bash
NEXT_PUBLIC_AZURE_MAPS_SUBSCRIPTION_KEY=your_actual_key_here
```

## Step 3: Restart Your Development Server

After adding the key:
```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## Step 4: Test the Integration

1. Go to http://localhost:3000/book-service
2. Navigate to the location step
3. Click "🗺️ Use Live Map"
4. You should see an interactive Azure Maps interface!

## 🔧 If You Have Issues:

### Common Problems:

1. **"Azure Maps subscription key not configured"**
   - Make sure you added the key to `.env.local`
   - Restart your development server
   - Check there are no spaces around the key

2. **Map loads but search doesn't work**
   - Your key might not have geocoding enabled
   - Try creating a new Azure Maps account with S1 tier

3. **Map shows gray area**
   - Your key might be invalid or expired
   - Check the Azure portal to verify your key

### Quick Test Commands:

```bash
# Check if your environment variable is loaded
echo $NEXT_PUBLIC_AZURE_MAPS_SUBSCRIPTION_KEY

# Or check in browser console:
console.log(process.env.NEXT_PUBLIC_AZURE_MAPS_SUBSCRIPTION_KEY)
```

## 💰 Pricing Information:

- **S0 (Free Tier)**: 1,000 requests/month - Perfect for development
- **S1 (Paid)**: $0.50 per 1,000 requests - Great for production

### What counts as a request:
- Map tile loads
- Geocoding (address lookup)  
- Search queries
- Route calculations

## 🚀 Next Steps After Setup:

Once your Azure Maps is working, you can:
1. **Enhance search**: Add more specific search filters
2. **Add providers**: Show service provider locations on the map
3. **Calculate distances**: Show how far providers are from customers
4. **Route planning**: Display directions to service locations

## 📞 Need Help?

If you run into any issues:
1. Check the browser console for specific error messages
2. Verify your Azure Maps account is active
3. Make sure you're using the Primary Key (not Secondary Key)
4. Ensure you've restarted your development server

The integration is already complete - you just need to add your Azure Maps key! 🎉