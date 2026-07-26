import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { auth } from "@/auth";
import { allowsAiWithoutSession } from "@/lib/storage-mode";
import { isClaudeConfigured } from "@/lib/claude-config";

function requireUserId(session: Session | null): string | null {
  if (allowsAiWithoutSession()) return "local-user";
  return session?.user?.email ?? null;
}

export async function GET() {
  const session = (await auth()) as Session | null;
  if (!requireUserId(session)) {
    return NextResponse.json(
      {
        error:
          "AI を使うにはログインが必要です。クラウド保存モードでは Google でログインしてください。",
      },
      { status: 401 },
    );
  }

  return NextResponse.json({ configured: isClaudeConfigured() });
}
