"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";
import type { ChatMessageDto } from "@/lib/api";

const getApiBaseUrl = () => {
  if (typeof window === "undefined") return "http://localhost:3001";
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
};

export type ChatSocketEvent =
  | { type: "message"; message: ChatMessageDto }
  | { type: "message:updated"; message: ChatMessageDto }
  | { type: "message:deleted"; messageId: string }
  | { type: "error"; message: string };

export function useChatSocket(
  token: string | null,
  onEvent: (event: ChatSocketEvent) => void
) {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    if (!token || typeof window === "undefined") return;

    const baseUrl = getApiBaseUrl();
    const socket = io(`${baseUrl}/chat`, {
      path: "/socket.io",
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("message", (message: ChatMessageDto) =>
      onEventRef.current({ type: "message", message })
    );
    socket.on("message:updated", (message: ChatMessageDto) =>
      onEventRef.current({ type: "message:updated", message })
    );
    socket.on("message:deleted", (payload: { messageId: string }) =>
      onEventRef.current({ type: "message:deleted", messageId: payload.messageId })
    );
    socket.on("error", (payload: { message?: string }) =>
      onEventRef.current({ type: "error", message: payload?.message || "Unknown error" })
    );

    socketRef.current = socket;
    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [token]);

  const sendMessage = useCallback((receiverId: string, text: string) => {
    socketRef.current?.emit("message", { receiverId, text });
  }, []);

  const editMessage = useCallback((messageId: string, text: string) => {
    socketRef.current?.emit("message:edit", { messageId, text });
  }, []);

  const deleteMessage = useCallback((messageId: string) => {
    socketRef.current?.emit("message:delete", { messageId });
  }, []);

  return { connected, sendMessage, editMessage, deleteMessage };
}
