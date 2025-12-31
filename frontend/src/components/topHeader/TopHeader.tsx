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

export const RedditHeader = () => {
  const t = useTranslations('header');
  
  const headerActions = [
    { icon: BsBadgeAd, onClick: () => console.log("Ads") },
    { icon: LuMessageCircleMore, onClick: () => console.log("Chat") },
    { icon: VscDiffAdded, label: t('create'), onClick: () => console.log("Create") },
    { icon: BsBell, onClick: () => console.log("Notifications") },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between gap-4 px-6 py-3 lg:px-16" style={{padding: "16px"}}>

        <Logo text="reddit" onClick={() => console.log("Logo clicked")} />

        <div className="flex-1 max-w-2xl">
          <SearchBar placeholder={t('findAnything')} />
        </div>

        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          {headerActions.map((action, index) => (
            <IconButton
              key={index}
              icon={action.icon}
              label={action.label}
              onClick={action.onClick}
            />
          ))}

          <Avatar
            color="bg-teal-400"
            onClick={() => console.log("Avatar")}
          />
        </div>
      </div>
    </header>
  );
};
