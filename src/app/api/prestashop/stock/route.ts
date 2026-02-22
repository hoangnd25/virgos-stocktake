import { NextRequest, NextResponse } from "next/server";
import { getCredentials } from "@/lib/session";
import { getStockAvailable, updateStock } from "@/lib/prestashop";

export async function PATCH(request: NextRequest) {
  try {
    const credentials = await getCredentials();
    if (!credentials) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json() as {
      productId: number;
      combinationId: number | null;
    };

    const { productId, combinationId } = body;

    if (productId === undefined) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    const stock = await getStockAvailable(credentials, productId, combinationId);
    const previousQuantity = Number(stock.quantity);
    const newQuantity = previousQuantity + 1;

    await updateStock(credentials, stock, newQuantity);

    return NextResponse.json({
      stockId: stock.id,
      previousStock: previousQuantity,
      newStock: newQuantity,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Stock update failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
