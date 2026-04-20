import { useState } from "react";
import { Link } from "wouter";
import TourInterface from "@/components/onboarding/tour-interface";
import { AdminHeader } from "@/components/layouts/AdminHeader";
import { useAuth } from "@/hooks/useAuth";
import { useAdminDashboardData } from "@/hooks/use-dashboard-data";
import { Redirect } from "@/components/ui/redirect";
import { 
  Users, 
  BookOpen, 
  Search, 
  PlusCircle, 
  Shield, 
  TrendingUp, 
  Award, 
  BookMarked, 
  Zap, 
  Inbox 
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

// ─── THE UNIFIED VISUAL ENGINE ──────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@800&family=Inter:wght@400;700;900&display=swap');

  :root {
    --syne: 'Syne', sans-serif;
    --inter: 'Inter', sans-serif;
  }

  .admin-root {
    font-family: var(--inter);
    background-color: #030407;
  }

  /* VIDEO ENGINE - SHARED ACROSS ALL PAGES */
  .video-canvas {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
  }

  .video-canvas video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.35;
    filter: grayscale(0.2) brightness(0.7);
  }

  .video-vignette {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at center, transparent 20%, #030407 100%);
    z-index: 1;
  }

  .syne-title {
    font-family: var(--syne) !important;
    text-transform: uppercase;
    font-weight: 800;
    letter-spacing: -0.06em;
    line-height: 0.8;
    color: white;
  }

  .stat-val {
    font-family: var(--syne) !important;
    font-weight: 800;
    letter-spacing: -0.04em;
  }

  /* NEON GLASS SYSTEM */
  .neon-card {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(25px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .neon-card:hover {
    border-color: rgba(59, 130, 246, 0.4);
    background: rgba(255, 255, 255, 0.06);
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
  }
`;

const RoleBadge = ({ role }: { role: string }) => {
  const styles: Record<string, string> = {
    admin: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    instructor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    learner: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  };
  return (
    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${styles[role] || styles.learner}`}>
      {role}
    </span>
  );
};

export default function AdminDashboardPage() {
  const { isAuthenticated, user, isLoading: isAuthLoading } = useAuth();
  const { users: allUsers, stats, coursesWithStats } = useAdminDashboardData();
  const [searchQuery, setSearchQuery] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("users");
  const [showTour, setShowTour] = useState(false);

  if (isAuthLoading) return null;
  if (!isAuthenticated || user?.role !== "admin") return <Redirect to="/login" />;

  const filteredUsers = (allUsers || []).filter(u => {
    const matchesSearch = `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = userRoleFilter === "all" || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="admin-root relative min-h-screen w-full overflow-x-hidden text-slate-200">
      <style>{styles}</style>

      {/* SHARED VIDEO BACKGROUND */}
      <div className="video-canvas">
        <div className="video-vignette" />
        <video autoPlay loop muted playsInline className="w-full h-full">
          <source src="https://assets.mixkit.co/videos/preview/mixkit-abstract-technology-loop-with-blue-lights-30247-large.mp4" type="video/mp4" />
        </video>
      </div>

      <div className="relative z-10">
        <AdminHeader />

        <main className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
          
          {/* HEADER SECTION */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20">
            <div className="space-y-6 max-w-2xl">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full backdrop-blur-md">
                <Shield size={16} className="text-blue-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-300">Command Center</span>
              </div>
              <h1 className="syne-title text-6xl lg:text-8xl">
                Meeting<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-violet-400 to-pink-400">Matters</span>
              </h1>
            </div>
            
            <button 
              onClick={() => setShowTour(true)}
              className="group flex items-center self-start lg:self-end gap-3 bg-white text-black px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:bg-blue-400 hover:-rotate-2 active:scale-95"
            >
              <Zap size={18} className="fill-black group-hover:animate-bounce" />
              Initialize Tour
            </button>
          </div>

          {/* STATS GRID - "undefined" fix applied to the Success Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              { label: "Personnel", val: stats?.totalUsers || 0, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
              { label: "Assets", val: stats?.totalCourses || 0, icon: BookOpen, color: "text-emerald-400", bg: "bg-emerald-500/10" },
              { label: "Links", val: stats?.totalEnrollments || 0, icon: TrendingUp, color: "text-violet-400", bg: "bg-violet-500/10" },
              { label: "Success", val: `${stats?.overallCompletionRate ?? 0}%`, icon: Award, color: "text-amber-400", bg: "bg-amber-500/10" },
            ].map((s, i) => (
              <div key={i} className="neon-card p-8 rounded-[2.5rem] flex flex-col justify-between h-64 overflow-hidden">
                <div className={`p-4 w-fit rounded-2xl border border-white/5 ${s.bg} ${s.color}`}>
                  <s.icon size={28} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">{s.label}</p>
                  <h2 className="stat-val text-5xl text-white tracking-tighter truncate leading-none">
                    {s.val}
                  </h2>
                </div>
              </div>
            ))}
          </div>

          {/* MANAGEMENT CENTER - Fully Transparent Glass */}
          <div className="neon-card rounded-[3rem] overflow-hidden border-white/5 bg-black/20">
            <div className="flex bg-white/[0.02] border-b border-white/5">
              {['users', 'courses'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-8 text-[11px] font-black uppercase tracking-[0.4em] transition-all ${activeTab === tab ? 'text-blue-400 bg-blue-500/5 shadow-[inset_0_-2px_0_0_#3b82f6]' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {tab === 'users' ? 'Global Personnel' : 'Active Repository'}
                </button>
              ))}
            </div>

            <div className="p-8 lg:p-12">
              {activeTab === 'users' ? (
                <div className="space-y-10">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                      <input 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 pl-16 pr-6 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-600"
                        placeholder="SEARCH DIRECTORY..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
                      <SelectTrigger className="w-full md:w-[240px] h-[72px] bg-white/5 border-white/10 rounded-2xl font-black text-[10px] tracking-widest uppercase text-white">
                        <SelectValue placeholder="Clearance" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#030407]/90 backdrop-blur-xl border-white/10 text-white">
                        <SelectItem value="all">Global Access</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="instructor">Instructor</SelectItem>
                        <SelectItem value="learner">Learner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-4">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.slice(0, 8).map((u) => (
                        <div key={u.id} className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/5 transition-all group">
                          <div className="flex items-center gap-6">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black group-hover:bg-blue-500 group-hover:text-white transition-all">
                              {u.firstName?.[0] || 'U'}
                            </div>
                            <div>
                              <p className="font-black text-white uppercase tracking-tight">{u.firstName} {u.lastName}</p>
                              <p className="text-[10px] font-bold text-slate-500 tracking-widest">{u.email}</p>
                            </div>
                          </div>
                          <RoleBadge role={u.role} />
                        </div>
                      ))
                    ) : (
                      <div className="py-20 text-center opacity-20">
                        <Inbox size={48} className="mx-auto mb-4" />
                        <p className="font-black tracking-[0.5em] text-xs">NO DATA DETECTED</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="syne-title text-3xl">Asset Management</h2>
                    <Link href="/admin/courses">
                      <button className="flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">
                        <PlusCircle size={18} /> Deploy Asset
                      </button>
                    </Link>
                  </div>
                  <div className="grid gap-4">
                    {(coursesWithStats || []).slice(0, 5).map((course) => (
                      <div key={course.id} className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center justify-between hover:bg-white/5 transition-all">
                        <div className="flex items-center gap-8">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <BookMarked size={28} className="text-white" />
                          </div>
                          <div>
                            <h4 className="font-black text-white uppercase text-lg">{course.title}</h4>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Status: {course.status}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="stat-val text-3xl text-white leading-none">{course.enrolledCount}</p>
                          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Enrollments</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <TourInterface isOpen={showTour} onClose={() => setShowTour(false)} />
    </div>
  );
}