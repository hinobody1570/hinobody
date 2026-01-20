'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { boardsApi, Board, postsApi, Post } from '@/lib/api';
import { ROUTE_PATHS } from '@/routes/paths';
import { PostCard } from '@/components/reuseComponents/PostCard';
import { formatTimestamp } from '@/utils/helperFunction';
import Image from 'next/image';
import DP from '../../../../../public/assets/images/avatar_default_4.png';
import { useAuth } from '@/contexts/AuthContext';

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

export default function BoardProfilePage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('boardProfile');
  const { user } = useAuth();
  const boardId = params?.boardId as string;
  
  const [board, setBoard] = useState<Board | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
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
        setError(err.message || 'Failed to load board');
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
        const transformedPosts = response.data.map(transformPost);
        setPosts(transformedPosts);
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

  const handleJoinLeave = async () => {
    if (!user) {
      router.push(ROUTE_PATHS.LOGIN);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading board...</div>
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Board not found'}</p>
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
        {/* Board Header */}
        <div className="bg-white border border-gray-300 rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-2xl">r/</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">r/{board.name}</h1>
                {board.description && (
                  <p className="text-gray-600 mb-4">{board.description}</p>
                )}
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <span>{t('category')}: {board.category}</span>
                  <span>{t('visibility')}: {board.visibilityAccess}</span>
                  <span>{t('created')}: {formatTimestamp(board.createdAt)}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleJoinLeave}
              disabled={isJoining}
              className={`px-6 py-2 rounded-full font-semibold transition-colors cursor-pointer ${
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('posts')} ({posts.length})</h2>
          
          {loadingPosts ? (
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
      </div>
    </div>
  );
}

