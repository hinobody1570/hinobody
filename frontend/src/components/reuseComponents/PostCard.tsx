"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { FiMessageSquare, FiMoreHorizontal, FiShare2 } from "react-icons/fi";
import { GoBell } from "react-icons/go";
import { HiOutlineArrowDown, HiOutlineArrowUp } from "react-icons/hi";

export const PostCard = ({ post }: any) => {
  const t = useTranslations('feed');
  const [upvotes, setUpvotes] = useState(post.upvotes);
  const [voteState, setVoteState] = useState<any>(null); // null, 'up', or 'down'

  const handleUpvote = () => {
    if (voteState === "up") {
      setUpvotes(upvotes - 1);
      setVoteState(null);
    } else if (voteState === "down") {
      setUpvotes(upvotes + 2);
      setVoteState("up");
    } else {
      setUpvotes(upvotes + 1);
      setVoteState("up");
    }
  };

  const handleDownvote = () => {
    if (voteState === "down") {
      setUpvotes(upvotes + 1);
      setVoteState(null);
    } else if (voteState === "up") {
      setUpvotes(upvotes - 2);
      setVoteState("down");
    } else {
      setUpvotes(upvotes - 1);
      setVoteState("down");
    }
  };

  return (
    <article
      className="bg-white border border-gray-300 rounded-lg mb-4 overflow-hidden hover:border-gray-400 transition-colors"
      style={{ marginBottom: "4px" }}
    >
      {/* Post Header */}
      <div className="flex items-center justify-between px-3 py-2" style={{ padding: "12px" }}>
        <div className="flex items-center gap-2">
          <Image src={post.communityAvatar} alt={post.community} className="w-6 h-6 rounded-full" />
          <span className="font-bold text-sm hover:underline cursor-pointer">{post.community}</span>
          {post.verified && (
            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          )}
          <span className="text-gray-500 text-xs">• {post.timestamp}</span>
          {post.badge && (
            <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-semibold" style={{ padding: "4px" }}>
              {post.badge}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-4 py-1 bg-blue-600 text-white text-sm font-semibold rounded-full hover:bg-blue-700 transition-colors"
            style={{ padding: "4px" }}
          >
            {t('join')}
          </button>
          <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <FiMoreHorizontal size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Post Title */}
      <div className="px-3 pb-2" style={{ padding: "3px 2px" }}>
        <h2 className="text-lg font-medium text-gray-900 hover:text-gray-700 cursor-pointer">{post.title}</h2>
      </div>

      {/* Post Image/Content */}
      {post.image && (
        <div className="bg-black">
          <Image src={post.image} alt={post.title} className="w-full max-h-[600px] object-contain" />
        </div>
      )}

      {/* Post Actions */}
      <div className="flex items-center gap-2 px-3 py-2 border-t border-gray-200" style={{ padding: "20px 10px" }}>
        <div className="flex items-center bg-gray-100 rounded-full">
          <button
            style={{ padding: "4px" }}
            onClick={handleUpvote}
            className={`p-1.5 hover:bg-gray-200 rounded-l-full transition-colors ${voteState === "up" ? "text-orange-500" : "text-gray-600"}`}
          >
            <HiOutlineArrowUp size={20} fill={voteState === "up" ? "currentColor" : "none"} />
          </button>
          <span style={{ padding: "4px" }} className="px-2 text-sm font-bold text-gray-800 min-w-[40px] text-center">
            {upvotes}
          </span>
          <button
            style={{ padding: "4px" }}
            onClick={handleDownvote}
            className={`p-1.5 hover:bg-gray-200 rounded-r-full transition-colors ${voteState === "down" ? "text-blue-500" : "text-gray-600"}`}
          >
            <HiOutlineArrowDown size={20} fill={voteState === "down" ? "currentColor" : "none"} />
          </button>
        </div>

        <button style={{ padding: "2px" }} className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded-full transition-colors">
          <FiMessageSquare size={20} className="text-gray-600" />
          <span className="text-sm font-semibold text-gray-800">{post.comments}</span>
        </button>

        <button style={{ padding: "2px" }} className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded-full transition-colors">
          <GoBell size={20} className="text-gray-600" />
        </button>

        <button style={{ padding: "2px" }} className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded-full transition-colors">
          <FiShare2 size={20} className="text-gray-600" />
          <span className="text-sm font-semibold text-gray-800">{t('share')}</span>
        </button>
      </div>
    </article>
  );
};