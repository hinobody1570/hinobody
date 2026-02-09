"use client";

import { useTranslations } from "next-intl";
import { BiSolidEdit } from "react-icons/bi";
import { BsBadgeAd, BsBell } from "react-icons/bs";
import { LuMessageCircleMore } from "react-icons/lu";
import { VscDiffAdded } from "react-icons/vsc";
import LanguageSwitcher from "../LanguageSwitcher";
import { Avatar } from "../reuseComponents/Avatar";
import { LuCamera } from "react-icons/lu";
import { Logo } from "../reuseComponents/Logo";
import { IconButton } from "../reuseComponents/NavBarIconButton";
import { SearchBar } from "../reuseComponents/SearchBar";
import { useRouter } from "next/navigation";
import { ROUTE_PATHS } from "@/routes/paths";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useRef, useState } from "react";
import ProfileDropdown from "../profileDropDown/ProfileDropdown";
import { IoIosSearch } from "react-icons/io";
import { LiaEdit } from "react-icons/lia";

export const RedditHeader = () => {
  const t = useTranslations("header");
  const router = useRouter();
  const { user } = useAuth();
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const [profileDropdown, setProfileDropDown] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const mobileSearchRef = useRef<HTMLDivElement | null>(null);

  const headerActions = [
    // { icon: BsBadgeAd, onClick: () => console.log("Ads") },
    // { icon: LuMessageCircleMore, onClick: () => console.log("Chat") },
    { icon: VscDiffAdded, iconMobile: LiaEdit , label: t("write"), onClick: () => router.push(ROUTE_PATHS.CREATE_POST) },
    // { icon: BsBell, onClick: () => console.log("Notifications") },
    // { icon: LuCamera, label: t("eyeMask"), onClick: () => router.push(ROUTE_PATHS.EYE_MASKING) },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropDown(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target as Node)) {
        // Don't close if clicking on the search icon button
        const target = event.target as HTMLElement;
        if (!target.closest('button[aria-label="Search"]')) {
          setShowMobileSearch(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      {/* Main Header Row */}
      <div className="flex items-center justify-between gap-2 sm:gap-3 md:gap-4 lg:gap-6 px-3 sm:px-4 md:px-6 lg:px-8 xl:px-16 py-2 sm:py-3">
        {/* Logo - Always visible */}
        <div className="flex-shrink-0">
          <Logo text="HiNobody" onClick={() => router.push(ROUTE_PATHS.HOME)} />
        </div>

        {/* Desktop Search Bar - Hidden on mobile, visible from 768px */}
        <div className="hidden sm:flex flex-1 max-w-xs md:max-w-sm lg:max-w-md xl:max-w-xl mx-2 md:mx-3 lg:mx-4">
          <SearchBar placeholder={t("findAnything")} />
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-3 lg:gap-4 flex-shrink-0">
          {/* Mobile Search Icon - Only visible on mobile, hidden from 640px */}
          <button
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="sm:hidden flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Search"
          >
            <IoIosSearch size={22} className="text-gray-600" />
          </button>

          {/* Language Switcher - Visible on all screen sizes, responsive */}
          <LanguageSwitcher />

          {/* Header Actions - Icons only on mobile, with labels on desktop */}
          {headerActions.map((action, index) => (
            <IconButton iconMobile={action.iconMobile} key={index} icon={action.icon} label={action.label} onClick={action.onClick} />
          ))}

          {/* Avatar */}
          <div className="relative" ref={dropdownRef}>
            <Avatar color="bg-teal-400" onClick={() => setProfileDropDown(!profileDropdown)} />
            {profileDropdown && <ProfileDropdown />}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar - Expandable on mobile, hidden from 640px */}
      {showMobileSearch && (
        <div ref={mobileSearchRef} className="sm:hidden px-3 pb-3 pt-2 border-t border-gray-200">
          <div className="w-full [&>div]:max-w-none">
            <SearchBar placeholder={t("findAnything")} />
          </div>
        </div>
      )}
    </header>
  );
};
