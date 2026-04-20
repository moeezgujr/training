import { useState } from "react";
import { Link, useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  ChevronRight,
  ArrowLeft,
  LayoutDashboard,
  Lock,
  Mail,
  Eye,
  EyeOff
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Logo } from "@/components/ui/logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Redirect } from "@/components/ui/redirect";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid instructor email"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function InstructorLoginPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  if (isAuthenticated && user?.role === "instructor") {
    return <Redirect to="/instructor" />;
  }

  const onSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
          loginType: 'instructor'
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Instructor Access Granted",
          description: "Welcome to your dashboard.",
        });
        window.location.href = "/instructor";
      } else {
        toast({
          title: "Login Failed",
          description: result.message || "Invalid credentials or unauthorized role.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Unable to connect to the server.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 relative overflow-hidden text-slate-200">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md z-10 space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 shadow-2xl">
              <Logo height={50} className="brightness-150" />
            </div>
          </Link>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white tracking-tight">Instructor Portal</h1>
            <p className="text-slate-400 text-sm font-medium">Authorized Personnel Only</p>
          </div>
        </div>

        {/* Role Conflict Alert */}
        {isAuthenticated && user?.role !== "instructor" && (
          <Alert className="bg-amber-500/10 border-amber-500/20 text-amber-200 border-l-4 border-l-amber-500 shadow-xl">
            <Lock className="h-4 w-4 stroke-amber-400" />
            <AlertTitle className="font-bold">Access Restricted</AlertTitle>
            <AlertDescription className="text-xs opacity-90">
              Your current account ({user.role}) does not have instructor privileges.
            </AlertDescription>
          </Alert>
        )}

        <Card className="bg-slate-900/50 border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden">
          <CardHeader className="space-y-1 pb-6 border-b border-white/5 bg-white/[0.02]">
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5 text-cyan-400" />
              Sign In
            </CardTitle>
            <CardDescription className="text-slate-400">
              Enter your official credentials to manage courses.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-8 pb-10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Work Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                          <Input 
                            placeholder="instructor@meetingmatters.com" 
                            className="pl-10 bg-slate-950/50 border-white/10 text-white focus:ring-cyan-500/50" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-cyan-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-slate-300">Password</FormLabel>
                        <Link href="/auth/forgot-password" disabled className="text-[10px] text-slate-500 hover:text-cyan-400 transition-colors uppercase tracking-widest">
                          Forgot?
                        </Link>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                          <Input 
                            type={showPassword ? "text" : "password"}
                            className="pl-10 pr-10 bg-slate-950/50 border-white/10 text-white focus:ring-cyan-500/50" 
                            {...field} 
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-cyan-400" />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-lg transition-all group"
                >
                  {isSubmitting ? "Verifying..." : "Login to Instructor Console"}
                  {!isSubmitting && <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Footer Navigation */}
        <div className="flex flex-col items-center space-y-4">
          <Link href="/auth/login" className="inline-flex items-center text-sm text-slate-400 hover:text-cyan-400 transition-colors group">
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Learner Login
          </Link>
          
          <p className="text-[11px] text-slate-500 text-center leading-relaxed max-w-[280px]">
            This portal is restricted to authorized personnel. 
            Unauthorized access attempts are logged and monitored.
          </p>
        </div>
      </div>
    </div>
  );
}