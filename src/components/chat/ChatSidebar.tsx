"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import {
  Plus,
  Search,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react";

interface UserData {
  id: number;
  email: string;
  name: string | null;
  image: string | null;
}

interface Conversation {
  id: string;
  title: string;
}

export default function ChatSidebar() {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'default' | 'destructive' } | null>(null);
  
  // Fetch user data
  const { data: user, isLoading: isLoadingUser } = api.auth.getUser.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Mock conversations data - replace with actual data fetching if needed
  const conversations: Conversation[] = [];
  const isLoading = isLoadingUser;

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (response.ok) {
        // Clear any client-side data
        if (typeof window !== 'undefined') {
          localStorage.clear();
          sessionStorage.clear();
        }
        window.location.href = '/';
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      setToast({
        message: 'Failed to log out. Please try again.',
        type: 'destructive',
      });
      setShowLogoutDialog(false);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const confirmLogout = () => {
    setShowLogoutDialog(true);
  };

  const cancelLogout = () => {
    setShowLogoutDialog(false);
  };
  
  const handleProfileClick = () => {
    router.push('/profile');
  };

  return (
    <div className={`h-screen bg-white border-r border-zinc-200 flex flex-col transition-all duration-300 ${
      collapsed ? "w-20" : "w-64"
    }`}>
      {/* Header Section */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200">
        {!collapsed && (
          <div className="flex items-center gap-2">
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
          className="text-gray-700 hover:bg-gray-100"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </Button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* New Chat Button */}
        <div className="p-4 border-b border-zinc-200">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            <Plus size={16} className="mr-2" />
            {!collapsed && "New Chat"}
          </Button>
        </div>

        {/* Search */}
        <div className="p-4">
          {collapsed ? (
            <Button variant="ghost" size="icon" className="w-10 h-10">
              <Search className="h-4 w-4" />
            </Button>
          ) : (
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search chats..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            </div>
          ) : conversations.length > 0 ? (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-3 rounded-lg cursor-pointer hover:bg-gray-100 ${
                  collapsed ? "hidden" : ""
                }`}
              >
                <p className="truncate text-sm">{conversation.title}</p>
              </div>
            ))
          ) : (
            !collapsed && (
              <div className="text-center p-4 text-sm text-gray-500">
                No conversations yet
              </div>
            )
          )}
        </div>
      </div>

      {/* User Profile - Positioned at the bottom */}
      <div className="p-4 border-t border-zinc-200 mt-auto">
        <div className="flex items-center justify-between">
          <div 
            className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${!collapsed ? 'w-full' : 'justify-center'}`}
            onClick={handleProfileClick}
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary">
                {user?.name 
                  ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
                  : user?.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            {!collapsed && user && (
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">{user.name || user.email?.split('@')[0] || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            )}
          </div>
          {!collapsed && user && (
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:bg-gray-100"
              onClick={confirmLogout}
              title="Logout"
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <LogOut size={18} />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to log out? You'll need to sign in again to access your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button 
              variant="outline" 
              onClick={cancelLogout}
              disabled={isLoggingOut}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="ml-2"
            >
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50">
          <div 
            className={`p-4 rounded-md shadow-lg ${
              toast.type === 'destructive' 
                ? 'bg-red-100 text-red-700 border border-red-200' 
                : 'bg-green-100 text-green-700 border border-green-200'
            } flex items-center`}
          >
            <span>{toast.message}</span>
            <button 
              onClick={() => setToast(null)}
              className="ml-4 text-current hover:opacity-70 focus:outline-none"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}