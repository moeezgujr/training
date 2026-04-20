import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { PublicLayout } from "@/components/layouts/public-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import {
  ShoppingCart,
  Loader2,
  User,
  ShieldCheck,
  Zap,
  ArrowRight,
  Lock
} from "lucide-react";

export default function CheckoutPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { cart, isLoading: cartLoading, clearCart } = useCart();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.firstName || user.email?.split('@')[0] || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleCheckout = async () => {
    if (!name || !email) {
      toast({
        title: "Incomplete Protocol",
        description: "Identification fields are required.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (cart?.items?.length) {
        const courseIds = cart.items.map(item => item.itemId);
        const response = await apiRequest("POST", "/api/courses/enroll-bulk", { courseIds });
        const data = await response.json();

        toast({
          title: "Access Granted",
          description: "Modules successfully synced to your account.",
        });

        clearCart();
        setLocation("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Transfer Failed",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-cyan-500 animate-spin" />
      </div>
    );
  }

  return (
    <PublicLayout>
      <div className="min-h-screen bg-[#020617] text-white selection:bg-emerald-500/30 py-20 px-6">
        {/* Background Accents */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <header className="mb-16">
            <div className="flex items-center gap-2 text-emerald-400 font-black uppercase tracking-[0.4em] text-[10px] mb-4">
              <ShieldCheck className="w-4 h-4" />
              Secure Checkout Terminal
            </div>
            <h1 className="text-5xl lg:text-7xl font-black italic uppercase tracking-tighter">
              Finalize <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 not-italic">Enrollment</span>
            </h1>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left: Cart Items */}
            <div className="lg:col-span-7 space-y-6">
              <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/10 backdrop-blur-3xl">
                <div className="flex items-center justify-between mb-8">
                   <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                     <ShoppingCart className="w-4 h-4" /> Manifest
                   </h2>
                   <span className="text-[10px] font-bold px-3 py-1 bg-white/5 rounded-full border border-white/10">
                    {cart?.items?.length || 0} ITEMS
                   </span>
                </div>

                {cart?.items?.length ? (
                  <div className="space-y-6">
                    {cart.items.map((cartItem) => (
                      <div key={cartItem.id} className="flex gap-6 p-4 rounded-2xl hover:bg-white/[0.02] transition-colors group">
                        <div className="relative h-20 w-20 shrink-0">
                          <img
                            src={cartItem.course?.imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop'}
                            alt="Course"
                            className="h-full w-full object-cover rounded-xl grayscale group-hover:grayscale-0 transition-all duration-500"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg truncate mb-1 italic uppercase tracking-tight">
                            {cartItem.course?.title || 'Unknown Module'}
                          </h3>
                          <div className="flex items-center gap-4 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                             <span>QTY: {cartItem.quantity}</span>
                             <span className="text-emerald-400">PKR {(Number(cartItem.course?.price ?? 0) / 100).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center">
                    <Zap className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                    <p className="text-slate-500 font-bold uppercase text-xs tracking-[0.2em]">The manifest is empty</p>
                  </div>
                )}
              </div>

              {/* Total Card */}
              <div className="p-8 rounded-[2rem] bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-1">Total Requirement</p>
                    <p className="text-4xl font-black italic uppercase">PKR {(Number(cart?.totalPrice ?? 0) / 100).toLocaleString()}</p>
                  </div>
                  <Lock className="w-8 h-8 text-emerald-500/30 mb-2" />
                </div>
              </div>
            </div>

            {/* Right: Personal Info */}
            <div className="lg:col-span-5">
              <div className="sticky top-24 p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/10 backdrop-blur-3xl shadow-2xl">
                <div className="flex items-center gap-3 mb-10 pb-6 border-b border-white/5">
                  <User className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-xl font-bold tracking-tight uppercase italic">Identity</h3>
                </div>

                <div className="space-y-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Legal Name</Label>
                    <Input
                      placeholder="e.g. JOHN DOE"
                      className="bg-black/60 border-white/10 h-14 rounded-2xl focus:ring-emerald-500/50 text-sm font-bold placeholder:text-slate-800"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Registry Email</Label>
                    <Input
                      type="email"
                      placeholder="e.g. USER@NEURAL.LINK"
                      className="bg-black/60 border-white/10 h-14 rounded-2xl focus:ring-emerald-500/50 text-sm font-bold placeholder:text-slate-800"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <Button
                    onClick={handleCheckout}
                    disabled={isSubmitting || !name || !email || !cart?.items?.length}
                    className="w-full h-16 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-[0.2em] text-xs transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <div className="flex items-center gap-2">
                        Execute Transfer <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </Button>

                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex gap-3">
                     <Lock className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                     <p className="text-[9px] text-slate-600 uppercase font-bold leading-relaxed">
                        Secure SSL Encryption active. Data transmission is sandboxed and encrypted via Neural Protocol.
                     </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </PublicLayout>
  );
}