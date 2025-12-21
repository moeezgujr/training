import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CartDto } from "@shared/schema";

export function useCart() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const cartQuery = useQuery({
    queryKey: ['/api/cart'],
    queryFn: () => apiRequest('GET', '/api/cart').then(res => res.json()) as Promise<CartDto>,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const cartCountQuery = useQuery({
    queryKey: ['/api/cart/count'],
    queryFn: () => apiRequest('GET', '/api/cart/count').then(res => res.json()) as Promise<{ count: number }>,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const addToCartMutation = useMutation({
    mutationFn: ({ itemType, itemId, quantity = 1 }: { itemType: 'course' | 'bundle'; itemId: string; quantity?: number }) =>
      apiRequest('POST', '/api/cart/add', { itemType, itemId, quantity }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      queryClient.invalidateQueries({ queryKey: ['/api/cart/count'] });
      toast({
        title: "Added to Cart",
        description: "Item has been added to your cart successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add item to cart",
        variant: "destructive",
      });
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: (itemId: string) =>
      apiRequest('DELETE', `/api/cart/items/${itemId}`).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      queryClient.invalidateQueries({ queryKey: ['/api/cart/count'] });
      toast({
        title: "Removed from Cart",
        description: "Item has been removed from your cart.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove item from cart",
        variant: "destructive",
      });
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      apiRequest('PATCH', `/api/cart/items/${itemId}`, { quantity }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      queryClient.invalidateQueries({ queryKey: ['/api/cart/count'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update cart item",
        variant: "destructive",
      });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: () => apiRequest('DELETE', '/api/cart/clear').then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      queryClient.invalidateQueries({ queryKey: ['/api/cart/count'] });
      toast({
        title: "Cart Cleared",
        description: "All items have been removed from your cart.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to clear cart",
        variant: "destructive",
      });
    },
  });

  return {
    cart: cartQuery.data,
    cartCount: cartCountQuery.data?.count || 0,
    isLoading: cartQuery.isLoading || cartCountQuery.isLoading,
    addToCart: addToCartMutation.mutate,
    removeFromCart: removeFromCartMutation.mutate,
    updateQuantity: updateQuantityMutation.mutate,
    clearCart: clearCartMutation.mutate,
    isAddingToCart: addToCartMutation.isPending,
    isRemovingFromCart: removeFromCartMutation.isPending,
  };
}