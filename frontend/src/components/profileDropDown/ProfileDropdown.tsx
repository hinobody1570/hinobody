import { useState } from "react";
import { FaRegCircleUser } from "react-icons/fa6";
import { FiEdit } from "react-icons/fi";
import { LuFileText } from "react-icons/lu";
import { GoTrophy } from "react-icons/go";
import { LuDollarSign } from "react-icons/lu";
import { GiQueenCrown } from "react-icons/gi";
import { IoMoonOutline } from "react-icons/io5";
import { MdLogout } from "react-icons/md";
import { FaRegClock } from "react-icons/fa6";
import { IoSettingsOutline } from "react-icons/io5";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { ROUTE_PATHS } from "@/routes/paths";

export default function ProfileDropdown() {
  const [darkMode, setDarkMode] = useState(false);
  const { logout, user } = useAuth();
  const router = useRouter();
  const t = useTranslations("profileDropdown");

  const handleViewProfile = () => {
    if (user?.id) {
      router.push(`${ROUTE_PATHS.USER_PROFILE}/${user.id}`);
    }
  };

  const menuItems = [
    {
      icon: FaRegCircleUser,
      label: t("viewProfile"),
      subtitle: `u/${user?.nickname || "ResultRight8391"}`,
      onClick: handleViewProfile,
    },
    // {
    //   icon: FiEdit,
    //   label: t("editAvatar"),
    //   onClick: () => console.log("Edit Avatar"),
    // },
    // {
    //   icon: LuFileText,
    //   label: t("drafts"),
    //   onClick: () => console.log("Drafts"),
    // },
    // {
    //   icon: GoTrophy,
    //   label: t("achievements"),
    //   subtitle: t("achievementsUnlocked", { count: 5 }),
    //   onClick: () => console.log("Achievements"),
    // },
    // {
    //   icon: LuDollarSign,
    //   label: t("earn"),
    //   subtitle: t("earnCashOnReddit"),
    //   onClick: () => console.log("Earn"),
    // },
    // {
    //   icon: GiQueenCrown,
    //   label: t("premium"),
    //   onClick: () => console.log("Premium"),
    // },
  ];

  // const bottomItems = [
  //   // {
  //   //   icon: IoMoonOutline,
  //   //   label: t("advertiseOnReddit"),
  //   //   onClick: () => console.log("Advertise"),
  //   // },
  //   // {
  //   //   icon: FaRegClock,
  //   //   label: t("tryRedditPro"),
  //   //   badge: t("beta"),
  //   //   onClick: () => console.log("Try Reddit Pro"),
  //   // },
  //   {
  //     icon: IoSettingsOutline,
  //     label: t("settings"),
  //     onClick: () => console.log("Settings"),
  //   },
  // ];

  return (
    <div className="absolute right-0 top-16 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 animate-fadeIn">
      {/* Profile Section */}
      <button onClick={handleViewProfile} className="w-full px-4 py-3 hover:bg-gray-50 transition flex items-center gap-3 cursor-pointer">
        <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white text-lg font-bold">R</span>
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-gray-900">{t("viewProfile")}</p>
          <p className="text-xs text-gray-500">{user?.nickname}</p>
        </div>
      </button>

      <div className="border-t border-gray-200 my-2"></div>

      {/* Menu Items */}
      {menuItems.slice(1).map((item, index) => (
        <button key={index} onClick={item.onClick} className="w-full px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition flex items-center gap-3">
          <item.icon className="w-5 h-5 text-gray-700 flex-shrink-0" />
          <div className="text-left flex-1">
            <p className="text-sm font-medium text-gray-900">{item.label}</p>
            {item.subtitle && <p className="text-xs text-gray-500">{item.subtitle}</p>}
          </div>
        </button>
      ))}

      <div className="border-t border-gray-200 my-2"></div>

      {/* Dark Mode Toggle */}
      {/* <div className="px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <IoMoonOutline className="w-5 h-5 text-gray-700" />
          <span className="text-sm font-medium text-gray-900">{t("darkMode")}</span>
        </div>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`relative w-11 cursor-pointer h-6 rounded-full transition ${darkMode ? "bg-teal-500" : "bg-gray-300"}`}
        >
          <div
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${darkMode ? "translate-x-5" : "translate-x-0"}`}
          ></div>
        </button>
      </div> */}

      {user?.role == "ADMIN" && (
        <button
          onClick={() => router.push(ROUTE_PATHS.ADMIN_USERS)}
          className="w-full cursor-pointer px-4 py-2.5 hover:bg-gray-50 transition flex items-center gap-3"
        >
          <GoTrophy className="w-5 h-5 text-gray-700" />
          <span className="text-sm font-medium text-gray-900">Admin Pannel</span>
        </button>
      )}
      {/* Log Out */}
      <button onClick={() => logout()} className="w-full cursor-pointer px-4 py-2.5 hover:bg-gray-50 transition flex items-center gap-3">
        <MdLogout className="w-5 h-5 text-gray-700" />
        <span className="text-sm font-medium text-gray-900">{t("logOut")}</span>
      </button>

      <div className="border-t border-gray-200 my-2"></div>

      {/* Bottom Items */}
      {/* {bottomItems.map((item, index) => (
        <button key={index} onClick={item.onClick} className="w-full px-4 py-2.5 hover:bg-gray-50 transition flex items-center gap-3 cursor-pointer">
          <item.icon className="w-5 h-5 text-gray-700 flex-shrink-0" />
          <span className="text-sm font-medium text-gray-900">{item.label}</span>
          {item.badge && <span className="ml-auto text-xs font-bold text-orange-500 bg-orange-100 px-2 py-0.5 rounded">{item.badge}</span>}
        </button>
      ))} */}
    </div>
  );
}
