import React, { useState, useMemo, useRef } from "react";
import { useStore } from "@/lib/mk-store";
import { Button, Card, FormInput } from "@/components/mkitchen/PremiumUI";
import { toast } from "sonner";
import { Truck, Plus, IndianRupee, CalendarDays, Download, Printer, FileSpreadsheet, FileText as FileTextIcon, Filter, ChevronDown, ChevronRight } from "lucide-react";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";

export const DashboardSuppliers: React.FC = () => {
  const stockPurchases = useStore(s => s.stockPurchases);
  const supplierPayments = useStore(s => s.supplierPayments);
  const addStockEntry = useStore(s => s.addStockEntry);
  const addSupplierPayment = useStore(s => s.addSupplierPayment);

  const today = new Date().toISOString().slice(0, 10);
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

  const [dateFrom, setDateFrom] = useState(monthAgo);
  const [dateTo, setDateTo] = useState(today);
  const [supplierFilter, setSupplierFilter] = useState<string>("all");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Add purchase form
  const [pSupplier, setPSupplier] = useState("");
  const [pItem, setPItem] = useState("");
  const [pQty, setPQty] = useState("");
  const [pUnit, setPUnit] = useState("kg");
  const [pPrice, setPPrice] = useState("");

  // Add payment form
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [paySupplier, setPaySupplier] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState<"cash" | "upi" | "bank" | "other">("cash");
  const [payRef, setPayRef] = useState("");
  const [payNotes, setPayNotes] = useState("");

  const allSuppliers = useMemo(() => {
    const s = new Set<string>();
    stockPurchases.forEach(p => p.supplier && s.add(p.supplier));
    supplierPayments.forEach(pay => {
      const sp = stockPurchases.find(x => x.id === pay.stock_purchase_id);
      if (sp?.supplier) s.add(sp.supplier);
    });
    return Array.from(s).sort();
  }, [stockPurchases, supplierPayments]);

  // Filter by date range and supplier
  const fromTs = new Date(dateFrom + "T00:00:00").getTime();
  const toTs = new Date(dateTo + "T23:59:59").getTime();

  const filteredPurchases = stockPurchases.filter(p => {
    const t = new Date(p.date).getTime();
    if (t < fromTs || t > toTs) return false;
    if (supplierFilter !== "all" && p.supplier !== supplierFilter) return false;
    return true;
  });

  const filteredPayments = supplierPayments.filter(pay => {
    const t = new Date(pay.payment_date).getTime();
    if (t < fromTs || t > toTs) return false;
    if (supplierFilter !== "all") {
      const sp = stockPurchases.find(x => x.id === pay.stock_purchase_id);
      if (sp?.supplier !== supplierFilter) return false;
    }
    return true;
  });

  // Group by supplier
  type SupplierRow = {
    supplier: string;
    purchases: typeof stockPurchases;
    payments: typeof supplierPayments;
    totalPurchased: number;
    totalPaid: number;
    balance: number;
  };

  const groupedBySupplier: SupplierRow[] = useMemo(() => {
    const map: Record<string, SupplierRow> = {};
    filteredPurchases.forEach(p => {
      const key = p.supplier || "Unknown";
      if (!map[key]) map[key] = { supplier: key, purchases: [], payments: [], totalPurchased: 0, totalPaid: 0, balance: 0 };
      map[key].purchases.push(p);
      map[key].totalPurchased += p.total;
    });
    filteredPayments.forEach(pay => {
      const sp = stockPurchases.find(x => x.id === pay.stock_purchase_id);
      const key = sp?.supplier || "Unknown";
      if (!map[key]) map[key] = { supplier: key, purchases: [], payments: [], totalPurchased: 0, totalPaid: 0, balance: 0 };
      map[key].payments.push(pay);
      map[key].totalPaid += pay.amount;
    });
    Object.values(map).forEach(r => { r.balance = r.totalPurchased - r.totalPaid; });
    return Object.values(map).sort((a, b) => b.totalPurchased - a.totalPurchased);
  }, [filteredPurchases, filteredPayments, stockPurchases]);

  const grandPurchased = groupedBySupplier.reduce((s, r) => s + r.totalPurchased, 0);
  const grandPaid = groupedBySupplier.reduce((s, r) => s + r.totalPaid, 0);
  const grandBalance = grandPurchased - grandPaid;

  const handleAddPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    const q = parseFloat(pQty);
    const pr = parseFloat(pPrice);
    if (!pSupplier.trim() || !pItem.trim() || isNaN(q) || isNaN(pr)) {
      toast.error("Please fill all purchase fields.");
      return;
    }
    addStockEntry({
      date: new Date().toISOString(),
      item_name: pItem.trim(),
      quantity: q,
      unit: pUnit,
      unit_price: pr,
      supplier: pSupplier.trim(),
    });
    toast.success(`Purchase recorded for ${pSupplier}.`);
    setPItem(""); setPQty(""); setPPrice("");
  };

  const handleAddPayment = () => {
    const amt = parseFloat(payAmount);
    if (!paySupplier.trim() || isNaN(amt) || amt <= 0) {
      toast.error("Please enter supplier and a valid amount.");
      return;
    }
    // Link payment to the most recent stock entry for that supplier (or a placeholder)
    const latest = [...stockPurchases].reverse().find(p => p.supplier === paySupplier.trim());
    addSupplierPayment({
      stock_purchase_id: latest?.id || "manual",
      amount: amt,
      payment_date: new Date().toISOString(),
      payment_method: payMethod,
      reference_number: payRef || undefined,
      notes: payNotes ? `[${paySupplier.trim()}] ${payNotes}` : `Payment to ${paySupplier.trim()}`,
    });
    toast.success(`Payment of ₹${amt} recorded for ${paySupplier}.`);
    setPayModalOpen(false);
    setPaySupplier(""); setPayAmount(""); setPayRef(""); setPayNotes("");
  };

  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  // ============ Reports ============
  const buildReportRows = () => {
    const rows: any[] = [];
    groupedBySupplier.forEach(r => {
      r.purchases.forEach(p => rows.push({
        Supplier: r.supplier, Type: "Purchase", Date: fmtDate(p.date),
        Item: p.item_name, Qty: `${p.quantity} ${p.unit}`,
        Rate: p.unit_price, Amount: p.total, Reference: p.notes || "",
      }));
      r.payments.forEach(pay => rows.push({
        Supplier: r.supplier, Type: "Payment", Date: fmtDate(pay.payment_date),
        Item: "—", Qty: "—", Rate: "—", Amount: -pay.amount,
        Reference: `${pay.payment_method.toUpperCase()}${pay.reference_number ? " #" + pay.reference_number : ""}`,
      }));
    });
    return rows;
  };

  const exportExcel = () => {
    const rows = buildReportRows();
    if (rows.length === 0) { toast.error("No data in selected range."); return; }
    const ws = XLSX.utils.json_to_sheet(rows);
    // Summary sheet
    const summary = groupedBySupplier.map(r => ({
      Supplier: r.supplier, Purchased: r.totalPurchased, Paid: r.totalPaid, Balance: r.balance,
    }));
    summary.push({ Supplier: "GRAND TOTAL", Purchased: grandPurchased, Paid: grandPaid, Balance: grandBalance });
    const ws2 = XLSX.utils.json_to_sheet(summary);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws2, "Summary");
    XLSX.utils.book_append_sheet(wb, ws, "Detailed");
    XLSX.writeFile(wb, `MK-Suppliers-${dateFrom}-to-${dateTo}.xlsx`);
    toast.success("Excel report downloaded.");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16); doc.text("Maharaji Kitchen — Supplier Report", 14, 18);
    doc.setFontSize(10);
    doc.text(`Period: ${fmtDate(dateFrom)} → ${fmtDate(dateTo)}`, 14, 26);
    doc.text(`Supplier filter: ${supplierFilter === "all" ? "All Suppliers" : supplierFilter}`, 14, 32);

    let y = 42;
    doc.setFontSize(12); doc.text("Summary", 14, y); y += 6;
    doc.setFontSize(9);
    doc.text(`Total Purchased: ₹${grandPurchased.toFixed(2)}`, 14, y); y += 5;
    doc.text(`Total Paid:      ₹${grandPaid.toFixed(2)}`, 14, y); y += 5;
    doc.text(`Outstanding:     ₹${grandBalance.toFixed(2)}`, 14, y); y += 8;

    groupedBySupplier.forEach(r => {
      if (y > 270) { doc.addPage(); y = 18; }
      doc.setFontSize(11); (doc as any).setFont(undefined, "bold");
      doc.text(`${r.supplier}  —  Purchased ₹${r.totalPurchased.toFixed(2)} | Paid ₹${r.totalPaid.toFixed(2)} | Balance ₹${r.balance.toFixed(2)}`, 14, y);
      y += 6; (doc as any).setFont(undefined, "normal"); doc.setFontSize(9);
      r.purchases.forEach(p => {
        if (y > 280) { doc.addPage(); y = 18; }
        doc.text(`P · ${fmtDate(p.date)} · ${p.item_name} · ${p.quantity}${p.unit} @ ₹${p.unit_price} = ₹${p.total.toFixed(2)}`, 18, y);
        y += 5;
      });
      r.payments.forEach(pay => {
        if (y > 280) { doc.addPage(); y = 18; }
        doc.text(`$ · ${fmtDate(pay.payment_date)} · Payment ₹${pay.amount.toFixed(2)} (${pay.payment_method}${pay.reference_number ? " #" + pay.reference_number : ""})`, 18, y);
        y += 5;
      });
      y += 4;
    });
    doc.save(`MK-Suppliers-${dateFrom}-to-${dateTo}.pdf`);
    toast.success("PDF report downloaded.");
  };

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = () => {
    const html = printRef.current?.innerHTML || "";
    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) { toast.error("Popup blocked. Please allow popups to print."); return; }
    w.document.write(`<html><head><title>Maharaji Kitchen — Supplier Report</title>
      <style>
        body { font-family: Inter, sans-serif; padding: 24px; color: #2b1a16; }
        h1 { font-family: 'Playfair Display', serif; color: #7B1E2B; margin-bottom: 4px; }
        h2 { color: #7B1E2B; border-bottom: 1px solid #D4AF37; padding-bottom: 4px; margin-top: 18px; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th, td { border: 1px solid #ddd; padding: 6px 10px; text-align: left; font-size: 12px; }
        th { background: #FAF0D8; color: #7B1E2B; }
        .summary { background: #FAF7F2; padding: 10px; border-left: 3px solid #D4AF37; margin-top: 10px; }
        .totals td { font-weight: bold; background: #FAF0D8; }
      </style></head><body>${html}</body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 300);
  };

  return (
    <div className="space-y-6 font-sans select-none">
      {/* Header */}
      <div className="border-b border-gold-rich/10 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h3 className="font-serif text-xl font-bold text-maroon-royal flex items-center gap-1.5">
            <Truck className="w-5 h-5 text-gold-rich" />
            Supplier Purchases &amp; Payments
          </h3>
          <p className="text-xs text-mocha mt-1">Track supplier-wise purchases, payments and outstanding balance.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" size="sm" onClick={exportPDF} className="text-xs">
            <FileTextIcon className="w-3.5 h-3.5" /> PDF
          </Button>
          <Button variant="ghost" size="sm" onClick={exportExcel} className="text-xs">
            <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
          </Button>
          <Button variant="ghost" size="sm" onClick={handlePrint} className="text-xs">
            <Printer className="w-3.5 h-3.5" /> Print
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      <Card className="p-4 bg-white border border-gold-rich/15">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gold-rich" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-maroon-royal">Date Range &amp; Supplier Filter</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-[10px] uppercase font-bold text-mocha mb-1">From</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-gold-rich/20 rounded-xl focus:outline-none focus:border-gold-rich" />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-mocha mb-1">To</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-gold-rich/20 rounded-xl focus:outline-none focus:border-gold-rich" />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-mocha mb-1">Supplier</label>
            <select value={supplierFilter} onChange={e => setSupplierFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-gold-rich/20 rounded-xl focus:outline-none focus:border-gold-rich">
              <option value="all">All Suppliers</option>
              {allSuppliers.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <Button variant="primary" size="sm" onClick={() => setPayModalOpen(true)} className="w-full text-xs">
              <IndianRupee className="w-3.5 h-3.5" /> Record Payment
            </Button>
          </div>
        </div>
      </Card>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="p-4 bg-gradient-to-br from-cream-warm/40 to-white border border-gold-rich/20">
          <div className="text-[10px] uppercase font-bold tracking-wider text-mocha">Total Purchased</div>
          <div className="font-serif text-2xl font-black text-maroon-royal mt-1">₹{grandPurchased.toFixed(2)}</div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-success/15 to-white border border-success/30">
          <div className="text-[10px] uppercase font-bold tracking-wider text-mocha">Total Paid</div>
          <div className="font-serif text-2xl font-black text-success mt-1">₹{grandPaid.toFixed(2)}</div>
        </Card>
        <Card className={`p-4 bg-gradient-to-br ${grandBalance > 0 ? "from-danger/15 to-white border-danger/30" : "from-success/10 to-white border-success/20"} border`}>
          <div className="text-[10px] uppercase font-bold tracking-wider text-mocha">Outstanding Balance</div>
          <div className={`font-serif text-2xl font-black mt-1 ${grandBalance > 0 ? "text-danger" : "text-success"}`}>₹{grandBalance.toFixed(2)}</div>
        </Card>
      </div>

      {/* Add purchase quick form */}
      <Card className="p-4 bg-white border border-gold-rich/10">
        <div className="text-[11px] font-bold uppercase tracking-wider text-maroon-royal mb-3 flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-gold-rich" /> Add Supplier Purchase
        </div>
        <form onSubmit={handleAddPurchase} className="grid grid-cols-1 md:grid-cols-6 gap-2 items-end">
          <FormInput label="Supplier" value={pSupplier} onChange={e => setPSupplier(e.target.value)} placeholder="Supplier name" required />
          <FormInput label="Item / Material" value={pItem} onChange={e => setPItem(e.target.value)} placeholder="e.g. Paneer" required />
          <FormInput label="Quantity" type="number" value={pQty} onChange={e => setPQty(e.target.value)} placeholder="0" required />
          <div>
            <label className="block text-[10px] text-maroon-royal uppercase font-bold tracking-wider mb-1">Unit</label>
            <select value={pUnit} onChange={e => setPUnit(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-white border border-gold-rich/20 rounded-xl focus:outline-none focus:border-gold-rich">
              <option value="kg">kg</option><option value="g">g</option>
              <option value="litres">litres</option><option value="ml">ml</option>
              <option value="units">units</option>
            </select>
          </div>
          <FormInput label="Rate (₹)" type="number" value={pPrice} onChange={e => setPPrice(e.target.value)} placeholder="0" required />
          <Button type="submit" variant="primary" size="sm" className="text-xs">
            <Plus className="w-3.5 h-3.5" /> Add
          </Button>
        </form>
      </Card>

      {/* Supplier-wise list */}
      <div className="space-y-3">
        {groupedBySupplier.length === 0 && (
          <div className="text-center py-10 text-sm text-mocha italic bg-white border border-dashed border-gold-rich/20 rounded-xl">
            No supplier records in the selected date range.
          </div>
        )}
        {groupedBySupplier.map(r => {
          const isOpen = expanded[r.supplier] ?? true;
          return (
            <Card key={r.supplier} className="bg-white border border-gold-rich/15 overflow-hidden">
              <button
                onClick={() => setExpanded({ ...expanded, [r.supplier]: !isOpen })}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-cream-warm/20 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  {isOpen ? <ChevronDown className="w-4 h-4 text-mocha" /> : <ChevronRight className="w-4 h-4 text-mocha" />}
                  <Truck className="w-4 h-4 text-gold-rich" />
                  <span className="font-bold text-sm text-espresso">{r.supplier}</span>
                </div>
                <div className="flex gap-4 text-[11px]">
                  <span className="text-mocha">Purchased: <b className="text-maroon-royal">₹{r.totalPurchased.toFixed(2)}</b></span>
                  <span className="text-mocha">Paid: <b className="text-success">₹{r.totalPaid.toFixed(2)}</b></span>
                  <span className="text-mocha">Balance: <b className={r.balance > 0 ? "text-danger" : "text-success"}>₹{r.balance.toFixed(2)}</b></span>
                </div>
              </button>
              {isOpen && (
                <div className="border-t border-gold-rich/10 p-4 space-y-3">
                  {r.purchases.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-mocha mb-1.5">Purchases ({r.purchases.length})</div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead className="bg-cream-warm/30">
                            <tr className="text-[10px] uppercase text-maroon-royal">
                              <th className="text-left p-2">Date</th><th className="text-left p-2">Item</th>
                              <th className="text-right p-2">Qty</th><th className="text-right p-2">Rate</th><th className="text-right p-2">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {r.purchases.map(p => (
                              <tr key={p.id} className="border-b border-gold-rich/5">
                                <td className="p-2">{fmtDate(p.date)}</td>
                                <td className="p-2">{p.item_name}</td>
                                <td className="p-2 text-right">{p.quantity} {p.unit}</td>
                                <td className="p-2 text-right">₹{p.unit_price}</td>
                                <td className="p-2 text-right font-bold">₹{p.total.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  {r.payments.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-mocha mb-1.5">Payments ({r.payments.length})</div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead className="bg-success/10">
                            <tr className="text-[10px] uppercase text-success">
                              <th className="text-left p-2">Date</th><th className="text-left p-2">Method</th>
                              <th className="text-left p-2">Reference</th><th className="text-right p-2">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {r.payments.map(pay => (
                              <tr key={pay.id} className="border-b border-gold-rich/5">
                                <td className="p-2">{fmtDate(pay.payment_date)}</td>
                                <td className="p-2 uppercase">{pay.payment_method}</td>
                                <td className="p-2">{pay.reference_number || "—"}</td>
                                <td className="p-2 text-right font-bold text-success">₹{pay.amount.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Hidden printable area */}
      <div ref={printRef} className="hidden">
        <h1>Maharaji Kitchen — Supplier Report</h1>
        <p><b>Period:</b> {fmtDate(dateFrom)} → {fmtDate(dateTo)} &nbsp; | &nbsp; <b>Supplier:</b> {supplierFilter === "all" ? "All Suppliers" : supplierFilter}</p>
        <div className="summary">
          <b>Total Purchased:</b> ₹{grandPurchased.toFixed(2)} &nbsp;|&nbsp;
          <b>Total Paid:</b> ₹{grandPaid.toFixed(2)} &nbsp;|&nbsp;
          <b>Outstanding:</b> ₹{grandBalance.toFixed(2)}
        </div>
        {groupedBySupplier.map(r => (
          <div key={r.supplier}>
            <h2>{r.supplier}</h2>
            <p>Purchased: ₹{r.totalPurchased.toFixed(2)} · Paid: ₹{r.totalPaid.toFixed(2)} · Balance: ₹{r.balance.toFixed(2)}</p>
            {r.purchases.length > 0 && (
              <table>
                <thead><tr><th>Date</th><th>Item</th><th>Qty</th><th>Rate</th><th>Total</th></tr></thead>
                <tbody>
                  {r.purchases.map(p => (
                    <tr key={p.id}><td>{fmtDate(p.date)}</td><td>{p.item_name}</td><td>{p.quantity} {p.unit}</td><td>₹{p.unit_price}</td><td>₹{p.total.toFixed(2)}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
            {r.payments.length > 0 && (
              <table>
                <thead><tr><th>Date</th><th>Method</th><th>Reference</th><th>Amount</th></tr></thead>
                <tbody>
                  {r.payments.map(pay => (
                    <tr key={pay.id}><td>{fmtDate(pay.payment_date)}</td><td>{pay.payment_method.toUpperCase()}</td><td>{pay.reference_number || "—"}</td><td>₹{pay.amount.toFixed(2)}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))}
      </div>

      {/* Payment modal */}
      {payModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="font-serif text-lg font-bold text-maroon-royal mb-3 flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-gold-rich" /> Record Supplier Payment
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] text-maroon-royal uppercase font-bold tracking-wider mb-1">Supplier</label>
                <input list="supplier-list" value={paySupplier} onChange={e => setPaySupplier(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-white border border-gold-rich/20 rounded-xl focus:outline-none focus:border-gold-rich"
                  placeholder="Supplier name" />
                <datalist id="supplier-list">
                  {allSuppliers.map(s => <option key={s} value={s} />)}
                </datalist>
              </div>
              <FormInput label="Amount (₹)" type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} placeholder="0" required />
              <div>
                <label className="block text-[10px] text-maroon-royal uppercase font-bold tracking-wider mb-1">Method</label>
                <select value={payMethod} onChange={e => setPayMethod(e.target.value as any)}
                  className="w-full px-3 py-2.5 text-sm bg-white border border-gold-rich/20 rounded-xl focus:outline-none focus:border-gold-rich">
                  <option value="cash">Cash</option><option value="upi">UPI</option>
                  <option value="bank">Bank Transfer</option><option value="other">Other</option>
                </select>
              </div>
              <FormInput label="Reference #" value={payRef} onChange={e => setPayRef(e.target.value)} placeholder="optional" />
              <FormInput label="Notes" value={payNotes} onChange={e => setPayNotes(e.target.value)} placeholder="optional" />
              <div className="flex gap-2 pt-2 justify-end">
                <Button variant="ghost" size="sm" type="button" onClick={() => setPayModalOpen(false)}>Discard</Button>
                <Button variant="primary" size="sm" type="button" onClick={handleAddPayment} className="font-bold">Save Payment</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
