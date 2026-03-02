"use client";

import { usePathname } from "next/navigation";
import MainLayout from "@/layouts/MainLayout";
import { ROUTE_PATHS } from "@/routes/paths";

interface MainLayoutWrapperProps {
  children: React.ReactNode;
}

/**
 * Wraps main routes with MainLayout (sidebar + header).
 * Chat route (/main/chat) uses a totally different full-screen layout, so it is not wrapped.
 */
export default function MainLayoutWrapper({ children }: MainLayoutWrapperProps) {
  const pathname = usePathname();
  const isChatRoute = pathname === ROUTE_PATHS.CHAT;

  if (isChatRoute) {
    return <>{children}</>;
  }

  return <MainLayout>{children}</MainLayout>;
}
