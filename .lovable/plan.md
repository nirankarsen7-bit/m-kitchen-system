# Maharaji Kitchen — 11 Updates Plan

Main aapke 11 points ek-ek karke implement karunga. Pehele plan confirm kar lijiye, fir code change shuru.

## Updates

**1. Reports me bill ke item details + top sales date**
- CSV / Excel / PDF / Direct Print sab me har bill ke andar items (name, qty, rate, amount) show honge — sirf bill total nahi.
- Report ke top pe "Highest Sales Date(s)" highlight section add karunga.

**2. Role switch pe authentication**
- Admin select karne par username+password mandatory (current behavior agar direct switch ho raha hai to fix).
- Reception ke liye bhi password prompt (consistent). Confirm karein agar sirf admin chahiye.

**3. Golden color visibility fix**
- `--gold-rich` / `--gold-shimmer` tokens ko deeper, higher-contrast shade me update — text readable hoga (specially light bg pe).

**4. Bill/Invoice print pe logo + "Nagrakata" address**
- Print template me MaharajiLogo aur address line me Nagrakata add.

**5. Stock purchase delete nahi hoga**
- "Record New Purchase" entry add hone ke baad delete button hata dunga (sirf admin override agar chahiye, batayein).

**6. Customer offers — premium animated reveal**
- Pehle ek loop animation: "🎉 You're Lucky! You got a chance to grab these offers today" (shimmer + scale-in).
- Phir do offers eye-catchy cards me reveal (glow + float + shimmer loop).
- Pura sequence infinite loop me chalta rahega.

**7. Veg / Non-Veg tagging + customer filter**
- Menu item me `food_type: "veg" | "non_veg"` field add (admin/reception menu form me toggle).
- Customer interface me top pe Veg / Non-Veg / All filter chips.
- Item card pe veg/non-veg indicator dot (green/red square).

**8. CRITICAL — Bill close hone pe revenue + history update + table auto-lock**
- `completeOrder` / `closeBill` flow me ensure: Bill entry create ho, today's revenue counter update ho, Bills & History me dikhe, aur related table status `LOCKED` ho jaye.
- Live dashboard se item complete karne par yahi flow trigger ho.

**9. Premium buttons & cards + elite animations**
- Buttons: gradient + sheen sweep + scale hover.
- Cards: subtle gold border glow + lift on hover + entry fade-up.

**10. Side menu — aur premium**
- Active item pe glowing gold accent bar, icon micro-rotate, smoother collapse, subtle bg pattern.

**11. Premium Welcome Page (Reception / Admin selection)**
- New first-screen welcome page (app boot pe dikhega — before LoginScreen).
- Animated background: CSS-driven warm kitchen ambience (rising smoke wisps, flickering flames, floating red chillies with 3D tilt, occasional pan-toss sparks).
  - Note: yeh real 3D model nahi hoga (web me heavy); CSS/SVG + Framer Motion se cinematic 3D-feel illusion banaunga (depth, parallax, glow, motion blur).
- Center: Maharaji Kitchen logo + name + tagline + 2 premium buttons (Reception / Admin).
- Click karne par respective LoginScreen pre-selected role ke saath khulega.

## Technical notes (skip if not needed)

- Files touched: `mk-store.ts`, `mk-types.ts`, `DashboardReports.tsx`, `DashboardStock.tsx`, `DashboardMenu.tsx`, `DashboardLive.tsx`, `DashboardActiveOrders.tsx`, `CustomerInterface.tsx`, `LoginScreen.tsx`, `StaffShell.tsx`, `PremiumUI.tsx`, `styles.css`, `routes/index.tsx`, + new `WelcomeScreen.tsx`.
- Existing working features (jo aapne bola hai theek hain) ko touch nahi karunga — only listed scope.
- Point 8 ko sabse pehle fix karunga taaki regression na ho.

## Confirm karein
- Point 2: sirf Admin pe password chahiye, ya Reception pe bhi?
- Point 5: delete poori tarah hatana, ya sirf reception ke liye block (admin allowed)?

Approve karne ke baad implement shuru.