import { Button } from "@/components/ui/button";
import { ShoppingCart, Loader2, CreditCard } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast"; // if you have toast

interface AddToCartButtonProps {
  courseId: string;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  children?: React.ReactNode;
  price?: number; // optional: pass course price for Pay Now
}

export function AddToCartButton({
  courseId,
  className,
  variant = "default",
  size = "default",
  children,
  price = 0, // default 0 if not passed
}: AddToCartButtonProps) {
  const { isAuthenticated } = useAuth();
  const { addToCart, isAddingToCart, cart } = useCart();
  const [isPaying, setIsPaying] = useState(false);

  // Check if course is already in cart
  const isInCart = cart?.items.some(
    (item) => item.itemType === "course" && item.itemId === courseId
  );

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      // Redirect to login (or show modal)
      window.location.href = "/auth/login";
      return;
    }

    addToCart({ itemType: "course", itemId: courseId });
  };

  const handlePayNow = async () => {
    if (!isAuthenticated) {
      window.location.href = "/auth/login";
      return;
    }

    setIsPaying(true);

    try {
      const response = await fetch("/api/payment/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: price, // pass real course price
          orderId: `course-${courseId}-${Date.now()}`, // unique ID
          customerEmail: "user@example.com", // get from auth if possible
          customerName: "User Name", // get from auth
        }),
      });

      const data = await response.json();

      if (data.success && data.redirectUrl) {
        // Redirect to SafePay
        window.location.href = data.redirectUrl;
      } else {
        toast?.({
          title: "Payment Error",
          description: data.message || "Failed to start payment",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast?.({
        title: "Payment Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      console.error("Pay Now error:", err);
    } finally {
      setIsPaying(false);
    }
  };

  if (isInCart) {
    return (
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <Button
          variant="secondary"
          size={size}
          className={className}
          disabled
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          In Cart
        </Button>

        <Button
          onClick={handlePayNow}
          disabled={isPaying}
          variant="default"
          size={size}
          className={`flex-1 ${className} bg-green-600 hover:bg-green-700`}
        >
          {isPaying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Starting...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Pay Now
            </>
          )}
        </Button>
      </div>
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