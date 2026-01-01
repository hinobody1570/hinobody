interface MenuItemTypes {
  icon: any;
  label: string;
  badge?: string;
  onClick?: ()=> void;
}

export const MenuItem = ({ icon: Icon, label, badge, onClick }: MenuItemTypes) => {
  return (
    <button
      onClick={onClick}
      className="w-full mx-auto flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 transition-colors text-left group"
    >
      <Icon size={20} className="text-gray-700 group-hover:text-gray-900" />
      <span className="text-sm font-medium text-gray-800">{label}</span>
      {badge && <span className="ml-auto text-xs font-semibold text-orange-500 bg-orange-100 px-2 py-0.5 rounded-full">{badge}</span>}
    </button>
  );
};