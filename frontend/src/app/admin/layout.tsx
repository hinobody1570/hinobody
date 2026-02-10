"use client";

import { useAuth } from "@/contexts/AuthContext";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import Loading from "@/components/reuseComponents/Loading";
import { USER_ROLES } from "@/constant/constant";
import { useEffect, useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)"); // lg
    const onChange = () => setIsSidebarOpen(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (!user || user.role !== USER_ROLES.ADMIN) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="pt-16 lg:ml-64">
        <AdminTopBar onMenuClick={() => setIsSidebarOpen((v) => !v)} />
        <main className="p-3 sm:p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
