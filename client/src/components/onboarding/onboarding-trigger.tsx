import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, HelpCircle } from 'lucide-react';

interface OnboardingTriggerProps {
  onClick: () => void;
  className?: string;
}

export function OnboardingTrigger({ onClick, className = '' }: OnboardingTriggerProps) {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 260, 
        damping: 20,
        delay: 0.5 
      }}
      className={`fixed bottom-6 right-6 z-40 ${className}`}
    >
      <motion.div
        animate={{ 
          y: [0, -10, 0],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity, 
          repeatType: "reverse",
          ease: "easeInOut"
        }}
      >
        <Button
          onClick={onClick}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
        >
          {/* Animated background sparkles */}
          <motion.div
            className="absolute inset-0 opacity-20"
            animate={{
              background: [
                "radial-gradient(circle at 20% 20%, white 2px, transparent 2px)",
                "radial-gradient(circle at 80% 80%, white 2px, transparent 2px)",
                "radial-gradient(circle at 40% 60%, white 2px, transparent 2px)",
                "radial-gradient(circle at 20% 20%, white 2px, transparent 2px)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          {/* Main icon */}
          <motion.div
            animate={{ 
              rotate: [0, 360] 
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          >
            <Sparkles className="h-6 w-6 text-white" />
          </motion.div>
          
          {/* Pulse effect */}
          <motion.div
            className="absolute inset-0 rounded-full bg-white/20"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.1, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </Button>
      </motion.div>
      
      {/* Tooltip */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 2 }}
        className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap"
      >
        Take a tour!
        <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
      </motion.div>
    </motion.div>
  );
}

interface QuickHelpButtonProps {
  onClick: () => void;
}

export function QuickHelpButton({ onClick }: QuickHelpButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className="flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600 transition-colors"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        animate={{ rotate: [0, 15, -15, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <HelpCircle className="h-4 w-4" />
      </motion.div>
      Need help? Take a quick tour
    </motion.button>
  );
}