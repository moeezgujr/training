import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { PublicLayout } from "@/components/layouts/public-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { 
  Smartphone, 
  CreditCard, 
  Building2, 
  Shield,
  CheckCircle,
  AlertCircle,
  Copy,
  FileText,
  Clock
} from "lucide-react";

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

interface PaymentMethod {
  id: string;
  provider: string;
  isEnabled: boolean;
  accountNumber?: string;
  accountName?: string;
  bankName?: string;
  accountTitle?: string;
  iban?: string;
  branchCode?: string;
  instructions?: string;
  minAmount: string;
  maxAmount?: string;
  processingFee: string;
}

interface OrderSummary {
  coursePrice: number;
  promoDiscount: number;
  processingFee: number;
  totalAmount: number;
}

const paymentProviders = {
  easypaisa: {
    name: 'EasyPaisa',
    icon: Smartphone,
    color: 'bg-green-500',
    description: 'Pay via EasyPaisa mobile wallet'
  },
  jazzcash: {
    name: 'JazzCash',
    icon: Smartphone,
    color: 'bg-orange-500',
    description: 'Pay via JazzCash mobile wallet'
  },
  bank_transfer: {
    name: 'Bank Transfer',
    icon: Building2,
    color: 'bg-blue-500',
    description: 'Direct bank account transfer'
  },
  stripe: {
    name: 'Credit/Debit Card',
    icon: CreditCard,
    color: 'bg-purple-500',
    description: 'International cards via Stripe'
  }
};

export default function CoursePaymentPage() {
  const [match, params] = useRoute("/checkout/course/:courseId");
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);
  const [customerDetails, setCustomerDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  const courseId = params?.courseId;

  const { data: course, isLoading: courseLoading } = useQuery<Course>({
    queryKey: [`/api/courses/${courseId}`],
    enabled: !!courseId,
  });

  // Debug: Log course data when it changes
  useEffect(() => {
    if (course) {
      console.log('Course data loaded:', course);
      console.log('Course price:', course.price);
      console.log('Course price type:', typeof course.price);
    }
  }, [course]);

  const { data: paymentMethods = [], isLoading: paymentLoading } = useQuery<PaymentMethod[]>({
    queryKey: ['/api/payment-methods'],
  });

  const applyPromoMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest('POST', '/api/promo/validate', {
        code,
        itemType: 'course',
        itemId: courseId
      });
      return response.json();
    },
    onSuccess: (data: any) => {
      // Calculate discount based on type
      let discountAmount = 0;
      if (course) {
        if (data.discountType === 'percentage') {
          discountAmount = (course.price * data.discountValue) / 100;
        } else {
          discountAmount = data.discountValue;
        }
      }
      
      setPromoDiscount(discountAmount);
      calculateOrderSummary(discountAmount);
      toast({
        title: "Promo code applied!",
        description: `You saved PKR ${discountAmount.toLocaleString()}!`,
      });
    },
    onError: (error: any) => {
      setPromoDiscount(0);
      calculateOrderSummary(0);
      toast({
        title: "Invalid promo code",
        description: error.message || "This promo code is not valid",
        variant: "destructive",
      });
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest('POST', '/api/orders', orderData);
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Order created successfully!",
        description: "Please complete the payment to access your course.",
      });
      window.location.href = `/orders/${data.id}`;
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create order",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const calculateOrderSummary = (discount: number = promoDiscount) => {
    if (!course) return;

    const selectedMethod = paymentMethods.find(method => method.id === selectedPaymentMethod);
    const processingFeePercent = selectedMethod ? parseFloat(selectedMethod.processingFee) : 0;
    
    const coursePrice = course.price || 0;
    const discountAmount = discount;
    const subtotal = coursePrice - discountAmount;
    const processingFee = (subtotal * processingFeePercent) / 100;
    const totalAmount = subtotal + processingFee;

    setOrderSummary({
      coursePrice,
      promoDiscount: discountAmount,
      processingFee,
      totalAmount
    });
  };

  useEffect(() => {
    if (course && selectedPaymentMethod) {
      calculateOrderSummary();
    }
  }, [course, selectedPaymentMethod, promoDiscount]);

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

  const handleApplyPromo = () => {
    if (promoCode.trim()) {
      applyPromoMutation.mutate(promoCode.trim());
    }
  };

  const handleCreateOrder = () => {
    if (!selectedPaymentMethod || !orderSummary) {
      toast({
        title: "Please select a payment method",
        variant: "destructive",
      });
      return;
    }

    if (!customerDetails.firstName || !customerDetails.email) {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      courseId,
      paymentMethod: selectedPaymentMethod,
      promoCode: promoCode || undefined,
      customerDetails,
      orderSummary
    };

    createOrderMutation.mutate(orderData);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: text,
    });
  };

  if (courseLoading || paymentLoading) {
    return (
      <PublicLayout>
        <div className="container max-w-4xl mx-auto py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
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
              <p className="text-muted-foreground">The course you're trying to purchase could not be found.</p>
            </CardContent>
          </Card>
        </div>
      </PublicLayout>
    );
  }

  const enabledPaymentMethods = paymentMethods.filter(method => method.isEnabled);
  const selectedMethod = paymentMethods.find(method => method.id === selectedPaymentMethod);

  return (
    <PublicLayout>
      <div className="container max-w-6xl mx-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Secure Checkout
                </CardTitle>
                <CardDescription>
                  Complete your purchase to get instant access to this course
                </CardDescription>
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
                    <p className="text-muted-foreground">by {course.instructorName}</p>
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
                    <div className="text-2xl font-bold">PKR {(course.price || 0).toLocaleString()}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

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

            <Card>
              <CardHeader>
                <CardTitle>Choose Payment Method</CardTitle>
                <CardDescription>
                  Select your preferred payment method below
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                  <div className="space-y-3">
                    {enabledPaymentMethods.map((method) => {
                      const provider = paymentProviders[method.provider as keyof typeof paymentProviders];
                      const Icon = provider?.icon || CreditCard;
                      
                      return (
                        <Label
                          key={method.id}
                          htmlFor={method.id}
                          className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50"
                        >
                          <RadioGroupItem value={method.id} id={method.id} />
                          <div className={`p-2 rounded-lg ${provider?.color || 'bg-gray-500'}`}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{provider?.name}</div>
                            <div className="text-sm text-muted-foreground">{provider?.description}</div>
                            {parseFloat(method.processingFee) > 0 && (
                              <div className="text-sm text-muted-foreground">
                                Processing fee: {method.processingFee}%
                              </div>
                            )}
                          </div>
                        </Label>
                      );
                    })}
                  </div>
                </RadioGroup>

                {selectedMethod && (
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Payment Instructions</h4>
                    <div className="space-y-2 text-sm">
                      {selectedMethod.accountNumber && (
                        <div className="flex items-center justify-between">
                          <span>Account Number:</span>
                          <span className="font-mono flex items-center gap-2">
                            {selectedMethod.accountNumber}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(selectedMethod.accountNumber!)}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </span>
                        </div>
                      )}
                      
                      {selectedMethod.accountName && (
                        <div className="flex items-center justify-between">
                          <span>Account Name:</span>
                          <span>{selectedMethod.accountName}</span>
                        </div>
                      )}

                      {selectedMethod.iban && (
                        <div className="flex items-center justify-between">
                          <span>IBAN:</span>
                          <span className="font-mono flex items-center gap-2">
                            {selectedMethod.iban}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(selectedMethod.iban!)}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </span>
                        </div>
                      )}

                      {selectedMethod.bankName && (
                        <div className="flex items-center justify-between">
                          <span>Bank:</span>
                          <span>{selectedMethod.bankName}</span>
                        </div>
                      )}

                      {selectedMethod.instructions && (
                        <div className="mt-3 p-3 bg-background rounded border-l-4 border-primary">
                          <p>{selectedMethod.instructions}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

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
                      Promo code applied!
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
                    
                    {orderSummary.processingFee > 0 && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Processing Fee</span>
                        <span>PKR {orderSummary.processingFee.toFixed(2)}</span>
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
                  className="w-full" 
                  size="lg"
                  onClick={handleCreateOrder}
                  disabled={!selectedPaymentMethod || createOrderMutation.isPending}
                >
                  {createOrderMutation.isPending ? "Processing..." : "Complete Purchase"}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  <Shield className="h-4 w-4 mx-auto mb-1" />
                  Secure payment processing
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
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Q&A with instructor</span>
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