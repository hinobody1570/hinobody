/**
 * Route Configuration
 * 
 * Define all routes and their access levels here.
 * This is the single source of truth for route protection.
 * 
 * Access Types:
 * - 'public': Accessible to everyone (no authentication required)
 * - 'private': Requires authentication (redirects to login if not authenticated)
 * - 'public-redirect-if-auth': Public route that redirects authenticated users (e.g., login/register)
 */

export type RouteAccess = 'public' | 'private' | 'public-redirect-if-auth';

export interface RouteConfig {
  path: string; // Route path without locale (e.g., '/dashboard', '/login')
  access: RouteAccess;
  redirectTo?: string; // Where to redirect (for private routes: '/login', for public-redirect-if-auth: '/dashboard')
}

/**
 * Route Configuration Map
 * 
 * Add your routes here with their access levels.
 * The path should match the folder name in app/[locale]/
 */
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
  {
    path: '/dummy-example',
    access: 'public',
  },
  
  // Public Routes that redirect if authenticated
  {
    path: '/login',
    access: 'public-redirect-if-auth',
    redirectTo: '/dashboard',
  },
  {
    path: '/register',
    access: 'public-redirect-if-auth',
    redirectTo: '/dashboard',
  },
  
  // Private Routes (require authentication)
  {
    path: '/dashboard',
    access: 'private',
    redirectTo: '/login',
  },
  {
    path: '/profile',
    access: 'private',
    redirectTo: '/login',
  },
  {
    path: '/settings',
    access: 'private',
    redirectTo: '/login',
  },
];

/**
 * Get route configuration by path
 * @param path - Route path (e.g., '/dashboard')
 * @returns RouteConfig or undefined if not found
 */
export function getRouteConfig(path: string): RouteConfig | undefined {
  // Normalize path (remove locale, trailing slashes, etc.)
  const normalizedPath = path
    .replace(/^\/(en|ko|zh|ja)/, '') // Remove locale prefix
    .replace(/\/$/, '') || '/'; // Remove trailing slash, default to '/'
  
  return routesConfig.find(route => route.path === normalizedPath);
}

/**
 * Check if a route requires authentication
 * @param path - Route path
 * @returns true if route is private
 */
export function isPrivateRoute(path: string): boolean {
  const config = getRouteConfig(path);
  return config?.access === 'private';
}

/**
 * Check if a route is public
 * @param path - Route path
 * @returns true if route is public
 */
export function isPublicRoute(path: string): boolean {
  const config = getRouteConfig(path);
  return config?.access === 'public' || config?.access === 'public-redirect-if-auth';
}

/**
 * Get redirect path for a route
 * @param path - Route path
 * @returns Redirect path or undefined
 */
export function getRedirectPath(path: string): string | undefined {
  const config = getRouteConfig(path);
  return config?.redirectTo;
}

