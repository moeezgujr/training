import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload, Check, BookOpen, Settings, FileImage, ArrowRight, ArrowLeft, Trash2, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  Form,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }),
  description: z.string().min(20, {
    message: "Description must be at least 20 characters.",
  }),
  imageUrl: z.string().refine((val) => !val || z.string().url().safeParse(val).success, {
    message: "Please enter a valid URL",
  }).optional(),
  previewVideoUrl: z.string().refine((val) => !val || z.string().url().safeParse(val).success, {
    message: "Please enter a valid URL",
  }).optional(),
  duration: z.number().min(1, {
    message: "Duration must be at least 1 hour.",
  }),
  tags: z.string().min(1, { message: "At least one tag is required" }),
});

type FormValues = z.infer<typeof formSchema>;

interface Module {
  title: string;
  description: string;
  order: number;
}

export default function AddCoursePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [newModuleDescription, setNewModuleDescription] = useState("");
  const [createdCourseId, setCreatedCourseId] = useState<string | null>(null);

  const glassCard = "bg-slate-950/40 backdrop-blur-md border-white/5 shadow-2xl text-white";

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      previewVideoUrl: "",
      duration: 1,
      tags: "",
    },
  });

  const addCourseMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      let finalImageUrl = values.imageUrl;
      if (selectedFile && selectedFile instanceof File) {
        const formData = new FormData();
        formData.append("image", selectedFile);
        const uploadResponse = await fetch("/api/upload/image", {
          method: "POST",
          body: formData,
          credentials: "include",
        });
        if (!uploadResponse.ok) throw new Error("Failed to upload image");
        const uploadData = await uploadResponse.json();
        finalImageUrl = uploadData.url;
      }
      const endpoint = user?.role === "admin" ? "/api/admin/courses" : "/api/instructor/courses";
      const courseData = {
        ...values,
        imageUrl: finalImageUrl,
        tags: values.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        status: "draft",
      };
      const response = await apiRequest("POST", endpoint, courseData);
      if (!response.ok) throw new Error("Failed to create course");
      return await response.json();
    },
    onSuccess: (data) => {
      setCreatedCourseId(data.id);
      setCurrentStep(4);
      toast({ title: "Course Draft Created", description: "Now add your curriculum modules." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const addModulesMutation = useMutation({
    mutationFn: async () => {
      if (!createdCourseId) throw new Error("No course created");
      const modulesData = modules.map((m) => ({ ...m, lessons: [] }));
      const response = await apiRequest("POST", `/api/instructor/courses/${createdCourseId}/modules`, { modules: modulesData });
      if (!response.ok) throw new Error("Failed to save modules");
      return createdCourseId;
    },
    onSuccess: (courseId) => {
      toast({ title: "Curriculum Saved", description: "Redirecting to course editor..." });
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      setLocation(`/admin/courses/${courseId}/edit`);
    }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
      form.setValue("imageUrl", "");
    }
  };

  const addModule = () => {
    if (!newModuleTitle.trim() || !newModuleDescription.trim()) return;
    setModules([...modules, { title: newModuleTitle, description: newModuleDescription, order: modules.length + 1 }]);
    setNewModuleTitle("");
    setNewModuleDescription("");
  };

  const nextStep = async () => {
    let fields: (keyof FormValues)[] = [];
    if (currentStep === 1) fields = ["title", "description"];
    if (currentStep === 2) {
      if (!selectedFile && !form.getValues("imageUrl")) {
        toast({ title: "Cover Image Required", description: "Please upload or provide a URL", variant: "destructive" });
        return;
      }
      fields = ["imageUrl"];
    }
    const isValid = await form.trigger(fields);
    if (isValid) setCurrentStep(prev => prev + 1);
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen bg-slate-950"><Loader2 className="animate-spin text-blue-500" /></div>;

  const steps = [
    { id: 1, name: "Identity", icon: BookOpen },
    { id: 2, name: "Media", icon: FileImage },
    { id: 3, name: "Specs", icon: Settings },
    { id: 4, name: "Syllabus", icon: Check },
  ];

  return (
    <div className="min-h-screen bg-transparent py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col space-y-2 mb-10">
          <h1 className="text-3xl font-black uppercase tracking-tighter text-white syne-font">
            Forge <span className="text-blue-500">Course</span>
          </h1>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">Creation Terminal v2.0</p>
        </div>

        {/* Stepper Header */}
        <div className="flex justify-between mb-12 relative px-4">
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center z-10">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 border",
                currentStep >= step.id 
                  ? "bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]" 
                  : "bg-slate-900 border-white/10 text-white/30"
              )}>
                <step.icon size={20} />
              </div>
              <span className={cn(
                "text-[10px] mt-3 font-black uppercase tracking-widest transition-colors",
                currentStep >= step.id ? "text-blue-400" : "text-white/20"
              )}>{step.name}</span>
            </div>
          ))}
          <div className="absolute top-6 left-0 h-[1px] bg-white/5 w-full -z-0" />
          <div className="absolute top-6 left-0 h-[1px] bg-blue-500 transition-all duration-700 -z-0" style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }} />
        </div>

        <Card className={cn(glassCard, "border-white/10 overflow-hidden")}>
          <CardHeader className="border-b border-white/5 bg-white/5">
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <span className="text-blue-500">0{currentStep}</span> {steps[currentStep - 1].name} Protocol
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit((v) => addCourseMutation.mutate(v))} className="space-y-8">
                {currentStep === 1 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <FormField control={form.control} name="title" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase text-white/50 tracking-widest">Course Title</FormLabel>
                        <FormControl><Input {...field} className="bg-white/5 border-white/10 rounded-xl focus:border-blue-500" placeholder="e.g. Quantum Architecture Principles" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="description" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase text-white/50 tracking-widest">System Overview</FormLabel>
                        <FormControl><Textarea {...field} rows={5} className="bg-white/5 border-white/10 rounded-xl focus:border-blue-500 resize-none" placeholder="Provide a detailed technical description..." /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6 animate-in fade-in zoom-in-95">
                    <div className="border-2 border-dashed border-white/10 p-12 text-center rounded-2xl bg-white/5 hover:bg-white/10 transition-colors group">
                      <input type="file" id="file-up" className="hidden" onChange={handleImageChange} />
                      <label htmlFor="file-up" className="cursor-pointer block">
                        <Upload className="mx-auto mb-4 text-blue-500 group-hover:scale-110 transition-transform" size={32} />
                        <span className="text-xs font-black uppercase tracking-widest text-white/60">Upload Source Image</span>
                      </label>
                    </div>
                    <div className="relative">
                       <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-white/20 text-[10px] font-bold">OR</div>
                       <FormField control={form.control} name="imageUrl" render={({ field }) => (
                        <FormItem><FormControl><Input {...field} className="bg-white/5 border-white/10 rounded-xl pl-10" placeholder="External Asset URL" /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                    {imagePreview && <img src={imagePreview} className="mt-4 rounded-xl aspect-video object-cover w-full border border-white/10 shadow-2xl" />}
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
                    <FormField control={form.control} name="duration" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase text-white/50 tracking-widest">Clock Cycles (Hours)</FormLabel>
                        <FormControl><Input type="number" {...field} className="bg-white/5 border-white/10 rounded-xl" onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="tags" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase text-white/50 tracking-widest">Metadata Tags</FormLabel>
                        <FormControl><Input {...field} className="bg-white/5 border-white/10 rounded-xl" placeholder="React, Node.js, AI" /></FormControl>
                      </FormItem>
                    )} />
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-6 animate-in fade-in">
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/5 space-y-4">
                      <Input placeholder="Module Title" value={newModuleTitle} onChange={e => setNewModuleTitle(e.target.value)} className="bg-slate-900 border-white/10" />
                      <Textarea placeholder="Curriculum details..." value={newModuleDescription} onChange={e => setNewModuleDescription(e.target.value)} className="bg-slate-900 border-white/10 resize-none" />
                      <Button type="button" variant="outline" className="w-full border-blue-500/30 text-blue-400 hover:bg-blue-500/10" onClick={addModule}>
                        <Plus className="mr-2" size={16} /> Append Module
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {modules.map((m, i) => (
                        <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center group">
                          <div>
                            <span className="text-[10px] font-mono text-blue-500 mr-3">MOD_0{i+1}</span>
                            <span className="text-sm font-bold">{m.title}</span>
                          </div>
                          <Button type="button" variant="ghost" size="sm" className="text-white/20 hover:text-red-400" onClick={() => setModules(modules.filter((_, idx) => idx !== i))}>
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-8 border-t border-white/5">
                  <Button type="button" variant="ghost" className="text-white/40 hover:text-white" onClick={() => currentStep > 1 ? setCurrentStep(c => c - 1) : setLocation("/admin/courses")}>
                    {currentStep === 1 ? "Abort" : "Previous Phase"}
                  </Button>

                  {currentStep < 3 ? (
                    <Button type="button" className="bg-blue-600 hover:bg-blue-500 rounded-xl px-8 shadow-lg" onClick={nextStep}>
                      Next Phase <ArrowRight className="ml-2" size={16} />
                    </Button>
                  ) : currentStep === 3 ? (
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-500 rounded-xl px-8 shadow-[0_0_20px_rgba(37,99,235,0.4)]" disabled={addCourseMutation.isPending}>
                      {addCourseMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : <Check className="mr-2" />} Initialize Course
                    </Button>
                  ) : (
                    <Button type="button" className="bg-emerald-600 hover:bg-emerald-500 rounded-xl px-8 shadow-[0_0_20px_rgba(16,185,129,0.3)] text-white" onClick={() => addModulesMutation.mutate()} disabled={addModulesMutation.isPending || modules.length === 0}>
                      {addModulesMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : <Check className="mr-2" />} Deploy Curriculum
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}