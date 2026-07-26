import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { auth } from "@/auth";
import { allowsAiWithoutSession } from "@/lib/storage-mode";
import { generateClaudeReply } from "@/lib/claude-client";
import { getAnthropicApiKey, getClaudeModel } from "@/lib/claude-config";

function unauthorized() {
  return NextResponse.json(
    {
      error:
        "AI を使うにはログインが必要です。クラウド保存モードでは Google でログインしてください。",
    },
    { status: 401 },
  );
}

function requireUserId(session: Session | null): string | null {
  if (allowsAiWithoutSession()) return "local-user";
  const email = session?.user?.email;
  return email ?? null;
}

export async function POST(request: Request) {
  const session = (await auth()) as Session | null;
  const userId = requireUserId(session);
  if (!userId) return unauthorized();

  const apiKey = getAnthropicApiKey();
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "ANTHROPIC_API_KEY が未設定です。Vercel の Environment Variables、または .env.local に Anthropic の API キーを追加してください。",
      },
      { status: 503 },
    );
  }

  try {
    const body = (await request.json()) as {
      message?: string;
      context?: string;
    };
    const message = body.message?.trim();
    if (!message) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    const context = body.context?.trim() ?? "";

    const system = `あなたは「人生のカレンダー」アプリの計画アシスタントです。
ユーザーの人生設計・予定・ワークシートを支援してください。
回答は日本語、簡潔で actionable に。箇条書きを適宜使ってください。`;

    const userContent = `--- アプリ内データ（参考） ---
${context.slice(0, 12_000)}

--- ユーザーの質問 ---
${message}`;

    const result = await generateClaudeReply(
      apiKey,
      getClaudeModel(),
      system,
      userContent,
    );

    if (!result.ok) {
      return NextResponse.json(
        { error: result.message },
        { status: result.status >= 400 && result.status < 600 ? result.status : 502 },
      );
    }

    return NextResponse.json({ reply: result.reply });
  } catch (error) {
    console.error("POST /api/claude", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
