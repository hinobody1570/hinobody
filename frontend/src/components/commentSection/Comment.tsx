import { useState } from "react";
import { BiAward, BiGlobe, BiInfoCircle, BiMessageSquare, BiSearch } from "react-icons/bi";
import { CiShare2 } from "react-icons/ci";
import { FiEyeOff } from "react-icons/fi";
import { HiOutlineArrowDown, HiOutlineArrowUp } from "react-icons/hi";
import { PiNavigationArrow } from "react-icons/pi";
import { DropdownMenu } from "../reuseComponents/DropDownMenu";
import { FaLayerGroup } from "react-icons/fa";

interface commentType {
  comment: any;
  level?: number;
}

export const menuItems = [
  {
    icon: FiEyeOff,
    label: "Hide",
    onClick: () => console.log("Hide clicked"),
  },
  {
    icon: FaLayerGroup,
    label: "Report",
    onClick: () => console.log("Report clicked"),
  },
  {
    icon: BiInfoCircle,
    label: "About this ad",
    onClick: () => console.log("About clicked"),
  },
  {
    icon: BiGlobe,
    label: "Tired of ads?",
    onClick: () => console.log("Ads clicked"),
  },
];

const Comment = ({ comment, level = 0 }: commentType) => {
  const [upvotes, setUpvotes] = useState(comment.upvotes);
  const [voteState, setVoteState] = useState<any>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showReplyComment, setShowReplyComment] = useState(false);

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
    <div className={`${level > 0 ? "ml-8 border-l-2 border-gray-200 pl-4" : ""}`}>
      <div className="flex gap-3 mb-4">
        {/* Collapse Button */}
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="flex-shrink-0 w-6 h-6 mt-1 hover:bg-gray-100 rounded transition-colors">
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          </div>
        </button>

        <div className="flex-1">
          {/* Comment Header */}
          <div className="flex items-center gap-2 mb-2">
            <img src={comment.avatar} alt={comment.username} className="w-6 h-6 rounded-full" />
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
            {comment.edited && <span className="text-xs text-gray-500">• Edited {comment.editedTime}</span>}
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
                    className={`p-1 hover:bg-gray-100 rounded transition-colors ${voteState === "up" ? "text-orange-500" : "text-gray-500"}`}
                  >
                    <HiOutlineArrowUp size={18} fill={voteState === "up" ? "currentColor" : "none"} />
                  </button>
                  <span className="text-xs font-bold text-gray-700 min-w-[30px] text-center">{upvotes}</span>
                  <button
                    onClick={handleDownvote}
                    className={`p-1 hover:bg-gray-100 rounded transition-colors ${voteState === "down" ? "text-blue-500" : "text-gray-500"}`}
                  >
                    <HiOutlineArrowDown size={18} fill={voteState === "down" ? "currentColor" : "none"} />
                  </button>
                </div>

                {/* Reply Button */}
                <button
                  onClick={() => setShowReplyComment(!showReplyComment)}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded transition-colors"
                >
                  <BiMessageSquare size={16} />
                  <span>Reply</span>
                </button>

                {/* Award Button */}
                <button className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded transition-colors">
                  <BiAward size={16} />
                  <span>Award</span>
                </button>

                {/* Share Button */}
                <button className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded transition-colors">
                  <CiShare2 size={16} />
                  <span>Share</span>
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
                  <DropdownMenu items={menuItems} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      {showReplyComment && (
        <div className="relative flex-1 max-w-md ml-20">
          <BiSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Enter reply"
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
          />
        </div>
      )}

      {/* Nested Comments */}
      {!isCollapsed && comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map((reply: any) => (
            <Comment key={reply.id} comment={reply} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Comment;
