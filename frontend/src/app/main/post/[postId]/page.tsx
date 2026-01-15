'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { postsApi, Post } from '@/lib/api';
import { ROUTE_PATHS } from '@/routes/paths';
import { PostCard } from '@/components/reuseComponents/PostCard';
import { formatTimestamp } from '@/utils/helperFunction';
import Image from 'next/image';
import DP from '../../../../../public/assets/images/avatar_default_4.png';
import { CommentsSection } from '@/components/commentSection/CommentSection';

const transformPost = (post: Post): any => {
  return {
    id: post.id,
    boardId: post.boardId,
    authorId: post.authorId,
    community: post.board?.name ? `r/${post.board.name}` : "r/community",
    communityAvatar: DP,
    verified: false,
    timestamp: formatTimestamp(post.createdAt),
    title: post.title,
    image: post.images && post.images.length > 0 ? post.images[0].url : null,
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
  const postId = params?.postId as string;
  
  const [post, setPost] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);
        const postData = await postsApi.getById(postId);
        const transformedPost = transformPost(postData);
        setPost(transformedPost);
      } catch (err: any) {
        console.error('Error fetching post:', err);
        setError(err.message || 'Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading post...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Post not found'}</p>
          <button
            onClick={() => router.push(ROUTE_PATHS.HOME)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
          >
            {t('backToHome')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Post Detail */}
        <div className="mb-6">
          <PostCard post={post} />
        </div>

        {/* Comments Section */}
        <div className="bg-white border border-gray-300 rounded-lg p-6">
          <CommentsSection postId={postId} postAuthorId={post.authorId} />
        </div>
      </div>
    </div>
  );
}

