import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { 
  Package, 
  Clock, 
  BookOpen, 
  Users, 
  Star,
  ArrowRight,
  Percent
} from "lucide-react";
import { Link } from "wouter";

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

export default function BundlesPage() {
  const { data: bundles, isLoading } = useQuery<BundleDto[]>({
    queryKey: ["/api/bundles"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Package className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Course Bundles
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Save big with our carefully curated course bundles. Learn comprehensively and save money!
          </p>
        </div>

        {!bundles || bundles.length === 0 ? (
          <EmptyState
            icon={<Package className="h-12 w-12" />}
            title="No Bundles Available"
            description="Course bundles will appear here when they're created by administrators."
            size="lg"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bundles.map((bundle) => (
              <Card key={bundle.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white dark:bg-gray-800 border-0 shadow-lg">
                <div className="relative">
                  <img
                    src={bundle.imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop'}
                    alt={bundle.title}
                    className="w-full h-48 object-cover"
                  />
                  {parseFloat(bundle.discount) > 0 && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-red-500 hover:bg-red-600 text-white font-bold px-3 py-1">
                        <Percent className="h-3 w-3 mr-1" />
                        {bundle.discount}% OFF
                      </Badge>
                    </div>
                  )}
                </div>

                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2">
                    {bundle.title}
                  </CardTitle>
                  <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mt-2">
                    {bundle.description}
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="flex flex-col items-center">
                      <BookOpen className="h-5 w-5 text-blue-500 mb-1" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {bundle.courseCount}
                      </span>
                      <span className="text-xs text-gray-500">Courses</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Clock className="h-5 w-5 text-green-500 mb-1" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {Math.round(bundle.totalDuration / 60)}h
                      </span>
                      <span className="text-xs text-gray-500">Duration</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Star className="h-5 w-5 text-yellow-500 mb-1" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        4.8
                      </span>
                      <span className="text-xs text-gray-500">Rating</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        {parseFloat(bundle.discount) > 0 ? (
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-green-600">
                              ${bundle.discountedPrice.toFixed(2)}
                            </span>
                            <span className="text-lg text-gray-500 line-through">
                              ${bundle.originalPrice.toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            ${parseFloat(bundle.price).toFixed(2)}
                          </span>
                        )}
                        <p className="text-sm text-gray-500">One-time payment</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Link href={`/bundles/${bundle.id}`}>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                          View Bundle
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                      <Link href={`/checkout?type=bundle&id=${bundle.id}`}>
                        <Button variant="outline" className="w-full">
                          Buy Now
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-16 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Course Bundles?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="text-center">
                <div className="bg-blue-100 dark:bg-blue-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Percent className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Save Money</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Get multiple courses at a discounted price
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 dark:bg-green-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Complete Learning</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Comprehensive education on related topics
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 dark:bg-purple-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Expert Curated</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Carefully selected courses that work together
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}