import React, { useState, useRef } from "react";
import { useStore } from "@/lib/mk-store";
import { UserRole } from "@/lib/mk-types";
import { Button, Card, FormInput } from "@/components/mkitchen/PremiumUI";
import { toast } from "sonner";
import { Gift, Plus, Trash2, Eye, Sparkles, ArrowRight, Settings, Share2, Crown, Power, Download, TicketCheck, BarChart3 } from "lucide-react";

// Brand logo URL — same chef medallion used in MaharajiLogo. CDN-hosted so it
// loads identically across preview and Cloudflare published builds.
const BRAND_LOGO_URL = "https://i.ibb.co/rKH953Pw/f9132bb7-ee8f-4f24-9da2-1b31129efa04-removalai-preview.png";

type CouponDownloadData = {
  code: string;
  discount: number;
  usedCount: number;
  minPurchase: number;
};

const loadCouponLogo = () => new Promise<HTMLImageElement | null>((resolve) => {
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.onload = () => resolve(image);
  image.onerror = () => resolve(null);
  image.src = BRAND_LOGO_URL;
});

const roundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
};

const drawCenteredImage = (ctx: CanvasRenderingContext2D, image: HTMLImageElement, cx: number, cy: number, maxWidth: number, maxHeight: number) => {
  const ratio = Math.min(maxWidth / image.width, maxHeight / image.height);
  const width = image.width * ratio;
  const height = image.height * ratio;
  ctx.drawImage(image, cx - width / 2, cy - height / 2, width, height);
};

const downloadCouponAsJpg = async ({ code, discount, usedCount, minPurchase }: CouponDownloadData) => {
  const logo = await loadCouponLogo();
  const canvas = document.createElement("canvas");
  const width = 1800;
  const height = 973;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.save();
  roundedRect(ctx, 32, 32, width - 64, height - 64, 38);
  ctx.clip();

  const bodyGradient = ctx.createLinearGradient(0, 0, width, height);
  bodyGradient.addColorStop(0, "#fffaf0");
  bodyGradient.addColorStop(0.5, "#f6ead0");
  bodyGradient.addColorStop(1, "#fff8e8");
  ctx.fillStyle = bodyGradient;
  ctx.fillRect(32, 32, width - 64, height - 64);

  ctx.save();
  ctx.globalAlpha = 0.13;
  ctx.strokeStyle = "#8b6508";
  ctx.lineWidth = 1.2;
  for (let x = -height; x < width; x += 36) {
    ctx.beginPath();
    ctx.moveTo(x, 32);
    ctx.lineTo(x + height, height - 32);
    ctx.stroke();
  }
  for (let x = 0; x < width + height; x += 46) {
    ctx.beginPath();
    ctx.moveTo(x, 32);
    ctx.lineTo(x - height, height - 32);
    ctx.stroke();
  }
  ctx.restore();

  const panelWidth = 720;
  const panelGradient = ctx.createLinearGradient(32, 32, panelWidth, height - 32);
  panelGradient.addColorStop(0, "#4a0710");
  panelGradient.addColorStop(0.54, "#270308");
  panelGradient.addColorStop(1, "#100102");
  ctx.fillStyle = panelGradient;
  ctx.fillRect(32, 32, panelWidth, height - 64);

  const glow = ctx.createRadialGradient(260, 240, 10, 260, 240, 560);
  glow.addColorStop(0, "rgba(245,220,138,0.30)");
  glow.addColorStop(1, "rgba(245,220,138,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(32, 32, panelWidth, height - 64);

  if (logo) {
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.filter = "brightness(0) invert(1)";
    drawCenteredImage(ctx, logo, 365, height / 2, 760, 760);
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = 0.98;
    ctx.filter = "brightness(0) invert(1) drop-shadow(0 0 24px rgba(245,220,138,0.75))";
    drawCenteredImage(ctx, logo, 365, 320, 345, 300);
    ctx.restore();
  }

  ctx.textAlign = "center";
  ctx.fillStyle = "#f5dc8a";
  ctx.font = "900 58px Georgia, serif";
  ctx.shadowColor = "rgba(0,0,0,0.65)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 7;
  ctx.fillText("MAHARAJI", 365, 565);
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#fff7e4";
  ctx.font = "700 25px Georgia, serif";
  ctx.fillText("K I T C H E N", 365, 614);
  ctx.fillStyle = "#d4af37";
  ctx.font = "700 17px Arial, sans-serif";
  ctx.fillText("A FAMILY RESTAURANT", 365, 662);

  ctx.fillStyle = "#d4af37";
  ctx.fillRect(panelWidth + 32, 32, 12, height - 64);
  ctx.fillStyle = "rgba(245,220,138,0.6)";
  ctx.fillRect(panelWidth + 62, 108, 2, height - 216);
  ctx.strokeStyle = "#8b6508";
  ctx.setLineDash([12, 18]);
  ctx.beginPath();
  ctx.moveTo(panelWidth + 42, 92);
  ctx.lineTo(panelWidth + 42, height - 92);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.textAlign = "left";
  ctx.fillStyle = "#6e1624";
  ctx.font = "900 58px Georgia, serif";
  ctx.shadowColor = "rgba(139,101,8,0.25)";
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 4;
  ctx.fillText("G I F T   V O U C H E R", 815, 180);
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#8b6508";
  ctx.fillRect(820, 218, 350, 4);
  ctx.fillStyle = "#6e1624";
  ctx.font = "800 25px Arial, sans-serif";
  ctx.fillText("SPECIAL DISCOUNT", 820, 260);

  const sealX = 1428;
  const sealY = 238;
  const sealGradient = ctx.createRadialGradient(sealX - 40, sealY - 50, 10, sealX, sealY, 155);
  sealGradient.addColorStop(0, "#fff1b8");
  sealGradient.addColorStop(0.34, "#f5dc8a");
  sealGradient.addColorStop(0.7, "#d4af37");
  sealGradient.addColorStop(1, "#8b6508");
  ctx.fillStyle = sealGradient;
  ctx.beginPath();
  ctx.arc(sealX, sealY, 145, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(91,15,26,0.72)";
  ctx.lineWidth = 5;
  ctx.setLineDash([12, 12]);
  ctx.beginPath();
  ctx.arc(sealX, sealY, 122, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.textAlign = "center";
  ctx.fillStyle = "#4a0710";
  ctx.font = "900 26px Arial, sans-serif";
  ctx.fillText("FLAT", sealX, sealY - 48);
  ctx.font = "900 70px Georgia, serif";
  ctx.fillText(`₹${discount}`, sealX, sealY + 30);
  ctx.font = "900 25px Arial, sans-serif";
  ctx.fillText("OFF", sealX, sealY + 76);

  ctx.textAlign = "left";
  ctx.fillStyle = "#4b3528";
  ctx.font = "italic 31px Georgia, serif";
  ctx.fillText("Present this voucher at the counter to enjoy", 820, 365);
  ctx.font = "italic 31px Georgia, serif";
  ctx.fillText("a royal discount on your Maharaji feast.", 820, 408);

  ctx.fillStyle = "#5c4033";
  ctx.font = "700 25px Arial, sans-serif";
  const minPurchaseLabel = minPurchase > 0 ? `Min Bill ₹${minPurchase}` : "No Minimum Bill";
  const perks = ["Dine-in & Takeaway", minPurchaseLabel, "Valid Once Per Bill", "Across All Menus"];
  perks.forEach((perk, index) => {
    const x = 835 + (index % 2) * 385;
    const y = 486 + Math.floor(index / 2) * 54;
    ctx.fillStyle = "#c9a227";
    ctx.fillText("◆", x, y);
    ctx.fillStyle = "#5c4033";
    ctx.fillText(perk, x + 32, y);
  });

  roundedRect(ctx, 820, 635, 825, 150, 18);
  ctx.fillStyle = "rgba(123,30,43,0.06)";
  ctx.fill();
  ctx.strokeStyle = "#7b1e2b";
  ctx.lineWidth = 4;
  ctx.setLineDash([16, 12]);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "#7b1e2b";
  ctx.font = "900 22px Arial, sans-serif";
  ctx.fillText("COUPON CODE", 858, 690);
  ctx.fillStyle = "#17120f";
  ctx.font = "900 48px 'Courier New', monospace";
  ctx.fillText(code, 858, 752);
  ctx.textAlign = "right";
  ctx.fillStyle = "#7b1e2b";
  ctx.font = "900 22px Arial, sans-serif";
  ctx.fillText("REDEEMED", 1600, 690);
  ctx.fillStyle = "#4a0710";
  ctx.font = "900 42px Georgia, serif";
  ctx.fillText(`${usedCount} BILL(S)`, 1600, 750);

  ctx.textAlign = "left";
  ctx.fillStyle = "#8b6508";
  ctx.font = "700 19px Arial, sans-serif";
  ctx.fillText("★ Royal Taste · Royal Experience", 820, 842);
  ctx.textAlign = "right";
  ctx.font = "italic 19px Georgia, serif";
  ctx.fillText("www.maharajikitchen.com", 1600, 842);

  ctx.restore();
  ctx.strokeStyle = "#4a0710";
  ctx.lineWidth = 20;
  roundedRect(ctx, 42, 42, width - 84, height - 84, 28);
  ctx.stroke();
  ctx.strokeStyle = "#d4af37";
  ctx.lineWidth = 6;
  roundedRect(ctx, 62, 62, width - 124, height - 124, 18);
  ctx.stroke();

  const safeCode = code.replace(/[^a-z0-9_-]/gi, "_");
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.96));
  const href = blob ? URL.createObjectURL(blob) : canvas.toDataURL("image/jpeg", 0.96);
  const link = document.createElement("a");
  link.href = href;
  link.download = `Maharaji-Coupon-${safeCode}.jpg`;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  if (blob) setTimeout(() => URL.revokeObjectURL(href), 1000);
};

// ============================
// Gift-Voucher style Coupon Card (matches reference)
// ============================
interface VoucherProps {
  code: string;
  discount: number;
  usedCount: number;
  minPurchase: number;
}
const VoucherCard = React.forwardRef<HTMLDivElement, VoucherProps>(({ code, discount, usedCount, minPurchase }, ref) => {
  const minBillLabel = minPurchase > 0 ? `Min Bill ₹${minPurchase}` : "No Minimum Bill";
  return (
    <div
      ref={ref}
      className="relative w-full aspect-[1.85/1] rounded-2xl overflow-hidden"
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        background: "#FAF6EC",
        border: "3px solid #5C0F1A",
        boxShadow:
          "0 0 0 1px #C9A227 inset, 0 0 0 6px #FAF6EC inset, 0 0 0 7px #8B6508 inset, 0 28px 60px -22px rgba(60,8,16,0.75)",
      }}
    >
      {/* Ivory body guilloche pattern */}
      <div
        className="absolute inset-0 opacity-[0.14] pointer-events-none"
        style={{
          backgroundImage:
            "repeating-radial-gradient(circle at 0 0, transparent 0, rgba(139,101,8,0.55) 1px, transparent 2px, transparent 14px), repeating-linear-gradient(45deg, transparent 0 10px, rgba(139,101,8,0.25) 10px 11px)",
        }}
      />

      {/* ===== LEFT DEEP MAROON BRAND PANEL ===== */}
      <div className="absolute left-0 top-0 h-full w-[40%] overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, #4A0710 0%, #2E0408 55%, #150103 100%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-50"
          style={{
            background:
              "radial-gradient(ellipse at 30% 25%, rgba(245,220,138,0.22), transparent 65%)",
          }}
        />
        {/* light watermark logo (background) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img
            src={BRAND_LOGO_URL}
            alt=""
            aria-hidden
            className="w-[125%] max-w-none object-contain"
            style={{
              filter: "brightness(0) invert(1)",
              opacity: 0.08,
              transform: "scale(1.15)",
            }}
          />
        </div>
        {/* damask diamond fleck */}
        <div
          className="absolute inset-0 opacity-[0.10]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent 0 10px, #F5DC8A 10px 11px), repeating-linear-gradient(-45deg, transparent 0 10px, #F5DC8A 10px 11px)",
          }}
        />
        {/* gold vertical divider */}
        <div
          className="absolute right-0 top-0 h-full w-[6px]"
          style={{
            background: "linear-gradient(to bottom, #F5DC8A, #C9A227, #8B6508)",
            boxShadow: "0 0 14px rgba(212,162,39,0.7)",
          }}
        />
        <div className="absolute right-[10px] top-[8%] bottom-[8%] w-px" style={{ background: "rgba(245,220,138,0.45)" }} />

        {/* Foreground logo + brand */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-3 text-center">
          <img
            src={BRAND_LOGO_URL}
            alt="Maharaji Kitchen"
            className="w-[68%] max-w-[170px] mx-auto object-contain"
            style={{
              filter:
                "brightness(0) invert(1) drop-shadow(0 0 18px rgba(245,220,138,0.65)) drop-shadow(0 3px 5px rgba(0,0,0,0.6))",
            }}
          />
          <div className="mt-3 leading-none">
            <div
              className="font-serif font-black tracking-[0.05em]"
              style={{
                fontSize: "clamp(14px, 2.7vw, 28px)",
                color: "#F5DC8A",
                textShadow:
                  "0 1px 0 #C9A227, 0 2px 0 #8B6508, 0 3px 0 #5C4033, 0 4px 6px rgba(0,0,0,0.6), 0 0 14px rgba(245,220,138,0.4)",
                WebkitTextStroke: "0.5px #8B6508",
              }}
            >
              MAHARAJI
            </div>
            <div
              className="font-serif tracking-[0.34em] mt-1"
              style={{
                fontSize: "clamp(8px, 1.3vw, 13px)",
                color: "#FAF6EC",
                textShadow: "0 1px 2px rgba(0,0,0,0.7)",
              }}
            >
              KITCHEN
            </div>
            <div className="mt-1.5 flex items-center justify-center gap-1.5" style={{ color: "rgba(245,220,138,0.85)" }}>
              <span className="h-px w-6" style={{ background: "rgba(201,162,39,0.65)" }} />
              <span className="text-[8px] tracking-[0.3em] uppercase">A Family Restaurant</span>
              <span className="h-px w-6" style={{ background: "rgba(201,162,39,0.65)" }} />
            </div>
          </div>
        </div>
      </div>

      {/* perforated tear line */}
      <div
        className="absolute top-[8%] bottom-[8%] w-px"
        style={{
          left: "40%",
          backgroundImage:
            "repeating-linear-gradient(to bottom, #8B6508 0 4px, transparent 4px 9px)",
        }}
      />
      <div className="absolute rounded-full" style={{ width: 14, height: 14, left: "calc(40% - 7px)", top: -7, background: "#FAF6EC", border: "1px solid rgba(201,162,39,0.5)" }} />
      <div className="absolute rounded-full" style={{ width: 14, height: 14, left: "calc(40% - 7px)", bottom: -7, background: "#FAF6EC", border: "1px solid rgba(201,162,39,0.5)" }} />

      {/* ===== RIGHT IVORY CONTENT ===== */}
      <div className="absolute left-[42%] right-[3.5%] top-[7%] bottom-[7%] flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div
              className="font-serif font-black leading-none"
              style={{
                fontSize: "clamp(14px, 2.5vw, 28px)",
                color: "#7B1E2B",
                letterSpacing: "0.12em",
                textShadow: "0 1px 0 #C9A227, 0 2px 3px rgba(91,15,26,0.25)",
              }}
            >
              GIFT&nbsp;&nbsp;VOUCHER
            </div>
            <div className="mt-1.5 flex items-center gap-1.5">
              <span className="h-px w-6" style={{ background: "#C9A227" }} />
              <span className="text-[8px] tracking-[0.35em] uppercase font-bold" style={{ color: "#7B1E2B" }}>
                Special Discount
              </span>
              <span className="h-px flex-1" style={{ background: "linear-gradient(to right, #C9A227, transparent)" }} />
            </div>
          </div>

          {/* Embossed value seal */}
          <div className="relative shrink-0" style={{ width: "27%", aspectRatio: "1" }}>
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 30% 30%, #FFF1B8 0%, #F5DC8A 25%, #D4AF37 55%, #8B6508 100%)",
                boxShadow:
                  "0 6px 18px rgba(91,15,26,0.45), inset 0 2px 4px rgba(255,255,255,0.6), inset 0 -3px 6px rgba(0,0,0,0.28)",
              }}
            />
            <div className="absolute inset-[8%] rounded-full" style={{ border: "2px dashed rgba(123,30,43,0.55)" }} />
            <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ color: "#5C0F1A" }}>
              <div className="text-[7px] tracking-[0.25em] font-bold uppercase opacity-80">Flat</div>
              <div
                className="font-serif font-black leading-none"
                style={{
                  fontSize: "clamp(15px, 2.8vw, 28px)",
                  textShadow: "0 1px 0 rgba(255,255,255,0.55)",
                }}
              >
                ₹{discount}
              </div>
              <div className="text-[7px] tracking-[0.25em] font-bold uppercase opacity-80 mt-0.5">Off</div>
            </div>
          </div>
        </div>

        {/* Tagline + perks list */}
        <div className="mt-2">
          <p className="italic leading-snug" style={{ color: "#5C4033", fontSize: "clamp(8px, 1.05vw, 11px)" }}>
            Present this voucher at the counter to enjoy a flat <strong className="not-italic" style={{ color: "#7B1E2B" }}>₹{discount}</strong> discount on your royal feast.
          </p>
          <ul className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-0.5" style={{ color: "#5C4033", fontSize: "clamp(7px, 0.95vw, 10px)" }}>
            <li className="flex items-center gap-1"><span style={{ color: "#C9A227" }}>◆</span> Dine-in &amp; Takeaway</li>
            <li className="flex items-center gap-1"><span style={{ color: "#C9A227" }}>◆</span> {minBillLabel}</li>
            <li className="flex items-center gap-1"><span style={{ color: "#C9A227" }}>◆</span> Valid Once Per Bill</li>
            <li className="flex items-center gap-1"><span style={{ color: "#C9A227" }}>◆</span> Across All Menus</li>
          </ul>
        </div>

        {/* Code block */}
        <div className="mt-auto">
          <div
            className="relative rounded-md px-3 py-2 flex items-center justify-between"
            style={{
              border: "1.5px dashed #7B1E2B",
              background: "linear-gradient(90deg, rgba(123,30,43,0.06), rgba(212,162,39,0.14), rgba(123,30,43,0.06))",
            }}
          >
            <div>
              <div className="text-[7px] uppercase tracking-[0.3em] font-bold" style={{ color: "#7B1E2B" }}>Coupon Code</div>
              <div
                className="font-mono font-black tracking-[0.28em]"
                style={{ fontSize: "clamp(11px, 1.8vw, 18px)", color: "#1C1917" }}
              >
                {code}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[7px] uppercase tracking-[0.3em] font-bold" style={{ color: "#7B1E2B" }}>Redeemed</div>
              <div className="font-serif font-black" style={{ fontSize: "clamp(11px, 1.6vw, 15px)", color: "#5C0F1A" }}>
                {usedCount} <span className="text-[8px] font-sans font-normal" style={{ color: "#5C4033" }}>bill(s)</span>
              </div>
            </div>
          </div>

          <div className="mt-1.5 flex items-center justify-between" style={{ color: "#8B6508" }}>
            <span className="text-[7px] tracking-[0.2em] uppercase opacity-90">★ Royal Taste · Royal Experience</span>
            <span className="text-[7px] italic opacity-80">www.maharajikitchen.com</span>
          </div>
        </div>
      </div>

      {/* corner gold flourishes */}
      <div className="absolute top-3 right-3 w-7 h-7 pointer-events-none" style={{ borderTop: "2px solid #C9A227", borderRight: "2px solid #C9A227", borderTopRightRadius: 6 }} />
      <div className="absolute bottom-3 right-3 w-7 h-7 pointer-events-none" style={{ borderBottom: "2px solid #C9A227", borderRight: "2px solid #C9A227", borderBottomRightRadius: 6 }} />
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
  const [coupMinPurchase, setCoupMinPurchase] = useState("");

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

  // WhatsApp share — anchor click avoids popup blockers
  const handleShareCoupon = (code: string, discount: number) => {
    const text =
      `🎁 *Maharaji Kitchen — Gift Voucher*\n\n` +
      `🎟️ Coupon Code: *${code}*\n` +
      `💰 Flat ₹${discount} OFF on your bill!\n\n` +
      `✨ Royal Taste, Royal Experience\n` +
      `📍 Show this coupon at the counter to redeem.\n\n` +
      `_Valid only at Maharaji Kitchen. Once per bill._`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    try {
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Opening WhatsApp...");
    } catch {
      window.location.href = url;
    }
  };

  // Download voucher as JPG image — direct canvas drawing avoids html2canvas oklch failures
  const handleDownloadCoupon = async (couponId: string, coupon: CouponDownloadData) => {
    toast.loading("Generating coupon JPG...", { id: "dl-" + couponId });
    try {
      await downloadCouponAsJpg(coupon);
      toast.success("Coupon JPG downloaded!", { id: "dl-" + couponId });
    } catch (err) {
      console.error("Coupon download failed:", err);
      toast.error("Download failed. Please try again.", { id: "dl-" + couponId });
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
                          onClick={() => handleDownloadCoupon(cop.id, { code: cop.code, discount: cop.discount, usedCount })}
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
