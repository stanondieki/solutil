# 🚀 Azure Deployment Fix Guide

## 🔍 Deployment Failed - Here's How to Fix It

Your deployment failed at 01:54:15 AM. Let's get it working:

### **Step 1: Check Deployment Logs (CRITICAL)**
1. In Azure Portal → Deployment Center
2. Click **"View logs"** next to the failed deployment
3. Look for error messages like:
   - `Missing package.json`
   - `Node version not supported`
   - `npm install failed`
   - `Application startup failed`

### **Step 2: Common Fixes**

#### **Fix A: Node.js Version**
Azure might be using wrong Node version.

**In Azure Portal:**
1. Go to **Configuration** → **General settings**
2. Set **Stack**: `Node`  
3. Set **Major version**: `18` (or `20`)
4. Set **Minor version**: `LTS`
5. Click **Save**

#### **Fix B: Add Required Environment Variables**
Missing environment variables cause startup crashes.

**In Azure Portal → Configuration → Application settings:**

Add these essential variables:
```
WEBSITE_NODE_DEFAULT_VERSION = 18.17.0
SCM_DO_BUILD_DURING_DEPLOYMENT = true
NODE_ENV = production
JWT_SECRET = your_super_secret_jwt_key_here_make_it_very_long_and_secure_production_key_123456789
MONGODB_URI = mongodb+srv://solutilconnect_db_user:VaZbj1WZvT0gyUp0@solutilconnect.7o4tjqy.mongodb.net/?retryWrites=true&w=majority&appName=solutilconnect
FRONTEND_URL = https://www.solutilconnect.com
```

#### **Fix C: Startup Command**
**In Azure Portal → Configuration → General settings:**
- **Startup Command**: `node server.js`

### **Step 3: Redeploy**

#### **Option A: Manual Redeploy (Recommended)**
1. Go to **Deployment Center**
2. Click **"Sync"** or **"Redeploy"**
3. Wait for deployment to complete

#### **Option B: Fresh Deploy from Local**
```powershell
# Zip your backend folder
Compress-Archive -Path "backend\*" -DestinationPath "backend-deploy.zip" -Force

# Upload via Azure Portal:
# Deployment Center → ZIP Deploy → Upload backend-deploy.zip
```

### **Step 4: Monitor Deployment**
1. Watch **Deployment Center** for status
2. If it fails again, check logs immediately
3. Look for specific error messages

### **Step 5: Test After Deployment**
```powershell
# Wait 2-3 minutes after successful deployment
.\test-azure-complete.ps1
```

## 🚨 If Deployment Keeps Failing

### **Check These Common Issues:**

1. **Package.json Location**
   - Must be in root of deployed folder
   - Should contain `"start": "node server.js"`

2. **Dependencies**
   - All required packages in `dependencies` (not `devDependencies`)
   - No missing modules

3. **File Structure**
   ```
   backend/
   ├── package.json ✅
   ├── server.js ✅
   ├── web.config ✅
   ├── models/
   ├── routes/
   └── ...
   ```

4. **Environment Variables**
   - MONGODB_URI must be set or app crashes
   - JWT_SECRET required for authentication

## 🎯 Success Indicators

**Deployment succeeded when:**
- ✅ Deployment Center shows "Success"
- ✅ `test-azure-complete.ps1` connects successfully
- ✅ Login works without timeouts
- ✅ Upload endpoints respond

## 📞 Need Help?

Run this after any changes:
```powershell
.\test-azure-complete.ps1
```

The most common fix is setting the environment variables and ensuring Node.js 18 is selected!

---

**Next:** Once deployment succeeds, your image upload will work perfectly!