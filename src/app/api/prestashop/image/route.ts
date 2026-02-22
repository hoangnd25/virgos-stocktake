import { NextRequest, NextResponse } from "next/server";
import { getCredentials } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    const credentials = await getCredentials();
    if (!credentials) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get("url");

    if (!imageUrl) {
      return NextResponse.json({ error: "url param is required" }, { status: 400 });
    }

    // Only proxy URLs from the configured shop to prevent SSRF
    const { shopUrl } = credentials;
    const normalizedShop = shopUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");
    if (!imageUrl.startsWith(normalizedShop)) {
      return NextResponse.json({ error: "URL not allowed" }, { status: 403 });
    }

    const authHeader = Buffer.from(`${credentials.apiKey}:`).toString("base64");
    const upstreamResponse = await fetch(imageUrl, {
      headers: { Authorization: `Basic ${authHeader}` },
    });

    if (!upstreamResponse.ok) {
      return NextResponse.json(
        { error: "Image fetch failed", status: upstreamResponse.status },
        { status: upstreamResponse.status }
      );
    }

    const contentType = upstreamResponse.headers.get("content-type") ?? "image/jpeg";
    const buffer = await upstreamResponse.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Image proxy failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
