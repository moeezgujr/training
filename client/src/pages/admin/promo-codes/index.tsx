import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Ticket,
  Plus,
  Edit,
  Copy,
  Calendar,
  Users,
  Percent,
  DollarSign,
  CheckCircle,
  XCircle,
  Gift
} from "lucide-react";
import { format } from "date-fns";

interface PromoCode {
  id: string;
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: string;
  applicableType: "all" | "course" | "bundle";
  applicableIds: string[] | null;
  maxUses: number | null;
  usedCount: number;
  validUntil: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function AdminPromoCodesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);

  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: "",
    applicableType: "all" as "all" | "course" | "bundle",
    applicableIds: [] as string[],
    maxUses: "",
    validUntil: "",
    isActive: true,
  });

  // Fetch promo codes
  const { data: promoCodes, isLoading: promoLoading } = useQuery<PromoCode[]>({
    queryKey: ["/api/admin/promo-codes"],
  });

  // Fetch courses and bundles for selection
  const { data: courses } = useQuery({
    queryKey: ["/api/courses"],
  });

  const { data: bundles } = useQuery({
    queryKey: ["/api/bundles"],
  });

  // Create promo code mutation
  const createPromo = useMutation({
    mutationFn: async (promoData: any) => {
      const response = await apiRequest("POST", "/api/admin/promo-codes", promoData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/promo-codes"] });
      setIsCreateOpen(false);
      resetForm();
      toast({
        title: "Promo Code Created!",
        description: "The promo code has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create promo code. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      code: "",
      description: "",
      discountType: "percentage",
      discountValue: "",
      applicableType: "all",
      applicableIds: [],
      maxUses: "",
      validUntil: "",
      isActive: true,
    });
  };

  const generateRandomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code: result }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const promoData = {
      ...formData,
      maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
      validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : null,
      applicableIds: formData.applicableType === "all" ? null : formData.applicableIds,
    };

    createPromo.mutate(promoData);
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied!",
      description: `Promo code "${code}" copied to clipboard.`,
    });
  };

  const isExpired = (validUntil: string | null) => {
    if (!validUntil) return false;
    return new Date(validUntil) < new Date();
  };

  const isMaxUsesReached = (promo: PromoCode) => {
    return promo.maxUses !== null && promo.usedCount >= promo.maxUses;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Promo Codes
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Create and manage discount codes for courses and bundles
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Promo Code
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Promo Code</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">Promo Code</Label>
                  <div className="flex gap-2">
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      placeholder="SUMMER2024"
                      required
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateRandomCode}
                    >
                      Generate
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="discountType">Discount Type</Label>
                  <Select
                    value={formData.discountType}
                    onValueChange={(value: "percentage" | "fixed") => 
                      setFormData(prev => ({ ...prev, discountType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Summer sale discount for all courses"
                  rows={2}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="discountValue">
                    Discount Value {formData.discountType === "percentage" ? "(%)" : "($)"}
                  </Label>
                  <Input
                    id="discountValue"
                    type="number"
                    min="0"
                    max={formData.discountType === "percentage" ? "100" : undefined}
                    step={formData.discountType === "percentage" ? "1" : "0.01"}
                    value={formData.discountValue}
                    onChange={(e) => setFormData(prev => ({ ...prev, discountValue: e.target.value }))}
                    placeholder={formData.discountType === "percentage" ? "25" : "10.00"}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="maxUses">Max Uses (Optional)</Label>
                  <Input
                    id="maxUses"
                    type="number"
                    min="1"
                    value={formData.maxUses}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxUses: e.target.value }))}
                    placeholder="100"
                  />
                </div>
                <div>
                  <Label htmlFor="validUntil">Valid Until (Optional)</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label>Applicable To</Label>
                <Select
                  value={formData.applicableType}
                  onValueChange={(value: "all" | "course" | "bundle") => 
                    setFormData(prev => ({ ...prev, applicableType: value, applicableIds: [] }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses & Bundles</SelectItem>
                    <SelectItem value="course">Specific Courses</SelectItem>
                    <SelectItem value="bundle">Specific Bundles</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.applicableType === "course" && courses && (
                <div>
                  <Label>Select Courses</Label>
                  <div className="max-h-40 overflow-y-auto border rounded-lg p-2 space-y-2">
                    {courses.map((course: any) => (
                      <div key={course.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`course-${course.id}`}
                          checked={formData.applicableIds.includes(course.id)}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            setFormData(prev => ({
                              ...prev,
                              applicableIds: isChecked
                                ? [...prev.applicableIds, course.id]
                                : prev.applicableIds.filter(id => id !== course.id)
                            }));
                          }}
                        />
                        <label htmlFor={`course-${course.id}`} className="text-sm">
                          {course.title}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {formData.applicableType === "bundle" && bundles && (
                <div>
                  <Label>Select Bundles</Label>
                  <div className="max-h-40 overflow-y-auto border rounded-lg p-2 space-y-2">
                    {bundles.map((bundle: any) => (
                      <div key={bundle.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`bundle-${bundle.id}`}
                          checked={formData.applicableIds.includes(bundle.id)}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            setFormData(prev => ({
                              ...prev,
                              applicableIds: isChecked
                                ? [...prev.applicableIds, bundle.id]
                                : prev.applicableIds.filter(id => id !== bundle.id)
                            }));
                          }}
                        />
                        <label htmlFor={`bundle-${bundle.id}`} className="text-sm">
                          {bundle.title}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createPromo.isPending}>
                  Create Promo Code
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {promoLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : !promoCodes || promoCodes.length === 0 ? (
        <EmptyState
          icon={<Ticket className="h-12 w-12" />}
          title="No Promo Codes Created"
          description="Create your first promo code to offer discounts on courses and bundles."
          action={
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Promo Code
            </Button>
          }
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-green-600" />
              Active Promo Codes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promoCodes.map((promo) => (
                  <TableRow key={promo.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono text-sm">
                          {promo.code}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(promo.code)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="line-clamp-2 text-sm">{promo.description}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {promo.discountType === "percentage" ? (
                          <Percent className="h-4 w-4 text-green-600" />
                        ) : (
                          <DollarSign className="h-4 w-4 text-green-600" />
                        )}
                        <span className="font-medium">
                          {promo.discountValue}
                          {promo.discountType === "percentage" ? "%" : ""}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">
                          {promo.usedCount}
                          {promo.maxUses ? ` / ${promo.maxUses}` : " uses"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {!promo.isActive ? (
                          <Badge variant="destructive">Inactive</Badge>
                        ) : isExpired(promo.validUntil) ? (
                          <Badge variant="destructive">Expired</Badge>
                        ) : isMaxUsesReached(promo) ? (
                          <Badge variant="destructive">Max Uses Reached</Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {promo.validUntil ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          {format(new Date(promo.validUntil), "MMM dd, yyyy")}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">No expiry</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Ticket className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Total Codes</p>
                <p className="text-2xl font-bold">{promoCodes?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Active Codes</p>
                <p className="text-2xl font-bold">
                  {promoCodes?.filter(p => p.isActive && !isExpired(p.validUntil) && !isMaxUsesReached(p)).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Total Uses</p>
                <p className="text-2xl font-bold">
                  {promoCodes?.reduce((sum, p) => sum + p.usedCount, 0) || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Expired</p>
                <p className="text-2xl font-bold">
                  {promoCodes?.filter(p => isExpired(p.validUntil) || isMaxUsesReached(p)).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}