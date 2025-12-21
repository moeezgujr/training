import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { PublicLayout } from "@/components/layouts/public-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import {
  Upload,
  CheckCircle,
  AlertCircle,
  DollarSign,
  FileText,
  CreditCard,
  Clock
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  instructorName: string;
  price: number;
  duration: number;
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
  instructions?: string;
  minAmount: number;
  maxAmount?: number;
  processingFee: number;
}

export default function PaymentSubmissionPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const [, params] = useRoute("/payment/submit/:courseId");
  const courseId = params?.courseId;

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);

  // Fetch course details
  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['/api/courses', courseId],
    enabled: !!courseId,
  });

  // Fetch available payment methods
  const { data: paymentMethods = [], isLoading: methodsLoading } = useQuery({
    queryKey: ['/api/payment-methods'],
  });

  // Validate promo code
  const validatePromoMutation = useMutation({
    mutationFn: async (code: string) => {
      if (!code.trim()) {
        setDiscount(0);
        return;
      }
      return await apiRequest('POST', '/api/promo/validate', {
        code,
        itemType: 'course',
        itemId: courseId
      });
    },
    onSuccess: (data) => {
      if (data?.valid) {
        setDiscount(data.discount);
        toast({
          title: "Promo Code Applied",
          description: `${data.discount}% discount applied successfully`,
        });
      } else {
        setDiscount(0);
        toast({
          title: "Invalid Promo Code",
          description: "This promo code is not valid or has expired",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      setDiscount(0);
      toast({
        title: "Error",
        description: "Failed to validate promo code",
        variant: "destructive",
      });
    },
  });

  // Submit payment transaction
  const submitPaymentMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return await apiRequest('POST', '/api/payment-transactions', formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payment-transactions'] });
      toast({
        title: "Payment Submitted",
        description: "Your payment has been submitted for verification. You will receive confirmation once approved.",
      });
      // Reset form
      setPaymentReference("");
      setPaymentProofFile(null);
      setNotes("");
      setPromoCode("");
      setDiscount(0);
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload an image (JPG, PNG, GIF) or PDF file",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
      
      setPaymentProofFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit payment",
        variant: "destructive",
      });
      return;
    }

    if (!selectedPaymentMethod || !paymentReference || !paymentProofFile) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and upload payment proof",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('courseId', courseId || '');
    formData.append('paymentMethod', selectedPaymentMethod);
    formData.append('paymentReference', paymentReference);
    formData.append('amount', finalAmount.toString());
    formData.append('originalAmount', (course?.price || 0).toString());
    formData.append('discountAmount', discountAmount.toString());
    formData.append('promoCode', promoCode);
    formData.append('notes', notes);
    formData.append('paymentProof', paymentProofFile);

    submitPaymentMutation.mutate(formData);
  };

  if (courseLoading || methodsLoading) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-6 py-8">
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
        <div className="container mx-auto px-6 py-8">
          <Card>
            <CardContent className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Course Not Found</h3>
              <p className="text-muted-foreground">
                The course you're looking for doesn't exist or has been removed.
              </p>
            </CardContent>
          </Card>
        </div>
      </PublicLayout>
    );
  }

  const originalAmount = course.price || 0;
  const discountAmount = (originalAmount * discount) / 100;
  const finalAmount = originalAmount - discountAmount;

  const selectedMethod = paymentMethods.find((method: PaymentMethod) => method.provider === selectedPaymentMethod);

  return (
    <PublicLayout>
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Submit Payment</h1>
            <p className="text-muted-foreground">
              Complete your course purchase by submitting payment details
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Course Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Course Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <img 
                    src={course.imageUrl} 
                    alt={course.title}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{course.title}</h3>
                    <p className="text-sm text-muted-foreground">by {course.instructorName}</p>
                    <p className="text-sm text-muted-foreground">{course.duration} minutes</p>
                  </div>
                </div>

                {/* Pricing Breakdown */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Course Price</span>
                    <span>PKR {originalAmount.toLocaleString()}</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({discount}%)</span>
                      <span>-PKR {discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total Amount</span>
                    <span>PKR {finalAmount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Promo Code */}
                <div className="space-y-2">
                  <Label htmlFor="promoCode">Promo Code (Optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="promoCode"
                      placeholder="Enter promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => validatePromoMutation.mutate(promoCode)}
                      disabled={validatePromoMutation.isPending}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Form */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
                <CardDescription>
                  Submit your payment proof for verification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Payment Method Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Payment Method *</Label>
                    <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map((method: PaymentMethod) => (
                          <SelectItem key={method.provider} value={method.provider}>
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-4 w-4" />
                              {method.provider === 'easypaisa' && 'EasyPaisa'}
                              {method.provider === 'jazzcash' && 'JazzCash'}
                              {method.provider === 'bank_transfer' && 'Bank Transfer'}
                              {method.provider === 'stripe' && 'Credit/Debit Card'}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Payment Instructions */}
                  {selectedMethod && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Payment Instructions</h4>
                      <div className="text-sm space-y-1">
                        {selectedMethod.accountNumber && (
                          <p><strong>Account:</strong> {selectedMethod.accountNumber}</p>
                        )}
                        {selectedMethod.accountName && (
                          <p><strong>Name:</strong> {selectedMethod.accountName}</p>
                        )}
                        {selectedMethod.bankName && (
                          <p><strong>Bank:</strong> {selectedMethod.bankName}</p>
                        )}
                        {selectedMethod.iban && (
                          <p><strong>IBAN:</strong> {selectedMethod.iban}</p>
                        )}
                        {selectedMethod.instructions && (
                          <p className="mt-2">{selectedMethod.instructions}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Payment Reference */}
                  <div className="space-y-2">
                    <Label htmlFor="paymentReference">Payment Reference/Transaction ID *</Label>
                    <Input
                      id="paymentReference"
                      placeholder="Enter transaction ID or reference number"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      required
                    />
                  </div>

                  {/* Payment Proof Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="paymentProof">Payment Proof *</Label>
                    <Input
                      id="paymentProof"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Upload screenshot or receipt (JPG, PNG, GIF, PDF - Max 5MB)
                    </p>
                    {paymentProofFile && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        {paymentProofFile.name}
                      </div>
                    )}
                  </div>

                  {/* Additional Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any additional information about your payment"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={submitPaymentMutation.isPending || !isAuthenticated}
                  >
                    {submitPaymentMutation.isPending ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Submit Payment
                      </>
                    )}
                  </Button>

                  {!isAuthenticated && (
                    <p className="text-sm text-center text-muted-foreground">
                      Please log in to submit payment
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Verification Process Info */}
          <Card>
            <CardHeader>
              <CardTitle>What happens next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Upload className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-medium mb-2">1. Submit Payment</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload your payment proof and transaction details
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <h3 className="font-medium mb-2">2. Verification</h3>
                  <p className="text-sm text-muted-foreground">
                    Our team will verify your payment within 24 hours
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-medium mb-2">3. Course Access</h3>
                  <p className="text-sm text-muted-foreground">
                    Get instant access to your course once payment is approved
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
}