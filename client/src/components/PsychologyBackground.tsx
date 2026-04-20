import React, { useMemo } from 'react';

const concepts = [
  "Anxiety", "Depression", "Bipolar", "PTSD", "Resilience", 
  "OCD", "Cognition", "Therapy", "Healing", "Mindfulness",
  "Dopamine", "Serotonin", "Trauma", "Self-Care", "Phobia"
];

export const PsychologyBackground = () => {
  // Memoize to prevent repositioning on every re-render
  const floatingWords = useMemo(() => {
    return concepts.map((text, i) => ({
      text,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      duration: `${Math.random() * 20 + 20}s`,
      delay: `${Math.random() * -20}s`,
      size: `${Math.random() * 1.5 + 0.8}rem`,
      opacity: Math.random() * 0.15 + 0.05
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {floatingWords.map((word, i) => (
        <span
          key={i}
          className="absolute text-slate-500 font-serif animate-drift"
          style={{
            top: word.top,
            left: word.left,
            fontSize: word.size,
            opacity: word.opacity,
            animationDuration: word.duration,
            animationDelay: word.delay,
          }}
        >
          {word.text}
        </span>
      ))}
    </div>
  );
};