'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { usersApi, User, postsApi, Post, eyeMaskedImagesApi, EyeMaskedImage, boardsApi, Board, BoardMembership, blocksApi } from '@/lib/api';
import { ROUTE_PATHS } from '@/routes/paths';
import { useAuth } from '@/contexts/AuthContext';
import DP from '../../../../../public/assets/images/avatar_default_4.png';
import { formatTimestamp } from '@/utils/helperFunction';
import { UserProfileHeader } from '@/components/userProfile/UserProfileHeader';
import { BlockUserModal } from '@/components/modals/BlockUserModal';
import { EyeMaskingImagesSection } from '@/components/userProfile/EyeMaskingImagesSection';
import { CommunityBoardsSection } from '@/components/userProfile/CommunityBoardsSection';
import { PendingRequestsSection } from '@/components/userProfile/PendingRequestsSection';
import { UserPostsSection } from '@/components/userProfile/UserPostsSection';
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

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: currentUser, updateUser: updateAuthUser } = useAuth();
  const tab = searchParams?.get('tab') || 'posts';
  const scrollTo = searchParams?.get('scrollTo');
  const contentSectionRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('userProfile');
  const tTime = useTranslations('timeAgo');
  const { locale } = useLanguage();
  // Get userId from URL params - this allows viewing any user's profile
  // When viewing own profile: userId === currentUser.id
  // When viewing other user's profile: userId !== currentUser.id
  const userId = params?.userId as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
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
  
  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const userData = await usersApi.getById(userId);
        setUser(userData);
      } catch (err: any) {
        console.error('Error fetching user:', err);
        setError(err.message || t('failedToLoadUserProfile'));
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
    if (currentUser?.id === updatedUser.id) {
      updateAuthUser(updatedUser);
    }
  };

  useEffect(() => {
    const fetchPosts = async () => {
      if (!userId) return;
      try {
        setLoadingPosts(true);
        const response = tab === 'comments'
          ? await postsApi.getAll({ commenterId: userId, page: 1, limit: 20 })
          : await postsApi.getAll({ authorId: userId, page: 1, limit: 20 });
        setPosts(response.data);
      } catch (err: any) {
        console.error('Error fetching posts:', err);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchPosts();
  }, [userId, tab]);

  // Scroll to posts/comments section when opened from post card "View posts" or "View comments"
  useEffect(() => {
    if (!scrollTo || (scrollTo !== 'posts' && scrollTo !== 'comments')) return;
    if (!contentSectionRef.current) return;
    const timer = setTimeout(() => {
      contentSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
    return () => clearTimeout(timer);
  }, [scrollTo, tab]);

  const displayPosts = useMemo(
    () => posts.map((p) => transformPost(p, tTime)),
    [posts, tTime, locale]
  );

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
      // Fetch membership requests that the user has SENT (not received)
      if (!isOwnProfile || !userId) return;
      
      try {
        setLoadingRequests(true);
        const requests = await boardsApi.getPendingRequests();
        setPendingRequests(requests);
      } catch (err: any) {
        console.error('Error fetching sent membership requests:', err);
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
      alert(err.message || t('failedToBlockUser'));
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
      alert(err.message || t('failedToUnblockUser'));
    } finally {
      setIsBlocking(false);
    }
  };

  const handleApproveRequest = async (membershipId: string) => {
    // This function is no longer needed since users can't approve their own requests
    // Requests are approved by board creators/admins
  };

  const handleRejectRequest = async (membershipId: string) => {
    // Users can cancel their own pending requests
    try {
      const request = pendingRequests.find(req => req.id === membershipId);
      if (!request || !request.boardId) return;
      
      // Cancel the pending membership request
      await boardsApi.cancelMembershipRequest(request.boardId);
      // Remove from pending requests
      setPendingRequests(prev => prev.filter(req => req.id !== membershipId));
    } catch (err: any) {
      console.error('Error canceling request:', err);
      alert(err.message || t('failedToCancelRequest') || 'Failed to cancel request');
    }
  };

  if (loading) {
    return (
      <Loading title={t('loadingUserProfile')} />
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-6">
        <div className="text-center max-w-md w-full">
          <p className="text-red-600 mb-4 text-sm sm:text-base">{error || t('userNotFound')}</p>
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
        {/* User Header */}
        {user && (
          <UserProfileHeader
            user={user}
            isOwnProfile={isOwnProfile}
            isBlocked={isBlocked}
            isCheckingBlock={isCheckingBlock}
            isBlocking={isBlocking}
            onBlockClick={() => setShowBlockConfirm(true)}
            onUnblockClick={handleUnblockUser}
            onUserUpdate={handleUserUpdate}
            currentUser={currentUser}
          />
        )}

        {/* Block User Confirmation Dialog */}
        {user && (
          <BlockUserModal
            isOpen={showBlockConfirm}
            userName={user.nickname}
            isBlocking={isBlocking}
            onClose={() => setShowBlockConfirm(false)}
            onConfirm={handleBlockUser}
          />
        )}

        {/* Eye Masking Images Section - Only show on own profile */}
        {/* {isOwnProfile && (
          <EyeMaskingImagesSection
            images={eyeMaskedImages}
            loading={loadingImages}
          />
        )} */}

        {/* Community Boards Section */}
        {/* <CommunityBoardsSection
          createdBoards={createdBoards}
          memberBoards={memberBoards}
          loading={loadingBoards}
        /> */}

        {/* Pending Membership Requests - Only show on own profile */}
        {isOwnProfile && (
          <PendingRequestsSection
            requests={pendingRequests}
            loading={loadingRequests}
            onApprove={handleApproveRequest}
            onReject={handleRejectRequest}
          />
        )}

        {/* Tabs: Posts | Comments - scroll target when opening from post card dropdown */}
        <div ref={contentSectionRef} className="flex flex-col">
          <div className="flex gap-2 border-b border-gray-200 mb-4">
            <button
              type="button"
              onClick={() => router.push(`/main/user/${userId}`, { scroll: false })}
              className={`px-4 py-2 font-semibold text-sm cursor-pointer transition-colors border-b-2 -mb-px ${
                tab !== 'comments'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('posts')}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/main/user/${userId}?tab=comments`, { scroll: false })}
              className={`px-4 py-2 font-semibold text-sm cursor-pointer transition-colors border-b-2 -mb-px ${
                tab === 'comments'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('comments')}
            </button>
          </div>

          {/* User Posts or Posts with Comments by User */}
          <UserPostsSection
          posts={displayPosts}
          loading={loadingPosts}
          title={tab === 'comments' ? t('postsWithCommentsByUser') : undefined}
          emptyMessage={tab === 'comments' ? t('noPostsWithCommentsByUser') : undefined}
          onPostDelete={(id) => setPosts((prev) => prev.filter((p) => p.id !== id))}
        />
        </div>
      </div>
    </div>
  );
}

