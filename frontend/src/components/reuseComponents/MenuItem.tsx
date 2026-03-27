interface MenuItemTypes {
  icon: any;
  label: string;
  badge?: string;
  isActive?: boolean;
  onClick?: () => void;
}

export const MenuItem = ({ icon: Icon, label, badge, isActive, onClick }: MenuItemTypes) => {
  return (
    <button
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={[
        "w-full cursor-pointer mx-auto flex items-center gap-3 px-4 py-2.5 transition-colors text-left group rounded-lg",
        isActive ? "bg-teal-50 ring-1 ring-teal-100" : "hover:bg-gray-100",
      ].join(" ")}
    >
      <Icon size={20} className={isActive ? "text-teal-700" : "text-gray-700 group-hover:text-gray-900"} />
      <span className={isActive ? "text-sm font-semibold text-teal-900" : "text-sm font-medium text-gray-800"}>
        {label}
      </span>
      {badge && <span className="ml-auto text-xs font-semibold text-orange-500 bg-orange-100 px-2 py-0.5 rounded-full">{badge}</span>}
    </button>
  );
};