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
  Package,
  Plus,
  Edit,
  Trash2,
  BookOpen,
  DollarSign,
  Percent,
  Users,
  Eye
} from "lucide-react";

interface BundleDto {
  id: string;
  title: string;
  description: string;
  price: string;
  discount: string;
  imageUrl: string;
  isActive: boolean;
  courses: any[];
  courseCount: number;
  totalDuration: number;
  originalPrice: number;
  discountedPrice: number;
  createdAt: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  status: string;
}

export default function AdminBundlesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBundle, setEditingBundle] = useState<BundleDto | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    discount: "0",
    imageUrl: "",
    isActive: true,
    courseIds: [] as string[],
  });

  // Fetch bundles
  const { data: bundles, isLoading: bundlesLoading } = useQuery<BundleDto[]>({
    queryKey: ["/api/bundles"],
  });

  // Fetch courses for bundle creation
  const { data: courses } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  // Create bundle mutation
  const createBundle = useMutation({
    mutationFn: async (bundleData: any) => {
      const response = await apiRequest("POST", "/api/admin/bundles", bundleData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bundles"] });
      setIsCreateOpen(false);
      resetForm();
      toast({
        title: "Bundle Created!",
        description: "The course bundle has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create bundle. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update bundle mutation
  const updateBundle = useMutation({
    mutationFn: async ({ id, ...bundleData }: any) => {
      const response = await apiRequest("PUT", `/api/admin/bundles/${id}`, bundleData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bundles"] });
      setEditingBundle(null);
      resetForm();
      toast({
        title: "Bundle Updated!",
        description: "The course bundle has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update bundle. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      price: "",
      discount: "0",
      imageUrl: "",
      isActive: true,
      courseIds: [],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBundle) {
      updateBundle.mutate({ id: editingBundle.id, ...formData });
    } else {
      createBundle.mutate(formData);
    }
  };

  const handleEdit = (bundle: BundleDto) => {
    setEditingBundle(bundle);
    setFormData({
      title: bundle.title,
      description: bundle.description,
      price: bundle.price,
      discount: bundle.discount,
      imageUrl: bundle.imageUrl,
      isActive: bundle.isActive,
      courseIds: bundle.courses.map(c => c.id),
    });
  };

  const handleCourseToggle = (courseId: string) => {
    setFormData(prev => ({
      ...prev,
      courseIds: prev.courseIds.includes(courseId)
        ? prev.courseIds.filter(id => id !== courseId)
        : [...prev.courseIds, courseId]
    }));
  };

  const publishedCourses = courses?.filter(course => course.status === 'published') || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Course Bundles
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Create and manage course bundles with special pricing
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Bundle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Course Bundle</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Bundle Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Professional Development Bundle"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="99.99"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Comprehensive bundle covering..."
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discount">Discount (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={(e) => setFormData(prev => ({ ...prev, discount: e.target.value }))}
                    placeholder="15"
                  />
                </div>
                <div>
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">Select Courses</Label>
                <div className="grid grid-cols-1 gap-2 mt-2 max-h-60 overflow-y-auto border rounded-lg p-3">
                  {publishedCourses.map((course) => (
                    <div
                      key={course.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        formData.courseIds.includes(course.id)
                          ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/30'
                          : 'bg-gray-50 border-gray-200 dark:bg-gray-800'
                      }`}
                      onClick={() => handleCourseToggle(course.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={formData.courseIds.includes(course.id)}
                          onChange={() => handleCourseToggle(course.id)}
                          className="rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {course.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1">
                            {course.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {formData.courseIds.length === 0 && (
                  <p className="text-sm text-red-600 mt-1">Please select at least one course</p>
                )}
              </div>

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
                <Button
                  type="submit"
                  disabled={createBundle.isPending || formData.courseIds.length === 0}
                >
                  Create Bundle
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {bundlesLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : !bundles || bundles.length === 0 ? (
        <EmptyState
          icon={<Package className="h-12 w-12" />}
          title="No Bundles Created"
          description="Create your first course bundle to offer multiple courses at a discounted price."
          action={
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Bundle
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bundles.map((bundle) => (
            <Card key={bundle.id} className="overflow-hidden">
              <div className="relative">
                <img
                  src={bundle.imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop'}
                  alt={bundle.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2">
                  <Badge variant={bundle.isActive ? "default" : "secondary"}>
                    {bundle.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                {parseFloat(bundle.discount) > 0 && (
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-red-500 text-white">
                      {bundle.discount}% OFF
                    </Badge>
                  </div>
                )}
              </div>

              <CardHeader>
                <CardTitle className="line-clamp-2">{bundle.title}</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                  {bundle.description}
                </p>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                  <div className="flex flex-col items-center">
                    <BookOpen className="h-5 w-5 text-blue-500 mb-1" />
                    <span className="text-sm font-medium">{bundle.courseCount}</span>
                    <span className="text-xs text-gray-500">Courses</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <DollarSign className="h-5 w-5 text-green-500 mb-1" />
                    <span className="text-sm font-medium">
                      ${bundle.discountedPrice.toFixed(2)}
                    </span>
                    <span className="text-xs text-gray-500">Price</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Percent className="h-5 w-5 text-orange-500 mb-1" />
                    <span className="text-sm font-medium">{bundle.discount}%</span>
                    <span className="text-xs text-gray-500">Discount</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(bundle)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Bundle Dialog */}
      <Dialog open={!!editingBundle} onOpenChange={(open) => !open && setEditingBundle(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Bundle: {editingBundle?.title}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-title">Bundle Title</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-price">Price ($)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-discount">Discount (%)</Label>
                <Input
                  id="edit-discount"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discount}
                  onChange={(e) => setFormData(prev => ({ ...prev, discount: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={formData.isActive ? "active" : "inactive"}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, isActive: value === "active" }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingBundle(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateBundle.isPending}>
                Update Bundle
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}