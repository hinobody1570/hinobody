# Dynamic Routing System Guide

## Overview

This project uses a **dynamic route protection system** where you define route access levels in a single configuration file. No need to wrap each page with `<PublicRoute>` or `<PrivateRoute>` - everything is handled automatically!

## How It Works

1. **Route Configuration** (`routes.config.ts`) - Define all routes and their access levels
2. **RouteGuard Component** - Automatically applies protection based on config
3. **Layout Integration** - RouteGuard is integrated in the layout, protecting all routes

## Route Configuration

All routes are defined in `frontend/src/routes/routes.config.ts`:

```typescript
export const routesConfig: RouteConfig[] = [
  // Public Routes
  {
    path: '/',
    access: 'public',
  },
  {
    path: '/about',
    access: 'public',
  },
  
  // Public Routes that redirect if authenticated
  {
    path: '/login',
    access: 'public-redirect-if-auth',
    redirectTo: '/dashboard',
  },
  
  // Private Routes (require authentication)
  {
    path: '/dashboard',
    access: 'private',
    redirectTo: '/login',
  },
];
```

## Access Types

### 1. `'public'`
- Accessible to everyone
- No authentication required
- Example: `/about`, `/`

### 2. `'private'`
- Requires authentication
- Redirects to `redirectTo` (default: `/login`) if not authenticated
- Example: `/dashboard`, `/profile`, `/settings`

### 3. `'public-redirect-if-auth'`
- Public route that redirects authenticated users
- Useful for login/register pages
- Redirects to `redirectTo` (default: `/dashboard`) if authenticated
- Example: `/login`, `/register`

## Creating a New Route

### Step 1: Create the Page
Create your page file as usual:
```
frontend/src/app/[locale]/my-new-route/page.tsx
```

```tsx
export default function MyNewRoute() {
  return (
    <div>
      <h1>My New Route</h1>
      {/* Your content */}
    </div>
  );
}
```

**No wrapper needed!** Just export your component.

### Step 2: Add to Config
Add your route to `routes.config.ts`:

```typescript
{
  path: '/my-new-route',
  access: 'private', // or 'public' or 'public-redirect-if-auth'
  redirectTo: '/login', // optional, for private routes
}
```

That's it! The route is now protected automatically.

## Examples

### Public Route
```typescript
// routes.config.ts
{
  path: '/blog',
  access: 'public',
}

// app/[locale]/blog/page.tsx
export default function BlogPage() {
  return <div>Public blog page</div>;
}
```

### Private Route
```typescript
// routes.config.ts
{
  path: '/admin',
  access: 'private',
  redirectTo: '/login',
}

// app/[locale]/admin/page.tsx
export default function AdminPage() {
  return <div>Admin page (requires login)</div>;
}
```

### Public Route with Auth Redirect
```typescript
// routes.config.ts
{
  path: '/welcome',
  access: 'public-redirect-if-auth',
  redirectTo: '/dashboard',
}

// app/[locale]/welcome/page.tsx
export default function WelcomePage() {
  return <div>Welcome! (redirects to dashboard if logged in)</div>;
}
```

## Benefits

✅ **Single Source of Truth** - All route access defined in one file  
✅ **No Wrappers** - Pages are clean, no `<PublicRoute>` or `<PrivateRoute>` needed  
✅ **Easy to Maintain** - Change access level by updating config  
✅ **Type Safe** - TypeScript ensures correct configuration  
✅ **Automatic Protection** - RouteGuard handles everything  

## File Structure

```
frontend/src/
├── routes/
│   ├── routes.config.ts      # Route configuration (EDIT THIS!)
│   ├── RouteGuard.tsx        # Automatic route protection
│   ├── PublicRoute.tsx       # (Legacy - not needed anymore)
│   └── PrivateRoute.tsx      # (Legacy - not needed anymore)
├── app/
│   └── [locale]/
│       ├── layout.tsx         # RouteGuard integrated here
│       └── [your-routes]/     # Your pages (no wrappers!)
└── contexts/
    └── AuthContext.tsx        # Authentication context
```

## How RouteGuard Works

1. **Reads current pathname** from the URL
2. **Looks up route config** in `routes.config.ts`
3. **Checks authentication status** from `AuthContext`
4. **Applies protection**:
   - Private route + not authenticated → Redirect to login
   - Public-redirect-if-auth + authenticated → Redirect to dashboard
   - Otherwise → Allow access

## Updating Route Access

To change a route from public to private (or vice versa):

1. Open `routes.config.ts`
2. Find your route
3. Change `access` value:
   ```typescript
   // Before
   { path: '/my-page', access: 'public' }
   
   // After
   { path: '/my-page', access: 'private', redirectTo: '/login' }
   ```
4. Save - protection updates automatically!

## Current Routes

### Public Routes
- `/` - Home page
- `/about` - About page
- `/dummy-example` - Example route

### Public Routes (Redirect if Auth)
- `/login` - Login page
- `/register` - Registration page

### Private Routes
- `/dashboard` - User dashboard
- `/profile` - User profile
- `/settings` - User settings

## Troubleshooting

### Route not protected?
- Check that route is in `routes.config.ts`
- Verify path matches exactly (case-sensitive, no trailing slash)
- Ensure RouteGuard is in layout (it's already there)

### Redirect loop?
- Check `redirectTo` path exists in config
- Verify redirect path is not the same as current path
- Check authentication state in browser console

### Route not found?
- Ensure folder structure matches: `app/[locale]/your-route/page.tsx`
- Path in config should be `/your-route` (with leading slash, no locale)

## Migration from Old System

If you have pages with `<PublicRoute>` or `<PrivateRoute>` wrappers:

1. Remove the wrapper from your page
2. Add route to `routes.config.ts`
3. That's it!

**Before:**
```tsx
import PrivateRoute from '@/routes/PrivateRoute';

export default function MyPage() {
  return (
    <PrivateRoute>
      <div>My content</div>
    </PrivateRoute>
  );
}
```

**After:**
```tsx
// routes.config.ts
{ path: '/my-page', access: 'private', redirectTo: '/login' }

// page.tsx
export default function MyPage() {
  return <div>My content</div>;
}
```

## Advanced Usage

### Custom Redirect Paths
You can specify different redirect paths for different routes:

```typescript
{
  path: '/admin',
  access: 'private',
  redirectTo: '/login?redirect=/admin', // Custom redirect
}
```

### Helper Functions
Use helper functions from `routes.config.ts`:

```typescript
import { isPrivateRoute, getRouteConfig } from '@/routes/routes.config';

// Check if route is private
if (isPrivateRoute('/dashboard')) {
  // Do something
}

// Get full route config
const config = getRouteConfig('/dashboard');
console.log(config?.access); // 'private'
```

## Summary

- ✅ Define routes in `routes.config.ts`
- ✅ Create pages without wrappers
- ✅ RouteGuard handles protection automatically
- ✅ Change access levels by updating config
- ✅ Clean, maintainable, type-safe

Happy routing! 🚀

