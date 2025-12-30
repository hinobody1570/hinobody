# Routing Guide

This document explains the file-based routing system implemented in this Next.js project.

## Overview

The project uses Next.js 16 App Router with file-based routing. All routes are internationalized and support multiple locales (en, ko, zh, ja).

## Route Structure

```
frontend/src/app/
├── [locale]/              # Locale-based routing
│   ├── layout.tsx         # Layout wrapper with AuthProvider
│   ├── page.tsx           # Home page (/)
│   ├── login/            # Public route
│   │   └── page.tsx       # /login
│   ├── register/          # Public route
│   │   └── page.tsx       # /register
│   ├── about/             # Public route
│   │   └── page.tsx       # /about
│   ├── dashboard/         # Private route
│   │   └── page.tsx       # /dashboard
│   ├── profile/           # Private route
│   │   └── page.tsx       # /profile
│   ├── settings/          # Private route
│   │   └── page.tsx       # /settings
│   └── dummy-example/     # Public route (for learning)
│       └── page.tsx       # /dummy-example
```

## Route Types

### Public Routes
Public routes are accessible to everyone, even without authentication.

**Examples:**
- `/login` - Login page
- `/register` - Registration page
- `/about` - About page
- `/dummy-example` - Example route for learning

**Implementation:**
```tsx
import PublicRoute from '@/components/PublicRoute';

export default function MyPublicPage() {
  return (
    <PublicRoute>
      <div>Public content</div>
    </PublicRoute>
  );
}
```

### Private Routes
Private routes require authentication. Users are automatically redirected to `/login` if not authenticated.

**Examples:**
- `/dashboard` - User dashboard
- `/profile` - User profile
- `/settings` - User settings

**Implementation:**
```tsx
import PrivateRoute from '@/components/PrivateRoute';

export default function MyPrivatePage() {
  return (
    <PrivateRoute>
      <div>Private content</div>
    </PrivateRoute>
  );
}
```

## Creating New Routes

### Step 1: Create the Route Folder
Create a new folder in `frontend/src/app/[locale]/` with your route name.

Example: `frontend/src/app/[locale]/my-route/`

### Step 2: Create page.tsx
Create a `page.tsx` file inside the folder:

```tsx
'use client'; // If using client-side features

import PublicRoute from '@/components/PublicRoute';
// or
import PrivateRoute from '@/components/PrivateRoute';

export default function MyRoutePage() {
  return (
    <PublicRoute> {/* or <PrivateRoute> */}
      <div>
        <h1>My Route</h1>
        {/* Your content here */}
      </div>
    </PublicRoute>
  );
}
```

### Step 3: Access Your Route
Your route will be available at:
- `/en/my-route`
- `/ko/my-route`
- `/zh/my-route`
- `/ja/my-route`

Or just `/my-route` (will redirect to default locale)

## Navigation

### Using Locale-Aware Links
Always use the `Link` component from `@/i18n/routing` for navigation:

```tsx
import { Link } from '@/i18n/routing';

<Link href="/dashboard">Go to Dashboard</Link>
```

### Using Locale-Aware Router
Use the router from `@/i18n/routing` for programmatic navigation:

```tsx
import { useRouter } from '@/i18n/routing';

const router = useRouter();
router.push('/dashboard');
```

## Authentication

### Auth Context
The `AuthProvider` is available throughout the app via the `useAuth` hook:

```tsx
import { useAuth } from '@/contexts/AuthContext';

const { user, isAuthenticated, login, logout } = useAuth();
```

### Auth Utilities
Authentication utilities are available in `@/lib/auth`:

```tsx
import { isAuthenticated, getUser, getToken } from '@/lib/auth';
```

## Route Protection Components

### PublicRoute
- Wraps public pages
- Optionally redirects authenticated users
- Props:
  - `redirectIfAuthenticated?: boolean` - Redirect if user is logged in
  - `redirectTo?: string` - Where to redirect (default: '/dashboard')

### PrivateRoute
- Wraps private pages
- Automatically redirects to `/login` if not authenticated
- Shows loading state while checking authentication

## Current Routes

### Public Routes
1. **/** - Home page (Eye Masking Tool)
2. **/login** - Login page
3. **/register** - Registration page
4. **/about** - About page
5. **/dummy-example** - Example route for learning

### Private Routes
1. **/dashboard** - User dashboard
2. **/profile** - User profile page
3. **/settings** - User settings page

## Internationalization

All routes automatically support multiple locales:
- English (en) - Default
- Korean (ko)
- Chinese (zh)
- Japanese (ja)

The locale is part of the URL path: `/{locale}/{route}`

## Middleware

The middleware (`frontend/src/middleware.ts`) handles:
- Locale detection and redirection
- Cookie management for locale preferences

Route protection is handled client-side by the `PublicRoute` and `PrivateRoute` components.

## Best Practices

1. **Always use locale-aware navigation** - Use `Link` and `useRouter` from `@/i18n/routing`
2. **Wrap routes appropriately** - Use `PublicRoute` or `PrivateRoute` based on access requirements
3. **Use 'use client' directive** - Add this when using client-side features (hooks, event handlers, etc.)
4. **Keep route names simple** - Use kebab-case for route folders (e.g., `my-route`)
5. **Test with different locales** - Ensure your routes work with all supported locales

## Example: Complete Route Implementation

```tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import PrivateRoute from '@/components/PrivateRoute';
import { Link } from '@/i18n/routing';
import { useRouter } from '@/i18n/routing';

export default function MyNewRoute() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleAction = () => {
    // Your logic here
    router.push('/dashboard');
  };

  return (
    <PrivateRoute>
      <div className="min-h-screen p-8">
        <h1>My New Route</h1>
        <p>Welcome, {user?.email}!</p>
        <button onClick={handleAction}>Do Something</button>
        <Link href="/dashboard">Back to Dashboard</Link>
      </div>
    </PrivateRoute>
  );
}
```

## Troubleshooting

### Route not working?
1. Check that the folder name matches the desired URL path
2. Ensure `page.tsx` exists in the folder
3. Verify the route is wrapped with `PublicRoute` or `PrivateRoute`
4. Check browser console for errors

### Navigation not preserving locale?
- Make sure you're using `Link` from `@/i18n/routing`, not from `next/link`
- Use `useRouter` from `@/i18n/routing`, not from `next/navigation`

### Authentication issues?
- Check that `AuthProvider` is in the layout (it's already set up)
- Verify localStorage is accessible (not in SSR)
- Check the browser console for auth errors

