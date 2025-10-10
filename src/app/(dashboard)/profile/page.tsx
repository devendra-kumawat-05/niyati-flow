"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type UserData = {
  id: number;
  name: string;
  email: string;
  password: string;
};

type PasswordFormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [formData, setFormData] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Fetch user data
  const { data: user, isLoading: isLoadingUser, error: userError } = api.auth.getUser.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Debug: Log user data and any errors
  console.log('User data:', user);
  if (userError) {
    console.error('Error fetching user:', userError);
  }

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
        // Clear any local storage/session data if needed
        if (typeof window !== 'undefined') {
          localStorage.clear();
          sessionStorage.clear();
        }
        
        // Force a full page reload to clear all application state
        window.location.href = '/';
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Logout failed');
      }
    } catch (error) {
      console.error('Failed to log out:', error);
      toast.error('Failed to log out. Please try again.');
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const changePassword = api.auth.changePassword.useMutation({
    onSuccess: () => {
      // Clear form on success
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success('Password updated successfully!');
    },
    onError: (error) => {
      console.error('Failed to update password:', error);
      toast.error(error.message || 'Failed to update password. Please try again.');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { currentPassword, newPassword, confirmPassword } = formData;
    
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match!");
      return;
    }
    
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    
    setIsLoading(true);
    
    try {
      await changePassword.mutateAsync({
        currentPassword,
        newPassword,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state
  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show error state
  if (userError || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 p-4">
        <p className="text-muted-foreground text-center">Failed to load user data. Please try again.</p>
        {userError && (
          <p className="text-sm text-red-500 max-w-md text-center">
            {userError.message || 'An unknown error occurred'}
          </p>
        )}
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Manage your account information and password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-3xl bg-muted/50">
                  {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-semibold">{user?.name || 'User'}</h2>
              <p className="text-muted-foreground">{user?.email || ''}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Change Password</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  minLength={8}
                  required
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  minLength={8}
                  required
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  minLength={8}
                  required
                  className="w-full"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/chat')}
                  disabled={isLoading}
                >
                  Back to Dashboard
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
                >
                  {isLoading ? 'Saving...' : 'Update Password'}
                </Button>
              </div>
            </form>
          </div>
        </CardContent>
        <div className="p-6 pt-0 border-t">
          <Button
            variant="outline"
            className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={confirmLogout}
            disabled={isLoading || isLoggingOut}
          >
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </Button>

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
        </div>
      </Card>
    </div>
  );
}
