# Frontend Environment Variables for Vercel
# Add these in your Vercel Dashboard under Environment Variables

# API Configuration
NEXT_PUBLIC_API_URL=https://your-backend-app.azurewebsites.net
NEXT_PUBLIC_SOCKET_URL=https://your-backend-app.azurewebsites.net
NEXT_PUBLIC_ENVIRONMENT=production

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-frontend-app.vercel.app
NEXT_PUBLIC_SITE_NAME=Solutil

# Cloudinary (Replace with your production values)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_production_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_production_api_key

# Stripe (Replace with LIVE keys for production)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key

# Optional Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_HOTJAR_ID=your_hotjar_id

# API Timeouts
NEXT_PUBLIC_API_TIMEOUT=30000