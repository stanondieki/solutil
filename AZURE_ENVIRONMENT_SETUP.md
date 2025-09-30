# Azure Environment Variables Setup Guide

## 🎯 Quick Setup (5 minutes)

### Step 1: Access Azure Portal
1. Go to [Azure Portal](https://portal.azure.com)
2. Sign in with your Azure account
3. Search for "App Services" in the top search bar
4. Click on your app: **solutilconnect-backend-api-g6g4hhb2eeh7hjep**

### Step 2: Navigate to Configuration
1. In the left sidebar, click **"Configuration"**
2. Click on **"Application settings"** tab
3. You'll see existing environment variables

### Step 3: Add Missing Environment Variables

Click **"+ New application setting"** for each of these:

#### Required Environment Variables:

**1. JWT_SECRET**
- **Name:** `JWT_SECRET`
- **Value:** `your_super_secret_jwt_key_here_make_it_very_long_and_secure_production_key_123456789`
- Click **OK**

**2. MONGODB_URI**
- **Name:** `MONGODB_URI`
- **Value:** `mongodb+srv://solutilconnect_db_user:VaZbj1WZvT0gyUp0@solutilconnect.7o4tjqy.mongodb.net/?retryWrites=true&w=majority&appName=solutilconnect`
- Click **OK**

**3. NODE_ENV**
- **Name:** `NODE_ENV`
- **Value:** `production`
- Click **OK**

**4. FRONTEND_URL**
- **Name:** `FRONTEND_URL`
- **Value:** `https://www.solutilconnect.com`
- Click **OK**

**5. CLOUDINARY_CLOUD_NAME**
- **Name:** `CLOUDINARY_CLOUD_NAME`
- **Value:** `dhniojmt6`
- Click **OK**

**6. CLOUDINARY_API_KEY**
- **Name:** `CLOUDINARY_API_KEY`
- **Value:** `362978357312836`
- Click **OK**

**7. CLOUDINARY_API_SECRET**
- **Name:** `CLOUDINARY_API_SECRET`
- **Value:** `[Your Cloudinary API Secret - check your Cloudinary dashboard]`
- Click **OK**

### Step 4: Save Configuration
1. After adding all variables, click **"Save"** at the top
2. Click **"Continue"** when prompted about restarting the app
3. Wait 2-3 minutes for the app to restart

### Step 5: Test Configuration
Run the test script to verify everything works:
```powershell
.\test-azure-backend.ps1
```

## 🔍 Expected Results After Setup

When you run the test script, you should see:
- ✅ Backend connectivity: Working
- ✅ Login successful: JWT token generated  
- ✅ JWT signature: Valid
- ✅ Upload endpoint: Authentication accepted

## 🚨 If Tests Still Fail

### JWT Signature Invalid?
- Double-check the `JWT_SECRET` value exactly matches: `your_super_secret_jwt_key_here_make_it_very_long_and_secure_production_key_123456789`
- No extra spaces or characters

### 503 Service Unavailable?
- Check `MONGODB_URI` is correct
- Verify MongoDB Atlas allows connections from Azure
- Wait 5 minutes and try again (Azure takes time to apply settings)

### Still Getting Errors?
- Go back to Azure Portal → Configuration
- Verify all environment variables are showing the correct values
- Try restarting the app manually: Overview → Restart

## ✅ Success Indicators

Once setup correctly:
1. Your website login will work without errors
2. Profile picture uploads will save to your Cloudinary account
3. All API endpoints will respond properly
4. No more "Invalid token signature" errors

## 📱 Test Your Website

After the Azure setup:
1. Go to https://www.solutilconnect.com
2. Log in with: `infosolu31@gmail.com` / `AdminSolu2024!`
3. Go to Profile section
4. Try uploading a profile picture
5. Should work without any JWT errors!

---

**Need help?** Run `.\test-azure-backend.ps1` to diagnose any remaining issues.