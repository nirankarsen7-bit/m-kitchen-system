import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Toaster } from "sonner";
import { useStore } from "@/lib/mk-store";
import { CustomerInterface } from "@/components/mkitchen/CustomerInterface";
import { LoginScreen } from "@/components/mkitchen/LoginScreen";
import { WelcomeScreen } from "@/components/mkitchen/WelcomeScreen";
import { StaffShell } from "@/components/mkitchen/StaffShell";
import { UnifiedRoleNavigator } from "@/components/mkitchen/UnifiedRoleNavigator";
import { DashboardLive } from "@/components/mkitchen/DashboardLive";
import { DashboardTables } from "@/components/mkitchen/DashboardTables";
import { DashboardActiveOrders } from "@/components/mkitchen/DashboardActiveOrders";
import { DashboardMenu } from "@/components/mkitchen/DashboardMenu";
import { DashboardOffers } from "@/components/mkitchen/DashboardOffers";
import { DashboardStock } from "@/components/mkitchen/DashboardStock";
import { DashboardBills } from "@/components/mkitchen/DashboardBills";
import { DashboardReports } from "@/components/mkitchen/DashboardReports";
import { DashboardQRCodes } from "@/components/mkitchen/DashboardQRCodes";
import { DashboardSettings } from "@/components/mkitchen/DashboardSettings";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Maharaji Kitchen — Royal Taste, Royal Experience" },
      {
        name: "description",
        content:
          "Luxury QR-code-based Restaurant Management System with Customer, Reception, and Admin interfaces, live tracking, and digital kitchen operations.",
      },
      { property: "og:title", content: "Maharaji Kitchen" },
      {
        property: "og:description",
        content: "Royal Taste, Royal Experience — Restaurant Management System.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <ClientOnly fallback={<LoadingScreen />}>
      <AppShell />
    </ClientOnly>
  );
}

function LoadingScreen() {
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{
        backgroundColor: "#FAF7F2",
        color: "#7B1E2B",
        fontFamily: "Playfair Display, serif",
      }}
    >
      <div className="text-center">
        <div className="text-3xl font-bold">Maharaji Kitchen</div>
        <div className="mt-2 text-sm opacity-70">Loading…</div>
      </div>
    </div>
  );
}

function AppShell() {
  const currentUser = useStore((s) => s.currentUser);
  const isAuthenticated = !!currentUser;
  const activeTab = useStore((s) => s.activeTab);
  const setActiveTab = useStore((s) => s.setActiveTab);

  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [currentSearch, setCurrentSearch] = useState(window.location.search);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
      setCurrentSearch(window.location.search);
    };
    window.addEventListener("popstate", handleLocationChange);
    return () => {
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, []);


  const toasterEl = (
    <Toaster
      richColors
      closeButton
      position="top-right"
      toastOptions={{
        style: {
          borderLeft: "4px solid #D4AF37",
          background: "#FAF7F2",
          fontFamily: "Inter, sans-serif",
        },
      }}
    />
  );

  const params = new URLSearchParams(currentSearch);
  const tableParam = params.get("table");
  const isCustomerPortal = tableParam !== null || currentPath.includes("/menu");

  if (isCustomerPortal) {
    const tableNum = tableParam ? parseInt(tableParam, 10) : 1;
    return (
      <>
        <CustomerInterface currentTableNum={tableNum} />
        {toasterEl}
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <LoginScreen />
        <UnifiedRoleNavigator />
        {toasterEl}
      </>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "live":
        return <DashboardLive />;
      case "tables":
        return <DashboardTables />;
      case "checkout":
        return <DashboardActiveOrders />;
      case "menu":
        return <DashboardMenu />;
      case "offers":
        return <DashboardOffers />;
      case "stock":
        return <DashboardStock />;
      case "archive":
        return <DashboardBills />;
      case "stats":
        return <DashboardReports />;
      case "qr":
        return <DashboardQRCodes />;
      case "config":
        return <DashboardSettings />;
      default:
        return <DashboardLive />;
    }
  };

  return (
    <>
      <StaffShell activeTab={activeTab} setActiveTab={setActiveTab}>
        {renderTabContent()}
      </StaffShell>
      <UnifiedRoleNavigator />
      {toasterEl}
    </>
  );
}
