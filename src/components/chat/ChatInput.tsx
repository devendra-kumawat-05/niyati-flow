import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, Mic, Smile } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => Promise<void>;
  isSending?: boolean;
  className?: string;
}

export default function ChatInput({ 
  onSend, 
  isSending = false, 
  className 
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;
    
    try {
      await onSend(message);
      setMessage("");
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [message]);

  return (
    <div className={cn("w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center px-4 py-2">
         

          {/* Message input */}
          <div className="relative flex-1">
            <div className="relative">
              <textarea
                ref={textareaRef}
                rows={1}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isSending ? 'Sending message...' : 'Type a message...'}
                className="w-full max-h-32 min-h-[40px] resize-none bg-background px-4 py-2.5 pr-12 text-sm focus-visible:outline-none disabled:opacity-50"
                disabled={isSending}
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'hsl(var(--muted)) transparent',
                }}
              />
              
            </div>
          </div>

          {/* Send button */}
          <div className="ml-2">
            <Button
              type="submit"
              size="icon"
              className="h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              disabled={isSending || !message.trim()}
            >
              {isSending ? (
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="sr-only">Send message</span>
            </Button>
          </div>
        </div>
      </form>
      
      {/* Character counter */}
      <div className="px-4 pb-2">
        <p className="text-xs text-muted-foreground text-right">
          {message.length}/1000
        </p>
      </div>
    </div>
  );
}
