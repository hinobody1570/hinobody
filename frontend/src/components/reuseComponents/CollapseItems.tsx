import { useState } from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

export const CollapsibleSection = ({ title, icon: Icon, children, defaultOpen = false }: any) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-t border-gray-200">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer">
        <div className="flex items-center gap-3">
          {Icon && <Icon size={18} className="text-gray-600" />}
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</span>
        </div>
        {isOpen ? <IoIosArrowUp size={18} className="text-gray-400" /> : <IoIosArrowDown size={18} className="text-gray-400" />}
      </button>
      {isOpen && <div className="bg-white">{children}</div>}
    </div>
  );
};