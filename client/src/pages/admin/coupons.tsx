import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { AdminHeader } from "@/components/layouts/AdminHeader";
import {
  Tag,
  Plus,
  Search,
  Calendar,
  Percent,
  DollarSign,
  Users,
  Eye,
  Edit,
  Trash2,
  Copy,
  TrendingUp,
  Gift
} from "lucide-react";
import { format } from "date-fns";

export default function CouponsDiscounts() {
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [couponData, setCouponData] = useState({
    code: '',
    description: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: '',
    minimumAmount: '',
    maxUses: '',
    maxUsesPerUser: '',
    startDate: '',
    endDate: '',
    isActive: true,
    applicableCourses: [] as string[],
    applicableCategories: [] as string[]
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['/api/admin/coupons'],
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['/api/admin/courses'],
  });

  const { data: couponStats = {} } = useQuery({
    queryKey: ['/api/admin/coupon-stats'],
  });

  const createCouponMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create coupon');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Coupon Created",
        description: "Your coupon has been successfully created.",
      });
      setCreateDialog(false);
      resetCouponData();
      queryClient.invalidateQueries({ queryKey: ['/api/admin/coupons'] });
    },
    onError: () => {
      toast({
        title: "Creation Failed",
        description: "Failed to create coupon. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateCouponMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/admin/coupons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update coupon');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Coupon Updated",
        description: "Coupon has been successfully updated.",
      });
      setEditDialog(false);
      setSelectedCoupon(null);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/coupons'] });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update coupon. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteCouponMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/coupons/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete coupon');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Coupon Deleted",
        description: "Coupon has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/coupons'] });
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete coupon. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetCouponData = () => {
    setCouponData({
      code: '',
      description: '',
      type: 'percentage',
      value: '',
      minimumAmount: '',
      maxUses: '',
      maxUsesPerUser: '',
      startDate: '',
      endDate: '',
      isActive: true,
      applicableCourses: [],
      applicableCategories: []
    });
  };

  const handleCreateCoupon = () => {
    if (!couponData.code || !couponData.value) return;
    
    // Transform frontend fields to match backend API
    const payload = {
      code: couponData.code,
      description: couponData.description || '',
      discountType: couponData.type, // Backend expects 'discountType'
      discountValue: parseFloat(couponData.value), // Backend expects 'discountValue'
      maxUses: couponData.maxUses ? parseInt(couponData.maxUses) : null,
      validFrom: couponData.startDate ? new Date(couponData.startDate).toISOString() : null,
      validUntil: couponData.endDate ? new Date(couponData.endDate).toISOString() : null,
      isActive: couponData.isActive,
      applicableType: couponData.applicableCourses.length > 0 ? 'course' : 'all',
      applicableIds: couponData.applicableCourses.length > 0 ? couponData.applicableCourses : null,
    };
    
    createCouponMutation.mutate(payload);
  };

  const handleUpdateCoupon = () => {
    if (!selectedCoupon || !selectedCoupon.code) return;
    
    // Transform data to match backend API
    const updateData = {
      code: selectedCoupon.code,
      description: selectedCoupon.description,
      discountType: selectedCoupon.discountType,
      discountValue: selectedCoupon.discountValue,
      maxUses: selectedCoupon.maxUses,
      validFrom: selectedCoupon.validFrom ? new Date(selectedCoupon.validFrom).toISOString() : null,
      validUntil: selectedCoupon.validUntil ? new Date(selectedCoupon.validUntil).toISOString() : null,
      isActive: selectedCoupon.isActive,
      applicableType: selectedCoupon.applicableType,
      applicableIds: selectedCoupon.applicableIds,
    };
    
    updateCouponMutation.mutate({
      id: selectedCoupon.id,
      data: updateData
    });
  };

  const handleDeleteCoupon = (id: string) => {
    if (confirm('Are you sure you want to delete this coupon? This action cannot be undone.')) {
      deleteCouponMutation.mutate(id);
    }
  };

  const handleCopyCoupon = (coupon: any) => {
    navigator.clipboard.writeText(coupon.code);
    toast({
      title: "Coupon Code Copied",
      description: "Coupon code has been copied to clipboard.",
    });
  };

  const generateCouponCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCouponData({ ...couponData, code: result });
  };

  const filteredCoupons = Array.isArray(coupons) ? coupons.filter((coupon: any) => {
    const matchesSearch = !searchQuery || 
      coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coupon.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && coupon.isActive) ||
      (filterStatus === 'inactive' && !coupon.isActive) ||
      (filterStatus === 'expired' && coupon.validUntil && new Date(coupon.validUntil) < new Date());
    
    const matchesType = filterType === 'all' || coupon.discountType === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  }) : [];

  const stats = {
    totalCoupons: Array.isArray(coupons) ? coupons.length : 0,
    activeCoupons: Array.isArray(coupons) ? coupons.filter((c: any) => c.isActive).length : 0,
    totalUses: Array.isArray(coupons) ? coupons.reduce((acc: number, c: any) => acc + (c.usedCount || 0), 0) : 0,
    totalSavings: Array.isArray(coupons) ? coupons.reduce((acc: number, c: any) => acc + (c.totalSavings || 0), 0) : 0,
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <AdminHeader title="Coupons & Discounts" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <AdminHeader title="Coupons & Discounts" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Coupons</p>
                <p className="text-2xl font-bold">{stats.totalCoupons}</p>
              </div>
              <Tag className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Coupons</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeCoupons}</p>
              </div>
              <Gift className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Uses</p>
                <p className="text-2xl font-bold">{stats.totalUses}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Savings</p>
                <p className="text-2xl font-bold">${stats.totalSavings.toFixed(2)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search coupons..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Dialog open={createDialog} onOpenChange={setCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Coupon
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Coupons Table */}
      <Card>
        <CardHeader>
          <CardTitle>Coupon Management</CardTitle>
          <CardDescription>
            Create and manage discount coupons for your courses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Uses</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Validity</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCoupons.map((coupon: any) => (
                <TableRow key={coupon.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold">{coupon.code}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleCopyCoupon(coupon)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="max-w-xs truncate">{coupon.description}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {coupon.discountType === 'percentage' ? (
                        <div className="flex items-center gap-1">
                          <Percent className="w-3 h-3" />
                          Percentage
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          Fixed
                        </div>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">
                      {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `$${coupon.discountValue}`}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{coupon.usedCount || 0} used</div>
                      {coupon.maxUses && (
                        <div className="text-gray-500">of {coupon.maxUses}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        coupon.isActive && coupon.validUntil && new Date(coupon.validUntil) > new Date() 
                          ? 'default' 
                          : 'secondary'
                      }
                    >
                      {coupon.isActive 
                        ? (coupon.validUntil && new Date(coupon.validUntil) > new Date() ? 'Active' : 'Expired')
                        : 'Inactive'
                      }
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>
                        {coupon.validFrom ? (() => {
                          try {
                            return format(new Date(coupon.validFrom), 'MMM dd, yyyy');
                          } catch {
                            return 'Invalid date';
                          }
                        })() : 'No start date'}
                      </div>
                      <div className="text-gray-500">
                        to {coupon.validUntil ? (() => {
                          try {
                            return format(new Date(coupon.validUntil), 'MMM dd, yyyy');
                          } catch {
                            return 'Invalid date';
                          }
                        })() : 'No end date'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedCoupon(coupon);
                          setEditDialog(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteCoupon(coupon.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredCoupons.length === 0 && (
            <div className="text-center py-8">
              <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No coupons found</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery || filterStatus !== 'all' || filterType !== 'all'
                  ? 'No coupons match your current filters.'
                  : 'Create your first coupon to start offering discounts.'}
              </p>
              <Button onClick={() => setCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Coupon
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Coupon Dialog */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Coupon</DialogTitle>
            <DialogDescription>
              Create a discount coupon for your courses
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="coupon-code">Coupon Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="coupon-code"
                    value={couponData.code}
                    onChange={(e) => setCouponData({ ...couponData, code: e.target.value.toUpperCase() })}
                    placeholder="Enter coupon code"
                  />
                  <Button type="button" variant="outline" onClick={generateCouponCode}>
                    Generate
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="coupon-type">Discount Type</Label>
                <Select 
                  value={couponData.type} 
                  onValueChange={(value: 'percentage' | 'fixed') => setCouponData({ ...couponData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="coupon-description">Description</Label>
              <Input
                id="coupon-description"
                value={couponData.description}
                onChange={(e) => setCouponData({ ...couponData, description: e.target.value })}
                placeholder="Enter coupon description"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="coupon-value">
                  {couponData.type === 'percentage' ? 'Percentage (%)' : 'Amount ($)'}
                </Label>
                <Input
                  id="coupon-value"
                  type="number"
                  value={couponData.value}
                  onChange={(e) => setCouponData({ ...couponData, value: e.target.value })}
                  placeholder={couponData.type === 'percentage' ? '10' : '50'}
                />
              </div>

              <div>
                <Label htmlFor="minimum-amount">Minimum Order ($)</Label>
                <Input
                  id="minimum-amount"
                  type="number"
                  value={couponData.minimumAmount}
                  onChange={(e) => setCouponData({ ...couponData, minimumAmount: e.target.value })}
                  placeholder="100"
                />
              </div>

              <div>
                <Label htmlFor="max-uses">Max Uses</Label>
                <Input
                  id="max-uses"
                  type="number"
                  value={couponData.maxUses}
                  onChange={(e) => setCouponData({ ...couponData, maxUses: e.target.value })}
                  placeholder="100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={couponData.startDate}
                  onChange={(e) => setCouponData({ ...couponData, startDate: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={couponData.endDate}
                  onChange={(e) => setCouponData({ ...couponData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Applicable Courses (Optional)</Label>
              <div className="mt-2 max-h-32 overflow-y-auto space-y-2">
                {Array.isArray(courses) ? courses.map((course: any) => (
                  <div key={course.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`course-${course.id}`}
                      checked={couponData.applicableCourses.includes(course.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setCouponData({
                            ...couponData,
                            applicableCourses: [...couponData.applicableCourses, course.id]
                          });
                        } else {
                          setCouponData({
                            ...couponData,
                            applicableCourses: couponData.applicableCourses.filter(id => id !== course.id)
                          });
                        }
                      }}
                    />
                    <Label htmlFor={`course-${course.id}`} className="text-sm">
                      {course.title}
                    </Label>
                  </div>
                )) : null}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateCoupon}
                disabled={!couponData.code || !couponData.value || createCouponMutation.isPending}
              >
                {createCouponMutation.isPending ? 'Creating...' : 'Create Coupon'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Coupon Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Coupon</DialogTitle>
            <DialogDescription>
              Update coupon information
            </DialogDescription>
          </DialogHeader>

          {selectedCoupon && (
            <div className="space-y-4">
              <div>
                <Label>Coupon Code</Label>
                <Input value={selectedCoupon.code} disabled />
              </div>

              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={selectedCoupon.description}
                  onChange={(e) => setSelectedCoupon({ ...selectedCoupon, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-start-date">Start Date</Label>
                  <Input
                    id="edit-start-date"
                    type="date"
                    value={selectedCoupon.validFrom?.split('T')[0] || ''}
                    onChange={(e) => setSelectedCoupon({ ...selectedCoupon, validFrom: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="edit-end-date">End Date</Label>
                  <Input
                    id="edit-end-date"
                    type="date"
                    value={selectedCoupon.validUntil?.split('T')[0] || ''}
                    onChange={(e) => setSelectedCoupon({ ...selectedCoupon, validUntil: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-is-active"
                  checked={selectedCoupon.isActive}
                  onCheckedChange={(checked) => setSelectedCoupon({ ...selectedCoupon, isActive: checked })}
                />
                <Label htmlFor="edit-is-active">Active</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateCoupon} disabled={updateCouponMutation.isPending}>
                  {updateCouponMutation.isPending ? 'Updating...' : 'Update Coupon'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}