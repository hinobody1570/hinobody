"use client";

import RedditSidebar from "@/components/sidebar/Sidebar";
import { RedditHeader } from "@/components/topHeader/TopHeader";

interface MainLayoutProps {
  children: React.ReactNode;
}

/**
 * MainLayout Component
 * 
 * Provides a consistent layout structure with:
 * - Top Header (fixed at top)
 * - Sidebar (left side)
 * - Main Content Area (changes based on route)
 */
export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <RedditHeader />

      {/* Main Layout Container - Sidebar component handles its own layout */}
      <div className="flex">
        {/* Sidebar - Component includes its own wrapper and toggle button */}
        <RedditSidebar />

        {/* Main Content Area - Changes based on route */}
        <main className="flex-1 px-6 py-4 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

