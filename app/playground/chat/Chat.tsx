"use client";

import { Message } from "@/app/playground/chat/Message";
import { MessageList } from "@/app/playground/chat/MessageList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery } from "convex/react";
import { FormEvent, useState } from "react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Send, MessageSquare } from "lucide-react";

export function Chat({ viewer }: { viewer: Id<"users"> }) {
  const [newMessageText, setNewMessageText] = useState("");
  const messages = useQuery(api.messages.list);
  const sendMessage = useMutation(api.messages.send);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newMessageText.trim()) return;
    setNewMessageText("");
    sendMessage({ body: newMessageText, author: viewer }).catch((error) => {
      console.error("Failed to send message:", error);
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/10">
          <MessageSquare className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-semibold">Chat Playground</h1>
          <p className="text-xs text-muted-foreground">Real-time messaging</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-600 dark:text-green-400 ring-1 ring-green-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            Live
          </span>
        </div>
      </div>

      {/* Messages */}
      <MessageList messages={messages}>
        {messages?.map((message) => (
          <Message
            key={message._id}
            authorName={message.author}
            authorId={message.userId}
            viewerId={viewer}
          >
            {message.body}
          </Message>
        ))}
      </MessageList>

      {/* Input Form */}
      <div className="border-t border-border/50 bg-card/30 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="flex gap-3 p-4">
          <Input
            value={newMessageText}
            onChange={(event) => setNewMessageText(event.target.value)}
            placeholder="Type your message..."
            className="flex-1 h-12 rounded-xl border-border/50 bg-background/50 px-4 transition-all hover:border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
          <Button 
            type="submit" 
            disabled={!newMessageText.trim()}
            className="h-12 px-6 rounded-xl gap-2 shadow-glow-sm hover:shadow-glow transition-all"
          >
            <Send className="h-4 w-4" />
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
