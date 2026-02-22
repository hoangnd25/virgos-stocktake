import type { Metadata } from "next";
import { Provider } from "@/components/ui/provider";

export const metadata: Metadata = {
  title: "Virgos Stocktake",
  description: "Stocktake management application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning is needed because Chakra UI's color mode detection
    // modifies the html element's attributes on the client, which would otherwise
    // cause a React hydration mismatch warning.
    <html lang="en" suppressHydrationWarning>
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
