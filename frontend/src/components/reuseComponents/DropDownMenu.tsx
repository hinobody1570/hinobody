"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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

const DROPDOWN_WIDTH = 224; // w-56 = 14rem
const GAP = 8;

export const DropdownMenu = ({ items }: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    const trigger = triggerRef.current;
    if (!trigger || typeof window === "undefined") return;
    const rect = trigger.getBoundingClientRect();
    const margin = 8;
    // Right-align dropdown to trigger; if that would overflow left, pin to viewport left
    const leftAligned = Math.max(margin, rect.right - DROPDOWN_WIDTH);
    setPosition({
      top: rect.bottom + GAP,
      left: leftAligned,
    });
  };

  const handleToggle = () => {
    if (!isOpen) updatePosition();
    setIsOpen((prev) => !prev);
  };

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const inside =
        triggerRef.current?.contains(target) || panelRef.current?.contains(target);
      if (!inside) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Keep dropdown in viewport on resize/scroll (e.g. mobile)
  useEffect(() => {
    if (!isOpen) return;
    const onScrollOrResize = () => updatePosition();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [isOpen]);

  return (
    <div className="relative">
      {/* Trigger - min 44px touch target on mobile */}
      <button
        ref={triggerRef}
        onClick={handleToggle}
        className="p-2 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors cursor-pointer touch-manipulation"
        aria-label="More options"
        aria-expanded={isOpen}
      >
        <FiMoreHorizontal size={20} className="text-gray-700" />
      </button>

      {/* Dropdown - portal so it is not clipped by parent overflow (e.g. post card) */}
      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={panelRef}
            className="fixed w-56 max-w-[calc(100vw-1rem)] bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-[100]"
            style={{
              top: position.top,
              left: position.left,
              minWidth: "8rem",
            }}
          >
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
          </div>,
          document.body
        )}
    </div>
  );
};
