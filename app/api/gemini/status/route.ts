import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { auth } from "@/auth";
import { isLocalPlainStorageMode } from "@/lib/storage-mode";
import { isGeminiConfigured } from "@/lib/gemini-config";

function requireUserId(session: Session | null): string | null {
  if (isLocalPlainStorageMode()) return "local-user";
  return session?.user?.email ?? null;
}

export async function GET() {
  const session = (await auth()) as Session | null;
  if (!requireUserId(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ configured: isGeminiConfigured() });
}
