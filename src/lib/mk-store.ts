import { create } from "zustand";
import {
  TableStatus,
  OrderItemStatus,
  UserRole,
  CouponStatus,
  User,
  Table,
  Category,
  MenuItem,
  Order,
  OrderItem,
  Bill,
  BillEditLog,
  TodaysOffer,
  Coupon,
  StockPurchase,
  AuditLog,
  MaterialUsage,
  SupplierPayment,
  CouponSettings
} from "@/lib/mk-types";

// Knowledge Base parser: turn a long free-form recipe text into per-plate ingredient rows.
// Accepts lines or comma/semicolon separated entries like:
//   "Paneer 120g", "Basmati Rice - 80 g", "Mustard Oil: 15 ml", "Onion 1 unit"
type ParsedIngredient = { material_name: string; quantity_per_plate: number; unit: string };
const normalizeUnit = (raw: string | undefined): string => {
  if (!raw) return "g";
  const u = raw.toLowerCase().replace(/\.$/, "");
  if (["g", "gram", "grams", "gm", "gms"].includes(u)) return "g";
  if (["kg", "kgs", "kilogram", "kilograms"].includes(u)) return "kg";
  if (["ml", "millilitre", "milliliter", "millilitres", "milliliters"].includes(u)) return "ml";
  if (["l", "lt", "ltr", "litre", "liter", "litres", "liters"].includes(u)) return "litres";
  if (["pc", "pcs", "piece", "pieces", "unit", "units", "nos", "no"].includes(u)) return "units";
  return u;
};
export function parseRecipeText(text: string): ParsedIngredient[] {
  if (!text) return [];
  const segments = text.split(/[\n,;]+/).map(s => s.trim()).filter(Boolean);
  const out: ParsedIngredient[] = [];
  for (const seg of segments) {
    const cleaned = seg.replace(/^[-•*\d.)\s]+/, "").trim();
    // name <sep> qty <unit?>
    const m = cleaned.match(/^(.+?)[\s:=\-–—]+(\d+(?:\.\d+)?)\s*([a-zA-Z]+)?\.?$/);
    if (!m) continue;
    const name = m[1].trim().replace(/[-:–—]+$/, "").trim();
    const qty = parseFloat(m[2]);
    const unit = normalizeUnit(m[3]);
    if (!name || isNaN(qty) || qty <= 0) continue;
    out.push({ material_name: name, quantity_per_plate: qty, unit });
  }
  return out;
}

// Premium Curated Unsplash images dictionary for Indian foods
const PREMIUM_FOOD_IMAGES: Record<string, string> = {
  paneer: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&q=80",
  tikka: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&q=80",
  biryani: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&q=80",
  dal: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&q=80",
  naan: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=500&q=80",
  roti: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=500&q=80",
  kebab: "https://images.unsplash.com/photo-1601050690597-df056fb49785?w=500&q=80",
  mithai: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500&q=80",
  gulab: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500&q=80",
  rasgulla: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500&q=80",
  shahi: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=500&q=80",
  curry: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=500&q=80",
  samosa: "https://images.unsplash.com/photo-1601050690597-df056fb49785?w=500&q=80",
  starter: "https://images.unsplash.com/photo-1601050690597-df056fb49785?w=500&q=80",
  rice: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=500&q=80",
  default: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&q=80"
};

// Culinary description generator using templates
export function generateDescription(name: string, categoryName: string): string {
  const normName = name.toLowerCase();
  
  if (normName.includes("paneer")) {
    return `Savor soft, hand-made cottage cheese cubes cooked in a royal ${categoryName.toLowerCase()} blend, featuring premium local spices and a velvety texture.`;
  }
  if (normName.includes("biryani")) {
    return `Fragrant aged basmati rice slow dum-cooked with layered fresh spices, organic saffron water, and a crown of crispy toasted caramelized onions.`;
  }
  if (normName.includes("dal")) {
    return `Rich creamy black lentils cooked patiently for 24 hours under a glowing charcoal flame, whipped with home-churned white butter and light hickory wood smoke.`;
  }
  if (normName.includes("naan") || normName.includes("roti")) {
    return `Fresh flour dough hand-slammed against traditional tandoor embers, baked until golden puffed and glistening with butter.`;
  }
  if (normName.includes("kebab") || normName.includes("tikka")) {
    return `Succulent savory bites marinated in rich curd mustard paste, fire-singed on copper skewers to an operational smoky finish.`;
  }
  if (normName.includes("shahi") || normName.includes("mithai") || normName.includes("halwa") || normName.includes("tukda")) {
    return `A sumptuous classic sweet treat, layered in silver leaf and infused with organic pistachios, green cardamoms, and distilled honey saps.`;
  }
  return `A premium, delicious house-special dish cooked with culinary craft, fresh organic ingredients, and our head chef's custom royal spice cabinet.`;
}

// Auto-select standard luxury image based on keywords
export function getFoodImage(name: string): string {
  const normName = name.toLowerCase();
  for (const [key, value] of Object.entries(PREMIUM_FOOD_IMAGES)) {
    if (normName.includes(key)) {
      return value;
    }
  }
  return PREMIUM_FOOD_IMAGES.default;
}

// Global System default values
const DEFAULT_SYSTEM_SETTINGS = {
  adminUsername: "Maharaji741852",
  adminPassword: "Rest@951",
  adminResetCode: "951753",
  receptionAuthCode: "852",
  tagline: "Royal Taste, Royal Experience"
};

// Default coupon auto-generation settings (F6)
const DEFAULT_COUPON_SETTINGS: CouponSettings = {
  min_purchase_for_coupon: 1000,
  coupon_discount_percent: 10,
  coupon_validity_days: 30,
  coupon_min_purchase_next: 800
};

// Initial Seed Data 
const INITIAL_CATEGORIES: Category[] = [
  { id: "cat-1", name: "Royal Shuruwat", description: "Starters cooked to perfection in clay tandoors and open fire", icon_name: "Flame", sort_order: 1 },
  { id: "cat-2", name: "Maharani Curry", description: "Aromatic main course curries flavored with royal hand-ground masalas", icon_name: "UtensilsCrossed", sort_order: 2 },
  { id: "cat-3", name: "Darbari Biryani", description: "Fragrant basmati rice dum cooked with premium spices and visual saffron", icon_name: "Beef", sort_order: 3 },
  { id: "cat-4", name: "Tandoori Roti", description: "Traditional handmade Indian flatbreads baked freshly in real embers", icon_name: "Croissant", sort_order: 4 },
  { id: "cat-5", name: "Shahi Mithai", description: "Sumptuous legendary desserts from the royal kitchens of India", icon_name: "Candy", sort_order: 5 }
];

const INITIAL_MENU_ITEMS: MenuItem[] = [
  { id: "items-1", category_id: "cat-1", name: "Lalquila Paneer Tikka", description: "Succulent cottage cheese cubes marinated in traditional fire-tandoori spices & clay baked.", price: 260.00, image_url: PREMIUM_FOOD_IMAGES.tikka, is_available: true, food_type: "veg" },
  { id: "items-2", category_id: "cat-1", name: "Dahi ke Shahi Kebab", description: "Yogurt patties spiced with fresh mint crumbs and shallow fried to an elegant golden skin.", price: 240.00, image_url: PREMIUM_FOOD_IMAGES.kebab, is_available: true, food_type: "veg" },
  { id: "items-3", category_id: "cat-2", name: "Paneer Butter Masala", description: "Creamy, hand-churned butter gravy simmered slowly with cottage cheese and tomato skin purees.", price: 280.00, image_url: PREMIUM_FOOD_IMAGES.paneer, is_available: true, food_type: "veg" },
  { id: "items-4", category_id: "cat-2", name: "Dal Maharaji Dum", description: "Traditional black beans boiled overnight across smoldering coals with rich fresh sweet milks.", price: 220.00, image_url: PREMIUM_FOOD_IMAGES.dal, is_available: true, food_type: "veg" },
  { id: "items-5", category_id: "cat-3", name: "Subz Dum Biryani", description: "Fine aged basmati rice cooked on slow dum pressure steam with fresh organic herbs.", price: 320.00, image_url: PREMIUM_FOOD_IMAGES.biryani, is_available: true, food_type: "veg" },
  { id: "items-6", category_id: "cat-4", name: "Butter Naan", description: "Clay yard tandoor flatbread brushed with organic Amul dairy butter.", price: 40.00, image_url: PREMIUM_FOOD_IMAGES.naan, is_available: true, food_type: "veg" },
  { id: "items-7", category_id: "cat-4", name: "Garlic Naan", description: "Fine flatbread folded in crushed roasted lock garlic and chopped cilantro leaves.", price: 50.00, image_url: PREMIUM_FOOD_IMAGES.naan, is_available: true, food_type: "veg" },
  { id: "items-8", category_id: "cat-5", name: "Kesari Shahi Tukda", description: "Crisp pan ghee-fried bread rounds drenched with pure saffron rabri and cashew cream.", price: 160.00, image_url: PREMIUM_FOOD_IMAGES.mithai, is_available: true, food_type: "veg" }
];

const INITIAL_OFFERS: TodaysOffer[] = [
  {
    id: "offer-1",
    title: "Royal Feast Bundle Discount",
    subtitle: "Get flat 15% off on orders above ₹1500 using coupon ROYALFEAST",
    icon_svg: "crown",
    animation_style: "glow",
    is_active: true,
    valid_from: new Date().toISOString(),
    valid_to: new Date(Date.now() + 86400000 * 30).toISOString()
  }
];

const INITIAL_COUPONS: Coupon[] = [
  {
    id: "cp-1",
    code: "WELCOME100",
    linked_bill_id: null,
    min_purchase: 500,
    discount: 100,
    discount_type: "flat",
    valid_from: new Date().toISOString(),
    valid_to: new Date(Date.now() + 86400000 * 60).toISOString(),
    status: CouponStatus.ACTIVE
  },
  {
    id: "cp-2",
    code: "ROYALFEAST",
    linked_bill_id: null,
    min_purchase: 1500,
    discount: 15,
    discount_type: "percentage",
    valid_from: new Date().toISOString(),
    valid_to: new Date(Date.now() + 86400000 * 30).toISOString(),
    status: CouponStatus.ACTIVE
  }
];

// Helper to load state from Local Storage
function getLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const value = localStorage.getItem(`maharaji_${key}`);
    return value ? JSON.parse(value) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

// Helper to write state safely
function setLocalStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`maharaji_${key}`, JSON.stringify(value));
  } catch (e) {
    // Ignore quota issues
  }
}

interface AppState {
  // Config
  system: typeof DEFAULT_SYSTEM_SETTINGS;
  setTagline: (text: string) => void;
  setPOSWidth: (width: "58mm" | "80mm") => void;
  posWidth: "58mm" | "80mm";
  setAuthCode: (code: string) => void;

  // Active User session
  currentUser: User | null;
  login: (username: string, password_hash: string) => boolean;
  logout: () => void;

  // Tables State
  tables: Table[];
  unlockTable: (id: string) => void;
  lockTable: (id: string) => void;
  openTable: (id: string) => void;
  closeTable: (id: string) => void;

  // Categories CRUD
  categories: Category[];
  addCategory: (name: string, description?: string) => void;
  deleteCategory: (id: string) => void;
  reorderCategories: (reordered: Category[]) => void;

  // Menu Items CRUD
  menuItems: MenuItem[];
  addMenuItem: (name: string, category_id: string, price: number, custom_desc?: string, custom_img?: string, food_type?: "veg" | "non_veg") => void;
  editMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;

  // Realtime Orders
  orders: Order[];
  orderItems: OrderItem[];
  addOrder: (table_number: number, items: { menu_item_id: string; quantity: number; price: number }[]) => void;
  addPendingItems: (table_number: number, items: { menu_item_id: string; quantity: number; price: number }[]) => void;
  approvePendingItem: (itemId: string) => void;
  rejectPendingItem: (itemId: string) => void;
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;

  // Bills and Checkout
  bills: Bill[];
  billEditsLog: BillEditLog[];
  activeBillByTable: Record<number, Bill | null>;
  validateCoupon: (code: string, totalAmount: number, currentBillId?: string) => { valid: boolean; discountAmount: number; error?: string };
  editBillItems: (billId: string, itemChanges: { menu_item_id: string; quantity: number; price: number }[], adminCode: string) => boolean;
  editActiveOrderItems: (orderId: string, itemChanges: { menu_item_id: string; quantity: number; price: number }[], adminCode: string) => boolean;
  checkoutBill: (table_number: number, coupon_code?: string) => boolean;

  // Promotional rules
  todaysOffers: TodaysOffer[];
  saveOffer: (offer: Partial<TodaysOffer>) => void;
  deleteOffer: (id: string) => void;

  // Coupons Admin
  coupons: Coupon[];
  addCoupon: (coupon: Omit<Coupon, "id" | "status">) => void;
  deleteCoupon: (id: string) => void;
  toggleCoupon: (id: string) => void;

  // Stock tracking
  stockPurchases: StockPurchase[];
  addStockEntry: (entry: Omit<StockPurchase, "id" | "total">) => void;
  editStockEntry: (id: string, updates: Partial<Omit<StockPurchase, "id" | "total">>) => void;
  deleteStockEntry: (id: string) => void;

  // Material usage tracking (F11)
  materialUsages: MaterialUsage[];
  addMaterialUsage: (usage: Omit<MaterialUsage, "id">) => void;
  updateMaterialUsage: (id: string, updates: Partial<MaterialUsage>) => void;
  deleteMaterialUsage: (id: string) => void;
  getLowStockMaterials: () => { material: string; currentStock: number; estimatedUsage: number; totalPurchased: number; percentConsumed: number; unit: string }[];

  // Knowledge Base: per-menu-item raw recipe text (F11 — long text)
  menuRecipes: Record<string, string>;
  setMenuRecipe: (menuItemId: string, recipeText: string) => void;
  deleteMenuRecipe: (menuItemId: string) => void;

  // Supplier payments (F16)
  supplierPayments: SupplierPayment[];
  addSupplierPayment: (payment: Omit<SupplierPayment, "id" | "created_at">) => void;

  // Coupon settings (F6)
  couponSettings: CouponSettings;
  updateCouponSettings: (settings: Partial<CouponSettings>) => void;

  // Security Hard reset of whole state
  systemHardReset: (resetCode: string) => boolean;
  auditLogs: AuditLog[];
  logAudit: (action: string, details: string) => void;

  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const useStore = create<AppState>((set, get) => {
  // Sync state loaded directly from client storage
  const initialTables: Table[] = Array.from({ length: 20 }, (_, i) => ({
    id: `table_${i + 1}`,
    table_number: i + 1,
    status: TableStatus.LOCKED
  }));

  const tables = getLocalStorage<Table[]>("tables", initialTables);
  const categories = getLocalStorage<Category[]>("categories", INITIAL_CATEGORIES);
  const menuItems = getLocalStorage<MenuItem[]>("menu_items", INITIAL_MENU_ITEMS);
  const orders = getLocalStorage<Order[]>("orders", []);
  const orderItems = getLocalStorage<OrderItem[]>("order_items", []);
  const bills = getLocalStorage<Bill[]>("bills", []);
  const billEditsLog = getLocalStorage<BillEditLog[]>("bill_edits_log", []);
  const todaysOffers = getLocalStorage<TodaysOffer[]>("todays_offers", INITIAL_OFFERS);
  const coupons = getLocalStorage<Coupon[]>("coupons", INITIAL_COUPONS);
  const stockPurchases = getLocalStorage<StockPurchase[]>("stock_purchases", []);
  const auditLogs = getLocalStorage<AuditLog[]>("audit_logs", []);
  const materialUsages = getLocalStorage<MaterialUsage[]>("material_usages", []);
  const menuRecipes = getLocalStorage<Record<string, string>>("menu_recipes", {});
  const supplierPayments = getLocalStorage<SupplierPayment[]>("supplier_payments", []);
  const couponSettings = getLocalStorage<CouponSettings>("coupon_settings", DEFAULT_COUPON_SETTINGS);
  const system = getLocalStorage<typeof DEFAULT_SYSTEM_SETTINGS>("system", DEFAULT_SYSTEM_SETTINGS);
  const posWidth = getLocalStorage<"58mm" | "80mm">("posWidth", "58mm");
  const currentUser = getLocalStorage<User | null>("user", null);
  const persistedActiveTab = getLocalStorage<string>("activeTab", "live");


  const saveToStorage = (key: string, data: any) => {
    setLocalStorage(key, data);
    // Broadcast trigger for tab syncing
    window.dispatchEvent(new Event("storage"));
  };

  return {
    system,
    posWidth,
    currentUser,
    tables,
    categories,
    menuItems,
    orders,
    orderItems,
    bills,
    billEditsLog,
    todaysOffers,
    coupons,
    stockPurchases,
    materialUsages,
    menuRecipes,
    supplierPayments,
    couponSettings,
    auditLogs,
    activeBillByTable: {},
    activeTab: persistedActiveTab,
    setActiveTab: (tab) => {
      set({ activeTab: tab });
      saveToStorage("activeTab", tab);
    },


    setTagline: (text) => {
      const updatedSys = { ...get().system, tagline: text };
      set({ system: updatedSys });
      saveToStorage("system", updatedSys);
      get().logAudit("TAGLINE_CHANGED", `Tagline updated to: "${text}"`);
    },

    setPOSWidth: (width) => {
      set({ posWidth: width });
      saveToStorage("posWidth", width);
    },

    setAuthCode: (code) => {
      const updatedSys = { ...get().system, receptionAuthCode: code };
      set({ system: updatedSys });
      saveToStorage("system", updatedSys);
      get().logAudit("AUTH_CODE_CHANGED", `Admin Auth Code updated.`);
    },

    login: (username, password) => {
      const sys = get().system;
      if (username === sys.adminUsername && password === sys.adminPassword) {
        const admin: User = { id: "admin-s", username, role: UserRole.ADMIN };
        set({ currentUser: admin });
        saveToStorage("user", admin);
        get().logAudit("USER_LOGIN", `Admin logged in successfully.`);
        return true;
      }
      if (username === "reception" && password === "reception") {
        const rec: User = { id: "rec-s", username: "reception", role: UserRole.RECEPTION };
        set({ currentUser: rec });
        saveToStorage("user", rec);
        get().logAudit("USER_LOGIN", `Reception logged in successfully.`);
        return true;
      }
      return false;
    },

    logout: () => {
      const current = get().currentUser;
      get().logAudit("USER_LOGOUT", `${current?.username || "Staff"} logged out.`);
      set({ currentUser: null });
      saveToStorage("user", null);
    },

    unlockTable: (id) => {
      const tables = get().tables.map(t => t.id === id ? { ...t, status: TableStatus.OPEN, updated_at: new Date().toISOString() } : t);
      set({ tables });
      saveToStorage("tables", tables);
      get().logAudit("TABLE_OPENED", `Reception opened Table ${id.replace("table_", "")} for QR menu access.`);
    },

    lockTable: (id) => {
      const tables = get().tables.map(t => t.id === id ? { ...t, status: TableStatus.LOCKED, updated_at: new Date().toISOString() } : t);
      set({ tables });
      saveToStorage("tables", tables);
      get().logAudit("TABLE_LOCKED", `Caretaker locked Table ${id.replace("table_", "")}.`);
    },

    openTable: (id) => {
      const tables = get().tables.map(t => t.id === id ? { ...t, status: TableStatus.OPEN, updated_at: new Date().toISOString() } : t);
      set({ tables });
      saveToStorage("tables", tables);
      get().logAudit("TABLE_OPENED", `Reception opened Table ${id.replace("table_", "")} for QR menu access.`);
    },

    closeTable: (id) => {
      const tables = get().tables.map(t => t.id === id ? { ...t, status: TableStatus.LOCKED, updated_at: new Date().toISOString() } : t);
      set({ tables });
      saveToStorage("tables", tables);
      get().logAudit("TABLE_CLOSED", `Settled down. Table ${id.replace("table_", "")} is now Locked default.`);
    },

    // Categories CRUD
    addCategory: (name, description = "Delicious category") => {
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        name,
        description,
        icon_name: ["shuruwat", "starter", "fast"].some(k => name.toLowerCase().includes(k)) ? "Flame" :
                   ["curry", "subz", "korma"].some(k => name.toLowerCase().includes(k)) ? "UtensilsCrossed" :
                   ["biryani", "rice", "pulao"].some(k => name.toLowerCase().includes(k)) ? "Beef" :
                   ["bread", "naan", "roti"].some(k => name.toLowerCase().includes(k)) ? "Croissant" : "Candy",
        sort_order: get().categories.length + 1
      };
      const updated = [...get().categories, newCat];
      set({ categories: updated });
      saveToStorage("categories", updated);
      get().logAudit("CATEGORY_ADDED", `Category "${name}" created.`);
    },

    deleteCategory: (id) => {
      const updated = get().categories.filter(c => c.id !== id);
      set({ categories: updated });
      saveToStorage("categories", updated);
      get().logAudit("CATEGORY_DELETED", `Category removed.`);
    },

    reorderCategories: (reordered) => {
      set({ categories: reordered });
      saveToStorage("categories", reordered);
    },

    // Menu Items CRUD
    addMenuItem: (name, category_id, price, custom_desc, custom_img, food_type) => {
      const category = get().categories.find(c => c.id === category_id);
      const desc = custom_desc || generateDescription(name, category?.name || "Premium Dishes");
      const img = custom_img || getFoodImage(name);
      
      const newItem: MenuItem = {
        id: `menu-item-${Date.now()}`,
        category_id,
        name,
        description: desc,
        price,
        image_url: img,
        is_available: true,
        food_type: food_type || "veg"
      };
      const updated = [...get().menuItems, newItem];
      set({ menuItems: updated });
      saveToStorage("menu_items", updated);
      get().logAudit("MENU_ITEM_ADDED", `Menu Item "${name}" generated with custom description and image template.`);
    },

    editMenuItem: (id, updates) => {
      const updated = get().menuItems.map(item => item.id === id ? { ...item, ...updates } : item);
      set({ menuItems: updated });
      saveToStorage("menu_items", updated);
    },

    deleteMenuItem: (id) => {
      const updated = get().menuItems.filter(item => item.id !== id);
      set({ menuItems: updated });
      saveToStorage("menu_items", updated);
    },

    // Realtime Orders placing
    addOrder: (table_number, items) => {
      const orderId = `order-${Date.now()}`;
      const newOrder: Order = {
        id: orderId,
        table_number,
        status: "pending",
        created_at: new Date().toISOString()
      };

      const newOrderItems: OrderItem[] = items.map((it, idx) => ({
        id: `oi-${orderId}-${idx}-${Date.now()}`,
        order_id: orderId,
        menu_item_id: it.menu_item_id,
        quantity: it.quantity,
        price: it.price,
        status: OrderItemStatus.CONFIRMED,
        created_at: new Date().toISOString()
      }));

      const activeOrderList = [...get().orders, newOrder];
      const activeOrderItemList = [...get().orderItems, ...newOrderItems];

      // Update table to ACTIVE
      const updatedTables = get().tables.map(t => t.table_number === table_number ? { ...t, status: TableStatus.ACTIVE } : t);

      set({ 
        orders: activeOrderList, 
        orderItems: activeOrderItemList,
        tables: updatedTables 
      });

      saveToStorage("orders", activeOrderList);
      saveToStorage("order_items", activeOrderItemList);
      saveToStorage("tables", updatedTables);

      get().logAudit("ORDER_PLACED", `New order at Table ${table_number} worth ₹${items.reduce((s,i) => s + i.price * i.quantity, 0).toFixed(2)}.`);
    },

    // Placing supplementary items after original order - marked as PENDING APPROVAL
    addPendingItems: (table_number, items) => {
      // Find the existing active order for this table
      const activeOrder = get().orders.find(o => o.table_number === table_number && o.status !== "completed" && o.status !== "cancelled");
      
      let orderId = "";
      if (activeOrder) {
        orderId = activeOrder.id;
      } else {
        // Create an active session if someone adds items manually
        orderId = `order-${Date.now()}`;
        const newOrder: Order = {
          id: orderId,
          table_number,
          status: "pending",
          created_at: new Date().toISOString()
        };
        const updatedOrders = [...get().orders, newOrder];
        set({ orders: updatedOrders });
        saveToStorage("orders", updatedOrders);
      }

      const pendingOrderItems: OrderItem[] = items.map((it, idx) => ({
        id: `oi-pending-${orderId}-${idx}-${Date.now()}`,
        order_id: orderId,
        menu_item_id: it.menu_item_id,
        quantity: it.quantity,
        price: it.price,
        status: OrderItemStatus.PENDING_APPROVAL,
        created_at: new Date().toISOString()
      }));

      const activeOrderItemList = [...get().orderItems, ...pendingOrderItems];
      set({ orderItems: activeOrderItemList });
      saveToStorage("order_items", activeOrderItemList);

      const itemsStr = items.map(it => {
        const m = get().menuItems.find(mi => mi.id === it.menu_item_id);
        return `${it.quantity}x ${m?.name}`;
      }).join(", ");

      get().logAudit("PENDING_ITEMS_ADDED", `Supplementary items added for Table ${table_number}: ${itemsStr}.`);
    },

    approvePendingItem: (itemId) => {
      const targetItem = get().orderItems.find(oi => oi.id === itemId);
      const updated = get().orderItems.map(item => {
        if (item.id === itemId) {
          return { ...item, status: OrderItemStatus.CONFIRMED };
        }
        return item;
      });

      set({ orderItems: updated });
      saveToStorage("order_items", updated);

      if (targetItem) {
        const order = get().orders.find(o => o.id === targetItem.order_id);
        const mItem = get().menuItems.find(m => m.id === targetItem.menu_item_id);
        get().logAudit("ITEM_APPROVED", `Approved ${targetItem.quantity}x ${mItem?.name} for Table ${order?.table_number}.`);
      }
    },

    rejectPendingItem: (itemId) => {
      const targetItem = get().orderItems.find(oi => oi.id === itemId);
      const updated = get().orderItems.map(item =>
        item.id === itemId ? { ...item, status: OrderItemStatus.REJECTED } : item
      );

      set({ orderItems: updated });
      saveToStorage("order_items", updated);

      if (targetItem) {
        const order = get().orders.find(o => o.id === targetItem.order_id);
        const mItem = get().menuItems.find(m => m.id === targetItem.menu_item_id);
        get().logAudit("ITEM_REJECTED", `Rejected ${targetItem.quantity}x ${mItem?.name} for Table ${order?.table_number}.`);
      }
    },

    updateOrderStatus: (orderId, status) => {
      const order = get().orders.find(o => o.id === orderId);
      if (!order) return;
      const progression: Record<string, string> = { pending: "preparing", preparing: "cooking", cooking: "served", served: "completed" };
      const expected = progression[order.status];
      if (expected && status !== expected && status !== "cancelled") return;
      const list = get().orders.map(o => o.id === orderId ? { ...o, status } : o);
      set({ orders: list });
      saveToStorage("orders", list);
    },

    // Verify & Validate Coupon
    validateCoupon: (code, totalAmount, currentBillId) => {
      const coupon = get().coupons.find(c => c.code.toUpperCase() === code.toUpperCase());

      if (!coupon) {
        return { valid: false, discountAmount: 0, error: "Invalid coupon code." };
      }

      // Special Discount Coupon — admin-managed, flat, reusable across bills, per-bill once.
      if (coupon.is_special_discount) {
        if (coupon.is_enabled === false) {
          return { valid: false, discountAmount: 0, error: "This coupon is currently turned OFF." };
        }
        if (currentBillId && (coupon.used_bill_ids || []).includes(currentBillId)) {
          return { valid: false, discountAmount: 0, error: "This coupon has already been used for this bill." };
        }
        if ((coupon.min_purchase || 0) > 0 && totalAmount < coupon.min_purchase) {
          return { valid: false, discountAmount: 0, error: `Minimum purchase of ₹${coupon.min_purchase} required to use this coupon.` };
        }
        const flat = Math.min(coupon.discount, totalAmount);
        return { valid: true, discountAmount: flat };
      }

      if (coupon.status !== CouponStatus.ACTIVE) {
        return { valid: false, discountAmount: 0, error: `This coupon is already ${coupon.status}.` };
      }

      const now = new Date();
      if (new Date(coupon.valid_from) > now || new Date(coupon.valid_to) < now) {
        return { valid: false, discountAmount: 0, error: "This coupon is expired or not yet active." };
      }

      if (totalAmount < coupon.min_purchase) {
        return { valid: false, discountAmount: 0, error: `Minimum purchase of ₹${coupon.min_purchase} required.` };
      }

      if (currentBillId && coupon.linked_bill_id === currentBillId) {
        return { valid: false, discountAmount: 0, error: "Coupon cannot be applied to its generator bill." };
      }

      let discountAmount = 0;
      if (coupon.discount_type === "percentage") {
        discountAmount = (coupon.discount / 100) * totalAmount;
      } else {
        discountAmount = coupon.discount;
      }

      return { valid: true, discountAmount: Math.min(discountAmount, totalAmount) };
    },

    // Manual Edit Bill flow - Admin code required
    editBillItems: (billId, itemChanges, adminCode) => {
      const activeCode = get().system.receptionAuthCode; // Edit bill requires system auth code
      if (adminCode !== activeCode) {
        get().logAudit("BILL_EDIT_FAILED", `Unauthorized edit attempt on bill id ${billId} (Wrong code).`);
        return false;
      }

      // Edit is allowed! Find the bill or order items to regenerate subtotal
      const targetBill = get().bills.find(b => b.id === billId);
      if (!targetBill) return false;

      // Log the action before change
      const beforeLogs = JSON.stringify(targetBill);

      // Save changes
      const subtotal = itemChanges.reduce((sum, item) => sum + item.price * item.quantity, 0);
      let discount = targetBill.discount;
      if (targetBill.coupon_code) {
        const val = get().validateCoupon(targetBill.coupon_code, subtotal, billId);
        discount = val.valid ? val.discountAmount : 0;
      }
      const total = Math.max(0, subtotal - discount);

      const updatedBills = get().bills.map(b => b.id === billId ? {
        ...b,
        subtotal,
        discount,
        total
      } : b);

      // Create log
      const newLog: BillEditLog = {
        id: `edit-log-${Date.now()}`,
        bill_id: billId,
        user_name: get().currentUser?.username || "Receptionist",
        timestamp: new Date().toISOString(),
        action: "REDUCE_OR_INCREASE_ITEMS",
        before_json: beforeLogs,
        after_json: JSON.stringify({ subtotal, discount, total, items: itemChanges })
      };

      const updatedLogs = [...get().billEditsLog, newLog];
      set({ bills: updatedBills, billEditsLog: updatedLogs });
      saveToStorage("bills", updatedBills);
      saveToStorage("bill_edits_log", updatedLogs);

      get().logAudit("BILL_EDIT_SUCCESS", `Authorized edit applied on Bill ${targetBill.bill_number}.`);
      return true;
    },

    editActiveOrderItems: (orderId, itemChanges, adminCode) => {
      const activeCode = get().system.receptionAuthCode;
      if (adminCode !== activeCode) {
        get().logAudit("ORDER_EDIT_FAILED", `Unauthorized edit attempt on order id ${orderId} (Wrong code).`);
        return false;
      }

      const targetOrder = get().orders.find(o => o.id === orderId);
      if (!targetOrder) return false;

      // Replace confirmed order items with the edited set
      const otherItems = get().orderItems.filter(oi => oi.order_id !== orderId || oi.status !== OrderItemStatus.CONFIRMED);
      const newConfirmedItems: OrderItem[] = itemChanges.map((item, idx) => ({
        id: `oi-edited-${orderId}-${idx}-${Date.now()}`,
        order_id: orderId,
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        price: item.price,
        status: OrderItemStatus.CONFIRMED,
        created_at: new Date().toISOString()
      }));

      const finalItems = [...otherItems, ...newConfirmedItems];
      set({ orderItems: finalItems });
      saveToStorage("order_items", finalItems);

      get().logAudit("ORDER_EDIT_SUCCESS", `Authorized edit applied on Order for Table ${targetOrder.table_number}.`);
      return true;
    },

    // Receive Payment & Close Bill
    checkoutBill: (table_number, coupon_code) => {
      // Find active order for this table
      const activeOrder = get().orders.find(o => o.table_number === table_number && o.status !== "completed" && o.status !== "cancelled");
      if (!activeOrder) return false;

      // Find all confirmed items associated with this active order
      const confirmedItems = get().orderItems.filter(oi => oi.order_id === activeOrder.id && oi.status === OrderItemStatus.CONFIRMED);
      
      const subtotal = confirmedItems.reduce((acc, match) => acc + (match.price * match.quantity), 0);
      
      let discount = 0;
      let applied_code = null;
      let pendingCouponUpdate: ((billId: string) => void) | null = null;
      if (coupon_code) {
        const validation = get().validateCoupon(coupon_code, subtotal);
        if (validation.valid) {
          discount = validation.discountAmount;
          applied_code = coupon_code;

          const couponObj = get().coupons.find(c => c.code.toUpperCase() === coupon_code.toUpperCase());
          if (couponObj?.is_special_discount) {
            // Defer until billId is known — track per-bill usage, do not mark USED.
            pendingCouponUpdate = (billId: string) => {
              const updatedCoupons = get().coupons.map(c =>
                c.id === couponObj.id
                  ? { ...c, used_bill_ids: [...(c.used_bill_ids || []), billId] }
                  : c
              );
              set({ coupons: updatedCoupons });
              saveToStorage("coupons", updatedCoupons);
            };
          } else {
            // Set coupon status to USED (legacy single-use coupons)
            const updatedCoupons = get().coupons.map(c =>
              c.code.toUpperCase() === coupon_code.toUpperCase() ? { ...c, status: CouponStatus.USED } : c
            );
            set({ coupons: updatedCoupons });
            saveToStorage("coupons", updatedCoupons);
          }
        }
      }

      const finalTotal = Math.max(0, subtotal - discount);
      const billId = `bill-${Date.now()}`;
      
      // We will let postgres sequence handle the bill number in real, 
      // but locally let's generate: MK-YYYYMMDD-XXXX
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
      const dailyBills = get().bills.filter(b => b.created_at.startsWith(today.toISOString().slice(0, 10)));
      const seq = String(dailyBills.length + 1).padStart(4, "0");
      const billNumber = `MK-${dateStr}-${seq}`;

      const newClosedBill: Bill = {
        id: billId,
        order_id: activeOrder.id,
        bill_number: billNumber,
        table_number,
        subtotal,
        coupon_code: applied_code,
        discount,
        total: finalTotal,
        created_at: new Date().toISOString(),
        closed_at: new Date().toISOString()
      };

      const updatedBills = [...get().bills, newClosedBill];
      
      // Update completed orders
      const updatedOrders = get().orders.map(o => o.id === activeOrder.id ? { ...o, status: "completed" as const, updated_at: new Date().toISOString() } : o);

      const updatedOrderItems = get().orderItems.map(item =>
        item.order_id === activeOrder.id && item.status === OrderItemStatus.PENDING_APPROVAL
          ? { ...item, status: OrderItemStatus.REJECTED }
          : item
      );

      // Lock table on close
      const updatedTables = get().tables.map(t => t.table_number === table_number ? { ...t, status: TableStatus.LOCKED, updated_at: new Date().toISOString() } : t);

      // Apply deferred special-discount-coupon usage tracking now that billId exists
      if (pendingCouponUpdate) pendingCouponUpdate(billId);

      // Auto generate coupon if bill >= configured min purchase (F6)
      const couponCfg = get().couponSettings;
      let updatedCouponsList = [...get().coupons];
      if (finalTotal >= couponCfg.min_purchase_for_coupon) {
        const ran = Math.floor(1000 + Math.random() * 9000);
        const code = `ROYAL${ran}`;
        const autoCoupon: Coupon = {
          id: `cp-auto-${Date.now()}`,
          code,
          linked_bill_id: billId,
          min_purchase: couponCfg.coupon_min_purchase_next,
          discount: couponCfg.coupon_discount_percent,
          discount_type: "percentage",
          valid_from: new Date().toISOString(),
          valid_to: new Date(Date.now() + 86400000 * couponCfg.coupon_validity_days).toISOString(),
          status: CouponStatus.ACTIVE
        };
        updatedCouponsList.push(autoCoupon);
        get().logAudit("COUPON_AUTO_GENERATED", `Bill total ₹${finalTotal.toFixed(2)} >= ₹${couponCfg.min_purchase_for_coupon}. Generated coupon ${code} (${couponCfg.coupon_discount_percent}% off, valid for ${couponCfg.coupon_validity_days} days, min next purchase ₹${couponCfg.coupon_min_purchase_next}).`);
      }

      set({ 
        bills: updatedBills, 
        orders: updatedOrders,
        orderItems: updatedOrderItems,
        tables: updatedTables,
        coupons: updatedCouponsList 
      });

      saveToStorage("bills", updatedBills);
      saveToStorage("orders", updatedOrders);
      saveToStorage("order_items", updatedOrderItems);
      saveToStorage("tables", updatedTables);
      saveToStorage("coupons", updatedCouponsList);

      get().logAudit("BILL_CLOSED", `Settled payment of ₹${finalTotal.toFixed(2)} on Table ${table_number}.`);
      return true;
    },

    // Promotions
    saveOffer: (offer) => {
      let updatedList = [];
      if (offer.id) {
        updatedList = get().todaysOffers.map(o => o.id === offer.id ? { ...o, ...offer } : o as TodaysOffer);
      } else {
        const newOffer: TodaysOffer = {
          id: `offer-${Date.now()}`,
          title: offer.title || "Custom Special",
          subtitle: offer.subtitle || "",
          icon_svg: offer.icon_svg || "Flame",
          animation_style: offer.animation_style || "pulse",
          is_active: offer.is_active !== undefined ? offer.is_active : true,
          valid_from: offer.valid_from || new Date().toISOString(),
          valid_to: offer.valid_to || new Date(Date.now() + 86400000 * 7).toISOString()
        };
        updatedList = [...get().todaysOffers, newOffer];
      }
      set({ todaysOffers: updatedList });
      saveToStorage("todays_offers", updatedList);
    },

    deleteOffer: (id) => {
      const updated = get().todaysOffers.filter(o => o.id !== id);
      set({ todaysOffers: updated });
      saveToStorage("todays_offers", updated);
    },

    // Admin Coupons
    addCoupon: (coupon) => {
      const newCoupon: Coupon = {
        id: `cp-${Date.now()}`,
        ...coupon,
        status: CouponStatus.ACTIVE
      };
      const updated = [...get().coupons, newCoupon];
      set({ coupons: updated });
      saveToStorage("coupons", updated);
    },

    deleteCoupon: (id) => {
      const updated = get().coupons.filter(c => c.id !== id);
      set({ coupons: updated });
      saveToStorage("coupons", updated);
    },

    toggleCoupon: (id) => {
      const updated = get().coupons.map(c => c.id === id ? { ...c, is_enabled: !(c.is_enabled ?? true) } : c);
      set({ coupons: updated });
      saveToStorage("coupons", updated);
      const c = updated.find(x => x.id === id);
      get().logAudit("COUPON_TOGGLED", `Coupon ${c?.code} set to ${(c?.is_enabled ?? true) ? "ON" : "OFF"}.`);
    },

    // Stock
    addStockEntry: (entry) => {
      const total = entry.quantity * entry.unit_price;
      const newEntry: StockPurchase = {
        id: `stock-${Date.now()}`,
        ...entry,
        total
      };
      const updated = [newEntry, ...get().stockPurchases];
      set({ stockPurchases: updated });
      saveToStorage("stock_purchases", updated);
      get().logAudit("STOCK_ENTRY_ADDED", `Stock added: ${entry.quantity}${entry.unit} of "${entry.item_name}" valued at ₹${total.toFixed(2)}.`);
    },

    editStockEntry: (id, updates) => {
      const updated = get().stockPurchases.map(s => {
        if (s.id !== id) return s;
        const merged = { ...s, ...updates } as StockPurchase;
        merged.total = (merged.quantity || 0) * (merged.unit_price || 0);
        return merged;
      });
      set({ stockPurchases: updated });
      saveToStorage("stock_purchases", updated);
      const e = updated.find(s => s.id === id);
      get().logAudit("STOCK_ENTRY_EDITED", `Stock entry edited: "${e?.item_name}" (₹${e?.total.toFixed(2)}).`);
    },

    deleteStockEntry: (id) => {
      const target = get().stockPurchases.find(s => s.id === id);
      const updated = get().stockPurchases.filter(s => s.id !== id);
      set({ stockPurchases: updated });
      saveToStorage("stock_purchases", updated);
      if (target) get().logAudit("STOCK_ENTRY_DELETED", `Stock entry deleted: "${target.item_name}" (₹${target.total.toFixed(2)}).`);
    },

    // Material usage tracking (F11)
    addMaterialUsage: (usage) => {
      const newUsage: MaterialUsage = {
        id: `mu-${Date.now()}`,
        ...usage
      };
      const updated = [...get().materialUsages, newUsage];
      set({ materialUsages: updated });
      saveToStorage("material_usages", updated);
      get().logAudit("MATERIAL_USAGE_ADDED", `Added usage: ${usage.quantity_per_plate}${usage.unit} of "${usage.material_name}" per plate for menu item.`);
    },

    updateMaterialUsage: (id, updates) => {
      const updated = get().materialUsages.map(mu => mu.id === id ? { ...mu, ...updates } : mu);
      set({ materialUsages: updated });
      saveToStorage("material_usages", updated);
    },

    deleteMaterialUsage: (id) => {
      const updated = get().materialUsages.filter(mu => mu.id !== id);
      set({ materialUsages: updated });
      saveToStorage("material_usages", updated);
    },

    // Knowledge Base: parse a long recipe text into per-plate MaterialUsage rows
    setMenuRecipe: (menuItemId, recipeText) => {
      const recipes = { ...get().menuRecipes, [menuItemId]: recipeText };
      set({ menuRecipes: recipes });
      saveToStorage("menu_recipes", recipes);

      // Parse text -> materialUsages and REPLACE existing entries for this dish
      const parsed = parseRecipeText(recipeText);
      const others = get().materialUsages.filter(mu => mu.menu_item_id !== menuItemId);
      const fresh: MaterialUsage[] = parsed.map((p, idx) => ({
        id: `mu-${menuItemId}-${Date.now()}-${idx}`,
        menu_item_id: menuItemId,
        material_name: p.material_name,
        quantity_per_plate: p.quantity_per_plate,
        unit: p.unit,
      }));
      const merged = [...others, ...fresh];
      set({ materialUsages: merged });
      saveToStorage("material_usages", merged);
      get().logAudit("MENU_RECIPE_SAVED", `Saved knowledge base recipe for menu item ${menuItemId} (${parsed.length} ingredients parsed).`);
    },

    deleteMenuRecipe: (menuItemId) => {
      const recipes = { ...get().menuRecipes };
      delete recipes[menuItemId];
      set({ menuRecipes: recipes });
      saveToStorage("menu_recipes", recipes);
      const remaining = get().materialUsages.filter(mu => mu.menu_item_id !== menuItemId);
      set({ materialUsages: remaining });
      saveToStorage("material_usages", remaining);
      get().logAudit("MENU_RECIPE_DELETED", `Deleted knowledge base recipe for menu item ${menuItemId}.`);
    },

    getLowStockMaterials: () => {
      // Sum total purchased per material name (case-insensitive match against stock item_name)
      const purchasedByName: Record<string, { total: number; unit: string; display: string }> = {};
      get().stockPurchases.forEach(sp => {
        const key = sp.item_name.trim().toLowerCase();
        if (!purchasedByName[key]) {
          purchasedByName[key] = { total: 0, unit: sp.unit, display: sp.item_name };
        }
        purchasedByName[key].total += sp.quantity;
      });

      // Sum confirmed sold quantities per menu item
      const soldByMenuItem: Record<string, number> = {};
      get().orderItems.forEach(oi => {
        if (oi.status === OrderItemStatus.CONFIRMED) {
          soldByMenuItem[oi.menu_item_id] = (soldByMenuItem[oi.menu_item_id] || 0) + oi.quantity;
        }
      });

      // Estimated consumption per material (from Knowledge Base mappings)
      const consumedByName: Record<string, { consumed: number; unit: string }> = {};
      get().materialUsages.forEach(mu => {
        const sold = soldByMenuItem[mu.menu_item_id] || 0;
        if (sold <= 0) return;
        const key = mu.material_name.trim().toLowerCase();
        if (!consumedByName[key]) consumedByName[key] = { consumed: 0, unit: mu.unit };
        consumedByName[key].consumed += sold * mu.quantity_per_plate;
      });

      // Low-stock when consumption >= 70% of purchased
      const lowStock: { material: string; currentStock: number; estimatedUsage: number; totalPurchased: number; percentConsumed: number; unit: string }[] = [];
      Object.keys(purchasedByName).forEach(key => {
        const purchased = purchasedByName[key].total;
        const consumed = consumedByName[key]?.consumed || 0;
        if (purchased <= 0) return;
        const percent = consumed / purchased;
        if (percent >= 0.7) {
          lowStock.push({
            material: purchasedByName[key].display,
            currentStock: Math.max(0, purchased - consumed),
            estimatedUsage: consumed,
            totalPurchased: purchased,
            percentConsumed: percent,
            unit: purchasedByName[key].unit
          });
        }
      });

      return lowStock;
    },

    // Supplier payments (F16)
    addSupplierPayment: (payment) => {
      const newPayment: SupplierPayment = {
        id: `sp-${Date.now()}`,
        ...payment,
        created_at: new Date().toISOString()
      };
      const updated = [...get().supplierPayments, newPayment];
      set({ supplierPayments: updated });
      saveToStorage("supplier_payments", updated);
      get().logAudit("SUPPLIER_PAYMENT", `Payment of ₹${payment.amount} recorded for stock entry.`);
    },

    // Coupon settings (F6)
    updateCouponSettings: (settings) => {
      const updated = { ...get().couponSettings, ...settings };
      set({ couponSettings: updated });
      saveToStorage("coupon_settings", updated);
      get().logAudit("COUPON_SETTINGS_UPDATED", `Coupon auto-generation settings updated.`);
    },

    // System reset action
    systemHardReset: (resetCode) => {
      if (resetCode !== get().system.adminResetCode) {
        get().logAudit("RESET_ATTEMPT_FAILED", `Unauthorized Wipe System request (Wrong secret code: ${resetCode}).`);
        return false;
      }

      const freshLockedTables: Table[] = Array.from({ length: 20 }, (_, i) => ({
        id: `table_${i + 1}`,
        table_number: i + 1,
        status: TableStatus.LOCKED
      }));

      // F14: HARD RESET CLEARS ALL DATA - only preserve user session, system config, and MENU (categories + menu items)
      // Menu is preserved because it represents the restaurant's manually curated offerings — only manual deletion allowed.

      const preservedCategories = get().categories;
      const preservedMenuItems = get().menuItems;
      const preservedRecipes = get().menuRecipes;

      // 1. Update the in-memory state cleanly - complete wipe (except menu)
      set({
        tables: freshLockedTables,
        categories: preservedCategories,
        menuItems: preservedMenuItems,
        orders: [],
        orderItems: [],
        bills: [],
        billEditsLog: [],
        todaysOffers: INITIAL_OFFERS,
        coupons: INITIAL_COUPONS,
        stockPurchases: [],
        materialUsages: [],
        menuRecipes: preservedRecipes,
        supplierPayments: [],
        auditLogs: [], // Clear all logs too
        currentUser: get().currentUser // Keep Admin logged in!
      });

      // 2. Overwrite localStorage keys with clean state explicitly - complete wipe (except menu)
      saveToStorage("tables", freshLockedTables);
      saveToStorage("categories", preservedCategories);
      saveToStorage("menu_items", preservedMenuItems);

      saveToStorage("orders", []);
      saveToStorage("order_items", []);
      saveToStorage("bills", []);
      saveToStorage("bill_edits_log", []);
      saveToStorage("todays_offers", INITIAL_OFFERS);
      saveToStorage("coupons", INITIAL_COUPONS);
      saveToStorage("stock_purchases", []);
      saveToStorage("material_usages", []);
      saveToStorage("menu_recipes", preservedRecipes);
      saveToStorage("supplier_payments", []);
      saveToStorage("audit_logs", []); // Clear all logs
      saveToStorage("system", get().system); // Preserve active config
      saveToStorage("user", get().currentUser); // Preserve active user session

      // 3. Log success after clearing (this will be the only log)
      const successLog: AuditLog = {
        id: `audit-${Date.now()}`,
        action: "SYSTEM_HARD_RESET_SUCCESS",
        user_name: get().currentUser?.username || "Admin",
        timestamp: new Date().toISOString(),
        details: "Complete system data wipe. Fresh start."
      };
      saveToStorage("audit_logs", [successLog]);

      return true;
    },

    logAudit: (action, details) => {
      const newLog: AuditLog = {
        id: `audit-${Date.now()}`,
        action,
        user_name: get().currentUser?.username || "Guest",
        timestamp: new Date().toISOString(),
        details
      };
      const updated = [newLog, ...get().auditLogs].slice(0, 500); // Limit logs sizes
      set({ auditLogs: updated });
      saveToStorage("audit_logs", updated);
    }
  };
});
