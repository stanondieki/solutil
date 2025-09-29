# Azure App Service Environment Variables
# Add these in Azure Portal > Your App Service > Configuration > Application Settings

# Environment
NODE_ENV=production
PORT=8000
WEBSITE_NODE_DEFAULT_VERSION=18.17.0
SCM_DO_BUILD_DURING_DEPLOYMENT=true

# Database
MONGODB_URI=mongodb+srv://solutilconnect_db_user:VaZbj1WZvT0gyUp0@solutilconnect.7o4tjqy.mongodb.net/?retryWrites=true&w=majority&appName=solutilconnect
MONGODB_DB_NAME=solutilconnect_db

# JWT
JWT_SECRET=your_super_secure_production_jwt_secret_key_make_it_very_long_and_random
JWT_EXPIRE=7d

# Email (Gmail SMTP)
USE_REAL_SMTP=true
EMAIL_USER=infosolu31@gmail.com
EMAIL_PASS=tdnt dutk urnw qxxc
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=infosolu31@gmail.com
SMTP_PASS=tdnt dutk urnw qxxc

# Cloudinary (Production)
CLOUDINARY_CLOUD_NAME=your_production_cloud_name
CLOUDINARY_API_KEY=your_production_api_key
CLOUDINARY_API_SECRET=your_production_api_secret

# Stripe (LIVE keys for production)
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret

# Frontend URL (Your Vercel deployment URL)
CLIENT_URL=https://your-frontend-app.vercel.app

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# File Upload
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp

# Socket.IO
SOCKET_CORS_ORIGIN=https://your-frontend-app.vercel.app