'use client';

import { useTranslations } from 'next-intl';
import { PostCard } from '@/components/reuseComponents/PostCard';

interface UserPostsSectionProps {
  posts: any[];
  loading: boolean;
}

export function UserPostsSection({ posts, loading }: UserPostsSectionProps) {
  const t = useTranslations('userProfile');

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('posts')} ({posts.length})</h2>
      
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading posts...</div>
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-500">{t('noPosts')}</p>
        </div>
      )}
    </div>
  );
}

