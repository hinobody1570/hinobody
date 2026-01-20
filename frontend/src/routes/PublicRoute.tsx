'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectIfAuthenticated?: boolean;
  redirectTo?: string;
}

export default function PublicRoute({ 
  children, 
  redirectIfAuthenticated = false,
  redirectTo = '/dashboard'
}: PublicRouteProps) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && isAuthenticated && redirectIfAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, loading, router, redirectIfAuthenticated, redirectTo]);

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

  return <>{children}</>;
}

