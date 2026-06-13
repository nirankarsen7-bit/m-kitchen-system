import React from "react";
import { motion } from "motion/react";
import { MaharajiLogo } from "@/components/mkitchen/PremiumUI";
import { ShieldCheck, User, ArrowRight } from "lucide-react";

interface Props {
  onSelectRole: (role: "reception" | "admin") => void;
}

/**
 * Point 11: Premium welcome page shown before LoginScreen.
 * CSS-driven cinematic restaurant background — animated smoke, flickering flame,
 * tossing pan, floating 3D red chillies, and sparks.
 */
export const WelcomeScreen: React.FC<Props> = ({ onSelectRole }) => {
  // pre-computed smoke / chili / spark positions for variety
  const smokes = [
    { left: "12%", delay: "0s" },
    { left: "28%", delay: "1.4s" },
    { left: "50%", delay: "0.6s" },
    { left: "72%", delay: "2.2s" },
    { left: "88%", delay: "3.4s" },
  ];
  const chilies = [
    { left: "8%", top: "18%", delay: "0s", size: 36 },
    { left: "82%", top: "22%", delay: "1.8s", size: 28 },
    { left: "16%", top: "68%", delay: "0.8s", size: 32 },
    { left: "78%", top: "62%", delay: "2.4s", size: 40 },
    { left: "46%", top: "8%", delay: "3.1s", size: 26 },
    { left: "58%", top: "78%", delay: "1.2s", size: 30 },
  ];
  const sparks = Array.from({ length: 14 }).map((_, i) => ({
    left: `${30 + Math.random() * 40}%`,
    bottom: `${10 + Math.random() * 12}%`,
    delay: `${(i * 0.18).toFixed(2)}s`,
    sx: `${(Math.random() - 0.5) * 120}px`,
    sy: `-${60 + Math.random() * 80}px`,
  }));

  return (
    <div className="welcome-bg min-h-screen relative overflow-hidden font-sans text-cream-ivory select-none">
      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.6) 100%)",
      }} />

      {/* Rising smoke wisps */}
      {smokes.map((s, i) => (
        <span
          key={i}
          className="welcome-smoke"
          style={{ left: s.left, animationDelay: s.delay }}
        />
      ))}

      {/* Floating 3D red chillies */}
      {chilies.map((c, i) => (
        <div
          key={i}
          className="welcome-chili absolute pointer-events-none"
          style={{ left: c.left, top: c.top, animationDelay: c.delay, width: c.size, height: c.size * 1.4 }}
        >
          <svg viewBox="0 0 40 56" width="100%" height="100%">
            <defs>
              <linearGradient id={`chili-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF4D2E" />
                <stop offset="55%" stopColor="#DC2626" />
                <stop offset="100%" stopColor="#7A0F0F" />
              </linearGradient>
              <linearGradient id={`stem-${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3F6B22" />
                <stop offset="100%" stopColor="#1F3D0F" />
              </linearGradient>
            </defs>
            {/* stem */}
            <path d="M18 2 Q22 6 20 12 L18 12 Q16 6 14 4 Z" fill={`url(#stem-${i})`} />
            {/* chili body */}
            <path d="M18 12 Q34 18 30 38 Q26 54 16 52 Q8 48 12 32 Q14 20 18 12 Z" fill={`url(#chili-${i})`} />
            {/* highlight */}
            <path d="M20 16 Q26 22 24 34 Q22 42 19 44" stroke="rgba(255,200,180,0.55)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </svg>
        </div>
      ))}

      {/* Flickering kitchen flame anchor */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-none" style={{ width: 140, height: 90 }}>
        {/* flame */}
        <svg viewBox="0 0 100 120" width="100%" height="100%" className="welcome-flame">
          <defs>
            <radialGradient id="flame-grad" cx="50%" cy="80%" r="60%">
              <stop offset="0%" stopColor="#FFEAA0" />
              <stop offset="40%" stopColor="#FFB347" />
              <stop offset="80%" stopColor="#FF5A1F" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#7A0F0F" stopOpacity="0" />
            </radialGradient>
          </defs>
          <path d="M50 110 Q20 90 30 60 Q35 40 45 30 Q48 50 55 40 Q70 55 70 80 Q70 100 50 110 Z" fill="url(#flame-grad)" />
        </svg>
        {/* sparks */}
        {sparks.map((s, i) => (
          <span
            key={i}
            className="welcome-spark"
            style={{ left: s.left, bottom: s.bottom, animationDelay: s.delay, ['--sx' as any]: s.sx, ['--sy' as any]: s.sy }}
          />
        ))}
      </div>

      {/* Pan toss (top-left subtle) */}
      <div className="absolute left-1/2 top-[18%] welcome-pan opacity-80 pointer-events-none" style={{ transform: "translate(-50%, 0)" }}>
        <svg width="120" height="60" viewBox="0 0 120 60">
          <defs>
            <linearGradient id="pan-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3A3A3A" />
              <stop offset="100%" stopColor="#0F0F0F" />
            </linearGradient>
          </defs>
          <ellipse cx="60" cy="20" rx="48" ry="14" fill="url(#pan-grad)" stroke="#1a1a1a" strokeWidth="1.5" />
          <ellipse cx="60" cy="18" rx="44" ry="10" fill="#1a1a1a" />
          <rect x="100" y="16" width="18" height="6" rx="3" fill="#4a2a18" />
          {/* tossed bits */}
          <circle cx="50" cy="6" r="2.5" fill="#FFB347" />
          <circle cx="65" cy="2" r="2" fill="#DC2626" />
          <circle cx="75" cy="9" r="2.2" fill="#F59E0B" />
        </svg>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center"
        >
          <div className="inline-block bg-white/95 rounded-3xl p-5 mb-4 shadow-2xl border-2 border-gold-rich/40 backdrop-blur-sm">
            <MaharajiLogo size="lg" />
          </div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="welcome-title font-serif text-5xl md:text-6xl font-black tracking-tight mt-2"
          >
            Welcome to Maharaji Kitchen
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="text-cream-warm/90 font-accent italic text-base md:text-lg mt-3 tracking-[0.15em]"
          >
            Royal Taste, Royal Experience — Nagrakata
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.7 }}
          className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-2xl"
        >
          {/* Reception card */}
          <button
            onClick={() => onSelectRole("reception")}
            className="card-elite group relative overflow-hidden p-6 rounded-3xl bg-white/95 border-2 border-gold-rich/40 hover:border-maroon-royal text-left shadow-2xl"
          >
            <div className="absolute top-0 inset-x-0 h-1.5 bg-royal-gradient" />
            <div className="flex items-center justify-between">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-cream-warm to-cream-ivory border border-gold-rich/20 group-hover:scale-110 transition-transform duration-300">
                <User className="w-8 h-8 text-maroon-royal" />
              </div>
              <ArrowRight className="w-5 h-5 text-mocha group-hover:translate-x-2 group-hover:text-maroon-royal transition-all" />
            </div>
            <h3 className="font-serif text-2xl font-black text-maroon-royal mt-4">Reception</h3>
            <p className="text-xs text-mocha mt-1 leading-relaxed font-medium">Manage tables, live orders, billing & checkout.</p>
            <div className="mt-3 inline-block px-3 py-1 rounded-full bg-cream-warm border border-gold-rich/30 text-[10px] uppercase tracking-widest font-bold text-mocha">
              Front-desk portal
            </div>
          </button>

          {/* Admin card */}
          <button
            onClick={() => onSelectRole("admin")}
            className="card-elite group relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-[#2D1810] to-[#1C1917] border-2 border-gold-rich/50 hover:border-gold-shimmer text-left shadow-2xl"
          >
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gold-gradient" />
            <div className="flex items-center justify-between">
              <div className="p-4 rounded-2xl bg-white/5 border border-gold-rich/30 group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck className="w-8 h-8 text-gold-shimmer" />
              </div>
              <ArrowRight className="w-5 h-5 text-gold-shimmer group-hover:translate-x-2 transition-all" />
            </div>
            <h3 className="font-serif text-2xl font-black welcome-title mt-4">Admin</h3>
            <p className="text-xs text-cream-warm/85 mt-1 leading-relaxed font-medium">Full controls — menu, stock, reports, settings.</p>
            <div className="mt-3 inline-block px-3 py-1 rounded-full bg-white/5 border border-gold-rich/30 text-[10px] uppercase tracking-widest font-bold text-gold-shimmer">
              Secured login required
            </div>
          </button>
        </motion.div>

        <p className="absolute bottom-4 left-0 right-0 text-center text-[10px] uppercase tracking-[0.3em] text-cream-warm/50 font-mono">
          Maharaji Kitchen · Nagrakata, NH31C · West Bengal
        </p>
      </div>
    </div>
  );
};
