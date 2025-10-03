import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AuthUser {
  id: string;
  email: string;
  name: string;
  college: string;
  avatarUrl?: string;
  isPremium: boolean;
  isAdmin: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  login: () => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check current session
  const { isLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          return data.user;
        }
        setUser(null);
        return null;
      } catch {
        setUser(null);
        return null;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (profile: any) => {
      const res = await apiRequest("POST", "/api/auth/google", { profile });
      return res.json();
    },
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Welcome!",
        description: `Hello ${data.user.name}, you're now logged in.`,
      });
    },
    onError: () => {
      toast({
        title: "Login Failed",
        description: "There was an issue logging you in. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/logout");
      return res.json();
    },
    onSuccess: () => {
      setUser(null);
      queryClient.clear();
      toast({
        title: "Logged Out",
        description: "You've been successfully logged out.",
      });
    },
    onError: () => {
      // Still clear user state even if API fails
      setUser(null);
      queryClient.clear();
    },
  });

  // Mock Google OAuth for development
  const mockGoogleLogin = () => {
    const mockProfile = {
      id: "mock_google_id",
      email: `user${Math.floor(Math.random() * 1000)}@srmist.edu.in`,
      name: "Test User",
      picture: "https://via.placeholder.com/150",
    };
    
    loginMutation.mutate(mockProfile);
  };

  // Google OAuth integration
  const handleGoogleLogin = () => {
    // In a real app, this would integrate with Google OAuth
    // For now, we'll use mock login for development
    if (process.env.NODE_ENV === "development") {
      mockGoogleLogin();
    } else {
      // Real Google OAuth would go here
      window.location.href = "/auth/google";
    }
  };

  const login = () => {
    handleGoogleLogin();
  };

  const logout = () => {
    logoutMutation.mutate();
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading: isLoading || loginMutation.isPending || logoutMutation.isPending,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Wrap App with AuthProvider in main.tsx or App.tsx
