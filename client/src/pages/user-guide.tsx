import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { 
  GraduationCap, CheckCircle, Star, Download, 
  AlertCircle, ArrowLeft, Layout, BookOpen
} from "lucide-react";

const GUIDE_DATA = {
  gettingStarted: [
    {
      title: "Creating Your Account",
      description: "Step-by-step account setup process",
      steps: ["Click 'Student Registration' on the homepage", "Fill in personal info", "Select education level", "Confirm your email"],
      tips: ["Use a strong password with symbols", "Check spam for your verification link"]
    },
    {
      title: "Dashboard Overview",
      description: "Understanding your learning workspace",
      steps: ["Track active courses", "Monitor progress percentages", "View earned badges", "Access recent materials"],
      tips: ["The dashboard syncs across all devices", "Pin your current goal to the top"]
    }
  ],
  courses: [
    {
      title: "The Learning Experience",
      description: "Mastering course navigation",
      steps: ["Engage with audio-first modules", "Follow the sequential learning path", "Download resources for offline study", "Mark lessons as complete"],
      tips: ["Use the 'Resume' button to pick up where you left off", "Active note-taking increases retention"]
    }
  ],
  troubleshooting: [
    {
      title: "Platform Performance",
      solutions: ["Clear browser cache & cookies", "Update to latest Chrome/Safari", "Disable conflicting extensions", "Check network bandwidth"]
    },
    {
      title: "Login Issues",
      solutions: ["Use the 'Forgot Password' link", "Ensure Caps Lock is off", "Verify the email address is correct", "Try a different browser"]
    }
  ]
};

export default function UserGuide() {
  const [activeTab, setActiveTab] = useState("getting-started");

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Cyan & Navy Hero Header */}
      <div className="bg-[#0F172A] border-b-4 border-cyan-500 py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <Link href="/dashboard" className="inline-flex items-center text-cyan-400 hover:text-cyan-300 text-sm font-medium mb-6 transition-colors group">
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to Dashboard
          </Link>
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              User Documentation
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
              Essential instructions to help you navigate your learning journey with Meeting Matters.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-12">
        <Tabs defaultValue="getting-started" className="space-y-10" onValueChange={setActiveTab}>
          {/* Cyan Navigation Bar */}
          <div className="flex justify-center">
            <TabsList className="bg-slate-200/50 p-1 h-12 rounded-xl w-full max-w-md grid grid-cols-3 border border-slate-200">
              <TabsTrigger value="getting-started" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-cyan-600 data-[state=active]:shadow-sm">Basics</TabsTrigger>
              <TabsTrigger value="courses" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-cyan-600 data-[state=active]:shadow-sm">Courses</TabsTrigger>
              <TabsTrigger value="troubleshooting" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-cyan-600 data-[state=active]:shadow-sm">Help</TabsTrigger>
            </TabsList>
          </div>

          {/* TAB CONTENT: BASICS */}
          <TabsContent value="getting-started" className="animate-in fade-in slide-in-from-bottom-3 duration-500">
            <div className="grid md:grid-cols-2 gap-6">
              {GUIDE_DATA.gettingStarted.map((guide, i) => (
                <Card key={i} className="border-slate-200 bg-white hover:border-cyan-200 transition-all duration-300 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                  <CardHeader className="bg-slate-50/50 pb-6 border-b border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-xl bg-cyan-50 flex items-center justify-center">
                        <Layout className="h-5 w-5 text-cyan-600" />
                      </div>
                      <Badge variant="outline" className="text-cyan-600 border-cyan-100 bg-cyan-50/30">Step {i + 1}</Badge>
                    </div>
                    <CardTitle className="text-xl text-slate-900 leading-tight">{guide.title}</CardTitle>
                    <CardDescription>{guide.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4 flex-grow">
                    {guide.steps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle className="h-4 w-4 text-cyan-500 mt-0.5 shrink-0" />
                        <p className="text-sm text-slate-600 leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </CardContent>
                  <CardFooter className="bg-cyan-50/20 border-t border-cyan-50 p-4">
                    <p className="text-xs text-slate-500 flex items-center">
                      <Star className="h-3.5 w-3.5 mr-2 text-cyan-600 fill-cyan-600 shrink-0" />
                      <span className="font-bold text-cyan-700 mr-1 shrink-0">Tip:</span> {guide.tips[0]}
                    </p>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* TAB CONTENT: COURSES */}
          <TabsContent value="courses" className="animate-in fade-in duration-500">
             <div className="max-w-2xl mx-auto">
                {GUIDE_DATA.courses.map((guide, i) => (
                  <Card key={i} className="rounded-2xl border-slate-200 overflow-hidden shadow-sm">
                    <CardHeader className="bg-slate-900 text-white py-8">
                      <CardTitle className="flex items-center gap-2 text-2xl">
                        <GraduationCap className="h-6 w-6 text-cyan-400" /> {guide.title}
                      </CardTitle>
                      <CardDescription className="text-slate-400">{guide.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8">
                      <div className="space-y-4">
                        {guide.steps.map((step, idx) => (
                          <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 transition-colors hover:bg-white hover:border-cyan-100">
                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center text-sm font-bold">
                              {idx + 1}
                            </span>
                            <span className="text-sm text-slate-700 font-medium">{step}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
             </div>
          </TabsContent>

          {/* TAB CONTENT: TROUBLESHOOTING */}
          <TabsContent value="troubleshooting" className="animate-in fade-in duration-500 max-w-2xl mx-auto">
             <div className="space-y-4">
                {GUIDE_DATA.troubleshooting.map((item, i) => (
                  <Accordion key={i} type="single" collapsible className="bg-white border-2 border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                    <AccordionItem value={`item-${i}`} className="border-none">
                      <AccordionTrigger className="px-6 hover:no-underline hover:bg-slate-50/50 py-6">
                        <div className="flex items-center gap-4">
                          <div className="h-8 w-8 rounded-lg bg-rose-50 flex items-center justify-center">
                            <AlertCircle className="h-5 w-5 text-rose-500" />
                          </div>
                          <span className="font-bold text-slate-900">{item.title}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-6 pt-2">
                        <div className="grid grid-cols-1 gap-2">
                          {item.solutions.map((sol, idx) => (
                            <div key={idx} className="p-3 text-sm text-slate-600 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-cyan-500" /> {sol}
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                ))}
             </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modern Footer */}
      <footer className="mt-20 py-12 border-t border-slate-200 bg-white">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6 max-w-4xl">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-cyan-600 flex items-center justify-center font-bold text-white text-xs">MM</div>
            <span className="font-bold text-slate-900 tracking-tight text-lg underline decoration-cyan-500 underline-offset-4">Meeting Matters</span>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" size="sm" className="rounded-full border-slate-200 text-slate-600 hover:border-cyan-500 hover:text-cyan-600">
             
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}