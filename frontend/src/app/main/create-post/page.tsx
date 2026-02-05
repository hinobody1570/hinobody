"use client";

import { JoinBoardPopup } from "@/components/modals/JoinBoardPopup";
import Loading from "@/components/reuseComponents/Loading";
import PostingGuide from "@/components/reuseComponents/PostingGuide";
import RichTextEditor from "@/components/reuseComponents/RichTextEditor";
import { Tab } from "@/components/reuseComponents/Tabs";
import TagsInput from "@/components/reuseComponents/TagsInput";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/contexts/ToastContext";
import { Board, boardsApi, Language, postsApi } from "@/lib/api";
import { ROUTE_PATHS } from "@/routes/paths";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { BiChevronDown, BiSearch } from "react-icons/bi";

// Main Create Post Component
const CreatePost = () => {
  const t = useTranslations("createPost");
  const tToast = useTranslations("toast");
  const { locale } = useLanguage();
  const { showSuccess, showError } = useToast();
  const router = useRouter();
  const communityRef = useRef<HTMLDivElement | null>(null);
  const [activeTab, setActiveTab] = useState("text");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState<Board | null>(null);
  const [showCommunity, setShowCommunity] = useState(false);
  const [boards, setBoards] = useState<Board[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingBoards, setIsLoadingBoards] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [showJoinPopup, setShowJoinPopup] = useState(false);
  const [boardToJoin, setBoardToJoin] = useState<Board | null>(null);

  // Map locale to Language enum
  const getLanguage = (): Language => {
    const localeMap: Record<string, Language> = {
      en: 'EN',
      ko: 'KO',
      zh: 'ZH', 
      ja: 'JA',
    };
    return localeMap[locale] || 'EN';
  };

  const tabs = [
    { id: "text", label: t("tabs.text"), disabled: false },
    // { id: "images", label: t("tabs.images") },
    // { id: "link", label: t("tabs.link") },
    // { id: "poll", label: t("tabs.poll"), disabled: true },
  ];

  const handlePost = async () => {
    // Validation
    if (!title.trim()) {
      showError(t("titleRequired"));
      return;
    }

    if (!body.trim()) {
      showError(t("bodyRequired"));
      return;
    }

    if (!selectedCommunity) {
      showError(t("communityRequired"));
      return;
    }

    // Check membership before posting
    try {
      const membership = await boardsApi.getMembershipStatus(selectedCommunity.id);
      if (!membership || membership.status !== "APPROVED") {
        // Show popup to join board
        setBoardToJoin(selectedCommunity);
        setShowJoinPopup(true);
        return;
      }
    } catch (error: any) {
      // If membership check fails, still try to post and let backend handle it
      console.warn("Could not check membership status:", error);
    }

    setIsPosting(true);
    try {
      const postData = {
        title: title.trim(),
        body: body.trim(),
        originalLanguage: getLanguage(),
        boardId: selectedCommunity.id,
        tags: tags.length > 0 ? tags : undefined,
        // imageIds can be added later when image upload is implemented
      };
      await postsApi.create(postData);
      
      // Show success message
      showSuccess(tToast("postSuccess") || "Post created successfully!");
      
      // Reset form
      setTitle("");
      setBody("");
      setSelectedCommunity(null);
      setTags([]);
      
      // Optionally navigate to the post or feed
      router.push(ROUTE_PATHS.HOME);
    } catch (error: any) {
      console.error("Error creating post:", error);
      const errorMessage = error?.message || tToast("postError") || "Failed to create post. Please try again.";
      
      // Check if error is about membership and show popup
      if (errorMessage.includes("join") || errorMessage.includes("member") || errorMessage.includes("pending")) {
        setBoardToJoin(selectedCommunity);
        setShowJoinPopup(true);
      } else {
        showError(errorMessage);
      }
    } finally {
      setIsPosting(false);
    }
  };

  const handleSaveDraft = async () => {
    // Basic validation for draft
    if (!title.trim() && !body.trim()) {
      showError(t("draftEmpty"));
      return;
    }

    if (!selectedCommunity) {
      showError(t("communityRequired"));
      return;
    }

    setIsPosting(true);
    try {
      const postData = {
        title: title.trim() || t("untitledDraft"),
        body: body.trim() || "",
        originalLanguage: getLanguage(),
        boardId: selectedCommunity.id,
        tags: tags.length > 0 ? tags : undefined,
        isActive: false, // Save as draft
        // imageIds can be added later when image upload is implemented
      };
      await postsApi.create(postData);
      
      // Show success message
      showSuccess(tToast("draftSaved"));
      
      // Reset form
      setTitle("");
      setBody("");
      setSelectedCommunity(null);
      setTags([]);
    } catch (error: any) {
      console.error("Error saving draft:", error);
      const errorMessage = error?.message || tToast("draftError");
      showError(errorMessage);
    } finally {
      setIsPosting(false);
    }
  };

  // Fetch boards from API
  const fetchBoards = useCallback(async (search: string = "") => {
    setIsLoadingBoards(true);
    try {
      const response = await boardsApi.getAll(1, 20, search);
      // The API returns { data: Board[], meta: {...} }
      if (response.data) {
        setBoards(response.data);
      } else {
        setBoards([]);
      }
    } catch (error) {
      console.error("Error fetching boards:", error);
      setBoards([]);
    } finally {
      setIsLoadingBoards(false);
    }
  }, []);

  // Fetch boards when component mounts or search query changes
  useEffect(() => {
    if (showCommunity) {
      // Debounce search to avoid too many API calls
      const timeoutId = setTimeout(() => {
        fetchBoards(searchQuery);
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [showCommunity, searchQuery, fetchBoards]);

  // Handle board selection
  const handleSelectBoard = async (board: Board) => {
    setSelectedCommunity(board);
    setShowCommunity(false);
    setShowDropdown(false);
    setSearchQuery("");
    
    // Check membership status when board is selected (optional - for UI feedback)
    // This is optional and doesn't block selection
    try {
      const membership = await boardsApi.getMembershipStatus(board.id);
      // Could show a visual indicator here if needed
    } catch (error) {
      // Silently fail - we'll check again when posting
    }
  };

  const handleJoinSuccess = async () => {
    // Refresh membership status and allow posting
    if (boardToJoin) {
      try {
        const membership = await boardsApi.getMembershipStatus(boardToJoin.id);
        if (membership && membership.status === "APPROVED") {
          // User is now a member, they can post
          setShowJoinPopup(false);
          setBoardToJoin(null);
        }
      } catch (error) {
        // Ignore errors
      }
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (communityRef.current && !communityRef.current.contains(event.target as Node)) {
        setShowCommunity(false);
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{t("title")}</h1>
          {/* <button
            type="button"
            className="text-sm text-gray-600 hover:text-gray-800 font-semibold cursor-pointer w-fit touch-manipulation"
          >
            {t("drafts")}
          </button> */}
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Community Selector */}
          <div ref={communityRef}>
            {!showCommunity && (
              <div className="p-3 sm:p-4 md:p-6 pb-2 sm:pb-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCommunity(true);
                    setShowDropdown(true);
                    fetchBoards("");
                  }}
                  className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start px-4 py-2.5 sm:py-2 min-h-[44px] sm:min-h-0 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors cursor-pointer touch-manipulation"
                >
                  <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">r</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-700 truncate min-w-0">
                    {selectedCommunity ? `r/${selectedCommunity.name}` : t("selectMenu")}
                  </span>
                  <BiChevronDown size={16} className="text-gray-600 flex-shrink-0" />
                </button>
              </div>
            )}
            {showCommunity && (
              <div className="relative w-full max-w-full sm:max-w-md m-3 sm:m-4">
                <BiSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10 flex-shrink-0" />
                <input
                  type="text"
                  placeholder={t("selectCommunity")}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  className="w-full pl-10 pr-4 py-2.5 sm:py-2 bg-gray-50 border border-gray-300 rounded-full text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                />
                {/* Dropdown with boards */}
                {showDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[min(320px,60vh)] overflow-y-auto z-50">
                    {isLoadingBoards ? (
                      <Loading />
                    ) : boards.length > 0 ? (
                      boards.map((board) => (
                        <button
                          key={board.id}
                          type="button"
                          onClick={() => handleSelectBoard(board)}
                          className="w-full px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3 text-left cursor-pointer min-h-[44px] sm:min-h-0 touch-manipulation"
                        >
                          <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">r</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">r/{board.name}</p>
                            {board.description && (
                              <p className="text-xs text-gray-500 truncate">{board.description}</p>
                            )}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        {searchQuery ? t("noBoardsFound") : t("noBoardsAvailable")}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Tabs */}
          <div className="px-3 sm:px-4 md:px-6 border-b border-gray-200 overflow-x-auto">
            <div className="flex flex-nowrap gap-4 sm:gap-8 md:gap-12 min-w-min">
              {tabs.map((tab) => (
                <Tab key={tab.id} label={tab.label} active={activeTab === tab.id} onClick={() => !tab.disabled && setActiveTab(tab.id)} />
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="p-3 sm:p-4 md:p-6">
            {/* Title Input */}
            <div className="mb-3 sm:mb-4">
              <input
                type="text"
                placeholder={t("titlePlaceholder")}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={300}
                className="w-full min-w-0 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-400 text-base sm:text-inherit"
              />
              <div className="text-right mt-1">
                <span className="text-xs text-gray-500">
                  {title.length}/300 {t("characters")}
                </span>
              </div>
            </div>

            {/* Tags Input */}
            <TagsInput tags={tags} onChange={setTags} />

            {/* Rich Text Editor - toolbar scrolls horizontally on small screens */}
            <div className="border border-gray-300 rounded-lg overflow-x-auto overflow-y-hidden">
              <RichTextEditor value={body} onChange={(text: any) => setBody(text) }/>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
              {/* <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isPosting || !selectedCommunity}
                className={`w-full sm:w-auto min-h-[44px] sm:min-h-0 px-6 py-2.5 sm:py-2 text-sm font-semibold rounded-full transition-colors touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed ${
                  !isPosting && selectedCommunity
                    ? "text-gray-700 hover:bg-gray-100"
                    : "text-gray-400 cursor-not-allowed"
                }`}
              >
                {isPosting ? t("saving") : t("saveDraft")}
              </button> */}
              <button
                type="button"
                onClick={handlePost}
                disabled={!title.trim() || isPosting || !selectedCommunity}
                className={`w-full sm:w-auto min-h-[44px] cursor-pointer sm:min-h-0 px-8 py-2.5 sm:py-2 text-sm font-semibold rounded-full transition-colors touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed ${
                  title.trim() && !isPosting && selectedCommunity
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {isPosting ? t("posting") : t("post")}
              </button>
            </div>
          </div>
        </div>

        {/* Guidelines Card */}
        <PostingGuide />
      </div>

      {/* Join Board Popup */}
      <JoinBoardPopup
        board={boardToJoin}
        isOpen={showJoinPopup}
        onClose={() => {
          setShowJoinPopup(false);
          setBoardToJoin(null);
        }}
        onJoinSuccess={handleJoinSuccess}
      />
    </div>
  );
};

export default CreatePost;
