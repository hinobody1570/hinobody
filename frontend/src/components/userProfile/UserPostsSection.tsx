'use client';

import { useTranslations } from 'next-intl';
import { PostCard } from '@/components/reuseComponents/PostCard';

interface UserPostsSectionProps {
  posts: any[];
  loading: boolean;
  title?: string;
  emptyMessage?: string;
  onPostDelete?: (postId: string) => void;
}

export function UserPostsSection({ posts, loading, title, emptyMessage, onPostDelete }: UserPostsSectionProps) {
  const t = useTranslations('userProfile');
  const displayTitle = title ?? t('posts');
  const displayEmptyMessage = emptyMessage ?? t('noPosts');

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
        {displayTitle}
        {!loading && ` (${posts.length})`}
      </h2>

      {loading ? (
        <div className="flex items-center justify-center py-8 sm:py-12">
          <div className="text-gray-500 text-sm sm:text-base">{t('loadingPosts')}</div>
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-3 sm:space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onDelete={onPostDelete} />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-300 rounded-lg p-6 sm:p-8 text-center">
          <p className="text-gray-500 text-sm sm:text-base">{displayEmptyMessage}</p>
        </div>
      )}
    </div>
  );
}

