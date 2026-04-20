import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { PublicLayout } from "@/components/layouts/public-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Loader2 } from "lucide-react";

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(true);

  const query = new URLSearchParams(window.location.search);
  const orderId = query.get("orderId");

  useEffect(() => {
    if (!orderId) {
      toast({
        title: "Invalid Request",
        description: "No order ID found.",
        variant: "destructive",
      });
      setLocation("/dashboard");
      return;
    }

    const verifyPayment = async () => {
      try {
        const res = await fetch(`/api/payment/verify?orderId=${orderId}`, {
          method: "POST",
          credentials: "include",
        });

        const data = await res.json();

        if (data.success) {
          toast({
            title: "Success!",
            description: "Payment verified. You are now enrolled!",
          });
          // Redirect to course modules (use courseId from response if available)
          setLocation(`/courses`);
        } else {
          toast({
            title: "Verification Failed",
            description: data.message || "Payment could not be confirmed.",
            variant: "destructive",
          });
          setLocation("/dashboard");
        }
      } catch (err) {
      
        setLocation("/dashboard");
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [orderId, setLocation, toast]);

  return (
    <PublicLayout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            {isVerifying ? (
              <>
                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-6 text-primary" />
                <h1 className="text-2xl font-bold mb-4">Verifying Payment...</h1>
                <p className="text-muted-foreground">Please wait while we confirm your enrollment.</p>
              </>
            ) : (
              <>
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
                <h1 className="text-2xl font-bold mb-4">Payment Successful!</h1>
                <p className="text-muted-foreground mb-6">
                  Your enrollment is being processed. Redirecting...
                </p>
                <Button onClick={() => setLocation("/dashboard")}>
                  Go to Dashboard
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}