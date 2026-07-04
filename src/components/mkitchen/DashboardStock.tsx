import React, { useState, useRef, useMemo } from "react";
import { useStore, parseRecipeText } from "@/lib/mk-store";
import { Button, Card, FormInput, VoiceSearchMic } from "@/components/mkitchen/PremiumUI";
import { toast } from "sonner";
import { Package, Plus, Trash2, Search, Download, Upload, X, IndianRupee, CreditCard, ChefHat, Scale, ArrowUpRight, Pencil, Printer, ChevronLeft, ChevronRight } from "lucide-react";
import { UserRole, OrderItemStatus, type StockPurchase } from "@/lib/mk-types";

export const DashboardStock: React.FC = () => {
  // Zustand States
  const stockPurchases = useStore(state => state.stockPurchases);
  const addStockEntry = useStore(state => state.addStockEntry);
  const editStockEntry = useStore(state => state.editStockEntry);
  const deleteStockEntry = useStore(state => state.deleteStockEntry);
  const supplierPayments = useStore(state => state.supplierPayments);
  const addSupplierPayment = useStore(state => state.addSupplierPayment);
  const currentUser = useStore(state => state.currentUser);
  const orderItems = useStore(state => state.orderItems);

  // F11 / F8: Material usage tracking (Knowledge Base recipe text per menu item)
  const menuItems = useStore(state => state.menuItems);
  const materialUsages = useStore(state => state.materialUsages);
  const menuRecipes = useStore(state => state.menuRecipes);
  const setMenuRecipe = useStore(state => state.setMenuRecipe);
  const deleteMenuRecipe = useStore(state => state.deleteMenuRecipe);
  

  // Form States
  const [itemName, setItemName] = useState("");
  const [qty, setQty] = useState("");
  const [unit, setUnit] = useState("kg");
  const [unitPrice, setUnitPrice] = useState("");
  const [supplier, setSupplier] = useState("");
  const [notes, setNotes] = useState("");

  // Knowledge Base recipe form states
  const [recipeMenuItemId, setRecipeMenuItemId] = useState("");
  const [recipeText, setRecipeText] = useState("");

  // Supplier Payment Modal States (F16)
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStockId, setPaymentStockId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "upi" | "bank" | "other">("cash");
  const [paymentRefNum, setPaymentRefNum] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [paymentProofImage, setPaymentProofImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Search Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("all");

  // Edit Stock Modal States (Admin only)
  const [editStockId, setEditStockId] = useState<string | null>(null);
  const [editItemName, setEditItemName] = useState("");
  const [editQty, setEditQty] = useState("");
  const [editUnit, setEditUnit] = useState("kg");
  const [editUnitPrice, setEditUnitPrice] = useState("");
  const [editSupplier, setEditSupplier] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const computedTotal = (parseFloat(qty) || 0) * (parseFloat(unitPrice) || 0);

  const isAdmin = currentUser?.role === UserRole.ADMIN;
  const isReception = currentUser?.role === UserRole.RECEPTION;
  const canSeeTracing = isAdmin || isReception;


  const handleSaveRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipeMenuItemId) {
      toast.error("Please select a menu item first.");
      return;
    }
    if (!recipeText.trim()) {
      toast.error("Please write the per-plate ingredients in the text area.");
      return;
    }
    setMenuRecipe(recipeMenuItemId, recipeText.trim());
    const dish = menuItems.find(m => m.id === recipeMenuItemId);
    toast.success(`Knowledge base updated for "${dish?.name ?? "dish"}"`);
    setRecipeMenuItemId("");
    setRecipeText("");
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qtyVal = parseFloat(qty);
    const priceVal = parseFloat(unitPrice);

    if (!itemName || isNaN(qtyVal) || isNaN(priceVal)) {
      toast.error("Please enter Name, Quantity and Unit Price!");
      return;
    }

    addStockEntry({
      date: new Date().toISOString(),
      item_name: itemName,
      quantity: qtyVal,
      unit,
      unit_price: priceVal,
      supplier,
      notes: notes || undefined
    });

    // Reset Form
    setItemName("");
    setQty("");
    setUnitPrice("");
    setSupplier("");
    setNotes("");
  };

  // Handle image upload for payment proof (F16)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentProofImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePayment = () => {
    if (!paymentStockId || !paymentAmount) {
      toast.error("Please enter payment amount");
      return;
    }

    addSupplierPayment({
      stock_purchase_id: paymentStockId,
      amount: parseFloat(paymentAmount),
      payment_date: new Date().toISOString(),
      payment_method: paymentMethod,
      reference_number: paymentRefNum || undefined,
      notes: paymentNotes || undefined,
      proof_image_url: paymentProofImage || undefined
    });

    setShowPaymentModal(false);
    setPaymentStockId(null);
    setPaymentAmount("");
    setPaymentRefNum("");
    setPaymentNotes("");
    setPaymentProofImage(null);
    toast.success("Supplier payment recorded successfully!");
  };

  const openPaymentModal = (stockId: string) => {
    setPaymentStockId(stockId);
    setPaymentAmount("");
    setPaymentMethod("cash");
    setPaymentRefNum("");
    setPaymentNotes("");
    setPaymentProofImage(null);
    setShowPaymentModal(true);
  };

  // Admin: open edit modal pre-filled with the selected purchase entry.
  const openEditModal = (stockId: string) => {
    const s = stockPurchases.find(x => x.id === stockId);
    if (!s) return;
    setEditStockId(stockId);
    setEditItemName(s.item_name);
    setEditQty(String(s.quantity));
    setEditUnit(s.unit);
    setEditUnitPrice(String(s.unit_price));
    setEditSupplier(s.supplier || "");
    setEditNotes(s.notes || "");
  };

  const handleSaveEdit = () => {
    if (!editStockId) return;
    const qtyVal = parseFloat(editQty);
    const priceVal = parseFloat(editUnitPrice);
    if (!editItemName.trim() || isNaN(qtyVal) || isNaN(priceVal) || qtyVal <= 0 || priceVal < 0) {
      toast.error("Please enter a valid name, quantity and unit price.");
      return;
    }
    editStockEntry(editStockId, {
      item_name: editItemName.trim(),
      quantity: qtyVal,
      unit: editUnit,
      unit_price: priceVal,
      supplier: editSupplier,
      notes: editNotes || undefined,
    });
    toast.success("Purchase entry updated.");
    setEditStockId(null);
  };

  const handleDeleteStock = (stockId: string) => {
    const s = stockPurchases.find(x => x.id === stockId);
    if (!s) return;
    if (!confirm(`Delete purchase entry "${s.item_name}" (₹${s.total.toFixed(2)})? This cannot be undone.`)) return;
    deleteStockEntry(stockId);
    toast.success("Purchase entry deleted.");
  };


  // Autocomplete hints from previous distinct items
  const uniqueItemSuggestions = Array.from(new Set(stockPurchases.map(s => s.item_name)));

  // Calculate stats KPIs
  const totalStockValue = stockPurchases.reduce((acc, s) => acc + s.total, 0);
  const totalPayments = supplierPayments.reduce((acc, p) => acc + p.amount, 0);
  const pendingPayments = totalStockValue - totalPayments;

  const now = new Date();
  const todayPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const todayPurchases = stockPurchases
    .filter(s => s.date.startsWith(todayPrefix))
    .reduce((acc, s) => acc + s.total, 0);

  // ---- Per-material aggregated stats (added − used = in-hand) ----
  const materialStats = useMemo(() => {
    const soldByMenuItem: Record<string, number> = {};
    orderItems.forEach(oi => {
      if (oi.status === OrderItemStatus.CONFIRMED) {
        soldByMenuItem[oi.menu_item_id] = (soldByMenuItem[oi.menu_item_id] || 0) + oi.quantity;
      }
    });
    const consumedByName: Record<string, number> = {};
    materialUsages.forEach(mu => {
      const sold = soldByMenuItem[mu.menu_item_id] || 0;
      if (sold <= 0) return;
      const key = mu.material_name.trim().toLowerCase();
      consumedByName[key] = (consumedByName[key] || 0) + sold * mu.quantity_per_plate;
    });
    const byKey: Record<string, { display: string; unit: string; purchases: StockPurchase[]; totalPurchased: number; consumed: number; inHand: number }> = {};
    stockPurchases.forEach(sp => {
      const key = sp.item_name.trim().toLowerCase();
      if (!byKey[key]) byKey[key] = { display: sp.item_name, unit: sp.unit, purchases: [], totalPurchased: 0, consumed: 0, inHand: 0 };
      byKey[key].purchases.push(sp);
      byKey[key].totalPurchased += sp.quantity;
    });
    Object.keys(byKey).forEach(k => {
      byKey[k].purchases.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      byKey[k].consumed = consumedByName[k] || 0;
      byKey[k].inHand = Math.max(0, byKey[k].totalPurchased - byKey[k].consumed);
    });
    return byKey;
  }, [stockPurchases, materialUsages, orderItems]);

  const inHandFor = (name: string) => materialStats[name.trim().toLowerCase()]?.inHand ?? 0;

  // ---- Ledger filters (Update 3) ----
  const [ledgerMaterial, setLedgerMaterial] = useState("all");
  const [ledgerSupplier, setLedgerSupplier] = useState("all");
  const [ledgerFrom, setLedgerFrom] = useState("");
  const [ledgerTo, setLedgerTo] = useState("");
  const [ledgerPage, setLedgerPage] = useState(1);
  const LEDGER_PAGE_SIZE = 10;

  const uniqueMaterials = Array.from(new Set(stockPurchases.map(s => s.item_name))).sort();
  const uniqueSuppliers = Array.from(new Set(stockPurchases.map(s => s.supplier).filter(Boolean))).sort();

  const filteredStock = stockPurchases
    .filter(stock => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || stock.item_name.toLowerCase().includes(q) || stock.supplier.toLowerCase().includes(q);
      const matchesUnit = selectedUnit === "all" || stock.unit === selectedUnit;
      const matchesMaterial = ledgerMaterial === "all" || stock.item_name === ledgerMaterial;
      const matchesSupplier = ledgerSupplier === "all" || stock.supplier === ledgerSupplier;
      const d = new Date(stock.date).getTime();
      const matchesFrom = !ledgerFrom || d >= new Date(ledgerFrom).getTime();
      const matchesTo = !ledgerTo || d <= new Date(ledgerTo + "T23:59:59").getTime();
      return matchesSearch && matchesUnit && matchesMaterial && matchesSupplier && matchesFrom && matchesTo;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const ledgerTotalPages = Math.max(1, Math.ceil(filteredStock.length / LEDGER_PAGE_SIZE));
  const ledgerPageSafe = Math.min(ledgerPage, ledgerTotalPages);
  const pagedStock = filteredStock.slice((ledgerPageSafe - 1) * LEDGER_PAGE_SIZE, ledgerPageSafe * LEDGER_PAGE_SIZE);

  // F15: Export CSV/Excel download (respects filters + includes In-hand)
  const handleExportCSV = () => {
    const headers = ["Date", "Item Name", "Qty", "Unit", "Unit Price (INR)", "Total Value (INR)", "Supplier", "In Hand (current)", "Notes"];
    const rows = filteredStock.map(s => [
      new Date(s.date).toLocaleDateString(),
      s.item_name,
      s.quantity,
      s.unit,
      s.unit_price,
      s.total,
      s.supplier,
      `${inHandFor(s.item_name).toFixed(2)} ${s.unit}`,
      (s.notes || "").replace(/,/g, ";"),
    ]);
    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `maharaji_stock_ledger_${todayPrefix}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Stock ledger exported successfully!");
  };

  // ---- Stock Tracing (Admin/Reception) ----
  const [traceMode, setTraceMode] = useState<"daily" | "range">("daily");
  const [traceDay, setTraceDay] = useState(todayPrefix); // yyyy-mm-dd
  const [traceFrom, setTraceFrom] = useState(todayPrefix);
  const [traceTo, setTraceTo] = useState(todayPrefix);
  const [traceMaterial, setTraceMaterial] = useState("all");
  const [tracePage, setTracePage] = useState(1);
  const TRACE_PAGE_SIZE = 10;

  const traceWindow = useMemo(() => {
    if (traceMode === "daily") {
      const s = new Date(traceDay + "T00:00:00").getTime();
      const e = new Date(traceDay + "T23:59:59.999").getTime();
      return { start: s, end: e };
    }
    const s = new Date((traceFrom || todayPrefix) + "T00:00:00").getTime();
    const e = new Date((traceTo || traceFrom || todayPrefix) + "T23:59:59.999").getTime();
    return { start: s, end: e };
  }, [traceMode, traceDay, traceFrom, traceTo, todayPrefix]);

  // Per-material consumption in [start,end] window using per-plate recipes on CONFIRMED order items
  const consumedInRange = (start: number, end: number) => {
    const out: Record<string, number> = {};
    orderItems.forEach(oi => {
      if (oi.status !== OrderItemStatus.CONFIRMED) return;
      if (!oi.created_at) return;
      const t = new Date(oi.created_at).getTime();
      if (t < start || t > end) return;
      materialUsages.forEach(mu => {
        if (mu.menu_item_id !== oi.menu_item_id) return;
        const key = mu.material_name.trim().toLowerCase();
        out[key] = (out[key] || 0) + oi.quantity * mu.quantity_per_plate;
      });
    });
    return out;
  };

  // Update 1: Previous Balance Store MUST reflect the Purchases Ledger's in-hand quantity.
  // Use TOTAL purchases (all-time) so today's purchases are already sitting in the store,
  // then only subtract consumption BEFORE the selected window. Earlier we excluded
  // purchases dated inside the window, which made "In Store Remaining" go negative even
  // though the ledger clearly had stock.
  const totalPurchasedByKey = useMemo(() => {
    const out: Record<string, number> = {};
    stockPurchases.forEach(sp => {
      const key = sp.item_name.trim().toLowerCase();
      out[key] = (out[key] || 0) + sp.quantity;
    });
    return out;
  }, [stockPurchases]);

  const consumedBefore = (start: number) => {
    const out: Record<string, number> = {};
    orderItems.forEach(oi => {
      if (oi.status !== OrderItemStatus.CONFIRMED) return;
      if (!oi.created_at) return;
      if (new Date(oi.created_at).getTime() >= start) return;
      materialUsages.forEach(mu => {
        if (mu.menu_item_id !== oi.menu_item_id) return;
        const key = mu.material_name.trim().toLowerCase();
        out[key] = (out[key] || 0) + oi.quantity * mu.quantity_per_plate;
      });
    });
    return out;
  };

  // Update 2: source-of-truth = Saved Recipes (materialUsages). Every material in a saved recipe
  // shows up in Stock Tracing, even if it hasn't been purchased yet.
  const recipeMaterialsList = useMemo(() => {
    const map: Record<string, { display: string; unit: string }> = {};
    materialUsages.forEach(mu => {
      const key = mu.material_name.trim().toLowerCase();
      if (!map[key]) map[key] = { display: mu.material_name, unit: mu.unit };
    });
    // Prefer purchased-unit display if a matching purchase exists (keeps ledger consistent)
    Object.keys(map).forEach(k => {
      const info = materialStats[k];
      if (info) map[k] = { display: info.display, unit: info.unit };
    });
    return map;
  }, [materialUsages, materialStats]);

  // Update 4: in-column search on the Material column (case-insensitive)
  const [traceMaterialSearch, setTraceMaterialSearch] = useState("");

  const traceRows = useMemo(() => {
    const { start, end } = traceWindow;
    const cBefore = consumedBefore(start);
    // Update 3: same deduction logic as Low Stock (materialUsages × confirmed sold),
    // scoped to the date window so today's sales reflect in "Today Total Usage".
    const cRange = consumedInRange(start, end);
    const keys = Object.keys(recipeMaterialsList);
    const rows = keys.map(k => {
      const info = recipeMaterialsList[k];
      // Previous Balance = current Purchases Ledger stock (total purchased − consumed before window)
      const previous = Math.max(0, (totalPurchasedByKey[k] || 0) - (cBefore[k] || 0));
      const usage = cRange[k] || 0;
      const remaining = previous - usage;
      return {
        key: k,
        material: info.display,
        unit: info.unit,
        previous,
        usage,
        remaining,
      };
    });
    const byDropdown = traceMaterial === "all"
      ? rows
      : rows.filter(r => r.key === traceMaterial.trim().toLowerCase());
    const q = traceMaterialSearch.trim().toLowerCase();
    const bySearch = !q ? byDropdown : byDropdown.filter(r => r.material.toLowerCase().includes(q));
    return bySearch.sort((a, b) => a.material.localeCompare(b.material));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [traceWindow, recipeMaterialsList, materialUsages, orderItems, stockPurchases, traceMaterial, traceMaterialSearch]);

  // Update 6: Low Stock Alert — Remaining <= 25% of Previous Balance Store (today window).
  // Uses the exact same deduction pipeline as Stock Tracing, so it stays real-time.
  const lowStockAlerts = useMemo(() => {
    const todayStart = new Date(todayPrefix + "T00:00:00").getTime();
    const todayEnd = new Date(todayPrefix + "T23:59:59.999").getTime();
    const cBefore = consumedBefore(todayStart);
    const cToday = consumedInRange(todayStart, todayEnd);
    const alerts: { key: string; material: string; unit: string; remaining: number }[] = [];
    Object.keys(recipeMaterialsList).forEach(k => {
      const info = recipeMaterialsList[k];
      // Update 1 & 3: Previous Balance = total purchases − consumed before today,
      // matching the Purchases Ledger's in-hand quantity so the alert actually appears.
      const previous = Math.max(0, (totalPurchasedByKey[k] || 0) - (cBefore[k] || 0));
      if (previous <= 0) return;
      const usage = cToday[k] || 0;
      const remaining = previous - usage;
      if (remaining <= previous * 0.25) {
        alerts.push({ key: k, material: info.display, unit: info.unit, remaining: Math.max(0, remaining) });
      }
    });
    return alerts.sort((a, b) => a.remaining - b.remaining);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipeMaterialsList, orderItems, stockPurchases, materialUsages, todayPrefix]);

  const traceTotalPages = Math.max(1, Math.ceil(traceRows.length / TRACE_PAGE_SIZE));
  const traceSafePage = Math.min(tracePage, traceTotalPages);
  const pagedTrace = traceRows.slice((traceSafePage - 1) * TRACE_PAGE_SIZE, traceSafePage * TRACE_PAGE_SIZE);

  const traceRangeLabel = traceMode === "daily"
    ? traceDay
    : `${traceFrom || "—"} to ${traceTo || traceFrom || "—"}`;

  const handleTraceExportCSV = () => {
    const headers = ["Material", "Unit", "Previous Balance Store", "Today Total Usage", "In Store Remaining"];
    const rows = traceRows.map(r => [
      r.material,
      r.unit,
      r.previous.toFixed(2),
      r.usage.toFixed(2),
      r.remaining.toFixed(2),
    ]);
    const csv = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", `maharaji_stock_tracing_${traceRangeLabel.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Stock tracing exported (Excel/CSV)!");
  };

  const buildTracePrintHtml = () => {
    const rowsHtml = traceRows.map(r => `
      <tr>
        <td>${r.material}</td>
        <td style="text-align:right">${r.previous.toFixed(2)} ${r.unit}</td>
        <td style="text-align:right">${r.usage.toFixed(2)} ${r.unit}</td>
        <td style="text-align:right;${r.remaining <= 0 ? "color:#b91c1c;font-weight:bold;" : ""}">${r.remaining.toFixed(2)} ${r.unit}</td>
      </tr>`).join("");
    return `<!doctype html><html><head><title>Stock Tracing Report</title>
      <style>body{font-family:Arial,sans-serif;padding:20px;color:#1c1917}h2{margin:0 0 4px}table{width:100%;border-collapse:collapse;margin-top:12px;font-size:12px}th,td{border:1px solid #ddd;padding:6px 8px;text-align:left}th{background:#faf7f2}</style>
      </head><body>
      <h2>Maharaji Kitchen — Stock Tracing</h2>
      <div style="font-size:12px;color:#555">Generated: ${new Date().toLocaleString()} · Range: ${traceRangeLabel}${traceMaterial !== "all" ? ` · Material: ${materialStats[traceMaterial.trim().toLowerCase()]?.display ?? traceMaterial}` : ""}</div>
      <table><thead><tr><th>Material</th><th>Previous Balance</th><th>Today Total Usage</th><th>In Store Remaining</th></tr></thead><tbody>${rowsHtml}</tbody></table>
      <script>window.onload=()=>{window.print();}</script>
      </body></html>`;
  };

  const handleTracePrint = () => {
    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) { toast.error("Popup blocked. Allow popups to print."); return; }
    w.document.write(buildTracePrintHtml());
    w.document.close();
  };

  const handleTracePDF = () => {
    // Uses browser's Print → Save as PDF flow (no extra dependencies).
    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) { toast.error("Popup blocked. Allow popups to save as PDF."); return; }
    w.document.write(buildTracePrintHtml().replace("<title>Stock Tracing Report</title>", "<title>Stock Tracing Report (PDF)</title>"));
    w.document.close();
    toast.success("Choose 'Save as PDF' in the print dialog.");
  };




  return (
    <div className="space-y-6 font-sans">

      {/* UPDATE 6 — LOW STOCK ALERT (Admin & Reception, sits ABOVE Stock Tracing) */}
      {canSeeTracing && lowStockAlerts.length > 0 && (
        <div className="bg-gradient-to-br from-red-50 to-amber-50 border-2 border-red-400/50 rounded-2xl p-5 space-y-3 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 mk-low-blink" aria-hidden />
            <h4 className="font-serif text-base font-bold text-red-700">
              Low Stock Alert
            </h4>
            <span className="ml-auto text-[10px] font-mono text-red-700/80">{lowStockAlerts.length} item{lowStockAlerts.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {lowStockAlerts.map(a => (
              <div
                key={a.key}
                className="mk-low-blink flex items-center justify-between gap-2 px-3 py-2 rounded-xl border border-red-400/50 bg-white/85"
              >
                <span className="text-[12px] font-semibold text-red-800 truncate">{a.material}</span>
                <span className="text-[11px] font-mono font-black text-red-700">{a.remaining.toFixed(2)} {a.unit}</span>
              </div>
            ))}
          </div>
          <style>{`
            @keyframes mkLowBlink { 0%,100% { opacity: 1 } 50% { opacity: 0.55 } }
            .mk-low-blink { animation: mkLowBlink 1.8s ease-in-out infinite; }
          `}</style>
        </div>
      )}

      {/* STOCK TRACING — Admin & Reception only. Placed at the very top. */}
      {canSeeTracing && (
        <div className="bg-white border-2 border-gold-rich/20 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h4 className="font-serif text-base font-bold text-maroon-royal flex items-center gap-2">
                <Scale className="w-5 h-5 text-gold-rich" />
                Stock Tracing
              </h4>
              <p className="text-[11px] text-mocha mt-0.5">
                Previous Balance − Usage (per-plate) = In Store Remaining. Zero / negative highlighted in red.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleTraceExportCSV} className="py-2 text-[10px] bg-white border-gold-rich/20">
                <Download className="w-3.5 h-3.5" /> <span>Excel</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleTracePDF} className="py-2 text-[10px] bg-white border-gold-rich/20">
                <Download className="w-3.5 h-3.5" /> <span>PDF</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleTracePrint} className="py-2 text-[10px] bg-white border-gold-rich/20">
                <Printer className="w-3.5 h-3.5" /> <span>Print</span>
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <div>
              <label className="block text-[10px] text-maroon-royal uppercase font-bold tracking-wider mb-1">Mode</label>
              <select
                value={traceMode}
                onChange={(e) => { setTraceMode(e.target.value as "daily" | "range"); setTracePage(1); }}
                className="w-full px-3 py-2 text-xs bg-white border border-gold-rich/20 rounded-lg focus:outline-none focus:border-gold-rich"
              >
                <option value="daily">Daily</option>
                <option value="range">Custom Range</option>
              </select>
            </div>
            {traceMode === "daily" ? (
              <div className="sm:col-span-2">
                <label className="block text-[10px] text-maroon-royal uppercase font-bold tracking-wider mb-1">Date</label>
                <input
                  type="date"
                  value={traceDay}
                  max={todayPrefix}
                  onChange={(e) => { const v = e.target.value; if (v && v > todayPrefix) { toast.error("Future dates are not allowed."); return; } setTraceDay(v); setTracePage(1); }}
                  className="w-full px-3 py-2 text-xs bg-white border border-gold-rich/20 rounded-lg focus:outline-none focus:border-gold-rich"
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-[10px] text-maroon-royal uppercase font-bold tracking-wider mb-1">From</label>
                  <input type="date" value={traceFrom} max={todayPrefix} onChange={(e) => { const v = e.target.value; if (v && v > todayPrefix) { toast.error("Future dates are not allowed."); return; } setTraceFrom(v); setTracePage(1); }} className="w-full px-3 py-2 text-xs bg-white border border-gold-rich/20 rounded-lg focus:outline-none focus:border-gold-rich" />
                </div>
                <div>
                  <label className="block text-[10px] text-maroon-royal uppercase font-bold tracking-wider mb-1">To</label>
                  <input type="date" value={traceTo} max={todayPrefix} onChange={(e) => { const v = e.target.value; if (v && v > todayPrefix) { toast.error("Future dates are not allowed."); return; } setTraceTo(v); setTracePage(1); }} className="w-full px-3 py-2 text-xs bg-white border border-gold-rich/20 rounded-lg focus:outline-none focus:border-gold-rich" />
                </div>
              </>
            )}
            <div className={traceMode === "daily" ? "sm:col-span-2" : ""}>
              <label className="block text-[10px] text-maroon-royal uppercase font-bold tracking-wider mb-1">Material</label>
              <select
                value={traceMaterial}
                onChange={(e) => { setTraceMaterial(e.target.value); setTracePage(1); }}
                className="w-full px-3 py-2 text-xs bg-white border border-gold-rich/20 rounded-lg focus:outline-none focus:border-gold-rich"
              >
                <option value="all">All materials</option>
                {Object.values(recipeMaterialsList).map(m => <option key={m.display} value={m.display}>{m.display}</option>)}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-gold-rich/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#FAF7F2] text-[9px] uppercase font-bold tracking-wider text-maroon-royal">
                    <th className="p-2.5">#</th>
                    <th className="p-2.5">
                      <div className="flex flex-col gap-1">
                        <span>Material</span>
                        {/* Update 4: quick in-column case-insensitive search */}
                        <div className="relative normal-case">
                          <Search className="absolute left-2 top-1.5 w-3 h-3 text-mocha" />
                          <input
                            type="text"
                            value={traceMaterialSearch}
                            onChange={(e) => { setTraceMaterialSearch(e.target.value); setTracePage(1); }}
                            placeholder="Search material..."
                            className="pl-6 pr-2 py-1 text-[10px] font-normal tracking-normal border border-gold-rich/20 rounded-md w-40 bg-white focus:outline-none focus:border-gold-rich"
                          />
                        </div>
                      </div>
                    </th>
                    <th className="p-2.5">Previous Balance Store</th>
                    <th className="p-2.5">Today Total Usage</th>
                    <th className="p-2.5">In Store Remaining</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold-rich/5">
                  {pagedTrace.length === 0 ? (
                    <tr><td colSpan={5} className="p-4 text-center text-mocha text-[11px]">No materials to trace for the selected filters.</td></tr>
                  ) : pagedTrace.map((r, i) => {
                    const isZero = r.remaining <= 0;
                    return (
                      <tr key={r.key} className={`hover:bg-[#FAF7F2]/40 ${isZero ? "bg-red-50/60" : ""}`}>
                        <td className={`p-2.5 ${isZero ? "text-red-700 font-bold" : "text-mocha"}`}>{(traceSafePage - 1) * TRACE_PAGE_SIZE + i + 1}</td>
                        <td className={`p-2.5 font-semibold ${isZero ? "text-red-700" : "text-espresso"}`}>{r.material}</td>
                        <td className={`p-2.5 font-mono ${isZero ? "text-red-700 font-bold" : "text-espresso"}`}>{r.previous.toFixed(2)} {r.unit}</td>
                        <td className={`p-2.5 font-mono ${isZero ? "text-red-700 font-bold" : "text-mocha"}`}>{r.usage.toFixed(2)} {r.unit}</td>
                        <td className={`p-2.5 font-mono font-black ${isZero ? "text-red-700" : "text-maroon-royal"}`}>{r.remaining.toFixed(2)} {r.unit}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {traceRows.length > TRACE_PAGE_SIZE && (
            <div className="flex items-center justify-between text-[11px] text-mocha">
              <span>Showing {(traceSafePage - 1) * TRACE_PAGE_SIZE + 1}–{Math.min(traceSafePage * TRACE_PAGE_SIZE, traceRows.length)} of {traceRows.length}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => setTracePage(Math.max(1, traceSafePage - 1))} disabled={traceSafePage === 1} className="p-1 rounded border border-gold-rich/20 bg-white disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"><ChevronLeft className="w-3.5 h-3.5" /></button>
                {Array.from({ length: traceTotalPages }).map((_, i) => (
                  <button key={i} onClick={() => setTracePage(i + 1)} className={`px-2 py-0.5 rounded border text-[11px] font-mono cursor-pointer ${traceSafePage === i + 1 ? "bg-maroon-royal text-cream-ivory border-maroon-royal" : "bg-white border-gold-rich/20"}`}>{i + 1}</button>
                ))}
                <button onClick={() => setTracePage(Math.min(traceTotalPages, traceSafePage + 1))} disabled={traceSafePage === traceTotalPages} className="p-1 rounded border border-gold-rich/20 bg-white disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"><ChevronRight className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          )}
        </div>
      )}




      {/* HEADER BAR */}
      <div className="border-b border-gold-rich/10 pb-4">
        <h3 className="font-serif text-xl font-bold text-maroon-royal flex items-center gap-1.5">
          <Package className="w-5 h-5 text-gold-rich" />
          Raw Materials Stock & Ledger
        </h3>
        <p className="text-xs text-mocha mt-1">
          Add operational kitchen ingredient purchases, monitor supplier costs, and compile balance logs.
        </p>
      </div>

      {/* 2. STATS KPI TICKERS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border border-gold-rich/10">
          <span className="block text-[8px] text-mocha font-bold uppercase tracking-wider">Today's Purchases</span>
          <h4 className="font-mono text-lg font-black text-maroon-royal mt-1">₹{todayPurchases.toFixed(2)}</h4>
          <span className="text-[10px] text-success font-medium flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> Checked in today
          </span>
        </Card>

        <Card className="p-4 bg-white border border-gold-rich/10">
          <span className="block text-[8px] text-mocha font-bold uppercase tracking-wider">Stock Assets Capital</span>
          <h4 className="font-mono text-lg font-black text-maroon-royal mt-1">₹{totalStockValue.toFixed(2)}</h4>
          <span className="text-[10px] text-mocha font-medium mt-1 block">Cumulative purchase records</span>
        </Card>

        <Card className="p-4 bg-white border border-gold-rich/10">
          <span className="block text-[8px] text-mocha font-bold uppercase tracking-wider">Payments Made</span>
          <h4 className="font-mono text-lg font-black text-success mt-1">₹{totalPayments.toFixed(2)}</h4>
          <span className="text-[10px] text-mocha font-medium mt-1 block">{supplierPayments.length} Payments recorded</span>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-[#1C1917] to-charcoal-soft text-cream-ivory border-gold-rich/20">
          <span className="block text-[8px] text-gold-shimmer/75 font-bold uppercase tracking-wider">Pending Payments</span>
          <h4 className="font-mono text-lg font-black text-warning mt-1">₹{pendingPayments.toFixed(2)}</h4>
          <span className="text-[10px] text-gold-light mt-1 block font-mono">Outstanding balance</span>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left column (4 cols) form parameters */}
        <div className="lg:col-span-4 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-maroon-royal border-l-2 border-gold-rich pl-2">
            Record New Purchase
          </h4>

          <form onSubmit={handleSubmit} className="bg-white p-5 rounded-2xl border border-gold-rich/10 shadow-sm space-y-4">

            <div className="relative mb-4">
              <FormInput
                label="Item Name"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="eg. Basmati rice, Mustard oil"
                required
              />
              {/* Intelligent dynamic autocomplete hint bar */}
              {itemName && uniqueItemSuggestions.filter(s => s.toLowerCase().startsWith(itemName.toLowerCase()) && s !== itemName).length > 0 && (
                <div className="absolute top-12 inset-x-0 bg-[#FAF7F2] border border-gold-rich/25 rounded-md text-[10px] p-2 flex gap-1 z-10 w-full flex-wrap shadow">
                  <span className="font-bold text-maroon-royal uppercase font-mono">Suggestions:</span>
                  {uniqueItemSuggestions
                    .filter(s => s.toLowerCase().startsWith(itemName.toLowerCase()) && s !== itemName)
                    .map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setItemName(s)}
                        className="bg-white px-1.5 py-0.5 rounded cursor-pointer hover:bg-cream-warm"
                      >
                        {s}
                      </button>
                    ))
                  }
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormInput
                label="Quantity"
                type="number"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                placeholder="eg. 25"
                required
              />

              {/* F15: Unit options - only unit, grams added, cans removed */}
              <div className="relative mb-5 font-sans">
                <label className="block text-[10px] text-maroon-royal uppercase font-bold tracking-wider mb-1">Unit</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3.5 py-3 text-sm text-espresso bg-white border border-gold-rich/20 rounded-xl focus:outline-none focus:border-gold-rich"
                >
                  <option value="kg">Kilograms (kg)</option>
                  <option value="g">Grams (g)</option>
                  <option value="litres">Litres (L)</option>
                  <option value="ml">Millilitres (ml)</option>
                  <option value="bag">Bags (pcs)</option>
                  <option value="units">Units (pcs)</option>
                </select>
              </div>
            </div>

            <FormInput
              label="Unit Price (₹)"
              type="number"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              placeholder="price per unit"
              required
            />

            <FormInput
              label="Supplier Title"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder="Merchant or farmer name"
            />

            <FormInput
              label="Additional Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Storage or grade notes"
            />

            {/* Read-only dynamically derived cost summary */}
            <div className="p-3 bg-cream-warm/20 rounded-xl text-xs font-medium space-y-1 border border-gold-rich/5">
              <div className="flex justify-between text-mocha">
                <span>Calculated cost:</span>
                <span className="font-mono text-espresso font-bold">₹{computedTotal.toFixed(2)}</span>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3 text-xs uppercase font-bold tracking-wider"
            >
              <Plus className="w-4 h-4" />
              <span>Record Stock</span>
            </Button>
          </form>

        </div>

        {/* Right ledger list table (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gold-rich/10">
            <h4 className="text-xs font-bold uppercase tracking-wider text-maroon-royal border-l-2 border-gold-rich pl-2">
              Purchases ledger
            </h4>

            {/* Quick Filter actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-mocha" />
                <input
                  type="text"
                  placeholder="Filter stock entries..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setLedgerPage(1); }}
                  className="pl-8 pr-3 py-1.5 text-xs border border-gold-rich/10 bg-white rounded-lg select-none"
                />
              </div>
              <VoiceSearchMic onResults={(v) => { setSearchQuery(v); setLedgerPage(1); }} />
              <Button
                variant="ghost"
                size="sm"
                className="py-1 px-3 text-xs flex items-center gap-1 bg-white shadow-sm border-gold-rich/15 text-mocha hover:text-maroon-royal"
                onClick={handleExportCSV}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </Button>
            </div>
          </div>

          {/* Advanced filters: Material, Supplier, Date range */}
          <div className="bg-white border border-gold-rich/10 rounded-xl p-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[9px] text-maroon-royal uppercase font-bold tracking-wider mb-1">Material</label>
              <select value={ledgerMaterial} onChange={(e) => { setLedgerMaterial(e.target.value); setLedgerPage(1); }} className="w-full px-2.5 py-1.5 text-xs bg-white border border-gold-rich/20 rounded-lg focus:outline-none focus:border-gold-rich">
                <option value="all">All materials</option>
                {uniqueMaterials.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[9px] text-maroon-royal uppercase font-bold tracking-wider mb-1">Supplier / Merchant</label>
              <select value={ledgerSupplier} onChange={(e) => { setLedgerSupplier(e.target.value); setLedgerPage(1); }} className="w-full px-2.5 py-1.5 text-xs bg-white border border-gold-rich/20 rounded-lg focus:outline-none focus:border-gold-rich">
                <option value="all">All suppliers</option>
                {uniqueSuppliers.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[9px] text-maroon-royal uppercase font-bold tracking-wider mb-1">From</label>
              <input type="date" value={ledgerFrom} onChange={(e) => { setLedgerFrom(e.target.value); setLedgerPage(1); }} className="w-full px-2.5 py-1.5 text-xs bg-white border border-gold-rich/20 rounded-lg focus:outline-none focus:border-gold-rich" />
            </div>
            <div>
              <label className="block text-[9px] text-maroon-royal uppercase font-bold tracking-wider mb-1">To</label>
              <input type="date" value={ledgerTo} onChange={(e) => { setLedgerTo(e.target.value); setLedgerPage(1); }} className="w-full px-2.5 py-1.5 text-xs bg-white border border-gold-rich/20 rounded-lg focus:outline-none focus:border-gold-rich" />
            </div>
          </div>

          {filteredStock.length === 0 ? (
            <div className="text-center p-8 bg-white border border-gold-rich/5 rounded-2xl">
              <span className="text-xl"><Package className="w-8 h-8 text-gold-rich/40 mx-auto" /></span>
              <h5 className="font-serif text-sm font-bold text-maroon-royal mt-1">Empty Stock Ledger</h5>
              <p className="text-[10px] text-mocha leading-relaxed mt-0.5">No raw material matches the current filters.</p>
            </div>
          ) : (
            <>
            <div className="bg-white border border-gold-rich/10 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-sans">
                  <thead>
                    <tr className="bg-[#FAF7F2] text-[9px] uppercase font-bold tracking-wider text-maroon-royal border-b border-gold-rich/10">
                      <th className="p-3">Received</th>
                      <th className="p-3">Particulars</th>
                      <th className="p-3">Quantity</th>
                      <th className="p-3">Unit Price</th>
                      <th className="p-3">Gross Total</th>
                      <th className="p-3">Merchant</th>
                      <th className="p-3">In Hand</th>
                      <th className="p-3">Payment</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold-rich/5 text-xs">
                    {pagedStock.map(s => {
                      const stockPayments = supplierPayments.filter(p => p.stock_purchase_id === s.id);
                      const totalPaid = stockPayments.reduce((sum, p) => sum + p.amount, 0);
                      const isFullyPaid = totalPaid >= s.total;
                      const inHand = inHandFor(s.item_name);

                      return (
                        <tr key={s.id} className="hover:bg-[#FAF7F2]/40 transition-colors">
                          <td className="p-3 text-mocha">{new Date(s.date).toLocaleDateString()}</td>
                          <td className="p-3 font-semibold text-espresso">
                            <span className="inline-flex items-center gap-1.5">
                              {s.item_name}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold text-espresso">{s.quantity} {s.unit}</td>
                          <td className="p-3 font-mono text-mocha">₹{s.unit_price} /unit</td>
                          <td className="p-3 font-mono font-bold text-maroon-royal font-black">₹{s.total.toFixed(0)}</td>
                          <td className="p-3 text-mocha truncate max-w-[100px]">{s.supplier || "Cash/Direct"}</td>
                          <td className="p-3 font-mono font-bold text-espresso">{inHand.toFixed(2)} {s.unit}</td>

                          <td className="p-3">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${isFullyPaid ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>
                              {isFullyPaid ? "Paid" : `₹${(s.total - totalPaid).toFixed(0)} due`}
                            </span>
                          </td>
                          <td className="p-3 flex items-center gap-1">
                            {!isFullyPaid && (
                              <button
                                onClick={() => openPaymentModal(s.id)}
                                className="p-1 rounded bg-success/10 text-success hover:bg-success/20 cursor-pointer"
                                title="Record Payment"
                              >
                                <IndianRupee className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {isAdmin && (
                              <>
                                <button
                                  onClick={() => openEditModal(s.id)}
                                  className="p-1 rounded bg-gold-rich/10 text-maroon-royal hover:bg-gold-rich/20 cursor-pointer"
                                  title="Edit Purchase"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteStock(s.id)}
                                  className="p-1 rounded bg-red-50 text-red-700 hover:bg-red-100 cursor-pointer"
                                  title="Delete Purchase"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between text-[11px] text-mocha pt-2">
              <span>Showing {(ledgerPageSafe - 1) * LEDGER_PAGE_SIZE + 1}–{Math.min(ledgerPageSafe * LEDGER_PAGE_SIZE, filteredStock.length)} of {filteredStock.length}</span>
              {ledgerTotalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button onClick={() => setLedgerPage(Math.max(1, ledgerPageSafe - 1))} disabled={ledgerPageSafe === 1} className="p-1 rounded border border-gold-rich/20 bg-white disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"><ChevronLeft className="w-3.5 h-3.5" /></button>
                  {Array.from({ length: ledgerTotalPages }).map((_, i) => (
                    <button key={i} onClick={() => setLedgerPage(i + 1)} className={`px-2 py-0.5 rounded border text-[11px] font-mono cursor-pointer ${ledgerPageSafe === i + 1 ? "bg-maroon-royal text-cream-ivory border-maroon-royal" : "bg-white border-gold-rich/20"}`}>{i + 1}</button>
                  ))}
                  <button onClick={() => setLedgerPage(Math.min(ledgerTotalPages, ledgerPageSafe + 1))} disabled={ledgerPageSafe === ledgerTotalPages} className="p-1 rounded border border-gold-rich/20 bg-white disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"><ChevronRight className="w-3.5 h-3.5" /></button>
                </div>
              )}
            </div>
            </>
          )}
        </div>

      </div>






      {/* F11: RAW MATERIAL PER-PLATE USAGE TRACKING (Admin only) */}
      {isAdmin && (
        <div className="border-t border-gold-rich/15 pt-6 space-y-4">
          <div>
            <h3 className="font-serif text-xl font-bold text-maroon-royal flex items-center gap-1.5">
              <Scale className="w-5 h-5 text-gold-rich" />
              Knowledge Base — Per-Plate Recipes
            </h3>
            <p className="text-xs text-mocha mt-1">
              Select a menu item and write all the raw ingredients with quantities for <span className="font-semibold text-maroon-royal">one plate</span>.
              The system parses this Knowledge Base and uses it with confirmed sales to track raw material consumption and low-stock alerts automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Recipe text form */}
            <form onSubmit={handleSaveRecipe} className="lg:col-span-5 bg-white p-5 rounded-2xl border border-gold-rich/10 shadow-sm space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-maroon-royal border-l-2 border-gold-rich pl-2">
                Add / Update Recipe
              </h4>

              <div>
                <label className="block text-[10px] text-maroon-royal uppercase font-bold tracking-wider mb-1">Menu Item (Dish)</label>
                <select
                  value={recipeMenuItemId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setRecipeMenuItemId(id);
                    setRecipeText(id ? (menuRecipes[id] ?? "") : "");
                  }}
                  className="w-full px-3.5 py-3 text-sm text-espresso bg-white border border-gold-rich/20 rounded-xl focus:outline-none focus:border-gold-rich"
                  required
                >
                  <option value="">— Select a menu dish —</option>
                  {menuItems.map(mi => {
                    const has = !!menuRecipes[mi.id];
                    return (
                      <option key={mi.id} value={mi.id}>
                        {mi.name}{has ? "  ✓" : ""}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-maroon-royal uppercase font-bold tracking-wider mb-1">
                  Ingredients for 1 Plate (one per line)
                </label>
                <textarea
                  value={recipeText}
                  onChange={(e) => setRecipeText(e.target.value)}
                  rows={9}
                  placeholder={`Example (one ingredient per line):\nPaneer 120 g\nBasmati Rice 80 g\nOnion 50 g\nTomato 40 g\nMustard Oil 15 ml\nGaram Masala 2 g\nSalt 3 g`}
                  className="w-full px-3.5 py-3 text-sm text-espresso bg-white border border-gold-rich/20 rounded-xl focus:outline-none focus:border-gold-rich font-mono leading-relaxed"
                  required
                />
                <p className="text-[10px] text-mocha mt-1.5 leading-relaxed">
                  Supported units: <span className="font-semibold">g, kg, ml, litres, units (pcs)</span>.
                  Format: <span className="font-mono">Ingredient name &lt;qty&gt; &lt;unit&gt;</span>. Comma or new line both work.
                </p>
              </div>

              {/* Live parse preview */}
              {recipeText.trim() && (
                <div className="bg-[#FAF7F2] border border-gold-rich/15 rounded-xl p-3">
                  <p className="text-[9px] uppercase font-bold tracking-wider text-maroon-royal mb-1.5">Parsed Preview</p>
                  {(() => {
                    const parsed = parseRecipeText(recipeText);
                    if (parsed.length === 0) {
                      return <p className="text-[11px] text-red-600">No ingredients detected — check format.</p>;
                    }
                    return (
                      <ul className="text-[11px] text-espresso space-y-0.5">
                        {parsed.map((p, i) => (
                          <li key={i} className="flex justify-between border-b border-dashed border-gold-rich/15 py-0.5 last:border-0">
                            <span>{p.material_name}</span>
                            <span className="font-mono font-bold text-maroon-royal">{p.quantity_per_plate} {p.unit}</span>
                          </li>
                        ))}
                      </ul>
                    );
                  })()}
                </div>
              )}

              <Button type="submit" variant="primary" className="w-full py-3 text-xs uppercase font-bold tracking-wider">
                <Plus className="w-4 h-4" />
                <span>Save Recipe to Knowledge Base</span>
              </Button>
            </form>

            {/* Right: Saved recipes per menu item */}
            <div className="lg:col-span-7 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-maroon-royal border-l-2 border-gold-rich pl-2">
                Saved Recipes ({Object.keys(menuRecipes).length})
              </h4>

              {Object.keys(menuRecipes).length === 0 ? (
                <div className="text-center p-8 bg-white border border-gold-rich/5 rounded-2xl">
                  <ChefHat className="w-8 h-8 text-gold-rich/40 mx-auto" />
                  <p className="text-[11px] text-mocha mt-2">No recipes saved yet. Add the first one on the left.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                  {Object.entries(menuRecipes).map(([menuItemId, text]) => {
                    const dish = menuItems.find(m => m.id === menuItemId);
                    const items = materialUsages.filter(mu => mu.menu_item_id === menuItemId);
                    return (
                      <div key={menuItemId} className="bg-white border border-gold-rich/10 rounded-2xl p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <p className="font-serif text-base font-bold text-maroon-royal">
                              {dish?.name || "Unknown dish"}
                            </p>
                            <p className="text-[10px] text-mocha uppercase tracking-wider">
                              {items.length} ingredient{items.length === 1 ? "" : "s"} · per plate
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setRecipeMenuItemId(menuItemId);
                                setRecipeText(text);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-gold-rich/10 text-maroon-royal text-[10px] font-bold uppercase tracking-wider hover:bg-gold-rich/20 cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Delete recipe for "${dish?.name ?? "this dish"}"?`)) {
                                  deleteMenuRecipe(menuItemId);
                                  if (recipeMenuItemId === menuItemId) {
                                    setRecipeMenuItemId("");
                                    setRecipeText("");
                                  }
                                  toast.success("Recipe deleted");
                                }
                              }}
                              className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        {items.length > 0 ? (
                          <ul className="text-xs text-espresso grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                            {items.map(mu => (
                              <li key={mu.id} className="flex justify-between border-b border-dashed border-gold-rich/10 py-1">
                                <span className="text-mocha">{mu.material_name}</span>
                                <span className="font-mono font-bold text-maroon-royal">{mu.quantity_per_plate} {mu.unit}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-[11px] text-red-600">No ingredients parsed — please re-check the format.</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}



      {/* F16: Supplier Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 -mt-2 pt-2 pb-2">
              <h3 className="font-serif text-lg font-bold text-maroon-royal">Record Supplier Payment</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-mocha hover:text-maroon-royal">
                <X className="w-5 h-5" />
              </button>
            </div>


            <div className="space-y-4">
              <FormInput
                label="Payment Amount (₹)"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter amount"
                required
              />

              <div className="relative mb-4">
                <label className="block text-[10px] text-maroon-royal uppercase font-bold tracking-wider mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3.5 py-3 text-sm text-espresso bg-white border border-gold-rich/20 rounded-xl focus:outline-none focus:border-gold-rich"
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <FormInput
                label="Reference Number (Optional)"
                value={paymentRefNum}
                onChange={(e) => setPaymentRefNum(e.target.value)}
                placeholder="Transaction ID / Cheque No."
              />

              <FormInput
                label="Notes (Optional)"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="Additional notes"
              />

              {/* Image upload for payment proof */}
              <div className="space-y-2">
                <label className="block text-[10px] text-maroon-royal uppercase font-bold tracking-wider">
                  Proof Image (Optional)
                </label>
                <div className="border-2 border-dashed border-gold-rich/20 rounded-xl p-4 text-center">
                  {paymentProofImage ? (
                    <div className="space-y-2">
                      <img src={paymentProofImage} alt="Payment Proof" className="max-h-20 mx-auto rounded-lg object-contain" />
                      <button
                        type="button"
                        onClick={() => setPaymentProofImage(null)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Remove Image
                      </button>
                    </div>

                  ) : (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center gap-2 cursor-pointer"
                      >
                        <Upload className="w-8 h-8 text-gold-rich/40" />
                        <span className="text-xs text-mocha">Click to upload proof image (max 5MB)</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="ghost" size="sm" onClick={() => setShowPaymentModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={handleSavePayment} className="flex-1 font-bold">
                  <CreditCard className="w-4 h-4" />
                  <span>Record Payment</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin-only: Edit Purchase Modal */}
      {isAdmin && editStockId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-maroon-royal flex items-center gap-2">
                <Pencil className="w-5 h-5 text-gold-rich" /> Edit Purchase Entry
              </h3>
              <button onClick={() => setEditStockId(null)} className="p-1 hover:bg-cream-warm rounded">
                <X className="w-4 h-4 text-mocha" />
              </button>
            </div>

            <FormInput label="Item / Material Name" value={editItemName} onChange={(e) => setEditItemName(e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <FormInput label="Quantity" type="number" value={editQty} onChange={(e) => setEditQty(e.target.value)} />
              <div>
                <label className="block text-[10px] text-maroon-royal uppercase font-bold tracking-wider mb-1">Unit</label>
                <select
                  value={editUnit}
                  onChange={(e) => setEditUnit(e.target.value)}
                  className="w-full px-3.5 py-3 text-sm text-espresso bg-white border border-gold-rich/20 rounded-xl focus:outline-none focus:border-gold-rich"
                >
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="litres">litres</option>
                  <option value="ml">ml</option>
                  <option value="units">units</option>
                  <option value="packs">packs</option>
                  <option value="cyl">cyl</option>
                </select>
              </div>
            </div>
            <FormInput label="Unit Price (₹)" type="number" value={editUnitPrice} onChange={(e) => setEditUnitPrice(e.target.value)} />
            <FormInput label="Supplier" value={editSupplier} onChange={(e) => setEditSupplier(e.target.value)} />
            <FormInput label="Notes (optional)" value={editNotes} onChange={(e) => setEditNotes(e.target.value)} />

            <div className="text-[11px] text-mocha bg-cream-warm/40 rounded-lg px-3 py-2">
              New gross total: <span className="font-mono font-bold text-maroon-royal">₹{((parseFloat(editQty) || 0) * (parseFloat(editUnitPrice) || 0)).toFixed(2)}</span>
            </div>

            <div className="flex gap-2 pt-1">
              <Button variant="ghost" size="sm" onClick={() => setEditStockId(null)} className="flex-1">Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleSaveEdit} className="flex-1 font-bold">
                <span>Save Changes</span>
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

