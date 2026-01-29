"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect, useCallback, useRef } from "react";
import { CiCalendar } from "react-icons/ci";
import { IoChevronDown } from "react-icons/io5";
import { PostCard } from "../reuseComponents/PostCard";
import { RecentPostCard } from "../reuseComponents/RecentPostCard";
import { postsApi, Post, boardsApi, Board } from "@/lib/api";
import DP from "./../../../public/assets/images/avatar_default_4.png";
import { formatTimestamp } from "@/utils/helperFunction";

// Transform API post to PostCard format
const transformPost = (post: Post, tTime: (key: string, values?: Record<string, number | string>) => string): any => {
  return {
    id: post.id,
    boardId: post.boardId, // Add boardId for membership checks
    authorId: post.authorId, // Add authorId for comment OP badge
    community: post.board?.name ? `r/${post.board.name}/${post.author?.nickname}` : "r/community",
    communityAvatar: DP, // Default avatar
    verified: false, // Can be enhanced later based on board settings
    timestamp: formatTimestamp(post.createdAt, tTime),
    title: post.title,
    image: post.images && post.images.length > 0 ? post.images[0].url : null,
    upvotes: post.upvoteCount || 0,
    downvotes: post.downvoteCount || 0,
    comments: post.commentCount || 0,
    body: post.body || ""
  };
};

// Transform API post to RecentPostCard format
const transformRecentPost = (post: Post, tTime: (key: string, values?: Record<string, number | string>) => string): any => {
  return {
    id: post.id,
    community: post.board?.name ? `r/${post.board.name}` : "r/community",
    avatar: DP, // Default avatar
    timestamp: formatTimestamp(post.createdAt, tTime),
    title: post.title,
    upvotes: post.upvoteCount || 0,
    comments: post.commentCount || 0,
  };
};

export const RedditFeed = () => {
  const t = useTranslations('feed');
  const tTime = useTranslations('timeAgo');
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [observerTarget, setObserverTarget] = useState<HTMLDivElement | null>(null);
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [selectedBoardName, setSelectedBoardName] = useState<string>(t('allBoards'));
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [showRecentPosts, setShowRecentPosts] = useState(true);
  const [loadingRecentPosts, setLoadingRecentPosts] = useState(true);

  // Fetch boards on mount
  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const response = await boardsApi.getAll(1, 100); // Get first 100 boards
        setBoards(response.data);
      } catch (err: any) {
        console.error('Error fetching boards:', err);
      }
    };

    fetchBoards();
  }, []);

  // Fetch recent posts (last 4)
  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        setLoadingRecentPosts(true);
        const response = await postsApi.getAll({
          page: 1,
          limit: 4,
        });
        const transformedRecentPosts = response.data.map((p) => transformRecentPost(p, tTime));
        setRecentPosts(transformedRecentPosts);
      } catch (err: any) {
        console.error('Error fetching recent posts:', err);
      } finally {
        setLoadingRecentPosts(false);
      }
    };

    if (showRecentPosts) {
      fetchRecentPosts();
    }
  }, [showRecentPosts]);

  // Handle clear recent posts
  const handleClearRecentPosts = () => {
    setShowRecentPosts(false);
  };

  // Fetch posts with board filter
  const fetchPosts = useCallback(async (page: number = 1, boardId?: string | null, append: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const response = await postsApi.getAll({
        page,
        limit: 20,
        boardId: boardId || undefined,
      });
      const transformedPosts = response.data.map((p) => transformPost(p, tTime));
      
      if (append) {
        setPosts((prev) => [...prev, ...transformedPosts]);
      } else {
        setPosts(transformedPosts);
      }
      
      setCurrentPage(page);
      setHasMore(response.meta.page < response.meta.totalPages);
    } catch (err: any) {
      console.error('Error fetching posts:', err);
      setError(err.message || t('failedToLoadPosts'));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Initial load and when board filter changes
  useEffect(() => {
    fetchPosts(1, selectedBoardId, false);
  }, [selectedBoardId, fetchPosts]);

  // Load more posts
  const loadMorePosts = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    await fetchPosts(currentPage + 1, selectedBoardId, true);
  }, [currentPage, loadingMore, hasMore, selectedBoardId, fetchPosts]);

  // Handle board selection
  const handleBoardSelect = (board: Board | null) => {
    if (board) {
      setSelectedBoardId(board.id);
      setSelectedBoardName(`r/${board.name}`);
    } else {
      setSelectedBoardId(null);
      setSelectedBoardName(t('best'));
    }
    setIsDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!observerTarget || !hasMore || loadingMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMorePosts();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(observerTarget);

    return () => {
      observer.disconnect();
    };
  }, [observerTarget, hasMore, loadingMore, loading, loadMorePosts]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-2">
            {/* Sort Options */}
            <div className="flex items-center gap-2 mb-4">
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <span className="text-sm font-semibold">{selectedBoardName}</span>
                  <IoChevronDown size={16} className={isDropdownOpen ? 'transform rotate-180' : ''} />
                </button>
                
                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                    <div className="p-2">
                      <button
                        onClick={() => handleBoardSelect(null)}
                        className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 transition-colors cursor-pointer ${
                          selectedBoardId === null ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700'
                        }`}
                      >
                        {t('allBoards')}
                      </button>
                      <div className="border-t border-gray-200 my-1"></div>
                      {boards.map((board) => (
                        <button
                          key={board.id}
                          onClick={() => handleBoardSelect(board)}
                          className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 transition-colors cursor-pointer ${
                            selectedBoardId === board.id ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700'
                          }`}
                        >
                          r/{board.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {/* <button
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <CiCalendar size={16} />
                <IoChevronDown size={16} />
              </button> */}
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">{t('loadingPosts')}</div>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {/* Posts */}
            {!loading && !error && posts.length === 0 && (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">{t('noPostsAvailable')}</div>
              </div>
            )}

            {!loading && !error && (
              <>
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
                
                {/* Infinite scroll trigger */}
                {hasMore && (
                  <div ref={setObserverTarget} className="py-4">
                    {loadingMore && (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-gray-500">{t('loadingMorePosts')}</div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* End of feed message */}
                {!hasMore && posts.length > 0 && (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-gray-500">{t('noMorePostsToLoad')}</div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar - Recent Posts */}
          {showRecentPosts && (
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-300 rounded-lg p-4 sticky top-8 z-0">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-600 uppercase">{t('recentPosts')}</h3>
                  <button 
                    onClick={handleClearRecentPosts}
                    className="text-sm text-blue-600 hover:underline font-semibold cursor-pointer"
                  >
                    {t('clear')}
                  </button>
                </div>

                {loadingRecentPosts ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-gray-500 text-sm">{t('loadingPosts')}</div>
                  </div>
                ) : recentPosts.length > 0 ? (
                  <div className="space-y-2">
                    {recentPosts.map((post) => (
                      <RecentPostCard key={post.id} post={post} />
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-gray-500 text-sm">{t('noRecentPosts')}</div>
                  </div>
                )}

                {/* Footer Links */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
                    <a href="#" className="hover:underline">
                      {t('redditRules')}
                    </a>
                    <a href="#" className="hover:underline">
                      {t('privacyPolicy')}
                    </a>
                    <a href="#" className="hover:underline">
                      {t('userAgreement')}
                    </a>
                    <a href="#" className="hover:underline">
                      {t('accessibility')}
                    </a>
                  </div>
                  <p className="text-xs text-gray-500">{t('redditCopyright')}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RedditFeed;
