# Pre-Deployment Checklist for Paystack Integration

## ✅ Code Review Checklist

### 1. Environment Variables (CRITICAL)
- [ ] Verify `.env` files are in `.gitignore`
- [ ] Confirm no hardcoded API keys in committed code
- [ ] Test keys are clearly marked as test keys
- [ ] Production deployment will use separate env vars

### 2. Payment Configuration
- [ ] Test mode indicators are visible in UI
- [ ] Currency set to KES (Kenyan Shillings)
- [ ] Amount calculations are correct
- [ ] Terms validation is working

### 3. Error Handling
- [ ] Network failure handling implemented
- [ ] User-friendly error messages
- [ ] Graceful degradation when backend is down

### 4. Security
- [ ] Authentication working properly
- [ ] No sensitive data in logs
- [ ] Proper validation on both frontend and backend

## 🧪 Test Scenarios to Verify After Deployment

### Payment Flow Tests
1. **Successful Payment:**
   - Use test card: 4084084084084081
   - Any CVV and future expiry date
   - Should complete successfully

2. **Terms Validation:**
   - Try to pay without checking terms
   - Should show error and prevent payment

3. **Error Scenarios:**
   - Invalid card details
   - Network interruption during payment
   - Backend server down

### Mobile Testing
4. **Mobile Responsiveness:**
   - Test on mobile devices
   - Provider cards should not overflow
   - Payment popup should work on mobile

## 🚀 Deployment Notes

### Vercel Environment Variables (Production)
```bash
# These should be set in Vercel dashboard, not committed to code
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_954e0aa0aad2caffbe6b31bd55eb48f8e2e45a55
PAYSTACK_SECRET_KEY=sk_test_9f8128f9735c56f9cbaa9bfa636215c21d4483bc
NEXT_PUBLIC_API_URL=https://your-backend-url.azurewebsites.net
```

### Azure Backend Environment Variables
```bash
# These should be set in Azure App Service Configuration
PAYSTACK_SECRET_KEY=sk_test_9f8128f9735c56f9cbaa9bfa636215c21d4483bc
PAYSTACK_PUBLIC_KEY=pk_test_954e0aa0aad2caffbe6b31bd55eb48f8e2e45a55
```

## ⚠️ Things to Watch After Deployment

1. **Test the full payment flow** on live site
2. **Check console logs** for any errors
3. **Verify mobile experience** 
4. **Test terms validation**
5. **Monitor for any backend connection issues**

## 🔄 Rollback Plan

If issues occur:
1. Previous version is still deployed
2. Can quickly revert environment variables
3. Database changes are minimal and non-breaking

## 📋 Post-Deployment Verification

Test these URLs after deployment:
- [ ] https://solutil.vercel.app/book-service (booking flow)
- [ ] Backend health check
- [ ] Payment popup opens correctly
- [ ] Terms validation works
- [ ] Mobile layout is proper