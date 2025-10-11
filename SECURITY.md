# 🔒 Security Configuration Guide

## ⚠️ IMPORTANT: Environment Variables Security

This repository contains template files for environment variables. **NEVER commit actual credentials to the repository.**

## 📋 Setup Instructions

### 1. Frontend Environment Setup

```bash
# Copy template and fill with your actual values
cp frontend/.env.example frontend/.env.local
cp frontend/.env.production.example frontend/.env.production
```

### 2. Backend Environment Setup

```bash
# Copy template and fill with your actual values  
cp backend/.env.example backend/.env.local
cp backend/.env.production.example backend/.env.production
```

## 🔑 Required Keys and Services

### Paystack Setup
1. Create account at [paystack.com](https://paystack.com)
2. Get API keys from Settings → API Keys & Webhooks
3. Add to environment files:
   - `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...` (for test)
   - `PAYSTACK_SECRET_KEY=sk_test_...` (for test)

### Cloudinary Setup
1. Create account at [cloudinary.com](https://cloudinary.com)
2. Get credentials from Dashboard
3. Add to environment files

### MongoDB Setup
1. Create cluster at [mongodb.com](https://mongodb.com)
2. Create database user
3. Get connection string
4. Add to environment files

## 🛡️ Security Best Practices

### DO:
- ✅ Use environment variables for all secrets
- ✅ Rotate keys regularly
- ✅ Use different keys for development/production
- ✅ Keep `.env` files in `.gitignore`
- ✅ Use strong, unique passwords

### DON'T:
- ❌ Commit `.env` files to git
- ❌ Share credentials in chat/email
- ❌ Use production keys in development
- ❌ Hardcode secrets in source code
- ❌ Use weak passwords

## 🚨 If Credentials Are Compromised

1. **Immediately rotate all affected keys**
2. **Remove from git history if committed**
3. **Check logs for unauthorized access**
4. **Update all deployment environments**
5. **Monitor for suspicious activity**

## 📝 Deployment Security

### Vercel
Set environment variables in project settings, not in code

### Azure
Use Azure Key Vault for sensitive data

### Other Platforms
Follow platform-specific security guidelines

---

**Remember: Security is everyone's responsibility!**