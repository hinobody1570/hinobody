'use client';

import { CommentsSection } from '@/components/commentSection/CommentSection';
import { PostCard } from '@/components/reuseComponents/PostCard';
import { Post, postsApi } from '@/lib/api';
import { ROUTE_PATHS } from '@/routes/paths';
import { formatTimestamp } from '@/utils/helperFunction';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import DP from '../../../../../public/assets/images/avatar_default_4.png';
import Loading from '@/components/reuseComponents/Loading';

const transformPost = (post: Post, tTime: (key: string, values?: Record<string, number | string>) => string): any => {
  return {
    id: post.id,
    boardId: post.boardId,
    authorId: post.authorId,
    authorName: post.author?.nickname || "",
    community: post.board?.name ? `r/${post.board.name}` : "r/community",
    communityAvatar: DP,
    verified: false,
    timestamp: formatTimestamp(post.createdAt, tTime),
    title: post.title,
    images: post.images?.map((img) => img.url) ?? [],
    upvotes: post.upvoteCount || 0,
    downvotes: post.downvoteCount || 0,
    comments: post.commentCount || 0,
    body: post.body || ""
  };
};

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('postDetail');
  const tTime = useTranslations('timeAgo');
  const { locale } = useLanguage();
  const postId = params?.postId as string;

  const [rawPost, setRawPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);
        setNotFound(false);
        const postData = await postsApi.getById(postId);
        setRawPost(postData);
      } catch (err: any) {
        console.error('Error fetching post:', err);
        if (err?.statusCode === 404) {
          setNotFound(true);
          setRawPost(null);
          setError(null);
          return;
        }
        setError(err?.message || t('postNotFound'));
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const post = useMemo(
    () => (rawPost ? transformPost(rawPost, tTime) : null),
    [rawPost, tTime, locale]
  );

  // Sync comment count when post loads
  useEffect(() => {
    if (post) {
      setCommentCount(post.comments ?? 0);
    }
  }, [post?.id, post?.comments]);

  if (loading) {
    return (
      <Loading />
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-6">
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <span className="text-xl font-semibold text-gray-700">?</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            {t('postNotFound')}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mb-6">
            {t('notFoundDescription')}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.back()}
              className="min-h-[44px] px-4 py-2.5 sm:py-2 bg-white border border-gray-300 text-gray-800 rounded-lg hover:bg-gray-50 cursor-pointer touch-manipulation"
            >
              {t('goBack')}
            </button>
            <button
              onClick={() => router.push(ROUTE_PATHS.HOME)}
              className="min-h-[44px] px-4 py-2.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer touch-manipulation"
            >
              {t('backToHome')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-6">
        <div className="text-center max-w-md w-full">
          <p className="text-red-600 mb-4 text-sm sm:text-base">{error || t('postNotFound')}</p>
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
        {/* Post Detail */}
        <div className="mb-4 sm:mb-6">
          <PostCard
            post={post}
            onDelete={() => router.push(ROUTE_PATHS.HOME)}
            commentCount={commentCount}
            onCommentAdded={() => setCommentCount((c) => c + 1)}
          />
        </div>

        {/* Comments Section */}
        <div className="bg-white border border-gray-300 rounded-lg p-3 sm:p-4 md:p-6 overflow-hidden">
          <CommentsSection
            postId={postId}
            postAuthorId={post.authorId}
            onCommentAdded={() => setCommentCount((c) => c + 1)}
          />
        </div>
      </div>
    </div>
  );
}

