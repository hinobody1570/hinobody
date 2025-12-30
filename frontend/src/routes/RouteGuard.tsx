'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';
import { getRouteConfig } from './routes.config';

interface RouteGuardProps {
  children: React.ReactNode;
}

/**
 * Dynamic Route Guard Component
 * 
 * Automatically applies route protection based on routes.config.ts
 * No need to wrap individual pages - this handles everything!
 */
export default function RouteGuard({ children }: RouteGuardProps) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait for auth to load
    if (loading) return;

    // Get current route configuration
    const routeConfig = getRouteConfig(pathname || '/');

    // If no config found, allow access (fallback to public)
    if (!routeConfig) {
      return;
    }

    // Handle private routes
    if (routeConfig.access === 'private') {
      if (!isAuthenticated) {
        const redirectTo = routeConfig.redirectTo || '/login';
        router.push(redirectTo);
        return;
      }
    }

    // Handle public routes that redirect if authenticated (e.g., login/register)
    if (routeConfig.access === 'public-redirect-if-auth') {
      if (isAuthenticated) {
        const redirectTo = routeConfig.redirectTo || '/dashboard';
        router.push(redirectTo);
        return;
      }
    }

    // Public routes - no action needed, allow access
  }, [isAuthenticated, loading, router, pathname]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if route is private and user is not authenticated
  const routeConfig = getRouteConfig(pathname || '/');
  if (routeConfig?.access === 'private' && !isAuthenticated) {
    return null; // Don't render content, redirect is happening
  }

  // Check if route should redirect authenticated users
  if (routeConfig?.access === 'public-redirect-if-auth' && isAuthenticated) {
    return null; // Don't render content, redirect is happening
  }

  // Render children for all other cases
  return <>{children}</>;
}

