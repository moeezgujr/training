import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { PublicLayout } from "@/components/layouts/public-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { loadStripe } from "@stripe/stripe-js";
import {
  CreditCard,
  Shield,
  CheckCircle,
  AlertCircle,
  FileText,
  Clock,
  Loader2
} from "lucide-react";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  instructorName: string;
  duration: number;
  moduleCount: number;
}

interface OrderSummary {
  coursePrice: number;
  promoDiscount: number;
  totalAmount: number;
}

export default function CoursePaymentPage() {
  const [match, params] = useRoute("/checkout/course/:courseId");
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);
  const [customerDetails, setCustomerDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const courseId = params?.courseId;

  const { data: course, isLoading: courseLoading } = useQuery<Course>({
    queryKey: [`/api/courses/${courseId}`],
    enabled: !!courseId,
  });

  useEffect(() => {
    if (course) {
      const coursePrice = Number(course.price || 0);
      const totalAmount = Math.max(0, coursePrice - promoDiscount);
      setOrderSummary({ coursePrice, promoDiscount, totalAmount });
    }
  }, [course, promoDiscount]);

  useEffect(() => {
    if (user && isAuthenticated) {
      setCustomerDetails({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: ''
      });
    }
  }, [user, isAuthenticated]);

  const applyPromoMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest('POST', '/api/promo/validate', { code, itemType: 'course', itemId: courseId });
      return response.json();
    },
    onSuccess: (data: any) => {
      let discountAmount = 0;
      if (course) {
        if (data.discountType === 'percentage') {
          discountAmount = (Number(course.price) * data.discountValue) / 100;
        } else {
          discountAmount = data.discountValue;
        }
      }
      setPromoDiscount(discountAmount);
      toast({ title: "Promo Applied!", description: `Saved PKR ${discountAmount.toLocaleString()}` });
    },
    onError: () => {
      setPromoDiscount(0);
      toast({ title: "Invalid Promo", description: "Promo code not valid", variant: "destructive" });
    },
  });

  const handleApplyPromo = () => {
    if (promoCode.trim()) applyPromoMutation.mutate(promoCode.trim());
  };

  const handleCheckout = async () => {
    if (!orderSummary) return;

    if (!customerDetails.firstName || !customerDetails.email) {
      toast({ title: "Fill Required Fields", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create order first
      const orderRes = await apiRequest('POST', '/api/orders', {
        courseId,
        paymentMethod: 'stripe',
        promoCode: promoCode || undefined,
        customerDetails,
        orderSummary,
        amount: orderSummary.totalAmount,
      });
      const orderData = await orderRes.json();
      const orderId = orderData.id;

      // Create Stripe checkout session
      const response = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          amount: orderSummary.totalAmount,
          orderId,
          courseId,
          customerEmail: customerDetails.email,
          customerName: `${customerDetails.firstName} ${customerDetails.lastName}`.trim(),
        }),
      });

      const data = await response.json();

      if (data.success && data.sessionId) {
        const stripe = await stripePromise;
        const { error } = await stripe!.redirectToCheckout({ sessionId: data.sessionId });
        if (error) {
          toast({ title: "Payment Error", description: error.message, variant: "destructive" });
        }
      } else {
        toast({ title: "Payment Error", description: data.message || "Failed to start payment", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Payment Failed", description: "Something went wrong", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (courseLoading) {
    return (
      <PublicLayout>
        <div className="container max-w-4xl mx-auto py-8 flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </PublicLayout>
    );
  }

  if (!course) {
    return (
      <PublicLayout>
        <div className="container max-w-4xl mx-auto py-8">
          <Card>
            <CardContent className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
              <h2 className="text-xl font-semibold mb-2">Course Not Found</h2>
              <p className="text-muted-foreground">The course could not be found.</p>
            </CardContent>
          </Card>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container max-w-6xl mx-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Course Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Secure Checkout
                </CardTitle>
                <CardDescription>Complete your purchase for instant course access</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <img
                    src={course.imageUrl || '/api/placeholder/120/80'}
                    alt={course.title}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{course.title}</h3>
                    <p className="text-muted-foreground">by MEETING MATTERS</p>
                    <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {course.duration} hours
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {course.moduleCount} modules
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      PKR {Number(course.price || 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={customerDetails.firstName}
                      onChange={(e) => setCustomerDetails(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={customerDetails.lastName}
                      onChange={(e) => setCustomerDetails(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Enter your last name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerDetails.email}
                      onChange={(e) => setCustomerDetails(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={customerDetails.phone}
                      onChange={(e) => setCustomerDetails(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="03XXXXXXXXX"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Secure payment via Stripe</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 border rounded-lg p-4 bg-muted/30">
                  <div className="p-2 rounded-lg bg-purple-500">
                    <CreditCard className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">Credit / Debit Card</div>
                    <div className="text-sm text-muted-foreground">Visa, Mastercard, and more via Stripe</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="promoCode">Promo Code</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="promoCode"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Enter promo code"
                    />
                    <Button
                      variant="outline"
                      onClick={handleApplyPromo}
                      disabled={applyPromoMutation.isPending}
                    >
                      Apply
                    </Button>
                  </div>
                  {promoDiscount > 0 && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      Promo applied!
                    </div>
                  )}
                </div>

                <Separator />

                {orderSummary && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Course Price</span>
                      <span>PKR {orderSummary.coursePrice.toLocaleString()}</span>
                    </div>
                    {orderSummary.promoDiscount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Promo Discount</span>
                        <span>-PKR {orderSummary.promoDiscount.toLocaleString()}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>PKR {orderSummary.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Proceed to Payment
                    </>
                  )}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  <Shield className="h-4 w-4 mx-auto mb-1" />
                  Secure payment via Stripe
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What you'll get</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Lifetime access to course content</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Certificate of completion</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Access on all devices</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
