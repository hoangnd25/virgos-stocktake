import { NextRequest, NextResponse } from "next/server";
import { getCredentials } from "@/lib/session";
import { searchByBarcode } from "@/lib/prestashop";
import { parseBarcodeInfo } from "@/lib/barcode";

export async function GET(request: NextRequest) {
  try {
    const credentials = await getCredentials();
    if (!credentials) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const barcode = searchParams.get("barcode");

    if (!barcode) {
      return NextResponse.json({ error: "barcode is required" }, { status: 400 });
    }

    const barcodeInfo = parseBarcodeInfo(barcode);
    const matches = await searchByBarcode(credentials, barcodeInfo.code, barcodeInfo.type);

    return NextResponse.json({ matches, barcodeInfo });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
