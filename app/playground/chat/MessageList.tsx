"use client";

import { ReactNode, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function MessageList({
  messages,
  children,
}: {
  messages: unknown;
  children: ReactNode;
}) {
  const messageListRef = useRef<HTMLOListElement>(null);

  // Scrolls the list down when new messages are received or sent
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTo({
        top: messageListRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const hasMessages = Array.isArray(messages) && messages.length > 0;

  return (
    <ol
      ref={messageListRef}
      className={cn(
        "flex-1 overflow-y-auto px-6 py-6 space-y-4",
        "scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent",
        !hasMessages && "flex items-center justify-center"
      )}
    >
      {hasMessages ? (
        <div className="flex flex-col gap-4">
          {children}
        </div>
      ) : (
        <div className="text-center space-y-3">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 ring-1 ring-primary/10">
            <svg
              className="h-8 w-8 text-primary/60"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">No messages yet</p>
            <p className="text-xs text-muted-foreground/70">Start the conversation!</p>
          </div>
        </div>
      )}
    </ol>
  );
}
