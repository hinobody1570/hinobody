"use client";

import type { Message } from "./types";

interface MessageBubbleProps {
  message: Message;
  prevSameSender: boolean;
}

export function MessageBubble({ message, prevSameSender }: MessageBubbleProps) {
  const isSent = message.sent;

  return (
    <div className={`flex flex-col ${isSent ? "items-end" : "items-start"} ${prevSameSender ? "mt-0.5" : "mt-2"}`}>
      <div
        className={`
          max-w-[65%] py-2.5 px-3.5 rounded-[22px] text-sm leading-snug break-words
          animate-[popIn_0.2s_cubic-bezier(0.34,1.56,0.64,1)]
          ${isSent ? "bg-[#3897f0] text-white rounded-br-[6px]" : "bg-[#1c1c1c] text-white rounded-bl-[6px]"}
          ${prevSameSender ? (isSent ? "rounded-br-[22px]" : "rounded-bl-[22px]") : ""}
        `}
      >
        {message.text}
      </div>
      <div className="flex items-center gap-1 mt-1 text-[11px] text-[#444]">
        <span>{message.time}</span>
      </div>
    </div>
  );
}
