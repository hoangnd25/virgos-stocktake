import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

function getShopBase(shopUrl: string): string {
  let base = shopUrl.trim();
  // Ensure protocol
  if (!base.match(/^https?:\/\//i)) {
    base = `https://${base}`;
  }
  // Strip /api suffix and trailing slash
  base = base.replace(/\/api\/?$/, "").replace(/\/$/, "");
  // Force HTTPS
  base = base.replace(/^http:\/\//i, "https://");
  return base;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageId = searchParams.get("id");

  if (!imageId || !/^\d+$/.test(imageId)) {
    return new NextResponse("Invalid image ID", { status: 400 });
  }

  const session = await getSession();
  if (!session.credentials?.shopUrl) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const base = getShopBase(session.credentials.shopUrl);
  const digits = imageId.split("").join("/");
  const imageUrl = `${base}/img/p/${digits}/${imageId}.jpg`;

  try {
    const response = await fetch(imageUrl, {
      headers: { "User-Agent": "VirgoStocktake/1.0" },
    });

    if (!response.ok) {
      return new NextResponse("Image not found", { status: response.status });
    }

    const contentType = response.headers.get("content-type") ?? "image/jpeg";
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("Failed to fetch image", { status: 502 });
  }
}
