import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  X, Sparkles, Video, Search, HelpCircle, 
  ChevronRight, ChevronLeft, Terminal, Target
} from 'lucide-react';
import { cn } from "@/lib/utils";

// Assuming these are passed via props or imported
interface TourStep {
  title: string;
  description: string;
  tips?: string[];
}

interface TourSection {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  icon: React.ReactNode;
  steps: TourStep[];
}

// Mock data for internal use if not imported
const tourSections: TourSection[] = [
  {
    id: '1',
    title: 'Neural Interface Basics',
    description: 'Calibrate your primary navigation and dashboard systems.',
    category: 'CORE',
    duration: '2m',
    icon: <Terminal className="h-6 w-6" />,
    steps: [
      { title: 'The Command Center', description: 'Access your global metrics from the top HUD.', tips: ['Hotkey: Shift+D', 'Real-time updates'] },
      { title: 'Neural Links', description: 'Navigate through courses using the sidebar.', tips: ['Drag to reorder', 'Auto-hide enabled'] }
    ]
  },
  {
    id: '2',
    title: 'Data Acquisition',
    description: 'Master the search and discovery protocols.',
    category: 'INTEL',
    duration: '3m',
    icon: <Search className="h-6 w-6" />,
    steps: [
      { title: 'Global Query', description: 'Search across all modules instantly.', tips: ['Filters available', 'Saves history'] }
    ]
  }
];

interface OnboardingWalkthroughProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function OnboardingWalkthrough({ isOpen, onClose, onComplete }: OnboardingWalkthroughProps) {
  const [activeView, setActiveView] = useState<'overview' | 'tour' | 'video' | 'faq'>('overview');
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [completedSections, setCompletedSections] = useState<string[]>([]);

  // Derived state
  const currentSection = tourSections.find(s => s.id === selectedSectionId);
  const currentStep = currentSection?.steps[currentStepIndex];

  const handleNext = () => {
    if (currentSection && currentStepIndex < currentSection.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      // Finish section
      if (selectedSectionId) {
        setCompletedSections(prev => [...new Set([...prev, selectedSectionId])]);
      }
      setActiveView('overview');
      setSelectedSectionId(null);
      setCurrentStepIndex(0);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-[#020617]/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 font-sans"
      >
        {/* CYBER DECORATION */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-cyan-500/50 to-transparent" />
          <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-blue-500/50 to-transparent" />
        </div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 40 }}
          className="relative w-full max-w-6xl h-[85vh] bg-[#0f172a] border border-white/10 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col"
        >
          {/* HUD HEADER */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/30">
                <Terminal className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 leading-none mb-1">System_Init</h2>
                <h1 className="text-xl font-black text-white italic uppercase tracking-tighter">Onboarding_Protocol.v1</h1>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/50 transition-all text-slate-400 hover:text-red-400"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {activeView === 'overview' && (
              <div className="max-w-4xl mx-auto space-y-12 py-10">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[9px] font-black uppercase tracking-widest">
                    <Sparkles className="h-3 w-3" /> Synchronization Required
                  </div>
                  <h2 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter text-white">
                    Master the <span className="text-cyan-500 underline decoration-cyan-500/30">Neural Lab</span>
                  </h2>
                  <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium">
                    Initialize your terminal. Complete the calibration sequences to unlock full administrative access to the learning platform.
                  </p>
                </div>

                {/* SEARCH */}
                <div className="relative max-w-md mx-auto group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                  <input
                    placeholder="Search protocols..."
                    className="w-full h-12 bg-white/[0.03] border border-white/10 rounded-xl pl-12 pr-4 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tourSections.map((section) => (
                    <div 
                      key={section.id}
                      onClick={() => { setSelectedSectionId(section.id); setActiveView('tour'); }}
                      className={cn(
                        "group p-6 rounded-3xl bg-white/[0.02] border border-white/5 cursor-pointer hover:bg-white/[0.04] hover:border-cyan-500/40 transition-all",
                        completedSections.includes(section.id) && "border-emerald-500/40 bg-emerald-500/5"
                      )}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-2xl bg-white/5 text-cyan-400 group-hover:scale-110 transition-transform">
                          {section.icon}
                        </div>
                        {completedSections.includes(section.id) && (
                          <span className="text-[9px] font-black text-emerald-400 border border-emerald-400/30 px-2 py-0.5 rounded-md">SYNCED</span>
                        )}
                      </div>
                      <h3 className="text-lg font-black text-white italic uppercase tracking-tight mb-2">{section.title}</h3>
                      <p className="text-slate-500 text-sm leading-snug">{section.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeView === 'tour' && currentSection && (
              <div className="h-full flex flex-col items-center justify-center max-w-3xl mx-auto py-10">
                {/* PROGRESS HUD */}
                <div className="w-full mb-12 space-y-3">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-cyan-500">
                    <span>Protocol Stage {currentStepIndex + 1} of {currentSection.steps.length}</span>
                    <span>Sync Status: {Math.round(((currentStepIndex + 1) / currentSection.steps.length) * 100)}%</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-cyan-500 shadow-[0_0_10px_#06b6d4]"
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentStepIndex + 1) / currentSection.steps.length) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="w-full bg-white/[0.02] border border-white/10 rounded-[2rem] p-10 text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
                  
                  <div className="mx-auto h-16 w-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 mb-6">
                    <Target className="h-8 w-8 text-cyan-400" />
                  </div>

                  <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">
                    {currentStep?.title}
                  </h3>
                  <p className="text-slate-400 text-lg font-medium leading-relaxed mb-8 italic">
                    "{currentStep?.description}"
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentStep?.tips?.map((tip, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/5 text-left">
                        <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-12">
                  <button 
                    onClick={handlePrev}
                    disabled={currentStepIndex === 0}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-20 hover:bg-white/10 transition-all"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  
                  <Button 
                    onClick={handleNext}
                    className="h-16 px-10 bg-white text-black hover:bg-cyan-500 hover:text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl"
                  >
                    {currentStepIndex === currentSection.steps.length - 1 ? 'Finalize Protocol' : 'Next Stage'}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
      `}</style>
    </AnimatePresence>
  );
}