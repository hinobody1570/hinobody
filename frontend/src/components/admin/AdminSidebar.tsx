"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ROUTE_PATHS } from "@/routes/paths";
import { FaUsers, FaFileAlt, FaLayerGroup, FaHome, FaEye, FaExclamationTriangle, FaBan, FaTags, FaUserCheck, FaComment, FaEnvelope } from "react-icons/fa";

interface SidebarItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
}

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("admin");

  const menuItems: SidebarItem[] = [
    {
      icon: FaUsers,
      label: t("users"),
      path: ROUTE_PATHS.ADMIN_USERS,
    },
    {
      icon: FaFileAlt,
      label: t("posts"),
      path: ROUTE_PATHS.ADMIN_POSTS,
    },
    {
      icon: FaComment,
      label: t("comments"),
      path: ROUTE_PATHS.ADMIN_COMMENTS,
    },
    {
      icon: FaLayerGroup,
      label: t("boards"),
      path: ROUTE_PATHS.ADMIN_BOARDS,
    },
    {
      icon: FaTags,
      label: t("boardCategories"),
      path: ROUTE_PATHS.ADMIN_BOARD_CATEGORIES,
    },
    {
      icon: FaUserCheck,
      label: t("memberships"),
      path: ROUTE_PATHS.ADMIN_MEMBERSHIPS,
    },
    // {
    //   icon: FaEye,
    //   label: t("eyeMasking"),
    //   path: ROUTE_PATHS.ADMIN_EYE_MASKING,
    // },
    {
      icon: FaExclamationTriangle,
      label: t("reports"),
      path: ROUTE_PATHS.ADMIN_REPORTS,
    },
    // {
    //   icon: FaEnvelope,
    //   label: t("contactSubmissions"),
    //   path: ROUTE_PATHS.ADMIN_CONTACT_SUBMISSIONS,
    // },
    {
      icon: FaBan,
      label: t("blocks"),
      path: ROUTE_PATHS.ADMIN_BLOCKS,
    },
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
    onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`lg:hidden fixed inset-0 bg-black/40 z-40 transition-opacity ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={[
          "bg-blue-700 text-white h-screen fixed left-0 top-0 flex flex-col z-50 w-64",
          "transition-transform duration-200 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
        ].join(" ")}
        aria-label={t("adminPanel")}
      >
        {/* Logo */}
        <div className="p-6 border-b border-blue-600">
          <h1 className="text-2xl font-bold">{t("adminPanel")}</h1>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path || pathname?.startsWith(`${item.path}/`);
              return (
                <li key={item.path}>
                  <button
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                      isActive ? "bg-blue-800 text-white" : "text-blue-100 hover:bg-blue-600"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Back to Home */}
        <div className="p-4 border-t border-blue-600">
          <button
            onClick={() => {
              router.push(ROUTE_PATHS.HOME);
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-blue-100 hover:bg-blue-600 transition-colors cursor-pointer"
          >
            <FaHome className="w-5 h-5" />
            <span className="font-medium">{t("backToHome")}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
