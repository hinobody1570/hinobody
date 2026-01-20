# OAuth Implementation Summary

This document summarizes the Google and Apple OAuth login implementation.

## Backend Implementation

### 1. Database Schema Updates
- Added `provider` field (enum: LOCAL, GOOGLE, APPLE)
- Added `providerId` field for OAuth provider user ID
- Added `avatar` field for user profile pictures
- Made `passwordHash` optional (OAuth users don't have passwords)
- Added unique constraint on `[provider, providerId]`

**Migration Required:**
```bash
cd backend
npx prisma migrate dev --name add_oauth_fields
npx prisma generate
```

### 2. OAuth Strategies
- **Google Strategy** (`backend/src/auth/strategies/google.strategy.ts`): Handles Google OAuth flow
- **Apple Strategy** (`backend/src/auth/strategies/apple.strategy.ts`): Handles Apple Sign In with JWT verification

### 3. API Endpoints
- `GET /auth/google` - Initiates Google OAuth flow
- `GET /auth/google/callback` - Google OAuth callback
- `POST /auth/google/mobile` - Google OAuth for mobile apps
- `POST /auth/apple` - Apple Sign In endpoint

### 4. User Service Updates
- `findOrCreateOAuthUser()` - Creates or links OAuth users
- `findByProvider()` - Finds users by OAuth provider
- Automatic account linking if email matches existing account

## Frontend Implementation

### 1. OAuth Login Buttons
- Added Google and Apple login buttons to the login page
- Styled with Tailwind CSS
- Integrated with existing auth flow

### 2. OAuth Callback Page
- `frontend/src/app/auth/callback/page.tsx` - Handles OAuth redirects
- Extracts token and user data from URL parameters
- Stores auth data and redirects to home

### 3. API Client Updates
- Added `googleLogin()`, `googleMobileLogin()`, and `appleLogin()` methods
- Updated API endpoints configuration

## Environment Variables

### Backend (.env)
```env
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback

# Apple OAuth
APPLE_CLIENT_ID=your-apple-client-id
APPLE_TEAM_ID=your-apple-team-id
APPLE_KEY_ID=your-apple-key-id
APPLE_KEY_FILE_PATH=./path/to/AuthKey_XXXXXXXXXX.p8

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_APPLE_CLIENT_ID=your-apple-client-id
```

## Setup Instructions

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project and enable Google+ API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URI: `http://localhost:3001/auth/google/callback`
5. Copy Client ID and Secret to `.env`

### Apple OAuth Setup
1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Create App ID with "Sign in with Apple" capability
3. Create Service ID for Sign in with Apple
4. Create a Key with "Sign in with Apple" enabled
5. Download the `.p8` key file
6. Configure Service ID with callback URL
7. Add credentials to `.env`

## Testing

1. **Run Database Migration:**
   ```bash
   cd backend
   npx prisma migrate dev
   ```

2. **Start Backend:**
   ```bash
   cd backend
   npm run start:dev
   ```

3. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

4. **Test OAuth:**
   - Navigate to login page
   - Click "Continue with Google" or "Continue with Apple"
   - Complete OAuth flow
   - Should redirect to home page after successful login

## Notes

- OAuth users are automatically email-verified
- OAuth users don't require password
- Existing accounts can be linked if email matches
- Apple Sign In requires additional frontend SDK integration for full functionality
- Mobile apps should use the `/auth/google/mobile` endpoint with token from mobile SDK

## Files Modified/Created

### Backend
- `backend/prisma/schema.prisma` - Updated User model
- `backend/src/auth/strategies/google.strategy.ts` - New
- `backend/src/auth/strategies/apple.strategy.ts` - New
- `backend/src/auth/auth.service.ts` - Added OAuth methods
- `backend/src/auth/auth.controller.ts` - Added OAuth endpoints
- `backend/src/auth/auth.module.ts` - Registered strategies
- `backend/src/user/user.service.ts` - Added OAuth user methods
- `backend/src/auth/dto/apple-login.dto.ts` - New

### Frontend
- `frontend/src/app/page.tsx` - Added OAuth buttons
- `frontend/src/app/auth/callback/page.tsx` - New
- `frontend/src/lib/api.ts` - Added OAuth API methods
- `frontend/src/lib/apiEndpoints.ts` - Added OAuth endpoints
- `frontend/messages/en.json` - Added OAuth translations

