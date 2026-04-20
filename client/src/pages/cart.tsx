import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight,
  BookOpen,
  Zap,
  PackageOpen
} from "lucide-react";

export default function CartPage() {
  const { isAuthenticated } = useAuth();
  const { 
    cart, 
    isLoading, 
    removeFromCart, 
    updateQuantity, 
    clearCart,
    isRemovingFromCart 
  } = useCart();

  // 1. Auth Guard State
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-sm">
          <div className="bg-white/5 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto border border-white/10">
            <ShoppingCart className="h-10 w-10 text-cyan-400" />
          </div>
          <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">Identity Required</h2>
          <p className="text-slate-500 text-sm font-medium tracking-wide">Please authenticate to access your personal module manifest.</p>
          <Button asChild className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-widest py-6 rounded-2xl transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)]">
            <Link href="/auth/login">Initialize Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  // 2. Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] py-16 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="flex justify-between items-end">
            <Skeleton className="h-12 w-64 bg-white/5 rounded-xl" />
            <Skeleton className="h-10 w-32 bg-white/5 rounded-xl" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2].map((i) => <Skeleton key={i} className="h-32 w-full bg-white/5 rounded-[2rem]" />)}
            </div>
            <Skeleton className="h-80 w-full bg-white/5 rounded-[2.5rem]" />
          </div>
        </div>
      </div>
    );
  }

  // 3. Empty State
  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
        <div className="text-center space-y-6">
          <PackageOpen className="h-16 w-16 text-slate-800 mx-auto" />
          <h2 className="text-xl font-black uppercase tracking-widest text-slate-500">Manifest Empty</h2>
          <Button asChild variant="ghost" className="text-cyan-400 hover:text-cyan-300 font-black uppercase tracking-[0.3em] text-[10px]">
            <Link href="/courses">Return to Library</Link>
          </Button>
        </div>
      </div>
    );
  }

  const subtotal = cart.items.reduce((total, item) => {
    const price = Number(item.course?.price || 0) / 100;
    return total + (price * item.quantity);
  }, 0);

  return (
    <div className="min-h-screen bg-[#020617] text-white py-16 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-black uppercase tracking-[0.4em] text-[10px] mb-4">
              <Zap className="w-4 h-4 fill-cyan-400" /> Staging Area
            </div>
            <h1 className="text-5xl lg:text-7xl font-black italic uppercase tracking-tighter leading-none">
              Module <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 not-italic">Manifest</span>
            </h1>
          </div>
          
          <Button
            variant="ghost"
            onClick={() => clearCart()}
            className="text-red-400/50 hover:text-red-400 hover:bg-red-500/10 font-black uppercase tracking-widest text-[10px] self-start"
          >
            <Trash2 className="h-3 w-3 mr-2" /> Purge All
          </Button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Cart Items List */}
          <div className="lg:col-span-7 space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className="group relative p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 backdrop-blur-3xl hover:border-white/20 transition-all duration-500">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Thumbnail */}
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-white/10">
                    <img
                      src={item.course?.imageUrl || '/placeholder-course.jpg'}
                      alt="Course"
                      className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-black text-xl italic uppercase tracking-tight group-hover:text-cyan-400 transition-colors">
                          {item.course?.title}
                        </h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-1">
                          Protocol by Dr. Naushad Anjum
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-lg italic tracking-tight">
                          PKR {(Number(item.course?.price || 0) / 100).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-6">
                      {/* Quantity Logic */}
                      <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:text-white"
                          onClick={() => updateQuantity({ itemId: item.id, quantity: item.quantity - 1 })}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-[10px] font-black">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:text-white"
                          onClick={() => updateQuantity({ itemId: item.id, quantity: item.quantity + 1 })}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-400/40 hover:text-red-400 h-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Panel */}
          <aside className="lg:col-span-5">
            <div className="sticky top-24 p-10 rounded-[2.5rem] bg-white/[0.03] border border-white/10 backdrop-blur-3xl shadow-2xl">
              <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-500 mb-10 border-b border-white/5 pb-6">Summary Data</h3>
              
              <div className="space-y-6">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
                  <span>Subtotal ({cart.items.length})</span>
                  <span>PKR {subtotal.toLocaleString()}</span>
                </div>
                
                <Separator className="bg-white/5" />
                
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400">Grand Total</span>
                  <span className={`text-4xl font-black italic tracking-tighter ${subtotal === 0 ? "text-emerald-400" : ""}`}>
                    {subtotal === 0 ? "FREE" : `PKR ${subtotal.toLocaleString()}`}
                  </span>
                </div>

                <Button 
                  className="w-full h-16 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-[0.2em] text-xs transition-all shadow-[0_0_30px_rgba(34,211,238,0.2)]" 
                  asChild
                >
                  <Link href="/checkout">
                    {subtotal === 0 ? "Immediate Access" : "Proceed to Checkout"}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>

                <Button variant="link" asChild className="w-full text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-[0.2em]">
                  <Link href="/courses">
                    <BookOpen className="h-3 w-3 mr-2" /> Continue Browsing
                  </Link>
                </Button>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}