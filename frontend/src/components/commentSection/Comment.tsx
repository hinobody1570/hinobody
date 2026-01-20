"use client";

import { useState } from "react";
import { BiAward, BiGlobe, BiInfoCircle, BiMessageSquare, BiSearch } from "react-icons/bi";
import { CiShare2 } from "react-icons/ci";
import { FiEyeOff } from "react-icons/fi";
import { HiOutlineArrowDown, HiOutlineArrowUp } from "react-icons/hi";
import { PiNavigationArrow } from "react-icons/pi";
import { DropdownMenu } from "../reuseComponents/DropDownMenu";
import { FaLayerGroup } from "react-icons/fa";
import { commentsApi, Language, votesApi, reportsApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { ReportModal } from "../modals/ReportModal";
import AVATAR from "./../../../public/assets/images/avatar_default_4.png";

interface commentType {
  comment: any;
  level?: number;
  postId?: string;
  postAuthorId?: string;
  onReplyAdded?: () => void;
}

const getMenuItems = (t: any, onReportClick: () => void, isAuthenticated: boolean, showError: (message: string) => void) => [
  // {
  //   icon: FiEyeOff,
  //   label: t("hide"),
  //   onClick: () => console.log("Hide clicked"),
  // },
  {
    icon: FaLayerGroup,
    label: t("report"),
    onClick: () => {
      if (isAuthenticated) {
        onReportClick();
      } else {
        showError(t("pleaseLoginToReport"));
      }
    },
  },
  // {
  //   icon: BiInfoCircle,
  //   label: t("aboutThisAd"),
  //   onClick: () => console.log("About clicked"),
  // },
  // {
  //   icon: BiGlobe,
  //   label: t("tiredOfAds"),
  //   onClick: () => console.log("Ads clicked"),
  // },
];

const Comment = ({ comment, level = 0, postId, postAuthorId, onReplyAdded }: commentType) => {
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();
  const { locale } = useLanguage();
  const t = useTranslations('comments');
  const tPostCard = useTranslations('postCard');
  const [upvotes, setUpvotes] = useState(comment.upvotes || 0);
  const [downvotes, setDownvotes] = useState(comment.downvotes || 0);
  const [voteState, setVoteState] = useState<'up' | 'down' | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showReplyComment, setShowReplyComment] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isReporting, setIsReporting] = useState(false);

  // Map locale to Language enum
  const getLanguage = (): Language => {
    const localeMap: Record<string, Language> = {
      'en': 'EN',
      'ko': 'KO',
      'zh': 'ZH',
      'ja': 'JA',
    };
    return localeMap[locale] || 'EN';
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showError(t('pleaseLoginToReply'));
      return;
    }

    if (!replyText.trim() || !postId) {
      showError(t('pleaseEnterReply'));
      return;
    }

    try {
      setIsSubmittingReply(true);
      await commentsApi.create({
        body: replyText.trim(),
        originalLanguage: getLanguage(),
        postId: postId,
        parentId: comment.id,
      });
      setReplyText('');
      setShowReplyComment(false);
      showSuccess(t('replyAddedSuccess'));
      // Refresh comments
      if (onReplyAdded) {
        onReplyAdded();
      }
    } catch (err: any) {
      console.error('Error creating reply:', err);
      showError(err.message || t('replyAddError'));
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Fetch user vote status on mount
  useEffect(() => {
    const fetchUserVote = async () => {
      if (!isAuthenticated || !comment.id) {
        setVoteState(null);
        return;
      }

      try {
        const vote = await votesApi.getUserVote(undefined, comment.id);
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
  }, [comment.id, isAuthenticated]);

  const handleUpvote = async () => {
    if (!isAuthenticated || !comment.id || isVoting) return;

    try {
      setIsVoting(true);
      const response = await votesApi.createOrUpdate({
        type: 'UPVOTE',
        commentId: comment.id,
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
      showError(error.message || t('voteError'));
    } finally {
      setIsVoting(false);
    }
  };

  const handleDownvote = async () => {
    if (!isAuthenticated || !comment.id || isVoting) return;

    try {
      setIsVoting(true);
      const response = await votesApi.createOrUpdate({
        type: 'DOWNVOTE',
        commentId: comment.id,
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
      showError(error.message || t('voteError'));
    } finally {
      setIsVoting(false);
    }
  };

  // Handle report submission
  const handleReportSubmit = async (reason: string) => {
    if (!isAuthenticated || !comment.id || isReporting) return;

    try {
      setIsReporting(true);
      await reportsApi.create({
        reason,
        commentId: comment.id,
      });
      showSuccess(tPostCard('reportSubmittedSuccess'));
      setShowReportModal(false);
    } catch (error: any) {
      console.error('Error submitting report:', error);
      throw error; // Let the modal handle the error display
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <div className={`${level > 0 ? "ml-8 border-l-2 border-gray-200 pl-4" : ""}`}>
      <div className="flex gap-3 mb-4">
        {/* Collapse Button */}
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="flex-shrink-0 w-6 h-6 mt-1 hover:bg-gray-100 rounded transition-colors cursor-pointer">
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          </div>
        </button>

        <div className="flex-1">
          {/* Comment Header */}
          <div className="flex items-center gap-2 mb-2">
            <img
              src={"https://hinobody-uploads.s3.ap-northeast-2.amazonaws.com/uploads/contractor/1768388540764-dwcgwro84bh.png"}
              alt={comment.username}
              className="w-6 h-6 rounded-full"
            />
            <span className="font-semibold text-sm text-gray-900">{comment.username}</span>
            {comment.badge && (
              <span
                className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                  comment.badge === "MOD" ? "bg-green-100 text-green-700" : comment.badge === "OP" ? "bg-blue-100 text-blue-700" : ""
                }`}
              >
                {comment.badge}
              </span>
            )}
            <span className="text-xs text-gray-500">• {comment.timestamp}</span>
            {comment.stickied && <PiNavigationArrow size={14} className="text-green-600" />}
            {comment.edited && <span className="text-xs text-gray-500">• {t('edited')} {comment.editedTime}</span>}
          </div>

          {/* Comment Content */}
          {!isCollapsed && (
            <>
              <div className={`text-sm text-gray-800 mb-3 ${comment.highlighted ? "bg-yellow-50 p-3 rounded" : ""}`}>{comment.text}</div>

              {/* Comment Actions */}
              <div className="flex items-center gap-2">
                {/* Vote Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleUpvote}
                    disabled={!isAuthenticated || isVoting}
                    className={`p-1 hover:bg-gray-100 cursor-pointer rounded transition-colors ${
                      voteState === "up" ? "text-orange-500" : "text-gray-500"
                    } ${!isAuthenticated || isVoting ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <HiOutlineArrowUp size={18} fill={voteState === "up" ? "currentColor" : "none"} />
                  </button>
                  <span className="text-xs font-bold text-gray-700 min-w-[30px] text-center">
                    {upvotes - downvotes}
                  </span>
                  <button
                    onClick={handleDownvote}
                    disabled={!isAuthenticated || isVoting}
                    className={`p-1 hover:bg-gray-100 rounded cursor-pointer transition-colors ${
                      voteState === "down" ? "text-blue-500" : "text-gray-500"
                    } ${!isAuthenticated || isVoting ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <HiOutlineArrowDown size={18} fill={voteState === "down" ? "currentColor" : "none"} />
                  </button>
                </div>

                {/* Reply Button */}
                <button
                  onClick={() => setShowReplyComment(!showReplyComment)}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                >
                  <BiMessageSquare size={16} />
                  <span>{t('reply')}</span>
                </button>

                {/* Award Button */}
                <button className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded transition-colors cursor-pointer">
                  <BiAward size={16} />
                  <span>{t('award')}</span>
                </button>

                {/* Share Button */}
                <button className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded transition-colors cursor-pointer">
                  <CiShare2 size={16} />
                  <span>{t('share')}</span>
                </button>

                {/* Awards Display */}
                {comment.awards > 0 && (
                  <div className="flex items-center gap-1 ml-2">
                    <span className="text-lg">🎁</span>
                    <span className="text-xs font-semibold text-gray-700">{comment.awards}</span>
                  </div>
                )}

                {/* More Options */}
                <button className="hover:bg-gray-100 rounded-full cursor-pointer transition-colors ml-auto">
                  <DropdownMenu items={getMenuItems(t, () => setShowReportModal(true), isAuthenticated, showError)} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      {showReplyComment && (
        <form onSubmit={handleSubmitReply} className="flex gap-2 mt-2 ml-20 max-w-md">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={isAuthenticated ? t('enterReply') : t('loginToReply')}
            disabled={!isAuthenticated || isSubmittingReply}
            className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!isAuthenticated || isSubmittingReply || !replyText.trim()}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmittingReply ? '...' : t('reply')}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowReplyComment(false);
              setReplyText('');
            }}
            className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            {t('cancel')}
          </button>
        </form>
      )}

      {/* Nested Comments */}
      {!isCollapsed && comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map((reply: any) => (
            <Comment 
              key={reply.id} 
              comment={reply} 
              level={level + 1}
              postId={postId}
              postAuthorId={postAuthorId}
              onReplyAdded={onReplyAdded}
            />
          ))}
        </div>
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={handleReportSubmit}
        title={tPostCard('reportComment')}
        isLoading={isReporting}
      />
    </div>
  );
};

export default Comment;
