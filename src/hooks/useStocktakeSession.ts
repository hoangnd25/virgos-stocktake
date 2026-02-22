"use client";

import { useState, useCallback, useEffect } from "react";
import type { ScannedItem } from "@/types/stocktake";

const SESSION_KEY = "stocktake_session";

interface UseStocktakeSessionReturn {
  items: ScannedItem[];
  totalScans: number;
  lastItem: ScannedItem | null;
  addScan: (item: Omit<ScannedItem, "id" | "quantityAdded" | "lastScannedAt">) => void;
  clearSession: () => void;
}

export function useStocktakeSession(): UseStocktakeSessionReturn {
  const [items, setItems] = useState<ScannedItem[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const stored = sessionStorage.getItem(SESSION_KEY);
        if (stored) {
          setItems(JSON.parse(stored) as ScannedItem[]);
        }
      } catch {
        // ignore
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const persist = (nextItems: ScannedItem[]) => {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(nextItems));
    } catch {
      // ignore
    }
  };

  const addScan = useCallback(
    (item: Omit<ScannedItem, "id" | "quantityAdded" | "lastScannedAt">) => {
      setItems((prev) => {
        const existingIndex = prev.findIndex(
          (i) =>
            i.productId === item.productId &&
            i.combinationId === item.combinationId
        );

        let next: ScannedItem[];

        if (existingIndex >= 0) {
          next = prev.map((i, idx) =>
            idx === existingIndex
              ? {
                  ...i,
                  quantityAdded: i.quantityAdded + 1,
                  newStock: item.newStock,
                  lastScannedAt: new Date().toISOString(),
                }
              : i
          );
        } else {
          const newItem: ScannedItem = {
            ...item,
            id: `${item.productId}-${item.combinationId ?? 0}-${Date.now()}`,
            quantityAdded: 1,
            lastScannedAt: new Date().toISOString(),
          };
          next = [newItem, ...prev];
        }

        persist(next);
        return next;
      });
    },
    []
  );

  const clearSession = useCallback(() => {
    setItems([]);
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
  }, []);

  const totalScans = items.reduce((acc, item) => acc + item.quantityAdded, 0);
  const lastItem = items.length > 0 ? items[0] : null;

  return { items, totalScans, lastItem, addScan, clearSession };
}
