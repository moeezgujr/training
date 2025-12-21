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
  Settings,
  BarChart3,
  FileText,
  HelpCircle,
  User,
  LogOut,
  ChevronDown,
  CreditCard,
  Tag,
  MessageSquare,
  FolderOpen,
  UserCheck,
  Award,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
    title: "Content Library",
    href: "/admin/content-library",
    icon: FolderOpen,
    description: "Manage learning resources and content",
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
    title: "Communications",
    href: "/admin/communications",
    icon: MessageSquare,
    description: "Send messages and notifications",
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    description: "Performance metrics and reports",
  },
  {
    title: "Coupons",
    href: "/admin/coupons",
    icon: Tag,
    description: "Manage discount coupons and promo codes",
  },
  {
    title: "Payment Settings",
    href: "/admin/payment-settings",
    icon: CreditCard,
    description: "Configure Pakistani payment methods",
  },
  {
    title: "Tour Management",
    href: "/admin/tour-management",
    icon: HelpCircle,
    description: "Manage onboarding tours and FAQs",
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
    description: "System configuration",
  },
];

export function AdminHeader() {
  const { user } = useAuth();
  const [location] = useLocation();

  const currentPage = navigationItems.find(item => item.href === location);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-4">
          <Link href="/admin">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <GraduationCap className="h-4 w-4" />
              </div>
              <span className="font-bold text-xl">Meeting Matters LMS</span>
            </div>
          </Link>
          
          {/* Page Indicator */}
          {currentPage && (
            <div className="hidden md:flex items-center space-x-2 text-muted-foreground">
              <span>/</span>
              <span className="text-sm font-medium">{currentPage.title}</span>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <div className="hidden lg:flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="start">
              {navigationItems.slice(0, 4).map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link href={item.href} className="w-full">
                    <item.icon className="h-4 w-4 mr-2" />
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9">
                <Settings className="h-4 w-4 mr-2" />
                Management
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="start">
              {navigationItems.slice(4).map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link href={item.href} className="w-full">
                    <item.icon className="h-4 w-4 mr-2" />
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Navigation */}
        <div className="flex lg:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Menu
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {navigationItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <DropdownMenuItem className={cn(
                    "cursor-pointer",
                    location === item.href && "bg-accent"
                  )}>
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.title}
                  </DropdownMenuItem>
                </Link>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* User Menu */}
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <User className="h-4 w-4" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium text-sm">
                    {user?.firstName || user?.email || 'Admin User'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user?.email || 'Administrator'}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <Link href="/student-dashboard">
                <DropdownMenuItem className="cursor-pointer">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Preview Learner Dashboard
                </DropdownMenuItem>
              </Link>
              <Link href="/admin/profile">
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
              </Link>
              <Link href="/admin/settings">
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => window.location.href = '/api/logout'}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}