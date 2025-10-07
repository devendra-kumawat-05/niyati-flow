"use client";

import Image from "next/image";
import { useState } from "react";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatMessage from "@/components/chat/ChatMessage";
import ChatInput from "@/components/chat/ChatInput";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { role: "user", content: "Do product managers need to code?" },
    {
      role: "assistant",
      content:
        "Product managers do not need to code, but t necessarily need to know how to code, though understanding technical concepts can be helpful.",
    },
  ]);

  const handleSend = (message: string) => {
    setMessages((prev) => [...prev, { role: "user", content: message }]);

    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "This is a mock AI reply." },
      ]);
    }, 800);
  };

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
          {messages.map((msg, idx) => (
            <ChatMessage key={idx} role={msg.role} content={msg.content} />
          ))}
        </main>

        <ChatInput onSend={handleSend} />
      </div>
    </div>
  );
}
