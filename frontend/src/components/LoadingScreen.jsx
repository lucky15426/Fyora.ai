import { useState, useEffect } from 'react';
import Aurora from './Aurora';
import { motion, AnimatePresence } from 'framer-motion';
import { Hourglass } from 'lucide-react';

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);

  const statuses = [
    "Initializing Neural Core...",
    "Analyzing Local Context...",
    "Aligning Vector Space...",
    "Neural Bridge Ready"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        // Random incremental steps for 'organic' feel
        const increment = Math.floor(Math.random() * 5) + 2;
        return Math.min(prev + increment, 100);
      });
    }, 200);

    const statusTimer = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % statuses.length);
    }, 2500);

    return () => {
      clearInterval(timer);
      clearInterval(statusTimer);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050508] overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 opacity-100">
        <Aurora
          colorStops={["#5cfc7c", "#bf89d3", "#5227FF"]}
          blend={0.5}
          amplitude={1.2}
          speed={1.5}
        />
      </div>

      {/* Content Container */}
      <div className="relative z-20 flex flex-col items-center max-w-2xl w-full px-8">

        {/* Branding (Classical Serif Style) */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex items-baseline gap-1 mb-12"
        >
          <h1 className="text-7xl md:text-8xl font-normal text-white tracking-tight" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Fyora
          </h1>
          <span className="text-5xl md:text-6xl font-light text-[var(--accent)] tracking-tighter" style={{ fontFamily: "'Inter', sans-serif" }}>
            .ai
          </span>
        </motion.div>

        {/* Subtle Divider Line */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 0.2 }}
          transition={{ delay: 0.5, duration: 1.5 }}
          className="w-full h-[1px] bg-white mb-8"
        />

        {/* Loading Message & Percentage */}
        <div className="flex flex-col items-center gap-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="flex items-center gap-3"
          >
            <Hourglass className="w-3.5 h-3.5 text-[var(--text-muted)] animate-spin-slow" />
            <AnimatePresence mode="wait">
              <motion.span
                key={statusIndex}
                initial={{ y: 5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -5, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="text-[11px] text-[var(--text-secondary)] uppercase tracking-[0.4em] font-medium"
              >
                {statuses[statusIndex]}
              </motion.span>
            </AnimatePresence>
          </motion.div>

          {/* Progress Bar & Percentage */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-48 h-[1px] bg-white/5 overflow-hidden">
              <motion.div
                animate={{ scaleX: progress / 100 }}
                className="h-full bg-white/40 origin-left"
              />
            </div>
            <span className="text-sm font-light text-white/60 tracking-[0.3em] font-mono">
              {progress}%
            </span>
          </motion.div>
        </div>
      </div>

      {/* Atmospheric Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,5,8,0.2)_80%,rgba(5,5,8,1)_100%)]" />
    </div>
  );
}
