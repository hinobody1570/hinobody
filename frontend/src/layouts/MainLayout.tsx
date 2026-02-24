"use client";

import { useEffect, useState } from "react";
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
 *
 * On mobile: when sidebar is open, main content is hidden (only top bar + sidebar visible).
 */
export default function MainLayout({ children }: MainLayoutProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const setMobile = () => setIsMobile(mq.matches);
    setMobile();
    mq.addEventListener("change", setMobile);
    return () => mq.removeEventListener("change", setMobile);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    if (mq.matches) setIsOpen(true);
  }, []);

  const hideMain = isMobile && isOpen;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      {/* Header - does not scroll */}
      <RedditHeader />

      {/* Main Layout Container - fills remaining height, no page scroll */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Sidebar - does not scroll with content, stays fixed */}
        <div className="flex-shrink-0 h-full overflow-hidden">
          <RedditSidebar isOpen={isOpen} onToggle={() => setIsOpen((prev) => !prev)} />
        </div>

        {/* Main Content - only this area scrolls; hidden on mobile when sidebar is open */}
        <main
          className={`flex-1 min-h-0 px-6 py-4 overflow-y-auto ${hideMain ? "hidden" : ""}`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
