# Google OAuth Setup Guide

## Overview
This implementation adds Google Sign-In functionality to both the login and registration pages, allowing users to authenticate using their Google accounts.

## Setup Instructions

### 1. Google Cloud Console Setup

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create a new project** (or select existing one)
3. **Enable Google+ API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. **Create OAuth 2.0 Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized JavaScript origins:
     - `http://localhost:3000` (development)
     - `https://yourdomain.com` (production)
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/google/callback` (development)
     - `https://yourdomain.com/api/auth/google/callback` (production)

### 2. Environment Variables

#### Frontend (.env.local)
```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Backend (.env)
```bash
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

### 3. Google OAuth Credentials Setup Required

You need to configure your Google OAuth credentials:
- **Client ID**: Get from Google Cloud Console (APIs & Services > Credentials)
- **Client Secret**: Get from Google Cloud Console (APIs & Services > Credentials)

**⚠️ Security Note**: Never commit actual credentials to version control. Use environment variables and keep credentials secure.

## Features Implemented

### 1. Google Sign-In Component (`/components/GoogleSignIn.tsx`)
- Handles Google Identity Services integration
- Provides customizable button with loading states
- Handles success/error callbacks
- Responsive design with Google branding

### 2. Backend Google Auth Route (`/backend/routes/googleAuth.js`)
- Verifies Google ID tokens
- Creates new users or updates existing ones
- Handles profile picture from Google
- Maintains social login mapping

### 3. Frontend API Route (`/api/auth/google/route.ts`)
- Proxies Google authentication to backend
- Handles token verification
- Returns standardized response format

### 4. Enhanced Authentication Context
- Added `loginWithGoogle()` function
- Handles Google authentication flow
- Maintains consistent user session management

### 5. Updated Login/Register Pages
- Added Google Sign-In buttons with dividers
- Integrated error handling for Google auth
- Consistent UI design with existing forms

## How It Works

### 1. User Flow
1. User clicks "Sign in with Google" button
2. Google Identity Services popup opens
3. User selects Google account and grants permissions
4. Google returns an ID token
5. Frontend sends token to `/api/auth/google`
6. Backend verifies token and creates/updates user
7. JWT token returned for session management
8. User redirected to dashboard

### 2. User Creation/Login Logic
- **New Users**: Creates account with Google profile data, marks as verified
- **Existing Users**: Links Google account to existing profile
- **Google-only Users**: Can sign in seamlessly on return visits

### 3. Database Integration
- Uses existing `socialLogins.google` field in User model
- Stores Google ID and email for future authentications
- Preserves existing user data when linking accounts

## Security Features

### 1. Token Verification
- Verifies Google ID tokens server-side
- Validates audience matches our client ID
- Extracts verified user information only

### 2. Account Linking
- Safely links Google accounts to existing emails
- Prevents duplicate accounts for same email
- Maintains data integrity

### 3. Session Management
- Uses existing JWT token system
- Consistent session expiry handling
- Secure token storage in localStorage

## Testing

### 1. Development Testing
1. Ensure both frontend and backend are running
2. Visit login page at `http://localhost:3000/auth/login`
3. Click "Sign in with Google"
4. Test with valid Google account
5. Verify user creation/login in database

### 2. Error Scenarios to Test
- Invalid Google tokens
- Network connectivity issues
- User cancellation of Google auth
- Account linking scenarios

## Production Deployment

### 1. Update Environment Variables
- Replace all placeholder values
- Use production domain in redirect URIs
- Use HTTPS URLs for production

### 2. Google Cloud Console Updates
- Add production domains to authorized origins
- Update redirect URIs for production
- Ensure APIs are enabled for production project

### 3. Deploy Considerations
- Ensure backend Google auth route is accessible
- Verify CORS settings allow frontend requests
- Test end-to-end flow in production environment

## Troubleshooting

### Common Issues
1. **"Invalid client ID"**: Check NEXT_PUBLIC_GOOGLE_CLIENT_ID is correct
2. **"Redirect URI mismatch"**: Verify URIs in Google Console match deployment
3. **"Token verification failed"**: Ensure backend GOOGLE_CLIENT_ID matches frontend
4. **"User creation failed"**: Check database connection and User model

### Debug Steps
1. Check browser console for JavaScript errors
2. Verify network requests to `/api/auth/google`
3. Check backend logs for authentication errors
4. Confirm environment variables are loaded correctly

## Benefits

### 1. User Experience
- ✅ One-click authentication
- ✅ No password required
- ✅ Automatic account verification
- ✅ Seamless registration/login

### 2. Security
- ✅ Google-verified accounts
- ✅ No password storage for Google users
- ✅ Secure token-based authentication
- ✅ Protected against common auth vulnerabilities

### 3. Development
- ✅ Reduced registration friction
- ✅ Higher conversion rates
- ✅ Consistent user data
- ✅ Easy maintenance and updates