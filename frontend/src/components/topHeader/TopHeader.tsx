"use client";

import { useTranslations } from "next-intl";
import { BsBadgeAd, BsBell } from "react-icons/bs";
import { LuMessageCircleMore } from "react-icons/lu";
import { VscDiffAdded } from "react-icons/vsc";
import LanguageSwitcher from "../LanguageSwitcher";
import { Avatar } from "../reuseComponents/Avatar";
import { Logo } from "../reuseComponents/Logo";
import { IconButton } from "../reuseComponents/NavBarIconButton";
import { SearchBar } from "../reuseComponents/SearchBar";
import { useRouter } from "next/navigation";
import { ROUTE_PATHS } from "@/routes/paths";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useRef, useState } from "react";
import ProfileDropdown from "../profileDropDown/ProfileDropdown";

export const RedditHeader = () => {
  const t = useTranslations("header");
  const router = useRouter();
  const { user } = useAuth();
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const [profileDropdown, setProfileDropDown] = useState(false);

  const headerActions = [
    { icon: BsBadgeAd, onClick: () => console.log("Ads") },
    { icon: LuMessageCircleMore, onClick: () => console.log("Chat") },
    { icon: VscDiffAdded, label: t("create"), onClick: () => router.push(ROUTE_PATHS.CREATE_POST) },
    { icon: BsBell, onClick: () => console.log("Notifications") },
  ];

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropDown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between gap-4 px-6 py-3 lg:px-16">
        <Logo text="HiNobody" onClick={() => console.log("Logo clicked")} />

        <div className="flex-1 max-w-2xl">
          <SearchBar placeholder={t("findAnything")} />
        </div>

        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          {headerActions.map((action, index) => (
            <IconButton key={index} icon={action.icon} label={action.label} onClick={action.onClick} />
          ))}

          <Avatar color="bg-teal-400" onClick={() => setProfileDropDown(!profileDropdown)} />

          {profileDropdown && <ProfileDropdown />}
        </div>
      </div>
    </header>
  );
};
