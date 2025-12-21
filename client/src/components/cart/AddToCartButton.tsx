import { Button } from "@/components/ui/button";
import { ShoppingCart, Loader2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";

interface AddToCartButtonProps {
  courseId: string;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  children?: React.ReactNode;
}

export function AddToCartButton({ 
  courseId, 
  className, 
  variant = "default", 
  size = "default",
  children 
}: AddToCartButtonProps) {
  const { isAuthenticated } = useAuth();
  const { addToCart, isAddingToCart, cart } = useCart();

  // Check if course is already in cart
  const isInCart = cart?.items.some(item => 
    item.itemType === 'course' && item.itemId === courseId
  );

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      // Redirect to login or show login modal
      window.location.href = '/api/login';
      return;
    }

    addToCart({ itemType: 'course', itemId: courseId });
  };

  if (isInCart) {
    return (
      <Button
        variant="secondary"
        size={size}
        className={className}
        disabled
      >
        <ShoppingCart className="mr-2 h-4 w-4" />
        In Cart
      </Button>
    );
  }

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isAddingToCart}
      variant={variant}
      size={size}
      className={className}
    >
      {isAddingToCart ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <ShoppingCart className="mr-2 h-4 w-4" />
      )}
      {children || "Add to Cart"}
    </Button>
  );
}