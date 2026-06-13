import React, { useState, useMemo } from "react";
import { useStore } from "@/lib/mk-store";
import { Button, Card, EmptyState, Modal } from "@/components/mkitchen/PremiumUI";
import { FileText, Printer, Download, Eye, Clock, ShieldCheck, History, Search, Check, Calendar, ListFilter as Filter } from "lucide-react";
import jsPDF from "jspdf";

export const DashboardBills: React.FC = () => {
  // Zustand States
  const bills = useStore(state => state.bills);
  const billEditsLog = useStore(state => state.billEditsLog);
  const orderItems = useStore(state => state.orderItems);
  const menuItems = useStore(state => state.menuItems);
  const system = useStore(state => state.system);
  const posWidth = useStore(state => state.posWidth);

  // States
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);

  // F4: Date and bill no filters
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // F4: Filter bills by date range and bill number
  const filteredBills = useMemo(() => {
    let result = [...bills];

    // Filter by bill number
    if (searchQuery.trim()) {
      result = result.filter(b => b.bill_number.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // Filter by date range
    if (startDate) {
      result = result.filter(b => b.created_at >= startDate);
    }
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      result = result.filter(b => new Date(b.created_at) <= endDateTime);
    }

    return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [bills, searchQuery, startDate, endDate]);

  const handleCloseInspector = () => {
    setSelectedBillId(null);
  };

  const activeBill = bills.find(b => b.id === selectedBillId);
  const activeBillEdits = billEditsLog.filter(log => log.bill_id === selectedBillId);

  // Re-usable High-Fidelity PDF Past Invoice download
  const handleDownloadPastPDF = (bill: typeof bills[0]) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: posWidth === "58mm" ? [58, 150] : [80, 180]
    });

    const width = posWidth === "58mm" ? 58 : 80;

    // Headings
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.text("MAHARAJI KITCHEN", width / 2, 8, { align: "center" });

    doc.setFont("Helvetica", "italic");
    doc.setFontSize(7.5);
    doc.text(system.tagline, width / 2, 11, { align: "center" });

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(6);
    doc.text("Sukhanibasti, NH31C, West Bengal 735225", width / 2, 14, { align: "center" });
    doc.text("WhatsApp: +91 70764 30467", width / 2, 17, { align: "center" });

    doc.setLineWidth(0.1);
    doc.line(4, 20, width - 4, 20);

    // Meta
    doc.setFontSize(6.5);
    doc.text(`Table No: ${bill.table_number}`, 5, 24);
    doc.text(`Invoice: ${bill.bill_number}`, 5, 28);
    doc.text(`Date: ${bill.closed_at ? new Date(bill.closed_at).toLocaleDateString("en-IN") : "N/A"}`, width - 20, 24);
    doc.text("Type: Settlement Paid", width - 20, 28);

    doc.line(4, 31, width - 4, 31);

    // Items Column Titles
    doc.setFont("Helvetica", "bold");
    doc.text("ITEM", 5, 35);
    doc.text("QTY", width - 20, 35);
    doc.text("AMOUNT", width - 8, 35, { align: "right" });
    doc.line(4, 37, width - 4, 37);

    doc.setFont("Helvetica", "normal");
    let y = 41;

    // Write itemized breakdown
    if (bill.order_id) {
      const billItemList = orderItems.filter(oi => oi.order_id === bill.order_id && oi.status === "confirmed");
      billItemList.forEach(oi => {
        const mi = menuItems.find(m => m.id === oi.menu_item_id);
        const name = mi?.name.slice(0, 16) || "Item";
        doc.text(name, 5, y);
        doc.text(String(oi.quantity), width - 19, y);
        doc.text(`₹${(oi.price * oi.quantity).toFixed(0)}`, width - 8, y, { align: "right" });
        y += 5;
      });
    } else {
      doc.text("Dine-In Royal Banquet Course", 5, y);
      doc.text(`₹${bill.subtotal.toFixed(0)}`, width - 8, y, { align: "right" });
      y += 5;
    }

    doc.line(4, y, width - 4, y);
    y += 4;

    doc.text("Subtotal:", 5, y);
    doc.text(`₹${bill.subtotal.toFixed(2)}`, width - 8, y, { align: "right" });

    if (bill.discount > 0) {
      y += 5;
      doc.text(`Discount (${bill.coupon_code}):`, 5, y);
      doc.text(`-₹${bill.discount.toFixed(2)}`, width - 8, y, { align: "right" });
    }

    y += 5;
    doc.line(4, y, width - 4, y);
    y += 4;

    doc.setFont("Helvetica", "bold");
    doc.text("GRAND SETTLED TOTAL:", 5, y);
    doc.setFontSize(8.5);
    doc.text(`₹${bill.total.toFixed(2)}`, width - 8, y, { align: "right" });

    y += 7;
    doc.setFontSize(6.5);
    doc.setFont("Helvetica", "italic");
    doc.text("System Invoice Closed", width / 2, y, { align: "center" });

    doc.save(`maharaji-past-invoice-${bill.bill_number}.pdf`);
  };

  // Export filtered bills
  const handleExportCSV = () => {
    const headers = ["Invoice No", "Date", "Time", "Table No", "Subtotal", "Discount", "Coupon", "Total"];
    const rows = filteredBills.map(b => [
      b.bill_number,
      new Date(b.created_at).toLocaleDateString(),
      new Date(b.created_at).toLocaleTimeString(),
      b.table_number.toString(),
      b.subtotal.toFixed(2),
      b.discount.toFixed(2),
      b.coupon_code || "-",
      b.total.toFixed(2)
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `maharaji_bills_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="space-y-6 font-sans">

      {/* HEADER BAR */}
      <div className="border-b border-gold-rich/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-xl font-bold text-maroon-royal flex items-center gap-1.5">
            <FileText className="w-5 h-5 text-gold-rich" />
            Billing Ledger & Closed Archive
          </h3>
          <p className="text-xs text-mocha mt-1">
            Browse historical receipts with full details. Filter by date range or bill number.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="text-xs flex items-center gap-1"
          >
            <Filter className="w-3.5 h-3.5" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
          {filteredBills.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExportCSV}
              className="text-xs flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* F4: Filters Section */}
      {showFilters && (
        <Card className="p-4 bg-white border border-gold-rich/10">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-mocha" />
              <input
                type="text"
                placeholder="Search by Bill No..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-gold-rich/20 focus:outline-none focus:border-gold-rich"
              />
            </div>

            <div>
              <label className="block text-[9px] text-mocha uppercase font-bold mb-1">From Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gold-rich/20 focus:outline-none focus:border-gold-rich"
              />
            </div>

            <div>
              <label className="block text-[9px] text-mocha uppercase font-bold mb-1">To Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gold-rich/20 focus:outline-none focus:border-gold-rich"
              />
            </div>

            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
              Clear Filters
            </Button>
          </div>

          {(searchQuery || startDate || endDate) && (
            <div className="mt-3 text-xs text-mocha">
              Showing {filteredBills.length} of {bills.length} bills
            </div>
          )}
        </Card>
      )}

      {/* F4: Bills display with full details */}
      {filteredBills.length === 0 ? (
        <EmptyState
          title={bills.length === 0 ? "Archive is Empty" : "No Bills Match Filters"}
          message={bills.length === 0
            ? "No customer sittings have compiled checkout payments yet."
            : "Adjust your filters to see more results."}
        />
      ) : (
        <div className="bg-white border border-gold-rich/10 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans">
              <thead>
                <tr className="bg-[#FAF7F2] text-[9px] uppercase font-bold tracking-wider text-maroon-royal border-b border-gold-rich/10">
                  <th className="p-3">Invoice No</th>
                  <th className="p-3">Date & Time</th>
                  <th className="p-3">Table</th>
                  <th className="p-3">Items</th>
                  <th className="p-3">Subtotal</th>
                  <th className="p-3">Discount</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-rich/5 text-xs">
                {filteredBills.map(bill => {
                  const billItems = bill.order_id ? orderItems.filter(oi => oi.order_id === bill.order_id && oi.status === "confirmed") : [];
                  const itemNames = billItems.map(oi => {
                    const mi = menuItems.find(m => m.id === oi.menu_item_id);
                    return `${oi.quantity}x ${mi?.name || "Item"}`;
                  }).join(", ");

                  return (
                    <tr key={bill.id} className="hover:bg-[#FAF7F2]/40 transition-colors">
                      <td className="p-3 font-mono font-bold text-maroon-royal">{bill.bill_number}</td>
                      <td className="p-3 text-mocha">
                        <div>{new Date(bill.created_at).toLocaleDateString()}</div>
                        <div className="text-[10px] text-mocha/60">{new Date(bill.created_at).toLocaleTimeString()}</div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-maroon-royal/10 text-maroon-royal rounded text-[10px] font-bold">
                          T{bill.table_number}
                        </span>
                      </td>
                      <td className="p-3 text-espresso max-w-[200px] truncate" title={itemNames}>
                        {itemNames || "Dine-In Course"}
                      </td>
                      <td className="p-3 font-mono text-mocha">₹{bill.subtotal.toFixed(2)}</td>
                      <td className="p-3">
                        {bill.discount > 0 ? (
                          <span className="text-success font-mono">-₹{bill.discount.toFixed(2)}</span>
                        ) : (
                          <span className="text-mocha/40">-</span>
                        )}
                        {bill.coupon_code && (
                          <div className="text-[9px] text-gold-rich">{bill.coupon_code}</div>
                        )}
                      </td>
                      <td className="p-3 font-mono font-bold text-maroon-royal">₹{bill.total.toFixed(2)}</td>
                      <td className="p-3 flex items-center gap-1">
                        <button
                          onClick={() => handleDownloadPastPDF(bill)}
                          className="p-1.5 rounded bg-gold-rich/10 text-gold-rich hover:bg-gold-rich/20 cursor-pointer"
                          title="Download PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setSelectedBillId(bill.id)}
                          className="p-1.5 rounded bg-maroon-royal/10 text-maroon-royal hover:bg-maroon-royal/20 cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
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

      {/* IMMUTABLE DETAILED INVOICE INSPECTOR POPUP */}
      <Modal
        isOpen={selectedBillId !== null}
        onClose={handleCloseInspector}
        title="Royal Invoice Audit"
      >
        {activeBill && (
          <div className="space-y-4">

            {/* Header branding */}
            <div className="text-center bg-[#FAF7F2] p-4 rounded-2xl border border-gold-rich/10 relative overflow-hidden">
              <span className="font-serif font-black tracking-tight text-maroon-royal text-sm block">MAHARAJI KITCHEN</span>
              <span className="text-[9px] text-mocha font-serif font-bold tracking-widest block uppercase mt-0.5">{system.tagline}</span>
              <span className="text-[10px] font-mono text-espresso font-bold mt-2 truncate max-w-xs block mx-auto select-all bg-white/50 p-1 rounded">
                Ref No: {activeBill.bill_number}
              </span>
            </div>

            {/* Itemized breakdown */}
            {activeBill.order_id && (() => {
              const billItems = orderItems.filter(oi => oi.order_id === activeBill.order_id && oi.status === "confirmed");
              if (billItems.length === 0) return null;
              return (
                <div className="space-y-1.5 text-xs border-b border-gold-rich/10 pb-4">
                  <span className="block text-[8px] text-mocha font-bold uppercase tracking-wider mb-2">Items Ordered</span>
                  <div className="divide-y divide-gold-rich/5">
                    {billItems.map(oi => {
                      const mi = menuItems.find(m => m.id === oi.menu_item_id);
                      return (
                        <div key={oi.id} className="flex justify-between py-1.5">
                          <span className="text-espresso">{oi.quantity}x {mi?.name || "Unknown Item"}</span>
                          <span className="font-mono text-mocha">₹{(oi.price * oi.quantity).toFixed(2)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Bill core data rows */}
            <div className="space-y-1.5 text-xs border-b border-gold-rich/10 pb-4 pr-1">
              <span className="block text-[8px] text-mocha font-bold uppercase tracking-wider mb-2">Checkout Breakdown</span>
              <div className="flex justify-between">
                <span className="text-mocha">Table Service Spot:</span>
                <span className="font-mono text-espresso font-bold">Table {activeBill.table_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mocha">Settlement Closed:</span>
                <span className="font-mono text-espresso font-bold">
                  {activeBill.closed_at ? new Date(activeBill.closed_at).toLocaleString("en-IN", { hour12: true }) : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-mocha">Subtotal Amount:</span>
                <span className="font-mono text-espresso font-bold">₹{activeBill.subtotal.toFixed(2)}</span>
              </div>
              {activeBill.discount > 0 && (
                <div className="flex justify-between text-[#059669]">
                  <span>Applied Promo Coupon ({activeBill.coupon_code}):</span>
                  <span className="font-mono font-bold">-₹{activeBill.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-[13px] font-bold text-maroon-royal pt-1.5 border-t border-dashed border-gold-rich/20">
                <span>Grand Final Settled:</span>
                <span className="font-mono">₹{activeBill.total.toFixed(2)}</span>
              </div>
            </div>

            {/* 3. CAPTAIN MODIFICATION LOGS CHRONICLE */}
            {activeBillEdits.length > 0 && (
              <div className="p-3 bg-red-50/50 border border-red-200/50 rounded-xl space-y-1.5">
                <h5 className="text-[9px] font-bold uppercase tracking-wider text-red-700 flex items-center gap-1">
                  <History className="w-3.5 h-3.5" /> Captain Modification Log Tracked
                </h5>
                {activeBillEdits.map((log, idx) => {
                  const beforeObj = JSON.parse(log.before_json);
                  return (
                    <div key={idx} className="text-[10px] text-red-950 font-mono leading-relaxed space-y-0.5">
                      <div>- Edited by <span className="font-bold">{log.user_name}</span> at {new Date(log.timestamp).toLocaleTimeString()}</div>
                      <div className="bg-white/60 p-1 border border-red-200/30 rounded">
                        <div>BEFORE subtotal = <span className="font-bold">₹{beforeObj.subtotal?.toFixed(2)}</span></div>
                        <div>AFTER subtotal = <span className="font-bold">₹{activeBill.subtotal.toFixed(2)}</span></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Action check-outs */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button variant="ghost" size="sm" className="text-xs" onClick={handleCloseInspector}>
                Dismiss Panel
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="text-xs font-bold uppercase"
                onClick={() => handleDownloadPastPDF(activeBill)}
              >
                Download Receipt
              </Button>
            </div>

          </div>
        )}
      </Modal>

    </div>
  );
};
