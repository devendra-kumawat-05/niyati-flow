import { cn } from "@/lib/utils";
import { User } from "lucide-react";
import Image from "next/image";

export interface Message {
  id: number;
  content: string;
  role: 'user' | 'assistant';
  createdAt: string;
  isTyping?: boolean;
}

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const { role, content, isTyping } = message;
  const isUser = role === "user";
  
  return (
    <div className={cn(
      "flex w-full mb-4",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "flex items-start gap-2.5 max-w-3xl w-full",
        isUser ? "flex-row-reverse" : "flex-row"
      )}>
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}>
          {isUser ? (
            <User className="w-4 h-4" />
          ) : (
            // <MessageSquareText className="w-4 h-4" />
            <Image src="/logo.png" alt="Logo" width={20} height={20} />
          )}
        </div>
        
        <div className={cn(
          "flex flex-col gap-1 w-full",
          isUser ? "items-end" : "items-start"
        )}>
          <div className={cn(
            "p-3 rounded-2xl text-sm",
            isUser 
              ? "bg-primary text-primary-foreground rounded-tr-none"
              : "bg-muted text-foreground rounded-tl-none"
          )}>
            {isTyping ? (
              <div className="flex space-x-1 items-center">
                <div className="w-2 h-2 rounded-full bg-foreground/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-foreground/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-foreground/50 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            ) : (
              <p className="whitespace-pre-wrap">{content}</p>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
}
