'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { usersApi, User } from '@/lib/api';
import { ROUTE_PATHS } from '@/routes/paths';
import Image from 'next/image';
import DP from '../../../../../public/assets/images/avatar_default_4.png';
import { formatTimestamp } from '@/utils/helperFunction';
import { postsApi, Post } from '@/lib/api';
import { PostCard } from '@/components/reuseComponents/PostCard';
import { useAuth } from '@/contexts/AuthContext';
import { FiEdit } from 'react-icons/fi';

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

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const t = useTranslations('userProfile');
  const userId = params?.userId as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    nickname: '',
  });
  
  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const userData = await usersApi.getById(userId);
        setUser(userData);
        setEditForm({
          nickname: userData.nickname,
        });
      } catch (err: any) {
        console.error('Error fetching user:', err);
        setError(err.message || 'Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (user) {
      setEditForm({
        nickname: user.nickname,
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!user) return;
    
    try {
      const updatedUser = await usersApi.update(userId, editForm);
      setUser(updatedUser);
      setIsEditing(false);
    } catch (err: any) {
      console.error('Error updating user:', err);
      setError(err.message || 'Failed to update profile');
    }
  };

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        setLoadingPosts(true);
        const response = await postsApi.getAll({
          authorId: userId,
          page: 1,
          limit: 20,
        });
        const transformedPosts = response.data.map(transformPost);
        setPosts(transformedPosts);
      } catch (err: any) {
        console.error('Error fetching user posts:', err);
      } finally {
        setLoadingPosts(false);
      }
    };

    if (userId) {
      fetchUserPosts();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading user profile...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'User not found'}</p>
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
        {/* User Header */}
        <div className="bg-white border border-gray-300 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-6">
            <Image
              src={DP}
              alt={user.nickname}
              className="w-24 h-24 rounded-full border-2 border-gray-300"
            />
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2 justify-between">
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.nickname}
                    onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })}
                    className="text-3xl font-bold text-gray-900 border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:border-blue-500"
                  />
                ) : (
                  <h1 className="text-3xl font-bold text-gray-900">{user.nickname}</h1>
                )}
                {isOwnProfile && !isEditing && (
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-2 px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    <FiEdit size={16} />
                    <span>{t('edit')}</span>
                  </button>
                )}
              </div>
              <p className="text-gray-600 mb-4">{user.email}</p>
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <span>{t('memberSince')}: {formatTimestamp(user.createdAt)}</span>
                <span className="capitalize">{user.role}</span>
                <span className="uppercase">{user.language}</span>
              </div>
              {isEditing && (
                <div className="flex items-center gap-3 mt-4">
                  <button
                    onClick={handleSaveEdit}
                    className="px-2 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
                  >
                    {t('save')}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-2 py-1 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors cursor-pointer"
                  >
                    {t('cancel')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Posts */}
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

