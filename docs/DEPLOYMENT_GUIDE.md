# 🚀 Production Deployment Guide

## Overview
This guide covers deploying Solutil to production with:
- **Frontend**: Vercel
- **Backend**: Azure App Service 
- **Database**: MongoDB Atlas (already configured)

## 📋 Pre-Deployment Checklist

### 1. Environment Variables Setup
- [ ] Update `VERCEL_ENV_VARIABLES.md` with your actual URLs
- [ ] Update `AZURE_ENV_VARIABLES.md` with your production values
- [ ] Replace test Stripe keys with live keys
- [ ] Configure production Cloudinary settings

### 2. Domain & URLs
- [ ] Secure your domain names
- [ ] Update CORS origins in backend
- [ ] Update API URLs in frontend config

## 🌐 Frontend Deployment (Vercel)

### Step 1: Prepare Frontend
```bash
cd frontend
npm run build  # Test build locally first
```

### Step 2: Deploy to Vercel
1. **Via Vercel CLI** (Recommended):
   ```bash
   npm i -g vercel
   vercel login
   vercel --prod
   ```

2. **Via Vercel Dashboard**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Select the `frontend` folder as root directory
   - Add environment variables from `VERCEL_ENV_VARIABLES.md`

### Step 3: Configure Environment Variables
In Vercel Dashboard > Settings > Environment Variables, add:
```
NEXT_PUBLIC_API_URL=https://your-backend-app.azurewebsites.net
NEXT_PUBLIC_SOCKET_URL=https://your-backend-app.azurewebsites.net
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_SITE_URL=https://your-frontend-app.vercel.app
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_production_cloud_name
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
```

## ☁️ Backend Deployment (Azure App Service)

### Step 1: Create Azure App Service
1. **Azure Portal**:
   - Create new App Service
   - Choose Node.js 18 LTS runtime
   - Select appropriate pricing tier

2. **Via Azure CLI**:
   ```bash
   az webapp create \
     --resource-group myResourceGroup \
     --plan myAppServicePlan \
     --name your-backend-app \
     --runtime "NODE:18-lts"
   ```

### Step 2: Configure App Service
1. **Application Settings**: Add all variables from `AZURE_ENV_VARIABLES.md`
2. **Deployment**: 
   - Connect to your GitHub repository
   - Set deployment branch to `main` or `production`
   - Enable continuous deployment

### Step 3: Deploy Backend
```bash
# Push to GitHub (triggers auto-deployment)
git add .
git commit -m "Production deployment ready"
git push origin main
```

## 🔧 Post-Deployment Configuration

### 1. Update URLs
After deployment, update these files with your actual URLs:

**Backend (`server.js`)**:
```javascript
// Replace this line:
"https://your-frontend-app.vercel.app"
// With your actual Vercel URL:
"https://solutil.vercel.app"
```

**Frontend (`src/config/api.js`)**:
```javascript
// Update API_BASE_URL with your Azure URL
API_BASE_URL: "https://your-backend-app.azurewebsites.net"
```

### 2. Test Production APIs
```bash
# Test backend health
curl https://your-backend-app.azurewebsites.net/api/health

# Test frontend
curl https://your-frontend-app.vercel.app
```

## 🔒 Security Checklist

- [ ] Enable HTTPS only
- [ ] Configure proper CORS origins
- [ ] Use strong JWT secrets
- [ ] Enable rate limiting
- [ ] Set up monitoring and logging
- [ ] Configure backup strategies

## 📊 Monitoring & Maintenance

### Azure App Service
- **Logs**: App Service > Monitoring > Log stream
- **Metrics**: App Service > Monitoring > Metrics
- **Alerts**: Set up alerts for downtime/errors

### Vercel
- **Analytics**: Vercel Dashboard > Analytics
- **Functions**: Monitor serverless function performance
- **Deployments**: Track deployment history

## 🚨 Troubleshooting

### Common Issues

**CORS Errors**:
```javascript
// Ensure backend CORS includes your Vercel URL
origin: ["https://your-frontend-app.vercel.app"]
```

**Environment Variables Not Loading**:
- Check Azure App Service > Configuration > Application Settings
- Restart the App Service after adding variables

**Database Connection Issues**:
- Verify MongoDB Atlas IP whitelist includes Azure IPs
- Check connection string format

### Debug Commands
```bash
# Azure App Service logs
az webapp log tail --name your-backend-app --resource-group myResourceGroup

# Local testing with production variables
NODE_ENV=production npm start
```

## 📞 Support

If you encounter issues:
1. Check logs in respective platforms
2. Verify environment variables
3. Test API endpoints individually
4. Check network connectivity

---

**🎉 Your Solutil app is now production-ready!**

Frontend: https://your-frontend-app.vercel.app
Backend: https://your-backend-app.azurewebsites.net/api/health