import React from "react";
import { motion } from "motion/react";
import { ShieldCheck, User, ArrowRight, Crown } from "lucide-react";
import welcomeVideo from "@/assets/welcome-bg.mp4.asset.json";

interface Props {
  onSelectRole: (role: "reception" | "admin") => void;
}

/**
 * Premium homepage: looping video background + minimal logo/title (no card) +
 * high-end animated buttons for Reception and Admin.
 */
export const WelcomeScreen: React.FC<Props> = ({ onSelectRole }) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden font-sans text-cream-ivory select-none">
      {/* Background video */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src={welcomeVideo.url}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />
      {/* Cinematic overlays for legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/75" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.65) 100%)" }}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-between px-6 py-10">
        {/* Top: minimal logo + name, no card */}
        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="flex items-center gap-3"
        >
          <div className="w-11 h-11 rounded-full bg-royal-gradient border border-gold-rich/70 flex items-center justify-center shadow-[0_0_20px_rgba(201,168,76,0.45)]">
            <Crown className="w-5 h-5 text-gold-shimmer" />
          </div>
          <div className="leading-tight">
            <h1 className="font-serif text-xl md:text-2xl font-black tracking-wide text-cream-ivory drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
              Maharaji Kitchen
            </h1>
            <p className="font-accent italic text-[10px] md:text-[11px] tracking-[0.25em] text-gold-shimmer/90 uppercase">
              Royal Taste · Nagrakata
            </p>
          </div>
        </motion.div>

        {/* Center spacer to push buttons to lower-middle */}
        <div className="flex-1" />

        {/* Hero tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-center mb-10"
        >
          <h2 className="font-serif text-4xl md:text-6xl font-black tracking-tight text-cream-ivory drop-shadow-[0_4px_18px_rgba(0,0,0,0.85)]">
            Welcome <span className="text-gold-shimmer">to the Palace</span>
          </h2>
          <p className="mt-3 text-cream-warm/90 font-accent italic text-sm md:text-base tracking-[0.18em]">
            Select your portal to begin
          </p>
        </motion.div>

        {/* Premium animated buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-2xl pb-12"
        >
          <PremiumButton
            onClick={() => onSelectRole("reception")}
            icon={<User className="w-7 h-7" />}
            title="Reception"
            subtitle="Tables · Orders · Billing"
            tone="cream"
          />
          <PremiumButton
            onClick={() => onSelectRole("admin")}
            icon={<ShieldCheck className="w-7 h-7" />}
            title="Admin"
            subtitle="Full restaurant control"
            tone="gold"
          />
        </motion.div>

        <p className="text-center text-[10px] uppercase tracking-[0.35em] text-cream-warm/60 font-mono pb-2">
          Maharaji Kitchen · Nagrakata, NH31C · West Bengal
        </p>
      </div>
    </div>
  );
};

const PremiumButton: React.FC<{
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  tone: "cream" | "gold";
}> = ({ onClick, icon, title, subtitle, tone }) => {
  const isGold = tone === "gold";
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.035, y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 300, damping: 18 }}
      className={`group relative overflow-hidden rounded-2xl p-5 text-left border-2 backdrop-blur-md shadow-2xl ${
        isGold
          ? "bg-gradient-to-br from-[#2a1810]/85 to-[#0f0a06]/85 border-gold-rich/70 hover:border-gold-shimmer"
          : "bg-white/10 border-cream-ivory/40 hover:border-cream-ivory/80"
      }`}
    >
      {/* shimmer sweep */}
      <span
        className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1200ms] ease-out pointer-events-none"
        style={{
          background:
            "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.25) 50%, transparent 70%)",
        }}
      />
      {/* top accent line */}
      <span
        className={`absolute top-0 inset-x-0 h-[2px] ${isGold ? "bg-gold-gradient" : "bg-cream-ivory/70"}`}
      />
      {/* glow */}
      <span
        className={`absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${
          isGold ? "shadow-[0_0_40px_rgba(201,168,76,0.45)]" : "shadow-[0_0_40px_rgba(255,250,235,0.3)]"
        }`}
      />

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`p-3 rounded-xl border ${
              isGold
                ? "bg-white/5 border-gold-rich/40 text-gold-shimmer"
                : "bg-white/15 border-cream-ivory/40 text-cream-ivory"
            } group-hover:scale-110 transition-transform duration-300`}
          >
            {icon}
          </div>
          <div>
            <div
              className={`font-serif text-2xl font-black tracking-wide ${
                isGold ? "text-gold-shimmer" : "text-cream-ivory"
              } drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]`}
            >
              {title}
            </div>
            <div className="text-[11px] uppercase tracking-[0.18em] font-bold text-cream-warm/85 mt-0.5">
              {subtitle}
            </div>
          </div>
        </div>
        <ArrowRight
          className={`w-5 h-5 ${
            isGold ? "text-gold-shimmer" : "text-cream-ivory"
          } group-hover:translate-x-2 transition-transform duration-300`}
        />
      </div>
    </motion.button>
  );
};
