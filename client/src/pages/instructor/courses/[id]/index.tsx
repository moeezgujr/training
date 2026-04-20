import { Link, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Redirect } from "@/components/ui/redirect";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Icons
import { 
  ChevronLeft, Clock, Users, BookOpen, CheckCircle, BarChart2, 
  Edit, Video, FileText, Play, Layers, Gift 
} from "lucide-react";

// --- SUB-COMPONENTS ---

const CourseHeader = ({ course, id }: { course: any, id: string }) => (
  <div className="mb-6">
    <Button variant="ghost" asChild className="mb-4">
      <Link href="/instructor">
        <ChevronLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Link>
    </Button>
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
          <Badge variant={course.status === "published" ? "default" : "secondary"}>
            {course.status}
          </Badge>
        </div>
        <p className="text-muted-foreground mt-1 max-w-2xl">
          {course.description}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/instructor/courses/${id}/edit`}>
            <Edit className="mr-2 h-4 w-4" /> Edit Course
          </Link>
        </Button>
      </div>
    </div>
  </div>
);

const StatCard = ({ title, value, subtext, icon: Icon }: any) => (
  <Card shadow-sm="true">
    <CardHeader className="p-4 pb-2">
      <CardDescription>{title}</CardDescription>
      <CardTitle className="text-2xl">{value}</CardTitle>
    </CardHeader>
    <CardContent className="p-4 pt-0">
      <p className="text-xs text-muted-foreground flex items-center">
        <Icon className="h-3 w-3 mr-1" /> {subtext}
      </p>
    </CardContent>
  </Card>
);

const ModuleItem = ({ module, index, courseId }: { module: any, index: number, courseId: string }) => (
  <AccordionItem key={module.id} value={module.id} className="border rounded-md mb-4 overflow-hidden bg-card">
    <AccordionTrigger className="px-4 py-3 hover:no-underline">
      <div className="flex items-center text-left">
        <div className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center mr-3 font-bold text-sm">
          {index + 1}
        </div>
        <div>
          <h3 className="font-medium">{module.title}</h3>
          <span className="text-xs text-muted-foreground">
             {module.content?.length || 0} Lessons
          </span>
        </div>
      </div>
    </AccordionTrigger>
    <AccordionContent className="px-4 pt-2 pb-4 space-y-2 border-t bg-muted/10">
      {module.content?.length > 0 ? (
        module.content.map((item: any) => (
          <div key={item.id} className="flex items-center justify-between p-3 border rounded-md bg-background shadow-sm">
            <div className="flex items-center gap-3">
              {item.type === 'video' ? <Video className="h-4 w-4 text-blue-500" /> : <FileText className="h-4 w-4 text-green-500" />}
              <span className="text-sm font-medium">{item.title}</span>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                <Link href={`/instructor/courses/${courseId}/modules/${module.id}/content/${item.id}`}>
                  <Edit className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        ))
      ) : (
        <p className="text-xs text-center text-muted-foreground py-4 italic">No content items found.</p>
      )}
    </AccordionContent>
  </AccordionItem>
);

// --- MAIN COMPONENT ---

export default function InstructorCourseView() {
  const { id } = useParams();
  const { isAuthenticated, user, isLoading: isAuthLoading } = useAuth();

  const { data: course, isLoading, error } = useQuery({
    queryKey: [`/api/courses/${id}`],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!id && !isAuthLoading && isAuthenticated,
  });

  if (isAuthLoading || isLoading) return <LoadingSkeleton />;
  if (error || !course) return <ErrorState />;
  
  if (course.instructorId !== user?.id) return <Redirect to="/instructor" />;

  return (
    <div className="container py-8 max-w-7xl">
      <CourseHeader course={course} id={id!} />

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Side */}
        <div className="lg:col-span-8 space-y-8">
          <div className="aspect-video rounded-xl overflow-hidden border bg-zinc-900 shadow-xl">
            {course.imageUrl ? (
              <img src={course.imageUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="h-20 w-20 text-zinc-700" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Students" value={course.enrolledCount || 0} subtext="Enrolled" icon={Users} />
            <StatCard title="Modules" value={course.moduleCount || 0} subtext="Total" icon={Layers} />
            <StatCard title="Completion" value={`${course.completionRate || 0}%`} subtext="Avg. Rate" icon={CheckCircle} />
            <StatCard title="Duration" value={course.duration ? `${Math.round(course.duration / 60)}h` : "N/A"} subtext="Course Length" icon={Clock} />
          </div>

          <Tabs defaultValue="content" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0 mb-6">
              <TabsTrigger value="content" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary px-6 py-3 font-semibold">Course Content</TabsTrigger>
              <TabsTrigger value="analytics" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary px-6 py-3 font-semibold">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="content">
              {course.modules?.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {course.modules.map((m: any, i: number) => (
                    <ModuleItem key={m.id} module={m} index={i} courseId={id!} />
                  ))}
                </Accordion>
              ) : (
                <Card className="p-12 text-center border-dashed">
                  <Layers className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground font-medium">No course content available yet.</p>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="analytics">
               <Card className="p-12 text-center border-dashed">
                  <BarChart2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground font-medium">Performance Metrics</p>
                  <p className="text-sm text-muted-foreground mt-1 text-center">Data is refreshed every 24 hours.</p>
               </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-primary text-primary-foreground shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Play className="h-5 w-5" /> Live Course
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full font-bold" asChild>
                <Link href={`/courses/${id}`}>View as Student</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Access</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <ActionButton icon={Users} label="Enrolled Students" href="/instructor/students" />
              <ActionButton icon={FileText} label="Manage Assignments" href="/instructor/assignments" />
              <ActionButton icon={Gift} label="Course Certificates" href="/instructor/certificates" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

const ActionButton = ({ icon: Icon, label, href }: any) => (
  <Button variant="ghost" className="w-full justify-start hover:bg-muted" asChild>
    <Link href={href}>
      <Icon className="mr-3 h-4 w-4" /> {label}
    </Link>
  </Button>
);

function LoadingSkeleton() {
  return (
    <div className="container py-8 space-y-6 max-w-7xl text-center">
      <Skeleton className="h-10 w-48 mx-auto sm:mx-0" />
      <Skeleton className="h-[400px] w-full rounded-xl" />
    </div>
  );
}

function ErrorState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h2 className="text-2xl font-bold">Unable to load course details.</h2>
      <Button className="mt-6 font-bold" asChild>
        <Link href="/instructor">Go Back</Link>
      </Button>
    </div>
  );
}