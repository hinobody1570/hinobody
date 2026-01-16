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

import { ROUTE_ACCESS, ROUTE_PATHS } from "./paths";

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
    path: ROUTE_PATHS.DEFAULT,
    access: ROUTE_ACCESS.PUBLIC,
  },
  {
    path: ROUTE_PATHS.ABOUT,
    access: ROUTE_ACCESS.PUBLIC,
  },
  {
    path: ROUTE_PATHS.DUMMY_EXAMPLE,
    access: ROUTE_ACCESS.PUBLIC,
  },

  // Public Routes that redirect if authenticated
  {
    path: ROUTE_PATHS.DEFAULT,
    access: ROUTE_ACCESS.PUBLIC_REDIRECT_IF_AUTH,
    redirectTo: ROUTE_PATHS.HOME,
  },
  {
    path: ROUTE_PATHS.REGISTER,
    access: ROUTE_ACCESS.PUBLIC_REDIRECT_IF_AUTH,
    redirectTo: ROUTE_PATHS.HOME,
  },
  {
    path: ROUTE_PATHS.VERIFY_EMAIL,
    access: ROUTE_ACCESS.PUBLIC_REDIRECT_IF_AUTH,
    redirectTo: ROUTE_PATHS.DEFAULT,
  },
  {
    path: ROUTE_PATHS.FORGOT_PASSWORD,
    access: ROUTE_ACCESS.PUBLIC_REDIRECT_IF_AUTH,
    redirectTo: ROUTE_PATHS.HOME,
  },
  {
    path: ROUTE_PATHS.RESET_PASSWORD,
    access: ROUTE_ACCESS.PUBLIC_REDIRECT_IF_AUTH,
    redirectTo: ROUTE_PATHS.HOME,
  },
  // Private Routes (require authentication)
  {
    path: ROUTE_PATHS.HOME,
    access: ROUTE_ACCESS.PRIVATE,
    redirectTo: ROUTE_PATHS.DEFAULT,
  },
  {
    path: ROUTE_PATHS.EYE_MASKING,
    access: ROUTE_ACCESS.PRIVATE,
    redirectTo: ROUTE_PATHS.DEFAULT,
  },
  {
    path: ROUTE_PATHS.DASHBOARD,
    access: ROUTE_ACCESS.PRIVATE,
    redirectTo: ROUTE_PATHS.DEFAULT,
  },
  {
    path: ROUTE_PATHS.PROFILE,
    access: ROUTE_ACCESS.PRIVATE,
    redirectTo: ROUTE_PATHS.DEFAULT,
  },
  {
    path: ROUTE_PATHS.SETTINGS,
    access: ROUTE_ACCESS.PRIVATE,
    redirectTo: ROUTE_PATHS.DEFAULT,
  },
  // Admin Routes
  {
    path: ROUTE_PATHS.ADMIN_BOARDS,
    access: ROUTE_ACCESS.PRIVATE,
    redirectTo: ROUTE_PATHS.DEFAULT,
  },
  {
    path: ROUTE_PATHS.ADMIN_POSTS,
    access: ROUTE_ACCESS.PRIVATE,
    redirectTo: ROUTE_PATHS.DEFAULT,
  },
  {
    path: ROUTE_PATHS.ADMIN_USERS,
    access: ROUTE_ACCESS.PRIVATE,
    redirectTo: ROUTE_PATHS.DEFAULT,
  },
];

/**
 * Get route configuration by path
 * @param path - Route path (e.g., '/dashboard')
 * @returns RouteConfig or undefined if not found
 */
export function getRouteConfig(path: string): RouteConfig | undefined {
  // Normalize path (remove trailing slashes, etc.)
  const normalizedPath = path
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
  return config?.access == ROUTE_ACCESS.PRIVATE;
}

/**
 * Check if a route is public
 * @param path - Route path
 * @returns true if route is public
 */
export function isPublicRoute(path: string): boolean {
  const config = getRouteConfig(path);
  return config?.access == ROUTE_ACCESS.PUBLIC || config?.access == ROUTE_ACCESS.PUBLIC_REDIRECT_IF_AUTH;
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

