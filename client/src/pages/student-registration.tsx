import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { PublicLayout } from "@/components/layouts/public-layout";
import { GraduationCap, ArrowRight } from "lucide-react";

const registrationSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  gender: z.string().min(1, "Please select your gender"),
  country: z.string().min(1, "Country is required"),
  city: z.string().min(1, "City is required"),
  phoneNumber: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  educationLevel: z.string().min(1, "Please select your education level"),
  fieldOfStudy: z.string().optional(),
  learningGoals: z.string().min(10, "Please describe your learning goals (minimum 10 characters)"),
  hearAboutUs: z.string().min(1, "Please tell us how you heard about us"),
  marketingEmails: z.boolean().default(false),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegistrationData = z.infer<typeof registrationSchema>;

export default function StudentRegistration() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);

  const form = useForm<RegistrationData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: "", lastName: "", email: "", password: "", confirmPassword: "",
      gender: "", country: "", city: "", phoneNumber: "", emergencyContact: "",
      emergencyPhone: "", educationLevel: "", fieldOfStudy: "", learningGoals: "",
      hearAboutUs: "", marketingEmails: false, termsAccepted: false,
    },
  });

  const registrationMutation = useMutation({
    mutationFn: async (data: RegistrationData) => {
      const { confirmPassword, termsAccepted, ...registrationData } = data;
      const response = await apiRequest("POST", "/api/auth/register", {
        ...registrationData,
        role: "learner",
        registrationType: "student",
      });
      if (!response.ok) throw new Error(await response.text() || "Registration failed");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Registration Successful!", description: "Welcome to Meeting Matters!" });
      navigate("/registration-success");
    },
    onError: (error: Error) => {
      toast({ title: "Registration Failed", description: error.message, variant: "destructive" });
    },
  });

  return (
    <PublicLayout>
      <div className="relative min-h-screen w-full bg-[#020617] overflow-x-hidden">
        {/* VIDEO BACKGROUND */}
        <div className="fixed inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <video 
            ref={videoRef} 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="absolute top-1/2 left-1/2 min-w-full min-h-full -translate-x-1/2 -translate-y-1/2 object-cover opacity-40"
          >
            <source src="https://cdn.pixabay.com/video/2021/04/12/70918-537443194_large.mp4" type="video/mp4" />
          </video>
          {/* Dark Overlay for Readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/80 via-transparent to-[#020617]" />
        </div>

        <div className="relative z-10 py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <div className="flex justify-center mb-6">
                <div className="bg-slate-900/80 backdrop-blur-xl p-4 rounded-2xl border-b-4 border-blue-500 shadow-2xl">
                  <GraduationCap className="h-10 w-10 text-blue-400" />
                </div>
              </div>
              <h1 className="text-4xl font-black text-white mb-3 tracking-tight">Student Registration</h1>
              <p className="text-blue-100/70 text-lg font-medium">Join Meeting Matters LMS and start your learning journey</p>
            </div>

            <Card className="shadow-2xl border-white/10 bg-white/95 backdrop-blur-xl rounded-3xl overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-blue-600 via-blue-400 to-indigo-600 w-full" />
              <CardHeader className="pt-8 text-center">
                <CardTitle className="text-2xl font-bold text-slate-900">Create Your Account</CardTitle>
                <CardDescription className="text-slate-500 font-medium">Fill out the form below to register as a student</CardDescription>
              </CardHeader>

              <CardContent className="p-8">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit((data) => registrationMutation.mutate(data))} className="space-y-8">
                    
                    {/* Section: Personal Info */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Personal Information</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="firstName" render={({ field }) => (
                          <FormItem><FormLabel className="font-bold text-slate-700">First Name *</FormLabel>
                            <FormControl><Input className="rounded-xl h-12 bg-slate-50" placeholder="John" {...field} /></FormControl>
                          <FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="lastName" render={({ field }) => (
                          <FormItem><FormLabel className="font-bold text-slate-700">Last Name *</FormLabel>
                            <FormControl><Input className="rounded-xl h-12 bg-slate-50" placeholder="Doe" {...field} /></FormControl>
                          <FormMessage /></FormItem>
                        )} />
                      </div>

                      <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem><FormLabel className="font-bold text-slate-700">Email Address *</FormLabel>
                          <FormControl><Input type="email" className="rounded-xl h-12 bg-slate-50" placeholder="john@example.com" {...field} /></FormControl>
                        <FormMessage /></FormItem>
                      )} />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="password" render={({ field }) => (
                          <FormItem><FormLabel className="font-bold text-slate-700">Password *</FormLabel>
                            <FormControl><Input type="password" placeholder="••••••••" className="rounded-xl h-12 bg-slate-50" {...field} /></FormControl>
                          <FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                          <FormItem><FormLabel className="font-bold text-slate-700">Confirm Password *</FormLabel>
                            <FormControl><Input type="password" placeholder="••••••••" className="rounded-xl h-12 bg-slate-50" {...field} /></FormControl>
                          <FormMessage /></FormItem>
                        )} />
                      </div>
                    </div>

                    {/* Section: Personal Details */}
                    <div className="space-y-6">
                       <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Personal Details</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="gender" render={({ field }) => (
                          <FormItem><FormLabel className="font-bold text-slate-700">Gender *</FormLabel>
                            <FormControl>
                              <select {...field} className="flex h-12 w-full rounded-xl border border-input bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                                <option value="">Select gender</option>
                                <option value="male">Male</option><option value="female">Female</option>
                              </select>
                            </FormControl>
                          <FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                          <FormItem><FormLabel className="font-bold text-slate-700">Phone (Optional)</FormLabel>
                            <FormControl><Input className="rounded-xl h-12 bg-slate-50" {...field} /></FormControl>
                          <FormMessage /></FormItem>
                        )} />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="country" render={({ field }) => (
                          <FormItem><FormLabel className="font-bold text-slate-700">Country *</FormLabel>
                            <FormControl><Input className="rounded-xl h-12 bg-slate-50" {...field} /></FormControl>
                          <FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="city" render={({ field }) => (
                          <FormItem><FormLabel className="font-bold text-slate-700">City *</FormLabel>
                            <FormControl><Input className="rounded-xl h-12 bg-slate-50" {...field} /></FormControl>
                          <FormMessage /></FormItem>
                        )} />
                      </div>
                    </div>

                    {/* Section: Education */}
                    <div className="space-y-6">
                       <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Education</h3>
                      </div>
                      <FormField control={form.control} name="educationLevel" render={({ field }) => (
                        <FormItem><FormLabel className="font-bold text-slate-700">Education Level *</FormLabel>
                          <FormControl>
                            <select {...field} className="flex h-12 w-full rounded-xl border border-input bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                              <option value="">Select level</option>
                              <option value="high_school">High School</option>
                              <option value="bachelor">Bachelor's</option>
                            </select>
                          </FormControl>
                        <FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="learningGoals" render={({ field }) => (
                        <FormItem><FormLabel className="font-bold text-slate-700">Learning Goals *</FormLabel>
                          <FormControl><textarea className="w-full min-h-[100px] p-4 rounded-xl bg-slate-50 border border-input focus:ring-2 focus:ring-blue-500 outline-none text-sm" {...field} /></FormControl>
                        <FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="hearAboutUs" render={({ field }) => (
                        <FormItem><FormLabel className="font-bold text-slate-700">How did you hear about us? *</FormLabel>
                          <FormControl>
                            <select {...field} className="flex h-12 w-full rounded-xl border border-input bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                              <option value="">Select an option</option>
                              <option value="search_engine">Search Engine</option>
                              <option value="social_media">Social Media</option>
                            </select>
                          </FormControl>
                        <FormMessage /></FormItem>
                      )} />
                    </div>

                    {/* Terms */}
                    <FormField control={form.control} name="termsAccepted" render={({ field }) => (
                      <FormItem className="flex items-start space-x-3 space-y-0 rounded-2xl border p-5 border-slate-200 bg-slate-50/50">
                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-blue-600" /></FormControl>
                        <div className="leading-none text-sm font-medium text-slate-700">
                          I agree to the <Link href="/terms" className="text-blue-600 underline">Terms</Link> and <Link href="/privacy" className="text-blue-600 underline">Privacy Policy</Link>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )} />

                    <Button type="submit" disabled={registrationMutation.isPending} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-7 rounded-2xl transition-all shadow-xl text-lg group">
                      {registrationMutation.isPending ? "Registering..." : (
                        <span className="flex items-center gap-2">Complete Registration <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" /></span>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <div className="text-center mt-10">
              <p className="text-blue-100/70">
                Already have an account?{" "}
                <Link href="/api/login" className="text-blue-400 hover:text-blue-300 font-bold underline transition-colors">Sign in here</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}