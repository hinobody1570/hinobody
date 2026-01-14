"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { FiMessageSquare, FiMoreHorizontal, FiShare2 } from "react-icons/fi";
import { GoBell } from "react-icons/go";
import { HiOutlineArrowDown, HiOutlineArrowUp } from "react-icons/hi";
import { CommentsSection } from "../commentSection/CommentSection";
import { DropdownMenu } from "./DropDownMenu";
import { menuItems } from "../commentSection/Comment";
import { boardsApi, votesApi, VoteType } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";

export const PostCard = ({ post }: any) => {
  const t = useTranslations("feed");
  const tToast = useTranslations("toast");
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();
  const [upvotes, setUpvotes] = useState(post.upvotes || 0);
  const [downvotes, setDownvotes] = useState(post.downvotes || 0);
  const [showComments, setShowComments] = useState(false);
  const [voteState, setVoteState] = useState<'up' | 'down' | null>(null); // null, 'up', or 'down'
  const [isMember, setIsMember] = useState<boolean | null>(null); // null = loading, true = member, false = not member
  const [isJoining, setIsJoining] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  // Fetch user vote status on mount
  useEffect(() => {
    const fetchUserVote = async () => {
      if (!isAuthenticated || !post.id) {
        setVoteState(null);
        return;
      }

      try {
        const vote = await votesApi.getUserVote(post.id);
        if (vote) {
          setVoteState(vote.type === 'UPVOTE' ? 'up' : 'down');
        } else {
          setVoteState(null);
        }
      } catch (error) {
        console.error('Error fetching user vote:', error);
        setVoteState(null);
      }
    };

    fetchUserVote();
  }, [post.id, isAuthenticated]);

  const handleUpvote = async () => {
    if (!isAuthenticated || !post.id || isVoting) return;

    try {
      setIsVoting(true);
      const response = await votesApi.createOrUpdate({
        type: 'UPVOTE',
        postId: post.id,
      });

      // Update vote state
      if (response.action === 'removed') {
        setVoteState(null);
      } else {
        setVoteState('up');
      }

      // Update counts based on API response
      setUpvotes((prev: number) => prev + response.upvoteCount);
      setDownvotes((prev: number) => prev + response.downvoteCount);
    } catch (error: any) {
      console.error('Error voting:', error);
      showError(error.message || 'Failed to vote. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };

  const handleDownvote = async () => {
    if (!isAuthenticated || !post.id || isVoting) return;

    try {
      setIsVoting(true);
      const response = await votesApi.createOrUpdate({
        type: 'DOWNVOTE',
        postId: post.id,
      });

      // Update vote state
      if (response.action === 'removed') {
        setVoteState(null);
      } else {
        setVoteState('down');
      }

      // Update counts based on API response
      setUpvotes((prev: number) => prev + response.upvoteCount);
      setDownvotes((prev: number) => prev + response.downvoteCount);
    } catch (error: any) {
      console.error('Error voting:', error);
      showError(error.message || 'Failed to vote. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };

  // Check membership status on mount
  useEffect(() => {
    const checkMembership = async () => {
      if (!isAuthenticated || !post.boardId) {
        setIsMember(false);
        return;
      }

      try {
        const membership = await boardsApi.getMembershipStatus(post.boardId);
        setIsMember(membership?.status === 'APPROVED');
      } catch (error) {
        console.error('Error checking membership:', error);
        setIsMember(false);
      }
    };

    checkMembership();
  }, [post.boardId, isAuthenticated]);

  // Handle join/leave board
  const handleJoinLeave = async () => {
    if (!isAuthenticated || !post.boardId || isJoining) return;

    try {
      setIsJoining(true);
      if (isMember) {
        // Leave the board
        await boardsApi.leave(post.boardId);
        setIsMember(false);
        showSuccess(tToast("leftBoard") || "Successfully left the board");
      } else {
        // Join the board
        const membership = await boardsApi.join(post.boardId);
        // Check if membership was approved immediately or is pending
        if (membership.status === 'APPROVED') {
          setIsMember(true);
          showSuccess(tToast("joinedBoard") || "Successfully joined the board!");
        } else if (membership.status === 'PENDING') {
          showSuccess(tToast("joinRequestPending") || "Join request submitted! The board creator will review your request.");
        }
      }
    } catch (error: any) {
      console.error('Error joining/leaving board:', error);
      const errorMessage = error.message || error.error || 'Failed to update membership';
      showError(errorMessage);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <article className="bg-white border border-gray-300 rounded-lg mb-4 overflow-hidden hover:border-gray-400 transition-colors">
      {/* Post Header */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2">
          <Image src={post.communityAvatar} alt={post.community} className="w-6 h-6 rounded-full" />
          <span className="font-bold text-sm hover:underline cursor-pointer">{post.community}</span>
          {post.verified && (
            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          )}
          <span className="text-gray-500 text-xs">• {post.timestamp}</span>
          {post.badge && <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-semibold">{post.badge}</span>}
        </div>
        <div className="flex items-center gap-2">
          {isAuthenticated && post.boardId && (
            <button
              onClick={handleJoinLeave}
              disabled={isJoining || isMember === null}
              className={`px-4 cursor-pointer py-1 text-sm font-semibold rounded-full transition-colors ${
                isMember
                  ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              } ${isJoining || isMember === null ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isJoining
                ? "..."
                : isMember === null
                ? "..."
                : isMember
                ? t("joined") || "Joined"
                : t("join")}
            </button>
          )}
          {/* <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <FiMoreHorizontal size={20} className="text-gray-600" />
          </button> */}
          <div className="hover:bg-gray-100 rounded-full cursor-pointer transition-colors ml-auto">
            <DropdownMenu items={menuItems} />
          </div>
        </div>
      </div>

      {/* Post Title */}
      <div className="px-3 pb-2">
        <h2 className="text-lg font-medium text-gray-900 hover:text-gray-700 cursor-pointer">{post.title}</h2>
      </div>

      {/* Post Image/Content */}
      {/* {post.image && (
        <div className="bg-black">
          <Image src={post?.image ?? ""} width={300} height={300} alt={post.title} className="w-full max-h-[600px] object-contain" />
        </div>
      )} */}

      {post.body && <div className="" dangerouslySetInnerHTML={{ __html: post.body }} />}

      {/* Post Actions */}
      <div className="flex items-center gap-2 px-3 py-2 border-t border-gray-200">
        <div className="flex items-center bg-gray-100 rounded-full">
          <button
            onClick={handleUpvote}
            disabled={!isAuthenticated || isVoting}
            className={`p-1.5 hover:bg-gray-200 cursor-pointer rounded-l-full transition-colors ${
              voteState === "up" ? "text-orange-500" : "text-gray-600"
            } ${!isAuthenticated || isVoting ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <HiOutlineArrowUp size={20} fill={voteState === "up" ? "currentColor" : "none"} />
          </button>
          <span className="px-2 text-sm font-bold text-gray-800 min-w-[40px] text-center">
            {upvotes - downvotes}
          </span>
          <button
            onClick={handleDownvote}
            disabled={!isAuthenticated || isVoting}
            className={`p-1.5 hover:bg-gray-200 cursor-pointer rounded-r-full transition-colors ${
              voteState === "down" ? "text-blue-500" : "text-gray-600"
            } ${!isAuthenticated || isVoting ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <HiOutlineArrowDown size={20} fill={voteState === "down" ? "currentColor" : "none"} />
          </button>
        </div>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-gray-100 rounded-full transition-colors"
        >
          <FiMessageSquare size={20} className="text-gray-600" />
          <span className="text-sm font-semibold text-gray-800">{post.comments}</span>
        </button>

        <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded-full transition-colors">
          <GoBell size={20} className="text-gray-600" />
        </button>

        <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded-full transition-colors">
          <FiShare2 size={20} className="text-gray-600" />
          <span className="text-sm font-semibold text-gray-800">{t("share")}</span>
        </button>
      </div>
      {showComments && <CommentsSection postId={post.id} postAuthorId={post.authorId} />}
    </article>
  );
};
