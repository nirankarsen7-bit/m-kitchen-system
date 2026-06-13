import React, { useState, useEffect } from "react";
import { useStore } from "@/lib/mk-store";
import { MaharajiLogo, Button, Card, FormInput } from "@/components/mkitchen/PremiumUI";
import { KeyRound, User, Lock, LogIn, ChevronLeft, CircleAlert as AlertCircle, ShieldCheck } from "lucide-react";

interface LoginScreenProps {
  prefilledRole?: "reception" | "admin" | null;
  onBack?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ prefilledRole, onBack }) => {
  const login = useStore(state => state.login);

  // States
  const [username, setUsername] = useState(prefilledRole === "reception" ? "reception" : "");
  const [password, setPassword] = useState(prefilledRole === "reception" ? "reception" : "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If user comes back to login, sync prefilled values
  useEffect(() => {
    if (prefilledRole === "reception") {
      setUsername("reception");
      setPassword("reception");
    } else if (prefilledRole === "admin") {
      setUsername("");
      setPassword("");
    }
  }, [prefilledRole]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError("Please key in both username and password.");
      return;
    }

    setLoading(true);

    // Simulate luxury verification delays
    setTimeout(() => {
      const success = login(username, password);
      setLoading(false);

      if (success) {
        // Keep persisted activeTab — do not force "live" on every login.
      } else {
        // Red shake feedback trigger
        setError("Invalid royal credentials. Please retry.");
      }
    }, 800);
  };


  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 bg-cream-soft font-sans text-espresso select-none">
      
      {/* Decorative Palace Mandala Overlays in backgrounds */}
      <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(#7B1E2B_2px,transparent_2px)] [background-size:16px_16px] pointer-events-none" />

      <div className="max-w-md w-full scale-100 transition-all duration-500 relative z-10">
        
        {/* Upper Floating Back Button - go back to welcome page if available, else to customer menu */}
        <button
          onClick={() => {
            if (onBack) {
              onBack();
            } else {
              window.history.pushState({}, "", "?table=5");
              window.dispatchEvent(new Event("popstate"));
            }
          }}
          className="absolute -top-14 left-0 flex items-center gap-1 text-xs text-mocha hover:text-maroon-royal font-bold transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{onBack ? "Back to Welcome" : "Exit to Customer Menu"}</span>
        </button>

        {prefilledRole === "admin" && (
          <div className="absolute -top-14 right-0 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gold-shimmer bg-maroon-deep/80 px-3 py-1.5 rounded-lg border border-gold-rich/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin Login
          </div>
        )}

        <Card variant="glass" className="border-2 border-gold-rich/30 relative overflow-hidden py-10 px-8 md:px-10 rounded-3xl">
          {/* Header crown glow lines */}
          <div className="absolute top-0 inset-x-0 h-2 bg-royal-gradient" />

          {/* Logo center column */}
          <div className="mb-8">
            <MaharajiLogo size="lg" />
          </div>

          <div className="text-center mb-6">
            <h2 className="font-serif text-lg font-bold text-maroon-royal flex items-center justify-center gap-1.5 uppercase tracking-wider">
              <KeyRound className="w-4.5 h-4.5 text-gold-rich animate-pulse" />
              Staff Gateway
            </h2>
            <p className="text-xs text-mocha mt-1">
              Authenticate of security credentials to unlock restaurant POS dashboards.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <FormInput
              label="Staff Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              icon={<User className="w-4 h-4 text-mocha" />}
              placeholder="Username"
              disabled={loading}
              required
            />

            <FormInput
              label="Private Passphrase"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4 text-mocha" />}
              placeholder="••••••••"
              disabled={loading}
              required
            />

            {error && (
              <div className="p-3.5 bg-danger/10 border border-danger/35 rounded-xl text-xs text-danger font-medium flex items-center gap-2 animate-bounce">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3.5 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider shadow-lg shadow-maroon-deep/30 cursor-pointer"
              loading={loading}
            >
              <LogIn className="w-4 h-4" />
              <span>Verify and Enter Portal</span>
            </Button>
          </form>

          {/* Secure gateway compliance */}
          <div className="mt-8 pt-4 border-t border-gold-rich/10 text-center text-[9px] text-mocha uppercase tracking-widest font-mono">
            Authorized Personnel Gateway Only
          </div>
        </Card>
      </div>
    </div>
  );
};
