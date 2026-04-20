import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Zap, 
  Brain, 
  Sparkles,
  ArrowRight,
  Globe,
  Activity,
  Microscope,
  Fingerprint,
  Dna,
  Quote
} from "lucide-react";
import { PublicLayout } from "@/components/layouts/public-layout";

/**
 * HERO SECTION
 * Changed: Removed bg-[#020617], added bg-transparent
 */
const HeroSection = () => (
  <section className="relative min-h-screen w-full flex items-center overflow-hidden bg-transparent -mt-[80px]">
    <div className="absolute inset-0 z-0">
      <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-600/10 rounded-full blur-[160px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[160px] animate-pulse" style={{ animationDelay: '2s' }} />
    </div>
    
    <div className="w-full max-w-[1800px] mx-auto px-8 lg:px-16 relative z-10 pt-20">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-cyan-400 text-xs font-black uppercase tracking-[0.3em] backdrop-blur-md">
            <Sparkles className="w-4 h-4" />
            The Future of Psychology
          </div>
          <h1 className="text-7xl lg:text-[10rem] font-black text-white leading-[0.8] tracking-tighter">
            MEETING <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
              MATTERS
            </span>
          </h1>
          <p className="text-xl lg:text-2xl text-slate-300 leading-relaxed max-w-xl border-l-4 border-cyan-500/50 pl-8">
            Master evidence-based therapeutic approaches with our elite psychology curriculum.
          </p>
          <Button size="lg" className="h-16 rounded-full px-12 bg-white text-black hover:bg-cyan-400 transition-all duration-500 font-black text-xl group" asChild>
            <Link href="/courses">
              <span className="flex items-center">
                Explore Library <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </span>
            </Link>
          </Button>
        </div>

        <div className="relative hidden lg:block">
          <div className="relative z-20 bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-12 shadow-2xl transform rotate-2">
            <div className="flex items-center justify-between mb-12">
              <div className="flex gap-3">
                <div className="w-4 h-4 rounded-full bg-red-500/40" />
                <div className="w-4 h-4 rounded-full bg-yellow-500/40" />
                <div className="w-4 h-4 rounded-full bg-green-500/40" />
              </div>
              <Brain className="w-8 h-8 text-cyan-400" />
            </div>
            <div className="space-y-10">
              <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10">
                <div className="flex justify-between text-lg mb-4 text-slate-300 font-bold tracking-widest uppercase">Neural Sync</div>
                <div className="w-full bg-slate-800/50 rounded-full h-3 overflow-hidden">
                  <div className="bg-gradient-to-r from-cyan-400 to-blue-600 h-full w-[88%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

/**
 * NEURAL DATA GRID
 * Changed: bg-[#020617] -> bg-transparent
 */
const NeuralDataGrid = () => {
  const [pulse, setPulse] = useState(72);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(prev => prev + (Math.random() > 0.5 ? 1 : -1));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-40 bg-transparent w-full px-8">
      <div className="max-w-[1800px] mx-auto">
        <div className="mb-20">
          <div className="flex items-center gap-3 text-cyan-500 font-black mb-6 tracking-[0.4em] uppercase text-sm">
            <Activity className="w-6 h-6 animate-pulse" />
            Live Research Stream
          </div>
          <h2 className="text-6xl lg:text-8xl font-black text-white leading-[0.9] tracking-tighter">
            COGNITIVE <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              FRONTIERS
            </span>
          </h2>
        </div>
        
        <div className="relative p-8 md:p-16 rounded-[4rem] bg-white/5 border border-white/10 backdrop-blur-md overflow-hidden shadow-2xl">
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 bg-black/20 border border-white/10 rounded-[3rem] p-12 relative overflow-hidden group backdrop-blur-xl">
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <h3 className="text-4xl font-black text-white mb-2 tracking-tight">Neuro-Mapping v4.2</h3>
                  <p className="text-cyan-400/60 font-mono text-sm tracking-widest uppercase">Target Area: Prefrontal Cortex</p>
                </div>
                <div className="text-right">
                  <span className="block text-4xl font-mono text-cyan-400">{pulse} BPM</span>
                </div>
              </div>

              <div className="h-[400px] flex items-center justify-center relative mt-8">
                <div className="absolute w-64 h-64 border border-cyan-500/20 rounded-full animate-ping" />
                <div className="flex gap-1 items-end h-32">
                  {[...Array(20)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-2 bg-gradient-to-t from-cyan-600 to-blue-400 rounded-full animate-bounce" 
                      style={{ height: `${Math.random() * 100}%`, animationDuration: `${0.5 + Math.random()}s` }} 
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-8">
              <div className="bg-blue-600/10 backdrop-blur-xl border border-blue-500/20 rounded-[2.5rem] p-10 hover:border-blue-500/50 transition-all group">
                <Microscope className="w-10 h-10 text-blue-400 mb-6 group-hover:scale-110 transition-transform" />
                <h4 className="text-2xl font-black text-white mb-2">Molecular Empathy</h4>
                <p className="text-slate-400 text-sm leading-relaxed">Recent discovery in oxytocin receptor pathways suggests faster trauma processing.</p>
              </div>

              <div className="bg-purple-600/10 backdrop-blur-xl border border-purple-500/20 rounded-[2.5rem] p-10 hover:border-purple-500/50 transition-all group">
                <Fingerprint className="w-10 h-10 text-purple-400 mb-6 group-hover:scale-110 transition-transform" />
                <h4 className="text-2xl font-black text-white mb-2">Cognitive Identity</h4>
                <p className="text-slate-400 text-sm leading-relaxed">Unique neural fingerprints allow for customized interventions.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export function PublicHomePage() {
  return (
    <PublicLayout>
      {/* Root Container: bg-[#020617] -> bg-transparent */}
      <div className="bg-transparent overflow-x-hidden">
        
        <HeroSection />
        
        {/* Feature Icons Section 
            Changed: bg-[#020617] -> bg-transparent
        */}
        <section className="py-40 bg-transparent w-full px-8">
          <div className="max-w-[1800px] mx-auto grid md:grid-cols-3 gap-12">
            {[
              { icon: <Zap />, title: "Hyper-Retention", color: "text-yellow-400" },
              { icon: <Globe />, title: "Global Network", color: "text-blue-400" },
              { icon: <Dna />, title: "Genetic Insight", color: "text-emerald-400" },
            ].map((f, i) => (
              <div key={i} className="group p-12 rounded-[3rem] bg-white/5 backdrop-blur-md border border-white/10 text-center hover:bg-white/10 transition-all">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 mx-auto bg-white/5 ${f.color}`}>
                  {f.icon}
                </div>
                <h3 className="text-3xl font-black text-white tracking-tight">{f.title}</h3>
              </div>
            ))}
          </div>
        </section>

        <NeuralDataGrid />

        {/* Quote Section 
            Changed: bg-[#020617] -> bg-transparent
        */}
        <section className="py-40 relative bg-transparent overflow-hidden">
          <div className="max-w-6xl mx-auto px-8 relative z-10 text-center">
            <Quote className="w-24 h-24 text-cyan-500/20 mx-auto mb-10" />
            <h2 className="text-5xl md:text-7xl font-black text-white italic leading-tight tracking-tighter">
              "The only way to <span className="text-cyan-400">understand</span> the human mind is to have the <span className="text-blue-500">courage</span> to explore its deepest shadows."
            </h2>
          </div>
        </section>

        {/* CTA Section 
            Changed: bg-gradient to include transparency
        */}
        <section className="py-40 px-8">
          <div className="max-w-[1800px] mx-auto bg-gradient-to-br from-slate-900/40 via-black/20 to-slate-900/40 backdrop-blur-3xl rounded-[5rem] p-24 text-center border border-white/10 shadow-2xl">
            <h2 className="text-6xl md:text-8xl font-black text-white mb-10 tracking-tighter uppercase">
              Become the <br /> <span className="text-cyan-400">Pioneer.</span>
            </h2>
            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
              <Link href="/auth/signup">
                <Button size="lg" className="h-20 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-black px-16 text-2xl transition-all shadow-[0_0_30px_rgba(6,182,212,0.5)]">
                  Join the Lab
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}