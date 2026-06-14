import React, { useState, useRef } from "react";
import { useStore } from "@/lib/mk-store";
import { UserRole } from "@/lib/mk-types";
import { Button, Card, FormInput } from "@/components/mkitchen/PremiumUI";
import { toast } from "sonner";
import { Gift, Plus, Trash2, Eye, Sparkles, ArrowRight, Settings, Share2, Crown, Power, Download, TicketCheck, BarChart3 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import logoOutlineAsset from "@/assets/logo_outline.png.asset.json";

// ============================
// Gift-Voucher style Coupon Card (matches reference)
// ============================
interface VoucherProps {
  code: string;
  discount: number;
  usedCount: number;
}
const VoucherCard = React.forwardRef<HTMLDivElement, VoucherProps>(({ code, discount, usedCount }, ref) => {
  return (
    <div
      ref={ref}
      className="relative w-full aspect-[1.78/1] bg-white rounded-2xl overflow-hidden shadow-2xl border border-gold-rich/20"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Right red panel with gold side stripe */}
      <div className="absolute right-0 top-0 h-full w-[38%]">
        <div className="absolute right-0 top-0 h-full w-[88%] bg-gradient-to-br from-[#E63946] via-[#C81C2D] to-[#9B1320]" />
        {/* Vertical gold stripe */}
        <div className="absolute left-[-8px] top-0 h-full w-3 bg-gradient-to-b from-[#F5DC8A] via-[#D4AF37] to-[#B38728] shadow-lg" />
        {/* Subtle silk highlight */}
        <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-white/15 to-transparent" />
      </div>

      {/* Left red ribbon/bow */}
      <div className="absolute left-0 top-0 h-full w-[18%] pointer-events-none">
        {/* vertical ribbon */}
        <div className="absolute left-[26%] top-0 h-full w-[22%] bg-gradient-to-b from-[#E63946] via-[#C81C2D] to-[#9B1320] shadow-md" />
        {/* bow knot */}
        <div className="absolute left-[14%] top-[36%] w-[60%] aspect-square">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#E63946] to-[#9B1320] shadow-lg" />
          {/* bow loops */}
          <div className="absolute -left-[40%] top-[20%] w-[70%] h-[60%] rounded-full bg-gradient-to-br from-[#E63946] to-[#9B1320] rotate-[-25deg] shadow-md" />
          <div className="absolute -right-[40%] top-[20%] w-[70%] h-[60%] rounded-full bg-gradient-to-bl from-[#E63946] to-[#9B1320] rotate-[25deg] shadow-md" />
          {/* center knot */}
          <div className="absolute left-[30%] top-[30%] w-[40%] h-[40%] rounded-full bg-gradient-to-br from-[#C81C2D] to-[#7A0F1A] shadow-inner" />
        </div>
        {/* ribbon tails */}
        <div className="absolute left-[10%] bottom-[8%] w-[35%] h-[28%] bg-gradient-to-b from-[#C81C2D] to-[#9B1320] rotate-[-15deg] origin-top" style={{ clipPath: "polygon(0 0, 100% 0, 80% 100%, 20% 100%)" }} />
        <div className="absolute left-[42%] bottom-[8%] w-[35%] h-[28%] bg-gradient-to-b from-[#C81C2D] to-[#9B1320] rotate-[15deg] origin-top" style={{ clipPath: "polygon(0 0, 100% 0, 80% 100%, 20% 100%)" }} />
      </div>

      {/* GIFT VOUCHER heading */}
      <div className="absolute top-[14%] left-[24%]">
        <div className="font-serif font-black text-[#D4AF37] leading-none tracking-tight" style={{ fontSize: "clamp(18px, 3.4vw, 36px)" }}>
          GIFT
        </div>
        <div className="font-serif font-light text-[#2a2a2a] leading-none tracking-[0.18em] mt-1" style={{ fontSize: "clamp(12px, 2.1vw, 22px)" }}>
          VOUCHER
        </div>
      </div>

      {/* Red value circle */}
      <div className="absolute top-[8%] right-[28%] aspect-square w-[26%]">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FF4757] via-[#E63946] to-[#C81C2D] shadow-xl flex flex-col items-center justify-center text-white">
          <div className="font-serif font-black leading-none" style={{ fontSize: "clamp(14px, 2.6vw, 28px)" }}>
            ₹{discount}
          </div>
          <div className="font-sans font-bold tracking-[0.2em] mt-1 opacity-95" style={{ fontSize: "clamp(7px, 1vw, 11px)" }}>
            VALUE
          </div>
        </div>
        {/* orange overlay accent */}
        <div className="absolute top-[8%] right-[8%] w-[35%] h-[35%] rounded-full bg-[#FF6B35]/40 blur-sm" />
      </div>

      {/* Red ribbon banner — Restaurant name */}
      <div className="absolute left-[22%] top-[52%] right-[42%] h-[16%]">
        <div className="relative h-full bg-gradient-to-r from-[#C81C2D] to-[#E63946] flex items-center px-3 shadow-md">
          <span className="text-white font-bold tracking-[0.15em] uppercase truncate" style={{ fontSize: "clamp(8px, 1.2vw, 13px)" }}>
            MAHARAJI KITCHEN
          </span>
          {/* notch */}
          <div className="absolute -left-2 top-0 h-0 w-0 border-t-[10px] border-b-[10px] border-r-[8px] border-t-transparent border-b-transparent border-r-[#9B1320]" />
        </div>
      </div>

      {/* Coupon code + tagline on left */}
      <div className="absolute left-[22%] top-[72%] right-[42%]">
        <div className="text-[#666] leading-snug" style={{ fontSize: "clamp(7px, 0.95vw, 10px)" }}>
          Royal Taste, Royal Experience. Present this voucher at Maharaji Kitchen to redeem your special discount.
        </div>
        <div className="mt-1 font-mono font-black text-[#1a1a1a] tracking-[0.2em]" style={{ fontSize: "clamp(10px, 1.6vw, 16px)" }}>
          CODE: {code}
        </div>
      </div>

      {/* Right side: outline logo + tagline */}
      <div className="absolute right-[3%] top-[42%] w-[32%] text-white">
        <div className="flex items-center gap-2">
          <img src={logoOutlineAsset.url} alt="Maharaji Kitchen" className="w-10 h-10 object-contain opacity-95 drop-shadow" />
          <div>
            <div className="font-serif font-black tracking-tight leading-none" style={{ fontSize: "clamp(10px, 1.4vw, 14px)" }}>
              MAHARAJI
            </div>
            <div className="font-serif font-light tracking-[0.18em] leading-none mt-0.5" style={{ fontSize: "clamp(8px, 1vw, 11px)" }}>
              KITCHEN
            </div>
          </div>
        </div>
        <div className="mt-2 space-y-0.5" style={{ fontSize: "clamp(7px, 0.9vw, 10px)" }}>
          <div className="opacity-95">★ A Family Restaurant</div>
          <div className="opacity-90">Veg & Non-Veg Specialities</div>
          <div className="opacity-90 italic">Used on {usedCount} bill(s)</div>
        </div>
      </div>

      {/* Bottom watermark */}
      <div className="absolute bottom-2 left-[22%] text-[8px] text-[#999] italic">
        * Valid only at Maharaji Kitchen. Once per bill.
      </div>
    </div>
  );
});
VoucherCard.displayName = "VoucherCard";

export const DashboardOffers: React.FC = () => {
  const todaysOffers = useStore(state => state.todaysOffers);
  const saveOffer = useStore(state => state.saveOffer);
  const deleteOffer = useStore(state => state.deleteOffer);
  const currentUser = useStore(state => state.currentUser);

  const coupons = useStore(state => state.coupons);
  const addCoupon = useStore(state => state.addCoupon);
  const deleteCoupon = useStore(state => state.deleteCoupon);
  const toggleCoupon = useStore(state => state.toggleCoupon);
  const couponSettings = useStore(state => state.couponSettings);
  const updateCouponSettings = useStore(state => state.updateCouponSettings);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [animStyle, setAnimStyle] = useState<"pulse" | "shimmer" | "glow">("pulse");
  const [isActive, setIsActive] = useState(true);

  const [isCoupModalOpen, setIsCoupModalOpen] = useState(false);
  const [coupCode, setCoupCode] = useState("");
  const [coupValue, setCoupValue] = useState("");

  const [minPurchaseForCoupon, setMinPurchaseForCoupon] = useState(couponSettings.min_purchase_for_coupon.toString());
  const [couponDiscountPercent, setCouponDiscountPercent] = useState(couponSettings.coupon_discount_percent.toString());
  const [couponValidityDays, setCouponValidityDays] = useState(couponSettings.coupon_validity_days.toString());
  const [couponMinPurchaseNext, setCouponMinPurchaseNext] = useState(couponSettings.coupon_min_purchase_next.toString());

  const voucherRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isAdmin = currentUser?.role === UserRole.ADMIN;

  const specialCoupons = coupons.filter(c => c.is_special_discount);
  const totalCreated = specialCoupons.length;
  const totalRedemptions = specialCoupons.reduce((sum, c) => sum + (c.used_bill_ids?.length || 0), 0);
  const totalDiscountGiven = specialCoupons.reduce((sum, c) => sum + (c.discount * (c.used_bill_ids?.length || 0)), 0);
  const activeCount = specialCoupons.filter(c => c.is_enabled !== false).length;

  const handleSaveOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    saveOffer({ title, subtitle, animation_style: animStyle, is_active: isActive });
    setTitle(""); setSubtitle(""); setAnimStyle("pulse"); setIsActive(true);
  };

  const handleSaveCouponSettings = () => {
    updateCouponSettings({
      min_purchase_for_coupon: parseFloat(minPurchaseForCoupon) || 1000,
      coupon_discount_percent: parseFloat(couponDiscountPercent) || 10,
      coupon_validity_days: parseInt(couponValidityDays) || 30,
      coupon_min_purchase_next: parseFloat(couponMinPurchaseNext) || 800
    });
    toast.success("Auto-coupon generation settings updated!");
  };

  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(coupValue);
    if (!coupCode.trim() || isNaN(val) || val <= 0) {
      toast.error("Please enter a valid code and discount amount!");
      return;
    }
    addCoupon({
      code: coupCode.trim().toUpperCase(),
      discount_type: "flat",
      discount: val,
      min_purchase: 0,
      linked_bill_id: null,
      valid_from: new Date().toISOString(),
      valid_to: new Date(Date.now() + 86400000 * 365).toISOString(),
      is_special_discount: true,
      is_enabled: true,
      used_bill_ids: [],
    });
    setCoupCode(""); setCoupValue(""); setIsCoupModalOpen(false);
    toast.success("Special Discount Coupon created!");
  };

  // WhatsApp share — opens WA with coupon text
  const handleShareCoupon = (code: string, discount: number) => {
    const text =
      `🎁 *Maharaji Kitchen — Gift Voucher*\n\n` +
      `🎟️ Coupon Code: *${code}*\n` +
      `💰 Flat ₹${discount} OFF on your bill!\n\n` +
      `✨ Royal Taste, Royal Experience\n` +
      `📍 Show this coupon at the counter to redeem.\n\n` +
      `_Valid only at Maharaji Kitchen. Once per bill._`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Download voucher as PDF
  const handleDownloadCoupon = async (couponId: string, code: string) => {
    const node = voucherRefs.current[couponId];
    if (!node) return;
    try {
      toast.loading("Generating coupon PDF...", { id: "dl-" + couponId });
      const canvas = await html2canvas(node, { scale: 3, backgroundColor: "#ffffff", useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: [160, 90] });
      pdf.addImage(imgData, "PNG", 0, 0, 160, 90);
      pdf.save(`Maharaji-Coupon-${code}.pdf`);
      toast.success("Coupon downloaded!", { id: "dl-" + couponId });
    } catch (err) {
      console.error(err);
      toast.error("Download failed. Try again.", { id: "dl-" + couponId });
    }
  };

  return (
    <div className="space-y-8 font-sans select-none">

      <div className="border-b border-gold-rich/10 pb-4">
        <h3 className="font-serif text-xl font-bold text-maroon-royal flex items-center gap-1.5">
          <Gift className="w-5 h-5 text-gold-rich" />
          Maharaji Special Discount
        </h3>
        <p className="text-xs text-mocha mt-1">
          Manage promotional offers and coupon codes displayed on the customer-facing digital menu banner.
        </p>
      </div>

      {/* ===== Redemption Report Summary (Admin only) ===== */}
      {isAdmin && (
        <Card className="p-5 bg-gradient-to-br from-maroon-royal via-maroon-deep to-charcoal-deep text-cream-ivory border border-gold-rich/40 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-serif text-lg font-bold text-gold-shimmer flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Coupon Redemption Report
            </h4>
            <span className="text-[10px] uppercase tracking-widest text-cream-warm/70">Live Summary</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white/10 border border-gold-rich/30 rounded-xl p-3 text-center backdrop-blur">
              <div className="text-[9px] uppercase tracking-widest text-gold-light/90 mb-1">Coupons Created</div>
              <div className="font-serif text-3xl font-black text-gold-shimmer">{totalCreated}</div>
            </div>
            <div className="bg-white/10 border border-gold-rich/30 rounded-xl p-3 text-center backdrop-blur">
              <div className="text-[9px] uppercase tracking-widest text-gold-light/90 mb-1">Total Redemptions</div>
              <div className="font-serif text-3xl font-black text-gold-shimmer flex items-center justify-center gap-1.5">
                <TicketCheck className="w-5 h-5" />
                {totalRedemptions}
              </div>
            </div>
            <div className="bg-white/10 border border-gold-rich/30 rounded-xl p-3 text-center backdrop-blur">
              <div className="text-[9px] uppercase tracking-widest text-gold-light/90 mb-1">Total Discount Given</div>
              <div className="font-serif text-3xl font-black text-gold-shimmer">₹{totalDiscountGiven.toLocaleString("en-IN")}</div>
            </div>
            <div className="bg-white/10 border border-gold-rich/30 rounded-xl p-3 text-center backdrop-blur">
              <div className="text-[9px] uppercase tracking-widest text-gold-light/90 mb-1">Currently Active</div>
              <div className="font-serif text-3xl font-black text-gold-shimmer">{activeCount}</div>
            </div>
          </div>

          {specialCoupons.length > 0 && (
            <details className="mt-4 text-cream-ivory">
              <summary className="text-[10px] uppercase tracking-widest cursor-pointer text-gold-light/90 hover:text-gold-shimmer">
                View per-coupon breakdown
              </summary>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="border-b border-gold-rich/30 text-gold-light/80 uppercase text-[9px] tracking-wider">
                      <th className="text-left py-1.5">Code</th>
                      <th className="text-right py-1.5">Discount</th>
                      <th className="text-right py-1.5">Redeemed</th>
                      <th className="text-right py-1.5">Total Given</th>
                      <th className="text-center py-1.5">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {specialCoupons.map(c => {
                      const used = c.used_bill_ids?.length || 0;
                      return (
                        <tr key={c.id} className="border-b border-gold-rich/10">
                          <td className="py-1.5 font-mono font-bold">{c.code}</td>
                          <td className="py-1.5 text-right">₹{c.discount}</td>
                          <td className="py-1.5 text-right">{used}</td>
                          <td className="py-1.5 text-right">₹{(used * c.discount).toLocaleString("en-IN")}</td>
                          <td className="py-1.5 text-center">
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${c.is_enabled !== false ? "bg-success/30 text-white" : "bg-mocha/40 text-cream-warm"}`}>
                              {c.is_enabled !== false ? "ON" : "OFF"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </details>
          )}
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left section: Today's Offers */}
        <div className="lg:col-span-6 space-y-6">

          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-maroon-royal border-l-2 border-gold-rich pl-2">
              Announce New Deal
            </h4>

            <form onSubmit={handleSaveOffer} className="space-y-4 bg-white p-5 rounded-2xl border border-gold-rich/10 shadow-sm">
              <FormInput label="Promo Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="eg. Royal Feast Bundle Discount" required />
              <FormInput label="Promo Subtitle" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="eg. Flat 15% off using code..." />

              <div className="relative mb-5 font-sans">
                <label className="block text-[10px] text-maroon-royal uppercase font-bold tracking-wider mb-1">Animation Highlight Style</label>
                <select value={animStyle} onChange={(e) => setAnimStyle(e.target.value as any)} className="w-full px-3.5 py-3 text-sm text-espresso bg-white border border-gold-rich/20 rounded-xl focus:outline-none focus:border-gold-rich">
                  <option value="pulse">Pulse Scaling Highlights</option>
                  <option value="shimmer">Sweep Shimmer Stripes</option>
                  <option value="glow">Perimeter Aura Glowing</option>
                </select>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <input id="activeOffer" type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded text-maroon-royal focus:ring-gold-rich h-4 w-4 border-gold-rich/30 cursor-pointer" />
                <label htmlFor="activeOffer" className="text-xs text-mocha font-bold uppercase tracking-wider select-none cursor-pointer">
                  Publish Active Live Immediately
                </label>
              </div>

              <Button type="submit" variant="gold" className="w-full py-3 text-xs uppercase tracking-wider font-semibold">
                <span>Publish Live Announcement</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-maroon-royal border-l-2 border-gold-rich pl-2">
              Active Board Directory ({todaysOffers.length})
            </h4>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {todaysOffers.map(offer => (
                <Card key={offer.id} className="p-3 bg-white flex justify-between items-center border-gold-rich/10 gap-4">
                  <div className="flex gap-2.5 items-center">
                    <div className="p-2 rounded bg-gold-gradient text-charcoal-deep font-mono font-black text-xs">
                      {offer.animation_style.slice(0,3).toUpperCase()}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-espresso">{offer.title}</h5>
                      <p className="text-[10px] text-mocha">{offer.subtitle || "No subtitle announcement details."}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${offer.is_active ? "bg-success/15 text-success" : "bg-mocha/15 text-mocha"}`}>
                      {offer.is_active ? "Live" : "Draft"}
                    </span>
                    <button onClick={() => deleteOffer(offer.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

        </div>

        {/* Right section: Coupons & Settings */}
        <div className="lg:col-span-6 space-y-6">

          {isAdmin && (
            <Card className="p-5 bg-white border border-gold-rich/10 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-maroon-royal border-l-2 border-gold-rich pl-2 flex items-center gap-1">
                <Settings className="w-4 h-4 text-gold-rich" /> Auto-Coupon Generation Settings
              </h4>

              <p className="text-[10px] text-mocha leading-relaxed">
                Configure automatic coupon generation. When a customer's bill total reaches or exceeds the minimum purchase amount,
                a coupon code will be automatically generated and printed on their bill/invoice. This coupon can be used on the NEXT
                bill within the validity period. The coupon cannot be applied to the same bill it was generated from.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <FormInput label="Min Purchase for Coupon (₹)" type="number" value={minPurchaseForCoupon} onChange={(e) => setMinPurchaseForCoupon(e.target.value)} placeholder="eg. 1000" />
                <FormInput label="Discount Percentage (%)" type="number" value={couponDiscountPercent} onChange={(e) => setCouponDiscountPercent(e.target.value)} placeholder="eg. 10" />
                <FormInput label="Validity (Days)" type="number" value={couponValidityDays} onChange={(e) => setCouponValidityDays(e.target.value)} placeholder="eg. 30" />
                <FormInput label="Min Purchase to Use Coupon (₹)" type="number" value={couponMinPurchaseNext} onChange={(e) => setCouponMinPurchaseNext(e.target.value)} placeholder="eg. 800" />
              </div>

              <Button variant="primary" size="sm" onClick={handleSaveCouponSettings} className="w-full font-bold uppercase text-xs">
                Save Coupon Settings
              </Button>
            </Card>
          )}

          {isAdmin && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white p-3.5 rounded-2xl border border-gold-rich/10">
                <h4 className="text-xs font-bold uppercase tracking-wider text-maroon-royal border-l-2 border-gold-rich pl-2 flex items-center gap-1">
                  <Crown className="w-4 h-4 text-gold-rich" /> Special Discount Coupons
                </h4>
                <Button variant="ghost" size="sm" className="py-1.5 px-3 text-xs uppercase" onClick={() => setIsCoupModalOpen(true)}>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create coupon</span>
                </Button>
              </div>

              <div className="space-y-5 max-h-[640px] overflow-y-auto pr-1">
                {specialCoupons.length === 0 && (
                  <div className="text-center text-[11px] text-mocha italic py-6 bg-white rounded-xl border border-dashed border-gold-rich/20">
                    No Special Discount Coupons yet. Create one to share with customers.
                  </div>
                )}
                {specialCoupons.map(cop => {
                  const enabled = cop.is_enabled !== false;
                  const usedCount = cop.used_bill_ids?.length || 0;
                  return (
                    <div key={cop.id} className={`space-y-2 ${enabled ? "" : "opacity-60"}`}>
                      <VoucherCard
                        ref={(el) => { voucherRefs.current[cop.id] = el; }}
                        code={cop.code}
                        discount={cop.discount}
                        usedCount={usedCount}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleShareCoupon(cop.code, cop.discount)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#25D366] text-white text-[11px] font-bold uppercase tracking-wider hover:brightness-110 transition-all shadow-md"
                        >
                          <Share2 className="w-3.5 h-3.5" /> WhatsApp
                        </button>
                        <button
                          onClick={() => handleDownloadCoupon(cop.id, cop.code)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gold-gradient text-charcoal-deep text-[11px] font-bold uppercase tracking-wider hover:brightness-105 transition-all shadow-md"
                        >
                          <Download className="w-3.5 h-3.5" /> Download
                        </button>
                        <button
                          onClick={() => toggleCoupon(cop.id)}
                          className={`flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider border transition-all ${enabled ? "bg-white border-gold-rich/30 text-mocha hover:bg-cream-warm" : "bg-success text-white border-success"}`}
                          title="Toggle ON/OFF"
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => { if (confirm(`Delete coupon ${cop.code}?`)) deleteCoupon(cop.id); }}
                          className="flex items-center justify-center px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {coupons.filter(c => !c.is_special_discount).length > 0 && (
                <details className="bg-white rounded-2xl border border-gold-rich/10 p-3">
                  <summary className="text-[10px] font-bold uppercase tracking-wider text-mocha cursor-pointer">
                    Auto-generated coupons ({coupons.filter(c => !c.is_special_discount).length})
                  </summary>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                    {coupons.filter(c => !c.is_special_discount).map(cop => (
                      <Card key={cop.id} className="p-2 bg-cream-warm/30 border border-gold-rich/15 flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-[10px] font-bold text-espresso">{cop.code}</span>
                          <button onClick={() => deleteCoupon(cop.id)} className="p-0.5 text-red-600 hover:bg-red-50 rounded">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-[9px] text-mocha">
                          {cop.discount_type === "percentage" ? `${cop.discount}%` : `₹${cop.discount}`} off &gt; ₹{cop.min_purchase} · {cop.status}
                        </p>
                      </Card>
                    ))}
                  </div>
                </details>
              )}
            </div>
          )}

          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-mocha flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-gold-rich" />
              Live Interactive Mirror (Mobile Feed Preview)
            </h4>

            <div className="p-4 bg-[#FAF7F2] border-2 border-dashed border-gold-rich/25 rounded-2xl">
              <span className="block text-[8px] text-mocha font-bold uppercase tracking-widest text-center mb-2">Simulated Customer Phone Display</span>

              {title.trim() ? (
                <div className={`p-4 rounded-xl bg-royal-gradient text-cream-ivory relative overflow-hidden shadow-lg border border-gold-rich/35 ${
                  animStyle === "pulse" ? "scale-98 hover:scale-100 transition-transform" :
                  animStyle === "glow" ? "animate-gold-glow" : ""
                }`}>
                  {animStyle === "shimmer" && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#F5DC8A]/25 to-transparent -translate-x-full animate-shimmer-sweep" />
                  )}

                  <div className="flex gap-2.5 relative z-10">
                    <div className="h-8 w-8 bg-gold-gradient rounded-lg text-charcoal-deep flex items-center justify-center animate-pulse">
                      <Sparkles className="w-4 h-4 fill-current.5" />
                    </div>
                    <div>
                      <span className="text-[8px] uppercase tracking-wider text-gold-light font-bold">TODAY'S SPECIAL Announcement</span>
                      <h5 className="font-serif text-sm font-bold text-white">{title}</h5>
                      <p className="text-[10px] text-cream-warm mt-0.5 leading-snug">{subtitle}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-mocha italic bg-white border border-gold-rich/5 rounded-xl font-medium">
                  Type in details in the form above to preview banner layout.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {isCoupModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="font-serif text-lg font-bold text-maroon-royal mb-1 flex items-center gap-2">
              <Crown className="w-5 h-5 text-gold-rich" /> Create Special Discount Coupon
            </h3>
            <p className="text-[11px] text-mocha mb-4">Flat discount, no minimum purchase. Reusable across bills (once per bill).</p>

            <form onSubmit={handleSaveCoupon} className="space-y-4">
              <FormInput label="Coupon Code" value={coupCode} onChange={(e) => setCoupCode(e.target.value.toUpperCase())} placeholder="eg. MAHA200" required />
              <FormInput label="Flat Discount Amount (₹)" type="number" value={coupValue} onChange={(e) => setCoupValue(e.target.value)} placeholder="eg. 100, 200, 500" required />

              <div className="flex gap-2 pt-2 justify-end">
                <Button variant="ghost" size="sm" type="button" onClick={() => setIsCoupModalOpen(false)}>Discard</Button>
                <Button variant="primary" size="sm" type="submit" className="font-bold"><span>Create Coupon</span></Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
