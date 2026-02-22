import { getIronSession, type IronSession } from "iron-session";
import { cookies } from "next/headers";
import type { Credentials } from "@/types/stocktake";

// Hardcoded session secret — 32+ chars, randomly generated
const SESSION_SECRET = "vst_k9mXpQ2rL8nYwZ4jH6cFbT3sDqU7eA";
const SESSION_COOKIE = "stocktake_session";

export interface SessionData {
  credentials?: Credentials;
}

const sessionOptions = {
  password: SESSION_SECRET,
  cookieName: SESSION_COOKIE,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24, // 24 hours
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function getCredentials(): Promise<Credentials | null> {
  const session = await getSession();
  return session.credentials ?? null;
}
