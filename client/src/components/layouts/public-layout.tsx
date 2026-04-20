import { ReactNode } from "react";
import { NavHeader } from "@/components/layouts/nav-header";
import { Logo } from "@/components/ui/logo";
import { 
  MessageSquare, 
  Mail, 
  ChevronRight, 
  Instagram, 
  Linkedin, 
  Youtube,
  Music2 
} from "lucide-react";
import { Link } from "wouter";

interface PublicLayoutProps {
  children: ReactNode;
  hideFooter?: boolean;
}

export function PublicLayout({ children, hideFooter = false }: PublicLayoutProps) {
  const currentYear = new Date().getFullYear();
  
  return (
    <div className="min-h-screen flex flex-col bg-transparent font-sans">
      <NavHeader />
      
      <main className="flex-1 w-full relative z-10">
        {children}
      </main>
      
      {!hideFooter && (
        <footer className="relative bg-slate-950/60 backdrop-blur-xl text-white overflow-hidden border-t border-white/10 z-10">
          {/* Enhanced background glow */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-600 rounded-full filter blur-[100px] animate-pulse"></div>
            <div className="absolute top-1/2 -right-24 w-80 h-80 bg-cyan-600 rounded-full filter blur-[80px] animate-pulse delay-700"></div>
          </div>
          
          <div className="relative container max-w-[1400px] mx-auto px-8 py-16 md:py-24">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 mb-16">
              
              {/* Brand & Social Section */}
              <div className="md:col-span-4 space-y-8">
                <Logo height={52} className="brightness-125" />
                <p className="text-lg text-slate-300 leading-relaxed font-light">
                  Advancing education through a comprehensive learning platform designed for 
                  <span className="text-white font-medium"> mental health</span> and 
                  <span className="text-white font-medium"> professional development</span>.
                </p>
                
                {/* Social Buttons */}
                <div className="flex flex-wrap gap-4">
                  {[
                    { 
                      icon: Instagram, 
                      href: "https://www.instagram.com/meetingmattersclinic/", 
                      color: "hover:text-pink-500", 
                      label: "Instagram" 
                    },
                    { 
                      icon: Linkedin, 
                      href: "https://www.linkedin.com/company/meetingmatters/", 
                      color: "hover:text-blue-500", 
                      label: "LinkedIn" 
                    },
                    { 
                      icon: Youtube, 
                      href: "https://www.youtube.com/@NaushadwithMeetingMatters", 
                      color: "hover:text-red-500", 
                      label: "YouTube" 
                    },
                    { 
                      icon: Music2, 
                      href: "https://www.tiktok.com/@meetingmatters?_r=1&_t=ZS-94ULY7CFToS", 
                      color: "hover:text-cyan-400", 
                      label: "TikTok" 
                    },
                  ].map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className={`w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 transition-all duration-300 ${social.color} hover:bg-white/10 hover:-translate-y-1 hover:border-white/20`}
                    >
                      <social.icon size={22} />
                    </a>
                  ))}
                </div>
              </div>
              
              {/* Navigation Grid */}
              <div className="md:col-span-5 grid grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400">Navigation</h4>
                  <ul className="space-y-4">
                    {[
                      { name: "Home", href: "/" },
                      { name: "All Courses", href: "/courses" },
                      { name: "Sign In", href: "/auth/login" },
                      { name: "Register", href: "/register/student" }
                    ].map((link) => (
                      <li key={link.name}>
                        <Link href={link.href} className="group flex items-center text-base text-slate-400 hover:text-white transition-all">
                          <ChevronRight className="h-4 w-4 mr-2 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-cyan-400" />
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-6">
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-purple-400">Company</h4>
                  <ul className="space-y-4">
                    {[
                      { name: "About Us", href: "/about" },
                      { name: "Privacy Policy", href: "/privacy" },
                      { name: "Terms of Service", href: "/terms" }
                    ].map((link) => (
                      <li key={link.name}>
                        <Link href={link.href} className="group flex items-center text-base text-slate-400 hover:text-white transition-all">
                          <ChevronRight className="h-4 w-4 mr-2 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-purple-400" />
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Support Section */}
              <div className="md:col-span-3 space-y-6">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-orange-400">Support</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors cursor-pointer group">
                    <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-all">
                      <MessageSquare size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Live Chat</p>
                      <p className="text-xs text-slate-400">Available 24/7</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors cursor-pointer group">
                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all">
                      <Mail size={20} />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-white">Email Us</p>
                      <p className="text-xs text-slate-400 truncate">info@themeetingmatters.com</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-white/10 pt-10 text-center">
              <p className="text-slate-400 text-sm tracking-wide">
                &copy; {currentYear} <span className="text-white font-semibold tracking-normal">Meeting Matters LMS</span>. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}