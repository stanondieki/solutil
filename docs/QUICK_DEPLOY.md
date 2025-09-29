# 🔧 Production Build & Deployment Commands

## Quick Start Commands

### Frontend (Vercel)
```bash
# 1. Build and test locally
cd frontend
npm run build
npm start

# 2. Deploy to Vercel
npm i -g vercel
vercel login
vercel --prod
```

### Backend (Azure)
```bash
# 1. Test production build
cd backend
NODE_ENV=production npm start

# 2. Deploy via Git (auto-deployment)
git add .
git commit -m "Production deployment"
git push origin main
```

## Environment Variables Quick Setup

### Vercel Environment Variables
Copy and paste these in Vercel Dashboard > Settings > Environment Variables:

```
NEXT_PUBLIC_API_URL=https://your-backend-app.azurewebsites.net
NEXT_PUBLIC_SOCKET_URL=https://your-backend-app.azurewebsites.net
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_SITE_URL=https://your-frontend-app.vercel.app
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_production_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_production_api_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
```

### Azure App Service Environment Variables
Copy and paste these in Azure Portal > App Service > Configuration > Application Settings:

```
NODE_ENV=production
PORT=8000
MONGODB_URI=mongodb+srv://solutilconnect_db_user:VaZbj1WZvT0gyUp0@solutilconnect.7o4tjqy.mongodb.net/?retryWrites=true&w=majority&appName=solutilconnect
JWT_SECRET=your_super_secure_production_jwt_secret_key
USE_REAL_SMTP=true
EMAIL_USER=infosolu31@gmail.com
EMAIL_PASS=tdnt dutk urnw qxxc
CLIENT_URL=https://your-frontend-app.vercel.app
CLOUDINARY_CLOUD_NAME=your_production_cloud_name
CLOUDINARY_API_KEY=your_production_api_key
CLOUDINARY_API_SECRET=your_production_api_secret
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
```

## Post-Deployment Updates

After you get your actual URLs, update these files:

### 1. Update CORS in backend/server.js
```javascript
// Replace line 101:
"https://your-frontend-app.vercel.app"
// With your actual Vercel URL
```

### 2. Update API config in frontend/src/config/api.js
```javascript
// Replace the default URLs with your actual ones
```

## Testing Commands

```bash
# Test backend health
curl https://your-backend-app.azurewebsites.net/api/health

# Test frontend
curl https://your-frontend-app.vercel.app

# Test CORS
curl -H "Origin: https://your-frontend-app.vercel.app" \
     -H "Access-Control-Request-Method: POST" \
     https://your-backend-app.azurewebsites.net/api/auth/login
```

## Admin User Access

After deployment, you can access your admin panel at:
- **Login**: https://your-frontend-app.vercel.app/auth/login
- **Credentials**: 
  - Email: `infosolu31@gmail.com`
  - Password: `AdminSolu2024!`

---
💡 **Tip**: Replace all placeholder URLs with your actual deployment URLs!