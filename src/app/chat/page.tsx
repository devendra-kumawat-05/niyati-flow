"use client";

import Image from "next/image";
import React, { useState } from "react";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatMessage from "@/components/chat/ChatMessage";
import ChatInput from "@/components/chat/ChatInput";
import { trpc } from "@/lib/trpc";

export default function ChatPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);

  const { data: conversation, isLoading: conversationLoading, refetch } = trpc.chat.getConversation.useQuery(
    { conversationId: selectedConversationId ?? -1 },
    { enabled: !!selectedConversationId && (selectedConversationId ?? -1) > 0 }
  );

  const sendMessage = trpc.chat.sendMessage.useMutation();
  const createConversation = trpc.chat.createConversation.useMutation();

  const generateAIResponse = trpc.ai.generateResponse.useMutation();

  const handleSend = async (message: string) => {
    let conversationId = selectedConversationId;
    
    if (!conversationId) {
      // Create a new conversation if none selected
      const newConversation = await createConversation.mutateAsync({
        title: message.slice(0, 50) + (message.length > 50 ? "..." : ""),
      });
      conversationId = newConversation.id;
      setSelectedConversationId(conversationId);
    }

    // Send the user message
    await sendMessage.mutateAsync({
      conversationId: conversationId!,
      content: message,
      role: "user",
    });

    // Refetch to show user message
    await refetch();

    try {
      // Generate AI response
      const aiResponse = await generateAIResponse.mutateAsync({
        conversationId: conversationId!,
        message: message,
      });

      // Save AI response to the conversation
      await sendMessage.mutateAsync({
        conversationId: conversationId!,
        content: aiResponse.response,
        role: "assistant",
      });

      // Refetch to show AI response
      await refetch();
    } catch (error: any) {
      console.error("Error generating AI response:", error);
      
      // Extract error message
      const errorMessage = error?.message || error?.data?.message || "I'm sorry, I encountered an error while generating a response. Please try again.";
      
      // Fallback message if AI generation fails
      await sendMessage.mutateAsync({
        conversationId: conversationId!,
        content: `⚠️ ${errorMessage}`,
        role: "assistant",
      });

      // Refetch to show error message
      await refetch();
    }
  };

  // Refetch conversation when selectedConversationId changes
  React.useEffect(() => {
    if (selectedConversationId) {
      refetch();
    }
  }, [selectedConversationId, refetch]);

  const messages = conversation?.messages || [];

  return (
    <div className="flex h-screen bg-white text-black">
      {/* Sidebar */}
      <ChatSidebar />

      {/* Chat Area */}
      <div className="flex flex-col flex-1">
        <header className="p-4 border-b border-zinc-800 text-lg font-semibold">
          <div className="flex items-center gap-2 my-auto">
            <Image
              src="/logo.png"
              alt="Niyati Flow Logo"
              height={40}
              width={40}
              className="rounded-full"
            />

            <h2 className="font-semibold text-lg">Niyati Flow</h2>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {conversationLoading ? (
            <div className="text-black/60">Loading conversation...</div>
          ) : messages.length === 0 ? (
            <div className="text-black/60 text-center">
              Start a conversation by sending a message below.
            </div>
          ) : (
            messages.map((msg: any) => (
              <ChatMessage key={msg.id} role={msg.role} content={msg.content} />
            ))
          )}
        </main>

        <ChatInput onSend={handleSend} />
      </div>
    </div>
  );
}
