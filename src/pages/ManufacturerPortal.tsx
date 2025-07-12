import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Package, MessageSquare, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";

const ManufacturerPortal = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      // Get user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select(`
          *,
          manufacturers (
            id,
            name,
            image
          )
        `)
        .eq("user_id", session.user.id)
        .single();

      if (!profile?.approved) {
        toast({
          title: "Access Denied",
          description: "Your account is pending approval.",
          variant: "destructive",
        });
        await supabase.auth.signOut();
        navigate("/auth");
        return;
      }

      setProfile(profile);
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {profile?.manufacturers?.image && (
              <img
                src={profile.manufacturers.image}
                alt={profile.manufacturers.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            )}
            <div>
              <h1 className="text-xl font-semibold">
                {profile?.manufacturers?.name || "Manufacturer Portal"}
              </h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products" className="flex items-center space-x-2">
              <Package className="w-4 h-4" />
              <span>Products</span>
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span>Leads</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="products" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Your Products</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Product Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Product management features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="leads" className="space-y-6">
            <h2 className="text-2xl font-bold">Customer Leads</h2>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Inquiries</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Lead management features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ManufacturerPortal;