'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
        setError(err.message || 'Failed to load user profile');
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
      alert(err.message || t('failedToApproveRequest'));
    }
  };

  const handleRejectRequest = async (membershipId: string) => {
    try {
      await boardsApi.rejectMembership(membershipId);
      // Remove from pending requests
      setPendingRequests(prev => prev.filter(req => req.id !== membershipId));
    } catch (err: any) {
      console.error('Error rejecting request:', err);
      alert(err.message || t('failedToRejectRequest'));
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
        {isOwnProfile && (
          <EyeMaskingImagesSection
            images={eyeMaskedImages}
            loading={loadingImages}
          />
        )}

        {/* Community Boards Section */}
        <CommunityBoardsSection
          createdBoards={createdBoards}
          memberBoards={memberBoards}
          loading={loadingBoards}
        />

        {/* Pending Membership Requests - Only show on own profile */}
        {isOwnProfile && (
          <PendingRequestsSection
            requests={pendingRequests}
            loading={loadingRequests}
            onApprove={handleApproveRequest}
            onReject={handleRejectRequest}
          />
        )}

        {/* User Posts */}
        <UserPostsSection
          posts={posts}
          loading={loadingPosts}
        />
      </div>
    </div>
  );
}

