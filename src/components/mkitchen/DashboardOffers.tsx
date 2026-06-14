import React, { useState } from "react";
import { useStore } from "@/lib/mk-store";
import { UserRole } from "@/lib/mk-types";
import { Button, Card, FormInput } from "@/components/mkitchen/PremiumUI";
import { toast } from "sonner";
import { Gift, Plus, Trash2, Eye, Sparkles, ArrowRight, Percent, Ticket, Settings, Share2, Crown, Power } from "lucide-react";

export const DashboardOffers: React.FC = () => {
  // Zustand States
  const todaysOffers = useStore(state => state.todaysOffers);
  const saveOffer = useStore(state => state.saveOffer);
  const deleteOffer = useStore(state => state.deleteOffer);
  const currentUser = useStore(state => state.currentUser);

  // Coupon states (F6, F19 - moved from settings)
  const coupons = useStore(state => state.coupons);
  const addCoupon = useStore(state => state.addCoupon);
  const deleteCoupon = useStore(state => state.deleteCoupon);
  const toggleCoupon = useStore(state => state.toggleCoupon);
  const couponSettings = useStore(state => state.couponSettings);
  const updateCouponSettings = useStore(state => state.updateCouponSettings);

  // Offer States
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [animStyle, setAnimStyle] = useState<"pulse" | "shimmer" | "glow">("pulse");
  const [isActive, setIsActive] = useState(true);

  // Special Discount Coupon form states
  const [isCoupModalOpen, setIsCoupModalOpen] = useState(false);
  const [coupCode, setCoupCode] = useState("");
  const [coupValue, setCoupValue] = useState("");

  // Coupon settings form
  const [minPurchaseForCoupon, setMinPurchaseForCoupon] = useState(couponSettings.min_purchase_for_coupon.toString());
  const [couponDiscountPercent, setCouponDiscountPercent] = useState(couponSettings.coupon_discount_percent.toString());
  const [couponValidityDays, setCouponValidityDays] = useState(couponSettings.coupon_validity_days.toString());
  const [couponMinPurchaseNext, setCouponMinPurchaseNext] = useState(couponSettings.coupon_min_purchase_next.toString());

  const isAdmin = currentUser?.role === UserRole.ADMIN;

  const handleSaveOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    saveOffer({
      title,
      subtitle,
      animation_style: animStyle,
      is_active: isActive
    });

    setTitle("");
    setSubtitle("");
    setAnimStyle("pulse");
    setIsActive(true);
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

    setCoupCode("");
    setCoupValue("");
    setIsCoupModalOpen(false);
    toast.success("Special Discount Coupon created!");
  };

  const handleShareCoupon = async (code: string, discount: number) => {
    const text = `🎉 Maharaji Kitchen — Special Discount Coupon\n\nCode: ${code}\nFlat ₹${discount} OFF on your bill!\n\nValid at Maharaji Kitchen. Show this coupon at the counter.`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Maharaji Kitchen Coupon", text });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success("Coupon copied to clipboard — paste in WhatsApp / any app!");
      }
    } catch (err) {
      // user cancelled or no permission
    }
  };

  return (
    <div className="space-y-8 font-sans select-none">

      {/* HEADER SECTION - F7: Renamed to Maharaji Special Discount */}
      <div className="border-b border-gold-rich/10 pb-4">
        <h3 className="font-serif text-xl font-bold text-maroon-royal flex items-center gap-1.5">
          <Gift className="w-5 h-5 text-gold-rich" />
          Maharaji Special Discount
        </h3>
        <p className="text-xs text-mocha mt-1">
          Manage promotional offers and coupon codes displayed on the customer-facing digital menu banner.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left section: Today's Offers */}
        <div className="lg:col-span-6 space-y-6">

          {/* Offer Form */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-maroon-royal border-l-2 border-gold-rich pl-2">
              Announce New Deal
            </h4>

            <form onSubmit={handleSaveOffer} className="space-y-4 bg-white p-5 rounded-2xl border border-gold-rich/10 shadow-sm">
              <FormInput
                label="Promo Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="eg. Royal Feast Bundle Discount"
                required
              />

              <FormInput
                label="Promo Subtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="eg. Flat 15% off using code..."
              />

              <div className="relative mb-5 font-sans">
                <label className="block text-[10px] text-maroon-royal uppercase font-bold tracking-wider mb-1">Animation Highlight Style</label>
                <select
                  value={animStyle}
                  onChange={(e) => setAnimStyle(e.target.value as any)}
                  className="w-full px-3.5 py-3 text-sm text-espresso bg-white border border-gold-rich/20 rounded-xl focus:outline-none focus:border-gold-rich"
                >
                  <option value="pulse">Pulse Scaling Highlights</option>
                  <option value="shimmer">Sweep Shimmer Stripes</option>
                  <option value="glow">Perimeter Aura Glowing</option>
                </select>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <input
                  id="activeOffer"
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-maroon-royal focus:ring-gold-rich h-4 w-4 border-gold-rich/30 cursor-pointer"
                />
                <label htmlFor="activeOffer" className="text-xs text-mocha font-bold uppercase tracking-wider select-none cursor-pointer">
                  Publish Active Live Immediately
                </label>
              </div>

              <Button
                type="submit"
                variant="gold"
                className="w-full py-3 text-xs uppercase tracking-wider font-semibold"
              >
                <span>Publish Live Announcement</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          </div>

          {/* Active offers directory list */}
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
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      offer.is_active ? "bg-success/15 text-success" : "bg-mocha/15 text-mocha"
                    }`}>
                      {offer.is_active ? "Live" : "Draft"}
                    </span>
                    <button
                      onClick={() => deleteOffer(offer.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

        </div>

        {/* Right section: Coupons & Settings (F6, F19) */}
        <div className="lg:col-span-6 space-y-6">

          {/* Coupon auto-generation settings - ADMIN ONLY (F6) */}
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
                <FormInput
                  label="Min Purchase for Coupon (₹)"
                  type="number"
                  value={minPurchaseForCoupon}
                  onChange={(e) => setMinPurchaseForCoupon(e.target.value)}
                  placeholder="eg. 1000"
                />
                <FormInput
                  label="Discount Percentage (%)"
                  type="number"
                  value={couponDiscountPercent}
                  onChange={(e) => setCouponDiscountPercent(e.target.value)}
                  placeholder="eg. 10"
                />
                <FormInput
                  label="Validity (Days)"
                  type="number"
                  value={couponValidityDays}
                  onChange={(e) => setCouponValidityDays(e.target.value)}
                  placeholder="eg. 30"
                />
                <FormInput
                  label="Min Purchase to Use Coupon (₹)"
                  type="number"
                  value={couponMinPurchaseNext}
                  onChange={(e) => setCouponMinPurchaseNext(e.target.value)}
                  placeholder="eg. 800"
                />
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveCouponSettings}
                className="w-full font-bold uppercase text-xs"
              >
                Save Coupon Settings
              </Button>
            </Card>
          )}

          {/* Special Discount Coupons - ADMIN ONLY */}
          {isAdmin && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white p-3.5 rounded-2xl border border-gold-rich/10">
                <h4 className="text-xs font-bold uppercase tracking-wider text-maroon-royal border-l-2 border-gold-rich pl-2 flex items-center gap-1">
                  <Crown className="w-4 h-4 text-gold-rich" /> Special Discount Coupons
                </h4>

                <Button
                  variant="ghost"
                  size="sm"
                  className="py-1.5 px-3 text-xs uppercase"
                  onClick={() => setIsCoupModalOpen(true)}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create coupon</span>
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[480px] overflow-y-auto pr-1">
                {coupons.filter(c => c.is_special_discount).length === 0 && (
                  <div className="col-span-full text-center text-[11px] text-mocha italic py-6 bg-white rounded-xl border border-dashed border-gold-rich/20">
                    No Special Discount Coupons yet. Create one to share with customers.
                  </div>
                )}
                {coupons.filter(c => c.is_special_discount).map(cop => {
                  const enabled = cop.is_enabled !== false;
                  return (
                    <div key={cop.id} className="relative group">
                      {/* Premium gift coupon card with Maharaji branding */}
                      <div className={`relative overflow-hidden rounded-2xl border-2 border-gold-rich/40 shadow-xl bg-gradient-to-br from-maroon-deep via-maroon-royal to-charcoal-deep text-cream-ivory transition-all ${enabled ? "" : "opacity-50 grayscale"}`}>
                        {/* shimmer */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold-shimmer/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        {/* notches for ticket look */}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-6 bg-[#FAF7F2] rounded-r-full" />
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-6 bg-[#FAF7F2] rounded-l-full" />

                        <div className="p-4 pl-5 pr-5 relative z-10">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5">
                              <Crown className="w-3.5 h-3.5 text-gold-shimmer" />
                              <span className="font-serif font-black text-[10px] tracking-[0.18em] uppercase text-gold-shimmer">Maharaji Kitchen</span>
                            </div>
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${enabled ? "bg-success/30 text-success-foreground border border-success/50" : "bg-mocha/40 text-cream-warm"}`}>
                              {enabled ? "ON" : "OFF"}
                            </span>
                          </div>

                          <div className="text-center py-2 border-y border-dashed border-gold-rich/30 my-2">
                            <div className="text-[9px] uppercase tracking-widest text-gold-light/80">Flat Discount</div>
                            <div className="font-serif text-3xl font-black text-gold-shimmer drop-shadow-[0_0_8px_rgba(245,220,138,0.4)] leading-tight">
                              ₹{cop.discount}
                            </div>
                            <div className="text-[9px] uppercase tracking-widest text-cream-warm/80">OFF on bill</div>
                          </div>

                          <div className="text-center mb-2">
                            <div className="text-[8px] uppercase tracking-widest text-cream-warm/70 mb-0.5">Coupon Code</div>
                            <div className="font-mono font-black text-base bg-gold-gradient text-charcoal-deep px-3 py-1 rounded-lg inline-block tracking-widest border border-gold-rich shadow-inner">
                              {cop.code}
                            </div>
                          </div>

                          <div className="text-[8px] text-cream-warm/70 text-center mb-2 italic">
                            Used on {(cop.used_bill_ids || []).length} bill(s) • once per bill
                          </div>

                          <div className="flex gap-1.5 pt-1.5 border-t border-gold-rich/20">
                            <button
                              onClick={() => handleShareCoupon(cop.code, cop.discount)}
                              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-gold-gradient text-charcoal-deep text-[10px] font-bold uppercase tracking-wider hover:brightness-110 transition-all"
                            >
                              <Share2 className="w-3 h-3" /> Share
                            </button>
                            <button
                              onClick={() => toggleCoupon(cop.id)}
                              className={`flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${enabled ? "bg-white/10 border-cream-warm/30 text-cream-ivory hover:bg-white/20" : "bg-success/30 border-success/50 text-success-foreground"}`}
                              title="Toggle ON/OFF"
                            >
                              <Power className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => { if (confirm(`Delete coupon ${cop.code}?`)) deleteCoupon(cop.id); }}
                              className="flex items-center justify-center px-2.5 py-1.5 rounded-lg bg-danger/30 border border-danger/50 text-cream-ivory hover:bg-danger/50 transition-all"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Auto-generated / legacy coupons (admin-only, internal) */}
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

          {/* Live Preview */}
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

      {/* SPECIAL DISCOUNT COUPON MODAL */}
      {isCoupModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="font-serif text-lg font-bold text-maroon-royal mb-1 flex items-center gap-2">
              <Crown className="w-5 h-5 text-gold-rich" /> Create Special Discount Coupon
            </h3>
            <p className="text-[11px] text-mocha mb-4">Flat discount, no minimum purchase. Reusable across bills (once per bill).</p>

            <form onSubmit={handleSaveCoupon} className="space-y-4">
              <FormInput
                label="Coupon Code"
                value={coupCode}
                onChange={(e) => setCoupCode(e.target.value.toUpperCase())}
                placeholder="eg. MAHA200"
                required
              />

              <FormInput
                label="Flat Discount Amount (₹)"
                type="number"
                value={coupValue}
                onChange={(e) => setCoupValue(e.target.value)}
                placeholder="eg. 100, 200, 500"
                required
              />

              <div className="flex gap-2 pt-2 justify-end">
                <Button variant="ghost" size="sm" type="button" onClick={() => setIsCoupModalOpen(false)}>
                  Discard
                </Button>
                <Button variant="primary" size="sm" type="submit" className="font-bold">
                  <span>Create Coupon</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
