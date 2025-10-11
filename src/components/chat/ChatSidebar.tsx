"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Plus,
  Search,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
  MessageSquare,
  Menu,
  X,
  MessageSquarePlus,
} from "lucide-react";
import Image from "next/image";

interface User {
  id: string;
  email: string;
  name: string | null;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Conversation {
  id: string;
  title: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

type ConversationWithMessages = Conversation & {
  messages: Array<{
    id: string;
    content: string;
    role: 'user' | 'assistant';
    createdAt: string;
    updatedAt: string;
  }>;
};

interface ApiError extends Error {
  code?: string;
  details?: Record<string, unknown>;
}

export default function ChatSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const [collapsed, setCollapsed] = useState(isMobile);
  const [searchTerm, setSearchTerm] = useState("");
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isNewChatLoading, setIsNewChatLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Fetch user data
  const { data: user, isLoading: isLoadingUser } = api.auth.getUser.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Fetch conversations
  const { 
    data: conversations = [], 
    isLoading: isLoadingConversations, 
    refetch: refetchConversations 
  } = api.chat.getConversations.useQuery();
  
  const isLoading = isLoadingUser || isLoadingConversations;
  const selectedConversationId = searchParams.get('conversationId');
  
  // Auto-close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  }, [router, isMobile]);
  
  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  // Close mobile menu
  const closeMobileMenu = () => {
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  // Create new conversation
  const createConversation = api.chat.createConversation.useMutation({
    onSuccess: (newConversation) => {
      router.push(`/chat?conversationId=${newConversation.id}`);
      refetchConversations();
    },
  });
  
  const handleNewChat = async () => {
    try {
      setIsNewChatLoading(true);
      const newConversation = await createConversation.mutateAsync({
        title: 'New Chat',
      });
      router.push(`/chat?conversationId=${newConversation.id}`);
      refetchConversations();
      toast.success("New chat created!");
    } catch (error) {
      console.error("Error creating new chat:", error);
      toast({
        title: "Error",
        description: "Failed to create a new conversation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsNewChatLoading(false);
    }
  };

  // Keyboard shortcut for new chat (Ctrl+Shift+N or Cmd+Shift+N)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleNewChat();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || 'Failed to sign out. Please try again.'
        );
      }
      
      // Clear any client-side state
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
      
      // Redirect to login page with full page reload to clear all state
      window.location.href = '/login';
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Logout failed:', error);
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoggingOut(false);
      setShowLogoutDialog(false);
    }
  };

  const confirmLogout = () => setShowLogoutDialog(true);
  const cancelLogout = () => setShowLogoutDialog(false);

  const handleProfileClick = () => {
    router.push('/profile');
  };

  return (
    <>
      {/* New Chat Button - Desktop */}
      <div className={cn(
        "fixed bottom-6 right-6 z-40 transition-transform duration-200",
        collapsed ? "translate-x-0" : "translate-x-0"
      )}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleNewChat}
              disabled={isNewChatLoading}
              className="rounded-full w-14 h-14 p-0 shadow-lg bg-primary hover:bg-primary/90 transition-all duration-200 flex items-center justify-center"
              aria-label="New chat"
            >
              {isNewChatLoading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <MessageSquarePlus className="h-6 w-6" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" sideOffset={10}>
            <p>New Chat (Shift+{navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+N)</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Mobile Menu Button */}
      {isMobile && (
        <div className="fixed top-4 left-4 z-40 md:hidden">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleMobileMenu}
            className="h-10 w-10 rounded-full shadow-md"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      )}
      
      {/* Sidebar */}
      <motion.div 
        className={cn(
          "fixed md:relative flex flex-col h-full bg-background/95 backdrop-blur-sm border-r border-border z-30",
          collapsed ? "w-16" : "w-72",
          isMobile ? (isMobileMenuOpen ? "left-0" : "-left-full") : "left-0"
        )}
        initial={false}
        animate={{ 
          left: isMobile ? (isMobileMenuOpen ? 0 : '-100%') : 0,
          width: collapsed ? '3rem' : 'auto'
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-background/80">
          <div className="flex items-center justify-between"><Image src="/logo.png" alt="Logo" width={30} height={30} />
          <motion.h1 
            className={cn(
              "text-xl font-bold whitespace-nowrap overflow-hidden bg-gradient-to-r from-primary to-yellow-600 bg-clip-text text-transparent",
              collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            )}
            initial={{ opacity: 0, x: -10 }}
            animate={{ 
              opacity: collapsed ? 0 : 1,
              x: collapsed ? -10 : 0,
              width: collapsed ? 0 : 'auto'
            }}
            transition={{ duration: 0.2 }}
          >
            
            Niyati Flow
          </motion.h1></div>
          <div className="flex items-center gap-2">
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="h-8 w-8 hidden md:flex"
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div 
              className="p-3 border-b border-border bg-background/80"
              initial={{ opacity: 0, height: 0, padding: 0 }}
              animate={{ opacity: 1, height: 'auto', padding: '0.75rem' }}
              exit={{ opacity: 0, height: 0, padding: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-10 rounded-lg bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary/20"
                />
              </div>
              
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat List */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-2 space-y-1">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg mb-1" />
                ))
              ) : conversations.length === 0 ? (
                <motion.div 
                  className="flex flex-col items-center justify-center p-6 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-sm font-medium mb-1">No conversations yet</h3>
                  <p className="text-xs text-muted-foreground mb-4">Start a new chat to begin</p>
                  <Button
                    onClick={handleNewChat}
                    disabled={isNewChatLoading}
                    className="w-full justify-start gap-2 mb-4 group relative overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center">
                      {isNewChatLoading ? (
                        <div className="h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin mr-2" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2 transition-transform group-hover:rotate-90" />
                      )}
                      New Chat
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span className="ml-auto text-xs text-muted-foreground hidden md:inline-block">
                      {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+Shift+N
                    </span>
                  </Button>
                </motion.div>
              ) : (
                <AnimatePresence>
                  {conversations
                    .filter(conv => 
                      conv.title.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((conversation, index) => (
                      <motion.div
                        key={conversation.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="relative group"
                      >
                        <Button
                          variant={selectedConversationId === conversation.id ? "secondary" : "ghost"}
                          className={cn(
                            "w-full justify-start font-normal h-12 px-3 rounded-lg transition-all duration-200",
                            selectedConversationId === conversation.id 
                              ? "bg-accent/80 hover:bg-accent/90 text-accent-foreground shadow-sm" 
                              : "hover:bg-muted/50"
                          )}
                          onClick={() => {
                            router.push(`/chat?conversationId=${conversation.id}`);
                            closeMobileMenu();
                          }}
                        >
                          <MessageSquare className={cn(
                            "h-4 w-4 mr-3 flex-shrink-0",
                            selectedConversationId === conversation.id 
                              ? "text-primary" 
                              : "text-muted-foreground"
                          )} />
                          <span className="truncate text-sm">{conversation.title}</span>
                        </Button>
                      </motion.div>
                    ))}
                </AnimatePresence>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* User Profile */}
        <div className="p-3 border-t border-border bg-background/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Avatar 
                className={cn(
                  "h-6 w-6 transition-all duration-200 cursor-pointer",
                  !collapsed && "ring-2 ring-offset-2 ring-offset-background ring-primary/30"
                )}
                onClick={handleProfileClick}
              >
                <AvatarImage 
                  src={user?.image || ''} 
                  alt={user?.name || 'User'} 
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-purple-500/20">
                  {user?.name ? (
                    <span className="text-sm font-medium">
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  ) : (
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                  )}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="absolute -right-1 -bottom-1">
                  <div className="h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                </div>
              )}
            </div>
            
            <AnimatePresence>
              {!collapsed && (
                <motion.div 
                  className="flex-1 min-w-0 overflow-hidden"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email || 'user@example.com'}</p>
                </motion.div>
              )}
            </AnimatePresence>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-8 w-8 text-muted-foreground hover:text-foreground transition-colors",
                      collapsed ? "mx-auto" : ""
                    )}
                    onClick={confirmLogout}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10}>
                  <p>Log out</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </motion.div>
      
      {/* Overlay for mobile */}
      {isMobile && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-20 md:hidden"
          onClick={closeMobileMenu}
        />
      )}
      
      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
              <LogOut className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-center text-xl font-semibold">Log out of Niyati AI?</DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              You'll need to sign in again to access your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center gap-3">
            <Button 
              variant="outline" 
              onClick={cancelLogout}
              disabled={isLoggingOut}
              className="w-full"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full"
            >
              {isLoggingOut ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging out...
                </span>
              ) : 'Log out'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
