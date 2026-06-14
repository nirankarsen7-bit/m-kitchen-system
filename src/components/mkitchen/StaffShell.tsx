import React, { useState, useEffect } from "react";
import { useStore } from "@/lib/mk-store";
import { UserRole } from "@/lib/mk-types";
import { MaharajiLogo, Button } from "@/components/mkitchen/PremiumUI";
import { motion, AnimatePresence } from "motion/react";
import { Hop as Home, Grid2x2 as Grid, ClipboardList, ChefHat, Gift, Package, FileText, ChartBar as BarChart3, QrCode, Settings, LogOut, Clock, User, Menu, ChevronLeft, ChevronRight, Crown, Truck } from "lucide-react";

interface ShellProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}


export const StaffShell: React.FC<ShellProps> = ({ children, activeTab, setActiveTab }) => {
  const currentUser = useStore(state => state.currentUser);
  const logout = useStore(state => state.logout);

  // States
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [time, setTime] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Clock ticks every second
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!currentUser) return null;

  // Exact 10 sidebar links aligned with activeTab identifiers in App
  // F19: POS Settings renamed to System Settings
  // F7: Today's Offer renamed to Maharaji Special Discount
  const isAdmin = currentUser.role === UserRole.ADMIN;
  const allSidebarItems = [
    { name: "Live Dashboard", path: "live", icon: <Home className="w-5 h-5" />, adminOnly: false },
    { name: "Table Management", path: "tables", icon: <Grid className="w-5 h-5" />, adminOnly: false },
    { name: "Active Orders", path: "checkout", icon: <ClipboardList className="w-5 h-5" />, adminOnly: false },
    { name: "Menu Management", path: "menu", icon: <ChefHat className="w-5 h-5" />, adminOnly: false },
    { name: "Maharaji Special Discount", path: "offers", icon: <Gift className="w-5 h-5" />, adminOnly: true },
    { name: "Stock / Materials", path: "stock", icon: <Package className="w-5 h-5" />, adminOnly: false },
    { name: "Suppliers", path: "suppliers", icon: <Truck className="w-5 h-5" />, adminOnly: false },
    { name: "Bills & History", path: "archive", icon: <FileText className="w-5 h-5" />, adminOnly: false },
    { name: "Reports & Stats", path: "stats", icon: <BarChart3 className="w-5 h-5" />, adminOnly: false },
    { name: "Table QR Codes", path: "qr", icon: <QrCode className="w-5 h-5" />, adminOnly: false },
    { name: "System Settings", path: "config", icon: <Settings className="w-5 h-5" />, adminOnly: true }
  ];
  const sidebarItems = allSidebarItems.filter(item => !item.adminOnly || isAdmin);


  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] font-sans flex text-espresso out-of-boundary-scroll">
      
      {/* 1. LEFT SIDEBAR COLLAPSIBLE MODULE (Responsive Desktop / Hidden Mobile) */}
      <aside 
        className={`bg-luxury-dark text-cream-ivory flex-col border-r border-gold-rich/20 select-none z-30 transition-all duration-300 hidden md:flex ${
          sidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Core Header area with Brand Logo */}
        <div className="h-20 flex items-center justify-between border-b border-gold-rich/15 px-3 bg-gradient-to-b from-charcoal-deep to-luxury-dark">
          {!sidebarCollapsed ? (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex items-center gap-2.5 truncate"
            >
              <MaharajiLogo size="sm" />
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="text-gold-rich text-center w-full flex justify-center"
            >
              <Crown className="w-6 h-6 text-gold-rich animate-pulse" />
            </motion.div>
          )}

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 rounded bg-white/5 border border-white/10 hover:bg-white/15 text-gold-rich cursor-pointer shrink-0"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Premium animated role badge — high-contrast, always visible */}
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.55, ease: "easeOut" }}
            className="px-3 pt-3"
          >
            <div className="relative bg-gradient-to-r from-gold-rich via-gold-shimmer to-gold-rich text-charcoal-deep px-3 py-2.5 rounded-xl border-2 border-gold-rich shadow-[0_0_18px_rgba(245,220,138,0.45)] flex items-center gap-2 overflow-hidden animate-role-pulse">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-shimmer-sweep" />
              <Crown className="w-4 h-4 text-maroon-deep relative z-10 drop-shadow" />
              <span className="font-serif font-black text-[11px] uppercase tracking-[0.22em] relative z-10 text-maroon-deep">
                {currentUser.role} Portal
              </span>
              <span className="ml-auto relative z-10 w-1.5 h-1.5 rounded-full bg-success animate-ping" />
            </div>
          </motion.div>
        )}


        {/* Premium animated sidebar buttons */}
        <nav className="flex-1 py-4 px-2 space-y-1.5 overflow-y-auto">
          {sidebarItems.map((item, idx) => {
            const isActive = activeTab === item.path;

            return (
              <motion.button
                key={idx}
                onClick={() => setActiveTab(item.path)}
                whileHover={{ x: 3, scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 380, damping: 22 }}
                className={`w-full text-left flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-[11px] font-semibold uppercase tracking-wider transition-all duration-300 group relative cursor-pointer overflow-hidden ${
                  isActive
                    ? "bg-gradient-to-r from-maroon-deep via-maroon-royal to-maroon-deep text-white shadow-[0_8px_24px_-6px_rgba(123,30,43,0.7)] font-bold border border-gold-rich/40"
                    : "text-cream-warm/85 border border-transparent hover:border-gold-rich/20 hover:bg-gradient-to-r hover:from-white/[0.08] hover:to-white/[0.02] hover:text-white hover:shadow-[0_4px_14px_-4px_rgba(245,220,138,0.25)]"
                }`}
              >
                {/* Hover sheen sweep */}
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-gold-shimmer/15 to-transparent pointer-events-none" />

                {/* Active glowing gold accent bar */}
                {isActive && (
                  <motion.span
                    layoutId="active-side-bar"
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r bg-gold-gradient shadow-[0_0_12px_rgba(245,220,138,0.85)]"
                  />
                )}
                <div className={`transition-all duration-300 group-hover:rotate-6 group-hover:scale-110 relative z-10 ${isActive ? "text-gold-shimmer drop-shadow-[0_0_6px_rgba(245,220,138,0.85)]" : "group-hover:text-gold-shimmer"}`}>
                  {item.icon}
                </div>
                {!sidebarCollapsed && <span className="relative z-10">{item.name}</span>}

                {sidebarCollapsed && (
                  <div className="absolute left-16 px-2.5 py-1.5 bg-charcoal-deep border border-gold-rich/30 rounded shadow-lg text-[9px] text-cream-ivory uppercase tracking-widest leading-none invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all z-40 whitespace-nowrap">
                    {item.name}
                  </div>
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Bottom profile actions */}
        <div className="p-3 border-t border-gold-rich/10 space-y-2.5 bg-charcoal-deep/40">
          {!sidebarCollapsed && (
            <div className="px-2 py-1.5 rounded-lg border border-white/5 bg-white/5 flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-gold-gradient text-charcoal-deep font-mono text-xs font-black flex items-center justify-center border border-gold-rich">
                {currentUser.username[0].toUpperCase()}
              </div>
              <div className="truncate">
                <span className="block text-[10px] text-mocha font-bold uppercase leading-none tracking-wide">CAPTAIN</span>
                <span className="text-xs text-white leading-tight font-medium select-all">{currentUser.username}</span>
              </div>
            </div>
          )}
          <Button
            variant="danger"
            size="sm"
            onClick={handleLogout}
            className={`w-full py-2 uppercase tracking-widest text-[9px] font-bold flex items-center justify-center gap-1.5 ${sidebarCollapsed ? "px-0" : ""}`}
          >
            <LogOut className="w-3.5 h-3.5" />
            {!sidebarCollapsed && <span>Logout Panel</span>}
          </Button>
        </div>
      </aside>

      {/* MOBILE POPUP SIDEBAR */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden flex">
            {/* Backdrop Blur */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-charcoal-deep/80 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Sidebar drawer content */}
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-64 bg-luxury-dark border-r border-gold-rich/35 text-cream-ivory p-4 flex flex-col justify-between h-full z-10 font-sans"
            >
              <div>
                <div className="flex items-center justify-between border-b border-gold-rich/15 pb-4 mb-4">
                  <MaharajiLogo size="sm" />
                  <button onClick={() => setMobileMenuOpen(false)} className="text-gold-rich font-bold border border-white/10 p-1 px-2.5 rounded hover:bg-white/5">X</button>
                </div>
                <nav className="space-y-1.5">
                  {sidebarItems.map((item, idx) => {
                    const isActive = activeTab === item.path;

                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setActiveTab(item.path);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full text-left flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer ${
                          isActive 
                            ? "bg-royal-gradient text-white border-l-[3px] border-gold-rich shadow" 
                            : "text-cream-warm hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        {item.icon}
                        <span>{item.name}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="p-1.5 border-t border-gold-rich/10 space-y-3">
                <div className="rounded-lg border border-white/5 bg-white/5 flex items-center gap-2 p-1.5">
                  <div className="h-8 w-8 rounded-full bg-gold-gradient text-charcoal-deep font-mono text-xs font-black flex items-center justify-center border border-gold-rich">
                    {currentUser.username[0].toUpperCase()}
                  </div>
                  <div>
                    <span className="block text-[9px] text-mocha font-bold uppercase leading-none">ROLE</span>
                    <span className="text-xs text-white leading-tight font-medium">{currentUser.role}</span>
                  </div>
                </div>
                <Button variant="danger" size="sm" className="w-full text-[10px]" onClick={handleLogout}>
                  Logout Panel
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. MAIN HUB SECTION */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* PREMIUM TOP BAR */}
        <header className="h-16 bg-white border-b border-gold-rich/10 flex items-center justify-between px-4 md:px-6 shrink-0 relative z-10 select-none">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 px-2 border border-gold-rich/20 rounded-lg text-maroon-royal bg-cream-warm/10 md:hidden hover:bg-cream-warm"
            >
              <Menu className="w-5 h-5" />
            </button>

            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="font-serif font-black text-maroon-royal flex items-center gap-2 md:text-lg relative"
            >
              <Crown className="w-5 h-5 text-gold-rich animate-pulse" />
              <span className="bg-royal-gradient text-transparent bg-clip-text font-black tracking-wide relative overflow-hidden">
                MAHARAJI KITCHEN
              </span>
              <span className="text-[10px] md:text-xs font-accent italic text-mocha capitalize">({currentUser.role})</span>
            </motion.div>

          </div>

          <div className="flex items-center gap-4">
            {/* Real-time Ticking Pos Clock is MONOSPACED */}
            <div className="flex items-center gap-2 bg-cream-warm/30 border border-gold-rich/15 px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold text-maroon-royal shadow-inner">
              <Clock className="w-3.5 h-3.5 text-gold-rich animate-pulse" />
              <span>{time}</span>
            </div>

            {/* Profile Avatar bubble */}
            <div className="hidden sm:flex items-center gap-2 border-l border-gold-rich/15 pl-4">
              <div className="text-right">
                <span className="block text-[10px] text-mocha font-bold uppercase leading-none tracking-wider">{currentUser.role}</span>
                <span className="text-xs text-espresso font-semibold font-mono leading-tight">{currentUser.username}</span>
              </div>
              <div className="h-9 w-9 rounded-full bg-royal-gradient text-white flex items-center justify-center font-bold text-sm border-2 border-gold-rich">
                <User className="w-4 h-4 text-gold-light" />
              </div>
            </div>
          </div>
        </header>

        {/* INBUILT COMPONENT CHASSIS */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#FAF7F2]">
          {children}
        </main>
      </div>

    </div>
  );
};
