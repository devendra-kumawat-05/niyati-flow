"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatMessage from "@/components/chat/ChatMessage";
import ChatInput from "@/components/chat/ChatInput";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

export default function ChatPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // TRPC Queries and Mutations
  const { data: conversation, isLoading: conversationLoading, refetch } = 
    trpc.chat.getConversation.useQuery(
      { conversationId: selectedConversationId || 0 },
      { enabled: !!selectedConversationId }
    );

  const sendMessage = trpc.chat.sendMessage.useMutation({
    onError: (error) => {
      toast.error(error.message || "Failed to send message");
    },
  });

  const createConversation = trpc.chat.createConversation.useMutation({
    onSuccess: (data) => {
      setSelectedConversationId(data.id);
      router.push(`/chat?conversationId=${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create conversation");
    },
  });

  const generateAIResponse = trpc.ai.generateResponse.useMutation({
    onError: (error) => {
      toast.error(error.message || "Failed to generate AI response");
    },
  });

  // Handle conversation selection from URL
  useEffect(() => {
    const conversationId = searchParams.get('conversationId');
    if (conversationId) {
      setSelectedConversationId(Number(conversationId));
    }
    setIsInitialLoad(false);
  }, [searchParams, isInitialLoad]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  const handleNewChat = () => {
    createConversation.mutate({ title: 'New Chat' });
  };

  const handleSelectConversation = (id: number) => {
    setSelectedConversationId(id);
    router.push(`/chat?conversationId=${id}`);
  };

  const handleSend = async (message: string) => {
    if (!selectedConversationId) {
      toast.error("No conversation selected");
      return;
    }

    try {
      setIsSending(true);

      // Save user message
      await sendMessage.mutateAsync({
        conversationId: selectedConversationId,
        content: message,
        role: 'user',
      });

      // Refresh messages to show the user's message
      await refetch();

      try {
        // Generate AI response
        const aiResponse = await generateAIResponse.mutateAsync({
          conversationId: selectedConversationId,
          message: message,
        });

        // Save AI response
        await sendMessage.mutateAsync({
          conversationId: selectedConversationId,
          content: aiResponse.response,
          role: 'assistant',
        });

        // Refresh messages to show the AI's response
        await refetch();
      } catch (aiError) {
        console.error("AI Response Error:", aiError);
        const errorMessage = aiError instanceof Error ? aiError.message : 'Failed to generate AI response';
        
        // Save error message to chat
        await sendMessage.mutateAsync({
          conversationId: selectedConversationId,
          content: `I'm sorry, I encountered an error: ${errorMessage}`,
          role: 'assistant',
        });
        
        // Refresh messages to show the error
        await refetch();
      }
    } catch (error: unknown) {
      console.error("Send Message Error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process your message';
      toast({
        title: "Error",
        description: errorMessage,
        type: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - Fixed */}
      <div className="w-64 border-r h-full flex-shrink-0 overflow-y-auto">
        <ChatSidebar
          selectedConversationId={selectedConversationId}
          onSelectConversation={handleSelectConversation}
          onCreateNewChat={handleNewChat}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Messages area - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto w-full px-4 py-6 space-y-6">
            {conversationLoading && !conversation ? (
              // Loading skeleton
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : conversation?.messages?.length ? (
              // Messages list
              <div className="space-y-6">
                {conversation.messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={{
                      id: message.id,
                      content: message.content,
                      role: message.role,
                      createdAt: message.createdAt,
                      isTyping: false
                    }}
                  />
                ))}
                {isSending && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <Image src="/logo.png" alt="Logo" width={20} height={20} />
                    </div>
                    <div className="flex-1">
                      <div className="bg-muted text-foreground rounded-2xl rounded-tl-none p-3 text-sm max-w-xs">
                        <div className="flex space-x-1 items-center">
                          <div className="w-2 h-2 rounded-full bg-foreground/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 rounded-full bg-foreground/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 rounded-full bg-foreground/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            ) : (
              // Empty state
              <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Image src="/logo.png" alt="Logo" width={40} height={40} />
                </div>
                <h2 className="text-2xl font-bold mb-2">How can I help you today?</h2>
                <p className="text-muted-foreground max-w-md">
                  Ask me anything about job interviews, career advice, or anything else on your mind.
                </p>
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                  {[
                    'What are the best strategies to get hired?',
                    'How to impress the interviewer?',
                    'How to pass OrationAI Interview?',
                    'Tell me about yourself?',
                  ].map((suggestion, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      className="h-auto py-3 justify-start text-left"
                      onClick={() => handleSend(suggestion)}
                    >
                      <Search className="h-4 w-4 mr-2 text-muted-foreground" />
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Message input - Fixed at bottom */}
        <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-shrink-0">
          <div className="max-w-4xl mx-auto">
            <ChatInput
              onSend={handleSend}
              isSending={isSending}
            />
          </div>
        </div>
      </div>
    </div>
  );
}