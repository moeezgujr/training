import { ReactNode } from "react";
import { NavHeader } from "@/components/layouts/nav-header";
import { Logo } from "@/components/ui/logo";
import { 
  MessageSquare, 
  Mail, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin 
} from "lucide-react";
import { Link } from "wouter";

interface PublicLayoutProps {
  children: ReactNode;
  hideFooter?: boolean;
}

export function PublicLayout({ children, hideFooter = false }: PublicLayoutProps) {
  const currentYear = new Date().getFullYear();
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavHeader />
      
      <main className="flex-1 max-w-[1400px] mx-auto w-full">
        {children}
      </main>
      
      {!hideFooter && (
        <footer className="relative bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
            <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
          </div>
          
          <div className="relative container max-w-[1400px] mx-auto px-6 py-12 md:py-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
              <div className="space-y-6">
                <div>
                  <Logo height={45} className="mb-4 brightness-110" />
                </div>
                <p className="text-sm text-blue-100 max-w-xs leading-relaxed">
                  Advancing education through a comprehensive learning platform designed for mental health and professional development.
                </p>
                <div className="flex gap-4">
                  <a href="#" className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center hover:from-pink-400 hover:to-purple-400 transition-all duration-300 transform hover:scale-110 shadow-lg">
                    <Facebook className="h-5 w-5" />
                    <span className="sr-only">Facebook</span>
                  </a>
                  <a href="#" className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center hover:from-blue-400 hover:to-cyan-400 transition-all duration-300 transform hover:scale-110 shadow-lg">
                    <Twitter className="h-5 w-5" />
                    <span className="sr-only">Twitter</span>
                  </a>
                  <a href="#" className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center hover:from-purple-400 hover:to-pink-400 transition-all duration-300 transform hover:scale-110 shadow-lg">
                    <Instagram className="h-5 w-5" />
                    <span className="sr-only">Instagram</span>
                  </a>
                  <a href="#" className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 transform hover:scale-110 shadow-lg">
                    <Linkedin className="h-5 w-5" />
                    <span className="sr-only">LinkedIn</span>
                  </a>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-bold text-lg bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Quick Links</h4>
                <ul className="text-sm space-y-3">
                  <li>
                    <Link href="/" className="text-blue-100 hover:text-cyan-300 transition-colors duration-200 flex items-center gap-2 group">
                      <span className="w-1 h-1 bg-cyan-400 rounded-full group-hover:w-2 transition-all duration-200"></span>
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link href="/courses" className="text-blue-100 hover:text-cyan-300 transition-colors duration-200 flex items-center gap-2 group">
                      <span className="w-1 h-1 bg-cyan-400 rounded-full group-hover:w-2 transition-all duration-200"></span>
                      All Courses
                    </Link>
                  </li>
                  <li>
                    <Link href="/auth/login" className="text-blue-100 hover:text-cyan-300 transition-colors duration-200 flex items-center gap-2 group">
                      <span className="w-1 h-1 bg-cyan-400 rounded-full group-hover:w-2 transition-all duration-200"></span>
                      Sign In
                    </Link>
                  </li>
                  <li>
                    <Link href="/register/student" className="text-blue-100 hover:text-cyan-300 transition-colors duration-200 flex items-center gap-2 group">
                      <span className="w-1 h-1 bg-cyan-400 rounded-full group-hover:w-2 transition-all duration-200"></span>
                      Register as Student
                    </Link>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-bold text-lg bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">Company</h4>
                <ul className="text-sm space-y-3">
                  <li>
                    <Link href="/about" className="text-blue-100 hover:text-pink-300 transition-colors duration-200 flex items-center gap-2 group">
                      <span className="w-1 h-1 bg-pink-400 rounded-full group-hover:w-2 transition-all duration-200"></span>
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy" className="text-blue-100 hover:text-pink-300 transition-colors duration-200 flex items-center gap-2 group">
                      <span className="w-1 h-1 bg-pink-400 rounded-full group-hover:w-2 transition-all duration-200"></span>
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="text-blue-100 hover:text-pink-300 transition-colors duration-200 flex items-center gap-2 group">
                      <span className="w-1 h-1 bg-pink-400 rounded-full group-hover:w-2 transition-all duration-200"></span>
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="text-blue-100 hover:text-pink-300 transition-colors duration-200 flex items-center gap-2 group">
                      <span className="w-1 h-1 bg-pink-400 rounded-full group-hover:w-2 transition-all duration-200"></span>
                      Contact Us
                    </Link>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-bold text-lg bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Contact</h4>
                <ul className="text-sm space-y-4">
                  <li className="flex items-center gap-3 text-blue-100 group">
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center group-hover:from-yellow-400 group-hover:to-orange-400 transition-all duration-200">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <span>Live Chat Support</span>
                  </li>
                  <li className="flex items-center gap-3 text-blue-100 group">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center group-hover:from-green-400 group-hover:to-emerald-400 transition-all duration-200">
                      <Mail className="h-4 w-4" />
                    </div>
                    <span>support@meetingmatters.com</span>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Newsletter Signup */}
            <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-white/10">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Stay Updated
                </h3>
                <p className="text-blue-100 mb-6 max-w-md mx-auto">
                  Get the latest updates on new courses, features, and educational content delivered to your inbox.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input 
                    type="email" 
                    placeholder="Enter your email address"
                    className="flex-1 px-4 py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  />
                  <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
            
            <div className="border-t border-white/20 pt-8 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-blue-100">
                © {currentYear} Meeting Matters LMS. All rights reserved.
              </div>
              <div className="flex gap-6">
                <Link href="/privacy" className="text-blue-200 hover:text-cyan-300 transition-colors duration-200">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="text-blue-200 hover:text-cyan-300 transition-colors duration-200">
                  Terms of Service
                </Link>
                <Link href="/cookies" className="text-blue-200 hover:text-cyan-300 transition-colors duration-200">
                  Cookie Policy
                </Link>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}