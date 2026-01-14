"use client";

import { useState, useEffect } from 'react';
import { BiChevronDown, BiSearch } from 'react-icons/bi';
import Comment from './Comment';
import { commentsApi, Comment as CommentType, Language } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useLanguage } from '@/contexts/LanguageContext';
import DP from '../../../public/assets/images/avatar_default_4.png';

// Helper function to format timestamp
const formatTimestamp = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} sec. ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? 'min' : 'mins'}. ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? 'hr' : 'hrs'}. ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  } else {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  }
};

// Transform API comment to Comment component format
const transformComment = (comment: CommentType, postAuthorId?: string): any => {
  return {
    id: comment.id,
    username: comment.author?.nickname || 'Anonymous',
    avatar: DP, // Default avatar
    badge: comment.authorId === postAuthorId ? 'OP' : undefined,
    timestamp: formatTimestamp(comment.createdAt),
    text: comment.body,
    upvotes: comment.upvoteCount || 0,
    downvotes: comment.downvoteCount || 0,
    edited: comment.updatedAt !== comment.createdAt,
    editedTime: comment.updatedAt !== comment.createdAt ? formatTimestamp(comment.updatedAt) : undefined,
    replies: comment.replies ? comment.replies.map((reply) => transformComment(reply, postAuthorId)) : [],
  };
};

interface CommentsSectionProps {
  postId: string;
  postAuthorId?: string;
}

// Main Comments Section Component
export const CommentsSection = ({ postId, postAuthorId }: CommentsSectionProps) => {
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();
  const { locale } = useLanguage();
  const [sortBy, setSortBy] = useState('Best');
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const fetchComments = async () => {
    if (!postId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await commentsApi.getByPost(postId, 1, 50);
      const transformedComments = response.data.map((comment) => transformComment(comment, postAuthorId));
      setComments(transformedComments);
    } catch (err: any) {
      console.error('Error fetching comments:', err);
      setError(err.message || 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId, postAuthorId]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showError('Please login to comment');
      return;
    }

    if (!newComment.trim()) {
      showError('Please enter a comment');
      return;
    }

    try {
      setIsSubmitting(true);
      await commentsApi.create({
        body: newComment.trim(),
        originalLanguage: getLanguage(),
        postId: postId,
      });
      setNewComment('');
      showSuccess('Comment added successfully!');
      // Refresh comments
      await fetchComments();
    } catch (err: any) {
      console.error('Error creating comment:', err);
      showError(err.message || 'Failed to add comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">

      {/* Comment Input */}
      <form onSubmit={handleSubmitComment} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={isAuthenticated ? "Join the conversation" : "Login to comment"}
            disabled={!isAuthenticated || isSubmitting}
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!isAuthenticated || isSubmitting || !newComment.trim()}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>

      {/* Sort and Search */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <button
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-gray-800 hover:bg-gray-100 rounded transition-colors cursor-pointer"
            onClick={() => setSortBy('Best')}
          >
            {sortBy}
            <BiChevronDown size={16} />
          </button>
        </div>

        <div className="relative flex-1 max-w-md">
          <BiSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search Comments"
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Loading comments...</div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Comments List */}
      {!loading && !error && comments.length === 0 && (
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">No comments yet. Be the first to comment!</div>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          {comments.map((comment) => (
            <Comment 
              key={comment.id} 
              comment={comment}
              postId={postId}
              postAuthorId={postAuthorId}
              onReplyAdded={fetchComments}
            />
          ))}
        </div>
      )}
    </div>
  );
};