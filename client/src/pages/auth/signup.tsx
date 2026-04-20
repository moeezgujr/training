import { useState } from "react";
import { Link, useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Lock, Mail, User, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Redirect } from "@/components/ui/redirect";
import { Logo } from "@/components/ui/logo";

const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  if (isAuthenticated) {
    return <Redirect to="/dashboard" />;
  }
  
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  
  const onSubmit = async (values: SignupFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          password: values.password,
          role: 'learner'
        }),
      });

      if (response.ok) {
        toast({ title: "Account Created", description: "Identity verified. You can now access the terminal." });
        navigate("/auth/login");
      } else {
        const result = await response.json();
        toast({
          title: "Registration Failed",
          description: result.message || "Encryption error. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({ title: "Error", description: "Uplink failed. Check your connection.", variant: "destructive" });
    }
    setIsSubmitting(false);
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-transparent relative z-10">
      <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[500px]">
        
        {/* Branding */}
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="p-4 rounded-[2rem] bg-white/5 backdrop-blur-3xl border border-white/10 shadow-2xl">
            <Logo height={60} />
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Initiate Enrollment</h1>
            <p className="text-cyan-400 font-bold uppercase tracking-[0.2em] text-[10px]">
              New Personnel Registration
            </p>
          </div>
        </div>
        
        <Card className="bg-white/5 border-white/10 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border-t-white/20">
          <CardContent className="pt-10 px-8 pb-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" className="h-12 bg-black/20 border-white/5 text-white rounded-xl focus:border-cyan-500/50" {...field} />
                        </FormControl>
                        <FormMessage className="text-rose-400 text-[10px]" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" className="h-12 bg-black/20 border-white/5 text-white rounded-xl focus:border-cyan-500/50" {...field} />
                        </FormControl>
                        <FormMessage className="text-rose-400 text-[10px]" />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Communication Uplink (Email)</FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-500" />
                          <Input placeholder="user@nexus.io" className="h-12 pl-12 bg-black/20 border-white/5 text-white rounded-xl focus:border-cyan-500/50" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage className="text-rose-400 text-[10px]" />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Access Key</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input type={showPassword ? "text" : "password"} className="h-12 bg-black/20 border-white/5 text-white rounded-xl focus:border-cyan-500/50" {...field} />
                            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" onClick={() => setShowPassword(!showPassword)}>
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-rose-400 text-[10px]" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Confirm Key</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input type={showConfirmPassword ? "text" : "password"} className="h-12 bg-black/20 border-white/5 text-white rounded-xl focus:border-cyan-500/50" {...field} />
                            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-rose-400 text-[10px]" />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-14 bg-white text-black hover:bg-cyan-400 font-black rounded-2xl transition-all shadow-xl shadow-cyan-500/10 uppercase tracking-widest text-xs mt-4" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Generating Credentials..." : "Finalize Enrollment"}
                </Button>
              </form>
            </Form>
            
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <Separator className="bg-white/10" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-black">
                <span className="bg-[#0a0a0a]/80 px-4 text-slate-500 backdrop-blur-sm rounded-full border border-white/5">
                  Instant Access
                </span>
              </div>
            </div>
            
            <Button
              variant="outline"
              type="button"
              className="w-full h-12 bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all"
              onClick={() => window.location.href = "/api/auth/google"}
            >
              <svg className="mr-3 h-4 w-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sync with Google
            </Button>
          </CardContent>
          
          <CardFooter className="flex flex-col pb-8 bg-white/[0.02] border-t border-white/5">
            <div className="text-center text-xs mt-6 font-bold text-slate-400 uppercase tracking-tight">
              Already have clearance?{" "}
              <Link href="/auth/login" className="text-cyan-400 hover:text-white underline underline-offset-4 transition-colors ml-1">
                Return to Login
              </Link>
            </div>
          </CardFooter>
        </Card>
        
        <div className="flex justify-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
          <Link href="/terms" className="hover:text-cyan-400 transition-colors">Protocol</Link>
          <Link href="/privacy" className="hover:text-cyan-400 transition-colors">Privacy Shield</Link>
        </div>
      </div>
    </div>
  );
}