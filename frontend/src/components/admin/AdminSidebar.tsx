"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ROUTE_PATHS } from "@/routes/paths";
import { 
  FaUsers, 
  FaFileAlt, 
  FaLayerGroup,
  FaHome
} from "react-icons/fa";

interface SidebarItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
}

export function AdminSidebar() {
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
      icon: FaLayerGroup,
      label: t("boards"),
      path: ROUTE_PATHS.ADMIN_BOARDS,
    },
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div className="w-64 bg-blue-700 text-white h-screen fixed left-0 top-0 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-blue-600">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <li key={item.path}>
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                    isActive
                      ? "bg-blue-800 text-white"
                      : "text-blue-100 hover:bg-blue-600"
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
          onClick={() => router.push(ROUTE_PATHS.HOME)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-blue-100 hover:bg-blue-600 transition-colors cursor-pointer"
        >
          <FaHome className="w-5 h-5" />
          <span className="font-medium">{t("backToHome")}</span>
        </button>
      </div>
    </div>
  );
}

