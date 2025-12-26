import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import {
  ShoppingCart,
  CreditCard,
  Package,
  BookOpen,
  Loader2,
  User
} from "lucide-react";

interface OrderTotal {
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
}

export default function CheckoutPage() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { cart, isLoading: cartLoading, clearCart } = useCart();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  
  // Get checkout parameters from URL
  const urlParams = new URLSearchParams(window.location.search);
  const itemType = urlParams.get('type') || 'course';
  const itemId = urlParams.get('id') || '';
  
  // Determine if this is cart checkout or single item checkout
  const isCartCheckout = !itemId;

  // Fetch item details for single item checkout
  const { data: item, isLoading: itemLoading } = useQuery({
    queryKey: itemType === 'bundle' ? ["/api/bundles", itemId] : ["/api/courses", itemId],
    enabled: !!itemId && !isCartCheckout,
  });

  // Pre-fill user information
  useEffect(() => {
    if (user) {
      setName(user.displayName || user.username || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleCheckout = async () => {
    if (!name || !email) {
      toast({
        title: "Missing Information",
        description: "Please fill in your name and email.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (isCartCheckout && cart) {
        // Bulk enroll all courses from cart
        const courseIds = cart.items.map(item => item.itemId);
        const response = await apiRequest("POST", "/api/courses/enroll-bulk", { courseIds });
        const data = await response.json();
        
        toast({
          title: "Enrollment Successful!",
          description: data.message || "You've been enrolled in all courses!",
        });
        
        // Clear cart
        queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
        queryClient.invalidateQueries({ queryKey: ["/api/courses/enrolled"] });
        
        setLocation("/dashboard");
      } else {
        // Enroll in single course
        const response = await apiRequest("POST", `/api/courses/${itemId}/enroll`);
        
        if (response.ok) {
          toast({
            title: "Enrollment Successful!",
            description: "You now have access to this course.",
          });
          
          queryClient.invalidateQueries({ queryKey: ["/api/courses/enrolled"] });
          setLocation("/dashboard");
        }
      }
    } catch (error: any) {
      toast({
        title: "Enrollment Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  // Loading state
  const isLoading = isCartCheckout ? cartLoading : itemLoading;
  const hasData = isCartCheckout ? (cart && cart.items && cart.items.length > 0) : !!item;
  const isSubmitting = false; // Simplified since we removed mutation
  
  if (isLoading || !hasData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <ShoppingCart className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Checkout
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Complete your enrollment to get instant access
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isCartCheckout ? (
                  /* Cart Items */
                  <div className="space-y-3">
                    {cart?.items.map((cartItem) => (
                      <div key={cartItem.id} className="flex gap-4 pb-3 border-b last:border-b-0" data-testid={`cart-item-${cartItem.id}`}>
                        <img
                          src={cartItem.course?.imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop'}
                          alt={cartItem.course?.title || 'Course'}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {cartItem.course?.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Quantity: {cartItem.quantity}
                          </p>
                          <p className="text-sm font-medium text-blue-600">
                            Free
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Single Item */
                  <div className="flex gap-4">
                    <img
                      src={(item as any)?.imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop'}
                      alt={(item as any)?.title || 'Item'}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {(item as any)?.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                        {(item as any)?.description}
                      </p>
                      {itemType === 'bundle' && (item as any)?.courseCount && (
                        <Badge variant="secondary" className="mt-1">
                          {(item as any).courseCount} courses included
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Pricing Breakdown */}
                <div className="border-t pt-4 space-y-2">
                  
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span className="text-green-600">
                      FREE
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Details */}
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Customer Info Section */}
                <div className="space-y-3">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {/* Checkout Button */}
                <Button
                  onClick={handleCheckout}
                  disabled={!name || !email}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                  size="lg"
                >
                  <BookOpen className="h-5 w-5 mr-2" />
                  Complete Enrollment
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  By enrolling, you agree to our terms of service.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}