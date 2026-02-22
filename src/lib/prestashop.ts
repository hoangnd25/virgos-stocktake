import type {
  PrestashopProduct,
  PrestashopCombination,
  PrestashopStockAvailable,
  ProductMatch,
  BarcodeType,
} from "@/types/prestashop";
import type { Credentials } from "@/types/stocktake";

function getAuthHeader(apiKey: string): string {
  return "Basic " + Buffer.from(apiKey + ":").toString("base64");
}

function normalizeUrl(url: string): string {
  const base = url.replace(/\/$/, "");
  if (/\/api(\/.*)?$/.test(base)) {
    return base.replace(/\/api(\/.*)?$/, "/api");
  }
  return `${base}/api`;
}

function getShopBase(shopUrl: string): string {
  return shopUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");
}

// PrestaShop public image URL — no auth required
// Image ID 1305 → /img/p/1/3/0/5/1305.jpg
function buildImageUrl(shopUrl: string, imageId: number | string | null): string | null {
  if (!imageId) return null;
  const base = getShopBase(shopUrl);
  const digits = String(imageId).split("").join("/");
  return `${base}/img/p/${digits}/${imageId}.jpg`;
}

function extractProductName(product: PrestashopProduct): string {
  const name = product.name;
  if (typeof name === "string") return name;
  if (Array.isArray(name)) {
    const found = (name as { id: string; value: string }[]).find((n) => n.value);
    return found?.value ?? String(product.id);
  }
  if (typeof name === "object" && name !== null) {
    const lang = (
      name as {
        language:
          | { "#text": string; "@id": string }
          | { "#text": string; "@id": string }[];
      }
    ).language;
    if (Array.isArray(lang)) {
      return lang[0]?.["#text"] ?? String(product.id);
    }
    return (lang as { "#text": string })["#text"] ?? String(product.id);
  }
  return String(product.id);
}

export async function validateCredentials(credentials: Credentials): Promise<void> {
  const { shopUrl, apiKey } = credentials;
  const baseUrl = normalizeUrl(shopUrl);

  const response = await fetch(`${baseUrl}/?output_format=JSON`, {
    headers: { Authorization: getAuthHeader(apiKey) },
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error("Invalid API key or shop URL");
  }
}

export async function searchByBarcode(
  credentials: Credentials,
  barcode: string,
  barcodeType: BarcodeType
): Promise<ProductMatch[]> {
  const { shopUrl, apiKey } = credentials;
  const baseUrl = normalizeUrl(shopUrl);
  const authHeader = getAuthHeader(apiKey);

  const filterField = barcodeType === "UPC-A" ? "upc" : "ean13";

  const [productsResponse, combinationsResponse] = await Promise.all([
    fetch(
      `${baseUrl}/products?filter[${filterField}]=${barcode}&display=full&output_format=JSON`,
      { headers: { Authorization: authHeader } }
    ),
    fetch(
      `${baseUrl}/combinations?filter[${filterField}]=${barcode}&display=full&output_format=JSON`,
      { headers: { Authorization: authHeader } }
    ),
  ]);

  const matches: ProductMatch[] = [];

  if (productsResponse.status !== 401 && productsResponse.status !== 403) {
    let productsData: { products?: PrestashopProduct[] } | null = null;
    try {
      productsData = await productsResponse.json() as { products?: PrestashopProduct[] };
    } catch (e) {
      console.warn("Failed to parse products response", e);
    }
    if (productsData?.products) {
      for (const product of productsData.products) {
        matches.push({
          type: "product",
          productId: product.id,
          combinationId: null,
          name: extractProductName(product),
          reference: product.reference ?? "",
          barcode,
          barcodeType,
          imageUrl: buildImageUrl(shopUrl, product.id_default_image),
        });
      }
    }
  }

  if (combinationsResponse.status !== 401 && combinationsResponse.status !== 403) {
    let combinationsData: { combinations?: PrestashopCombination[] } | null = null;
    try {
      combinationsData = await combinationsResponse.json() as { combinations?: PrestashopCombination[] };
    } catch (e) {
      console.warn("Failed to parse combinations response", e);
    }
    if (combinationsData?.combinations) {
      const productIds = [...new Set(combinationsData.combinations.map((c) => c.id_product))];
      const parentProducts = new Map<number, PrestashopProduct>();

      await Promise.all(
        productIds.map(async (pid) => {
          try {
            const res = await fetch(
              `${baseUrl}/products/${pid}?output_format=JSON`,
              { headers: { Authorization: authHeader } }
            );
            if (res.status !== 401 && res.status !== 403) {
              const pData = await res.json() as { product: PrestashopProduct };
              if (pData.product) parentProducts.set(pid, pData.product);
            }
          } catch (e) {
            console.warn("Failed to fetch parent product", pid, e);
          }
        })
      );

      for (const combination of combinationsData.combinations) {
        const parent = parentProducts.get(combination.id_product);
        const baseName = parent
          ? extractProductName(parent)
          : `Product #${combination.id_product}`;
        const variantLabel = combination.reference
          ? combination.reference
          : `Variant #${combination.id}`;
        const name = `${baseName} — ${variantLabel}`;

        const imageId = combination.id_default_image ?? parent?.id_default_image ?? null;
        const imageUrl = buildImageUrl(shopUrl, imageId);

        matches.push({
          type: "combination",
          productId: combination.id_product,
          combinationId: combination.id,
          name,
          reference: combination.reference ?? "",
          barcode,
          barcodeType,
          imageUrl,
        });
      }
    }
  }

  return matches;
}

export async function getStockAvailable(
  credentials: Credentials,
  productId: number,
  combinationId: number | null
): Promise<PrestashopStockAvailable> {
  const { shopUrl, apiKey } = credentials;
  const baseUrl = normalizeUrl(shopUrl);
  const authHeader = getAuthHeader(apiKey);

  const attributeId = combinationId ?? 0;
  const listUrl = `${baseUrl}/stock_availables?filter[id_product]=${productId}&filter[id_product_attribute]=${attributeId}&output_format=JSON`;

  const listResponse = await fetch(listUrl, { headers: { Authorization: authHeader } });

  if (listResponse.status === 401 || listResponse.status === 403) {
    throw new Error("Unauthorized: check your API key");
  }

  const listData = await listResponse.json() as { stock_availables?: { id: number }[] };

  if (!listData.stock_availables || listData.stock_availables.length === 0) {
    throw new Error("No stock record found for this product");
  }

  const stockId = listData.stock_availables[0].id;
  const detailUrl = `${baseUrl}/stock_availables/${stockId}?output_format=JSON`;

  const detailResponse = await fetch(detailUrl, { headers: { Authorization: authHeader } });

  if (detailResponse.status === 401 || detailResponse.status === 403) {
    throw new Error("Unauthorized: check your API key");
  }

  const detailData = await detailResponse.json() as { stock_available: PrestashopStockAvailable };
  return detailData.stock_available;
}

export async function updateStock(
  credentials: Credentials,
  stock: PrestashopStockAvailable,
  newQuantity: number
): Promise<void> {
  const { shopUrl, apiKey } = credentials;
  const baseUrl = normalizeUrl(shopUrl);
  const authHeader = getAuthHeader(apiKey);

  const xmlBody = `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <stock_available>
    <id>${stock.id}</id>
    <id_product>${stock.id_product}</id_product>
    <id_product_attribute>${stock.id_product_attribute}</id_product_attribute>
    <id_shop>${stock.id_shop}</id_shop>
    <id_shop_group>${stock.id_shop_group}</id_shop_group>
    <quantity>${newQuantity}</quantity>
    <depends_on_stock>${stock.depends_on_stock}</depends_on_stock>
    <out_of_stock>${stock.out_of_stock}</out_of_stock>
    <location>${stock.location}</location>
  </stock_available>
</prestashop>`;

  const response = await fetch(`${baseUrl}/stock_availables/${stock.id}`, {
    method: "PUT",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/xml",
    },
    body: xmlBody,
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error("Unauthorized: check your API key");
  }
  // PrestaShop returns 500 with PHP warnings even on success — treat non-auth errors as ok
}
