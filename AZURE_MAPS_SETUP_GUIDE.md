# Azure Maps Setup Guide

## Step 1: Get Azure Maps Subscription Key

1. **Create Azure Account** (if you don't have one):
   - Go to https://portal.azure.com
   - Sign up for a free account (includes $200 credit)

2. **Create Azure Maps Account**:
   - In Azure Portal, click "Create a resource"
   - Search for "Azure Maps"
   - Click "Create"
   - Fill in:
     - Resource group: Create new or use existing
     - Name: Your maps account name
     - Pricing tier: S0 (free tier with 1,000 transactions/month)
   - Click "Review + create" then "Create"

3. **Get Subscription Key**:
   - Go to your Azure Maps resource
   - Click "Authentication" in the left menu
   - Copy the "Primary Key"

## Step 2: Configure Your Environment

1. **Update your `.env.local` file**:
   ```bash
   NEXT_PUBLIC_AZURE_MAPS_SUBSCRIPTION_KEY=your_azure_maps_key_here
   ```

2. **Update your `.env.production` file**:
   ```bash
   NEXT_PUBLIC_AZURE_MAPS_SUBSCRIPTION_KEY=your_azure_maps_key_here
   ```

## Step 3: Test Your Integration

1. Start your development server:
   ```bash
   cd frontend
   npm run dev
   ```

2. Navigate to your book-service page
3. Go to the location step
4. Click "🗺️ Use Live Map"
5. You should see an interactive Azure Maps interface

## Azure Maps Features Available

### In Your Implementation:
- ✅ Interactive map with click-to-select location
- ✅ Search places by name or address
- ✅ Current location detection
- ✅ Reverse geocoding (coordinates to address)
- ✅ Marker placement and dragging
- ✅ Nairobi-focused default view with Kenya country filtering

### Additional Features You Can Add:
- 🔄 Route planning and directions
- 🚗 Traffic information
- 📊 Geocoding and batch geocoding
- 🌍 Different map styles (satellite, terrain, etc.)
- 📍 Multiple markers for service areas
- 📐 Distance calculations
- 🎯 Geofencing capabilities

## Pricing Information

- **S0 Tier (Free)**: Up to 1,000 transactions/month
- **S1 Tier**: $0.50 per 1,000 transactions
- Transactions include: map loads, geocoding requests, route calculations

## Troubleshooting

### Common Issues:

1. **Map not loading**:
   - Check if subscription key is correctly set
   - Verify key is not expired
   - Check browser console for errors

2. **Search not working**:
   - Ensure you have geocoding enabled in Azure Maps
   - Check if you're within your transaction limits

3. **Styling issues**:
   - Make sure Azure Maps CSS is loading correctly
   - Check for CSS conflicts

### Debug Commands:

```bash
# Check if environment variable is loaded
echo $NEXT_PUBLIC_AZURE_MAPS_SUBSCRIPTION_KEY

# View browser console for errors
# F12 -> Console tab
```

## Next Steps

1. **Enhance User Experience**:
   - Add loading states for map operations
   - Implement error handling for failed requests
   - Add map style options for users

2. **Advanced Features**:
   - Integrate with your provider matching system
   - Show service areas on the map
   - Calculate service fees based on distance

3. **Performance Optimization**:
   - Implement map caching
   - Lazy load map component
   - Optimize for mobile devices

## Resources

- [Azure Maps Documentation](https://docs.microsoft.com/en-us/azure/azure-maps/)
- [Azure Maps JavaScript SDK](https://docs.microsoft.com/en-us/azure/azure-maps/how-to-use-map-control)
- [Azure Maps Pricing](https://azure.microsoft.com/en-us/pricing/details/azure-maps/)