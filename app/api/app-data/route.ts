import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { auth } from "@/auth";
import { fetchAppDataRow, hasAppDataRow, saveAppDataRow } from "@/lib/app-data-db";
import { normalizeAppData } from "@/lib/storage";
import type { AppData } from "@/lib/types";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function requireUserId(session: Session | null) {
  const email = session?.user?.email;
  if (!email) return null;
  return email;
}

export async function GET() {
  const session = (await auth()) as Session | null;
  const userId = requireUserId(session);
  if (!userId) return unauthorized();

  try {
    const exists = await hasAppDataRow(userId);
    if (!exists) {
      return NextResponse.json({ exists: false, data: null });
    }
    const data = await fetchAppDataRow(userId);
    return NextResponse.json({ exists: true, data });
  } catch (error) {
    console.error("GET /api/app-data", error);
    return NextResponse.json(
      { error: "Failed to load app data" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  const session = (await auth()) as Session | null;
  const userId = requireUserId(session);
  if (!userId) return unauthorized();

  try {
    const body = (await request.json()) as Partial<AppData>;
    const data = normalizeAppData(body);
    await saveAppDataRow(userId, data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("PUT /api/app-data", error);
    return NextResponse.json(
      { error: "Failed to save app data" },
      { status: 500 },
    );
  }
}
