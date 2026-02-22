"use client";

import { useState, useCallback } from "react";
import { Box, Container, VStack } from "@chakra-ui/react";
import { Header } from "@/components/Header";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { LastScannedCard } from "@/components/LastScannedCard";
import { ProductSelectDialog } from "@/components/ProductSelectDialog";
import { SessionSummary } from "@/components/SessionSummary";
import { Toaster, toaster } from "@/components/ui/toaster";
import { useStocktakeSession } from "@/hooks/useStocktakeSession";
import type { ProductMatch } from "@/types/prestashop";

interface StocktakeClientProps {
  shopUrl: string;
}

export function StocktakeClient({ shopUrl }: StocktakeClientProps) {
  const { items, lastItem, addScan, clearSession } = useStocktakeSession();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [pendingProducts, setPendingProducts] = useState<ProductMatch[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleStockUpdate = useCallback(
    async (product: ProductMatch) => {
      setIsUpdating(true);
      try {
        const res = await fetch("/api/prestashop/stock", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: product.productId,
            combinationId: product.combinationId,
          }),
        });

        const data = await res.json() as {
          previousStock?: number;
          newStock?: number;
          error?: string;
        };

        if (!res.ok) {
          throw new Error(data.error ?? "Failed to update stock");
        }

        addScan({
          barcode: product.barcode,
          barcodeType: product.barcodeType,
          productId: product.productId,
          combinationId: product.combinationId,
          productName: product.name,
          reference: product.reference,
          imageUrl: product.imageUrl,
          previousStock: data.previousStock ?? 0,
          newStock: data.newStock ?? 0,
        });

        toaster.create({
          title: "Stock updated",
          description: `${product.name} → ${String(data.newStock)}`,
          type: "success",
          closable: true,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Stock update failed";
        toaster.create({
          title: "Stock update failed",
          description: msg,
          type: "error",
          closable: true,
        });
      } finally {
        setIsUpdating(false);
      }
    },
    [addScan]
  );

  const handleScan = useCallback(
    async (barcode: string) => {
      setScanError(null);
      setIsProcessing(true);

      try {
        const params = new URLSearchParams({ barcode });
        const res = await fetch(`/api/prestashop/search?${params.toString()}`);
        const data = await res.json() as {
          matches?: ProductMatch[];
          error?: string;
        };

        if (!res.ok) {
          throw new Error(data.error ?? "Search failed");
        }

        const matches = data.matches ?? [];

        if (matches.length === 0) {
          setScanError(`No product found with barcode ${barcode}`);
          return;
        }

        if (matches.length === 1) {
          await handleStockUpdate(matches[0]);
          return;
        }

        setPendingProducts(matches);
        setDialogOpen(true);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Search failed";
        setScanError(msg);
      } finally {
        setIsProcessing(false);
      }
    },
    [handleStockUpdate]
  );

  const handleProductSelect = useCallback(
    async (product: ProductMatch) => {
      setDialogOpen(false);
      setPendingProducts([]);
      await handleStockUpdate(product);
    },
    [handleStockUpdate]
  );

  const handleDialogCancel = useCallback(() => {
    setDialogOpen(false);
    setPendingProducts([]);
  }, []);

  return (
    <Box minH="100vh" bg="gray.50" _dark={{ bg: "gray.900" }}>
      <Header shopUrl={shopUrl} />

      <Container maxW="800px" py={6} px={4}>
        <VStack gap={5} align="stretch">
          <BarcodeScanner
            onScan={handleScan}
            isProcessing={isProcessing || isUpdating}
            error={scanError}
          />

          <LastScannedCard item={lastItem} isUpdating={isUpdating} />

          <SessionSummary items={items} onClear={clearSession} />
        </VStack>
      </Container>

      <ProductSelectDialog
        isOpen={dialogOpen}
        products={pendingProducts}
        onSelect={handleProductSelect}
        onCancel={handleDialogCancel}
      />

      <Toaster />
    </Box>
  );
}
