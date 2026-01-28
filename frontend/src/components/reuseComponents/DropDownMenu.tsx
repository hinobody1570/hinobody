"use client";

import { useEffect, useRef, useState } from "react";
import { FiMoreHorizontal } from "react-icons/fi";
import { MenuItem } from "./MenuItem";
import { IconType } from "react-icons";


interface DropdownItem {
  icon: IconType;
  label: string;
  onClick: () => void;
}

interface DropdownMenuProps {
  items: DropdownItem[];
}

export const DropdownMenu = ({ items }: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger - min 44px touch target on mobile */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="p-2 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors cursor-pointer touch-manipulation"
        aria-label="More options"
      >
        <FiMoreHorizontal size={20} className="text-gray-700" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-56 max-w-[calc(100vw-1.5rem)] bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
          {items.map((item, index) => (
            <MenuItem
              key={index}
              icon={item.icon}
              label={item.label}
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
