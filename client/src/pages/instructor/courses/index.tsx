import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  BookOpen, Users, Edit, Eye, Trash2, Plus, Search, Filter,
  Calendar, TrendingUp, Play, ExternalLink, FileText, Award, Clock,Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function InstructorCoursesPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [previewCourse, setPreviewCourse] = useState<any>(null);

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["/api/instructor/courses"],
  });

  const filteredCourses = courses.filter((course: any) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || course.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const CourseCard = ({ course }: { course: any }) => {
    return (
      <div className="group relative bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden transition-all duration-300 hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(225,29,72,0.1)]">
        {/* Course Status Top Bar */}
        <div className={`h-1 w-full ${course.status === 'published' ? 'bg-red-600' : 'bg-zinc-700'}`} />
        
        <div className="p-5">
          <div className="flex justify-between items-start mb-4">
            <Badge className={`${
              course.status === 'published' 
              ? 'bg-red-500/10 text-red-500 border-red-500/20' 
              : 'bg-zinc-800 text-zinc-400 border-zinc-700'
            } border uppercase text-[10px] tracking-widest font-bold`}>
              {course.status}
            </Badge>
            <div className="flex gap-2 text-zinc-500">
               <Users className="h-4 w-4" />
               <span className="text-xs font-medium">{course.enrolledCount || 0}</span>
            </div>
          </div>

          <h3 className="text-lg font-bold text-zinc-100 group-hover:text-red-500 transition-colors line-clamp-1">
            {course.title}
          </h3>
          <p className="text-zinc-500 text-sm mt-2 line-clamp-2 h-10">
            {course.description}
          </p>

          <div className="grid grid-cols-2 gap-4 mt-6 border-t border-zinc-800 pt-4">
            <div className="flex items-center gap-2 text-zinc-400">
              <BookOpen className="h-4 w-4 text-red-500/70" />
              <span className="text-xs">{course.moduleCount || 0} Modules</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <Calendar className="h-4 w-4 text-red-500/70" />
              <span className="text-xs">{new Date(course.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <Button 
              onClick={() => setLocation(`/instructor/courses/${course.id}`)}
              className="flex-1 bg-zinc-100 text-black hover:bg-white font-bold text-xs"
            >
              <Eye className="h-3.5 w-3.5 mr-2" /> VIEW
            </Button>
            <Button 
              onClick={() => setLocation(`/instructor/courses/${course.id}/edit`)}
              variant="outline"
              className="flex-1 border-zinc-700 bg-transparent text-zinc-300 hover:bg-red-600 hover:text-white hover:border-red-600 font-bold text-xs"
            >
              <Edit className="h-3.5 w-3.5 mr-2" /> EDIT
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="animate-spin h-8 w-8 text-red-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 p-1">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter">
              Course <span className="text-red-600 underline decoration-red-600/30 underline-offset-8">Arsenal</span>
            </h1>
            <p className="text-zinc-500 mt-2 font-medium">Command and control your educational content.</p>
          </div>
          <Button 
            asChild 
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-6 rounded-none shadow-[4px_4px_0px_#450a0a]"
          >
            <Link href="/instructor/courses/create">
              <Plus className="h-5 w-5 mr-2 stroke-[3px]" /> CREATE NEW COURSE
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-4 mb-10">
          {[
            { label: "Active Courses", val: courses.length, icon: BookOpen },
            { label: "Reach", val: courses.reduce((acc: any, c: any) => acc + (c.enrolledCount || 0), 0), icon: Users },
            { label: "Avg Progress", val: "78%", icon: TrendingUp },
            { label: "Certificates", val: "124", icon: Award },
          ].map((stat, i) => (
            <div key={i} className="bg-zinc-900 border-l-4 border-red-600 p-4">
              <div className="flex justify-between items-center text-zinc-500 mb-1">
                <span className="text-[10px] uppercase font-bold tracking-widest">{stat.label}</span>
                <stat.icon className="h-4 w-4" />
              </div>
              <div className="text-2xl font-black">{stat.val}</div>
            </div>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 bg-zinc-900/50 p-4 rounded-lg border border-zinc-800">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 h-4 w-4" />
            <Input
              placeholder="FILTER BY COURSE NAME..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-zinc-950 border-zinc-800 focus:border-red-600 text-zinc-200 placeholder:text-zinc-700 rounded-md"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px] bg-zinc-950 border-zinc-800 text-zinc-400">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
              <SelectItem value="all">ALL COURSES</SelectItem>
              <SelectItem value="published">PUBLISHED</SelectItem>
              <SelectItem value="draft">DRAFTS</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Course Grid */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-transparent border-b border-zinc-800 w-full justify-start rounded-none h-auto p-0 mb-8">
            {["all", "published", "draft"].map((tab) => (
              <TabsTrigger 
                key={tab}
                value={tab} 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-red-600 data-[state=active]:bg-transparent data-[state=active]:text-red-500 py-3 px-6 text-xs font-bold uppercase tracking-widest text-zinc-500"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value="all" className="mt-0 outline-none">
            {filteredCourses.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredCourses.map((course: any) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-zinc-900/30 border-2 border-dashed border-zinc-800 rounded-2xl">
                <BookOpen className="h-12 w-12 text-zinc-800 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-zinc-500 uppercase tracking-tighter">No Intel Found</h3>
                <p className="text-zinc-600 text-sm mt-1">Try adjusting your filters or search terms.</p>
              </div>
            )}
          </TabsContent>
          {/* ... Add other TabsContent similarly ... */}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}