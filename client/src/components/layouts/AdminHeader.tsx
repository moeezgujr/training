import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  User,
  LogOut,
  ChevronDown,
  CreditCard,
  UserCheck,
  Award,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Removed: Content Library, Analytics, Coupons, Communications, Tour Management, Settings
const navigationItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    description: "Overview and statistics",
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
    description: "Manage students and instructors",
  },
  {
    title: "Courses",
    href: "/admin/courses",
    icon: BookOpen,
    description: "Course management and creation",
  },
  {
    title: "Enrollments",
    href: "/admin/enrollments",
    icon: UserCheck,
    description: "Control student course enrollments",
  },
  {
    title: "Payments",
    href: "/admin/payments",
    icon: DollarSign,
    description: "Payment transactions and management",
  },
  {
    title: "Certificates",
    href: "/admin/certificates",
    icon: Award,
    description: "Manage course completion certificates",
  },
  {
    title: "Payment Settings",
    href: "/admin/payment-settings",
    icon: CreditCard,
    description: "Configure Pakistani payment methods",
  },
];

export function AdminHeader() {
  const { user } = useAuth();
  const [location] = useLocation();

  const currentPage = navigationItems.find(item => item.href === location);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-transparent backdrop-blur-md">
      <div className="container flex h-20 items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-6">
          <Link href="/admin">
            <div className="flex items-center space-x-3 cursor-pointer group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] group-hover:scale-110 transition-transform">
                <GraduationCap className="h-6 w-6" />
              </div>
              <span className="font-bold text-xl tracking-tighter uppercase syne-font text-white">
                Meeting Matters <span className="text-blue-500">LMS</span>
              </span>
            </div>
          </Link>
          
          {currentPage && (
            <div className="hidden md:flex items-center space-x-2 text-white/30">
              <span className="text-xl font-thin">/</span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">{currentPage.title}</span>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <div className="hidden lg:flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 text-white/70 hover:text-white hover:bg-white/5 rounded-full px-5">
                <LayoutDashboard className="h-4 w-4 mr-2 text-blue-400" />
                <span className="text-xs font-bold uppercase tracking-wider">Main Hub</span>
                <ChevronDown className="h-4 w-4 ml-2 opacity-30" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 bg-slate-900/95 border-white/10 text-white backdrop-blur-xl" align="start">
              {/* Shows Dashboard, Users, Courses */}
              {navigationItems.slice(0, 3).map((item) => (
                <DropdownMenuItem key={item.href} asChild className="focus:bg-blue-600/20 focus:text-blue-400 cursor-pointer p-3">
                  <Link href={item.href} className="w-full flex items-center">
                    <item.icon className="h-4 w-4 mr-3 opacity-70" />
                    <div>
                      <div className="font-bold text-xs uppercase tracking-tight">{item.title}</div>
                      <div className="text-[10px] opacity-50">{item.description}</div>
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 text-white/70 hover:text-white hover:bg-white/5 rounded-full px-5">
                <CreditCard className="h-4 w-4 mr-2 text-blue-400" />
                <span className="text-xs font-bold uppercase tracking-wider">Operations</span>
                <ChevronDown className="h-4 w-4 ml-2 opacity-30" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 bg-slate-900/95 border-white/10 text-white backdrop-blur-xl" align="start">
              {/* Shows Enrollments, Payments, Certificates, Payment Settings */}
              {navigationItems.slice(3).map((item) => (
                <DropdownMenuItem key={item.href} asChild className="focus:bg-blue-600/20 focus:text-blue-400 cursor-pointer p-3">
                  <Link href={item.href} className="w-full flex items-center">
                    <item.icon className="h-4 w-4 mr-3 opacity-70" />
                    <div>
                      <div className="font-bold text-xs uppercase tracking-tight">{item.title}</div>
                      <div className="text-[10px] opacity-50">{item.description}</div>
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* User Menu */}
        <div className="flex items-center space-x-4">
          <div className="h-8 w-[1px] bg-white/10 hidden sm:block" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-xl bg-white/5 border border-white/10 p-0 overflow-hidden hover:bg-white/10 transition-all">
                <div className="flex h-full w-full items-center justify-center text-blue-400">
                  <User className="h-5 w-5" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 bg-slate-900/95 border-white/10 text-white backdrop-blur-xl" align="end">
              <div className="flex items-center gap-3 p-4 bg-white/5">
                <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center font-black">
                  {user?.firstName?.[0] || 'A'}
                </div>
                <div className="flex flex-col space-y-0.5">
                  <p className="font-bold text-sm tracking-tight">
                    {user?.firstName || 'Admin'}
                  </p>
                  <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                    Superuser
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator className="bg-white/5" />
              
              <Link href="/student-dashboard">
                <DropdownMenuItem className="cursor-pointer p-3 focus:bg-white/5">
                  <BookOpen className="mr-3 h-4 w-4 text-blue-400" />
                  <span className="text-xs font-bold uppercase">Learner View</span>
                </DropdownMenuItem>
              </Link>
              
              <DropdownMenuSeparator className="bg-white/5" />
              
              <DropdownMenuItem
                className="cursor-pointer p-3 text-red-400 focus:bg-red-500/10 focus:text-red-400"
                onClick={() => window.location.href = '/api/logout'}
              >
                <LogOut className="mr-3 h-4 w-4" />
                <span className="text-xs font-bold uppercase">Disconnect</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}