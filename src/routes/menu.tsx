import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { CustomerInterface } from "@/components/mkitchen/CustomerInterface";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Maharaji Kitchen — Royal Menu" },
      {
        name: "description",
        content:
          "Browse Maharaji Kitchen's royal menu, place orders and enjoy a premium dining experience — Nagrakata.",
      },
      { property: "og:title", content: "Maharaji Kitchen — Royal Menu" },
    ],
  }),
  component: MenuRoute,
});

function MenuFallback() {
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ backgroundColor: "#FAF7F2", color: "#7B1E2B", fontFamily: "Playfair Display, serif" }}
    >
      <div className="text-center">
        <div className="text-3xl font-bold">Maharaji Kitchen</div>
        <div className="mt-2 text-sm opacity-70">Opening royal menu…</div>
      </div>
    </div>
  );
}

function MenuRoute() {
  return (
    <ClientOnly fallback={<MenuFallback />}>
      <MenuClient />
    </ClientOnly>
  );
}

function MenuClient() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("table");
  const tableNum = raw ? parseInt(raw, 10) : 1;
  return (
    <>
      <CustomerInterface currentTableNum={tableNum} />
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
    </>
  );
}
