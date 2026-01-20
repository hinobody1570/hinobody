"use client";

import { useToast } from "@/contexts/ToastContext";
import { Board, boardsApi } from "@/lib/api";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface JoinBoardPopupProps {
  board: Board | null;
  isOpen: boolean;
  onClose: () => void;
  onJoinSuccess: () => void;
}

export const JoinBoardPopup = ({ board, isOpen, onClose, onJoinSuccess }: JoinBoardPopupProps) => {
  const [isJoining, setIsJoining] = useState(false);
  const { showSuccess, showError } = useToast();
  const t = useTranslations("createPost");

  if (!isOpen || !board) return null;

  const handleJoin = async () => {
    setIsJoining(true);
    try {
      const membership = await boardsApi.join(board.id);
      
      if (membership.status === "APPROVED") {
        showSuccess("Successfully joined the board! You can now post.");
        onJoinSuccess();
        onClose();
      } else if (membership.status === "PENDING") {
        showSuccess("Join request submitted! The board creator will review your request.");
        onClose();
      }
    } catch (error: any) {
      console.error("Error joining board:", error);
      const errorMessage = error?.message || "Failed to join board. Please try again.";
      showError(errorMessage);
    } finally {
      setIsJoining(false);
    }
  };

  const getMessage = () => {
    if (board.visibilityAccess === "PUBLIC") {
      return "You need to join this board before posting. Click 'Join' to become a member.";
    } else if (board.visibilityAccess === "PRIVATE" || board.visibilityAccess === "RESTRICTED") {
      return "You need to join this board before posting. Your request will be sent to the board creator for approval.";
    }
    return "You need to join this board before posting.";
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Join Board to Post
        </h2>
        
        <div className="mb-4">
          <p className="text-gray-600 mb-2">
            You're trying to post in <span className="font-semibold">r/{board.name}</span>
          </p>
          <p className="text-sm text-gray-500">
            {getMessage()}
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isJoining}
            className="px-4 py-2 cursor-pointer text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleJoin}
            disabled={isJoining}
            className={`px-6 py-2 cursor-pointer text-sm font-semibold rounded-full transition-colors ${
              isJoining
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isJoining ? "Joining..." : "Join"}
          </button>
        </div>
      </div>
    </div>
  );
};

