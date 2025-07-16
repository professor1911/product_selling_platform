import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sanitizeInput, validateEmail, validatePhone, checkRateLimit, generateCSRFToken, setCSRFToken } from "@/lib/security";

interface InquiryFormProps {
  productId: string;
  manufacturerId: string;
  productName: string;
  trigger?: React.ReactNode;
}

export const InquiryForm = ({ productId, manufacturerId, productName, trigger }: InquiryFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string>("");
  const { toast } = useToast();

  // Generate CSRF token on component mount
  useEffect(() => {
    const token = generateCSRFToken();
    setCsrfToken(token);
    setCSRFToken(token);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Rate limiting check
      const userIdentifier = formData.email || 'anonymous';
      if (!checkRateLimit(userIdentifier, 3, 300000)) { // 3 attempts per 5 minutes
        toast({
          title: "Rate Limit Exceeded",
          description: "Too many inquiries. Please wait before submitting again.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Input validation
      const sanitizedName = sanitizeInput(formData.name);
      const sanitizedEmail = sanitizeInput(formData.email);
      const sanitizedPhone = sanitizeInput(formData.phone);
      const sanitizedMessage = sanitizeInput(formData.message);

      // Validate required fields
      if (!sanitizedName || sanitizedName.length < 2 || sanitizedName.length > 100) {
        toast({
          title: "Invalid Name",
          description: "Name must be between 2 and 100 characters.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (!validateEmail(sanitizedEmail)) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (sanitizedPhone && !validatePhone(sanitizedPhone)) {
        toast({
          title: "Invalid Phone",
          description: "Please enter a valid phone number.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (sanitizedMessage && sanitizedMessage.length > 1000) {
        toast({
          title: "Message Too Long",
          description: "Message must be less than 1000 characters.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from("leads")
        .insert([{
          product_id: productId,
          manufacturer_id: manufacturerId,
          buyer_name: sanitizedName,
          buyer_email: sanitizedEmail,
          buyer_phone: sanitizedPhone || null,
          message: sanitizedMessage || null,
          status: "new",
        }]);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Inquiry Sent!",
        description: "Your inquiry has been sent to the manufacturer. They will contact you soon.",
      });
      
      setFormData({ name: "", email: "", phone: "", message: "" });
      setOpen(false);
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const defaultTrigger = (
    <Button className="w-full">
      <MessageSquare className="w-4 h-4 mr-2" />
      Contact Supplier
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <Card className="border-0 shadow-none">
          <CardHeader>
            <CardTitle>Contact Supplier</CardTitle>
            <p className="text-sm text-muted-foreground">
              Send an inquiry about <strong>{productName}</strong>
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="Your full name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  placeholder="your.email@example.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Your phone number"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Message (Optional)</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Any specific questions or requirements..."
                  rows={3}
                />
              </div>
              
              <div className="flex space-x-2 pt-2">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Sending..." : "Send Inquiry"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};