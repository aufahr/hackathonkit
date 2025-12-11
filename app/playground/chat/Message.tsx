import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export function Message({
  authorName,
  authorId,
  viewerId,
  children,
}: {
  authorName: string;
  authorId: Id<"users">;
  viewerId: Id<"users">;
  children: ReactNode;
}) {
  const isOwnMessage = authorId === viewerId;
  
  // Generate a consistent color based on author name for avatar
  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-gradient-to-br from-blue-500 to-blue-600",
      "bg-gradient-to-br from-green-500 to-green-600",
      "bg-gradient-to-br from-purple-500 to-purple-600",
      "bg-gradient-to-br from-pink-500 to-pink-600",
      "bg-gradient-to-br from-amber-500 to-amber-600",
      "bg-gradient-to-br from-cyan-500 to-cyan-600",
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <li
      className={cn(
        "flex gap-3 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300",
        isOwnMessage ? "ml-auto flex-row-reverse" : "mr-auto",
      )}
    >
      {/* Avatar */}
      <div 
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white shadow-sm",
          isOwnMessage 
            ? "bg-gradient-to-br from-primary to-orange-500" 
            : getAvatarColor(authorName)
        )}
      >
        {getInitials(authorName)}
      </div>
      
      {/* Message content */}
      <div className={cn(
        "flex flex-col gap-1",
        isOwnMessage ? "items-end" : "items-start"
      )}>
        <span className="text-xs font-medium text-muted-foreground px-1">
          {isOwnMessage ? "You" : authorName}
        </span>
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm transition-all",
            isOwnMessage 
              ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-tr-md" 
              : "bg-card border border-border/50 text-foreground rounded-tl-md",
          )}
        >
          {children}
        </div>
      </div>
    </li>
  );
}
