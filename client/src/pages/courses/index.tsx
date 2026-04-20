import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CourseCard } from "@/components/course/course-card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  ChevronRight, 
  Activity, 
  Target, 
  Cpu, 
  Compass,
  Zap,
  FilterX
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["/api/courses"],
  });

  // Extract unique tags for the "Quick Filter" rail
  const allTags = Array.from(new Set(courses.flatMap((c: any) => c.tags || []))).sort();

  const filteredCourses = courses.filter((course: any) => {
    const matchesSearch = !searchQuery || 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !activeTag || course.tags?.includes(activeTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 selection:bg-cyan-500/30 overflow-x-hidden">
      {/* ATMOSPHERIC BACKGROUND ELEMENTS */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-cyan-600/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50 contrast-150" />
      </div>

      <div className="relative z-10 container max-w-7xl mx-auto px-6 py-20">
        
        {/* HERO HEADER */}
        <div className="flex flex-col mb-20 space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-[1px] w-12 bg-cyan-500/50" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-cyan-500">Available Intel</span>
          </div>
          <h1 className="text-7xl md:text-9xl font-black italic uppercase tracking-tighter leading-[0.8] mix-blend-plus-lighter">
            Explore <span className="text-white/20 outline-text">Modules</span>
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl font-medium tracking-tight leading-relaxed">
            Initialize your learning sequence by selecting a specialized module. 
            Filtered by <span className="text-cyan-400">Neural Tags</span> for precision delivery.
          </p>
        </div>

        {/* SEARCH & FILTER HUD */}
        <div className="sticky top-8 z-50 mb-16 group">
          <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-2xl transition-all group-hover:border-cyan-500/30" />
          <div className="relative p-3 flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              <input
                type="text"
                placeholder="Query database for modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-16 bg-transparent pl-16 pr-6 text-xl font-bold italic uppercase tracking-tight focus:outline-none placeholder:text-slate-700"
              />
            </div>
            <div className="flex items-center gap-2 pr-4 h-16">
              <div className="h-8 w-[1px] bg-white/10 hidden md:block mx-4" />
              <Button 
                variant="ghost" 
                onClick={() => {setSearchQuery(""); setActiveTag(null)}}
                className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-400"
              >
                <FilterX className="h-4 w-4 mr-2" /> Reset
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* SIDEBAR MONITOR */}
          <aside className="lg:w-72 shrink-0 space-y-12">
            <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-8 backdrop-blur-sm">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <span>Neural Filter</span>
                  <Activity className="h-3 w-3 text-cyan-500" />
                </div>
                <div className="h-[2px] w-full bg-gradient-to-r from-cyan-500/50 to-transparent" />
              </div>

              <div className="flex flex-wrap lg:flex-col gap-3">
                <button 
                  onClick={() => setActiveTag(null)}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-xl border text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                    !activeTag ? "bg-cyan-500 border-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)]" : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
                  )}
                >
                  All Sequences <Compass className="h-3 w-3" />
                </button>
                {allTags.map(tag => (
                  <button 
                    key={tag}
                    onClick={() => setActiveTag(tag)}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-xl border text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                      activeTag === tag ? "bg-cyan-500 border-cyan-500 text-black" : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:border-white/20"
                    )}
                  >
                    {tag} <ChevronRight className={cn("h-3 w-3 opacity-50", activeTag === tag && "rotate-90 opacity-100")} />
                  </button>
                ))}
              </div>

              <div className="pt-8 border-t border-white/5">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/40">
                  <div className="h-10 w-10 rounded-full bg-cyan-500/10 flex items-center justify-center">
                    <Cpu className="h-5 w-5 text-cyan-500" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase text-slate-500">System Load</p>
                    <p className="text-xs font-bold text-white">OPTIMIZED</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* DYNAMIC CONTENT GRID */}
          <main className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[1, 2, 4, 5].map(i => <Skeleton key={i} className="h-96 w-full rounded-[3rem] bg-white/5" />)}
              </div>
            ) : filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                {filteredCourses.map((course: any) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-40 border-2 border-dashed border-white/5 rounded-[4rem] bg-white/[0.01]">
                <Target className="h-16 w-16 text-slate-800 mb-6 animate-pulse" />
                <h3 className="text-2xl font-black uppercase italic text-slate-600">Zero Matches Found</h3>
                <p className="text-slate-500 text-sm mt-2">The requested sequence is not in the active database.</p>
              </div>
            )}
          </main>
        </div>
      </div>

      <style jsx>{`
        .outline-text {
          -webkit-text-stroke: 1px rgba(255,255,255,0.1);
        }
      `}</style>
    </div>
  );
}