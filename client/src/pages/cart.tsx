import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight,
  BookOpen
} from "lucide-react";

export default function CartPage() {
  const { isAuthenticated, user } = useAuth();
  const { 
    cart, 
    isLoading, 
    removeFromCart, 
    updateQuantity, 
    clearCart,
    isRemovingFromCart 
  } = useCart();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container py-8">
        <EmptyState
          icon={<ShoppingCart className="h-10 w-10" />}
          title="Sign In Required"
          description="Please sign in to view your cart and purchase courses."
          actionHref="/api/login"
          actionText="Sign In"
        />
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="container py-8 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <Skeleton className="h-20 w-20 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Show empty cart state
  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="container py-8">
        <EmptyState
          icon={<ShoppingCart className="h-10 w-10" />}
          title="Your cart is empty"
          description="Start learning by adding courses to your cart."
          actionHref="/courses"
          actionText="Browse Courses"
        />
      </div>
    );
  }

  // Calculate total
  const subtotal = cart.items.reduce((total, item) => {
    const price = parseFloat(item.course?.price || '0');
    return total + (price * item.quantity);
  }, 0);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(itemId);
    } else {
      updateQuantity({ itemId, quantity: newQuantity });
    }
  };

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          <p className="text-muted-foreground mt-1">
            {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>
        
        {cart.items.length > 0 && (
          <Button
            variant="outline"
            onClick={() => clearCart()}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Cart
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {/* Course Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={item.course?.imageUrl || '/placeholder-course.jpg'}
                      alt={item.course?.title || 'Course'}
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                  </div>

                  {/* Course Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg truncate">
                          {item.course?.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          by {item.course?.instructorName}
                        </p>
                        
                        {item.course?.tags && item.course.tags.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {item.course.tags.slice(0, 2).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Price */}
                      <div className="text-right ml-4">
                        <div className="font-semibold text-lg">
                          ${parseFloat(item.course?.price || '0').toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {item.course?.currency || 'USD'}
                        </div>
                      </div>
                    </div>

                    {/* Quantity Controls and Actions */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        
                        <span className="px-3 py-1 border rounded-md min-w-[3rem] text-center">
                          {item.quantity}
                        </span>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <Link href={`/courses/${item.itemId}`}>
                            View Course
                          </Link>
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          disabled={isRemovingFromCart}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal ({cart.items.length} items)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span className={subtotal === 0 ? "text-green-600" : ""}>
                  {subtotal === 0 ? "FREE" : `$${subtotal.toFixed(2)}`}
                </span>
              </div>

              <Button 
                className="w-full" 
                size="lg" 
                asChild
                data-testid="proceed-to-checkout"
              >
                <Link href="/checkout">
                  {subtotal === 0 ? "Enroll Now - Free!" : "Proceed to Checkout"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>

              <div className="text-center">
                <Button variant="ghost" asChild>
                  <Link href="/courses">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Continue Shopping
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}