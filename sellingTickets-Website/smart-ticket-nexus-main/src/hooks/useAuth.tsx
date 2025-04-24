
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Define the User type based on our database schema
export type User = {
  user_id: number;
  full_name: string;
  email: string;
  is_local: boolean;
  national_id?: string;
  visa_id?: string;
  phone: string;
  team_supported?: string;
  is_admin?: boolean;
  created_at: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (userData: Omit<User, "user_id" | "created_at"> & { password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user is already authenticated
    checkAuth();

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state change:", event, session?.user?.email);
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          if (session?.user) {
            try {
              const { data, error } = await supabase
                .from("users")
                .select("*")
                .eq("email", session.user.email)
                .single();

              if (error) throw error;
              if (data) setUser(data as User);
            } catch (error) {
              console.error("Error fetching user data:", error);
              setUser(null);
            }
          }
          setLoading(false);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (session && session.user) {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("email", session.user.email)
          .maybeSingle();

        if (userError) throw userError;
        if (userData) setUser(userData as User);
        setLoading(false);
        return true;
      } else {
        setUser(null);
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      setUser(null);
      setLoading(false);
      return false;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log("Signing in with:", email);
      
      // Verify the user exists and password matches
      const { data: user, error: userCheckError } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .eq("password", password)
        .maybeSingle();
      
      if (userCheckError) {
        console.error("Error checking user:", userCheckError);
        throw userCheckError;
      }
      
      if (!user) {
        throw new Error("Invalid email or password");
      }
      
      setUser(user as User);
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });
      
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: error.message || "An error occurred during sign in.",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (userData: Omit<User, "user_id" | "created_at"> & { password: string }) => {
    try {
      setLoading(true);
      
      // Check if user already exists
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("email")
        .eq("email", userData.email)
        .maybeSingle();
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error("Error checking existing user:", checkError);
        throw checkError;
      }
      
      if (existingUser) {
        throw new Error("A user with this email already exists");
      }

      // Insert the user data into our users table
      const { error: insertError } = await supabase.from("users").insert({
        full_name: userData.full_name,
        email: userData.email,
        is_local: userData.is_local,
        password: userData.password,
        national_id: userData.national_id || null,
        visa_id: userData.visa_id || null,
        phone: userData.phone,
        team_supported: userData.team_supported || null
      });

      if (insertError) {
        console.error("User data insert error:", insertError);
        throw insertError;
      }

      toast({
        title: "Account created!",
        description: "You've successfully signed up. Please sign in to continue.",
      });

      // Navigate to login page
      navigate("/login");
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: error.message || "An error occurred during sign up.",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      toast({
        title: "Signed out",
        description: "You've been successfully signed out.",
      });
      navigate("/login");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign out failed",
        description: error.message || "An error occurred during sign out.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
