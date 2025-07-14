import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";

const AdminAuth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already signed in
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
      }
    };
    getUser();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.user) {
        setUser(data.user);
        // Check if user is admin
        const { data: adminData } = await supabase
          .from("admin_users")
          .select("*")
          .eq("user_id", data.user.id)
          .single();

        if (!adminData) {
          setError("Access denied. Admin privileges required.");
          return;
        }

        toast({
          title: "Welcome Admin!",
          description: "Successfully logged in to admin portal.",
        });
        
        navigate("/admin-portal");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/admin-auth`
        }
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.user) {
        setUser(data.user);
        toast({
          title: "Account Created!",
          description: "Use your User ID below to create admin access.",
        });
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const createAdmin = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("admin_users")
        .insert({
          user_id: userId,
          role: 'admin',
          permissions: ['manage_manufacturers', 'manage_products', 'manage_leads', 'site_analytics']
        });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to create admin. Try refreshing and logging in.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Admin Created!",
        description: "You can now log in with admin privileges.",
      });
      
      // Reset form
      setUser(null);
      setEmail("");
      setPassword("");
      setIsLogin(true);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to create admin access.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Admin Portal</CardTitle>
          <CardDescription className="text-center">
            {isLogin ? "Sign in to manage manufacturers and site content" : "Create admin account"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Show user ID if signed up but not admin yet */}
          {user && !isLogin && (
            <Alert>
              <AlertDescription className="space-y-2">
                <div><strong>Your User ID:</strong></div>
                <div className="font-mono text-xs break-all bg-muted p-2 rounded">{user.id}</div>
                <Button 
                  onClick={() => createAdmin(user.id)}
                  className="w-full mt-2"
                  size="sm"
                >
                  Create Admin Access
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={isLogin ? handleLogin : handleSignUp} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={isLogin ? "Enter admin email" : "Enter your email"}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter password"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? (isLogin ? "Signing in..." : "Creating account...") : (isLogin ? "Sign In" : "Sign Up")}
            </Button>
          </form>

          <div className="text-center">
            <Button
              variant="link"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                if (user && isLogin) {
                  // If switching to signup mode and user exists, clear user
                  setUser(null);
                }
              }}
              className="text-sm"
            >
              {isLogin ? "Need to create admin account? Sign up" : "Already have admin access? Sign in"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAuth;