import React, { useState } from "react";
import { useStore } from "@/lib/mk-store";
import { TableStatus, UserRole } from "@/lib/mk-types";
import { Button, Card, FormInput, Modal } from "@/components/mkitchen/PremiumUI";
import { toast } from "sonner";
import { Settings, Trash2, RefreshCw, Check, FileSliders as Sliders, OctagonAlert as AlertOctagon } from "lucide-react";

export const DashboardSettings: React.FC = () => {
  // Zustand State
  const system = useStore(state => state.system);
  const posWidth = useStore(state => state.posWidth);
  const currentUser = useStore(state => state.currentUser);

  const setTagline = useStore(state => state.setTagline);
  const setPOSWidth = useStore(state => state.setPOSWidth);
  const setAuthCode = useStore(state => state.setAuthCode);
  const systemHardReset = useStore(state => state.systemHardReset);

  // States: POS config
  const [tagline, setTaglineVal] = useState(system.tagline);
  const [authCode, setAuthCodeVal] = useState(system.receptionAuthCode);

  // States: Hard Reset modal
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetPasscode, setResetPasscode] = useState("");
  const [resetError, setResetError] = useState<string | null>(null);

  // Handle baseline save
  const handleSavePOSBase = (e: React.FormEvent) => {
    e.preventDefault();
    setTagline(tagline);
    setAuthCode(authCode);
    toast.success("System settings saved successfully!");
  };

  // Handle hard reset overrides
  const handleConfirmHardReset = () => {
    const success = systemHardReset(resetPasscode);
    if (success) {
      setResetPasscode("");
      setResetError(null);
      setIsResetModalOpen(false);
      toast.success("System has been completely reset to factory defaults.");
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      setResetError("Invalid 6-digit Master Safety overwrite passcode!");
      toast.error("Invalid passcode!");
    }
  };

  const isAdmin = currentUser?.role === UserRole.ADMIN;

  return (
    <div className="space-y-8 font-sans select-none pb-8">

      {/* HEADER SECTION */}
      <div className="border-b border-gold-rich/10 pb-4">
        <h3 className="font-serif text-xl font-bold text-maroon-royal flex items-center gap-1.5">
          <Settings className="w-5 h-5 text-gold-rich" />
          System Settings
        </h3>
        <p className="text-xs text-mocha mt-1">
          Configure hardware settings, operations, and system maintenance options.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left column: POS hardware options (7 cols for admin, 12 for reception) */}
        <div className={`${isAdmin ? "lg:col-span-7" : "lg:col-span-12"} space-y-6`}>

          {/* Section A: POS Hardware options */}
          <Card className="p-5 bg-white border border-gold-rich/10 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-maroon-royal border-l-2 border-gold-rich pl-2 flex items-center gap-1">
              <Sliders className="w-4 h-4 text-gold-rich" /> Hardware & Operations Settings
            </h4>

            <form onSubmit={handleSavePOSBase} className="space-y-4">
              <FormInput
                label="Restaurant Slogan (Tagline)"
                value={tagline}
                onChange={(e) => setTaglineVal(e.target.value)}
                placeholder="Royal Slogan"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="Captain Verification Code (Edit Bills)"
                  type="password"
                  maxLength={4}
                  value={authCode}
                  onChange={(e) => setAuthCodeVal(e.target.value)}
                  placeholder="Password to verify edits"
                />

                <div className="relative mb-5 font-sans">
                  <label className="block text-[10px] text-maroon-royal uppercase font-bold tracking-wider mb-1">POS Printer Width Roll</label>
                  <select
                    value={posWidth}
                    onChange={(e) => setPOSWidth(e.target.value as any)}
                    className="w-full px-3.5 py-3 text-sm text-espresso bg-[#FAF7F2] border border-gold-rich/20 rounded-xl focus:outline-none focus:border-gold-rich"
                  >
                    <option value="58mm">58mm (Narrow Thermal Roll)</option>
                    <option value="80mm">80mm (Standard Restaurant Roll)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="primary" type="submit" size="sm" className="font-bold">
                  Save Settings
                </Button>
              </div>
            </form>
          </Card>

        </div>

        {/* Right column: Safety Hard overrides console (5 cols) - ADMIN ONLY (F5) */}
        {isAdmin && (
          <div className="lg:col-span-5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-red-700 border-l-2 border-red-600 pl-2">
              System Hazard Console
            </h4>

            <Card className="p-5 bg-red-50/20 border border-red-200/50 space-y-4 shadow-sm">
              <div className="p-3 bg-red-100/40 border border-red-200 text-red-800 rounded-xl flex gap-2 w-full text-xs">
                <AlertOctagon className="w-6 h-6 text-red-600 shrink-0" />
                <div>
                  <strong className="block text-red-950">CRITICAL MASTER WIPE CONTROL</strong>
                  <span>Executing a Hard reset wipes ALL data - bills, orders, tables, stock, offers, coupons, and logs. Complete fresh start.</span>
                </div>
              </div>

              <p className="text-[11px] text-red-900 leading-relaxed font-medium">
                This process is irreversible. Secure supervisor 6-digit system overwrite security string is checked on execution. Code: <span className="font-bold font-mono text-red-700 select-all">951753</span>.
              </p>

              <Button
                variant="danger"
                className="w-full py-3 text-xs uppercase tracking-wider font-extrabold flex items-center justify-center gap-1.5"
                onClick={() => {
                  setResetPasscode("");
                  setResetError(null);
                  setIsResetModalOpen(true);
                }}
              >
                <RefreshCw className="w-4 h-4 text-white animate-spin-slow" />
                <span>Initialize System Hard Reset</span>
              </Button>
            </Card>
          </div>
        )}

      </div>

      {/* MASTER WIPE PASSCODE CONFIRM BLOCKER */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Override Authentication"
      >
        <div className="space-y-4">
          <div className="p-3.5 bg-red-100/30 text-red-950 font-medium text-xs rounded-xl border border-red-200">
            Warning: Performing this override completely wipes ALL data - bills, orders, tables, stock, coupons, offers, and logs. System will start fresh.
          </div>

          <FormInput
            label="Input Master Overwrite Security Passcode"
            type="password"
            maxLength={6}
            value={resetPasscode}
            onChange={(e) => setResetPasscode(e.target.value)}
            placeholder="6-Digit Safety Pin eg. 951753"
            error={resetError || undefined}
          />

          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsResetModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" className="font-bold uppercase" onClick={handleConfirmHardReset}>
              <Check className="w-4 h-4 text-white" />
              <span>Reset System</span>
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
