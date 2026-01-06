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

      {/* Main Layout Container */}
      <div className="flex">
        {/* Sidebar - fixed height, sticky position */}
        <div className="h-screen sticky top-16">
          {" "}
          {/* top-16 = header height */}
          <RedditSidebar />
        </div>

        {/* Main Content */}
        <main className="flex-1 px-6 py-4 overflow-y-auto max-h-screen">{children}</main>
      </div>
    </div>
  );
}
