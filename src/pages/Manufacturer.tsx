
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, MapPin, Star, Globe, Phone, Mail, Building, Users, Award } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const Manufacturer = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch manufacturer data from Supabase
  const { data: manufacturer, isLoading: isLoadingManufacturer } = useQuery({
    queryKey: ['manufacturer', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('manufacturers')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  // Fetch manufacturer's products from Supabase
  const { data: manufacturerProducts = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['manufacturer-products', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('manufacturer_id', id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  const isLoading = isLoadingManufacturer || isLoadingProducts;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-blue-600 dark:text-blue-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600 dark:text-gray-400">Loading manufacturer details...</p>
        </div>
      </div>
    );
  }

  if (!manufacturer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Manufacturer not found</h1>
          <Button onClick={() => navigate("/products")}>
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/products")}
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
            <div className="flex items-center space-x-2">
              <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ProductHub
              </h1>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Manufacturer Details */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 mb-8 shadow-xl">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <Building className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                    {manufacturer.name}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {manufacturer.location}
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1 text-yellow-400" />
                      {manufacturer.rating} Rating
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                {manufacturer.description}
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Company Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Employees: {manufacturer.employees}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Building className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Founded: {manufacturer.founded}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Package className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Products: {manufacturer.total_products}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Contact Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 text-gray-500 mr-2" />
                      <a href={`https://${manufacturer.website}`} className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                        {manufacturer.website}
                      </a>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-500 mr-2" />
                      <a href={`mailto:${manufacturer.email}`} className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                        {manufacturer.email}
                      </a>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {manufacturer.phone}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <img
                src={manufacturer.image}
                alt={manufacturer.name}
                className="w-full h-48 object-cover rounded-lg shadow-lg"
              />
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
                  <Award className="h-5 w-5 mr-2 text-yellow-500" />
                  Certifications
                </h3>
                <div className="flex flex-wrap gap-2">
                  {manufacturer.certifications.map((cert, index) => (
                    <Badge key={index} className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                Contact Manufacturer
              </Button>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
            Products by {manufacturer.name}
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {manufacturerProducts.map((product) => (
              <Card 
                key={product.id} 
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm"
              >
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <Badge className="absolute top-2 right-2 bg-blue-600 text-white">
                      {product.category}
                    </Badge>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-white">
                      {product.name}
                    </h3>
                    
                    <div className="flex items-center mb-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                        {product.rating}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                          ${product.price}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                          / {product.quantity}
                        </span>
                      </div>
                      <Button 
                        size="sm"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
                      >
                        Contact
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Manufacturer;
