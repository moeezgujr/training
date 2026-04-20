import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
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
  HelpCircle,
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
        "relative flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-300 group",
        isActive 
          ? "text-blue-400" 
          : "text-slate-400 hover:text-white"
      )}
    >
      {Icon && <Icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", isActive ? "text-blue-400" : "text-slate-500")} />}
      {label}
      {isActive && (
        <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
      )}
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
    { href: "/courses", label: "Browse", icon: BookOpen },
    { href: "/user-guide", label: "Guide", icon: HelpCircle },
  ];
  
  const getUserInitials = () => {
    if (!user) return "U";
    return user.firstName && user.lastName 
      ? `${user.firstName[0]}${user.lastName[0]}` 
      : user.email?.charAt(0).toUpperCase() || "U";
  };
  
  const isAdmin = user?.role === "admin";
  const isInstructor = user?.role === "instructor";
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl supports-[backdrop-filter]:bg-[#020617]/60">
      <div className="container max-w-[1800px] mx-auto px-4 h-20 flex items-center justify-between">
        
        {/* Logo Section */}
        <div className="flex items-center gap-4 lg:gap-8">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="p-1 rounded-xl bg-white/5 border border-white/10 group-hover:border-blue-500/50 transition-all duration-500 shadow-2xl">
              <Logo height={38} className="brightness-150" />
            </div>
            <span className="hidden xl:block font-black text-lg tracking-tighter text-white uppercase italic">
              Meeting <span className="text-blue-500">Matters</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {!isAuthenticated ? (
              publicNavLinks.map((link) => <NavLink key={link.href} {...link} />)
            ) : (
              <NavLink href={isAdmin ? "/admin" : isInstructor ? "/instructor" : "/dashboard"} label="Dashboard" icon={BarChart3} />
            )}
          </nav>
        </div>
        
        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {!isAuthenticated ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Register Button - Now Blue glass style */}
              <Button 
                variant="outline" 
                size="sm" 
                asChild 
                className="hidden sm:flex font-medium border-blue-500/20 hover:border-blue-500/50 text-blue-400 hover:text-blue-300 bg-blue-500/5 rounded-xl transition-all h-9"
              >
                <Link href="/register/student">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Register
                </Link>
              </Button>

              <Link href="/auth/login" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors px-2">
                Login
              </Link>

              {/* OUT OF THE BOX GET STARTED BUTTON - Electric Blue */}
              <Button 
                asChild 
                className="relative scale-105 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 hover:from-blue-400 hover:to-indigo-600 text-white rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_35px_rgba(37,99,235,0.6)] border border-blue-400/50 h-10 px-6 transition-all duration-300 active:scale-95 font-bold uppercase tracking-wider"
              >
                <Link href="/auth/signup">Get Started</Link>
              </Button>
            </div>
          ) : (
           <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-white/5" asChild>
                <Link href="/courses"><Search className="h-5 w-5" /></Link>
              </Button>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-400 hover:bg-white/5" onClick={() => window.location.href = '/api/logout'}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          )}

          {/* Mobile Toggle */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden border border-white/10 bg-white/5 h-9 w-9">
                <Menu className="h-5 w-5 text-white" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-[#020617] border-white/10 text-white w-80">
              <div className="flex flex-col gap-4 mt-8">
                {publicNavLinks.map((link) => (
                  <NavLink key={link.href} {...link} onClick={closeMobileMenu} />
                ))}
                {!isAuthenticated && (
                  <div className="flex flex-col gap-2 pt-4 border-t border-white/10">
                    <Button asChild variant="outline" className="justify-start border-blue-500/20 text-blue-400">
                      <Link href="/register/student" onClick={closeMobileMenu}>Register</Link>
                    </Button>
                    <Button asChild className="bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                      <Link href="/auth/signup" onClick={closeMobileMenu}>Get Started</Link>
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