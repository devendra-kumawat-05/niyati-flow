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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  Plus,
  Search,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  MessageSquare,
  Sparkles,
  Bot,
} from "lucide-react";

interface UserData {
  id: number;
  email: string;
  name: string | null;
  image?: string | null;
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

  // Fetch conversations
  const { data: conversations = [], isLoading: isLoadingConversations, refetch: refetchConversations } = api.chat.getConversations.useQuery();
  const isLoading = isLoadingUser || isLoadingConversations;
  
  // Create new conversation
  const createConversation = api.chat.createConversation.useMutation({
    onSuccess: (newConversation) => {
      router.push(`/chat?conversationId=${newConversation.id}`);
      refetchConversations();
    },
  });
  
  // Handle new chat button click
  const handleNewChat = () => {
    createConversation.mutate({
      title: 'New Chat',
    });
  };

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

  // Effect to handle initial conversation selection from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const conversationId = urlParams.get('conversationId');
    if (conversationId && !isLoading) {
      // Already handled by the parent component
    }
  }, [isLoading]);

  return (
    <div 
      className={cn(
        "flex flex-col h-full bg-background border-r border-border transition-all duration-300 overflow-hidden",
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header Section */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCollapsed(!collapsed)}
                className="text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              >
                {collapsed ? (
                  <ChevronRight className="h-5 w-5" />
                ) : (
                  <ChevronLeft className="h-5 w-5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {collapsed ? 'Expand' : 'Collapse'} sidebar
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {!collapsed && (
          <div className="flex items-center gap-2 flex-1">
            <Image
              src="/logo.png"
              alt="Niyati Flow"
              height={28}
              width={28}
              className="rounded-full"
            />
            <h1 className="font-semibold text-lg text-foreground">Niyati Flow</h1>
          </div>
        )}
      </div>

      {/* Search Bar */}
      {!collapsed && (
        <div className="px-3 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-background/50 backdrop-blur-sm"
            />
          </div>
        </div>
      )}

      {/* Chat History */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="py-2">
            {isLoading ? (
              <div className="space-y-2 px-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-md" />
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No conversations yet</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2 text-primary"
                  onClick={handleNewChat}
                >
                  Start a new chat
                </Button>
              </div>
            ) : (
              <div className="space-y-1 px-1.5">
                {conversations
                  .filter(conv => 
                    conv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    searchTerm === ''
                  )
                  .map((conversation) => {
                    const urlParams = new URLSearchParams(window.location.search);
                    const isActive = urlParams.get('conversationId') === String(conversation.id);
                    
                    return (
                      <TooltipProvider key={conversation.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              className={cn(
                                "w-full text-left p-2.5 rounded-md text-sm transition-colors flex items-center gap-2 group",
                                isActive 
                                  ? 'bg-accent text-accent-foreground' 
                                  : 'text-foreground/80 hover:bg-accent/50 hover:text-accent-foreground'
                              )}
                              onClick={() => {
                                router.push(`/chat?conversationId=${conversation.id}`);
                              }}
                            >
                              <MessageSquare className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                              {!collapsed && (
                                <span className="truncate flex-1">
                                  {conversation.title}
                                </span>
                              )}
                              {isActive && !collapsed && (
                                <div className="w-1.5 h-1.5 rounded-full bg-primary ml-auto" />
                              )}
                            </button>
                          </TooltipTrigger>
                          {collapsed && (
                            <TooltipContent side="right">
                              <p className="max-w-[200px] truncate">{conversation.title}</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* User Profile and Actions */}
      <div className={cn("border-t border-border p-2", collapsed ? 'pt-2' : 'pt-3')}>
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-2 rounded-md hover:bg-accent/50 transition-colors">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.image || ''} alt={user?.name || 'User'} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {user?.name 
                  ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
                  : user?.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            {!collapsed && user && (
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">{user.name || user.email}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size={collapsed ? "icon" : "sm"}
                    className={cn(
                      "w-full justify-start gap-2 text-foreground/80 hover:bg-accent/50 hover:text-foreground",
                      collapsed && "h-9 w-9 mx-auto"
                    )}
                    onClick={handleNewChat}
                  >
                    <Plus className="h-4 w-4" />
                    {!collapsed && <span>New Chat</span>}
                  </Button>
                </TooltipTrigger>
                {collapsed && <TooltipContent side="right">New Chat</TooltipContent>}
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size={collapsed ? "icon" : "sm"}
                    className={cn(
                      "w-full justify-start gap-2 text-foreground/80 hover:bg-accent/50 hover:text-foreground",
                      collapsed && "h-9 w-9 mx-auto"
                    )}
                    onClick={handleProfileClick}
                  >
                    <User className="h-4 w-4" />
                    {!collapsed && <span>Profile</span>}
                  </Button>
                </TooltipTrigger>
                {collapsed && <TooltipContent side="right">Profile</TooltipContent>}
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size={collapsed ? "icon" : "sm"}
                    className={cn(
                      "w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive",
                      collapsed && "h-9 w-9 mx-auto"
                    )}
                    onClick={confirmLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    {!collapsed && <span>Log out</span>}
                  </Button>
                </TooltipTrigger>
                {collapsed && <TooltipContent side="right">Log out</TooltipContent>}
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent>
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

      {/* Toast Notification - Using shadcn's useToast hook instead */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50">
          <div 
            className={cn(
              "p-4 rounded-md shadow-lg flex items-center",
              toast.type === 'destructive'
                ? 'bg-destructive/10 text-destructive border border-destructive/20'
                : 'bg-primary/10 text-primary border border-primary/20'
            )}
          >
            <span>{toast.message}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 ml-2 -mr-2 text-current hover:bg-transparent hover:opacity-70"
              onClick={() => setToast(null)}
              aria-label="Close"
            >
              <span className="sr-only">Close</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}