import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  Award, 
  Users, 
  BarChart, 
  Settings, 
  ChevronRight, 
  Menu, 
  LogOut,
  UserCircle,
  NotebookPen,
  Bell,
  Search,
  FolderOpen,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navItems = (() => {
    const commonItems = [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Browse Courses", href: "/courses", icon: BookOpen },
      { name: "My Notes", href: "/notebook", icon: NotebookPen },
      { name: "Certificates", href: "/certificates", icon: Award },
    ];

    const instructorItems = [
      { name: "Overview", href: "/instructor", icon: TrendingUp },
      { name: "My Courses", href: "/instructor/courses", icon: GraduationCap },
      { name: "Students", href: "/student-monitoring", icon: Users },
      { name: "Analytics", href: "/instructor/analytics", icon: BarChart },
    ];

    const adminItems = [
      { name: "Admin Home", href: "/admin", icon: LayoutDashboard },
      { name: "User Management", href: "/admin/users", icon: Users },
      { name: "Course Library", href: "/admin/courses", icon: FolderOpen },
      { name: "Revenue", href: "/admin/payments", icon: DollarSign },
      { name: "Site Settings", href: "/admin/settings", icon: Settings },
    ];

    if (user?.role === "admin") return [...commonItems, { divider: true, label: "Administration" }, ...adminItems];
    if (user?.role === "instructor") return [...commonItems, { divider: true, label: "Instructor Tools" }, ...instructorItems];
    return commonItems;
  })();

  const renderNavItems = () => {
    return navItems.map((item: any, index) => {
      if (item.divider) {
        return (
          <li key={`divider-${index}`} className="px-6 mt-8 mb-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-900">
              {item.label}
            </span>
          </li>
        );
      }

      const isActive = location === item.href;

      return (
        <li key={item.href}>
          <Link href={item.href}>
            <a className={cn(
              "flex items-center gap-3 px-4 py-3 mx-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-300 group",
              isActive 
                ? "bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]" 
                : "text-zinc-500 hover:bg-red-950/20 hover:text-red-500"
            )}>
              <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "group-hover:text-red-500")} />
              <span>{item.name}</span>
              {isActive && <ChevronRight className="ml-auto h-3 w-3 opacity-100" />}
            </a>
          </Link>
        </li>
      );
    });
  };

  return (
    <div className="flex min-h-screen bg-[#000000] text-zinc-300 font-sans">
      {/* Custom Global Styles for the Red Theme */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #450a0a; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #dc2626; }
      `}} />

      {/* Desktop Sidebar */}
      <aside className="fixed top-0 bottom-0 left-0 hidden lg:flex lg:w-64 flex-col bg-zinc-950/50 border-r border-red-900/20 backdrop-blur-xl z-30">
        <div className="p-8 border-b border-red-900/20 flex items-center gap-3">
          <div className="h-10 w-10 bg-red-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.5)]">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="font-black text-white tracking-tighter text-xl uppercase italic">MM<span className="text-red-600">.INTEL</span></span>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 custom-scrollbar">
          <ul className="space-y-1">
            {renderNavItems()}
          </ul>
        </nav>

        <div className="p-4 border-t border-red-900/20 bg-black">
          <div className="flex items-center gap-3 p-3 rounded-xl border border-red-900/30 bg-red-950/10">
            <Avatar className="h-10 w-10 border-2 border-red-600 shadow-[0_0_10px_rgba(220,38,38,0.3)]">
              <AvatarFallback className="bg-zinc-900 text-red-500 font-black uppercase text-xs">
                {user?.firstName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-white truncate uppercase italic">{user?.firstName} {user?.lastName}</p>
              <p className="text-[10px] text-red-600 uppercase font-black tracking-widest">{user?.role}</p>
            </div>
            <a href="/api/logout" className="text-zinc-600 hover:text-red-500 transition-colors">
              <LogOut className="h-4 w-4" />
            </a>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 flex flex-col">
        <header className="sticky top-0 z-20 h-20 border-b border-red-900/20 bg-black/80 backdrop-blur-xl flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
             <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden text-red-600 hover:bg-red-950">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 bg-black border-red-900/30 p-0 text-white">
                  <div className="p-8 border-b border-red-900/30 font-black text-xl italic uppercase tracking-tighter">
                    MM<span className="text-red-600">.PORTAL</span>
                  </div>
                  <nav className="py-4">
                    <ul className="space-y-1">{renderNavItems()}</ul>
                  </nav>
                </SheetContent>
             </Sheet>
             
            <h1 className="hidden md:block text-[10px] font-black text-red-600 uppercase tracking-[0.4em] italic">
              Terminal // {location.split('/')[1] || 'Overview'}
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center relative group">
              <Search className="absolute left-3 h-4 w-4 text-zinc-600 group-focus-within:text-red-600 transition-colors" />
              <Input 
                placeholder="SYSTEM SEARCH..." 
                className="w-72 bg-zinc-950 border-red-900/20 h-10 pl-10 text-[10px] uppercase font-bold tracking-widest focus-visible:ring-red-600/50 focus:border-red-600"
              />
            </div>

            <Button variant="ghost" size="icon" className="relative text-zinc-500 hover:text-red-500 hover:bg-red-950/30">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_#dc2626]" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 hover:bg-transparent">
                  <Avatar className="h-9 w-9 border-2 border-zinc-800 hover:border-red-600 transition-all duration-300 ring-offset-black">
                    <AvatarFallback className="bg-red-950 text-red-500 text-[10px] font-black uppercase tracking-tighter">
                      {user?.firstName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-zinc-950 border-red-900/40 text-zinc-300 backdrop-blur-2xl">
                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-4 py-3">Control Center</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-red-900/20" />
                <DropdownMenuItem className="hover:bg-red-950/40 hover:text-white cursor-pointer py-3 font-bold uppercase text-[10px] tracking-widest" onClick={() => window.location.href = '/profile'}>
                  <UserCircle className="mr-3 h-4 w-4 text-red-600" /> Subject Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-red-950/40 hover:text-white cursor-pointer py-3 font-bold uppercase text-[10px] tracking-widest" onClick={() => window.location.href = '/settings'}>
                  <Settings className="mr-3 h-4 w-4 text-red-600" /> Matrix Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-red-900/20" />
                <DropdownMenuItem className="text-red-500 focus:text-white focus:bg-red-600 hover:bg-red-600 cursor-pointer py-3 font-black uppercase text-[10px] tracking-[0.2em]" onClick={() => window.location.href = '/api/logout'}>
                  <LogOut className="mr-3 h-4 w-4" /> Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;