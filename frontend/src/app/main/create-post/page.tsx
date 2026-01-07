"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { BiChevronDown, BiSearch } from "react-icons/bi";
import { Tab } from "@/components/reuseComponents/Tabs";
import RichTextEditor from "@/components/reuseComponents/RichTextEditor";
import PostingGuide from "@/components/reuseComponents/PostingGuide";
import TagsInput from "@/components/reuseComponents/TagsInput";
import { boardsApi, Board, postsApi, Language } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";

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
    { id: "text", label: t("tabs.text") },
    { id: "images", label: t("tabs.images") },
    { id: "link", label: t("tabs.link") },
    { id: "poll", label: t("tabs.poll"), disabled: true },
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
      // router.push(`/main/feed`);
    } catch (error: any) {
      console.error("Error creating post:", error);
      const errorMessage = error?.message || tToast("postError") || "Failed to create post. Please try again.";
      showError(errorMessage);
    } finally {
      setIsPosting(false);
    }
  };

  const handleSaveDraft = () => {
    console.log("Saving draft:", { title, body, community: selectedCommunity });
    // Add your save draft logic here
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
  const handleSelectBoard = (board: Board) => {
    setSelectedCommunity(board);
    setShowCommunity(false);
    setShowDropdown(false);
    setSearchQuery("");
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">{t("title")}</h1>
          <button className="text-sm text-gray-600 hover:text-gray-800 font-semibold">{t("drafts")}</button>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Community Selector */}
          <div ref={communityRef}>
            {!showCommunity && (
              <div className="p-6 pb-4">
                <button
                  onClick={() => {
                    setShowCommunity(true);
                    setShowDropdown(true);
                    fetchBoards("");
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">r</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {selectedCommunity ? `r/${selectedCommunity.name}` : t("selectCommunity")}
                  </span>
                  <BiChevronDown size={16} className="text-gray-600" />
                </button>
              </div>
            )}
            {showCommunity && (
              <div className="relative flex-1 max-w-md m-4">
                <BiSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                <input
                  type="text"
                  placeholder={t("selectCommunity")}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                />
                
                {/* Dropdown with boards */}
                {showDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto z-50">
                    {isLoadingBoards ? (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        Loading...
                      </div>
                    ) : boards.length > 0 ? (
                      boards.map((board) => (
                        <button
                          key={board.id}
                          onClick={() => handleSelectBoard(board)}
                          className="w-full px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3 text-left"
                        >
                          <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">r</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900">r/{board.name}</p>
                            {board.description && (
                              <p className="text-xs text-gray-500 truncate">{board.description}</p>
                            )}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        {searchQuery ? "No boards found" : "No boards available"}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Tabs */}
          <div className="px-6 border-b border-gray-200">
            <div className="flex gap-12">
              {tabs.map((tab) => (
                <Tab key={tab.id} label={tab.label} active={activeTab === tab.id} onClick={() => !tab.disabled && setActiveTab(tab.id)} />
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6">
            {/* Title Input */}
            <div className="mb-4">
              <input
                type="text"
                placeholder={t("titlePlaceholder")}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={300}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-400"
              />
              <div className="text-right mt-1">
                <span className="text-xs text-gray-500">
                  {title.length}/300 {t("characters")}
                </span>
              </div>
            </div>

            {/* Tags Input */}
            <TagsInput tags={tags} onChange={setTags} />

            {/* Rich Text Editor */}
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <RichTextEditor value={body} onChange={(text: any) => setBody(text) }/>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={handleSaveDraft}
                className="px-6 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              >
                {t("saveDraft")}
              </button>
              <button
                onClick={handlePost}
                disabled={!title.trim() || isPosting || !selectedCommunity}
                className={`px-8 py-2 text-sm font-semibold rounded-full transition-colors ${
                  title.trim() && !isPosting && selectedCommunity
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {isPosting ? "Posting..." : t("post")}
              </button>
            </div>
          </div>
        </div>

        {/* Guidelines Card */}
        <PostingGuide />
      </div>
    </div>
  );
};

export default CreatePost;
