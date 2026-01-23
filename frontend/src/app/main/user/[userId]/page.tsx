'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { usersApi, User, postsApi, Post, eyeMaskedImagesApi, EyeMaskedImage, s3Api, boardsApi, Board, BoardMembership, blocksApi } from '@/lib/api';
import { ROUTE_PATHS } from '@/routes/paths';
import Image from 'next/image';
import DP from '../../../../../public/assets/images/avatar_default_4.png';
import { formatTimestamp } from '@/utils/helperFunction';
import { PostCard } from '@/components/reuseComponents/PostCard';
import { useAuth } from '@/contexts/AuthContext';
import { FiEdit, FiCamera, FiCheck, FiX, FiUserX } from 'react-icons/fi';
import { FaImages, FaUsers } from 'react-icons/fa';

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
  // Get userId from URL params - this allows viewing any user's profile
  // When viewing own profile: userId === currentUser.id
  // When viewing other user's profile: userId !== currentUser.id
  const userId = params?.userId as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [eyeMaskedImages, setEyeMaskedImages] = useState<EyeMaskedImage[]>([]);
  const [createdBoards, setCreatedBoards] = useState<Board[]>([]);
  const [memberBoards, setMemberBoards] = useState<Board[]>([]);
  const [pendingRequests, setPendingRequests] = useState<BoardMembership[]>([]);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isCheckingBlock, setIsCheckingBlock] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingImages, setLoadingImages] = useState(true);
  const [loadingBoards, setLoadingBoards] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
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

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    try {
      setIsUploadingAvatar(true);
      setError(null);

      // Upload to S3
      const uploadResponse = await s3Api.uploadFile(file, 'avatars');
      
      // Update user profile with avatar URL
      const updatedUser = await usersApi.update(userId, { avatar: uploadResponse.url });
      setUser(updatedUser);
    } catch (err: any) {
      console.error('Error uploading avatar:', err);
      setError(err.message || 'Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
      // Reset file input
      e.target.value = '';
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

  useEffect(() => {
    const fetchEyeMaskedImages = async () => {
      // Only fetch if it's the user's own profile
      if (!isOwnProfile || !userId) return;
      
      try {
        setLoadingImages(true);
        const images = await eyeMaskedImagesApi.getAll(userId);
        setEyeMaskedImages(images);
      } catch (err: any) {
        console.error('Error fetching eye masked images:', err);
      } finally {
        setLoadingImages(false);
      }
    };

    fetchEyeMaskedImages();
  }, [userId, isOwnProfile]);

  useEffect(() => {
    const fetchUserBoards = async () => {
      if (!userId) return;
      
      try {
        setLoadingBoards(true);
        // Use userId from URL params - works for both own profile and other users' profiles
        const boards = await boardsApi.getByUserId(userId);
        setCreatedBoards(boards.created);
        setMemberBoards(boards.member);
      } catch (err: any) {
        console.error('Error fetching user boards:', err);
      } finally {
        setLoadingBoards(false);
      }
    };

    if (userId) {
      fetchUserBoards();
    }
  }, [userId]);

  useEffect(() => {
    const fetchPendingRequests = async () => {
      // Only fetch if it's the user's own profile
      if (!isOwnProfile || !userId) return;
      
      try {
        setLoadingRequests(true);
        const requests = await boardsApi.getPendingRequests();
        setPendingRequests(requests);
      } catch (err: any) {
        console.error('Error fetching pending requests:', err);
      } finally {
        setLoadingRequests(false);
      }
    };

    fetchPendingRequests();
  }, [userId, isOwnProfile]);

  useEffect(() => {
    const checkBlockStatus = async () => {
      // Only check if viewing another user's profile and user is logged in
      if (isOwnProfile || !currentUser || !userId) return;
      
      try {
        setIsCheckingBlock(true);
        const blocked = await blocksApi.checkBlockStatus(userId);
        setIsBlocked(blocked);
      } catch (err: any) {
        console.error('Error checking block status:', err);
      } finally {
        setIsCheckingBlock(false);
      }
    };

    checkBlockStatus();
  }, [userId, isOwnProfile, currentUser]);

  const handleBlockUser = async () => {
    if (!userId || !currentUser) return;
    
    try {
      setIsBlocking(true);
      await blocksApi.blockUser(userId);
      setIsBlocked(true);
      setShowBlockConfirm(false);
    } catch (err: any) {
      console.error('Error blocking user:', err);
      alert(err.message || 'Failed to block user');
    } finally {
      setIsBlocking(false);
    }
  };

  const handleUnblockUser = async () => {
    if (!userId || !currentUser) return;
    
    try {
      setIsBlocking(true);
      await blocksApi.unblockUser(userId);
      setIsBlocked(false);
    } catch (err: any) {
      console.error('Error unblocking user:', err);
      alert(err.message || 'Failed to unblock user');
    } finally {
      setIsBlocking(false);
    }
  };

  const handleApproveRequest = async (membershipId: string) => {
    try {
      await boardsApi.approveMembership(membershipId);
      // Remove from pending requests
      setPendingRequests(prev => prev.filter(req => req.id !== membershipId));
      // Refresh boards to show the new member (using userId from URL params)
      const boards = await boardsApi.getByUserId(userId);
      setCreatedBoards(boards.created);
      setMemberBoards(boards.member);
    } catch (err: any) {
      console.error('Error approving request:', err);
      alert(err.message || 'Failed to approve request');
    }
  };

  const handleRejectRequest = async (membershipId: string) => {
    try {
      await boardsApi.rejectMembership(membershipId);
      // Remove from pending requests
      setPendingRequests(prev => prev.filter(req => req.id !== membershipId));
    } catch (err: any) {
      console.error('Error rejecting request:', err);
      alert(err.message || 'Failed to reject request');
    }
  };

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
            <div className="relative">
              {isUploadingAvatar ? (
                <div className="w-24 h-24 rounded-full border-2 border-gray-300 bg-gray-100 flex items-center justify-center">
                  <div className="text-gray-400 text-sm">Uploading...</div>
                </div>
              ) : (
                <Image
                  src={user.avatar || DP}
                  alt={user.nickname}
                  className="w-24 h-24 rounded-full border-2 border-gray-300 object-cover"
                  width={96}
                  height={96}
                  unoptimized={!!user.avatar}
                />
              )}
              {isOwnProfile && !isUploadingAvatar && (
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                  <FiCamera size={16} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={isUploadingAvatar}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2 justify-between">
                <div className="flex items-center gap-3">
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
                  {!isOwnProfile && isBlocked && (
                    <span className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded-full flex items-center gap-1">
                      <FiUserX size={14} />
                      {t('blockedUser')}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!isOwnProfile && currentUser && (
                    <>
                      {isBlocked ? (
                        <button
                          onClick={handleUnblockUser}
                          disabled={isBlocking}
                          className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <FiUserX size={16} />
                          <span>{isBlocking ? t('processing') : t('unblockUser')}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setShowBlockConfirm(true)}
                          disabled={isCheckingBlock || isBlocking}
                          className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <FiUserX size={16} />
                          <span>{t('blockUser')}</span>
                        </button>
                      )}
                    </>
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

        {/* Block User Confirmation Dialog */}
        {showBlockConfirm && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">{t('confirmBlockUser')}</h3>
              <p className="text-gray-600 mb-6">
                {t('confirmBlockUserMessage', { name: user.nickname })}
              </p>
              <div className="flex items-center gap-3 justify-end">
                <button
                  onClick={() => setShowBlockConfirm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleBlockUser}
                  disabled={isBlocking}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isBlocking ? t('processing') : t('confirmBlock')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Eye Masking Images Section - Only show on own profile */}
        {isOwnProfile && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaImages size={24} />
              <span>{t('eyeMaskingImages')} ({eyeMaskedImages.length})</span>
            </h2>
            
            {loadingImages ? (
              <div className="bg-white border border-gray-300 rounded-lg p-8 text-center">
                <div className="text-gray-500">{t('loading')}</div>
              </div>
            ) : eyeMaskedImages.length > 0 ? (
              <div className="bg-white border border-gray-300 rounded-lg p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {eyeMaskedImages.map((image) => (
                    <div
                      key={image.id}
                      className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer group"
                      onClick={() => window.open(image.url, "_blank")}
                    >
                      <Image
                        src={image.url}
                        alt="Eye masked image"
                        fill
                        className="object-contain h-8 group-hover:scale-105 transition-transform"
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-300 rounded-lg p-8 text-center">
                <p className="text-gray-500">{t('noEyeMaskingImages')}</p>
              </div>
            )}
          </div>
        )}

        {/* Community Boards Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaUsers size={24} />
            <span>{t('communityBoards')}</span>
          </h2>
          
          {loadingBoards ? (
            <div className="bg-white border border-gray-300 rounded-lg p-8 text-center">
              <div className="text-gray-500">{t('loading')}</div>
            </div>
          ) : createdBoards.length > 0 || memberBoards.length > 0 ? (
            <div className="space-y-6">
              {/* Created Boards */}
              {createdBoards.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    {t('createdBoards')} ({createdBoards.length})
                  </h3>
                  <div className="bg-white border border-gray-300 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {createdBoards.map((board) => (
                        <div
                          key={board.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => router.push(`${ROUTE_PATHS.BOARD_PROFILE}/${board.id}`)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">r/{board.name}</h4>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {t('creator')}
                            </span>
                          </div>
                          {board.description && (
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{board.description}</p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{t('category')}: {board.category}</span>
                            <span>•</span>
                            <span>{formatTimestamp(board.createdAt)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Member Boards */}
              {memberBoards.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    {t('memberBoards')} ({memberBoards.length})
                  </h3>
                  <div className="bg-white border border-gray-300 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {memberBoards.map((board) => (
                        <div
                          key={board.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => router.push(`${ROUTE_PATHS.BOARD_PROFILE}/${board.id}`)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">r/{board.name}</h4>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              {t('member')}
                            </span>
                          </div>
                          {board.description && (
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{board.description}</p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{t('category')}: {board.category}</span>
                            <span>•</span>
                            <span>{formatTimestamp(board.createdAt)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-gray-300 rounded-lg p-8 text-center">
              <p className="text-gray-500">{t('noBoards')}</p>
            </div>
          )}
        </div>

        {/* Pending Membership Requests - Only show on own profile */}
        {isOwnProfile && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaUsers size={24} />
              <span>{t('pendingRequests')} ({pendingRequests.length})</span>
            </h2>
            
            {loadingRequests ? (
              <div className="bg-white border border-gray-300 rounded-lg p-8 text-center">
                <div className="text-gray-500">{t('loading')}</div>
              </div>
            ) : pendingRequests.length > 0 ? (
              <div className="bg-white border border-gray-300 rounded-lg p-6">
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                              {request.user?.avatar ? (
                                <Image
                                  src={request.user.avatar}
                                  alt={request.user.nickname}
                                  width={40}
                                  height={40}
                                  className="object-cover"
                                  unoptimized
                                />
                              ) : (
                                <span className="text-gray-600 font-semibold">
                                  {request.user?.nickname?.[0]?.toUpperCase() || 'U'}
                                </span>
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{request.user?.nickname}</h4>
                              <p className="text-sm text-gray-500">{request.user?.email}</p>
                            </div>
                          </div>
                          <div className="ml-13">
                            <p className="text-sm text-gray-600 mb-1">
                              {t('wantsToJoin')} <span className="font-semibold">r/{request.board?.name}</span>
                            </p>
                            {request.board?.description && (
                              <p className="text-xs text-gray-500 mb-2">{request.board.description}</p>
                            )}
                            <p className="text-xs text-gray-400">
                              {t('requestedAt')}: {formatTimestamp(request.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => handleApproveRequest(request.id)}
                            className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
                          >
                            <FiCheck size={16} />
                            <span>{t('approve')}</span>
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request.id)}
                            className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
                          >
                            <FiX size={16} />
                            <span>{t('reject')}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-300 rounded-lg p-8 text-center">
                <p className="text-gray-500">{t('noPendingRequests')}</p>
              </div>
            )}
          </div>
        )}

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

