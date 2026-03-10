"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import { commentsApi, Comment as CommentType, Language } from '@/lib/api';
import { formatTimestamp } from '@/utils/helperFunction';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ROUTE_PATHS } from '@/routes/paths';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BiChevronDown, BiSearch } from 'react-icons/bi';
import DP from '../../../public/assets/images/avatar_default_4.png';
import Comment from './Comment';
import { LoginRequiredModal } from '../modals/LoginRequiredModal';


// Transform API comment to Comment component format
const transformComment = (
  comment: CommentType,
  postAuthorId?: string,
  t?: any,
  tTime?: (key: string, values?: Record<string, number | string>) => string
): any => {
  return {
    id: comment.id,
    username: comment.author?.nickname || (t ? t('anonymous') : 'Anonymous'),
    avatar: DP, // Default avatar
    badge: comment.authorId === postAuthorId ? 'OP' : undefined,
    timestamp: formatTimestamp(comment.createdAt, tTime),
    text: comment.body,
    upvotes: comment.upvoteCount || 0,
    downvotes: comment.downvoteCount || 0,
    edited: comment.updatedAt !== comment.createdAt,
    editedTime: comment.updatedAt !== comment.createdAt ? formatTimestamp(comment.updatedAt, tTime) : undefined,
    replies: comment.replies ? comment.replies.map((reply) => transformComment(reply, postAuthorId, t, tTime)) : [],
  };
};

interface CommentsSectionProps {
  postId: string;
  postAuthorId?: string;
  onCommentAdded?: () => void;
}

// Main Comments Section Component
export const CommentsSection = ({ postId, postAuthorId, onCommentAdded }: CommentsSectionProps) => {
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();
  const { locale } = useLanguage();
  const router = useRouter();
  const t = useTranslations('comments');
  const tRef = useRef(t);
  tRef.current = t;
  const tTime = useTranslations('timeAgo');
  const [sortBy, setSortBy] = useState(t('best'));
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [observerTarget, setObserverTarget] = useState<HTMLDivElement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Map locale to Language enum
  const getLanguage = (): Language => {
    const localeMap: Record<string, Language> = {
      'en': 'EN',
      'ko': 'KO',
      'zh': 'ZH',
      'ja': 'JA',
    };
    return localeMap[locale] || 'EN';
  };

  const fetchComments = useCallback(async (page: number = 1, append: boolean = false, search?: string) => {
    if (!postId) {
      setLoading(false);
      return;
    }

    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const response = await commentsApi.getByPost(postId, page, 20, search);

      if (append) {
        setComments((prev) => [...prev, ...response.data]);
      } else {
        setComments(response.data);
      }

      setCurrentPage(page);
      setHasMore(response.meta.page < response.meta.totalPages);
    } catch (err: any) {
      console.error('Error fetching comments:', err);
      setError(err.message || tRef.current('failedToLoadComments'));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [postId, postAuthorId]);

  // Handle search with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      // If search is cleared, fetch all comments
      setIsSearching(false);
      fetchComments(1, false);
      return;
    }

    // Debounce search
    const searchTimer = setTimeout(() => {
      setIsSearching(true);
      fetchComments(1, false, searchQuery.trim());
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(searchTimer);
    };
  }, [searchQuery, fetchComments]);

  // Load more comments
  const loadMoreComments = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    await fetchComments(currentPage + 1, true);
  }, [currentPage, loadingMore, hasMore, fetchComments]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!observerTarget || !hasMore || loadingMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreComments();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(observerTarget);

    return () => {
      observer.disconnect();
    };
  }, [observerTarget, hasMore, loadingMore, loading, loadMoreComments]);

  // Transform comments for display - re-runs when locale changes so timestamps update
  const displayComments = useMemo(
    () => comments.map((c) => transformComment(c, postAuthorId, t, tTime)),
    [comments, postAuthorId, t, tTime, locale]
  );

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setLoginModalOpen(true);
      return;
    }

    if (!newComment.trim()) {
      showError(t('pleaseEnterComment'));
      return;
    }

    try {
      setIsSubmitting(true);
      await commentsApi.create({
        body: newComment.trim(),
        originalLanguage: getLanguage(),
        postId: postId,
      });
      setNewComment('');
      showSuccess(t('commentAddedSuccess'));
      onCommentAdded?.();
      // Refresh comments from page 1
      await fetchComments(1, false);
    } catch (err: any) {
      console.error('Error creating comment:', err);
      showError(err.message || t('commentAddError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6">

      {/* Comment Input - stacked on mobile, row on tablet+ */}
      <form onSubmit={handleSubmitComment} className="mb-4 sm:mb-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={isAuthenticated ? t('joinConversation') : t('loginToComment')}
            onFocus={() => {
              if (!isAuthenticated) {
                setLoginModalOpen(true);
              }
            }}
            disabled={isSubmitting}
            className="flex-1 min-w-0 px-4 py-3 bg-gray-50 border border-gray-300 rounded-full text-base sm:text-inherit focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="w-full sm:w-auto min-h-[44px] sm:min-h-0 px-6 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation flex-shrink-0"
          >
            {isSubmitting ? t('posting') : t('post')}
          </button>
        </div>
      </form>

      <LoginRequiredModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLogin={() => {
          const current = `${window.location.pathname}${window.location.search}`;
          router.push(`${ROUTE_PATHS.LOGIN}?redirect=${encodeURIComponent(current)}`);
        }}
      />

      {/* Sort and Search - stacked on mobile, row on tablet+ */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 mb-4 sm:mb-6">
        {/* <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-sm text-gray-600">{t('sortBy')}</span>
          <button
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-gray-800 hover:bg-gray-100 rounded transition-colors cursor-pointer touch-manipulation"
            onClick={() => setSortBy(t('best'))}
          >
            {sortBy}
            <BiChevronDown size={16} />
          </button>
        </div> */}

        <div className="relative flex-1 w-full min-w-0 max-w-full">
          <BiSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchComments')}
            className="w-full pl-10 pr-9 sm:pr-4 py-2.5 sm:py-2 bg-gray-50 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full cursor-pointer touch-manipulation"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-6 sm:py-8">
          <div className="text-gray-500 text-sm sm:text-base">{t('loadingComments')}</div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
          <p className="text-red-600 text-sm sm:text-base">{error}</p>
        </div>
      )}

      {/* Comments List */}
      {!loading && !error && displayComments.length === 0 && (
        <div className="flex items-center justify-center py-6 sm:py-8">
          <div className="text-gray-500 text-sm sm:text-base text-center px-2">
            {isSearching || searchQuery ? t('noCommentsFound') : t('noCommentsYet')}
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-3 sm:space-y-4">
          {displayComments.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              postId={postId}
              postAuthorId={postAuthorId}
              onReplyAdded={() => {
                onCommentAdded?.();
                fetchComments(1, false);
              }}
            />
          ))}
          
          {/* Infinite scroll trigger - only show when not searching */}
          {!searchQuery && hasMore && (
            <div ref={setObserverTarget} className="py-3 sm:py-4">
              {loadingMore && (
                <div className="flex items-center justify-center py-3 sm:py-4">
                  <div className="text-gray-500 text-sm sm:text-base">{t('loadingMoreComments')}</div>
                </div>
              )}
            </div>
          )}

          {/* End of comments message - only show when not searching */}
          {!searchQuery && !hasMore && displayComments.length > 0 && (
            <div className="flex items-center justify-center py-3 sm:py-4">
              <div className="text-gray-500 text-sm sm:text-base">{t('noMoreComments')}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};