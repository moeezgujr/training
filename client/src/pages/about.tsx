import { 
  Brain, 
  HeartPulse, 
  Stethoscope, 
  Search, 
  Zap, 
  ShieldCheck, 
  Boxes, 
  TrendingUp,
  SearchCheck,
  Ear,
  MapPin,
  CheckCircle2,
  Navigation,
  Clock,
  Phone
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen w-full bg-white font-sans text-slate-800">
      
      {/* --- HERO SECTION --- */}
      <section className="pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-[#1e3a8a] mb-6 leading-tight">
             Meeting Matters: <br />
            Your Trusted Mental Health <br />
            Clinic in Islamabad
          </h1>
          <div className="space-y-6 text-sm md:text-base text-slate-600 leading-relaxed px-4">
            <p>
              At Meeting Matters, we are more than just a mental health clinic in Islamabad — we are a compassionate community dedicated to nurturing emotional well-being, healing, and personal growth. Founded in 2018 by renowned psychologist Muhammad Naushad Anjum, our clinic has been providing high-quality psychological counseling and therapy services for over 15 years.
            </p>
          </div>
          <div className="mt-12 w-full h-[1px] bg-slate-100 max-w-2xl mx-auto" />
        </div>
      </section>

      {/* --- PROMINENT ADDRESS & MAP SECTION --- */}
      <section className="py-16 bg-slate-50 border-y border-slate-100">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Address Details */}
            <div className="space-y-8">
              <div>
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#2563eb] mb-4">Visit Our Clinic</h2>
                <p className="text-3xl md:text-4xl font-bold text-[#1e3a8a] leading-tight mb-4">
                  House 66, Street 73, <br />
                  F-11/1, Islamabad
                </p>
                <p className="text-slate-500 text-lg">Our central Islamabad location provides a peaceful and professional environment for your healing journey.</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Clock size={20}/></div>
                  <div>
                    <p className="font-bold text-sm text-slate-900">Open 24 Hours</p>
                    <p className="text-xs text-slate-500 text-nowrap">Monday — Sunday</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Phone size={20}/></div>
                  <div>
                    <p className="font-bold text-sm text-slate-900">Contact Us</p>
                    <p className="text-xs text-slate-500">+92 311 1155601</p>
                  </div>
                </div>
              </div>

              <a 
                href="https://maps.google.com/?cid=16305659386522730678&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNl" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#1e3a8a] text-white rounded-xl font-bold hover:bg-[#2563eb] transition-all group"
              >
                <Navigation size={20} className="group-hover:translate-x-1 transition-transform" />
                Get Directions on Google Maps
              </a>
            </div>

            {/* Visual Map Link Placeholder/Card */}
            <div className="relative group">
              <div className="absolute -inset-4 bg-blue-500/5 rounded-[2.5rem] blur-2xl group-hover:bg-blue-500/10 transition-all"></div>
              <div className="relative bg-[#1e3a8a] rounded-3xl p-8 aspect-video md:aspect-square flex flex-col justify-end overflow-hidden border border-white/10 shadow-2xl">
                {/* Visual abstract map pattern */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent scale-150"></div>
                  <div className="h-full w-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30"></div>
                </div>
                
                <div className="relative z-10">
                  <MapPin size={48} className="text-white mb-6 animate-bounce" />
                  <h3 className="text-2xl font-bold text-white mb-2">Meeting Matters Clinic</h3>
                  <p className="text-blue-100/80 text-sm max-w-xs">Click the directions button to view our precise location on Google Maps.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SERVICES GRID --- */}
      <section className="py-24">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {[
              { icon: Brain, title: "Mental Wellness", desc: "Empowering you to live your best life through evidence-based mental health services." },
              { icon: HeartPulse, title: "Healing Minds", desc: "Our team of compassionate professionals is here to support your journey to well-being." },
              { icon: Stethoscope, title: "Mindful Care", desc: "We offer personalized coaching to help you cultivate resilience in your daily life." },
              { icon: Search, title: "Mental Clarity", desc: "Gain clarity and overcome obstacles with our professional therapy services." },
              { icon: Zap, title: "Stronger You", desc: "Build resilience and unlock your true potential with our personalized programs." },
              { icon: Boxes, title: "Emotionally Fit", desc: "Achieve greater well-being with our holistic counseling and therapy services." },
              { icon: ShieldCheck, title: "Mind-Body Balance", desc: "Find balance and harmony in your life with our integrative health approach." },
              { icon: TrendingUp, title: "Positive Growth", desc: "Experience transformation with our evidence-based counseling and coaching." },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                <div className="mb-4 text-[#2563eb] transition-transform duration-300 group-hover:scale-110">
                  <item.icon size={48} strokeWidth={1.2} />
                </div>
                <h3 className="text-lg font-bold mb-2 text-slate-900">{item.title}</h3>
                <div className="w-8 h-[2px] bg-[#3b82f6] mb-4" />
                <p className="text-xs text-slate-500 leading-relaxed max-w-[200px]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- BLUE CALL-TO-ACTION SECTION --- */}
      <section className="bg-[#1e3a8a] py-20 text-white relative overflow-hidden">
        <div className="relative container mx-auto px-6 max-w-4xl text-center">
          <h2 className="text-3xl md:text-5xl font-light mb-2">Improving Lives,</h2>
          <h2 className="text-3xl md:text-5xl font-black mb-8 uppercase tracking-tight">Together</h2>
          <p className="text-xs md:text-sm leading-relaxed mb-16 text-blue-100/90 max-w-3xl mx-auto">
            Treatment offered at Meeting Matters addresses issues ranging from everyday stress and anger to complex psychological disorders. We provide an unparalleled range of services delivered by qualified psychologists.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Ear, title: "Active Listening", subtitle: "We hear you and understand" },
              { icon: SearchCheck, title: "Understanding", subtitle: "Identifying the root cause" },
              { icon: MapPin, title: "Treatment Plan", subtitle: "Developing a roadmap" },
              { icon: CheckCircle2, title: "Progress", subtitle: "Guiding you to goals" }
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center group">
                <div className="mb-4 p-3 rounded-full bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors">
                  <step.icon size={28} strokeWidth={1.5} className="text-blue-300" />
                </div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider mb-1 text-white">{step.title}</h4>
                <p className="text-[9px] text-blue-200/70">{step.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}