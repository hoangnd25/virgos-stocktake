import { redirect } from "next/navigation";
import { getCredentials } from "@/lib/session";
import { StocktakeClient } from "@/components/StocktakeClient";

export default async function StocktakePage() {
  const credentials = await getCredentials();

  if (!credentials) {
    redirect("/");
  }

  return <StocktakeClient shopUrl={credentials.shopUrl} />;
}
