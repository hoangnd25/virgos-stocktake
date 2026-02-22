import type { BarcodeType } from "@/types/prestashop";

export interface ScannedItem {
  id: string;
  barcode: string;
  barcodeType: BarcodeType;
  productId: number;
  combinationId: number | null;
  productName: string;
  reference: string;
  imageUrl: string | null;
  quantityAdded: number;
  previousStock: number;
  newStock: number;
  lastScannedAt: string;
}

export interface StocktakeSession {
  items: ScannedItem[];
  startedAt: string;
  totalScans: number;
}

export interface Credentials {
  shopUrl: string;
  apiKey: string;
}
