import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut } from "lucide-react";
import { ProductManagement } from "@/components/ProductManagement";
import { LeadManagement } from "@/components/LeadManagement";
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

      // Allow access even if not approved, but show status
      if (!profile?.approved) {
        toast({
          title: "Account Pending Approval",
          description: "Your account is under review. You can view the portal but cannot manage products until approved.",
          variant: "default",
        });
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
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => navigate("/admin-portal")}>
              Switch to Admin
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
          </TabsList>
          
          <TabsContent value="products" className="space-y-6">
            {profile?.manufacturer_id ? (
              <ProductManagement manufacturerId={profile.manufacturer_id} />
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No manufacturer profile linked to your account.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="leads" className="space-y-6">
            {profile?.manufacturer_id ? (
              <LeadManagement manufacturerId={profile.manufacturer_id} />
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No manufacturer profile linked to your account.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ManufacturerPortal;