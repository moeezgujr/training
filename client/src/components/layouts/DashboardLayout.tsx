import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
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
  X, 
  LogOut,
  UserCircle,
  NotebookPen,
  Bell,
  Search,
  Plus,
  FileText,
  Calendar,
  MessageSquare,
  TrendingUp,
  Briefcase,
  HelpCircle,
  Tag,
  DollarSign,
  UserCheck,
  FolderOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
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
  const { user, isAuthenticated } = useAuth();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Close mobile menu when navigating
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Generate navigation items based on user role
  const getNavItems = () => {
    const commonItems = [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        badge: null
      },
      {
        name: "Browse Courses",
        href: "/courses",
        icon: BookOpen,
        badge: null
      },
      {
        name: "My Notes",
        href: "/notebook",
        icon: NotebookPen,
        badge: null
      },
      {
        name: "Certificates",
        href: "/certificates",
        icon: Award,
        badge: null
      },
      {
        name: "Profile",
        href: "/profile",
        icon: UserCircle,
        badge: null
      }
    ];

    const instructorItems = [
      {
        name: "Overview",
        href: "/instructor",
        icon: TrendingUp,
        badge: null
      },
      {
        name: "My Courses",
        href: "/instructor/courses",
        icon: GraduationCap,
        badge: null
      },
      {
        name: "Create Course",
        href: "/instructor/courses/create",
        icon: Plus,
        badge: "New"
      },
      {
        name: "Students",
        href: "/student-monitoring",
        icon: Users,
        badge: null
      },
      {
        name: "Analytics",
        href: "/instructor/analytics",
        icon: BarChart,
        badge: null
      },
      {
        name: "Messages",
        href: "/instructor/messages",
        icon: MessageSquare,
        badge: "3"
      },
      {
        name: "Schedule",
        href: "/instructor/schedule",
        icon: Calendar,
        badge: null
      }
    ];

    const adminItems = [
      {
        name: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
        badge: null
      },
      {
        name: "Users",
        href: "/admin/users",
        icon: Users,
        badge: null
      },
      {
        name: "Courses",
        href: "/admin/courses",
        icon: BookOpen,
        badge: null
      },
      {
        name: "Content Library",
        href: "/admin/content-library",
        icon: FolderOpen,
        badge: null
      },
      {
        name: "Enrollments",
        href: "/admin/enrollments",
        icon: UserCheck,
        badge: null
      },
      {
        name: "Payments",
        href: "/admin/payments",
        icon: DollarSign,
        badge: null
      },
      {
        name: "Coupons",
        href: "/admin/coupons",
        icon: Tag,
        badge: null
      },
      {
        name: "Pricing & Bundles",
        href: "/admin/pricing",
        icon: DollarSign,
        badge: null
      },
      {
        name: "Analytics",
        href: "/admin/analytics",
        icon: BarChart,
        badge: null
      },
      {
        name: "Certificates",
        href: "/admin/certificates",
        icon: Award,
        badge: null
      },
      {
        name: "Communications",
        href: "/admin/communications",
        icon: MessageSquare,
        badge: null
      },
      {
        name: "Payment Settings",
        href: "/admin/payment-settings",
        icon: DollarSign,
        badge: null
      },
      {
        name: "Tour Management",
        href: "/admin/tour-management",
        icon: HelpCircle,
        badge: null
      },
      {
        name: "Settings",
        href: "/admin/settings",
        icon: Settings,
        badge: null
      }
    ];

    if (user?.role === "admin") {
      return [...commonItems, { name: "Administration", href: "", icon: Briefcase, divider: true, badge: null } as any, ...adminItems];
    }

    if (user?.role === "instructor") {
      return [...commonItems, { name: "Teaching Tools", href: "", icon: Briefcase, divider: true, badge: null } as any, ...instructorItems];
    }

    return commonItems;
  };

  const navItems = getNavItems();



  const renderNavItems = () => {
    return navItems.map((item, index) => {
      if (item.divider) {
        return (
          <li key={`divider-${index}`} className="mt-8 mb-3">
            <div className="mx-3">
              <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {item.name}
              </p>
              <div className="h-px bg-gradient-to-r from-border to-transparent mt-3"></div>
            </div>
          </li>
        );
      }

      const isActive = location === item.href;

      return (
        <li key={item.href}>
          <Link href={item.href} asChild>
            <button 
              className={cn(
                "flex items-center gap-3 px-3 py-3 mx-2 rounded-lg text-sm font-medium group transition-all duration-200 relative w-full text-left",
                isActive 
                  ? "bg-primary/10 text-primary shadow-sm border border-primary/20" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {item.icon && (
                <item.icon 
                  className={cn(
                    "h-5 w-5 shrink-0",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )} 
                />
              )}
              <span className="flex-1">{item.name}</span>
              {item.badge && (
                <Badge 
                  variant={item.badge === "New" ? "default" : "secondary"} 
                  className="h-5 px-2 text-xs font-medium"
                >
                  {item.badge}
                </Badge>
              )}
              {isActive && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-l-full" />
              )}
            </button>
          </Link>
        </li>
      );
    });
  };

  const renderMobileNav = () => {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] pr-0">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between border-b py-4 px-4">
              <div className="flex items-center gap-2">
                <div className="rounded-md bg-primary/10 p-1">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-lg font-semibold">Meeting Matters LMS</h2>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsOpen(false)}
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Close menu</span>
              </Button>
            </div>

            <nav className="flex-1 overflow-auto py-4">
              <ul className="space-y-1 px-2">
                {renderNavItems()}
              </ul>
            </nav>

            {isAuthenticated && (
              <div className="border-t p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      {user?.profileImageUrl ? (
                        <AvatarImage 
                          src={user.profileImageUrl} 
                          alt={user?.firstName || "User"} 
                        />
                      ) : (
                        <AvatarFallback className="text-xs">
                          {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium line-clamp-1">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <a 
                    href="/api/logout" 
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <LogOut className="h-4 w-4" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    );
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="fixed top-0 bottom-0 left-0 hidden lg:flex lg:w-72 flex-col border-r bg-card/50 backdrop-blur-xl z-30">
        {/* Sidebar Header */}
        <div className="flex items-center gap-3 border-b py-6 px-6">
          <div className="rounded-xl bg-gradient-to-br from-primary to-primary/80 p-2 shadow-sm">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Meeting Matters</h2>
            <p className="text-xs text-muted-foreground font-medium">Learning Management System</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-auto py-6">
          <ul className="space-y-2 px-4">
            {renderNavItems()}
          </ul>
        </nav>

        {/* User Profile Section */}
        {isAuthenticated && (
          <div className="border-t bg-muted/30 p-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/50">
              <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                {user?.profileImageUrl ? (
                  <AvatarImage 
                    src={user.profileImageUrl} 
                    alt={user?.firstName || "User"} 
                  />
                ) : (
                  <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-primary/20 to-primary/10">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.role === 'instructor' ? 'Instructor' : user?.role === 'admin' ? 'Administrator' : 'Student'}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48" align="end">
                  <DropdownMenuItem onClick={() => window.location.href = '/profile'}>
                    <UserCircle className="mr-2 h-4 w-4" />
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => window.location.href = '/api/logout'}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72">
        {/* Modern Header */}
        <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
            {/* Mobile menu button */}
            <div className="lg:hidden">
              {renderMobileNav()}
            </div>

            {/* Mobile logo */}
            <div className="flex items-center gap-2 lg:hidden">
              <div className="rounded-md bg-primary/10 p-1">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-base font-semibold">Meeting Matters</h2>
            </div>

            {/* Desktop page title / breadcrumb */}
            <div className="hidden lg:flex items-center gap-2">
              <h1 className="text-xl font-semibold text-foreground">
                {user?.role === 'instructor' && location.startsWith('/instructor') 
                  ? 'Instructor Panel' 
                  : user?.role === 'admin' && location.startsWith('/admin')
                  ? 'Admin Panel'
                  : 'Dashboard'
                }
              </h1>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search courses, students, content..."
                  className="pl-10 pr-4 h-9 bg-muted/50 border-0 focus-visible:bg-background"
                />
              </div>
            </div>

            {/* Header Actions */}
            <div className="ml-auto flex items-center gap-2">
              {/* Quick Actions for Instructors */}
              {user?.role === 'instructor' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden lg:flex items-center gap-2"
                  onClick={() => window.location.href = '/instructor/courses/creator'}
                >
                  <Plus className="h-4 w-4" />
                  New Course
                </Button>
              )}

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="relative"
                    onClick={() => console.log("Notification button clicked!")}
                  >
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                      3
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80 z-[9999]" align="end" sideOffset={5}>
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    <Badge variant="secondary" className="text-xs">3 new</Badge>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <div className="max-h-64 overflow-y-auto">
                    <DropdownMenuItem className="flex-col items-start p-4 space-y-2 cursor-pointer">
                      <div className="flex items-start justify-between w-full">
                        <div className="flex-1">
                          <p className="text-sm font-medium">New course enrollment</p>
                          <p className="text-xs text-muted-foreground">Sarah Johnson enrolled in "Anxiety & Depression Management"</p>
                        </div>
                        <span className="text-xs text-muted-foreground">2m ago</span>
                      </div>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem className="flex-col items-start p-4 space-y-2 cursor-pointer">
                      <div className="flex items-start justify-between w-full">
                        <div className="flex-1">
                          <p className="text-sm font-medium">Assignment submitted</p>
                          <p className="text-xs text-muted-foreground">Mike Davis submitted "Module 3 Reflection Paper"</p>
                        </div>
                        <span className="text-xs text-muted-foreground">1h ago</span>
                      </div>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem className="flex-col items-start p-4 space-y-2 cursor-pointer">
                      <div className="flex items-start justify-between w-full">
                        <div className="flex-1">
                          <p className="text-sm font-medium">Course completion</p>
                          <p className="text-xs text-muted-foreground">Emily Chen completed "Introduction to Mindfulness"</p>
                        </div>
                        <span className="text-xs text-muted-foreground">3h ago</span>
                      </div>
                    </DropdownMenuItem>
                  </div>
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-center justify-center cursor-pointer">
                    <Button variant="ghost" asChild className="w-full">
                      <Link href="/notifications">View all notifications</Link>
                    </Button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Help */}
              <Button variant="ghost" size="icon">
                <HelpCircle className="h-5 w-5" />
              </Button>

              {/* User Menu */}
              {isAuthenticated && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-10 w-10 rounded-full p-0">
                      <Avatar className="h-9 w-9">
                        {user?.profileImageUrl ? (
                          <AvatarImage 
                            src={user.profileImageUrl} 
                            alt={user?.firstName || "User"} 
                          />
                        ) : (
                          <AvatarFallback className="text-sm">
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => window.location.href = '/profile'}>
                      <UserCircle className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.location.href = '/settings'}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => window.location.href = '/api/logout'}
                      className="text-red-600 focus:text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="min-h-[calc(100vh-4rem)]">
          {children}
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;