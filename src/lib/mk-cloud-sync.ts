import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useStore } from "@/lib/mk-store";

const SHARED_KEYS = [
  "tables",
  "categories",
  "menuItems",
  "orders",
  "orderItems",
  "bills",
  "billEditsLog",
  "todaysOffers",
  "coupons",
  "stockPurchases",
  "materialUsages",
  "supplierPayments",
  "couponSettings",
  "system",
  "posWidth",
  "auditLogs",
] as const;

const STORAGE_KEY_BY_STATE_KEY: Record<(typeof SHARED_KEYS)[number], string> = {
  tables: "tables",
  categories: "categories",
  menuItems: "menu_items",
  orders: "orders",
  orderItems: "order_items",
  bills: "bills",
  billEditsLog: "bill_edits_log",
  todaysOffers: "todays_offers",
  coupons: "coupons",
  stockPurchases: "stock_purchases",
  materialUsages: "material_usages",
  supplierPayments: "supplier_payments",
  couponSettings: "coupon_settings",
  system: "system",
  posWidth: "posWidth",
  auditLogs: "audit_logs",
};

type SharedData = Partial<Pick<ReturnType<typeof useStore.getState>, (typeof SHARED_KEYS)[number]>>;

const getSharedSnapshot = (state: ReturnType<typeof useStore.getState>): SharedData => {
  const snapshot: SharedData = {};
  SHARED_KEYS.forEach((key) => {
    snapshot[key] = state[key] as never;
  });
  return snapshot;
};

const persistSharedDataLocally = (data: SharedData) => {
  if (typeof window === "undefined") return;
  SHARED_KEYS.forEach((key) => {
    if (data[key] !== undefined) {
      localStorage.setItem(`maharaji_${STORAGE_KEY_BY_STATE_KEY[key]}`, JSON.stringify(data[key]));
    }
  });
};

const applySharedData = (data: unknown) => {
  if (!data || typeof data !== "object") return;
  const remote = data as SharedData;
  const partial: SharedData = {};
  SHARED_KEYS.forEach((key) => {
    if (remote[key] !== undefined) {
      partial[key] = remote[key] as never;
    }
  });
  if (Object.keys(partial).length === 0) return;
  useStore.setState(partial);
  persistSharedDataLocally(partial);
};

const saveSharedState = async (data: SharedData) => {
  await (supabase as any)
    .from("mk_shared_state")
    .upsert({ id: "main", data }, { onConflict: "id" });
};

export function useMaharajiCloudSync() {
  const [isReady, setIsReady] = useState(false);
  const applyingRemoteRef = useRef(false);
  const lastSerializedRef = useRef("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    const initialize = async () => {
      const { data } = await (supabase as any)
        .from("mk_shared_state")
        .select("data")
        .eq("id", "main")
        .maybeSingle();

      if (cancelled) return;

      if (data?.data && Object.keys(data.data).length > 0) {
        applyingRemoteRef.current = true;
        applySharedData(data.data);
        lastSerializedRef.current = JSON.stringify(getSharedSnapshot(useStore.getState()));
        queueMicrotask(() => {
          applyingRemoteRef.current = false;
        });
      } else {
        const snapshot = getSharedSnapshot(useStore.getState());
        lastSerializedRef.current = JSON.stringify(snapshot);
        await saveSharedState(snapshot);
      }

      if (!cancelled) setIsReady(true);
    };

    initialize();

    const channel = supabase
      .channel("mk-shared-state-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mk_shared_state", filter: "id=eq.main" },
        (payload: any) => {
          const nextData = payload.new?.data;
          if (!nextData) return;
          const serialized = JSON.stringify(nextData);
          if (serialized === lastSerializedRef.current) return;
          applyingRemoteRef.current = true;
          applySharedData(nextData);
          lastSerializedRef.current = JSON.stringify(getSharedSnapshot(useStore.getState()));
          queueMicrotask(() => {
            applyingRemoteRef.current = false;
          });
        },
      )
      .subscribe();

    const unsubscribe = useStore.subscribe((state) => {
      if (applyingRemoteRef.current) return;
      const snapshot = getSharedSnapshot(state);
      const serialized = JSON.stringify(snapshot);
      if (serialized === lastSerializedRef.current) return;
      lastSerializedRef.current = serialized;

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        saveSharedState(snapshot);
      }, 250);
    });

    return () => {
      cancelled = true;
      unsubscribe();
      if (debounceRef.current) clearTimeout(debounceRef.current);
      supabase.removeChannel(channel);
    };
  }, []);

  return isReady;
}