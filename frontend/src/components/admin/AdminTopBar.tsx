"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ROUTE_PATHS } from "@/routes/paths";
import { Logo } from "@/components/reuseComponents/Logo";
import ProfileDropdown from "@/components/profileDropDown/ProfileDropdown";
import LanguageSwitcher from "../LanguageSwitcher";

export function AdminTopBar() {
  const { user } = useAuth();
  const router = useRouter();
  const t = useTranslations("admin");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 left-64 flex items-center justify-between px-6 z-40">
      {/* Logo */}
      <Logo text={t("adminPanelTitle")} onClick={() => router.push(ROUTE_PATHS.ADMIN_USERS)} />

      {/* Profile Section */}
      <div className="flex items-center gap-12">
        <LanguageSwitcher />
        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setShowProfileDropdown(!showProfileDropdown)} className="flex items-center gap-3 cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center">
              <span className="text-white text-lg font-bold">{user?.nickname?.[0]?.toUpperCase() || "A"}</span>
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">{user?.nickname || t("admin")}</p>
              <p className="text-xs text-gray-500">{t("administrator")}</p>
            </div>
          </button>

          {showProfileDropdown && <ProfileDropdown />}
        </div>
      </div>
    </div>
  );
}
