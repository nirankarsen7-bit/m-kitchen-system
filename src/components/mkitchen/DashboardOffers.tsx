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

  // Coupon form states
  const [isCoupModalOpen, setIsCoupModalOpen] = useState(false);
  const [coupCode, setCoupCode] = useState("");
  const [coupType, setCoupType] = useState<"percentage" | "flat">("flat");
  const [coupValue, setCoupValue] = useState("");
  const [coupMinBuy, setCoupMinBuy] = useState("");

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
    const minVal = parseFloat(coupMinBuy);

    if (!coupCode.trim() || isNaN(val) || isNaN(minVal)) {
      toast.error("Please check coupon entry constraints!");
      return;
    }

    addCoupon({
      code: coupCode.trim().toUpperCase(),
      discount_type: coupType,
      discount: val,
      min_purchase: minVal,
      linked_bill_id: null,
      valid_from: new Date().toISOString(),
      valid_to: new Date(Date.now() + 86400000 * 30).toISOString()
    });

    setCoupCode("");
    setCoupValue("");
    setCoupMinBuy("");
    setIsCoupModalOpen(false);
    toast.success("New coupon promotion created successfully!");
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

          {/* Manual coupon management - ADMIN ONLY */}
          {isAdmin && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white p-3.5 rounded-2xl border border-gold-rich/10">
                <h4 className="text-xs font-bold uppercase tracking-wider text-maroon-royal border-l-2 border-gold-rich pl-2 flex items-center gap-1">
                  <Percent className="w-4 h-4 text-gold-rich" /> Promotional Coupons
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[200px] overflow-y-auto pr-1">
                {coupons.map(cop => (
                  <Card key={cop.id} className="p-3 bg-white border border-gold-rich/15 flex flex-col justify-between overflow-hidden relative min-h-[90px]">
                    <div className="absolute left-0 inset-y-0 w-1 bg-gold-rich" />

                    <div>
                      <div className="flex justify-between items-start">
                        <span className="font-mono text-xs font-bold text-espresso bg-cream-warm/40 px-2 py-0.5 rounded border border-gold-rich/20">
                          {cop.code}
                        </span>
                        <button
                          onClick={() => deleteCoupon(cop.id)}
                          className="p-1 rounded text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-[10px] text-mocha mt-2">
                        Get {cop.discount_type === "percentage" ? `${cop.discount}%` : `₹${cop.discount}`} off on purchases above <span className="font-bold text-espresso">₹{cop.min_purchase}</span>.
                      </p>
                    </div>

                    <span className="block text-[8px] text-gold-rich font-bold uppercase tracking-wider text-right border-t border-dashed border-gold-rich/10 pt-1.5 mt-2">
                      <Ticket className="w-3 h-3 inline" /> {cop.status} coupon
                    </span>
                  </Card>
                ))}
              </div>
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

      {/* COUPON GENERATOR INSERT MODAL */}
      {isCoupModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="font-serif text-lg font-bold text-maroon-royal mb-4">Add Ticket Coupon</h3>

            <form onSubmit={handleSaveCoupon} className="space-y-4">
              <FormInput
                label="Coupon Alpha-numeric Code"
                value={coupCode}
                onChange={(e) => setCoupCode(e.target.value.toUpperCase())}
                placeholder="eg. ROYAL30"
                required
              />

              <div className="relative mb-5 font-sans">
                <label className="block text-[10px] text-maroon-royal uppercase font-bold tracking-wider mb-1">Discount Style</label>
                <select
                  value={coupType}
                  onChange={(e) => setCoupType(e.target.value as any)}
                  className="w-full px-3.5 py-3 text-sm text-espresso bg-white border border-gold-rich/20 rounded-xl focus:outline-none focus:border-gold-rich"
                >
                  <option value="flat">Flat Cash Discount (INR)</option>
                  <option value="percentage">Percentage Discount (%)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormInput
                  label="Face Value"
                  type="number"
                  value={coupValue}
                  onChange={(e) => setCoupValue(e.target.value)}
                  placeholder="price or pct amount"
                  required
                />
                <FormInput
                  label="Min Purchase Threshold"
                  type="number"
                  value={coupMinBuy}
                  onChange={(e) => setCoupMinBuy(e.target.value)}
                  placeholder="eg. 1000"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2 justify-end">
                <Button variant="ghost" size="sm" type="button" onClick={() => setIsCoupModalOpen(false)}>
                  Discard
                </Button>
                <Button variant="primary" size="sm" type="submit" className="font-bold">
                  <span>Generate Ticket</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
