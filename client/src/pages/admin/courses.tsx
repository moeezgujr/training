import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { AdminHeader } from "@/components/layouts/AdminHeader";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { formatCurrency } from "@/lib/currency";
import { type SupportedCurrency } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  BookOpen, 
  Search, 
  Plus, 
  Edit, 
  Eye,
  Trash2,
  MoreVertical,
  Layers,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminCoursesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<any>(null);

  const glassCard = "bg-slate-950/40 backdrop-blur-md border-white/5 hover:border-blue-500/30 transition-all duration-300 shadow-2xl group";
  const labelStyle = "text-[10px] font-black uppercase tracking-widest text-white/40";

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["/api/admin/courses"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const response = await apiRequest("DELETE", `/api/admin/courses/${courseId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses"] });
      toast({ title: "Sector Purged", description: "Course data has been wiped from the mainframe." });
      setDeleteDialogOpen(false);
      setCourseToDelete(null);
    },
    onError: (error: any) => {
      toast({ title: "Purge Failed", description: error.message, variant: "destructive" });
    },
  });

  const filteredCourses = Array.isArray(courses) 
    ? courses.filter((course) => {
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             course.instructorName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || course.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
    : [];

  if (!user || user.role !== "admin") return <div className="text-white p-8">ACCESS_DENIED</div>;

  return (
    <div className="min-h-screen bg-transparent">
      <AdminHeader />
      
      <div className="container py-12 px-4 max-w-7xl mx-auto">
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white syne-font">
              Course_Registry
            </h1>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-2">
              System Administration // Content Management
            </p>
          </div>
          <Button 
            className="bg-blue-600 hover:bg-blue-500 rounded-none font-black uppercase tracking-widest px-8 shadow-[0_0_20px_rgba(37,99,235,0.2)]"
            onClick={() => setLocation('/admin/add-course')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Initialize New Sector
          </Button>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-4 mb-10 p-2 bg-white/5 border border-white/5 backdrop-blur-sm">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 h-4 w-4" />
            <Input
              placeholder="SEARCH_BY_TITLE_OR_ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-white placeholder:text-white/10 focus-visible:ring-0 uppercase font-bold text-xs"
            />
          </div>
          <div className="h-8 w-[1px] bg-white/10 hidden md:block" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 bg-transparent border-none text-white uppercase font-black text-[10px] tracking-widest focus:ring-0">
              <SelectValue placeholder="STATUS_ALL" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/10 text-white rounded-none">
              <SelectItem value="all">STATUS_ALL</SelectItem>
              <SelectItem value="published">LIVE_STATUS</SelectItem>
              <SelectItem value="draft">DRAFT_MODE</SelectItem>
              <SelectItem value="archived">ARCHIVED_DATA</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <div className="animate-spin w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full mb-4" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Syncing Registry...</span>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {filteredCourses.map((course) => (
              <Card key={course.id} className={cn(glassCard, "flex flex-col")}>
                <CardHeader className="relative">
                  <div className="absolute top-6 right-6">
                    <Badge className={cn(
                      "rounded-none font-black text-[9px] tracking-tighter uppercase px-2",
                      course.status === 'published' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 
                      course.status === 'draft' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 
                      'bg-white/5 text-white/40 border-white/10'
                    )}>
                      {course.status}
                    </Badge>
                  </div>
                  <div className="w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:border-blue-500/50 transition-colors">
                    <BookOpen className="h-5 w-5 text-blue-500" />
                  </div>
                  <CardTitle className="text-white uppercase font-black tracking-tight text-xl leading-tight mb-2">
                    {course.title}
                  </CardTitle>
                  <CardDescription className="text-white/40 text-xs line-clamp-2 italic">
                    {course.description || "NO_DESCRIPTION_LOGGED"}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  <div className="space-y-3 py-4 border-y border-white/5">
                    <div className="flex justify-between items-center">
                      <span className={labelStyle}>Instructor</span>
                      <span className="text-xs font-bold text-white">DR. NAUSHAD ANJUM</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={labelStyle}>Core Modules</span>
                      <span className="text-xs font-mono text-blue-400">{course.moduleCount || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={labelStyle}>Enrollment</span>
                      <div className="flex items-center gap-2">
                         <Activity className="h-3 w-3 text-emerald-500" />
                         <span className="text-xs font-mono text-white">{course.enrolledCount || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-6">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex-1 bg-white/5 hover:bg-white/10 text-white rounded-none border border-white/5 text-[10px] font-black uppercase"
                      onClick={() => setLocation(`/admin/courses/${course.id}/view`)}
                    >
                      <Eye className="h-3 w-3 mr-2 text-blue-500" />
                      Manifest
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex-1 bg-white/5 hover:bg-white/10 text-white rounded-none border border-white/5 text-[10px] font-black uppercase"
                      onClick={() => setLocation(`/admin/courses/${course.id}/edit`)}
                    >
                      <Edit className="h-3 w-3 mr-2 text-purple-500" />
                      Adjust
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="bg-white/5 border border-white/5 rounded-none">
                          <MoreVertical className="h-4 w-4 text-white/40" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-slate-900 border-white/10 text-white rounded-none">
                        <DropdownMenuItem 
                          onClick={() => { setCourseToDelete(course); setDeleteDialogOpen(true); }}
                          className="text-red-500 focus:text-red-400 focus:bg-red-500/10 cursor-pointer font-black text-[10px] uppercase"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Purge Data
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredCourses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 border border-dashed border-white/10 bg-white/[0.02]">
            <Layers className="h-12 w-12 text-white/10 mb-4" />
            <h3 className="text-sm font-black text-white uppercase tracking-widest">No Signals Found</h3>
            <p className="text-white/20 text-[10px] mt-2 font-bold uppercase tracking-widest italic">
              Registry is currently empty or filters are too restrictive.
            </p>
          </div>
        )}

        {/* Delete Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="bg-slate-950 border-red-500/50 rounded-none text-white">
            <AlertDialogHeader>
              <AlertDialogTitle className="syne-font font-black uppercase text-xl text-red-500">Confirm Data Purge?</AlertDialogTitle>
              <AlertDialogDescription className="text-white/60 text-xs leading-relaxed italic">
                Deleting "{courseToDelete?.title}" will permanently erase all neural progress, module assets, and student logs from the central mainframe.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-6">
              <AlertDialogCancel className="bg-white/5 border-white/10 text-white rounded-none hover:bg-white/10">Abort</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => courseToDelete && deleteMutation.mutate(courseToDelete.id)}
                disabled={deleteMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white rounded-none font-black uppercase tracking-widest px-8"
              >
                {deleteMutation.isPending ? "PURGING..." : "PURGE_SECTOR"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}