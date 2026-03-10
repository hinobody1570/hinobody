"use client";

import { ROUTE_PATHS } from "@/routes/paths";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MdOutlineArticle, MdOutlineComment, MdOutlineMail } from "react-icons/md";
import { useToast } from "@/contexts/ToastContext";

interface AuthorPopupProps {
  authorId: string;
  authorName: string;
  children: React.ReactNode;
}

export const AuthorPopup = ({ authorId, authorName, children }: AuthorPopupProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const tPostCard = useTranslations("postCard");
  const { showInfo } = useToast();

  // Update popup position when opening - useLayoutEffect to avoid flash at (0,0)
  useLayoutEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPopupPosition({ top: rect.bottom + 4, left: rect.left });
    }
  }, [isOpen]);

  // Close when clicking outside - popup is in portal, so check both trigger and popup
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedInside = containerRef.current?.contains(target) || popupRef.current?.contains(target);
      if (!clickedInside) {
        setIsOpen(false);
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleViewPosts = () => {
    router.push(`${ROUTE_PATHS.USER_PROFILE}/${authorId}?scrollTo=posts`);
    setIsOpen(false);
  };

  const handleViewComments = () => {
    router.push(`${ROUTE_PATHS.USER_PROFILE}/${authorId}?tab=comments&scrollTo=comments`);
    setIsOpen(false);
  };

  const handleSendMessage = () => {
    // router.push(`${ROUTE_PATHS.CHAT}`);

    showInfo(tPostCard("sendMessageComingSoon") || "Send message - Coming soon");
    setIsOpen(false);
  };

  return (
    <div className="relative inline-flex flex-col min-w-0" ref={containerRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className="text-sm hover:underline cursor-pointer truncate min-w-0 text-left"
        title={authorName}
      >
        {children}
      </button>
      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={popupRef}
            className="fixed w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 overflow-hidden z-[100]"
            style={{
              top: popupPosition.top,
              left: popupPosition.left,
            }}
          >
            <button
              type="button"
              onClick={handleViewPosts}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 transition-colors text-left cursor-pointer"
            >
              <MdOutlineArticle size={20} className="text-gray-700 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-800">{tPostCard("viewPostsByThisUser")}</span>
            </button>
            <button
              type="button"
              onClick={handleViewComments}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 transition-colors text-left cursor-pointer"
            >
              <MdOutlineComment size={20} className="text-gray-700 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-800">{tPostCard("viewCommentsByThisUser")}</span>
            </button>
            <button
              type="button"
              onClick={handleSendMessage}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 transition-colors text-left cursor-pointer"
            >
              <MdOutlineMail size={20} className="text-gray-700 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-800">{tPostCard("sendMessage")}</span>
            </button>
          </div>,
          document.body,
        )}
    </div>
  );
};
