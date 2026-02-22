import type { BarcodeType, BarcodeInfo } from "@/types/prestashop";

export function detectBarcodeType(code: string): BarcodeType {
  const cleaned = code.trim();

  if (!/^\d+$/.test(cleaned)) {
    return "UNKNOWN";
  }

  switch (cleaned.length) {
    case 13:
      return "EAN-13";
    case 12:
      return "UPC-A";
    case 8:
      return "EAN-8";
    default:
      return "UNKNOWN";
  }
}

export function parseBarcodeInfo(code: string): BarcodeInfo {
  const cleaned = code.trim();
  const type = detectBarcodeType(cleaned);
  return {
    code: cleaned,
    type,
    isValid: type !== "UNKNOWN",
  };
}
