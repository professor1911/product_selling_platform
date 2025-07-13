import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Search, Users, Building2 } from "lucide-react";

interface ManufacturerProfile {
  id: string;
  user_id: string;
  manufacturer_id: string | null;
  approved: boolean;
  created_at: string;
  manufacturers?: {
    id: string;
    name: string;
    email: string | null;
    location: string | null;
    total_products: number | null;
  };
}

export const ManufacturerManagement = () => {
  const [manufacturers, setManufacturers] = useState<ManufacturerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { toast } = useToast();

  const fetchManufacturers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          *,
          manufacturers (
            id,
            name,
            email,
            location,
            total_products
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch manufacturers",
          variant: "destructive",
        });
        return;
      }

      setManufacturers(data || []);
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManufacturers();
  }, []);

  const handleApprove = async (profileId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ approved: true })
        .eq("id", profileId);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Manufacturer approved successfully",
      });
      
      fetchManufacturers();
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (profileId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ approved: false })
        .eq("id", profileId);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Manufacturer approval revoked",
      });
      
      fetchManufacturers();
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ approved: true })
        .in("id", selectedIds);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: `${selectedIds.length} manufacturers approved successfully`,
      });
      
      setSelectedIds([]);
      fetchManufacturers();
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const filteredManufacturers = manufacturers.filter(
    (manufacturer) =>
      manufacturer.manufacturers?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      manufacturer.manufacturers?.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const pendingCount = filteredManufacturers.filter(m => !m.approved).length;
  const approvedCount = filteredManufacturers.filter(m => m.approved).length;

  if (loading) {
    return <div>Loading manufacturers...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Manufacturer Management</h2>
          <p className="text-muted-foreground">
            Review and approve manufacturer applications
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="gap-1">
            <Building2 className="w-3 h-3" />
            {approvedCount} Approved
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Users className="w-3 h-3" />
            {pendingCount} Pending
          </Badge>
        </div>
      </div>

      {/* Search and Bulk Actions */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search manufacturers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {selectedIds.length > 0 && (
          <Button onClick={handleBulkApprove}>
            <Check className="w-4 h-4 mr-2" />
            Approve Selected ({selectedIds.length})
          </Button>
        )}
      </div>

      {/* Manufacturers List */}
      <div className="grid gap-4">
        {filteredManufacturers.map((manufacturer) => (
          <Card key={manufacturer.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedIds.includes(manufacturer.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedIds([...selectedIds, manufacturer.id]);
                      } else {
                        setSelectedIds(selectedIds.filter(id => id !== manufacturer.id));
                      }
                    }}
                  />
                  <div>
                    <CardTitle className="text-lg">
                      {manufacturer.manufacturers?.name || "Unnamed Manufacturer"}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {manufacturer.manufacturers?.email || "No email provided"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant={manufacturer.approved ? "default" : "secondary"}>
                    {manufacturer.approved ? "Approved" : "Pending"}
                  </Badge>
                  
                  {manufacturer.approved ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReject(manufacturer.id)}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Revoke
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleApprove(manufacturer.id)}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Location:</span>
                  <p className="text-muted-foreground">
                    {manufacturer.manufacturers?.location || "Not specified"}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Products:</span>
                  <p className="text-muted-foreground">
                    {manufacturer.manufacturers?.total_products || 0}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Registered:</span>
                  <p className="text-muted-foreground">
                    {new Date(manufacturer.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <p className={manufacturer.approved ? "text-green-600" : "text-orange-600"}>
                    {manufacturer.approved ? "Active" : "Awaiting Approval"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredManufacturers.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No manufacturers found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Try adjusting your search criteria" : "No manufacturer applications yet"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};