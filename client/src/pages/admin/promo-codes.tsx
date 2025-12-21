import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit, Trash2, Copy, Calendar, Target, DollarSign, Users, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const promoCodeSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters").max(20, "Code must be at most 20 characters").regex(/^[A-Z0-9_-]+$/, "Code must contain only uppercase letters, numbers, underscores, and hyphens"),
  description: z.string().optional(),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.number().min(0.01, "Discount value must be greater than 0"),
  validFrom: z.string().optional(),
  validUntil: z.string().optional(),
  usageLimit: z.number().min(1, "Usage limit must be at least 1").optional(),
  isActive: z.boolean().default(true),
});

type PromoCodeFormData = z.infer<typeof promoCodeSchema>;

interface PromoCode {
  id: string;
  code: string;
  description?: string;
  discountType: "percentage" | "fixed";
  discountValue: string;
  validFrom?: string;
  validUntil?: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
}

export default function PromoCodesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPromoCode, setEditingPromoCode] = useState<PromoCode | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: promoCodes = [], isLoading } = useQuery<PromoCode[]>({
    queryKey: ["/api/admin/promo-codes"],
  });

  const createPromoCodeMutation = useMutation({
    mutationFn: (data: PromoCodeFormData) => apiRequest("POST", "/api/admin/promo-codes", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/promo-codes"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "Promo code created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updatePromoCodeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PromoCodeFormData> }) =>
      apiRequest("PATCH", `/api/admin/promo-codes/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/promo-codes"] });
      setEditingPromoCode(null);
      toast({
        title: "Success",
        description: "Promo code updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deletePromoCodeMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/promo-codes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/promo-codes"] });
      toast({
        title: "Success",
        description: "Promo code deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleActiveStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiRequest("PATCH", `/api/admin/promo-codes/${id}`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/promo-codes"] });
      toast({
        title: "Success",
        description: "Promo code status updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const form = useForm<PromoCodeFormData>({
    resolver: zodResolver(promoCodeSchema),
    defaultValues: {
      code: "",
      description: "",
      discountType: "percentage",
      discountValue: 0,
      validFrom: "",
      validUntil: "",
      usageLimit: undefined,
      isActive: true,
    },
  });

  const handleSubmit = (data: PromoCodeFormData) => {
    if (editingPromoCode) {
      updatePromoCodeMutation.mutate({ id: editingPromoCode.id, data });
    } else {
      createPromoCodeMutation.mutate(data);
    }
  };

  const handleEdit = (promoCode: PromoCode) => {
    setEditingPromoCode(promoCode);
    form.reset({
      code: promoCode.code,
      description: promoCode.description || "",
      discountType: promoCode.discountType,
      discountValue: typeof promoCode.discountValue === 'string' ? parseFloat(promoCode.discountValue) : promoCode.discountValue,
      validFrom: promoCode.validFrom ? format(new Date(promoCode.validFrom), "yyyy-MM-dd") : "",
      validUntil: promoCode.validUntil ? format(new Date(promoCode.validUntil), "yyyy-MM-dd") : "",
      usageLimit: promoCode.usageLimit || undefined,
      isActive: promoCode.isActive,
    });
    setIsCreateDialogOpen(true);
  };

  const handleCreateNew = () => {
    setEditingPromoCode(null);
    form.reset({
      code: "",
      description: "",
      discountType: "percentage",
      discountValue: 0,
      validFrom: "",
      validUntil: "",
      usageLimit: undefined,
      isActive: true,
    });
    setIsCreateDialogOpen(true);
  };

  const copyPromoCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied",
      description: `Promo code "${code}" copied to clipboard`,
    });
  };

  const getStatusBadge = (promoCode: PromoCode) => {
    if (!promoCode.isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }

    const now = new Date();
    const validFrom = promoCode.validFrom ? new Date(promoCode.validFrom) : null;
    const validUntil = promoCode.validUntil ? new Date(promoCode.validUntil) : null;

    if (validFrom && now < validFrom) {
      return <Badge variant="outline">Scheduled</Badge>;
    }

    if (validUntil && now > validUntil) {
      return <Badge variant="destructive">Expired</Badge>;
    }

    if (promoCode.usageLimit && promoCode.usedCount >= promoCode.usageLimit) {
      return <Badge variant="destructive">Limit Reached</Badge>;
    }

    return <Badge variant="default">Active</Badge>;
  };

  const formatDiscountValue = (type: string, value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return type === "percentage" ? `${numValue}%` : `$${numValue.toFixed(2)}`;
  };

  const calculateUsagePercentage = (usedCount: number, usageLimit?: number) => {
    if (!usageLimit) return 0;
    return Math.min((usedCount / usageLimit) * 100, 100);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Promo Codes</h1>
          <p className="text-muted-foreground">
            Create and manage promotional discount codes for your courses and bundles.
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateNew} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Promo Code
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingPromoCode ? "Edit Promo Code" : "Create New Promo Code"}
              </DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Promo Code</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="SAVE20"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          />
                        </FormControl>
                        <FormDescription>
                          Must be unique. Only uppercase letters, numbers, underscores, and hyphens.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="discountType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select discount type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="percentage">Percentage</SelectItem>
                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe this promo code..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discountValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Discount Value {form.watch("discountType") === "percentage" ? "(%)" : "($)"}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder={form.watch("discountType") === "percentage" ? "20" : "50.00"}
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="validFrom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valid From (Optional)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="validUntil"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valid Until (Optional)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="usageLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usage Limit (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="Unlimited"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormDescription>
                        Leave empty for unlimited usage
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active</FormLabel>
                        <FormDescription>
                          Enable this promo code for immediate use
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createPromoCodeMutation.isPending || updatePromoCodeMutation.isPending}
                  >
                    {editingPromoCode ? "Update" : "Create"} Promo Code
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {promoCodes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No promo codes yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first promo code to start offering discounts to your students.
              </p>
              <Button onClick={handleCreateNew} className="gap-2">
                <Plus className="h-4 w-4" />
                Create First Promo Code
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {promoCodes.map((promoCode: PromoCode) => (
              <Card key={promoCode.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                            {promoCode.code}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyPromoCode(promoCode.code)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </CardTitle>
                        {promoCode.description && (
                          <CardDescription>{promoCode.description}</CardDescription>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getStatusBadge(promoCode)}
                      <Switch
                        checked={promoCode.isActive}
                        onCheckedChange={(checked) =>
                          toggleActiveStatusMutation.mutate({
                            id: promoCode.id,
                            isActive: checked,
                          })
                        }
                        disabled={toggleActiveStatusMutation.isPending}
                      />
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {formatDiscountValue(promoCode.discountType, promoCode.discountValue)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {promoCode.discountType === "percentage" ? "Percentage" : "Fixed Amount"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {promoCode.usedCount} / {promoCode.usageLimit || "∞"}
                        </p>
                        <p className="text-xs text-muted-foreground">Used / Limit</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {promoCode.validFrom 
                            ? format(new Date(promoCode.validFrom), "MMM dd") 
                            : "No start"}
                        </p>
                        <p className="text-xs text-muted-foreground">Valid From</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {promoCode.validUntil 
                            ? format(new Date(promoCode.validUntil), "MMM dd") 
                            : "No expiry"}
                        </p>
                        <p className="text-xs text-muted-foreground">Valid Until</p>
                      </div>
                    </div>
                  </div>

                  {promoCode.usageLimit && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Usage Progress</span>
                        <span>{calculateUsagePercentage(promoCode.usedCount, promoCode.usageLimit).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{
                            width: `${calculateUsagePercentage(promoCode.usedCount, promoCode.usageLimit)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(promoCode)}
                      className="gap-2"
                    >
                      <Edit className="h-3 w-3" />
                      Edit
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2 text-destructive hover:text-destructive">
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Promo Code</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete the promo code "{promoCode.code}"? 
                            This action cannot be undone and will affect any pending orders using this code.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deletePromoCodeMutation.mutate(promoCode.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}