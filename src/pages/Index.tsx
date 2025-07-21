import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { LogIn, Search, Star, Users, Package, TrendingUp, ArrowRight, CheckCircle } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import ThemeToggle from "@/components/ThemeToggle";
import { useNavigate } from "react-router-dom";
import heroBackground from "@/assets/hero-background.jpg";
const Index = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const handleAuthSuccess = () => {
    setIsLoggedIn(true);
    setShowAuth(false);
    navigate("/products");
  };
  const handleSearch = () => {
    // Store search query in sessionStorage to preserve it across navigation
    sessionStorage.setItem('searchQuery', searchQuery);
    setShowAuth(true);
  };
  const handleAuthSuccessWithSearch = () => {
    setIsLoggedIn(true);
    setShowAuth(false);
    // Navigate to products page and the search query will be picked up from sessionStorage
    navigate("/products");
  };
  const features = [{
    icon: Search,
    title: "Smart Search",
    description: "Find products instantly with our intelligent search and filtering system"
  }, {
    icon: Users,
    title: "Verified Manufacturers",
    description: "Connect directly with trusted manufacturers and suppliers"
  }, {
    icon: Package,
    title: "Quality Products",
    description: "Browse thousands of quality products with detailed specifications"
  }, {
    icon: TrendingUp,
    title: "Live Updates",
    description: "Real-time inventory and pricing updates from our data sources"
  }];
  const testimonials = [{
    name: "Sarah Johnson",
    role: "Procurement Manager",
    company: "TechCorp",
    content: "This platform has revolutionized how we source products. The search functionality is incredible!",
    rating: 5
  }, {
    name: "Michael Chen",
    role: "Supply Chain Director",
    company: "GlobalTrade",
    content: "Direct connections with manufacturers have saved us thousands in procurement costs.",
    rating: 5
  }, {
    name: "Emily Rodriguez",
    role: "Business Owner",
    company: "StartupXYZ",
    content: "User-friendly interface and reliable suppliers. Exactly what we needed for our business.",
    rating: 5
  }];
  return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-300 bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2 animate-fade-in">
            <Package className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-neutral-950">B2BKAR</h1>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button onClick={() => navigate("/admin-auth")} variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-primary">
              Admin
            </Button>
            <Button onClick={() => navigate("/auth")} variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
              Manufacturer Login
            </Button>
            {!isLoggedIn ? <Button onClick={() => setShowAuth(true)} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button> : <Button onClick={() => navigate("/products")} className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Search className="h-4 w-4 mr-2" />
                Browse Products
              </Button>}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative container mx-auto px-4 py-20 text-center animate-fade-in" style={{
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${heroBackground})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      borderRadius: '24px',
      margin: '20px',
      minHeight: '600px'
    }}>
        <div className="max-w-4xl mx-auto relative z-10">
          <Badge className="mb-6 bg-blue-100/90 dark:bg-blue-900/90 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800 animate-scale-in">
            🚀 Live Product Updates
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white drop-shadow-lg animate-fade-in">
            Find Perfect Products,
            <br />
            Connect with Manufacturers
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto animate-fade-in drop-shadow-md">
            Discover thousands of quality products from verified manufacturers. 
            Search, filter, and connect directly with suppliers worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in max-w-md mx-auto">
            <div className="flex w-full">
              <Input type="text" placeholder="Search products..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-1 bg-white/90 backdrop-blur-sm text-gray-800 placeholder-gray-500 border-r-0 rounded-r-none focus:bg-white" onKeyPress={e => e.key === 'Enter' && handleSearch()} />
              <Button onClick={handleSearch} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-l-none">
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl mx-4 mb-20 shadow-xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-gray-800 dark:text-white">
            Why Choose ProductHub?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Powerful features designed to streamline your product sourcing experience
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm animate-fade-in">
              <CardContent className="p-6 text-center">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </CardContent>
            </Card>)}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-gray-800 dark:text-white">
            What Our Users Say
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Join thousands of satisfied businesses using ProductHub
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm animate-fade-in">
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />)}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-800 dark:text-white">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {testimonial.role} at {testimonial.company}
                  </p>
                </div>
              </CardContent>
            </Card>)}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl mx-4 mb-20 text-white shadow-2xl">
        <h2 className="text-4xl font-bold mb-4">
          Ready to Transform Your Business?
        </h2>
        <p className="text-xl mb-8 opacity-90">
          Join ProductHub today and connect with manufacturers worldwide
        </p>
        <Button onClick={() => setShowAuth(true)} size="lg" className="bg-white text-blue-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-lg px-8 py-3 font-semibold">
          <CheckCircle className="mr-2 h-5 w-5" />
          Start Your Journey
        </Button>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Package className="h-6 w-6 text-blue-400" />
            <span className="text-xl font-bold">ProductHub</span>
          </div>
          <p className="text-gray-400 mb-4">
            Connecting businesses with quality manufacturers worldwide
          </p>
          <p className="text-gray-500 text-sm">
            © 2024 ProductHub. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} onSuccess={handleAuthSuccessWithSearch} />
    </div>;
};
export default Index;