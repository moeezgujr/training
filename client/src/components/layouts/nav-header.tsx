import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { QuickHelpButton } from "@/components/onboarding/onboarding-trigger";
import { useOnboarding } from "@/hooks/useOnboarding";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  BookOpen, 
  BarChart3, 
  Award, 
  LucideIcon,
  Home,
  Search,
  GraduationCap,
  UserCog,
  Settings,
  Plus,
  Package,
  HelpCircle,
  Tags,
  ShoppingCart
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface NavLinkProps {
  href: string;
  label: string;
  icon?: LucideIcon;
  onClick?: () => void;
  'data-tour'?: string;
}

const NavLink = ({ href, label, icon: Icon, onClick, 'data-tour': dataTour }: NavLinkProps) => {
  const [location] = useLocation();
  const isActive = location === href;
  
  return (
    <Link
      href={href}
      onClick={onClick}
      data-tour={dataTour}
      className={cn(
        "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
        isActive 
          ? "bg-primary/10 text-primary" 
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {label}
    </Link>
  );
};

export function NavHeader() {
  const { isAuthenticated, user } = useAuth();
  const { startOnboarding } = useOnboarding();
  const { cartItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const closeMobileMenu = () => setMobileMenuOpen(false);
  
  const publicNavLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/courses", label: "Browse Courses", icon: BookOpen },
    { href: "/user-guide", label: "User Guide", icon: HelpCircle },
  ];
  
  // Learner navigation
  const learnerNavLinks = [
    { href: "/dashboard", label: "My Learning", icon: BarChart3 },
    { href: "/courses", label: "Browse Courses", icon: BookOpen },
    { href: "/certificates", label: "Certificates", icon: Award },
    { href: "/user-guide", label: "User Guide", icon: HelpCircle },
  ];
  
  // Instructor navigation
  const instructorNavLinks = [
    { href: "/instructor", label: "Instructor Dashboard", icon: BarChart3 },
    { href: "/instructor/courses/create", label: "Create Course", icon: Plus },
    { href: "/instructor/courses", label: "My Courses", icon: BookOpen },
    { href: "/user-guide", label: "User Guide", icon: HelpCircle },
  ];
  
  // Admin navigation
  const adminNavLinks = [
    { href: "/admin", label: "Admin Dashboard", icon: UserCog },
    { href: "/admin/users", label: "Manage Users", icon: User },
    { href: "/admin/tutors", label: "Manage Tutors", icon: GraduationCap },
    { href: "/admin/courses", label: "All Courses", icon: BookOpen },
    { href: "/admin/promo-codes", label: "Promo Codes", icon: Tags },
    { href: "/user-guide", label: "User Guide", icon: HelpCircle },
  ];
  
  // Generate proper initials for avatar
  const getUserInitials = () => {
    if (!user) return "U";
    
    if (user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
    }
    
    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    
    return "U";
  };
  
  // Get user role for conditional rendering
  const getUserRole = () => {
    if (!user) return null;
    return user.role || "learner"; // Default to learner if no role specified
  };
  
  const isAdmin = getUserRole() === "admin";
  const isInstructor = getUserRole() === "instructor";
  
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-[1400px] mx-auto px-4 lg:px-8 flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <Logo height={40} />
            <span className="hidden sm:block font-bold text-xl text-foreground">Meeting Matters</span>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          {!isAuthenticated ? (
            // Public navigation
            <>
              {publicNavLinks.map((link) => (
                <NavLink 
                  key={link.href} 
                  {...link} 
                  data-tour={link.href === "/courses" ? "courses" : undefined}
                />
              ))}
              <Button variant="ghost" size="sm" asChild className="gap-2">
                <Link href="/bundles">
                  <Package className="h-4 w-4" />
                  Course Bundles
                </Link>
              </Button>
            </>
          ) : isAdmin ? (
            // Admin navigation
            adminNavLinks.map((link) => (
              <NavLink key={link.href} {...link} />
            ))
          ) : isInstructor ? (
            // Instructor navigation
            instructorNavLinks.map((link) => (
              <NavLink key={link.href} {...link} />
            ))
          ) : (
            // Learner navigation
            <>
              {learnerNavLinks.map((link) => (
                <NavLink key={link.href} {...link} />
              ))}
              <Button variant="ghost" size="sm" asChild className="gap-2">
                <Link href="/bundles">
                  <Package className="h-4 w-4" />
                  Bundles
                </Link>
              </Button>
            </>
          )}
          
          {/* Search Button - always visible */}
          <Button variant="ghost" size="sm" asChild className="gap-2" data-tour="search">
            <Link href="/courses">
              <Search className="h-4 w-4" />
              <span className="hidden lg:inline">Search</span>
            </Link>
          </Button>
          
          {/* Cart Button - visible for learners only */}
          {isAuthenticated && !isAdmin && !isInstructor && (
            <Button variant="ghost" size="sm" asChild className="relative gap-2">
              <Link href="/cart">
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden lg:inline">Cart</span>
                {cartItems && cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                    {cartItems.length}
                  </span>
                )}
              </Link>
            </Button>
          )}

        </nav>
        
        {/* Auth Buttons or User Menu */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profileImageUrl || ""} alt={user?.email || "User"} />
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.firstName && user?.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user?.email || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/certificates" className="cursor-pointer">
                    <Award className="mr-2 h-4 w-4" />
                    Certificates
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/user-guide" className="cursor-pointer">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    User Guide
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => startOnboarding()} className="cursor-pointer">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Take a Tour
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a
                    href="/api/logout"
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild className="font-medium">
                <Link href="/auth/login">
                  <User className="mr-2 h-4 w-4" />
                  Login
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="font-medium border-green-200 hover:border-green-400 text-green-700 hover:text-green-800">
                <Link href="/register/student">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Student Registration
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="font-medium border-primary/20 hover:border-primary/40">
                <Link href="/auth/instructor">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Instructor
                </Link>
              </Button>
              <Button size="sm" asChild className="bg-primary hover:bg-primary/90 font-medium shadow-sm">
                <Link href="/auth/signup">Get Started</Link>
              </Button>
            </div>
          )}
          
          {/* Mobile Menu Trigger */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col space-y-6 pt-6">
                <h3 className="font-semibold pl-3">Menu</h3>
                
                <nav className="flex flex-col gap-2">
                  {!isAuthenticated ? (
                    // Public navigation
                    publicNavLinks.map((link) => (
                      <NavLink key={link.href} {...link} onClick={closeMobileMenu} />
                    ))
                  ) : isAdmin ? (
                    // Admin navigation
                    <>
                      <div className="px-3 pt-3 pb-1">
                        <h4 className="text-sm font-medium text-muted-foreground">Admin Panel</h4>
                      </div>
                      {adminNavLinks.map((link) => (
                        <NavLink key={link.href} {...link} onClick={closeMobileMenu} />
                      ))}
                    </>
                  ) : isInstructor ? (
                    // Instructor navigation
                    <>
                      <div className="px-3 pt-3 pb-1">
                        <h4 className="text-sm font-medium text-muted-foreground">Teaching Tools</h4>
                      </div>
                      {instructorNavLinks.map((link) => (
                        <NavLink key={link.href} {...link} onClick={closeMobileMenu} />
                      ))}
                    </>
                  ) : (
                    // Learner navigation
                    <>
                      <div className="px-3 pt-3 pb-1">
                        <h4 className="text-sm font-medium text-muted-foreground">My Learning</h4>
                      </div>
                      {learnerNavLinks.map((link) => (
                        <NavLink key={link.href} {...link} onClick={closeMobileMenu} />
                      ))}
                      <NavLink 
                        href="/cart" 
                        label={`Cart ${cartItems && cartItems.length > 0 ? `(${cartItems.length})` : ''}`}
                        icon={ShoppingCart} 
                        onClick={closeMobileMenu} 
                      />
                    </>
                  )}
                </nav>
                
                {/* Help Section - Always visible */}
                <div className="border-t pt-4">
                  <div className="px-3 pb-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Need Help?</h4>
                  </div>
                  <NavLink 
                    href="/user-guide" 
                    label="Complete User Guide" 
                    icon={HelpCircle} 
                    onClick={closeMobileMenu} 
                  />
                </div>
                
                {isAuthenticated ? (
                  <div className="border-t pt-4">
                    <div className="flex items-center px-3 mb-4">
                      <Avatar className="h-9 w-9 mr-3">
                        <AvatarImage src={user?.profileImageUrl || ""} alt={user?.email || "User"} />
                        <AvatarFallback>{getUserInitials()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {user?.firstName && user?.lastName
                            ? `${user.firstName} ${user.lastName}`
                            : user?.email || "User"}
                        </p>
                        <p className="text-xs text-muted-foreground">{getUserRole()}</p>
                      </div>
                    </div>
                    <Button variant="destructive" className="w-full gap-2" asChild>
                      <a href="/api/logout">
                        <LogOut className="h-4 w-4" />
                        Log out
                      </a>
                    </Button>
                  </div>
                ) : (
                  <div className="border-t pt-4 space-y-3">
                    <Button className="w-full" asChild>
                      <a href="/api/login">Sign up</a>
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/auth/login" onClick={closeMobileMenu}>Log in</Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}