import { Separator } from "@/components/ui/separator";
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  Database, 
  UserCheck, 
  Mail,
  Fingerprint
} from "lucide-react";

export default function PrivacyPolicy() {
  const lastUpdated = "May 20, 2025";

  return (
    <div className="bg-[#020617] min-h-screen text-slate-300">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent" />
        <div className="container max-w-5xl relative z-10 px-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium uppercase tracking-wider">
              <ShieldCheck className="h-3.5 w-3.5" />
              Data Protection
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
              Privacy <span className="text-indigo-400">Policy</span>
            </h1>
            <p className="text-slate-400 max-w-2xl text-lg">
              Your privacy is paramount. This policy outlines how we handle your personal data with transparency, security, and respect.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container max-w-6xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-16">
            
            {/* Side Navigation */}
            <aside className="hidden lg:block space-y-8 sticky top-32 h-fit">
              <div>
                <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-widest">Navigation</h4>
                <nav className="flex flex-col gap-3 text-sm font-medium">
                  <a href="#collection" className="text-slate-500 hover:text-indigo-400 transition-colors">Information Collection</a>
                  <a href="#usage" className="text-slate-500 hover:text-indigo-400 transition-colors">How We Use Data</a>
                  <a href="#sharing" className="text-slate-500 hover:text-indigo-400 transition-colors">Data Sharing</a>
                  <a href="#security" className="text-slate-500 hover:text-indigo-400 transition-colors">Security Measures</a>
                  <a href="#rights" className="text-slate-500 hover:text-indigo-400 transition-colors">Your Rights</a>
                </nav>
              </div>
              
              <div className="p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                <Lock className="h-5 w-5 text-indigo-400 mb-3" />
                <h5 className="text-white text-xs font-bold uppercase mb-2">GDPR & CCPA</h5>
                <p className="text-[11px] leading-relaxed text-slate-400">
                  We are committed to international data protection standards and user-centric privacy controls.
                </p>
              </div>
            </aside>

            {/* Main Content */}
            <div className="prose prose-slate prose-invert max-w-none 
              prose-headings:text-white prose-h2:text-2xl prose-h2:font-bold prose-h2:tracking-tight prose-h2:border-b prose-h2:border-slate-800 prose-h2:pb-4
              prose-p:text-slate-400 prose-p:leading-relaxed
              prose-li:text-slate-400 prose-strong:text-indigo-300">
              
              <p className="text-xl text-slate-300 leading-relaxed italic">
                Meeting Matters LMS is committed to protecting your privacy. This policy details our commitment to safeguarding your digital footprint.
              </p>

              <h2 id="collection">1. Information We Collect</h2>
              <p>
                We collect information that you provide directly to us during account creation, course enrollment, and support interactions.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8 not-prose">
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                  <UserCheck className="h-6 w-6 text-indigo-400 mb-3" />
                  <h4 className="text-white font-bold mb-2">Provided by You</h4>
                  <ul className="text-sm space-y-1 text-slate-400">
                    <li>Name and Contact Details</li>
                    <li>Professional Credentials</li>
                    <li>Assignment Submissions</li>
                    <li>Support Communications</li>
                  </ul>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                  <Fingerprint className="h-6 w-6 text-indigo-400 mb-3" />
                  <h4 className="text-white font-bold mb-2">Collected Automatically</h4>
                  <ul className="text-sm space-y-1 text-slate-400">
                    <li>IP Address & Device Info</li>
                    <li>Browser & Operating System</li>
                    <li>Platform Usage Statistics</li>
                    <li>Learning Activity Logs</li>
                  </ul>
                </div>
              </div>

              <h2 id="usage">2. How We Use Your Information</h2>
              <p>We leverage data to build a more personalized and effective learning environment:</p>
              <ul>
                <li>Maintain and improve our educational services</li>
                <li>Track progress and issue <strong>verified certifications</strong></li>
                <li>Communicate critical course updates and support notices</li>
                <li>Analyze anonymized usage patterns to refine UI/UX</li>
              </ul>

              <h2 id="sharing">3. Sharing and Disclosure</h2>
              <p>
                We value your trust. <strong>We do not sell, rent, or lease your personal information to third parties for marketing purposes.</strong> Disclosure only occurs in the following contexts:
              </p>
              <div className="bg-indigo-500/5 border-l-4 border-indigo-500 p-6 my-6">
                <p className="m-0 text-sm italic">
                  "Data sharing is limited to essential service providers (hosting, payment) and educational partners necessary for your curriculum completion."
                </p>
              </div>

              <h2 id="security">4. Data Security & Retention</h2>
              <p>
                We implement industry-standard technical and organizational measures to protect against unauthorized access or accidental loss.
              </p>
              <div className="flex items-start gap-4 p-6 rounded-2xl bg-slate-950 border border-slate-800 my-8">
                <Database className="h-8 w-8 text-indigo-400 shrink-0" />
                <div>
                  <h4 className="text-white font-bold m-0 mb-1">Retention Policy</h4>
                  <p className="text-sm m-0">
                    Course records and certifications are maintained indefinitely to provide lifelong verification services, unless a deletion request is initiated by the user.
                  </p>
                </div>
              </div>

              <h2 id="rights">5. Your Rights and Choices</h2>
              <p>
                Depending on your jurisdiction (such as GDPR or CCPA), you may exercise the following rights:
              </p>
              <ul>
                <li><strong>Access & Portability:</strong> Request a copy of your personal data.</li>
                <li><strong>Correction & Deletion:</strong> Amend or remove your information.</li>
                <li><strong>Objection:</strong> Limit how we process certain data points.</li>
              </ul>

              <h2 id="contact">6. Contact Us</h2>
              <p>
                For any inquiries regarding your data, please contact our Data Protection Officer:
              </p>
              
              {/* UPDATED: Removed button and specific contact details */}
              <div className="not-prose mt-8 p-8 rounded-3xl bg-gradient-to-br from-indigo-900/20 to-slate-900 border border-indigo-500/20">
                <div className="flex items-center gap-3">
                  <Mail className="h-6 w-6 text-indigo-400" />
                  <h4 className="text-white font-bold text-xl m-0">
                    Privacy Inquiries
                  </h4>
                </div>
                <p className="text-slate-400 text-sm mt-4">
                  Please reach out via our official support channels for any data-related requests or questions.
                </p>
              </div>

              <Separator className="my-12 bg-slate-800" />
              
              <div className="flex justify-between items-center text-sm text-slate-500 italic pb-12">
                <span>Meeting Matters Privacy Framework v2.1</span>
                <span>Last Updated: {lastUpdated}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}