import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { useQuery, useMutation, queryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Edit, FileEdit, Users, Calendar, BarChart2, CheckCircle, XCircle, BookOpen, Eye, Trash2, MoreVertical, AlertTriangle, Zap, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { CourseEditor } from "@/components/instructor/course-editor";
import { Redirect } from "@/components/ui/redirect";
import { useToast } from "@/hooks/use-toast";
import { formatDistance } from "date-fns";
import { cn } from "@/lib/utils";

export default function InstructorCoursesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editCourseId, setEditCourseId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<any>(null);
  const { isAuthenticated, isLoading, user } = useAuth();
  const { toast } = useToast();
  
  const { data: instructorCourses, isLoading: isLoadingCourses } = useQuery({
    queryKey: ["/api/instructor/courses"],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/instructor/courses');
      return res.json();
    },
    enabled: isAuthenticated && user?.role === "instructor",
  });
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#020617]">
        <div className="relative h-12 w-12">
           <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20"></div>
           <div className="absolute inset-0 rounded-full border-t-2 border-cyan-500 animate-spin"></div>
        </div>
      </div>
    );
  }
  
  if (!isLoading && !isAuthenticated) return <Redirect to="/" />;
  if (!isLoading && isAuthenticated && user?.role !== "instructor") return <Redirect to="/dashboard" />;

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: "bg-slate-800 text-slate-400 border-slate-700",
      published: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      archived: "bg-orange-500/10 text-orange-400 border-orange-500/20"
    };
    return (
      <Badge variant="outline" className={cn("uppercase text-[10px] tracking-widest px-2 py-0.5", styles[status as keyof typeof styles])}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 selection:bg-cyan-500/30">
      {/* AMBIENT BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-600/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 container max-w-7xl mx-auto px-6 py-10">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-cyan-500 font-mono text-[10px] uppercase tracking-[0.3em]">
              <Layers className="h-3 w-3" /> Instructor Console
            </div>
            <h1 className="text-4xl font-black tracking-tighter italic uppercase">
              Management <span className="text-white not-italic text-cyan-400">Hub</span>
            </h1>
            <p className="text-slate-500 text-sm max-w-md">Deploy and monitor your educational modules across the neural network.</p>
          </div>
          
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold uppercase tracking-widest text-xs h-12 px-8 rounded-xl transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]"
          >
            <Plus className="h-4 w-4 mr-2 stroke-[3px]" /> Create Module
          </Button>
        </div>

        {/* TABS STYLING */}
        <Tabs defaultValue="all" className="space-y-8">
          <TabsList className="bg-white/5 border border-white/10 p-1 h-12 rounded-xl backdrop-blur-md">
            {["all", "published", "draft", "archived"].map((tab) => (
              <TabsTrigger 
                key={tab} 
                value={tab}
                className="rounded-lg px-6 uppercase text-[10px] font-black tracking-widest data-[state=active]:bg-cyan-600 data-[state=active]:text-white transition-all"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="mt-0">
            {isLoadingCourses ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => <div key={i} className="h-80 rounded-3xl bg-white/5 animate-pulse border border-white/5" />)}
              </div>
            ) : instructorCourses?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {instructorCourses.map((course: any) => (
                  <Card key={course.id} className="group relative overflow-hidden bg-white/[0.03] border-white/5 hover:border-cyan-500/30 transition-all duration-500 rounded-3xl backdrop-blur-sm">
                    {/* Course Image Header */}
                    <div className="relative h-44 overflow-hidden">
                      <div 
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" 
                        style={{ backgroundImage: `url(${course.imageUrl || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800'})` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#020617] to-transparent opacity-60" />
                      <div className="absolute top-4 right-4">
                        {getStatusBadge(course.status)}
                      </div>
                    </div>

                    <CardHeader className="relative -mt-6">
                      <CardTitle className="text-xl font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
                        {course.title}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">
                        {course.description || "No system description provided for this module."}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/5">
                          <Users className="h-3 w-3 text-cyan-400" />
                          <span className="text-[10px] font-bold text-slate-300 uppercase">{course.enrolledCount || 0} Students</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/5">
                          <BookOpen className="h-3 w-3 text-purple-400" />
                          <span className="text-[10px] font-bold text-slate-300 uppercase">{course.moduleCount || 0} Units</span>
                        </div>
                      </div>
                    </CardContent>

                    <div className="p-4 pt-0 flex gap-2">
                      <Button 
                        variant="secondary"
                        className="flex-1 bg-white/5 hover:bg-cyan-600 hover:text-white border-white/5 text-[10px] font-black uppercase tracking-widest h-10 rounded-xl transition-all"
                        onClick={() => setEditCourseId(course.id)}
                      >
                        <Edit className="h-3 w-3 mr-2" /> Modify
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon" className="border-white/5 bg-white/5 rounded-xl hover:bg-white/10">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-slate-900 border-white/10 text-slate-200 rounded-xl">
                          <DropdownMenuItem onClick={() => window.open(`/course/${course.id}`, '_blank')} className="hover:bg-cyan-600/20 focus:bg-cyan-600/20">
                            <Eye className="h-4 w-4 mr-2 text-cyan-400" /> Preview
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/5" />
                          <DropdownMenuItem onClick={() => handleDeleteCourse(course)} className="text-red-400 hover:bg-red-500/10 focus:bg-red-500/10">
                            <Trash2 className="h-4 w-4 mr-2" /> Delete Module
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center rounded-[3rem] border border-dashed border-white/10 bg-white/[0.01]">
                <Layers className="h-12 w-12 mx-auto text-slate-700 mb-4" />
                <h3 className="text-xl font-bold text-white uppercase italic">System Empty</h3>
                <p className="text-slate-500 text-sm mt-2">Initialize your first module to begin the sequence.</p>
                <Button variant="link" onClick={() => setIsCreateDialogOpen(true)} className="mt-4 text-cyan-400 uppercase text-[10px] font-black tracking-widest">
                  Deploy Now <Plus className="ml-1 h-3 w-3" />
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* DIALOG STYLING OVERRIDES */}
      <Dialog open={isCreateDialogOpen || !!editCourseId} onOpenChange={(open) => {
        if(!open) { setIsCreateDialogOpen(false); setEditCourseId(null); }
      }}>
        <DialogContent className="max-w-4xl bg-[#0a0f1d] border-white/10 text-slate-100 rounded-[2rem] shadow-2xl overflow-hidden p-0">
          <div className="p-8 border-b border-white/5 bg-white/[0.02]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter">
                {editCourseId ? "Modify Module" : "Deploy New Module"}
              </DialogTitle>
              <DialogDescription className="text-slate-500">
                Configure telemetry and content parameters for the selected module.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <CourseEditor courseId={editCourseId || undefined} onSuccess={() => { setIsCreateDialogOpen(false); setEditCourseId(null); }} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}