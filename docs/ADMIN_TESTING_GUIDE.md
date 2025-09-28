# Admin System Testing Guide

## Overview
The Solutil admin system provides comprehensive platform management capabilities with role-based access control. This guide will help you access and test all admin features.

## Admin Access Credentials

### Demo Admin Account
- **Email**: admin@solutil.com
- **Password**: admin123

> **Note**: These are demo credentials for testing purposes. In production, use secure credentials and proper authentication.

## How to Access Admin Panel

### 1. Navigate to Admin Login
- Open your browser and go to: `http://localhost:3000/admin/login`
- Or click on the admin login link if available in your app

### 2. Login Process
1. Enter the admin credentials:
   - Email: `admin@solutil.com`
   - Password: `admin123`
2. Click "Sign In"
3. You'll be redirected to the admin dashboard

### 3. Admin Dashboard Access
After successful login, you'll have access to:
- Dashboard: `/admin/dashboard`
- User Management: `/admin/users`
- Provider Management: `/admin/providers`
- Booking Management: `/admin/bookings`

## Admin Features Testing

### Dashboard Testing
**URL**: `/admin/dashboard`

**What to test**:
- [ ] Statistics display correctly
- [ ] Charts render properly
- [ ] Navigation sidebar works
- [ ] Quick actions are functional
- [ ] Recent activities show data

**Expected Results**:
- Total Users: 1,248
- Total Providers: 156
- Total Bookings: 523
- Total Revenue: KSh 125,430

### User Management Testing
**URL**: `/admin/users`

**What to test**:
- [ ] User list displays with proper data
- [ ] Search functionality works
- [ ] Filter by role (Customer/Provider)
- [ ] Status updates (Active/Suspended/Blocked)
- [ ] User details view
- [ ] Export functionality

**Test Actions**:
1. Search for a specific user
2. Filter by user role
3. Change user status
4. View user details

### Provider Management Testing
**URL**: `/admin/providers`

**What to test**:
- [ ] Provider list with verification status
- [ ] Approval/rejection functionality
- [ ] Service categories display
- [ ] Rating and review data
- [ ] Provider profile details
- [ ] Verification document access

**Test Actions**:
1. Approve a pending provider
2. View provider verification documents
3. Update provider status
4. Check service offerings

### Booking Management Testing
**URL**: `/admin/bookings`

**What to test**:
- [ ] Booking list with all details
- [ ] Status filtering (Pending, Confirmed, Completed, Cancelled)
- [ ] Payment status tracking
- [ ] Customer and provider information
- [ ] Booking timeline
- [ ] Dispute resolution tools

**Test Actions**:
1. Filter bookings by status
2. Update booking status
3. View booking details
4. Check payment information

## Backend API Testing

### 1. Start the Backend Server
```bash
cd backend
npm install
npm start
```

### 2. Test Admin API Endpoints

#### Admin Login
```bash
curl -X POST http://localhost:5000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@solutil.com",
    "password": "admin123"
  }'
```

#### Get Dashboard Stats (with token)
```bash
curl -X GET http://localhost:5000/api/admin/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Get Users List
```bash
curl -X GET http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Update User Status
```bash
curl -X PUT http://localhost:5000/api/admin/users/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"status": "suspended"}'
```

## Authentication Testing

### 1. Protected Routes
Test that non-admin users cannot access admin routes:
- Try accessing `/admin/dashboard` without logging in
- Should redirect to `/admin/login`

### 2. Token Validation
- Login with admin credentials
- Copy the token from localStorage
- Test API calls with and without the token
- Test with invalid/expired tokens

### 3. Role-Based Access
- Ensure only admin emails can access admin features
- Test with regular user credentials (should be denied)

## Testing Scenarios

### Scenario 1: Complete Admin Workflow
1. Login as admin
2. Check dashboard statistics
3. Review pending provider applications
4. Approve/reject providers
5. Monitor active bookings
6. Handle user support requests

### Scenario 2: User Management
1. Search for specific users
2. View user booking history
3. Update user status if needed
4. Export user data

### Scenario 3: Provider Verification
1. Review pending provider applications
2. Check submitted documents
3. Verify provider credentials
4. Approve or request additional information

### Scenario 4: Booking Oversight
1. Monitor real-time bookings
2. Handle booking disputes
3. Track payment status
4. Generate booking reports

## Troubleshooting

### Common Issues

1. **Cannot access admin pages**
   - Check if logged in with admin credentials
   - Verify token in localStorage
   - Check browser console for errors

2. **API calls failing**
   - Ensure backend server is running
   - Check CORS configuration
   - Verify token is being sent in headers

3. **Data not loading**
   - Check network tab for failed requests
   - Verify API endpoints are working
   - Check server logs for errors

### Browser Developer Tools
1. Open F12 Developer Tools
2. Check Console tab for JavaScript errors
3. Check Network tab for API calls
4. Check Application > Local Storage for auth token

## Security Notes

### Production Considerations
1. **Change default admin credentials**
2. **Implement proper password hashing**
3. **Use environment variables for secrets**
4. **Add rate limiting for admin endpoints**
5. **Implement audit logging**
6. **Add two-factor authentication**

### Current Security Features
- JWT token-based authentication
- Protected admin routes
- Role-based access control
- Input validation middleware
- CORS configuration

## Next Steps

After testing, consider implementing:
1. **Real database integration** (currently using mock data)
2. **Email notifications** for admin actions
3. **Advanced analytics** and reporting
4. **Bulk operations** for user/provider management
5. **Audit trail** for admin actions
6. **Mobile admin app** for on-the-go management

## Support

If you encounter issues during testing:
1. Check the console logs
2. Verify all dependencies are installed
3. Ensure both frontend and backend servers are running
4. Check the error logs in `backend/logs/`

For questions or issues, refer to the main README.md or backend documentation.
