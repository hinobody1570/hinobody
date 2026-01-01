"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { BiBarChartSquare } from "react-icons/bi";
import { CgArrowTopRightO } from "react-icons/cg";
import { FaBars, FaPlus } from "react-icons/fa6";
import {
  IoIosHelpCircleOutline,
  IoLogoCodepen,
  IoMdSettings,
} from "react-icons/io";
import { IoBagRemoveSharp, IoHomeOutline } from "react-icons/io5";
import { LuSmilePlus } from "react-icons/lu";
import { MdCampaign } from "react-icons/md";
import { PiCirclesThree, PiClockCountdownLight } from "react-icons/pi";
import { TbMicrophone2 } from "react-icons/tb";
import { VscBook } from "react-icons/vsc";
import { FaRegUserCircle } from "react-icons/fa";
import { CollapsibleSection } from "../reuseComponents/CollapseItems";
import { MenuItem } from "../reuseComponents/MenuItem";

/* ---------------- DATA CONFIG ---------------- */

/* ---------------- COMPONENT ---------------- */

const RedditSidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const t = useTranslations('sidebar');

  const MAIN_MENU = [
    { icon: IoHomeOutline, label: t('home') },
    { icon: CgArrowTopRightO, label: t('popular') },
    { icon: PiCirclesThree, label: t('explore') },
    { icon: BiBarChartSquare, label: t('all') },
    { icon: FaPlus, label: t('startCommunity') },
  ];

  const GAMES_MENU = [
    { icon: IoHomeOutline, label: t('farmMergeValley') },
    { icon: CgArrowTopRightO, label: t('quizPlanet') },
    { icon: PiCirclesThree, label: t('swordSupper') },
    { icon: BiBarChartSquare, label: t('discoverMoreGames') },
  ];

  const RESOURCES_MENU = [
    { icon: LuSmilePlus, label: t('aboutReddit') },
    { icon: MdCampaign, label: t('advertise') },
    { icon: IoLogoCodepen, label: t('developerPlatform') },
    {
      icon: PiClockCountdownLight,
      label: t('redditPro'),
      badge: t('beta'),
    },
    { icon: IoIosHelpCircleOutline, label: t('help') },
    { icon: VscBook, label: t('blog') },
    { icon: IoBagRemoveSharp, label: t('careers') },
    { icon: TbMicrophone2, label: t('press') },
  ];

  return (
    <div className="flex">
      {/* Sidebar */}
      <aside
        className={`bg-white border-r border-gray-200 h-screen overflow-y-auto transition-all duration-300 ${
          isOpen ? "w-64" : "w-0"
        }`}
      >
        <div className="py-2 w-[80%] mx-auto flex flex-col gap-4">
          {/* Main Navigation */}
          <nav className="flex flex-col gap-2">
            {MAIN_MENU.map((item, index) => (
              <MenuItem key={index} {...item} />
            ))}
          </nav>

          {/* Games Section */}
          <CollapsibleSection title={t('gamesOnReddit')}>
            <nav className="flex flex-col gap-2 mt-4">
              {GAMES_MENU.map((item, index) => (
                <MenuItem key={index} {...item} />
              ))}
            </nav>
          </CollapsibleSection>

          {/* Custom Feeds */}
          <CollapsibleSection title={t('customFeeds')}>
            <MenuItem icon={FaPlus} label={t('createCustomFeed')} />
          </CollapsibleSection>

          {/* Communities */}
          <CollapsibleSection title={t('communities')} defaultOpen>
            <MenuItem icon={IoMdSettings} label={t('manageCommunities')} />
          </CollapsibleSection>

          {/* Resources */}
          <CollapsibleSection title={t('resources')} defaultOpen>
            <nav className="flex flex-col gap-2 mt-4">
              {RESOURCES_MENU.map((item, index) => (
                <MenuItem key={index} {...item} />
              ))}
            </nav>
          </CollapsibleSection>

          {/* Bottom */}
          <div className="border-t border-gray-200 pt-2">
            <MenuItem icon={FaRegUserCircle} label={t('communities')} />
          </div>
        </div>
      </aside>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed cursor-pointer top-20 ${
          isOpen ? "left-60" : "left-8"
        } z-50 p-2 bg-white border border-gray-300 rounded-full shadow-md hover:bg-gray-50 transition-colors`}
      >
        <FaBars size={16} className="text-gray-700 m-1" />
      </button>
    </div>
  );
};

export default RedditSidebar;
