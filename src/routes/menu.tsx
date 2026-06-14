import { createFileRoute } from "@tanstack/react-router";
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

function MenuRoute() {
  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
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
