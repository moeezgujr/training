import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Package, Plus, Edit, Trash2, Eye } from "lucide-react";
import type { Course } from "@shared/schema";

interface CourseWithPricing extends Course {
  instructorName: string;
}

interface Bundle {
  id: string;
  title: string;
  description: string;
  price: string;
  currency: string;
  discountPercentage: number;
  isActive: boolean;
  courses: CourseWithPricing[];
  createdAt: string;
}

export default function PricingPage() {
  const { toast } = useToast();
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [bundleForm, setBundleForm] = useState({
    title: "",
    description: "",
    price: "",
    currency: "USD",
    discountPercentage: 0,
    selectedCourses: [] as string[],
  });

  // Fetch courses
  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ["/api/courses"],
    select: (data: CourseWithPricing[]) => data.filter(course => course.status === 'published'),
  });

  // Fetch bundles
  const { data: bundles = [], isLoading: bundlesLoading } = useQuery({
    queryKey: ["/api/admin/bundles"],
  });

  // Update course pricing
  const updateCoursePricingMutation = useMutation({
    mutationFn: async ({ courseId, data }: { courseId: string; data: any }) => {
      return apiRequest("PATCH", `/api/admin/courses/${courseId}/pricing`, data);
    },
    onSuccess: () => {
      toast({ title: "Course pricing updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update pricing",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create bundle
  const createBundleMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/admin/bundles", data);
    },
    onSuccess: () => {
      toast({ title: "Bundle created successfully" });
      setBundleForm({
        title: "",
        description: "",
        price: "",
        currency: "USD",
        discountPercentage: 0,
        selectedCourses: [],
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bundles"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create bundle",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePricingUpdate = (courseId: string, field: string, value: any) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    const updatedData = {
      [field]: value,
    };

    updateCoursePricingMutation.mutate({ courseId, data: updatedData });
  };

  const handleCreateBundle = () => {
    if (!bundleForm.title || !bundleForm.price || bundleForm.selectedCourses.length === 0) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields and select at least one course",
        variant: "destructive",
      });
      return;
    }

    createBundleMutation.mutate({
      ...bundleForm,
      price: parseFloat(bundleForm.price),
      courseIds: bundleForm.selectedCourses,
    });
  };

  const toggleCourseInBundle = (courseId: string) => {
    setBundleForm(prev => ({
      ...prev,
      selectedCourses: prev.selectedCourses.includes(courseId)
        ? prev.selectedCourses.filter(id => id !== courseId)
        : [...prev.selectedCourses, courseId],
    }));
  };

  if (coursesLoading || bundlesLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course Pricing & Bundles</h1>
          <p className="text-gray-600 mt-2">Manage course prices and create course bundles</p>
        </div>
      </div>

      <Tabs defaultValue="pricing" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pricing" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Course Pricing
          </TabsTrigger>
          <TabsTrigger value="bundles" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Course Bundles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pricing" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    Instructor: {course.instructorName}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`free-${course.id}`}>Free Course</Label>
                    <Switch
                      id={`free-${course.id}`}
                      checked={course.isFree}
                      onCheckedChange={(checked) => 
                        handlePricingUpdate(course.id, "isFree", checked)
                      }
                    />
                  </div>
                  
                  {!course.isFree && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor={`price-${course.id}`}>Price</Label>
                        <div className="flex gap-2">
                          <Input
                            id={`price-${course.id}`}
                            type="number"
                            placeholder="0.00"
                            value={course.price || ""}
                            onChange={(e) => 
                              handlePricingUpdate(course.id, "price", e.target.value)
                            }
                            className="flex-1"
                          />
                          <Select
                            value={course.currency}
                            onValueChange={(value) => 
                              handlePricingUpdate(course.id, "currency", value)
                            }
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USD">USD</SelectItem>
                              <SelectItem value="EUR">EUR</SelectItem>
                              <SelectItem value="GBP">GBP</SelectItem>
                              <SelectItem value="PKR">PKR</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex items-center gap-2">
                    <Badge variant={course.isFree ? "secondary" : "default"}>
                      {course.isFree ? "Free" : `${course.currency} ${course.price || "0"}`}
                    </Badge>
                    <Badge variant="outline">{course.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="bundles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Bundle
              </CardTitle>
              <CardDescription>
                Group multiple courses together at a discounted price
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bundle-title">Bundle Title</Label>
                  <Input
                    id="bundle-title"
                    placeholder="Enter bundle title"
                    value={bundleForm.title}
                    onChange={(e) => setBundleForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bundle-price">Bundle Price</Label>
                  <div className="flex gap-2">
                    <Input
                      id="bundle-price"
                      type="number"
                      placeholder="0.00"
                      value={bundleForm.price}
                      onChange={(e) => setBundleForm(prev => ({ ...prev, price: e.target.value }))}
                      className="flex-1"
                    />
                    <Select
                      value={bundleForm.currency}
                      onValueChange={(value) => setBundleForm(prev => ({ ...prev, currency: value }))}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="PKR">PKR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bundle-description">Description</Label>
                <Textarea
                  id="bundle-description"
                  placeholder="Describe what this bundle includes"
                  value={bundleForm.description}
                  onChange={(e) => setBundleForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Select Courses for Bundle</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded p-3">
                  {courses.map((course) => (
                    <div key={course.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`course-${course.id}`}
                        checked={bundleForm.selectedCourses.includes(course.id)}
                        onChange={() => toggleCourseInBundle(course.id)}
                        className="rounded"
                      />
                      <label htmlFor={`course-${course.id}`} className="text-sm flex-1 cursor-pointer">
                        {course.title}
                      </label>
                      <Badge variant="outline" className="text-xs">
                        {course.isFree ? "Free" : `${course.currency} ${course.price || "0"}`}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleCreateBundle}
                disabled={createBundleMutation.isPending}
                className="w-full"
              >
                {createBundleMutation.isPending ? "Creating..." : "Create Bundle"}
              </Button>
            </CardContent>
          </Card>

          {bundles.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Existing Bundles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bundles.map((bundle: Bundle) => (
                  <Card key={bundle.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{bundle.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {bundle.courses?.length || 0} courses included
                          </CardDescription>
                        </div>
                        <Badge variant={bundle.isActive ? "default" : "secondary"}>
                          {bundle.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-gray-600 line-clamp-2">{bundle.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-semibold text-green-600">
                          {bundle.currency} {bundle.price}
                        </div>
                        {bundle.discountPercentage > 0 && (
                          <Badge variant="destructive">
                            {bundle.discountPercentage}% off
                          </Badge>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}