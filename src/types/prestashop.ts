export type BarcodeType = "EAN-13" | "UPC-A" | "EAN-8" | "UNKNOWN";

export interface BarcodeInfo {
  code: string;
  type: BarcodeType;
  isValid: boolean;
}

export interface PrestashopProduct {
  id: number;
  name:
    | string
    | { id: string; value: string }[]
    | { language: { "#text": string; "@id": string } | { "#text": string; "@id": string }[] };
  reference: string;
  ean13: string;
  upc: string;
  id_default_image: number | null;
}

export interface PrestashopCombination {
  id: number;
  id_product: number;
  reference: string;
  ean13: string;
  upc: string;
  id_default_image: number | null;
}

export interface PrestashopStockAvailable {
  id: number;
  id_product: number | string;
  id_product_attribute: number | string;
  id_shop: number | string;
  id_shop_group: number | string;
  quantity: number | string;
  depends_on_stock: number | string;
  out_of_stock: number | string;
  location: string;
}

export interface ProductMatch {
  type: "product" | "combination";
  productId: number;
  combinationId: number | null;
  name: string;
  reference: string;
  barcode: string;
  barcodeType: BarcodeType;
  imageUrl: string | null;
}

export interface PrestashopApiError {
  code: number;
  message: string;
}
