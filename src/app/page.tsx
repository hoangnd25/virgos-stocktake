import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCredentials } from "@/lib/session";
import { LoginForm } from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "PrestaShop Stocktake — Login",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ shop_url?: string }>;
}) {
  const credentials = await getCredentials();
  if (credentials) {
    redirect("/stocktake");
  }

  const { shop_url } = await searchParams;

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#f9fafb",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "72px",
            height: "72px",
            backgroundColor: "#2563eb",
            borderRadius: "20px",
            marginBottom: "16px",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="white"
          >
            <path d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h12v2H3v-2zm0 4h12v2H3v-2zm14-1l4 4-4 4v-3h-4v-2h4v-3z" />
          </svg>
        </div>
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "bold",
            color: "#111827",
            margin: "0 0 8px",
          }}
        >
          PrestaShop Stocktake
        </h1>
        <p style={{ fontSize: "16px", color: "#6b7280", margin: 0 }}>
          Connect to your shop to begin stocktaking
        </p>
      </div>

      <LoginForm initialShopUrl={shop_url} />

      <p
        style={{
          marginTop: "32px",
          fontSize: "13px",
          color: "#9ca3af",
        }}
      >
        Powered by PrestaShop API
      </p>
    </main>
  );
}
