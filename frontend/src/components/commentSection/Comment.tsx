"use client";

import { useState } from "react";
import { BiMessageSquare } from "react-icons/bi";
import { HiOutlineThumbDown, HiOutlineThumbUp } from "react-icons/hi";
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

  const replyFormMarginLeft = level > 0
    ? "ml-4 sm:ml-6 md:ml-12"
    : "ml-9 sm:ml-11 md:ml-14";

  return (
    <div className={`${level > 0 ? "ml-3 sm:ml-4 md:ml-6 lg:ml-8 border-l-2 border-gray-200 pl-2 sm:pl-3 md:pl-4" : ""}`}>
      <div className="flex gap-2 sm:gap-3 mb-3 sm:mb-4">
        {/* Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex-shrink-0 w-8 h-8 sm:w-6 sm:h-6 mt-0.5 sm:mt-1 -ml-1 sm:ml-0 flex items-center justify-center hover:bg-gray-100 rounded transition-colors cursor-pointer touch-manipulation"
          aria-label={isCollapsed ? "Expand comment" : "Collapse comment"}
        >
          <div className="w-1.5 h-1.5 sm:w-1 sm:h-1 bg-gray-400 rounded-full" />
        </button>

        <div className="flex-1 min-w-0">
          {/* Comment Header - wrap on narrow screens */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1.5 sm:mb-2">
            <img
              src={"https://hinobody-uploads.s3.ap-northeast-2.amazonaws.com/uploads/contractor/1768388540764-dwcgwro84bh.png"}
              alt={comment.username}
              className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex-shrink-0"
            />
            <span className="font-semibold text-sm text-gray-900 truncate max-w-[120px] sm:max-w-[180px] md:max-w-none" title={comment.username}>
              {comment.username}
            </span>
            {comment.badge && (
              <span
                className={`text-xs font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${
                  comment.badge === "MOD" ? "bg-green-100 text-green-700" : comment.badge === "OP" ? "bg-blue-100 text-blue-700" : ""
                }`}
              >
                {comment.badge}
              </span>
            )}
            <span className="text-xs text-gray-500 flex-shrink-0">•</span>
            <span className="text-xs text-gray-500 truncate max-w-[90px] sm:max-w-none" title={comment.timestamp}>
              {comment.timestamp}
            </span>
            {comment.stickied && <PiNavigationArrow size={14} className="text-green-600 flex-shrink-0" />}
            {/* {comment.edited && (
              <span className="text-xs text-gray-500 flex-shrink-0 hidden sm:inline">
                • {t('edited')} {comment.editedTime}
              </span>
            )} */}
          </div>

          {/* Comment Content */}
          {!isCollapsed && (
            <>
              <div className={`text-sm text-gray-800 mb-2 sm:mb-3 break-words ${comment.highlighted ? "bg-yellow-50 p-2 sm:p-3 rounded" : ""}`}>
                {comment.text}
              </div>

              {/* Comment Actions - wrap on mobile */}
              <div className="flex flex-wrap items-center gap-x-1 gap-y-2 sm:gap-2">
                {/* Vote Buttons */}
                <div className="flex items-center gap-0.5 sm:gap-1 bg-gray-50 rounded-full">
                  <button
                    onClick={handleUpvote}
                    disabled={!isAuthenticated || isVoting}
                    className={`p-1.5 sm:p-1 hover:bg-gray-100 cursor-pointer rounded-l-full transition-colors touch-manipulation ${
                      voteState === "up" ? "text-orange-500" : "text-gray-500"
                    } ${!isAuthenticated || isVoting ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <HiOutlineThumbUp size={18} fill={voteState === "up" ? "currentColor" : "none"} />
                  </button>
                  <span className="text-xs font-bold text-gray-700 min-w-[28px] sm:min-w-[30px] text-center px-0.5">
                    {upvotes - downvotes}
                  </span>
                  <button
                    onClick={handleDownvote}
                    disabled={!isAuthenticated || isVoting}
                    className={`p-1.5 sm:p-1 hover:bg-gray-100 rounded-r-full cursor-pointer transition-colors touch-manipulation ${
                      voteState === "down" ? "text-blue-500" : "text-gray-500"
                    } ${!isAuthenticated || isVoting ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <HiOutlineThumbDown size={18} fill={voteState === "down" ? "currentColor" : "none"} />
                  </button>
                </div>

                {/* Reply Button */}
                <button
                  onClick={() => setShowReplyComment(!showReplyComment)}
                  className="flex items-center gap-1 px-2 py-1.5 sm:py-1 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded transition-colors cursor-pointer touch-manipulation"
                >
                  <BiMessageSquare size={16} />
                  <span>{t('reply')}</span>
                </button>

                {/* Award Button */}
                {/* <button className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded transition-colors cursor-pointer">
                  <BiAward size={16} />
                  <span>{t('award')}</span>
                </button> */}

                {/* Share Button */}
                {/* <button className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded transition-colors cursor-pointer">
                  <CiShare2 size={16} />
                  <span>{t('share')}</span>
                </button> */}

                {/* Awards Display */}
                {comment.awards > 0 && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-lg">🎁</span>
                    <span className="text-xs font-semibold text-gray-700">{comment.awards}</span>
                  </div>
                )}

                {/* More Options */}
                <div className="hover:bg-gray-100 rounded-full cursor-pointer ml-auto -mr-1">
                  <DropdownMenu items={getMenuItems(t, () => setShowReportModal(true), isAuthenticated, showError)} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      {showReplyComment && (
        <form
          onSubmit={handleSubmitReply}
          className={`flex flex-col gap-2 sm:flex-row sm:gap-2 mt-2 ${replyFormMarginLeft} w-full max-w-full sm:max-w-md`}
        >
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={isAuthenticated ? t('enterReply') : t('loginToReply')}
            disabled={!isAuthenticated || isSubmittingReply}
            className="flex-1 min-w-0 px-4 py-2.5 sm:py-2 bg-gray-50 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <div className="flex gap-2 flex-shrink-0">
            <button
              type="submit"
              disabled={!isAuthenticated || isSubmittingReply || !replyText.trim()}
              className="flex-1 sm:flex-initial min-h-[40px] sm:min-h-0 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
            >
              {isSubmittingReply ? '...' : t('reply')}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowReplyComment(false);
                setReplyText('');
              }}
              className="flex-1 sm:flex-initial min-h-[40px] sm:min-h-0 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-full transition-colors touch-manipulation"
            >
              {t('cancel')}
            </button>
          </div>
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
