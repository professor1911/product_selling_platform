import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

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
        // Check if user is approved manufacturer
        const { data: profile } = await supabase
          .from("profiles")
          .select("approved, manufacturer_id")
          .eq("user_id", data.user.id)
          .single();

        if (!profile?.approved) {
          setError("Your account is pending approval. Please contact support.");
          await supabase.auth.signOut();
          return;
        }

        toast({
          title: "Welcome back!",
          description: "Successfully logged in to your manufacturer portal.",
        });
        
        navigate("/manufacturer-portal");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const redirectUrl = `${window.location.origin}/auth`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        setError(error.message);
        return;
      }

      toast({
        title: "Registration submitted!",
        description: "Please check your email to confirm your account. After confirmation, your account will be reviewed for approval.",
      });

      // Clear form
      setEmail("");
      setPassword("");
      setIsLogin(true);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Manufacturer Portal</CardTitle>
          <CardDescription className="text-center">
            {isLogin ? "Sign in to manage your products and leads" : "Register to become a manufacturer"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
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
                placeholder="Enter your email"
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
                placeholder="Enter your password"
                minLength={6}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading 
                ? (isLogin ? "Signing in..." : "Creating account...") 
                : (isLogin ? "Sign In" : "Create Account")
              }
            </Button>
          </form>
          
          <div className="mt-4 space-y-2">
            <div className="text-center">
              <Button
                variant="link"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                }}
                className="text-sm"
              >
                {isLogin 
                  ? "Don't have an account? Register here" 
                  : "Already have an account? Sign in"
                }
              </Button>
            </div>
            
            <div className="text-center text-sm text-muted-foreground">
              {isLogin 
                ? "Need access? Contact support for manufacturer account approval." 
                : "After registration, your account will be reviewed for approval."
              }
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;