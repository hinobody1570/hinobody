"use client";

import { useState } from "react";
import { FiX } from "react-icons/fi";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { ROUTE_PATHS } from "@/routes/paths";
import Image from "next/image";
import DP from "./../../../public/assets/images/avatar_default_4.png";
import { formatTimestamp } from "@/utils/helperFunction";

interface SearchResultsModalProps {
  results: {
    users: {
      data: any[];
      meta: any;
    };
    posts: {
      data: any[];
      meta: any;
    };
    boards: {
      data: any[];
      meta: any;
    };
  };
  searchQuery: string;
  onClose: () => void;
}

export const SearchResultsModal = ({ results, searchQuery, onClose }: SearchResultsModalProps) => {
  const t = useTranslations('search');
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'users' | 'posts' | 'boards'>('all');

  const handleUserClick = (userId: string) => {
    router.push(`${ROUTE_PATHS.PROFILE}/${userId}`);
    onClose();
  };

  const handlePostClick = (postId: string) => {
    router.push(`${ROUTE_PATHS.HOME}?post=${postId}`);
    onClose();
  };

  const handleBoardClick = (boardId: string) => {
    router.push(`${ROUTE_PATHS.HOME}?board=${boardId}`);
    onClose();
  };

  const totalResults = results.users.data.length + results.posts.data.length + results.boards.data.length;

  return (
    <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-xl z-50 max-h-[600px] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          {t('searchResults')} "{searchQuery}"
        </h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
        >
          <FiX size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 px-4 pt-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors cursor-pointer ${
            activeTab === 'all'
              ? 'text-orange-600 border-b-2 border-orange-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {t('all')} ({totalResults})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors cursor-pointer ${
            activeTab === 'users'
              ? 'text-orange-600 border-b-2 border-orange-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {t('users')} ({results.users.data.length})
        </button>
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors cursor-pointer ${
            activeTab === 'posts'
              ? 'text-orange-600 border-b-2 border-orange-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {t('posts')} ({results.posts.data.length})
        </button>
        <button
          onClick={() => setActiveTab('boards')}
          className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors cursor-pointer ${
            activeTab === 'boards'
              ? 'text-orange-600 border-b-2 border-orange-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {t('boards')} ({results.boards.data.length})
        </button>
      </div>

      {/* Results Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {(activeTab === 'all' || activeTab === 'users') && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">{t('users')}</h4>
            {results.users.data.length > 0 ? (
              <div className="space-y-2">
                {results.users.data.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleUserClick(user.id)}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <Image src={DP} alt={user.nickname} className="w-10 h-10 rounded-full" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{user.nickname}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">{t('noUsersFound')}</p>
            )}
          </div>
        )}

        {(activeTab === 'all' || activeTab === 'posts') && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">{t('posts')}</h4>
            {results.posts.data.length > 0 ? (
              <div className="space-y-2">
                {results.posts.data.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => handlePostClick(post.id)}
                    className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-500">r/{post.board?.name || 'community'}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{formatTimestamp(post.createdAt)}</span>
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">{post.title}</p>
                    {post.body && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{post.body.replace(/<[^>]*>/g, '')}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">{t('noPostsFound')}</p>
            )}
          </div>
        )}

        {(activeTab === 'all' || activeTab === 'boards') && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">{t('boards')}</h4>
            {results.boards.data.length > 0 ? (
              <div className="space-y-2">
                {results.boards.data.map((board) => (
                  <div
                    key={board.id}
                    onClick={() => handleBoardClick(board.id)}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">r/</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">r/{board.name}</p>
                      {board.description && (
                        <p className="text-xs text-gray-500 line-clamp-1">{board.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">{t('noBoardsFound')}</p>
            )}
          </div>
        )}

        {totalResults === 0 && (
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-gray-500">{t('noResultsFound')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

