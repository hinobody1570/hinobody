"use client";

import { ROUTE_PATHS } from "@/routes/paths";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BiBarChartSquare } from "react-icons/bi";
import { CgArrowTopRightO } from "react-icons/cg";
import { FaRegUserCircle } from "react-icons/fa";
import { FaBars, FaPlus } from "react-icons/fa6";
import { IoIosHelpCircleOutline, IoLogoCodepen, IoMdSettings } from "react-icons/io";
import { IoBagRemoveSharp, IoHomeOutline } from "react-icons/io5";
import { LuSmilePlus } from "react-icons/lu";
import { MdCampaign } from "react-icons/md";
import { PiCirclesThree, PiClockCountdownLight } from "react-icons/pi";
import { TbMicrophone2 } from "react-icons/tb";
import { VscBook } from "react-icons/vsc";
import { CollapsibleSection } from "../reuseComponents/CollapseItems";
import { MenuItem } from "../reuseComponents/MenuItem";
import StartCommunityPopup from "../modals/StartCommunityPopup";
import { IoNewspaperOutline } from "react-icons/io5";
import { VscPreview } from "react-icons/vsc";
import { MdOutlineRecommend } from "react-icons/md";


/* ---------------- DATA CONFIG ---------------- */

/* ---------------- COMPONENT ---------------- */

interface RedditSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const RedditSidebar = ({ isOpen, onToggle }: RedditSidebarProps) => {
  const [isCommunityPopupOpen, setIsCommunityPopupOpen] = useState(false);
  const t = useTranslations("sidebar");
  const router = useRouter();

  const MAIN_MENU = [
    { icon: IoHomeOutline, label: t("home"), navigate: ROUTE_PATHS.HOME },
    { icon: IoNewspaperOutline, label: t("news"), navigate: `${ROUTE_PATHS.CREATE_POST}?category=News` },
    { icon: VscPreview, label: t("reviews"), navigate: `${ROUTE_PATHS.CREATE_POST}?category=Reviews` },
    { icon: MdOutlineRecommend, label: t("recommend"), navigate: `${ROUTE_PATHS.CREATE_POST}?category=Recommend` },
    { icon: FaPlus, label: t("freeBoard"), navigate: `${ROUTE_PATHS.CREATE_POST}?category=Free Board` },

    // { icon: CgArrowTopRightO, label: t("popular"), navigate: "" },
    // { icon: PiCirclesThree, label: t("explore"), navigate: "" },
    // { icon: BiBarChartSquare, label: t("all"), navigate: "" },
    // { icon: FaPlus, label: t("startCommunity"), navigate: "" },
  ];

  // const GAMES_MENU = [
  //   { icon: IoHomeOutline, label: t("farmMergeValley"), navigate: "" },
  //   { icon: CgArrowTopRightO, label: t("quizPlanet"), navigate: "" },
  //   { icon: PiCirclesThree, label: t("swordSupper"), navigate: "" },
  //   { icon: BiBarChartSquare, label: t("discoverMoreGames"), navigate: "" },
  // ];

  // const RESOURCES_MENU = [
  //   { icon: LuSmilePlus, label: t("aboutReddit"), navigate: "" },
  //   { icon: MdCampaign, label: t("advertise"), navigate: "" },
  //   { icon: IoLogoCodepen, label: t("developerPlatform"), navigate: "" },
  //   {
  //     icon: PiClockCountdownLight,
  //     label: t("redditPro"),
  //     badge: t("beta"),
  //     navigate: "",
  //   },
  //   { icon: IoIosHelpCircleOutline, label: t("help"), navigate: "" },
  //   { icon: VscBook, label: t("blog"), navigate: "" },
  //   { icon: IoBagRemoveSharp, label: t("careers"), navigate: "" },
  //   { icon: TbMicrophone2, label: t("press"), navigate: "" },
  // ];

  return (
    <div className="flex">
      {/* Sidebar */}
      <aside
        className={`bg-white border-r border-gray-200 h-screen overflow-y-auto transition-all no-scrollbar duration-300 ${isOpen ? "w-68" : "w-8"}`}
      >
        <div className={`py-2 w-[80%] mx-auto flex flex-col gap-4 ${isOpen ? "" : "pl-6"}`}>
          {/* Main Navigation */}
          <nav className="flex flex-col gap-2">
            {MAIN_MENU.map((item, index) => (
              <MenuItem
                key={index}
                {...item}
                onClick={() => {
                  if (item.label === t("startCommunity")) {
                    setIsCommunityPopupOpen(true);
                  } else {
                    router.push(item?.navigate);
                  }
                }}
              />
            ))}
          </nav>

          {/* Games Section */}
          {/* <CollapsibleSection title={t("gamesOnReddit")}>
            <nav className="flex flex-col gap-2 mt-4">
              {GAMES_MENU.map((item, index) => (
                <MenuItem key={index} {...item} />
              ))}
            </nav>
          </CollapsibleSection> */}

          {/* Custom Feeds */}
          {/* <CollapsibleSection title={t("customFeeds")}>
            <MenuItem icon={FaPlus} label={t("createCustomFeed")} />
          </CollapsibleSection> */}

          {/* Communities */}
          {/* <CollapsibleSection title={t("communities")} defaultOpen>
            <MenuItem icon={IoMdSettings} label={t("manageCommunities")} />
          </CollapsibleSection> */}

          {/* Resources */}
          {/* <CollapsibleSection title={t("resources")} defaultOpen>
            <nav className="flex flex-col gap-2 mt-4">
              {RESOURCES_MENU.map((item, index) => (
                <MenuItem key={index} {...item} />
              ))}
            </nav>
          </CollapsibleSection> */}

          {/* Bottom */}
          {/* <div className="border-t border-gray-200 pt-2">
            <MenuItem icon={FaRegUserCircle} label={t("communities")} />
          </div> */}
        </div>
      </aside>

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={`fixed cursor-pointer top-24 ${
          isOpen ? "left-63" : "left-3"
        } z-50 p-2 bg-white border border-gray-300 rounded-full shadow-md hover:bg-gray-50 transition-colors`}
      >
        <FaBars size={16} className="text-gray-700 m-1" />
      </button>

      {/* Start Community Popup */}
      <StartCommunityPopup isOpen={isCommunityPopupOpen} onClose={() => setIsCommunityPopupOpen(false)} />
    </div>
  );
};

export default RedditSidebar;
