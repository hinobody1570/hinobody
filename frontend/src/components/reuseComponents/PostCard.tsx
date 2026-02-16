"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { boardsApi, reportsApi, votesApi } from "@/lib/api";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FaLayerGroup } from "react-icons/fa";
import { FiMessageSquare } from "react-icons/fi";
import { HiOutlineThumbDown, HiOutlineThumbUp } from "react-icons/hi";
import { CommentsSection } from "../commentSection/CommentSection";
import { AuthorPopup } from "../modals/AuthorPopup";
import { ReportModal } from "../modals/ReportModal";
import { DropdownMenu } from "./DropDownMenu";

export const PostCard = ({ post }: any) => {
  const t = useTranslations("feed");
  const tToast = useTranslations("toast");
  const tPostCard = useTranslations("postCard");
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();
  const [upvotes, setUpvotes] = useState(post?.upvotes || 0);
  const [downvotes, setDownvotes] = useState(post?.downvotes || 0);
  const [showComments, setShowComments] = useState(false);
  const [voteState, setVoteState] = useState<"up" | "down" | null>(null); // null, 'up', or 'down'
  const [isMember, setIsMember] = useState<boolean | null>(null); // null = loading, true = member, false = not member
  const [isJoining, setIsJoining] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isReporting, setIsReporting] = useState(false);

  // Fetch user vote status on mount
  useEffect(() => {
    const fetchUserVote = async () => {
      if (!isAuthenticated || !post?.id) {
        setVoteState(null);
        return;
      }

      try {
        const vote = await votesApi.getUserVote(post?.id);
        if (vote) {
          setVoteState(vote.type === "UPVOTE" ? "up" : "down");
        } else {
          setVoteState(null);
        }
      } catch (error) {
        console.error("Error fetching user vote:", error);
        setVoteState(null);
      }
    };

    fetchUserVote();
  }, [post?.id, isAuthenticated]);

  const handleUpvote = async () => {
    if (!isAuthenticated || !post.id || isVoting) return;

    try {
      setIsVoting(true);
      const response = await votesApi.createOrUpdate({
        type: "UPVOTE",
        postId: post.id,
      });

      // Update vote state
      if (response.action === "removed") {
        setVoteState(null);
      } else {
        setVoteState("up");
      }

      // Update counts based on API response
      setUpvotes((prev: number) => prev + response.upvoteCount);
      setDownvotes((prev: number) => prev + response.downvoteCount);
    } catch (error: any) {
      console.error("Error voting:", error);
      showError(error.message || "Failed to vote. Please try again.");
    } finally {
      setIsVoting(false);
    }
  };

  const handleDownvote = async () => {
    if (!isAuthenticated || !post.id || isVoting) return;

    try {
      setIsVoting(true);
      const response = await votesApi.createOrUpdate({
        type: "DOWNVOTE",
        postId: post.id,
      });

      // Update vote state
      if (response.action === "removed") {
        setVoteState(null);
      } else {
        setVoteState("down");
      }

      // Update counts based on API response
      setUpvotes((prev: number) => prev + response.upvoteCount);
      setDownvotes((prev: number) => prev + response.downvoteCount);
    } catch (error: any) {
      console.error("Error voting:", error);
      showError(error.message || "Failed to vote. Please try again.");
    } finally {
      setIsVoting(false);
    }
  };

  // Check membership status on mount
  useEffect(() => {
    const checkMembership = async () => {
      if (!isAuthenticated || !post?.boardId) {
        setIsMember(false);
        return;
      }

      try {
        const membership = await boardsApi.getMembershipStatus(post.boardId);
        setIsMember(membership?.status === "APPROVED");
      } catch (error) {
        console.error("Error checking membership:", error);
        setIsMember(false);
      }
    };

    checkMembership();
  }, [post?.boardId, isAuthenticated]);

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
        if (membership.status === "APPROVED") {
          setIsMember(true);
          showSuccess(tToast("joinedBoard") || "Successfully joined the board!");
        } else if (membership.status === "PENDING") {
          showSuccess(tToast("joinRequestPending") || "Join request submitted! The board creator will review your request.");
        }
      }
    } catch (error: any) {
      console.error("Error joining/leaving board:", error);
      const errorMessage = error.message || error.error || "Failed to update membership";
      showError(errorMessage);
    } finally {
      setIsJoining(false);
    }
  };

  // Handle report submission
  const handleReportSubmit = async (reason: string) => {
    if (!isAuthenticated || !post.id || isReporting) return;

    try {
      setIsReporting(true);
      await reportsApi.create({
        reason,
        postId: post.id,
      });
      showSuccess(tPostCard("reportSubmittedSuccess"));
      setShowReportModal(false);
    } catch (error: any) {
      console.error("Error submitting report:", error);
      throw error; // Let the modal handle the error display
    } finally {
      setIsReporting(false);
    }
  };

  // Post-specific menu items
  const postMenuItems = [
    // {
    //   icon: FiEyeOff,
    //   label: "Hide",
    //   onClick: () => console.log("Hide clicked"),
    // },
    {
      icon: FaLayerGroup,
      label: tPostCard("report"),
      onClick: () => {
        if (isAuthenticated) {
          setShowReportModal(true);
        } else {
          showError(tPostCard("pleaseLoginToReport"));
        }
      },
    },
    // {
    //   icon: BiInfoCircle,
    //   label: "About this post",
    //   onClick: () => console.log("About clicked"),
    // },
  ];
  return (
    <article className="bg-white border border-gray-300 rounded-lg mb-4 overflow-hidden hover:border-gray-400 transition-colors">
      {/* Post Header - responsive: stacked on mobile, single row on tablet+ */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-3 py-2 sm:gap-3">
        {/* Left: board avatar, name, verified, timestamp, badge */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Image src={post?.communityAvatar} alt={post?.community} className="w-8 h-8 rounded-full flex-shrink-0" />
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1 overflow-hidden">
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm hover:underline cursor-pointer truncate min-w-0" title={post?.community}>
                {post?.community}
              </span>
              {post?.authorId ? (
                <AuthorPopup authorId={post.authorId} authorName={post?.authorName ?? ""}>
                  {post?.authorName}
                </AuthorPopup>
              ) : (
                <span className="text-sm truncate min-w-0" title={post?.authorName}>
                  {post?.authorName}
                </span>
              )}
            </div>
            {post?.verified && (
              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
            <span className="text-gray-500 text-xs flex-shrink-0">•</span>
            <span className="text-gray-500 text-xs min-w-0 truncate max-w-[110px] sm:max-w-none" title={post?.timestamp}>
              {post?.timestamp}
            </span>
            {post?.badge && (
              <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-semibold flex-shrink-0">{post.badge}</span>
            )}
          </div>
        </div>
        {/* Right: join button, burger menu */}
        <div className="flex items-center gap-2 flex-shrink-0 justify-end sm:justify-start">
          {isAuthenticated && post?.boardId && (
            <button
              onClick={handleJoinLeave}
              disabled={isJoining || isMember === null}
              className={`min-h-[36px] px-3 py-1.5 sm:px-4 sm:py-1 cursor-pointer text-sm font-semibold rounded-full transition-colors touch-manipulation ${
                isMember ? "bg-gray-200 text-gray-700 hover:bg-gray-300" : "bg-blue-600 text-white hover:bg-blue-700"
              } ${isJoining || isMember === null ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isJoining ? "..." : isMember === null ? "..." : isMember ? t("joined") || "Joined" : t("join")}
            </button>
          )}
          <div className="hover:bg-gray-100 rounded-full cursor-pointer transition-colors -m-1">
            <DropdownMenu items={postMenuItems} />
          </div>
        </div>
      </div>

      {/* Post Title */}
      <div className="px-3 pb-2">
        <h2 className="text-lg font-medium text-gray-900 hover:text-gray-700 cursor-pointer">{post?.title}</h2>
      </div>

      {/* Post Image/Content */}
      {post.image && (
        <div className="bg-[#f5f5f5]">
          <Image src={post?.image ?? ""} width={400} height={400} alt={post.title} className="mx-auto object-contain" />
        </div>
      )}

      {post?.body && <div className="px-3 pb-2" dangerouslySetInnerHTML={{ __html: post?.body }} />}

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
            <HiOutlineThumbUp size={20} fill={voteState === "up" ? "currentColor" : "none"} />
          </button>
          <span className="px-2 text-sm font-bold text-gray-800 min-w-[40px] text-center">{upvotes - downvotes}</span>
          <button
            onClick={handleDownvote}
            disabled={!isAuthenticated || isVoting}
            className={`p-1.5 hover:bg-gray-200 cursor-pointer rounded-r-full transition-colors ${
              voteState === "down" ? "text-blue-500" : "text-gray-600"
            } ${!isAuthenticated || isVoting ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <HiOutlineThumbDown size={20} fill={voteState === "down" ? "currentColor" : "none"} />
          </button>
        </div>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-gray-100 rounded-full transition-colors"
        >
          <FiMessageSquare size={20} className="text-gray-600" />
          <span className="text-sm font-semibold text-gray-800">{post?.comments}</span>
        </button>

        {/* <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
          <GoBell size={20} className="text-gray-600" />
        </button> */}

        {/* <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
          <FiShare2 size={20} className="text-gray-600" />
          <span className="text-sm font-semibold text-gray-800">{t("share")}</span>
        </button> */}
      </div>
      {showComments && <CommentsSection postId={post?.id} postAuthorId={post?.authorId} />}

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={handleReportSubmit}
        title={tPostCard("reportPost")}
        isLoading={isReporting}
      />
    </article>
  );
};
