# ✅ Correct Vercel Environment Variables for Solutil

## 📋 Required Environment Variables

Based on your Azure backend URL, these are the **exact values** your Vercel environment variables should have:

### **NEXT_PUBLIC_API_URL**
```
https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net
```

### **NEXT_PUBLIC_SOCKET_URL**
```
https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net
```

### **NEXT_PUBLIC_ENVIRONMENT**  
```
production
```

### **NEXT_PUBLIC_SITE_URL**
```
https://www.solutilconnect.com
```

### **NEXT_PUBLIC_SITE_NAME**
```
Solutil Connect
```

### **NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME**
```
dhniojmt6
```
✅ This looks correct in your screenshot

### **NEXT_PUBLIC_CLOUDINARY_API_KEY**
```
362978357312836
```
✅ This looks correct in your screenshot

### **NODE_ENV**
```
production
```

# Stripe (Replace with LIVE keys for production)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key

# Optional Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_HOTJAR_ID=your_hotjar_id

# API Timeouts
NEXT_PUBLIC_API_TIMEOUT=30000