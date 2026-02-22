import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { validateCredentials } from "@/lib/prestashop";
import type { Credentials } from "@/types/stocktake";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Credentials;
    const { shopUrl, apiKey } = body;

    if (!shopUrl || !apiKey) {
      return NextResponse.json(
        { error: "Shop URL and API key are required" },
        { status: 400 }
      );
    }

    await validateCredentials({ shopUrl, apiKey });

    const session = await getSession();
    session.credentials = { shopUrl, apiKey };
    await session.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Validation failed";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
