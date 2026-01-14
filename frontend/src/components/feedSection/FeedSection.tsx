"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { CiCalendar } from "react-icons/ci";
import { IoChevronDown } from "react-icons/io5";
import { PostCard } from "../reuseComponents/PostCard";
import { RecentPostCard } from "../reuseComponents/RecentPostCard";
import { postsApi, Post } from "@/lib/api";
import DP from "./../../../public/assets/images/avatar_default_4.png";

// Helper function to format timestamp
const formatTimestamp = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} sec. ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? 'min' : 'mins'}. ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? 'hr' : 'hrs'}. ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  } else {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  }
};

// Transform API post to PostCard format
const transformPost = (post: Post): any => {
  return {
    id: post.id,
    boardId: post.boardId, // Add boardId for membership checks
    authorId: post.authorId, // Add authorId for comment OP badge
    community: post.board?.name ? `r/${post.board.name}` : "r/community",
    communityAvatar: DP, // Default avatar
    verified: false, // Can be enhanced later based on board settings
    timestamp: formatTimestamp(post.createdAt),
    title: post.title,
    image: post.images && post.images.length > 0 ? post.images[0].url : null,
    upvotes: post.upvoteCount || 0,
    downvotes: post.downvoteCount || 0,
    comments: post.commentCount || 0,
    body: post.body || ""
  };
};

const recentPosts = [
  {
    id: 1,
    community: "r/FarmMergeValley",
    avatar: DP,
    timestamp: "5d ago",
    title: "Don't miss your daily reward! 🎁",
    upvotes: 731,
    comments: "1.7K",
  },
  {
    id: 2,
    community: "r/gaming",
    avatar: DP,
    timestamp: "2d ago",
    title: "Best indie games of 2024",
    upvotes: 1243,
    comments: "2.3K",
  },
  {
    id: 3,
    community: "r/photography",
    avatar: DP,
    timestamp: "1d ago",
    title: "Tips for beginners in landscape photography",
    upvotes: 456,
    comments: "892",
  },
];

export const RedditFeed = () => {
  const t = useTranslations('feed');
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await postsApi.getAll({
          page: 1,
          limit: 20,
        });
        const transformedPosts = response.data.map(transformPost);
        setPosts(transformedPosts);
      } catch (err: any) {
        console.error('Error fetching posts:', err);
        setError(err.message || 'Failed to load posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-2">
            {/* Sort Options */}
            <div className="flex items-center gap-2 mb-4">
              <button
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-semibold">{t('best')}</span>
                <IoChevronDown size={16} />
              </button>
              <button
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
              >
                <CiCalendar size={16} />
                <IoChevronDown size={16} />
              </button>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">Loading posts...</div>
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
                <div className="text-gray-500">No posts available</div>
              </div>
            )}

            {!loading && !error && posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {/* Sidebar - Recent Posts */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-300 rounded-lg p-4 sticky top-8 z-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-600 uppercase">{t('recentPosts')}</h3>
                <button className="text-sm text-blue-600 hover:underline font-semibold">{t('clear')}</button>
              </div>

              <div className="space-y-2">
                {recentPosts.map((post) => (
                  <RecentPostCard key={post.id} post={post} />
                ))}
              </div>

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
        </div>
      </div>
    </div>
  );
};

export default RedditFeed;
