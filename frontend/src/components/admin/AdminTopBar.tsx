"use client";

import ProfileDropdown from "@/components/profileDropDown/ProfileDropdown";
import { Logo } from "@/components/reuseComponents/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTE_PATHS } from "@/routes/paths";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import LanguageSwitcher from "../LanguageSwitcher";
import { FaBars } from "react-icons/fa6";

interface AdminTopBarProps {
  onMenuClick: () => void;
}

export function AdminTopBar({ onMenuClick }: AdminTopBarProps) {
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
    <div className="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 left-0 lg:left-64 flex items-center justify-between px-3 sm:px-4 lg:px-6 z-40">
      {/* Left: Mobile menu + Logo */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label={t("menu")}
        >
          <FaBars className="w-5 h-5 text-gray-700" />
        </button>
        <Logo text={t("adminPanelTitle")} onClick={() => router.push(ROUTE_PATHS.ADMIN_USERS)} />
      </div>

      {/* Profile Section */}
      <div className="flex items-center gap-3 sm:gap-6 lg:gap-12">
        <LanguageSwitcher />
        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setShowProfileDropdown(!showProfileDropdown)} className="flex items-center gap-3 cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center">
              <span className="text-white text-lg font-bold">{user?.nickname?.[0]?.toUpperCase() || "A"}</span>
            </div>
            <div className="text-left hidden sm:block">
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
