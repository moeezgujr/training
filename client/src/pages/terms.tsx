import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Scale, ShieldCheck, CreditCard, HelpCircle } from "lucide-react";

export default function TermsOfService() {
  const lastUpdated = "May 20, 2025";

  return (
    <div className="bg-[#020617] min-h-screen text-slate-300">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent" />
        <div className="container max-w-5xl relative z-10 px-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium uppercase tracking-wider">
              <Scale className="h-3.5 w-3.5" />
              Legal Framework
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
              Terms of <span className="text-cyan-500">Service</span>
            </h1>
            <p className="text-slate-400 max-w-2xl text-lg">
              Please review these terms carefully. They constitute a binding agreement between you and Meeting Matters LMS regarding your use of our educational platform.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container max-w-6xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-16">
            
            {/* Quick Navigation - Hidden on Mobile */}
            <aside className="hidden lg:block space-y-8 sticky top-32 h-fit">
              <div>
                <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-widest">Summary</h4>
                <nav className="flex flex-col gap-3 text-sm">
                  <a href="#agreement" className="hover:text-cyan-400 transition-colors">Agreement</a>
                  <a href="#services" className="hover:text-cyan-400 transition-colors">Our Services</a>
                  <a href="#accounts" className="hover:text-cyan-400 transition-colors">Account Security</a>
                  <a href="#property" className="hover:text-cyan-400 transition-colors">Intellectual Property</a>
                  <a href="#payments" className="hover:text-cyan-400 transition-colors">Payments & Refunds</a>
                </nav>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <HelpCircle className="h-5 w-5 text-cyan-500 mb-2" />
                <p className="text-xs leading-relaxed">
                  Questions? Reach out to <span className="text-white">legal@meetingmatters.com</span>
                </p>
              </div>
            </aside>

            {/* Main Content */}
            <div className="prose prose-slate prose-invert max-w-none 
              prose-headings:text-white prose-h2:text-2xl prose-h2:font-bold prose-h2:tracking-tight prose-h2:border-b prose-h2:border-slate-800 prose-h2:pb-4
              prose-p:text-slate-400 prose-p:leading-relaxed
              prose-li:text-slate-400 prose-strong:text-cyan-400">
              
              <p className="text-xl text-slate-300 leading-relaxed italic">
                These Terms of Service ("Terms") govern your access to and use of Meeting Matters LMS's website, services, and learning management system (collectively, the "Services").
              </p>

              <h2 id="agreement">1. Agreement to Terms</h2>
              <p>
                By accessing or using our Services, you agree to be bound by these Terms and our Privacy Policy. If you disagree with any part of the Terms, you may not access or use our Services.
              </p>

              <h2 id="services">2. Description of Services</h2>
              <p>
                Meeting Matters LMS provides a learning management system offering courses focused on mental health professional development, specifically targeting anxiety and depression treatment approaches. Our Services include:
              </p>
              <ul>
                <li>Online courses and high-fidelity educational content</li>
                <li>Assessments, quizzes, and clinical assignments</li>
                <li>Professional certifications upon completion</li>
                <li>Discussion forums and professional networking opportunities</li>
              </ul>

              <h2 id="accounts">3. Account Registration & Security</h2>
              <p>
                To access certain features, you must register for an account. When you register, you agree to:
              </p>
              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl my-6">
                <ul className="m-0 space-y-2">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain and promptly update your account information</li>
                  <li>Keep your password secure and confidential</li>
                  <li>Accept responsibility for all activities under your account</li>
                </ul>
              </div>

              <h2 id="property">4. Intellectual Property</h2>
              <p>
                All content, features, and functionality—including text, graphics, logos, and video—are the exclusive property of Meeting Matters LMS. We grant you a <strong>limited, non-exclusive, non-transferable license</strong> to access our Services for personal, educational purposes.
              </p>

              <h2 id="payments">5. Payments and Subscriptions</h2>
              <p>
                Some Services require payment. All fees are quoted in U.S. dollars. By purchasing, you agree to pay all associated fees and provide accurate billing information.
              </p>
              
              <div className="flex flex-col md:flex-row gap-6 my-8">
                <div className="flex-1 p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800">
                  <ShieldCheck className="h-8 w-8 text-cyan-500 mb-4" />
                  <h4 className="text-white font-bold m-0 mb-2">Refund Policy</h4>
                  <p className="text-sm m-0">
                    Request a refund within <strong>14 days</strong> if you have accessed less than <strong>30%</strong> of the content.
                  </p>
                </div>
                <div className="flex-1 p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800">
                  <CreditCard className="h-8 w-8 text-purple-500 mb-4" />
                  <h4 className="text-white font-bold m-0 mb-2">Secure Billing</h4>
                  <p className="text-sm m-0">
                    All transactions are encrypted. We do not store full credit card details on our servers.
                  </p>
                </div>
              </div>

              <h2>6. Disclaimer of Warranties</h2>
              <p className="uppercase text-xs tracking-widest bg-slate-900 p-4 rounded-lg border border-slate-800">
                Our services are provided "as is" and "as available," without warranty of any kind. To the maximum extent permitted by law, we disclaim all warranties of merchantability and fitness for a particular purpose.
              </p>

              <h2>7. Contact Information</h2>
              <p>
                If you have any questions about these Terms, please contact our legal department:
              </p>
              <address className="not-italic bg-slate-900/30 border-l-2 border-cyan-500 p-6 rounded-r-xl text-slate-300">
                <strong>Meeting Matters LMS</strong><br />
                Email: <span className="text-cyan-400">terms@meetingmatters.com</span><br />
                Address: 123 Learning Avenue, Suite 456, Education City, CA 90000
              </address>

              <Separator className="my-12 bg-slate-800" />
              
              <div className="flex justify-between items-center text-sm text-slate-500 italic pb-12">
                <span>Reference ID: MM-TOS-2025</span>
                <span>Last Updated: {lastUpdated}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}