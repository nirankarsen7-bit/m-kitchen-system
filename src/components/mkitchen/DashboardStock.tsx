import React, { useState, useRef } from "react";
import { useStore } from "@/lib/mk-store";
import { Button, Card, FormInput, VoiceSearchMic } from "@/components/mkitchen/PremiumUI";
import { toast } from "sonner";
import { Package, Plus, Trash2, Search, Download, Upload, X, IndianRupee, CreditCard, TriangleAlert as AlertTriangle, ChefHat, Scale, ArrowUpRight } from "lucide-react";
import { UserRole } from "@/lib/mk-types";

export const DashboardStock: React.FC = () => {
  // Zustand States
  const stockPurchases = useStore(state => state.stockPurchases);
  const addStockEntry = useStore(state => state.addStockEntry);
  const deleteStockEntry = useStore(state => state.deleteStockEntry);
  const supplierPayments = useStore(state => state.supplierPayments);
  const addSupplierPayment = useStore(state => state.addSupplierPayment);
  const currentUser = useStore(state => state.currentUser);

  // F11 / F8: Material usage tracking (Knowledge Base recipe text per menu item)
  const menuItems = useStore(state => state.menuItems);
  const materialUsages = useStore(state => state.materialUsages);
  const menuRecipes = useStore(state => state.menuRecipes);
  const setMenuRecipe = useStore(state => state.setMenuRecipe);
  const deleteMenuRecipe = useStore(state => state.deleteMenuRecipe);
  const getLowStockMaterials = useStore(state => state.getLowStockMaterials);

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

  const computedTotal = (parseFloat(qty) || 0) * (parseFloat(unitPrice) || 0);

  const isAdmin = currentUser?.role === UserRole.ADMIN;

  // Calculate low stock from store helper
  const lowStockList = getLowStockMaterials();

  const handleSaveMaterialUsage = (e: React.FormEvent) => {
    e.preventDefault();
    const qtyVal = parseFloat(muQtyPerPlate);
    if (!muMenuItemId || !muMaterialName.trim() || isNaN(qtyVal) || qtyVal <= 0) {
      toast.error("Please select a dish, material name and valid per-plate quantity.");
      return;
    }
    addMaterialUsage({
      menu_item_id: muMenuItemId,
      material_name: muMaterialName.trim(),
      quantity_per_plate: qtyVal,
      unit: muUnit
    });
    setMuMenuItemId("");
    setMuMaterialName("");
    setMuQtyPerPlate("");
    setMuUnit("g");
    toast.success("Material per-plate usage saved!");
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

  // Filter lists
  const filteredStock = stockPurchases.filter(stock => {
    const matchesSearch = stock.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          stock.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUnit = selectedUnit === "all" || stock.unit === selectedUnit;
    return matchesSearch && matchesUnit;
  });

  // F15: Export CSV/Excel download
  const handleExportCSV = () => {
    const headers = ["Date", "Item Name", "Qty", "Unit", "Unit Price (INR)", "Total Value (INR)", "Supplier", "Notes"];
    const rows = filteredStock.map(s => [
      new Date(s.date).toLocaleDateString(),
      s.item_name,
      s.quantity,
      s.unit,
      s.unit_price,
      s.total,
      s.supplier,
      s.notes || ""
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `maharaji_stock_invoice_${todayPrefix}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Stock data exported successfully!");
  };

  // Set of low-stock material names (lowercased) for row highlighting
  const lowStockNameSet = new Set(lowStockList.map(ls => ls.material.trim().toLowerCase()));

  return (
    <div className="space-y-6 font-sans">

      {/* LOW STOCK ALERT BANNER — Admin only, blinking */}
      {isAdmin && lowStockList.length > 0 && (
        <div className="low-stock-blink border-2 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-red-700 shrink-0 mt-0.5 animate-pulse" />
          <div className="flex-1">
            <h4 className="font-serif text-base font-black text-red-800 leading-tight">
              Low Stock Alert — {lowStockList.length} material{lowStockList.length > 1 ? "s" : ""} need{lowStockList.length > 1 ? "" : "s"} restock
            </h4>
            <p className="text-[11px] text-red-900/80 mt-1">
              These materials have crossed 70% consumption. Restock soon to avoid running out.
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {lowStockList.map((ls, i) => (
                <span key={i} className="text-[10px] font-bold uppercase tracking-wider bg-white/80 text-red-800 px-2 py-0.5 rounded border border-red-400">
                  {ls.material} · {Math.round(ls.percentConsumed * 100)}% used
                </span>
              ))}
            </div>
          </div>
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
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-mocha" />
                <input
                  type="text"
                  placeholder="Filter stock entries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs border border-gold-rich/10 bg-white rounded-lg select-none"
                />
              </div>
              <VoiceSearchMic onResults={(v) => setSearchQuery(v)} />
              {/* F15: Download option */}
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

          {filteredStock.length === 0 ? (
            <div className="text-center p-8 bg-white border border-gold-rich/5 rounded-2xl">
              <span className="text-xl"><Package className="w-8 h-8 text-gold-rich/40 mx-auto" /></span>
              <h5 className="font-serif text-sm font-bold text-maroon-royal mt-1">Empty Stock Ledger</h5>
              <p className="text-[10px] text-mocha leading-relaxed mt-0.5">No raw material matches the search keywords.</p>
            </div>
          ) : (
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
                      <th className="p-3">Payment</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold-rich/5 text-xs">
                    {filteredStock.map(s => {
                      const stockPayments = supplierPayments.filter(p => p.stock_purchase_id === s.id);
                      const totalPaid = stockPayments.reduce((sum, p) => sum + p.amount, 0);
                      const isFullyPaid = totalPaid >= s.total;

                      const isLow = isAdmin && lowStockNameSet.has(s.item_name.trim().toLowerCase());

                      return (
                        <tr key={s.id} className={`hover:bg-[#FAF7F2]/40 transition-colors ${isLow ? "low-stock-row" : ""}`}>
                          <td className="p-3 text-mocha">{new Date(s.date).toLocaleDateString()}</td>
                          <td className="p-3 font-semibold text-espresso">
                            <span className="inline-flex items-center gap-1.5">
                              {s.item_name}
                              {isLow && (
                                <span className="text-[8px] font-black uppercase tracking-wider bg-red-600 text-white px-1.5 py-0.5 rounded animate-pulse">
                                  Low
                                </span>
                              )}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold text-espresso">{s.quantity} {s.unit}</td>
                          <td className="p-3 font-mono text-mocha">₹{s.unit_price} /unit</td>
                          <td className="p-3 font-mono font-bold text-maroon-royal font-black">₹{s.total.toFixed(0)}</td>
                          <td className="p-3 text-mocha truncate max-w-[100px]">{s.supplier || "Cash/Direct"}</td>
                          <td className="p-3">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${isFullyPaid ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>
                              {isFullyPaid ? "Paid" : `₹${(s.total - totalPaid).toFixed(0)} due`}
                            </span>
                          </td>
                          <td className="p-3 flex items-center gap-1">
                            {/* F16: Record payment option */}
                            {!isFullyPaid && (
                              <button
                                onClick={() => openPaymentModal(s.id)}
                                className="p-1 rounded bg-success/10 text-success hover:bg-success/20 cursor-pointer"
                                title="Record Payment"
                              >
                                <IndianRupee className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {/* Point 5: Once a purchase is recorded, it cannot be deleted (audit-safe). */}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Low Stock detail breakdown — Admin only (≥70% consumption rule) */}
      {isAdmin && lowStockList.length > 0 && (
        <div className="border-t-2 border-red-300 pt-6">
          <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-5 space-y-3 shadow-lg">
            <h4 className="font-serif text-base font-bold text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
              Low Stock Details ({lowStockList.length})
            </h4>
            <p className="text-[11px] text-mocha leading-relaxed">
              Materials below have crossed 70% consumption based on Knowledge Base per-plate usage vs confirmed orders.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {lowStockList.map((ls, idx) => (
                <div key={idx} className="bg-white p-3 rounded-xl border border-red-300">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-espresso text-sm">{ls.material}</div>
                    <span className="text-[9px] font-black uppercase bg-red-600 text-white px-1.5 py-0.5 rounded">
                      {Math.round(ls.percentConsumed * 100)}% used
                    </span>
                  </div>
                  <div className="text-[10px] text-mocha mt-1">
                    Purchased: <span className="font-mono font-bold">{ls.totalPurchased.toFixed(2)} {ls.unit}</span>
                  </div>
                  <div className="text-[10px] text-mocha">
                    Consumed: <span className="font-mono font-bold">{ls.estimatedUsage.toFixed(2)} {ls.unit}</span>
                  </div>
                  <div className="text-[10px] text-mocha">
                    Stock left: <span className="font-mono font-bold text-red-700">{ls.currentStock.toFixed(2)} {ls.unit}</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full bg-red-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-600"
                      style={{ width: `${Math.min(100, Math.round(ls.percentConsumed * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* F11: RAW MATERIAL PER-PLATE USAGE TRACKING (Admin only) */}
      {isAdmin && (
        <div className="border-t border-gold-rich/15 pt-6 space-y-4">
          <div>
            <h3 className="font-serif text-xl font-bold text-maroon-royal flex items-center gap-1.5">
              <Scale className="w-5 h-5 text-gold-rich" />
              Raw Material Per-Plate Usage Tracking
            </h3>
            <p className="text-xs text-mocha mt-1">
              Define how much of each raw material is used per plate for each menu item. The system uses this with sales data to compute low-stock alerts automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Add form */}
            <form onSubmit={handleSaveMaterialUsage} className="lg:col-span-5 bg-white p-5 rounded-2xl border border-gold-rich/10 shadow-sm space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-maroon-royal border-l-2 border-gold-rich pl-2">
                Add Per-Plate Usage
              </h4>

              <div>
                <label className="block text-[10px] text-maroon-royal uppercase font-bold tracking-wider mb-1">Menu Item (Dish)</label>
                <select
                  value={muMenuItemId}
                  onChange={(e) => setMuMenuItemId(e.target.value)}
                  className="w-full px-3.5 py-3 text-sm text-espresso bg-white border border-gold-rich/20 rounded-xl focus:outline-none focus:border-gold-rich"
                  required
                >
                  <option value="">— Select a menu dish —</option>
                  {menuItems.map(mi => (
                    <option key={mi.id} value={mi.id}>{mi.name}</option>
                  ))}
                </select>
              </div>

              <FormInput
                label="Raw Material Name"
                value={muMaterialName}
                onChange={(e) => setMuMaterialName(e.target.value)}
                placeholder="eg. Paneer, Basmati Rice, Mustard Oil"
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <FormInput
                  label="Qty Per Plate"
                  type="number"
                  value={muQtyPerPlate}
                  onChange={(e) => setMuQtyPerPlate(e.target.value)}
                  placeholder="eg. 120"
                  required
                />
                <div>
                  <label className="block text-[10px] text-maroon-royal uppercase font-bold tracking-wider mb-1">Unit</label>
                  <select
                    value={muUnit}
                    onChange={(e) => setMuUnit(e.target.value)}
                    className="w-full px-3.5 py-3 text-sm text-espresso bg-white border border-gold-rich/20 rounded-xl focus:outline-none focus:border-gold-rich"
                  >
                    <option value="g">Grams (g)</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="ml">Millilitres (ml)</option>
                    <option value="litres">Litres (L)</option>
                    <option value="units">Units (pcs)</option>
                  </select>
                </div>
              </div>

              <Button type="submit" variant="primary" className="w-full py-3 text-xs uppercase font-bold tracking-wider">
                <Plus className="w-4 h-4" />
                <span>Save Usage Recipe</span>
              </Button>
            </form>

            {/* Right: List of saved usages */}
            <div className="lg:col-span-7 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-maroon-royal border-l-2 border-gold-rich pl-2">
                Saved Per-Plate Recipes ({materialUsages.length})
              </h4>

              {materialUsages.length === 0 ? (
                <div className="text-center p-8 bg-white border border-gold-rich/5 rounded-2xl">
                  <ChefHat className="w-8 h-8 text-gold-rich/40 mx-auto" />
                  <p className="text-[11px] text-mocha mt-2">No per-plate recipes saved yet. Add the first one on the left.</p>
                </div>
              ) : (
                <div className="bg-white border border-gold-rich/10 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto max-h-[320px] overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 bg-[#FAF7F2]">
                        <tr className="text-[9px] uppercase font-bold tracking-wider text-maroon-royal border-b border-gold-rich/10">
                          <th className="p-3">Menu Dish</th>
                          <th className="p-3">Material</th>
                          <th className="p-3">Per Plate</th>
                          <th className="p-3">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gold-rich/5 text-xs">
                        {materialUsages.map(mu => {
                          const dish = menuItems.find(m => m.id === mu.menu_item_id);
                          return (
                            <tr key={mu.id} className="hover:bg-[#FAF7F2]/40">
                              <td className="p-3 font-semibold text-espresso">{dish?.name || "Unknown dish"}</td>
                              <td className="p-3 text-mocha">{mu.material_name}</td>
                              <td className="p-3 font-mono font-bold text-maroon-royal">{mu.quantity_per_plate} {mu.unit}</td>
                              <td className="p-3">
                                <button
                                  onClick={() => deleteMaterialUsage(mu.id)}
                                  className="p-1 rounded bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
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

    </div>
  );
};
