'use client';

import { useEffect, useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { boardsApi, Board, postsApi, Post } from '@/lib/api';
import { ROUTE_PATHS } from '@/routes/paths';
import { PostCard } from '@/components/reuseComponents/PostCard';
import { formatTimestamp } from '@/utils/helperFunction';
import DP from '../../../../../public/assets/images/avatar_default_4.png';
import { useAuth } from '@/contexts/AuthContext';
import Loading from '@/components/reuseComponents/Loading';

const transformPost = (post: Post, tTime: (key: string, values?: Record<string, number | string>) => string): any => {
  return {
    id: post.id,
    boardId: post.boardId,
    authorId: post.authorId,
    community: post.board?.name ? `r/${post.board.name}` : "r/community",
    communityAvatar: DP,
    verified: false,
    timestamp: formatTimestamp(post.createdAt, tTime),
    title: post.title,
    image: post.images && post.images.length > 0 ? post.images[0].url : null,
    upvotes: post.upvoteCount || 0,
    downvotes: post.downvoteCount || 0,
    comments: post.commentCount || 0,
    body: post.body || ""
  };
};

export default function BoardProfilePage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('boardProfile');
  const tTime = useTranslations('timeAgo');
  const { locale } = useLanguage();
  const { user } = useAuth();
  const boardId = params?.boardId as string;
  
  const [board, setBoard] = useState<Board | null | any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        setLoading(true);
        setError(null);
        const boardData = await boardsApi.getById(boardId);
        setBoard(boardData);
      } catch (err: any) {
        console.error('Error fetching board:', err);
        setError(err.message || t('failedToLoadBoard'));
      } finally {
        setLoading(false);
      }
    };

    if (boardId) {
      fetchBoard();
    }
  }, [boardId]);

  useEffect(() => {
    const fetchMembership = async () => {
      if (!user || !boardId) return;
      try {
        const membership = await boardsApi.getMembershipStatus(boardId);
        setIsMember(!!membership);
      } catch (err: any) {
        console.error('Error fetching membership:', err);
      }
    };

    fetchMembership();
  }, [user, boardId]);

  useEffect(() => {
    const fetchBoardPosts = async () => {
      try {
        setLoadingPosts(true);
        const response = await postsApi.getAll({
          boardId: boardId,
          page: 1,
          limit: 20,
        });
        setPosts(response.data);
      } catch (err: any) {
        console.error('Error fetching board posts:', err);
      } finally {
        setLoadingPosts(false);
      }
    };

    if (boardId) {
      fetchBoardPosts();
    }
  }, [boardId]);

  const displayPosts = useMemo(
    () => posts.map((p) => transformPost(p, tTime)),
    [posts, tTime, locale]
  );

  const handleJoinLeave = async () => {
    if (!user) {
      router.push(ROUTE_PATHS.DEFAULT);
      return;
    }

    try {
      setIsJoining(true);
      if (isMember) {
        await boardsApi.leave(boardId);
        setIsMember(false);
      } else {
        await boardsApi.join(boardId);
        setIsMember(true);
      }
    } catch (err: any) {
      console.error('Error joining/leaving board:', err);
    } finally {
      setIsJoining(false);
    }
  };

  if (loading) {
    return (
      <Loading title={t('loadingBoard')} />
    );
  }

  if (error || !board) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-6">
        <div className="text-center max-w-md w-full">
          <p className="text-red-600 mb-4 text-sm sm:text-base">{error || t('boardNotFound')}</p>
          <button
            onClick={() => router.push(ROUTE_PATHS.HOME)}
            className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer touch-manipulation"
          >
            {t('backToHome')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        {/* Board Header */}
        <div className="bg-white border border-gray-300 rounded-lg p-4 sm:p-5 md:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5 md:gap-6 min-w-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xl sm:text-2xl">r/</span>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2 truncate">r/{board.name}</h1>
                {board.description && (
                  <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base line-clamp-3">{board.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-500">
                  <span>{t('category')}: {board.category?.name || '-'}</span>
                  <span>{t('visibility')}: {board.visibilityAccess}</span>
                  <span>{t('created')}: {formatTimestamp(board.createdAt, tTime)}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleJoinLeave}
              disabled={isJoining}
              className={`w-full sm:w-auto min-h-[44px] sm:min-h-0 px-6 py-2.5 sm:py-2 rounded-full font-semibold transition-colors cursor-pointer flex-shrink-0 touch-manipulation ${
                isMember
                  ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isJoining ? t('loading') : isMember ? t('joined') : t('join')}
            </button>
          </div>
        </div>

        {/* Board Posts */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">{t('posts')} ({displayPosts.length})</h2>
          
          {loadingPosts ? (
            <div className="flex items-center justify-center py-8 sm:py-12">
              <div className="text-gray-500 text-sm sm:text-base">{t('loadingPosts')}</div>
            </div>
          ) : displayPosts.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {displayPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-gray-300 rounded-lg p-6 sm:p-8 text-center">
              <p className="text-gray-500 text-sm sm:text-base">{t('noPosts')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

