import React, { useState } from "react";
import { useStore } from "@/lib/mk-store";
import { motion, AnimatePresence } from "motion/react";
import { Crown, User, ShoppingBag, ShieldCheck, ChevronRight, Minimize2, Lock, X, LogIn } from "lucide-react";

export const UnifiedRoleNavigator: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const currentUser = useStore((state) => state.currentUser);
  const login = useStore((state) => state.login);
  const logout = useStore((state) => state.logout);
  const unlockTable = useStore((state) => state.unlockTable);

  // Point 2: Admin auth prompt
  const [adminPromptOpen, setAdminPromptOpen] = useState(false);
  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [adminError, setAdminError] = useState<string | null>(null);

  const handleRoleSwitch = (role: "customer" | "reception" | "admin") => {
    if (role === "customer") {
      unlockTable("table_5");
      window.history.pushState({}, "", "?table=5");
      window.dispatchEvent(new Event("popstate"));
    } else if (role === "reception") {
      logout();
      login("reception", "reception");
      window.history.pushState({}, "", "/");
      window.dispatchEvent(new Event("popstate"));
    } else if (role === "admin") {
      // Open auth prompt instead of direct switch
      setAdminUser("");
      setAdminPass("");
      setAdminError(null);
      setAdminPromptOpen(true);
    }
  };

  const handleAdminAuth = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!adminUser.trim() || !adminPass.trim()) {
      setAdminError("Username and password required.");
      return;
    }
    // Try login. If success and the resulting user is admin, accept; else rollback.
    logout();
    const ok = login(adminUser.trim(), adminPass);
    if (!ok) {
      setAdminError("Invalid admin credentials.");
      return;
    }
    const newUser = useStore.getState().currentUser;
    if (newUser?.role !== "admin") {
      // not admin -> reject
      logout();
      setAdminError("These credentials are not for an admin account.");
      return;
    }
    setAdminPromptOpen(false);
    setIsOpen(false);
    window.history.pushState({}, "", "/");
    window.dispatchEvent(new Event("popstate"));
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 font-sans pointer-events-none select-none">
        <AnimatePresence>
          {isOpen ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 20, stiffness: 220 }}
              className="w-80 bg-white/90 backdrop-blur-xl border-2 border-gold-rich/30 shadow-2xl rounded-3xl p-5 pointer-events-auto overflow-hidden relative"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-royal-gradient" />

              <div className="flex items-center justify-between pb-3 border-b border-gold-rich/10 mb-4">
                <div className="flex items-center gap-1.5">
                  <Crown className="w-5 h-5 text-gold-rich" />
                  <span className="font-serif font-bold text-xs text-maroon-royal uppercase tracking-wider">
                    Portal Navigator
                  </span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full text-mocha hover:text-maroon-royal hover:bg-cream-warm/30 transition-colors"
                  title="Minimize"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[10px] text-mocha font-semibold uppercase tracking-wider mb-3 leading-snug">
                Instant Multi-Role Toggles
              </p>

              <div className="space-y-2.5">
                <button
                  onClick={() => handleRoleSwitch("customer")}
                  className="w-full text-left p-3 rounded-2xl border border-gold-rich/10 bg-cream-ivory hover:bg-cream-warm/40 hover:border-gold-rich/30 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-xl text-maroon-royal border border-gold-rich/15 group-hover:scale-105 transition-transform">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-espresso">Customer view</span>
                      <span className="block text-[9px] text-mocha font-medium mt-0.5">Simulate scanning Table 5 Menu</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-mocha group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => handleRoleSwitch("reception")}
                  className="w-full text-left p-3 rounded-2xl border border-gold-rich/10 bg-cream-ivory hover:bg-cream-warm/40 hover:border-gold-rich/30 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-xl text-maroon-light border border-gold-rich/15 group-hover:scale-105 transition-transform">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-espresso">Reception Portal</span>
                      <span className="block text-[9px] text-mocha font-medium mt-0.5">Operational billing & orders</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-mocha group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => handleRoleSwitch("admin")}
                  className="w-full text-left p-3 rounded-2xl border-2 border-maroon-royal/30 bg-gradient-to-br from-cream-ivory to-cream-warm/40 hover:border-maroon-royal/60 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-xl text-maroon-royal border border-gold-rich/20 group-hover:scale-105 transition-transform">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-espresso flex items-center gap-1">
                        Admin Console <Lock className="w-3 h-3 text-maroon-royal" />
                      </span>
                      <span className="block text-[9px] text-mocha font-medium mt-0.5">Requires admin credentials</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-mocha group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="mt-4 pt-3 border-t border-gold-rich/10 text-center">
                <span className="text-[9px] text-mocha font-bold uppercase tracking-widest block">Active Session</span>
                <span className="inline-block mt-1 px-3 py-1 bg-royal-gradient text-white text-[10px] font-bold rounded-lg border border-maroon-royal/20 uppercase tracking-wider">
                  {currentUser ? `${currentUser.role} (${currentUser.username})` : "Guest / Logged Out"}
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.button
              key="collapsed-bubble"
              onClick={() => setIsOpen(true)}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-4 rounded-full bg-royal-gradient text-white border-2 border-gold-rich shadow-2xl flex items-center gap-2 pointer-events-auto hover:brightness-110 active:scale-95 transition-all outline-none"
              title="Open Role Navigator"
            >
              <Crown className="w-5 h-5 text-gold-rich animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider pr-1 text-white hidden sm:inline">
                Switch Roles
              </span>
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-shimmer opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-gold-rich border border-white"></span>
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Point 2: Admin auth prompt modal */}
      <AnimatePresence>
        {adminPromptOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-charcoal-deep/80 backdrop-blur-md"
              onClick={() => setAdminPromptOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-cream-ivory rounded-3xl border-2 border-gold-rich/40 shadow-2xl p-6 z-10"
            >
              <button
                onClick={() => setAdminPromptOpen(false)}
                className="absolute top-3 right-3 p-1 rounded-full text-mocha hover:text-maroon-royal hover:bg-cream-warm/50"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="text-center mb-4">
                <div className="w-12 h-12 rounded-full bg-royal-gradient flex items-center justify-center mx-auto mb-2 border-2 border-gold-rich">
                  <ShieldCheck className="w-6 h-6 text-gold-shimmer" />
                </div>
                <h3 className="font-serif text-lg font-bold text-maroon-royal">Admin Authentication</h3>
                <p className="text-[11px] text-mocha mt-1">Enter admin username and password to enter the Admin Console.</p>
              </div>
              <form onSubmit={handleAdminAuth} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-maroon-royal mb-1">Admin Username</label>
                  <input
                    type="text"
                    value={adminUser}
                    onChange={(e) => setAdminUser(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border-2 border-gold-rich/20 rounded-xl focus:outline-none focus:border-gold-rich bg-white text-espresso"
                    placeholder="Admin username"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-maroon-royal mb-1">Admin Password</label>
                  <input
                    type="password"
                    value={adminPass}
                    onChange={(e) => setAdminPass(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border-2 border-gold-rich/20 rounded-xl focus:outline-none focus:border-gold-rich bg-white text-espresso"
                    placeholder="••••••••"
                  />
                </div>
                {adminError && (
                  <div className="p-2.5 bg-danger/10 border border-danger/30 rounded-lg text-[11px] text-danger font-medium">
                    {adminError}
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full py-2.5 bg-royal-gradient text-white text-xs font-bold uppercase tracking-wider rounded-xl border border-maroon-royal/30 shadow-lg flex items-center justify-center gap-2 hover:brightness-110 transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  Verify & Enter Admin Console
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
