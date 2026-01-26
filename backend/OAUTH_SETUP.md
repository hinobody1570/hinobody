# OAuth Setup Guide

This document describes the environment variables needed for Google and Apple OAuth authentication.

## Environment Variables

Add these to your `.env` file in the backend directory:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback

# Apple OAuth
APPLE_CLIENT_ID=your-apple-client-id
APPLE_TEAM_ID=your-apple-team-id
APPLE_KEY_ID=your-apple-key-id
APPLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
YOUR_PRIVATE_KEY_CONTENT_HERE
-----END PRIVATE KEY-----

# Frontend URL (for OAuth redirects)
FRONTEND_URL=http://localhost:3000
```

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Configure the consent screen
6. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3001/auth/google/callback` (or your production URL)
7. Copy the Client ID and Client Secret to your `.env` file

## Apple OAuth Setup

1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Navigate to "Certificates, Identifiers & Profiles"
3. Create a new App ID with "Sign in with Apple" capability
4. Create a **Service ID** for Sign in with Apple (use this as `APPLE_CLIENT_ID` for web)
5. Create a Key with "Sign in with Apple" enabled; note the **Key ID** (e.g. from `AuthKey_XXXXX.p8`)
6. Download the `.p8` key file
7. Note your **Team ID**, **Key ID**, and **Service ID** (Client ID)
8. Configure the Service ID:
   - Add your domain and **Return URL** (e.g. `https://your-api.com/auth/apple/callback`)
   - Return URL must match `APPLE_CALLBACK_URL` exactly (no trailing slash)
9. Add the credentials to your `.env` file. The `client_secret` is generated as a JWT with:
   - **iss** = Team ID
   - **sub** = Service ID
   - **aud** = `https://appleid.apple.com`
   - **kid** = Key ID (in JWT header)
10. `APPLE_PRIVATE_KEY`: use either full PEM (including `-----BEGIN PRIVATE KEY-----` / `-----END PRIVATE KEY-----`) or raw base64 only.

## Frontend Environment Variables

Add these to your `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_APPLE_CLIENT_ID=your-apple-client-id
```

