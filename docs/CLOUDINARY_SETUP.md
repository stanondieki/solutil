# 🚀 Cloudinary Production Setup Guide

## Step 1: Create Cloudinary Account

1. **Sign up at [Cloudinary.com](https://cloudinary.com)**
   - Choose the free plan (25GB storage, 25GB bandwidth/month)
   - Or upgrade to Plus plan ($89/month) for production

2. **Get Your Credentials**
   - Go to Dashboard → Account Details
   - Copy these values:
     - Cloud Name (e.g., `dxyz123abc`)
     - API Key (e.g., `123456789012345`)
     - API Secret (e.g., `abcdef123456...`)

## Step 2: Configure Environment Variables

### Frontend (.env.local)
```bash
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name-here
CLOUDINARY_API_KEY=your-api-key-here
CLOUDINARY_API_SECRET=your-api-secret-here
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name-here
```

### Backend (backend/.env)
```bash
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name-here
CLOUDINARY_API_KEY=your-api-key-here
CLOUDINARY_API_SECRET=your-api-secret-here
```

## Step 3: Test Upload Functionality

1. **Start your servers:**
   ```bash
   # Frontend
   npm run dev

   # Backend (in separate terminal)
   cd backend
   node server.js
   ```

2. **Test image upload:**
   - Go to http://localhost:3000/provider/services
   - Click "Add New Service"
   - Try uploading an image in the Service Images section
   - Check browser console for any errors

## Step 4: Verify Cloudinary Dashboard

1. **Check uploads in Cloudinary:**
   - Go to your Cloudinary dashboard
   - Navigate to Media Library
   - You should see uploaded images in folders:
     - `solutil/services/` (service images)
     - `solutil/profiles/` (profile pictures)

## Step 5: Production Deployment

### For Vercel Deployment:
1. **Add environment variables in Vercel:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add the same Cloudinary variables as above

2. **Deploy:**
   ```bash
   vercel --prod
   ```

## Step 6: Optional Optimizations

### Image Transformations
- **Automatic optimization:** Images are automatically optimized for web
- **Multiple sizes:** Thumbnail (150x150), Medium (400x300), Large (800x600)
- **Format conversion:** Auto-converts to WebP when supported

### Upload Limits
- **Free plan:** 25GB storage, 25GB bandwidth/month
- **File size limit:** 10MB per image (free), 100MB (paid)
- **Format support:** JPG, PNG, WebP, GIF, SVG

## Troubleshooting

### Common Issues:

1. **"Upload failed" error:**
   - Check if environment variables are set correctly
   - Verify Cloudinary credentials in dashboard
   - Check browser console for detailed error messages

2. **Authentication errors:**
   - Make sure you're logged in as a provider
   - Check if JWT token is valid in localStorage

3. **Images not displaying:**
   - Verify the image URLs returned from Cloudinary
   - Check if images exist in Cloudinary Media Library

### Testing Commands:
```bash
# Test environment variables
node -e "console.log(process.env.CLOUDINARY_CLOUD_NAME)"

# Test Cloudinary connection (create this test file)
node test-cloudinary.js
```

## Security Notes

- ✅ **API keys are secure:** Server-side only, not exposed to client
- ✅ **Authentication required:** Only logged-in users can upload
- ✅ **File type validation:** Only images allowed
- ✅ **Size limits:** Automatic resize and optimization

## Cost Monitoring

- **Free tier limits:** 25GB storage, 25GB bandwidth
- **Upgrade triggers:** When you exceed free limits
- **Cost optimization:** Auto-optimization reduces storage usage

---

## Ready for Production! ✨

Once configured, your platform will have:
- 🖼️ **Cloud image storage** with global CDN
- 🚀 **Automatic optimization** for faster loading
- 📱 **Responsive images** for all devices
- 🔒 **Secure uploads** with authentication
- 💾 **Reliable storage** with 99.9% uptime