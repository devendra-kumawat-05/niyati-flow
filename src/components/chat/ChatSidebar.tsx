"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import {
  Menu,
  Plus,
  Search,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";

export default function ChatSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: conversations, isLoading } = trpc.chat.getConversations.useQuery();
  const createConversation = trpc.chat.createConversation.useMutation();

  const filteredConversations = conversations?.filter((conversation: any) =>
    conversation.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleNewChat = () => {
    createConversation.mutate({
      title: "New Chat",
    });
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 260 }}
      transition={{ duration: 0.3 }}
      className="h-screen bg-[#fff] border-r border-zinc-800 flex flex-col text-black"
    >
      {/* Header Section */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        {!collapsed && (
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
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-black hover:text-black/90"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </Button>
      </div>

      {/* New Chat */}
      <div className="p-4 border-b border-zinc-800">
        <Button
          className="w-full bg-[#ffb34e] hover:bg-[#ffb34e]/90 text-black hover:text-black/90 cursor-pointer flex items-center justify-center"
          onClick={handleNewChat}
          disabled={createConversation.isLoading}
        >
          <Plus size={16} className="mr-1" />
          {!collapsed && "New Chat"}
        </Button>
      </div>

      {/* Search */}
      <div className="px-4 pt-4">
        {collapsed ? (
          <button
            className="flex items-center justify-center w-10 h-10 rounded-md  border-zinc-700 hover:bg-zinc-200 transition"
            title="Search"
          >
            <Search className="h-4 w-4 text-black" />
          </button>
        ) : (
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-black" />
            <Input
              placeholder="Search chats..."
              className="pl-8 border-zinc-700 text-black"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {isLoading ? (
          <div className="text-sm text-black/60">Loading conversations...</div>
        ) : (
          filteredConversations.map((conversation: any) => (
            <div
              key={conversation.id}
              className={`p-3 rounded-lg cursor-pointer hover:bg-zinc-200 transition ${
                collapsed ? "hidden" : ""
              }`}
            >
              {conversation.title}
            </div>
          ))
        )}
      </div>

      <Separator className="bg-zinc-800" />

      {/* User Profile */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://github.com/shadcn.png" alt="User" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div>
              <p className="text-sm font-medium">Jane Doe</p>
              <p className="text-xs text-black">UI/UX Designer</p>
            </div>
          )}
        </div>

        {!collapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="text-black hover:bg-zinc-200"
          >
            <LogOut size={18} />
          </Button>
        )}
      </div>
    </motion.aside>
  );
}
